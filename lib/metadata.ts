import type { Metadata } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_NAME } from "./site";

// The Open Graph fields that every page shares. The root layout sets only these.
export const SHARED_OPEN_GRAPH = { type: "website", siteName: SITE_NAME, locale: "en_US" } as const;

// The metadata of one page: its description, canonical URL and Open Graph fields.
// Each page sets these fields with this function. The root layout sets none of them.
// Next.js merges layout and page metadata shallowly. A page openGraph replaces the layout openGraph.
// So this function adds the shared Open Graph fields back.
export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    description,
    alternates: { canonical: path },
    openGraph: { ...SHARED_OPEN_GRAPH, url: path, title, description },
  };
}

// The robots tag of each page outside production: noindex and nofollow.
// Production gets no robots tag. Search engines can then index its pages.
// A page robots field replaces this value. So no page sets its own robots field.
export const NON_PRODUCTION_NOINDEX: Metadata["robots"] = IS_PRODUCTION_DEPLOYMENT
  ? undefined
  : { index: false, follow: false };
