import { describe, expect, it } from "vitest";
import { captureAttribution } from "./attribution";
import { withStoreAttribution } from "./store-attribution";

const PLAY = "https://play.google.com/apps/testing/com.blueplanit.tend";
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
  it("carries the latest known source as the Play install referrer", () => {
    const attribution = attributionFrom(
      { href: "https://tend.example/?utm_source=reddit&utm_medium=social" },
      { href: "https://tend.example/?utm_source=tiktok&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic" },
    );
    expect(referrerOf(withStoreAttribution(PLAY, "android", attribution))).toBe(
      "utm_source=tiktok&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic",
    );
  });

  it("carries an untagged search source too", () => {
    const attribution = attributionFrom({
      href: "https://tend.example/",
      referrer: "https://www.google.com/",
    });
    expect(referrerOf(withStoreAttribution(PLAY, "android", attribution))).toBe(
      "utm_source=google&utm_medium=organic",
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
