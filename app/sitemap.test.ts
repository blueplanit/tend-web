import { describe, expect, it } from "vitest";
import { deploymentEnv, importWithEnv } from "@/lib/test-utils/import-with-env";

describe("sitemap", () => {
  it("lists every page on the domain from NEXT_PUBLIC_SITE_URL", async () => {
    const sitemap = await importWithEnv(deploymentEnv("production", "https://example.com"), () =>
      import("./sitemap"),
    );
    expect(sitemap.default().map(({ url }) => url)).toEqual([
      "https://example.com",
      "https://example.com/privacy",
      "https://example.com/terms",
    ]);
  });
});
