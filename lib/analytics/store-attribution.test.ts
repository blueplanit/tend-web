import { describe, expect, it } from "vitest";
import { captureAttribution } from "./attribution";
import { storeDestination, withStoreAttribution } from "./store-attribution";

const PLAY = "https://play.google.com/store/apps/details?id=com.blueplanit.tend";
const TESTFLIGHT = "https://testflight.apple.com/join/abc";

function attributionFrom(...loads: { href: string; referrer?: string }[]) {
  let saved: string | null = null;
  for (const load of loads) {
    saved = JSON.stringify(
      captureAttribution({ referrer: "", ...load }, saved).attribution,
    );
  }
  return JSON.parse(saved!);
}

function referrerOf(url: string) {
  return new URL(url).searchParams.get("referrer");
}

describe("the Android store link", () => {
  it("carries the latest source as utm_ fields and the first source as first_ fields", () => {
    const attribution = attributionFrom(
      { href: "https://tend.example/?utm_source=reddit&utm_medium=social" },
      { href: "https://tend.example/?utm_source=tiktok&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic" },
    );
    expect(referrerOf(withStoreAttribution(PLAY, attribution))).toBe(
      "utm_source=tiktok&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic" +
        "&first_source=reddit&first_medium=social",
    );
  });

  it("carries an untagged search source as both the first and the latest source", () => {
    const attribution = attributionFrom({
      href: "https://tend.example/",
      referrer: "https://www.google.com/",
    });
    expect(referrerOf(withStoreAttribution(PLAY, attribution))).toBe(
      "utm_source=google&utm_medium=organic&first_source=google&first_medium=organic",
    );
  });

  it("leaves a link that is not a store listing as it is, because only the listing keeps the referrer", () => {
    const attribution = attributionFrom({ href: "https://tend.example/?utm_source=reddit&utm_medium=social" });
    const joinPage = "https://play.google.com/apps/testing/com.blueplanit.tend";
    expect(withStoreAttribution(joinPage, attribution)).toBe(joinPage);
  });

  it("keeps Play's own parameters and encodes the referrer as one value", () => {
    const attribution = attributionFrom({ href: "https://tend.example/?utm_source=reddit&utm_medium=social" });
    expect(withStoreAttribution(PLAY + "&hl=en", attribution)).toBe(
      "https://play.google.com/store/apps/details?id=com.blueplanit.tend&hl=en" +
        "&referrer=utm_source%3Dreddit%26utm_medium%3Dsocial%26first_source%3Dreddit%26first_medium%3Dsocial",
    );
  });

  it("stays as it is when the source is unknown", () => {
    const attribution = attributionFrom({ href: "https://tend.example/" });
    expect(withStoreAttribution(PLAY, attribution)).toBe(PLAY);
    expect(withStoreAttribution(PLAY, null)).toBe(PLAY);
  });
});

describe("the TestFlight link", () => {
  it("stays as it is, because TestFlight takes no campaign fields", () => {
    const attribution = attributionFrom({
      href: "https://tend.example/?utm_source=reddit&utm_medium=social",
    });
    expect(withStoreAttribution(TESTFLIGHT, attribution, PROVIDER_TOKEN)).toBe(TESTFLIGHT);
  });
});

const APP_STORE = "https://apps.apple.com/app/tend/id6700000000";
const PROVIDER_TOKEN = "118765432";

function appStoreUrlAfter(...loads: { href: string; referrer?: string }[]) {
  return new URL(withStoreAttribution(APP_STORE, attributionFrom(...loads), PROVIDER_TOKEN));
}

describe("the App Store link", () => {
  it("carries the provider token and the Campaign Code of a paid latest touch", () => {
    const link = appStoreUrlAfter(
      { href: "https://tend.example/?utm_source=reddit&utm_medium=social" },
      { href: "https://tend.example/?utm_source=tiktok&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic" },
    );
    expect(link.searchParams.get("pt")).toBe(PROVIDER_TOKEN);
    expect(link.searchParams.get("ct")).toBe("pa002");
    expect(link.searchParams.get("mt")).toBe("8");
  });

  it("labels a listed source as medium-source", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/?utm_source=reddit&utm_medium=social" })
      .searchParams.get("ct")).toBe("social-reddit");
    expect(appStoreUrlAfter({ href: "https://tend.example/", referrer: "https://www.google.com/" })
      .searchParams.get("ct")).toBe("organic-google");
    expect(appStoreUrlAfter({ href: "https://tend.example/", referrer: "https://claude.ai/" })
      .searchParams.get("ct")).toBe("ai-answer-claude");
  });

  it("labels a source off the fixed tables with its medium only, so small sites share one row", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/", referrer: "https://jo-smith.substack.com/p/money" })
      .searchParams.get("ct")).toBe("referral");
    expect(appStoreUrlAfter({ href: "https://tend.example/", referrer: "android-app://com.facebook.katana/" })
      .searchParams.get("ct")).toBe("referral");
  });

  it("labels a tag with an unlisted medium as unlisted, even with a listed source", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/?utm_source=reddit&utm_medium=Social" })
      .searchParams.get("ct")).toBe("unlisted");
  });

  it("labels a tag with an unlisted source as unlisted, so a typo never joins a real row", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/?utm_source=Reddit&utm_medium=social" })
      .searchParams.get("ct")).toBe("unlisted");
  });

  it("labels an unknown source as unknown, so every website download gets a label", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/" }).searchParams.get("ct")).toBe("unknown");
    const serverLink = new URL(withStoreAttribution(APP_STORE, null, PROVIDER_TOKEN));
    expect(serverLink.searchParams.get("ct")).toBe("unknown");
  });

  it("labels a paid source without a listed Campaign Code as medium-source", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/?utm_source=tiktok&utm_medium=paid-social&utm_campaign=spring" })
      .searchParams.get("ct")).toBe("paid-social-tiktok");
    expect(appStoreUrlAfter({ href: "https://tend.example/?gclid=abc123" })
      .searchParams.get("ct")).toBe("cpc-google");
  });

  it("stays as it is without a provider token", () => {
    const attribution = attributionFrom({ href: "https://tend.example/?utm_source=reddit&utm_medium=social" });
    expect(withStoreAttribution(APP_STORE, attribution, null)).toBe(APP_STORE);
  });

  it("keeps Apple's own parameters", () => {
    expect(appStoreUrlAfter({ href: "https://tend.example/" }).pathname).toBe("/app/tend/id6700000000");
    const withCountry = new URL(
      withStoreAttribution(APP_STORE + "?l=en", null, PROVIDER_TOKEN),
    );
    expect(withCountry.searchParams.get("l")).toBe("en");
  });
});

describe("the store destination", () => {
  it("names each store by the link's host", () => {
    expect(storeDestination(PLAY)).toBe("play_store");
    expect(storeDestination(TESTFLIGHT)).toBe("testflight");
    expect(storeDestination(APP_STORE)).toBe("app_store");
  });

  it("names no store for any other link", () => {
    expect(storeDestination("https://tend.example/beta")).toBeNull();
    expect(storeDestination("not a url")).toBeNull();
  });
});
