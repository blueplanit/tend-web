import { urlTags } from "./attribution";

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

// The origin, the path and the URL tags after the reviewed list applies. GA4 reads
// the tags for its own reports, so they hold the same values as the attribution
// fields. utm_term, click IDs and every other parameter go.
export function pageLocationForGa(href: string): string {
  try {
    const url = new URL(href);
    const query = new URLSearchParams(urlTags(href) ?? {}).toString();
    return url.origin + url.pathname + (query ? `?${query}` : "");
  } catch {
    return "";
  }
}
