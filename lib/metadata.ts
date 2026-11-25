import type { Metadata } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_NAME } from "./site";

// The Open Graph fields that every page shares. The root layout sets only these.
// A page without its own Open Graph fields then shows no homepage title or description.
export const SHARED_OPEN_GRAPH = { type: "website", siteName: SITE_NAME, locale: "en_US" } as const;

// Next.js merges layout and page metadata shallowly.
// A page openGraph replaces the layout openGraph as a whole.
// This function adds the shared fields back to the page fields.
export function openGraphFor(page: {
  url: string;
  title: string;
  description: string;
}): Metadata["openGraph"] {
  return { ...SHARED_OPEN_GRAPH, ...page };
}

// Previews and local runs tell search engines not to index any page.
// app/robots.ts allows crawling there. A crawler must fetch a page to read this tag.
export const DEPLOYMENT_ROBOTS: Metadata["robots"] = IS_PRODUCTION_DEPLOYMENT
  ? undefined
  : { index: false, follow: false };
