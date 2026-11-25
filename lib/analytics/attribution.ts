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
  // Email apps
  "gmail",
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

// The pages that the store buttons open. A visit from them is a return from a store
// click, so it keeps the earlier source. A link on Tend's store listing also keeps it.
const STORE_HOSTS = /^(play\.google\.com|testflight\.apple\.com|apps\.apple\.com)$/;

// Referrer hosts, checked in this order. The AI assistants go first, because
// gemini.google.com would otherwise match Google search.
// Search and AI answers count as unpaid, because their ads carry a click id.
// A social site can host a paid post with no click id, so a social referrer proves nothing.
const REFERRER_RULES: { source: string; medium: string; acquisition: Acquisition; host: RegExp }[] = [
  // Android apps send android-app://<package>/, so each rule also matches the app's package.
  { source: "chatgpt", medium: "ai-answer", acquisition: "unpaid", host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$|^com\.openai\.chatgpt$/ },
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
  { source: "reddit", medium: "social", acquisition: "unknown", host: /(^|\.)reddit\.com$|^com\.reddit\.frontpage$/ },
  { source: "tiktok", medium: "social", acquisition: "unknown", host: /(^|\.)tiktok\.com$|^com\.zhiliaoapp\.musically$|^com\.ss\.android\.ugc\.trill$/ },
  { source: "instagram", medium: "social", acquisition: "unknown", host: /(^|\.)instagram\.com$|^com\.instagram\.android$/ },
  { source: "youtube", medium: "social", acquisition: "unknown", host: /(^|\.)(youtube\.com|youtu\.be)$|^com\.google\.android\.youtube$/ },
  // A link in an email can come from our newsletter or from a person, so it proves nothing.
  { source: "gmail", medium: "email", acquisition: "unknown", host: /^mail\.google\.com$|^com\.google\.android\.gm$/ },
];

const touchSchema = z.object({
  source: z.string().max(100),
  medium: z.string().max(100),
  campaign: z.string().max(100).optional(),
  content: z.string().max(100).optional(),
  acquisition: acquisitionSchema,
  landingPage: z.string().max(100),
});

// The sources that already counted, newest last. A tagged URL stays in the address
// bar, so a visitor can reopen it from history or a bookmark. It must not count again.
const SEEN_LIMIT = 20;

const attributionSchema = z.object({
  first: touchSchema,
  latest: touchSchema,
  seen: z.array(z.string().max(300)).max(SEEN_LIMIT),
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
  // organic comes from the referrer only. url-tags.md: "Never a hand tag".
  const listedMedium = medium && MEDIA.has(medium) && medium !== "organic" ? medium : undefined;
  // A Campaign is paid only, so a Campaign Code on an unpaid medium is a tag error.
  const unpaidMedium = listedMedium && !PAID_MEDIA.has(listedMedium);
  return {
    source: source && listed(source) ? source : UNLISTED,
    medium: listedMedium ?? UNLISTED,
    campaign:
      campaign && (CAMPAIGN_CODE.test(campaign) && !unpaidMedium ? campaign : UNLISTED),
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
  // A visitor who comes back from the store page is a return, not a new source.
  if (!host || STORE_HOSTS.test(host)) return null;
  const rule = REFERRER_RULES.find((rule) => rule.host.test(host));
  if (rule) return { source: rule.source, medium: rule.medium, acquisition: rule.acquisition };
  // Another website can host a paid article with no tag, so a referral proves nothing.
  return { source: mainDomain(host), medium: "referral", acquisition: UNKNOWN };
}

// Second-level labels under a country domain, such as co.uk and com.au.
const COUNTRY_SECOND_LEVELS = new Set(["co", "com", "org", "net", "ac", "gov", "edu"]);

// The main domain of a host, such as substack.com for jo-smith.substack.com.
// A subdomain can name a person, so it is never recorded.
function mainDomain(host: string) {
  const labels = host.split(".");
  const [secondLevel, topLevel] = labels.slice(-2);
  const countrySuffix = topLevel?.length === 2 && COUNTRY_SECOND_LEVELS.has(secondLevel);
  return labels.slice(countrySuffix ? -3 : -2).join(".");
}

// The source of one page load. fromUrl is true when the URL itself carries the
// source, as tags or an ad click id. A visitor can reopen such a URL later.
type PageSignal = { signal: Signal; fromUrl: boolean };

// Reads the source of one full page load, or null when it carries none.
function readSignal(page: PageLoad): PageSignal | null {
  if (page.navigationType === "reload" || page.navigationType === "back_forward") return null;
  const url = new URL(page.href);
  const referrerHost = hostOf(page.referrer);
  if (referrerHost === url.hostname) return null; // internal navigation

  const tagged = readTags(url.searchParams);
  // An ad click id proves a paid ad, so it wins over the URL tags. The tags still
  // give the Campaign Code and the content id.
  const ad = AD_CLICK_IDS.find(({ key }) => url.searchParams.has(key));
  if (ad) {
    const signal: Signal = {
      source: ad.source,
      medium: ad.medium,
      campaign: tagged?.campaign,
      content: tagged?.content,
      acquisition: "paid",
    };
    return { signal, fromUrl: true };
  }
  if (tagged) return { signal: tagged, fromUrl: true };
  const referred = readReferrer(referrerHost);
  return referred && { signal: referred, fromUrl: false };
}

// How much a touch tells us: 0 = unknown, 1 = an unlisted tag, 2 = a known source.
function certainty(touch: Signal) {
  if (touch.medium === UNKNOWN) return 0;
  if (touch.source === UNLISTED || touch.medium === UNLISTED) return 1;
  return 2;
}

function sourceKey(signal: Signal) {
  return [signal.source, signal.medium, signal.campaign ?? "", signal.content ?? ""].join("|");
}

// A touch never gives way to a less certain one. So an unknown visit or an unlisted
// tag never replaces a known source, but an unlisted tag can fill an unknown touch.
// The first touch changes only for a more certain touch.
// The same source as the latest one counts once, so it keeps its first landing page.
// A tagged URL that already counted never counts again, because a visitor can reopen
// it from history or a bookmark. An untagged source can count again on a real return.
function nextAttribution(
  previous: Attribution | null,
  read: PageSignal | null,
  landingPage: string,
): Attribution {
  if (!read) {
    if (previous) return previous;
    const unknown: Touch = { source: UNKNOWN, medium: UNKNOWN, acquisition: UNKNOWN, landingPage };
    return { first: unknown, latest: unknown, seen: [] };
  }
  const { signal, fromUrl } = read;
  const touch: Touch = { ...signal, landingPage };
  const key = sourceKey(signal);
  if (!previous) return { first: touch, latest: touch, seen: fromUrl ? [key] : [] };
  if (key === sourceKey(previous.latest)) return previous;
  if (fromUrl && previous.seen.includes(key)) return previous;

  const newLatest = certainty(touch) >= certainty(previous.latest);
  const remember = newLatest && fromUrl;
  return {
    first: certainty(touch) > certainty(previous.first) ? touch : previous.first,
    latest: newLatest ? touch : previous.latest,
    seen: remember ? [...previous.seen, key].slice(-SEEN_LIMIT) : previous.seen,
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
