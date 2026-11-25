import { afterEach, describe, expect, it, vi } from "vitest";

// lib/site.ts reads the environment once, on import. So each test loads fresh modules.
async function loadFor(vercelEnv: string) {
  vi.resetModules();
  vi.stubEnv("VERCEL_ENV", vercelEnv);
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  const [metadata, robots] = await Promise.all([import("./metadata"), import("@/app/robots")]);
  return { ...metadata, robots: robots.default };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("search engine rules", () => {
  it("lets production pages get indexed and lists the sitemap", async () => {
    const { DEPLOYMENT_ROBOTS, robots } = await loadFor("production");
    expect(DEPLOYMENT_ROBOTS).toBeUndefined();
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://tend-web-eight.vercel.app/sitemap.xml",
    });
  });

  it("marks preview pages noindex and lets crawlers read that tag", async () => {
    const { DEPLOYMENT_ROBOTS, robots } = await loadFor("preview");
    expect(DEPLOYMENT_ROBOTS).toEqual({ index: false, follow: false });
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/" } });
  });

  it("marks local pages noindex", async () => {
    const { DEPLOYMENT_ROBOTS } = await loadFor("");
    expect(DEPLOYMENT_ROBOTS).toEqual({ index: false, follow: false });
  });
});

describe("openGraphFor", () => {
  it("keeps the shared fields next to the page fields", async () => {
    const { openGraphFor, SHARED_OPEN_GRAPH } = await loadFor("production");
    expect(openGraphFor({ url: "/terms", title: "Terms of use", description: "The rules." })).toEqual({
      ...SHARED_OPEN_GRAPH,
      url: "/terms",
      title: "Terms of use",
      description: "The rules.",
    });
  });

  it("shares no page title, description or URL", async () => {
    const { SHARED_OPEN_GRAPH } = await loadFor("production");
    expect(SHARED_OPEN_GRAPH).not.toHaveProperty("title");
    expect(SHARED_OPEN_GRAPH).not.toHaveProperty("description");
    expect(SHARED_OPEN_GRAPH).not.toHaveProperty("url");
  });
});
