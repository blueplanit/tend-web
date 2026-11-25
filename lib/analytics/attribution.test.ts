import { describe, expect, it } from "vitest";
import { attributionParams, captureAttribution, referrerForGa, type PageLoad } from "./attribution";

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
      first_paid_status: "unknown",
      first_landing_page: "/",
      latest_source: "unknown",
      latest_medium: "unknown",
      latest_paid_status: "unknown",
      latest_landing_page: "/",
    });
  });

  it("records reviewed URL tags with paid status paid", () => {
    const { fields } = visits({
      path: "/?utm_source=reddit&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic",
    });
    expect(fields).toMatchObject({
      first_source: "reddit",
      first_medium: "paid-social",
      first_campaign: "pa002",
      first_content: "pa002-comic",
      first_paid_status: "paid",
      latest_source: "reddit",
      latest_paid_status: "paid",
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
      first_paid_status: "unknown",
    });
  });

  it("records a tag in the wrong case or with spaces as unlisted, so it can be fixed", () => {
    const { fields } = visits({ path: "/?utm_source=Reddit&utm_medium=%20social" });
    expect(fields).toMatchObject({ first_source: "unlisted", first_medium: "unlisted" });
  });

  it("records a Campaign Code on unpaid traffic as unlisted, because a Campaign is paid only", () => {
    const { fields } = visits({ path: "/?utm_source=reddit&utm_medium=social&utm_campaign=pa002" });
    expect(fields).toMatchObject({
      first_source: "reddit",
      first_medium: "social",
      first_campaign: "unlisted",
    });
  });

  it("records a hand-tagged organic medium as unlisted, because only the referrer sets it", () => {
    const { fields } = visits({ path: "/?utm_source=google&utm_medium=organic" });
    expect(fields).toMatchObject({ first_medium: "unlisted", first_paid_status: "unknown" });
  });

  it("accepts any domain as the source of a tagged referral", () => {
    const { fields } = visits({ path: "/?utm_source=example.com&utm_medium=referral" });
    expect(fields).toMatchObject({
      first_source: "example.com",
      first_medium: "referral",
      first_paid_status: "unpaid",
    });
  });

  it("records only the main domain of a tagged referral, because a subdomain can name a person", () => {
    const { fields } = visits({ path: "/?utm_source=jo-smith.substack.com&utm_medium=referral" });
    expect(fields).toMatchObject({ first_source: "substack.com", first_medium: "referral" });
    expect(JSON.stringify(fields)).not.toContain("jo-smith");
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
    ["https://search.yahoo.co.jp/", "yahoo", "organic", "unpaid"],
    ["https://gemini.google.com/", "gemini", "ai-answer", "unpaid"],
    ["https://chatgpt.com/", "chatgpt", "ai-answer", "unpaid"],
    ["https://www.perplexity.ai/", "perplexity", "ai-answer", "unpaid"],
    ["https://out.reddit.com/", "reddit", "social", "unknown"],
    ["https://l.instagram.com/", "instagram", "social", "unknown"],
    ["https://m.youtube.com/", "youtube", "social", "unknown"],
    ["https://www.someblog.com/post/123?ref=abc", "someblog.com", "referral", "unknown"],
    // Android apps send android-app://<package>/ as the referrer.
    ["android-app://com.reddit.frontpage/", "reddit", "social", "unknown"],
    ["android-app://com.zhiliaoapp.musically/", "tiktok", "social", "unknown"],
    ["android-app://com.ss.android.ugc.trill/", "tiktok", "social", "unknown"],
    ["android-app://com.instagram.android/", "instagram", "social", "unknown"],
    ["android-app://com.google.android.youtube/", "youtube", "social", "unknown"],
    ["android-app://com.openai.chatgpt/", "chatgpt", "ai-answer", "unpaid"],
    ["android-app://com.google.android.gm/", "gmail", "email", "unknown"],
    ["https://mail.google.com/", "gmail", "email", "unknown"],
    // Another Android app: the package name read backwards is its domain.
    ["android-app://com.facebook.katana/", "facebook.com", "referral", "unknown"],
    ["android-app://org.telegram.messenger/", "telegram.org", "referral", "unknown"],
  ])("from %s records %s / %s as %s", (referrer, source, medium, paidStatus) => {
    const { fields } = visits({ path: "/", referrer });
    expect(fields).toMatchObject({
      first_source: source,
      first_medium: medium,
      first_paid_status: paidStatus,
    });
  });

  it.each([
    ["gclid", "https://www.google.com/", "google", "cpc"],
    ["gbraid", "https://www.google.com/", "google", "cpc"],
    ["wbraid", "", "google", "cpc"],
    ["ttclid", "https://www.tiktok.com/", "tiktok", "paid-social"],
    ["rdt_cid", "https://www.reddit.com/", "reddit", "paid-social"],
    ["msclkid", "https://www.bing.com/", "bing", "cpc"],
  ])("with the ad click id %s and the referrer '%s' records %s / %s as paid", (key, referrer, source, medium) => {
    const { fields } = visits({ path: `/?${key}=abc123`, referrer });
    expect(fields).toMatchObject({
      first_source: source,
      first_medium: medium,
      first_paid_status: "paid",
    });
    expect(JSON.stringify(fields)).not.toContain("abc123");
  });

  it("lets an ad click id prove a paid ad when the URL tags disagree", () => {
    const { fields } = visits({
      path: "/?utm_source=google&utm_medium=paid&utm_campaign=pa002&utm_content=pa002-comic&gclid=abc123",
    });
    expect(fields).toMatchObject({
      first_source: "google",
      first_medium: "cpc",
      first_campaign: "pa002",
      first_content: "pa002-comic",
      first_paid_status: "paid",
    });
  });

  it("keeps the Campaign Code when a click id overrides an unpaid tagged medium", () => {
    const { fields } = visits({ path: "/?utm_source=google&utm_medium=social&utm_campaign=pa002&gclid=abc123" });
    expect(fields).toMatchObject({ first_medium: "cpc", first_campaign: "pa002", first_paid_status: "paid" });
  });

  // A subdomain can name a person, so an untagged referral records only the main domain.
  it.each([
    ["https://jo-smith.substack.com/p/debt", "substack.com"],
    ["https://jsmith.github.io/", "github.io"],
    ["https://news.ycombinator.com/item?id=1", "ycombinator.com"],
    ["https://blog.example.co.uk/post", "example.co.uk"],
    ["https://example.co.uk/", "example.co.uk"],
    ["https://someblog.com/", "someblog.com"],
  ])("from %s records only the main domain %s", (referrer, source) => {
    const { fields } = visits({ path: "/", referrer });
    expect(fields).toMatchObject({ first_source: source, first_medium: "referral" });
    expect(JSON.stringify(fields)).not.toMatch(/jo-smith|jsmith/);
  });

  it("does not count Instagram's fbclid as proof of a paid ad", () => {
    const { fields } = visits({ path: "/?fbclid=abc123", referrer: "https://l.instagram.com/" });
    expect(fields).toMatchObject({
      first_source: "instagram",
      first_medium: "social",
      first_paid_status: "unknown",
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

  it("count the same source again as one touch", () => {
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

  it("do not count an old touch again when its tagged URL is reopened", () => {
    const fromRedditAd = { path: "/?utm_source=reddit&utm_medium=paid-social&utm_campaign=pa002" };
    const { fields, changed } = visits(
      fromRedditAd,
      { path: "/", referrer: "https://www.google.com/" },
      fromRedditAd, // from history or a bookmark, with no referrer
    );
    expect(fields).toMatchObject({
      first_source: "reddit",
      first_campaign: "pa002",
      latest_source: "google",
      latest_medium: "organic",
    });
    expect(changed).toBe(false);
  });

  it("count a new ad click again, because a new click id proves a new click", () => {
    const { fields } = visits(
      { path: "/?gclid=AAA&utm_campaign=pa002" },
      { path: "/", referrer: "https://www.reddit.com/" },
      { path: "/blog/x?gclid=BBB&utm_campaign=pa002" },
    );
    expect(fields).toMatchObject({
      latest_source: "google",
      latest_medium: "cpc",
      latest_campaign: "pa002",
      latest_landing_page: "/blog/x",
    });
  });

  it("count a tagged URL again when a fresh click brings it from another site", () => {
    const tags = "?utm_source=reddit&utm_medium=social";
    const { fields } = visits(
      { path: "/" + tags, referrer: "https://www.reddit.com/" },
      { path: "/", referrer: "https://www.google.com/" },
      { path: "/blog/x" + tags, referrer: "https://www.reddit.com/" },
    );
    expect(fields).toMatchObject({
      first_source: "reddit",
      latest_source: "reddit",
      latest_medium: "social",
      latest_landing_page: "/blog/x",
    });
  });

  it("move the latest landing page to a new ad click from the same source", () => {
    const { fields } = visits({ path: "/a?gclid=AAA" }, { path: "/b?gclid=BBB" });
    expect(fields).toMatchObject({
      first_landing_page: "/a",
      latest_source: "google",
      latest_medium: "cpc",
      latest_landing_page: "/b",
    });
  });

  it("record the unpaid status when tags prove it on a later visit from the same source", () => {
    const { fields } = visits(
      { path: "/", referrer: "https://www.reddit.com/" },
      { path: "/?utm_source=reddit&utm_medium=social", referrer: "https://www.reddit.com/" },
    );
    expect(fields).toMatchObject({
      first_source: "reddit",
      first_paid_status: "unknown",
      latest_source: "reddit",
      latest_paid_status: "unpaid",
    });
  });

  it("do not count a reopened ad URL again, because its click id is the same", () => {
    const fromAd = { path: "/?gclid=AAA&utm_campaign=pa002" };
    const { fields, changed } = visits(fromAd, { path: "/", referrer: "https://www.reddit.com/" }, fromAd);
    expect(fields).toMatchObject({ latest_source: "reddit" });
    expect(changed).toBe(false);
  });

  it("treat the www host and the bare host as the same site", () => {
    let saved: string | null = null;
    for (const [href, referrer] of [
      ["https://tend.example/?utm_source=reddit&utm_medium=social", ""],
      ["https://www.tend.example/blog/x", "https://tend.example/"],
    ]) {
      saved = JSON.stringify(captureAttribution({ href, referrer }, saved).attribution);
    }
    expect(attributionParams(JSON.parse(saved!))).toMatchObject({ latest_source: "reddit" });
  });

  it("let an earlier untagged source become the latest source again", () => {
    const { fields } = visits(
      { path: "/", referrer: "https://www.google.com/" },
      { path: "/", referrer: "https://www.reddit.com/" },
      { path: "/blog/x", referrer: "https://www.google.com/" },
    );
    expect(fields).toMatchObject({
      first_source: "google",
      latest_source: "google",
      latest_medium: "organic",
      latest_landing_page: "/blog/x",
    });
  });

  it.each([
    "https://play.google.com/store/apps/details?id=com.blueplanit.tend",
    "https://testflight.apple.com/join/abc",
    "https://apps.apple.com/app/tend/id123",
  ])("keep the source on a return from the store at %s", (referrer) => {
    const { fields, changed } = visits(fromTikTok, { path: "/", referrer });
    expect(fields).toMatchObject(tikTokFields);
    expect(changed).toBe(false);
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

describe("the referrer that GA4 records", () => {
  const page = SITE + "/";

  it("keeps only the main domain of another site, because a subdomain can name a person", () => {
    expect(referrerForGa("https://jo-smith.substack.com/p/debt", page)).toBe("https://substack.com");
  });

  it("keeps a host from the reviewed list, so GA4 still tells search, AI and email apart", () => {
    expect(referrerForGa("https://www.google.com/search?q=jo+smith", page)).toBe("https://www.google.com");
    expect(referrerForGa("https://gemini.google.com/app", page)).toBe("https://gemini.google.com");
    expect(referrerForGa("https://mail.google.com/mail/u/0/", page)).toBe("https://mail.google.com");
  });

  it("names an Android app on the reviewed list by its package", () => {
    expect(referrerForGa("android-app://com.reddit.frontpage/", page)).toBe("android-app://com.reddit.frontpage");
  });

  it("gives another Android app as its main domain", () => {
    expect(referrerForGa("android-app://org.telegram.messenger/", page)).toBe("https://telegram.org");
  });

  it("gives no referrer for a return from a store page", () => {
    expect(referrerForGa("https://play.google.com/store/apps/details?id=app.tend", page)).toBe("");
  });

  it("gives the page origin for our own site, the www host included", () => {
    expect(referrerForGa("https://www.tend.example/blog/x?email=jo%40example.com", page)).toBe(SITE);
  });

  it("gives no referrer when there is none or it is not a URL", () => {
    expect(referrerForGa("", page)).toBe("");
    expect(referrerForGa("not a url", page)).toBe("");
  });
});
