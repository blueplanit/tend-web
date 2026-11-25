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

// Referrer hosts, checked in this order. The AI assistants go first, because
// gemini.google.com would otherwise match Google search.
const REFERRER_RULES: { source: string; medium: string; host: RegExp }[] = [
  { source: "chatgpt", medium: "ai-answer", host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/ },
  { source: "perplexity", medium: "ai-answer", host: /(^|\.)perplexity\.ai$/ },
  { source: "gemini", medium: "ai-answer", host: /^gemini\.google\.com$/ },
  { source: "copilot", medium: "ai-answer", host: /^copilot\.microsoft\.com$/ },
  { source: "claude", medium: "ai-answer", host: /^claude\.ai$/ },
  { source: "google", medium: "organic", host: /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/ },
  { source: "bing", medium: "organic", host: /(^|\.)bing\.com$/ },
  { source: "duckduckgo", medium: "organic", host: /(^|\.)duckduckgo\.com$/ },
  { source: "yahoo", medium: "organic", host: /^(search\.)?yahoo\.com$/ },
  { source: "ecosia", medium: "organic", host: /(^|\.)ecosia\.org$/ },
  { source: "brave", medium: "organic", host: /^search\.brave\.com$/ },
  { source: "reddit", medium: "social", host: /(^|\.)reddit\.com$/ },
  { source: "tiktok", medium: "social", host: /(^|\.)tiktok\.com$/ },
  { source: "instagram", medium: "social", host: /(^|\.)instagram\.com$/ },
  { source: "youtube", medium: "social", host: /(^|\.)(youtube\.com|youtu\.be)$/ },
];

const touchSchema = z.object({
  source: z.string().max(100),
  medium: z.string().max(100),
  campaign: z.string().max(100).optional(),
  content: z.string().max(100).optional(),
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

function tagValue(params: URLSearchParams, key: string) {
  return params.get(key)?.trim().toLowerCase() || undefined;
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
  return {
    source: source && listed(source) ? source : UNLISTED,
    medium: medium && MEDIA.has(medium) ? medium : UNLISTED,
    campaign: campaign && (CAMPAIGN_CODE.test(campaign) ? campaign : UNLISTED),
    content: content && (CONTENT_ID.test(content) ? content : UNLISTED),
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
  if (rule) return { source: rule.source, medium: rule.medium };
  return { source: host.replace(/^www\./, ""), medium: "referral" };
}

// Reads the source of one full page load, or null when it carries none.
function readSignal(page: PageLoad): Signal | null {
  if (page.navigationType === "reload" || page.navigationType === "back_forward") return null;
  const url = new URL(page.href);
  const referrerHost = hostOf(page.referrer);
  if (referrerHost === url.hostname) return null; // internal navigation

  const tagged = readTags(url.searchParams);
  if (tagged) return tagged;
  // Google Ads auto-tagging adds gclid instead of URL tags. The id itself is not recorded.
  if (url.searchParams.has("gclid")) return { source: "google", medium: "cpc" };
  return readReferrer(referrerHost);
}

function isKnown(touch: Signal) {
  return touch.medium !== UNKNOWN;
}

function sameSource(a: Signal, b: Signal) {
  return (
    a.source === b.source &&
    a.medium === b.medium &&
    a.campaign === b.campaign &&
    a.content === b.content
  );
}

// A known source never gives way to an unknown one.
// The same source twice counts as one acquisition, so it keeps its first landing page.
function nextAttribution(
  previous: Attribution | null,
  signal: Signal | null,
  landingPage: string,
): Attribution {
  if (!signal) {
    if (previous) return previous;
    const unknown: Touch = { source: UNKNOWN, medium: UNKNOWN, landingPage };
    return { first: unknown, latest: unknown };
  }
  const touch: Touch = { ...signal, landingPage };
  if (!previous) return { first: touch, latest: touch };
  return {
    first: isKnown(previous.first) ? previous.first : touch,
    latest: isKnown(previous.latest) && sameSource(previous.latest, touch) ? previous.latest : touch,
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

function acquisition(touch: Touch) {
  if (touch.medium === UNKNOWN || touch.medium === UNLISTED) return UNKNOWN;
  return PAID_MEDIA.has(touch.medium) ? "paid" : "unpaid";
}

function touchParams(prefix: "first" | "latest", touch: Touch) {
  const params: Record<string, string> = {
    [`${prefix}_source`]: touch.source,
    [`${prefix}_medium`]: touch.medium,
    [`${prefix}_acquisition`]: acquisition(touch),
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
