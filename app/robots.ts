import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_URL } from "@/lib/site";

// Previews and local runs allow crawling but list no sitemap.
// Their pages carry a noindex tag (lib/metadata.ts). A crawler must fetch a page to read it.
// A disallow rule here would stop the crawl, but a linked page could still get indexed.
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return { rules: { userAgent: "*", allow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
