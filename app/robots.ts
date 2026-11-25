import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_URL } from "@/lib/site";

// Production allows crawling and lists the sitemap.
// Previews and local runs also allow crawling. They list no sitemap.
// Their pages carry a noindex tag (lib/metadata.ts). A crawler must fetch a page to read the tag.
// A disallow rule stops the crawl. A search engine can then still index a linked URL.
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return { rules: { userAgent: "*", allow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
