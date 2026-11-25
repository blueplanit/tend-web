import type { BetaPlatform } from "@/lib/site";
import { isKnown, prefixedTags, type Attribution } from "./attribution";

// Only the store listing keeps the install referrer. The open test join page drops it.
const STORE_LISTING_PATH = "/store/apps/details";

// Passes the source on to Google Play as the install referrer. The app reads it on
// first open and ties the install to its source and Campaign.
// - utm_ fields hold the latest source. Play Console reports installs by them.
// - first_ fields hold the first source. Only the app reads them.
// TestFlight takes no referrer, so an iOS link stays as it is.
export function withStoreAttribution(
  url: string,
  platform: BetaPlatform,
  attribution: Attribution | null,
): string {
  if (platform !== "android" || !attribution || !isKnown(attribution.latest)) return url;
  const { first, latest } = attribution;

  const tags = {
    ...prefixedTags("utm", latest),
    ...(isKnown(first) ? prefixedTags("first", first) : {}),
  };

  try {
    const target = new URL(url);
    if (target.hostname !== "play.google.com" || target.pathname !== STORE_LISTING_PATH) return url;
    target.searchParams.set("referrer", new URLSearchParams(tags).toString());
    return target.toString();
  } catch {
    return url;
  }
}
