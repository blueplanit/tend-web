import { describe, expect, it } from "vitest";
import { attributionParams, captureAttribution, type PageLoad } from "./attribution";

const SITE = "https://tend.example";

type Load = { path: string; referrer?: string; navigationType?: string };

// Runs full page loads in order against one saved value, as one browser would.
// Returns the report fields after the last page load.
function visits(...loads: Load[]) {
  let saved: string | null = null;
  let changed = false;
  for (const load of loads) {
    const page: PageLoad = {
      href: SITE + load.path,
      referrer: load.referrer ?? "",
      navigationType: load.navigationType ?? "navigate",
    };
    const result = captureAttribution(page, saved);
    saved = JSON.stringify(result.attribution);
    changed = result.changed;
  }
  return { fields: attributionParams(JSON.parse(saved!)), changed };
}

describe("a first visit", () => {
  it("records a direct visit as unknown, not as unpaid", () => {
    expect(visits({ path: "/" }).fields).toEqual({
      first_source: "unknown",
      first_medium: "unknown",
      first_acquisition: "unknown",
      first_landing_page: "/",
      latest_source: "unknown",
      latest_medium: "unknown",
      latest_acquisition: "unknown",
      latest_landing_page: "/",
    });
  });

  it("records reviewed URL tags as a paid acquisition", () => {
    const { fields } = visits({
      path: "/?utm_source=reddit&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic",
    });
    expect(fields).toMatchObject({
      first_source: "reddit",
      first_medium: "paid-social",
      first_campaign: "pa002",
      first_content: "pa002-comic",
      first_acquisition: "paid",
      latest_source: "reddit",
      latest_acquisition: "paid",
    });
  });

  it("records tag values outside the reviewed list as unlisted", () => {
    const { fields } = visits({
      path: "/?utm_source=Facebook&utm_campaign=black-friday&utm_content=Hello%20World",
    });
    expect(fields).toMatchObject({
      first_source: "unlisted",
      first_medium: "unlisted",
      first_campaign: "unlisted",
      first_content: "unlisted",
      first_acquisition: "unknown",
    });
  });

  it("records a tag in the wrong case or with spaces as unlisted, so it can be fixed", () => {
    const { fields } = visits({ path: "/?utm_source=Reddit&utm_medium=%20social" });
    expect(fields).toMatchObject({ first_source: "unlisted", first_medium: "unlisted" });
  });

  it("accepts any domain as the source of a tagged referral", () => {
    const { fields } = visits({ path: "/?utm_source=example.com&utm_medium=referral" });
    expect(fields).toMatchObject({
      first_source: "example.com",
      first_medium: "referral",
      first_acquisition: "unpaid",
    });
  });
});

describe("an untagged visit", () => {
  // Search and AI answers have no paid version without a click id, so they count as unpaid.
  // A social site or another website can host a paid post, so the referrer alone proves nothing.
  it.each([
    ["https://www.google.com/", "google", "organic", "unpaid"],
    ["https://www.google.co.uk/", "google", "organic", "unpaid"],
    ["android-app://com.google.android.googlequicksearchbox/", "google", "organic", "unpaid"],
    ["https://www.bing.com/search?q=debt", "bing", "organic", "unpaid"],
    ["https://duckduckgo.com/", "duckduckgo", "organic", "unpaid"],
    ["https://search.yahoo.com/", "yahoo", "organic", "unpaid"],
    ["https://uk.search.yahoo.com/", "yahoo", "organic", "unpaid"],
    ["https://r.search.yahoo.com/", "yahoo", "organic", "unpaid"],
    ["https://gemini.google.com/", "gemini", "ai-answer", "unpaid"],
    ["https://chatgpt.com/", "chatgpt", "ai-answer", "unpaid"],
    ["https://www.perplexity.ai/", "perplexity", "ai-answer", "unpaid"],
    ["https://out.reddit.com/", "reddit", "social", "unknown"],
    ["https://l.instagram.com/", "instagram", "social", "unknown"],
    ["https://m.youtube.com/", "youtube", "social", "unknown"],
    ["https://www.someblog.com/post/123?ref=abc", "someblog.com", "referral", "unknown"],
  ])("from %s records %s / %s as %s", (referrer, source, medium, acquisition) => {
    const { fields } = visits({ path: "/", referrer });
    expect(fields).toMatchObject({
      first_source: source,
      first_medium: medium,
      first_acquisition: acquisition,
    });
  });

  it.each([
    ["gclid", "https://www.google.com/", "google", "cpc"],
    ["gbraid", "https://www.google.com/", "google", "cpc"],
    ["wbraid", "", "google", "cpc"],
    ["ttclid", "https://www.tiktok.com/", "tiktok", "paid-social"],
    ["rdt_cid", "https://www.reddit.com/", "reddit", "paid-social"],
  ])("with the ad click id %s and the referrer '%s' records %s / %s as paid", (key, referrer, source, medium) => {
    const { fields } = visits({ path: `/?${key}=abc123`, referrer });
    expect(fields).toMatchObject({
      first_source: source,
      first_medium: medium,
      first_acquisition: "paid",
    });
    expect(JSON.stringify(fields)).not.toContain("abc123");
  });

  it("does not count Instagram's fbclid as proof of a paid ad", () => {
    const { fields } = visits({ path: "/?fbclid=abc123", referrer: "https://l.instagram.com/" });
    expect(fields).toMatchObject({
      first_source: "instagram",
      first_medium: "social",
      first_acquisition: "unknown",
    });
  });

  it("records ChatGPT's own tag as an AI answer", () => {
    const { fields } = visits({ path: "/?utm_source=chatgpt.com" });
    expect(fields).toMatchObject({ first_source: "chatgpt", first_medium: "ai-answer" });
  });

  it("lets URL tags win over the referrer", () => {
    const { fields } = visits({
      path: "/?utm_source=reddit&utm_medium=social",
      referrer: "https://www.google.com/",
    });
    expect(fields).toMatchObject({ first_source: "reddit", first_medium: "social" });
  });
});

