import type { Metadata } from "next";
import { SITE_NAME } from "./site";

// Next.js merges the metadata of a layout and a page shallowly. A page that sets
// openGraph replaces the whole openGraph of the layout. So each page builds its
// openGraph here, and every page keeps the shared fields.
export function openGraphFor(page: {
  url?: string;
  title: string;
  description: string;
}): Metadata["openGraph"] {
  return { type: "website", siteName: SITE_NAME, locale: "en_US", ...page };
}
