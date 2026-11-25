import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_URL } from "@/lib/site";
import { deploymentEnv, importWithEnv } from "@/lib/test-utils/import-with-env";

async function robotsFor(vercelEnv: string) {
  return (await importWithEnv(deploymentEnv(vercelEnv), () => import("./robots"))).default();
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots.txt", () => {
  it("lists the sitemap in production", async () => {
    expect(await robotsFor("production")).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${DEFAULT_SITE_URL}/sitemap.xml`,
    });
  });

  // A crawler must fetch a preview page to read its noindex tag.
  it("allows crawling on previews", async () => {
    expect(await robotsFor("preview")).toEqual({ rules: { userAgent: "*", allow: "/" } });
  });

  it("allows crawling on local runs", async () => {
    expect(await robotsFor("")).toEqual({ rules: { userAgent: "*", allow: "/" } });
  });
});
