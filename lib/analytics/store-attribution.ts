import type { BetaPlatform } from "@/lib/site";
import { UNKNOWN, touchTags, type Attribution } from "./attribution";

// Passes the latest known source on to Google Play as the install referrer.
// The app can then read it and tie an install to its source and Campaign.
// TestFlight takes no referrer, so an iOS link stays as it is.
// Check that the Play open test link keeps the referrer before you rely on it.
export function withStoreAttribution(
  url: string,
  platform: BetaPlatform,
  attribution: Attribution | null,
): string {
  const latest = attribution?.latest;
  if (platform !== "android" || !latest || latest.medium === UNKNOWN) return url;

  const tags: Record<string, string> = {};
  for (const [key, value] of Object.entries(touchTags(latest))) tags[`utm_${key}`] = value;

  try {
    const target = new URL(url);
    target.searchParams.set("referrer", new URLSearchParams(tags).toString());
    return target.toString();
  } catch {
    return url;
  }
}
