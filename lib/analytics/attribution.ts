import { z } from "zod";

// The attribution contract. It records where a visitor came from, in a fixed set
// of values, for every analytics destination. The reviewed URL tags mirror
// ../tend-marketing/url-tags.md. Change both together.

// A visit with no tag and no external referrer. It does not prove unpaid traffic.
export const UNKNOWN = "unknown";
// A tag value that the reviewed list does not hold.
export const UNLISTED = "unlisted";

const MEDIA = new Set([
  "cpc",
  "paid-social",
  "paid-article",
  "social",
  "organic",
  "ai-answer",
  "referral",
  "email",
]);
const PAID_MEDIA = new Set(["cpc", "paid-social", "paid-article"]);

const SOURCES = new Set([
  // Ad and social platforms
  "google",
  "reddit",
  "tiktok",
  "instagram",
  "youtube",
  // Search engines
  "bing",
  "duckduckgo",
  "yahoo",
  "ecosia",
  "brave",
  // AI assistants
  "chatgpt",
  "perplexity",
  "gemini",
  "copilot",
  "claude",
  // Paid-article publishers and newsletters: add each before its link goes live.
]);

const CAMPAIGN_CODE = /^pa\d{3}$/;
const CONTENT_ID = /^[a-z0-9-]{1,64}$/;
const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

// Whether a visit was paid for. unknown means we cannot tell. It is never unpaid by default.
const acquisitionSchema = z.enum(["paid", "unpaid", "unknown"]);
type Acquisition = z.infer<typeof acquisitionSchema>;

// Click ids that ad platforms add to an ad link by themselves. Each one proves a paid ad.
// The id itself is never recorded. Instagram's fbclid is not here: Instagram adds it
// to unpaid clicks too.
const AD_CLICK_IDS: { key: string; source: string; medium: string }[] = [
  { key: "gclid", source: "google", medium: "cpc" },
  { key: "gbraid", source: "google", medium: "cpc" }, // Google Ads on iOS
  { key: "wbraid", source: "google", medium: "cpc" }, // Google Ads on iOS
  { key: "ttclid", source: "tiktok", medium: "paid-social" },
  { key: "rdt_cid", source: "reddit", medium: "paid-social" },
];

// Referrer hosts, checked in this order. The AI assistants go first, because
// gemini.google.com would otherwise match Google search.
// Search and AI answers count as unpaid, because their ads carry a click id.
// A social site can host a paid post with no click id, so a social referrer proves nothing.
const REFERRER_RULES: { source: string; medium: string; acquisition: Acquisition; host: RegExp }[] = [
  { source: "chatgpt", medium: "ai-answer", acquisition: "unpaid", host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/ },
  { source: "perplexity", medium: "ai-answer", acquisition: "unpaid", host: /(^|\.)perplexity\.ai$/ },
  { source: "gemini", medium: "ai-answer", acquisition: "unpaid", host: /^gemini\.google\.com$/ },
  { source: "copilot", medium: "ai-answer", acquisition: "unpaid", host: /^copilot\.microsoft\.com$/ },
  { source: "claude", medium: "ai-answer", acquisition: "unpaid", host: /^claude\.ai$/ },
  { source: "google", medium: "organic", acquisition: "unpaid", host: /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/ },
  // The Google app on Android sends android-app://com.google.android.googlequicksearchbox/.
  { source: "google", medium: "organic", acquisition: "unpaid", host: /^com\.google\.android\.googlequicksearchbox$/ },
  { source: "bing", medium: "organic", acquisition: "unpaid", host: /(^|\.)bing\.com$/ },
  { source: "duckduckgo", medium: "organic", acquisition: "unpaid", host: /(^|\.)duckduckgo\.com$/ },
  { source: "yahoo", medium: "organic", acquisition: "unpaid", host: /(^|\.)search\.yahoo\.com$|^(www\.)?yahoo\.com$/ },
  { source: "ecosia", medium: "organic", acquisition: "unpaid", host: /(^|\.)ecosia\.org$/ },
  { source: "brave", medium: "organic", acquisition: "unpaid", host: /^search\.brave\.com$/ },
  { source: "reddit", medium: "social", acquisition: "unknown", host: /(^|\.)reddit\.com$/ },
  { source: "tiktok", medium: "social", acquisition: "unknown", host: /(^|\.)tiktok\.com$/ },
  { source: "instagram", medium: "social", acquisition: "unknown", host: /(^|\.)instagram\.com$/ },
  { source: "youtube", medium: "social", acquisition: "unknown", host: /(^|\.)(youtube\.com|youtu\.be)$/ },
];

const touchSchema = z.object({
  source: z.string().max(100),
  medium: z.string().max(100),
  campaign: z.string().max(100).optional(),
  content: z.string().max(100).optional(),
  acquisition: acquisitionSchema,
  landingPage: z.string().max(100),
});

const attributionSchema = z.object({
  first: touchSchema,
  latest: touchSchema,
});

// One acquisition: the source of one visit and the page it landed on.
export type Touch = z.infer<typeof touchSchema>;
type Signal = Omit<Touch, "landingPage">;

// first: the first known source. latest: the latest known source.
export type Attribution = z.infer<typeof attributionSchema>;

export type PageLoad = {
  href: string;
  referrer: string;
  // From the Navigation Timing API: navigate, reload or back_forward.
  navigationType?: string;
};

