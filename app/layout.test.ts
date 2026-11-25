import { describe, expect, it, vi } from "vitest";
import { deploymentEnv, importWithEnv } from "@/lib/test-utils/import-with-env";

// next/font runs at build time only. The test needs only a class name.
vi.mock("next/font/local", () => ({ default: () => ({ variable: "font" }) }));
vi.mock("@/lib/landing-copy", () => ({
  getLandingCopy: async () => ({
    copy: { meta: { title: "Home title", description: "Home description" } },
    source: "default",
  }),
}));

async function layoutMetadataFor(vercelEnv: string, siteUrl = "") {
  const [layout, metadata] = await importWithEnv(deploymentEnv(vercelEnv, siteUrl), () =>
    Promise.all([import("./layout"), import("@/lib/metadata")]),
  );
  return { metadata: await layout.generateMetadata(), SHARED_OPEN_GRAPH: metadata.SHARED_OPEN_GRAPH };
}

// lib/metadata.ts says why the root layout sets only site-wide fields.
describe("root layout metadata", () => {
  it("sets no description, canonical URL or page Open Graph fields", async () => {
    const { metadata, SHARED_OPEN_GRAPH } = await layoutMetadataFor("production");
    expect(metadata).not.toHaveProperty("description");
    expect(metadata).not.toHaveProperty("alternates");
    expect(metadata.openGraph).toEqual(SHARED_OPEN_GRAPH);
    expect(metadata.twitter).toEqual({ card: "summary_large_image" });
  });

  it("marks every preview page noindex", async () => {
    const { metadata } = await layoutMetadataFor("preview");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("adds no robots tag in production", async () => {
    const { metadata } = await layoutMetadataFor("production");
    expect(metadata.robots).toBeUndefined();
  });

  it("builds page URLs on the domain from NEXT_PUBLIC_SITE_URL", async () => {
    const { metadata } = await layoutMetadataFor("production", "https://example.com");
    expect(metadata.metadataBase).toEqual(new URL("https://example.com"));
  });
});
