import type { Metadata } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_NAME } from "./site";

// Next.js merges layout and page metadata shallowly. Each page inherits every layout
// field that it does not set. A page field with nested values, such as openGraph or
// robots, replaces the layout field as a whole. So the root layout sets only
// site-wide fields, and each page sets its own fields with pageMetadata.

// The Open Graph fields that every page shares. The root layout sets only these.
export const SHARED_OPEN_GRAPH = { type: "website", siteName: SITE_NAME, locale: "en_US" } as const;

// The metadata of one page: its title, description, canonical URL and Open Graph fields.
// The layout title template applies to pages below the root only. So the homepage title
// stays as it is, and a legal page title gets " | Tend".
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
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...SHARED_OPEN_GRAPH, url: path, title, description },
  };
}

// The robots tag of the root layout.
// - Production: undefined. The pages get no robots tag, so search engines can index them.
// - Previews and local runs: noindex and nofollow on every page.
// A page robots field replaces this value. So no page sets its own robots field.
export const NON_PRODUCTION_NOINDEX: Metadata["robots"] = IS_PRODUCTION_DEPLOYMENT
  ? undefined
  : { index: false, follow: false };
