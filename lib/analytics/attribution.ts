import { z } from "zod";

// The attribution contract. It records where a visitor came from, in a fixed set
// of values, for every analytics destination. The reviewed URL tags mirror
// url-tags.md in the tend-marketing repo. Change both together.

// A visit with no tag and no external referrer. It does not prove unpaid traffic.
export const UNKNOWN = "unknown";
// A tag value that the reviewed list does not hold.
export const UNLISTED = "unlisted";

const MEDIA = [
  "cpc",
  "paid-social",
  "paid-article",
  "social",
  "organic",
  "ai-answer",
  "referral",
  "email",
] as const;
type Medium = (typeof MEDIA)[number];
const PAID_MEDIA = new Set<Medium>(["cpc", "paid-social", "paid-article"]);

function isMedium(value: string): value is Medium {
  return (MEDIA as readonly string[]).includes(value);
}

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

// A Campaign Code is "pa" and three digits, such as pa002. url-tags.md states the format.
const CAMPAIGN_CODE = /^pa\d{3}$/;
const CONTENT_ID = /^[a-z0-9-]{1,64}$/;
const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

// Whether a visit was paid for. unknown means we cannot tell. It is never unpaid by default.
const paidStatusSchema = z.enum(["paid", "unpaid", "unknown"]);
type PaidStatus = z.infer<typeof paidStatusSchema>;

// The paid status that a known medium proves.
function paidStatusOf(medium: Medium): PaidStatus {
  return PAID_MEDIA.has(medium) ? "paid" : "unpaid";
}

// Click IDs that ad platforms add to an ad link by themselves. Each one proves a paid ad.
// Only a short hash of the ID stays in the browser, and no tool receives it.
// Instagram's fbclid is not here: Instagram adds it to unpaid clicks too.
const AD_CLICK_IDS: { key: string; source: string; medium: Medium }[] = [
  { key: "gclid", source: "google", medium: "cpc" },
  { key: "gbraid", source: "google", medium: "cpc" }, // Google Ads on iOS
  { key: "wbraid", source: "google", medium: "cpc" }, // Google Ads on iOS
  { key: "msclkid", source: "bing", medium: "cpc" },
  { key: "ttclid", source: "tiktok", medium: "paid-social" },
  { key: "rdt_cid", source: "reddit", medium: "paid-social" },
];

// The pages that the store buttons open. A visit from them is a return from a store
// click, so it keeps the earlier source. A link on Tend's store listing also keeps it.
const STORE_HOSTS = /^(play\.google\.com|testflight\.apple\.com|apps\.apple\.com)$/;

// Referrer hosts, checked in this order. The AI assistants go first, because
// gemini.google.com would otherwise match Google search.
// Search and AI answers count as unpaid, because their ads carry a click ID.
// A social site or an email can carry a paid post with no click ID, so it proves nothing.
// Android apps send android-app://<package>/, so a rule also matches the app's package.
const REFERRER_RULES: { source: string; medium: Medium; paidStatus: PaidStatus; host: RegExp }[] = [
  { source: "chatgpt", medium: "ai-answer", paidStatus: "unpaid", host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$|^com\.openai\.chatgpt$/ },
  { source: "perplexity", medium: "ai-answer", paidStatus: "unpaid", host: /(^|\.)perplexity\.ai$/ },
  { source: "gemini", medium: "ai-answer", paidStatus: "unpaid", host: /^gemini\.google\.com$/ },
  { source: "copilot", medium: "ai-answer", paidStatus: "unpaid", host: /^copilot\.microsoft\.com$/ },
  { source: "claude", medium: "ai-answer", paidStatus: "unpaid", host: /^claude\.ai$/ },
  { source: "google", medium: "organic", paidStatus: "unpaid", host: /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$|^com\.google\.android\.googlequicksearchbox$/ },
  { source: "bing", medium: "organic", paidStatus: "unpaid", host: /(^|\.)bing\.com$/ },
  { source: "duckduckgo", medium: "organic", paidStatus: "unpaid", host: /(^|\.)duckduckgo\.com$/ },
  { source: "yahoo", medium: "organic", paidStatus: "unpaid", host: /(^|\.)search\.yahoo\.[a-z]{2,3}(\.[a-z]{2})?$|^(www\.)?yahoo\.com$/ },
  { source: "ecosia", medium: "organic", paidStatus: "unpaid", host: /(^|\.)ecosia\.org$/ },
  { source: "brave", medium: "organic", paidStatus: "unpaid", host: /^search\.brave\.com$/ },
  { source: "reddit", medium: "social", paidStatus: "unknown", host: /(^|\.)reddit\.com$|^com\.reddit\.frontpage$/ },
  { source: "tiktok", medium: "social", paidStatus: "unknown", host: /(^|\.)tiktok\.com$|^com\.zhiliaoapp\.musically$|^com\.ss\.android\.ugc\.trill$/ },
  { source: "instagram", medium: "social", paidStatus: "unknown", host: /(^|\.)instagram\.com$|^com\.instagram\.android$/ },
  { source: "youtube", medium: "social", paidStatus: "unknown", host: /(^|\.)(youtube\.com|youtu\.be)$|^com\.google\.android\.youtube$/ },
  { source: "gmail", medium: "email", paidStatus: "unknown", host: /^mail\.google\.com$|^com\.google\.android\.gm$/ },
];

