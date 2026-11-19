import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_URL } from "@/lib/site";

// Preview and local deployments ask crawlers to stay out, so only one copy of
// the site gets indexed.
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
