// The page URL that an analytics tool may record: the origin and the path only.
// The query and the fragment can carry personal information, such as an email
// address from a newsletter link. The attribution fields already carry the URL tags.
export function pageUrlWithoutQuery(href: string): string {
  try {
    const url = new URL(href);
    return url.origin + url.pathname;
  } catch {
    return "";
  }
}
