import { afterEach, describe, expect, it, vi } from "vitest";

// lib/site.ts reads the environment once, on import. So each test loads a fresh module.
async function siteUrlFor(value: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", value);
  return (await import("./site")).SITE_URL;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SITE_URL", () => {
  it("uses the Vercel URL when the variable is empty", async () => {
    expect(await siteUrlFor("")).toBe("https://tend-web-eight.vercel.app");
  });

  it("uses the Vercel URL when the variable holds only spaces", async () => {
    expect(await siteUrlFor("  ")).toBe("https://tend-web-eight.vercel.app");
  });

  it("uses the domain from the variable, without spaces", async () => {
    expect(await siteUrlFor(" https://example.com ")).toBe("https://example.com");
  });
});
