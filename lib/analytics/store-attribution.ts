import type { BetaPlatform } from "@/lib/site";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function readUtmParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

// Passes the visit's UTM parameters on to Google Play as the install referrer.
// The app can then read them and tie an install to its Campaign.
// TestFlight takes no referrer, so an iOS link stays as it is.
// Check that the Play open test link keeps the referrer before you rely on it.
export function withStoreAttribution(
  url: string,
  platform: BetaPlatform,
  search: string,
): string {
  if (platform !== "android") return url;

  const utm = readUtmParams(search);
  if (Object.keys(utm).length === 0) return url;

  try {
    const target = new URL(url);
    target.searchParams.set("referrer", new URLSearchParams(utm).toString());
    return target.toString();
  } catch {
    return url;
  }
}