// A tag value is read as it is. A value in the wrong case or with spaces is not on
// the reviewed list, so it records as unlisted and someone can fix the tag.
function tagValue(params: URLSearchParams, key: string) {
  return params.get(key) || undefined;
}

function readTags(params: URLSearchParams): Signal | null {
  let source = tagValue(params, "utm_source");
  let medium = tagValue(params, "utm_medium");
  // ChatGPT adds utm_source=chatgpt.com to its links by itself, with no medium.
  if (source === "chatgpt.com") {
    source = "chatgpt";
    medium ??= "ai-answer";
  }
  const campaign = tagValue(params, "utm_campaign");
  const content = tagValue(params, "utm_content");
  if (!source && !medium && !campaign && !content) return null;

  const listed = (value: string) =>
    SOURCES.has(value) || (medium === "referral" && DOMAIN.test(value));
  const listedMedium = medium && MEDIA.has(medium) ? medium : undefined;
  return {
    source: source && listed(source) ? source : UNLISTED,
    medium: listedMedium ?? UNLISTED,
    campaign: campaign && (CAMPAIGN_CODE.test(campaign) ? campaign : UNLISTED),
    content: content && (CONTENT_ID.test(content) ? content : UNLISTED),
    acquisition: !listedMedium ? UNKNOWN : PAID_MEDIA.has(listedMedium) ? "paid" : "unpaid",
  };
}

function hostOf(href: string) {
  try {
    return new URL(href).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// Only the host of a referrer is read. Its path and query can hold personal information.
function readReferrer(host: string): Signal | null {
  if (!host) return null;
  const rule = REFERRER_RULES.find((rule) => rule.host.test(host));
  if (rule) return { source: rule.source, medium: rule.medium, acquisition: rule.acquisition };
  // Another website can host a paid article with no tag, so a referral proves nothing.
  return { source: host.replace(/^www\./, ""), medium: "referral", acquisition: UNKNOWN };
}

// Reads the source of one full page load, or null when it carries none.
function readSignal(page: PageLoad): Signal | null {
  if (page.navigationType === "reload" || page.navigationType === "back_forward") return null;
  const url = new URL(page.href);
  const referrerHost = hostOf(page.referrer);
  if (referrerHost === url.hostname) return null; // internal navigation

  const tagged = readTags(url.searchParams);
  if (tagged) return tagged;
  const ad = AD_CLICK_IDS.find(({ key }) => url.searchParams.has(key));
  if (ad) return { source: ad.source, medium: ad.medium, acquisition: "paid" };
  return readReferrer(referrerHost);
}

// How much a touch tells us: 0 = unknown, 1 = an unlisted tag, 2 = a known source.
function certainty(touch: Signal) {
  if (touch.medium === UNKNOWN) return 0;
  if (touch.source === UNLISTED || touch.medium === UNLISTED) return 1;
  return 2;
}

function sameSource(a: Signal, b: Signal) {
  return (
    a.source === b.source &&
    a.medium === b.medium &&
    a.campaign === b.campaign &&
    a.content === b.content
  );
}

// A touch never gives way to a less certain one. So an unknown visit or an unlisted
// tag never replaces a known source, but an unlisted tag can fill an unknown view.
// The first view changes only for a more certain touch.
// The same source twice counts as one acquisition, so it keeps its first landing page.
function nextAttribution(
  previous: Attribution | null,
  signal: Signal | null,
  landingPage: string,
): Attribution {
  if (!signal) {
    if (previous) return previous;
    const unknown: Touch = { source: UNKNOWN, medium: UNKNOWN, acquisition: UNKNOWN, landingPage };
    return { first: unknown, latest: unknown };
  }
  const touch: Touch = { ...signal, landingPage };
  if (!previous) return { first: touch, latest: touch };

  const keepLatest =
    certainty(touch) < certainty(previous.latest) || sameSource(previous.latest, touch);
  return {
    first: certainty(touch) > certainty(previous.first) ? touch : previous.first,
    latest: keepLatest ? previous.latest : touch,
  };
}

function parseAttribution(saved: string | null): Attribution | null {
  if (!saved) return null;
  try {
    const parsed = attributionSchema.safeParse(JSON.parse(saved));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function touchParams(prefix: "first" | "latest", touch: Touch) {
  const params: Record<string, string> = {
    [`${prefix}_source`]: touch.source,
    [`${prefix}_medium`]: touch.medium,
    [`${prefix}_acquisition`]: touch.acquisition,
    [`${prefix}_landing_page`]: touch.landingPage,
  };
  if (touch.campaign) params[`${prefix}_campaign`] = touch.campaign;
  if (touch.content) params[`${prefix}_content`] = touch.content;
  return params;
}

// The report fields that each analytics destination receives with each event.
export function attributionParams(attribution: Attribution): Record<string, string> {
  return {
    ...touchParams("first", attribution.first),
    ...touchParams("latest", attribution.latest),
  };
}

// Applies one full page load to the saved attribution. changed tells the caller
// whether to save the result.
export function captureAttribution(page: PageLoad, saved: string | null) {
  const previous = parseAttribution(saved);
  const landingPage = new URL(page.href).pathname.slice(0, 100);
  const attribution = nextAttribution(previous, readSignal(page), landingPage);
  return { attribution, changed: JSON.stringify(attribution) !== JSON.stringify(previous) };
}

// Reads a saved attribution. A missing or damaged value reads as none.
export function readSavedAttribution(saved: string | null): Attribution | null {
  return parseAttribution(saved);
}
