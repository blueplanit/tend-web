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
  it.each([
    ["https://www.google.com/", "google", "organic"],
    ["https://www.google.co.uk/", "google", "organic"],
    ["https://www.bing.com/search?q=debt", "bing", "organic"],
    ["https://duckduckgo.com/", "duckduckgo", "organic"],
    ["https://gemini.google.com/", "gemini", "ai-answer"],
    ["https://chatgpt.com/", "chatgpt", "ai-answer"],
    ["https://www.perplexity.ai/", "perplexity", "ai-answer"],
    ["https://out.reddit.com/", "reddit", "social"],
    ["https://l.instagram.com/", "instagram", "social"],
    ["https://m.youtube.com/", "youtube", "social"],
    ["https://www.someblog.com/post/123?ref=abc", "someblog.com", "referral"],
  ])("from %s records %s / %s as unpaid", (referrer, source, medium) => {
    const { fields } = visits({ path: "/", referrer });
    expect(fields).toMatchObject({
      first_source: source,
      first_medium: medium,
      first_acquisition: "unpaid",
    });
  });

  it("records ChatGPT's own tag as an AI answer", () => {
    const { fields } = visits({ path: "/?utm_source=chatgpt.com" });
    expect(fields).toMatchObject({ first_source: "chatgpt", first_medium: "ai-answer" });
  });

  it("records a Google Ads click id as a paid Google ad", () => {
    const { fields } = visits({ path: "/?gclid=abc123", referrer: "https://www.google.com/" });
    expect(fields).toMatchObject({
      first_source: "google",
      first_medium: "cpc",
      first_acquisition: "paid",
    });
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

  it("replace an unknown first source with the first known source", () => {
    const { fields } = visits({ path: "/" }, { path: "/blog/interest", referrer: "https://www.bing.com/" });
    expect(fields).toMatchObject({
      first_source: "bing",
      first_landing_page: "/blog/interest",
      latest_source: "bing",
    });
  });
});