describe("missing or damaged data", () => {
  it("treats a damaged saved value as no history", () => {
    for (const saved of ["{not json", '{"first":{"source":1}}', ""]) {
      const { attribution } = captureAttribution(
        { href: `${SITE}/?utm_source=reddit&utm_medium=social`, referrer: "" },
        saved,
      );
      expect(attributionParams(attribution)).toMatchObject({
        first_source: "reddit",
        latest_source: "reddit",
      });
    }
  });

  it("treats a malformed referrer as no referrer", () => {
    expect(visits({ path: "/", referrer: "not a url" }).fields).toMatchObject({
      first_source: "unknown",
      first_medium: "unknown",
    });
  });

  it("keeps personal information out of every field", () => {
    const { fields } = visits({
      path: "/blog/interest?email=jo%40example.com&utm_source=reddit&utm_medium=social",
      referrer: "https://www.someblog.com/out?email=jo%40example.com",
    });
    expect(fields.first_landing_page).toBe("/blog/interest");
    expect(JSON.stringify(fields)).not.toMatch(/jo|example\.com|email/);
  });
});

describe("later page loads", () => {
  const fromTikTok = { path: "/?utm_source=tiktok&utm_medium=social&utm_content=tiktok-regrows" };
  const tikTokFields = {
    first_source: "tiktok",
    first_medium: "social",
    first_content: "tiktok-regrows",
    first_landing_page: "/",
    latest_source: "tiktok",
    latest_content: "tiktok-regrows",
    latest_landing_page: "/",
  };

  it("keep the source through internal navigation", () => {
    const { fields, changed } = visits(fromTikTok, {
      path: "/blog/interest",
      referrer: `${SITE}/`,
    });
    expect(fields).toMatchObject(tikTokFields);
    expect(changed).toBe(false);
  });

  it("keep the source through a reload and back or forward", () => {
    const { fields, changed } = visits(
      fromTikTok,
      { path: "/blog/interest", referrer: "https://www.google.com/", navigationType: "reload" },
      { path: "/", referrer: "https://www.google.com/", navigationType: "back_forward" },
    );
    expect(fields).toMatchObject(tikTokFields);
    expect(changed).toBe(false);
  });

  it("keep the source through an unattributed return", () => {
    const { fields, changed } = visits(fromTikTok, { path: "/privacy" });
    expect(fields).toMatchObject(tikTokFields);
    expect(changed).toBe(false);
  });

  it("count the same source again as one acquisition", () => {
    const { fields, changed } = visits(fromTikTok, { ...fromTikTok, path: fromTikTok.path });
    expect(fields).toMatchObject(tikTokFields);
    expect(changed).toBe(false);
  });

  it("move the latest source to a new known source and keep the first", () => {
    const { fields } = visits(fromTikTok, {
      path: "/blog/interest",
      referrer: "https://www.google.com/",
    });
    expect(fields).toMatchObject({
      first_source: "tiktok",
      first_landing_page: "/",
      latest_source: "google",
      latest_medium: "organic",
      latest_landing_page: "/blog/interest",
    });
    expect(fields).not.toHaveProperty("latest_content");
  });

  it("replace an unlisted tag with the first known source", () => {
    const { fields } = visits(
      { path: "/?utm_source=Facebook" },
      { path: "/?utm_source=reddit&utm_medium=social" },
    );
    expect(fields).toMatchObject({
      first_source: "reddit",
      first_medium: "social",
      latest_source: "reddit",
    });
  });

  it("let an unlisted tag fill an unknown view, but never replace a known source", () => {
    const fromUnknownToUnlisted = visits({ path: "/" }, { path: "/blog/interest?utm_source=Facebook" });
    expect(fromUnknownToUnlisted.fields).toMatchObject({
      first_source: "unlisted",
      latest_source: "unlisted",
      latest_landing_page: "/blog/interest",
    });

    const fromKnown = visits(fromTikTok, { path: "/blog/interest?utm_source=Facebook" });
    expect(fromKnown.fields).toMatchObject(tikTokFields);
    expect(fromKnown.changed).toBe(false);
  });

  it("replace an unknown first source with the first known source", () => {
    const { fields } = visits({ path: "/" }, { path: "/blog/interest", referrer: "https://www.bing.com/" });
    expect(fields).toMatchObject({
      first_source: "bing",
      first_landing_page: "/blog/interest",
      latest_source: "bing",
    });
  });
});
