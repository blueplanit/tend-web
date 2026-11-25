import { describe, expect, it } from "vitest";
import { importWithEnv } from "./test-utils/import-with-env";
import { DEFAULT_SITE_URL } from "./site";

async function siteUrlFor(value: string) {
  return (await importWithEnv({ NEXT_PUBLIC_SITE_URL: value }, () => import("./site"))).SITE_URL;
}

describe("SITE_URL", () => {
  it("uses the Vercel URL when the variable is empty", async () => {
    expect(await siteUrlFor("")).toBe(DEFAULT_SITE_URL);
  });

  it("uses the Vercel URL when the variable holds only spaces", async () => {
    expect(await siteUrlFor("  ")).toBe(DEFAULT_SITE_URL);
  });

  it("uses the domain from the variable, without spaces", async () => {
    expect(await siteUrlFor(" https://example.com ")).toBe("https://example.com");
  });
});
