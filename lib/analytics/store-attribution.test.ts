import { describe, expect, it } from "vitest";
import { captureAttribution } from "./attribution";
import { withStoreAttribution } from "./store-attribution";

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
    expect(referrerOf(withStoreAttribution(PLAY, "android", attribution))).toBe(
      "utm_source=tiktok&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic" +
        "&first_source=reddit&first_medium=social",
    );
  });

  it("carries an untagged search source as both the first and the latest source", () => {
    const attribution = attributionFrom({
      href: "https://tend.example/",
      referrer: "https://www.google.com/",
    });
    expect(referrerOf(withStoreAttribution(PLAY, "android", attribution))).toBe(
      "utm_source=google&utm_medium=organic&first_source=google&first_medium=organic",
    );
  });

  it("leaves a link that is not a store listing as it is, because only the listing keeps the referrer", () => {
    const attribution = attributionFrom({ href: "https://tend.example/?utm_source=reddit&utm_medium=social" });
    const joinPage = "https://play.google.com/apps/testing/com.blueplanit.tend";
    expect(withStoreAttribution(joinPage, "android", attribution)).toBe(joinPage);
  });

  it("keeps Play's own parameters and encodes the referrer as one value", () => {
    const attribution = attributionFrom({ href: "https://tend.example/?utm_source=reddit&utm_medium=social" });
    expect(withStoreAttribution(PLAY + "&hl=en", "android", attribution)).toBe(
      "https://play.google.com/store/apps/details?id=com.blueplanit.tend&hl=en" +
        "&referrer=utm_source%3Dreddit%26utm_medium%3Dsocial%26first_source%3Dreddit%26first_medium%3Dsocial",
    );
  });

  it("stays as it is when the source is unknown", () => {
    const attribution = attributionFrom({ href: "https://tend.example/" });
    expect(withStoreAttribution(PLAY, "android", attribution)).toBe(PLAY);
    expect(withStoreAttribution(PLAY, "android", null)).toBe(PLAY);
  });
});

describe("the iOS store link", () => {
  it("stays as it is, because TestFlight takes no referrer", () => {
    const attribution = attributionFrom({
      href: "https://tend.example/?utm_source=reddit&utm_medium=social",
    });
    expect(withStoreAttribution(TESTFLIGHT, "ios", attribution)).toBe(TESTFLIGHT);
  });
});
