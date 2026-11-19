import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Add each new page here. Contentful pages join this list when the CMS arrives.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }];
}
