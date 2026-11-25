// The page URLs that analytics tools may record. The query and the fragment can carry
// personal information, such as an email address from a newsletter link.

// The origin and the path only. The attribution fields already carry the URL tags.
export function urlWithoutQueryOrFragment(href: string): string {
  try {
    const url = new URL(href);
    return url.origin + url.pathname;
  } catch {
    return "";
  }
}

const GA_TAG_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
// A tag value in this form cannot hold an email address or a name with spaces.
const SAFE_TAG_VALUE = /^[a-z0-9.-]{1,64}$/;

// The origin, the path and the URL tags whose values are safe. GA4 reads the tags
// for its own reports. utm_term, click IDs and every other parameter go.
export function pageLocationForGa(href: string): string {
  try {
    const url = new URL(href);
    const kept = new URLSearchParams();
    for (const key of GA_TAG_KEYS) {
      const value = url.searchParams.get(key);
      if (value && SAFE_TAG_VALUE.test(value)) kept.set(key, value);
    }
    const query = kept.toString();
    return url.origin + url.pathname + (query ? `?${query}` : "");
  } catch {
    return "";
  }
}