const touchSchema = z.object({
  source: z.string().max(100),
  medium: z.enum([...MEDIA, UNKNOWN, UNLISTED]),
  campaign: z.string().max(100).optional(),
  content: z.string().max(100).optional(),
  paidStatus: paidStatusSchema,
  landingPage: z.string().max(100),
});

// The URL sources that already counted, newest last. A tagged URL stays in the address
// bar, so a visitor can reopen it from history or a bookmark. It must not count again.
const SEEN_LIMIT = 20;

const attributionSchema = z.object({
  first: touchSchema,
  latest: touchSchema,
  seen: z.array(z.string().max(300)).max(SEEN_LIMIT),
});

// A touch: the source of one visit and the page it landed on.
type Touch = z.infer<typeof touchSchema>;
type Signal = Omit<Touch, "landingPage">;

// first: the first known touch. latest: the latest known touch.
// Each one is unknown only until the first known source arrives.
export type Attribution = z.infer<typeof attributionSchema>;

export type PageLoad = {
  href: string;
  referrer: string;
  // From the Navigation Timing API: navigate, reload or back_forward.
  navigationType?: string;
};

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

// A tag value counts exactly as written. A value in the wrong case or with spaces
// is not on the reviewed list, so it records as unlisted and someone can fix the tag.
function tagValue(params: URLSearchParams, key: string) {
  return params.get(key) || undefined;
}

// A Campaign is paid only, so a Campaign Code on an unpaid medium is a tag error.
function campaignFor(params: URLSearchParams, medium: Medium | undefined) {
  const campaign = tagValue(params, "utm_campaign");
  if (!campaign) return undefined;
  const paid = medium === undefined || PAID_MEDIA.has(medium);
  return CAMPAIGN_CODE.test(campaign) && paid ? campaign : UNLISTED;
}

function readTags(params: URLSearchParams): Signal | null {
  let source = tagValue(params, "utm_source");
  let medium = tagValue(params, "utm_medium");
  // ChatGPT adds utm_source=chatgpt.com to its links by itself, with no medium.
  if (source === "chatgpt.com") {
    source = "chatgpt";
    medium ??= "ai-answer";
  }
  const content = tagValue(params, "utm_content");
  if (!source && !medium && !params.get("utm_campaign") && !content) return null;

  // organic comes from the referrer only. url-tags.md: "Never a hand tag".
  const listedMedium = medium && isMedium(medium) && medium !== "organic" ? medium : undefined;
  let listedSource: string | undefined;
  if (source && SOURCES.has(source)) listedSource = source;
  else if (source && listedMedium === "referral" && DOMAIN.test(source)) listedSource = mainDomain(source);

  return {
    source: listedSource ?? UNLISTED,
    medium: listedMedium ?? UNLISTED,
    campaign: campaignFor(params, listedMedium),
    content: content && (CONTENT_ID.test(content) ? content : UNLISTED),
    paidStatus: listedMedium ? paidStatusOf(listedMedium) : UNKNOWN,
  };
}

// Only the host of a referrer is read. Its path and query can hold personal information.
function readReferrer(referrer: string): Signal | null {
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  // A visitor who comes back from the store page is a return, not a new source.
  if (!host || STORE_HOSTS.test(host)) return null;
  const rule = REFERRER_RULES.find((rule) => rule.host.test(host));
  if (rule) return { source: rule.source, medium: rule.medium, paidStatus: rule.paidStatus };
  // Another Android app: its package name read backwards is its domain.
  const domain = url.protocol === "android-app:" ? host.split(".").reverse().join(".") : host;
  // Another website can host a paid article with no tag, so a referral proves nothing.
  return { source: mainDomain(domain), medium: "referral", paidStatus: UNKNOWN };
}

