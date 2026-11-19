import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Contentful reads. The webhook delivers content in seconds. The 7-day revalidate
    // is a backstop for a failed webhook, not a bug. See docs/adr/0001-contentful-content.md.
    contentful: {
      stale: 60 * 5,
      revalidate: 60 * 60 * 24 * 7,
      expire: 60 * 60 * 24 * 365,
    },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
