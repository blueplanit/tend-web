import { appStoreLabel, isKnown, prefixedTags, UNKNOWN, type Attribution } from "./attribution";

export type StoreDestination = "play_store" | "testflight" | "app_store";

const DESTINATIONS: Record<string, StoreDestination> = {
  "play.google.com": "play_store",
  "testflight.apple.com": "testflight",
  "apps.apple.com": "app_store",
};

// The store that a link opens, from its host, or null for any other link.
export function storeDestination(url: string): StoreDestination | null {
  try {
    return DESTINATIONS[new URL(url).hostname] ?? null;
  } catch {
    return null;
  }
}

// Only the store listing keeps the install referrer. The open test join page drops it.
const STORE_LISTING_PATH = "/store/apps/details";

// Passes the visitor's touches on to the store.
// - Google Play gets an install referrer. See playStoreLink.
// - The App Store gets the App Store label. See appStoreLink.
// - TestFlight takes no tags, so its link stays as it is.
export function withStoreAttribution(
  url: string,
  attribution: Attribution | null,
  providerToken: string | null = null,
): string {
  switch (storeDestination(url)) {
    case "play_store":
      return playStoreLink(new URL(url), attribution);
    case "app_store":
      return appStoreLink(new URL(url), attribution, providerToken);
    default:
      return url;
  }
}

// The app reads the install referrer on first open and ties the install to its source
// and Campaign. utm_ fields hold the latest touch. Play Console reports installs by them.
// first_ fields hold the first touch. Only the app reads them.
function playStoreLink(target: URL, attribution: Attribution | null) {
  if (target.pathname !== STORE_LISTING_PATH || !attribution || !isKnown(attribution.latest)) {
    return target.toString();
  }
  const { first, latest } = attribution;
  const tags = {
    ...prefixedTags("utm", latest),
    ...(isKnown(first) ? prefixedTags("first", first) : {}),
  };
  target.searchParams.set("referrer", new URLSearchParams(tags).toString());
  return target.toString();
}

// Apple calls this a campaign link: pt is our provider token, ct the App Store label,
// mt=8 an app. Apple takes one label, so it gets the latest touch.
// The server has no saved touch, so its link says unknown until the browser adds it.
function appStoreLink(target: URL, attribution: Attribution | null, providerToken: string | null) {
  if (!providerToken) return target.toString();
  target.searchParams.set("pt", providerToken);
  target.searchParams.set("ct", attribution ? appStoreLabel(attribution.latest) : UNKNOWN);
  target.searchParams.set("mt", "8");
  return target.toString();
}