function hostOf(href: string) {
  try {
    return new URL(href).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// The www host and the bare host are one site.
function sameSite(a: string, b: string) {
  return a.replace(/^www\./, "") === b.replace(/^www\./, "");
}

// A short, one-way hash. It tells two click IDs apart without keeping either one.
function shortHash(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function sourceKey(signal: Signal) {
  return [signal.source, signal.medium, signal.campaign ?? "", signal.content ?? ""].join("|");
}

// The source of one page load. urlKey is set when the URL itself carries the source,
// as tags or an ad click ID. A visitor can reopen such a URL later. A new click ID
// gives a new urlKey, because it proves a new ad click.
type PageSignal = { signal: Signal; urlKey?: string };

// Reads the source of one full page load, or null when it carries none.
function readSignal(page: PageLoad): PageSignal | null {
  if (page.navigationType === "reload" || page.navigationType === "back_forward") return null;
  const url = new URL(page.href);
  if (sameSite(hostOf(page.referrer), url.hostname)) return null; // internal navigation

  const params = url.searchParams;
  const tagged = readTags(params);
  // An ad click ID proves a paid ad, so it wins over the URL tags. The tags still
  // give the Campaign Code and the content id.
  const ad = AD_CLICK_IDS.find(({ key }) => params.has(key));
  if (ad) {
    const signal: Signal = {
      source: ad.source,
      medium: ad.medium,
      campaign: campaignFor(params, ad.medium),
      content: tagged?.content,
      paidStatus: paidStatusOf(ad.medium),
    };
    return { signal, urlKey: `${sourceKey(signal)}|${shortHash(params.get(ad.key) ?? "")}` };
  }
  if (tagged) return { signal: tagged, urlKey: sourceKey(tagged) };
  const referred = readReferrer(page.referrer);
  return referred && { signal: referred };
}

// How much a touch tells us: 0 = unknown, 1 = an unlisted tag, 2 = a known source.
function certainty(touch: Signal) {
  if (touch.medium === UNKNOWN) return 0;
  if (touch.source === UNLISTED || touch.medium === UNLISTED) return 1;
  return 2;
}

// A touch never gives way to a less certain one. So an unknown visit or an unlisted
// tag never replaces a known source, but an unlisted tag can fill an unknown touch.
// The first touch changes only for a more certain touch.
// The same source as the latest one counts once, so it keeps its first landing page.
// A URL source that already counted never counts again. An untagged source can.
function nextAttribution(
  previous: Attribution | null,
  pageSignal: PageSignal | null,
  landingPage: string,
): Attribution {
  if (!pageSignal) {
    if (previous) return previous;
    const unknown: Touch = { source: UNKNOWN, medium: UNKNOWN, paidStatus: UNKNOWN, landingPage };
    return { first: unknown, latest: unknown, seen: [] };
  }
  const { signal, urlKey } = pageSignal;
  const touch: Touch = { ...signal, landingPage };
  if (!previous) return { first: touch, latest: touch, seen: urlKey ? [urlKey] : [] };
  if (urlKey && previous.seen.includes(urlKey)) return previous;

  const seen = urlKey ? [...previous.seen, urlKey].slice(-SEEN_LIMIT) : previous.seen;
  if (sourceKey(signal) === sourceKey(previous.latest)) return { ...previous, seen };
  if (certainty(touch) < certainty(previous.latest)) return previous;
  return {
    first: certainty(touch) > certainty(previous.first) ? touch : previous.first,
    latest: touch,
    seen,
  };
}

// Reads a saved attribution. A missing or damaged value reads as none.
export function parseAttribution(saved: string | null): Attribution | null {
  if (!saved) return null;
  try {
    const parsed = attributionSchema.safeParse(JSON.parse(saved));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// The source fields of a touch. Campaign and content appear only when present.
export function touchTags(touch: Signal): Record<string, string> {
  const tags: Record<string, string> = { source: touch.source, medium: touch.medium };
  if (touch.campaign) tags.campaign = touch.campaign;
  if (touch.content) tags.content = touch.content;
  return tags;
}

function touchParams(prefix: "first" | "latest", touch: Touch) {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(touchTags(touch))) params[`${prefix}_${key}`] = value;
  params[`${prefix}_paid_status`] = touch.paidStatus;
  params[`${prefix}_landing_page`] = touch.landingPage;
  return params;
}

// The attribution fields that each analytics tool receives with each event.
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
