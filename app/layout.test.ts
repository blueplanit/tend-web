import { describe, expect, it, vi } from "vitest";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";
import { generateMetadata } from "./layout";

// next/font runs at build time only. The test needs only a class name.
vi.mock("next/font/local", () => ({ default: () => ({ variable: "font" }) }));
vi.mock("@/lib/landing-copy", () => ({
  getLandingCopy: async () => ({
    copy: { meta: { title: "Home title", description: "Home description" } },
    source: "default",
  }),
}));

// Each page inherits every layout field that it does not set.
// So a layout field that belongs to the homepage carries to every new page.
describe("root layout metadata", () => {
  it("sets no description, canonical URL or page Open Graph fields", async () => {
    const metadata = await generateMetadata();
    expect(metadata).not.toHaveProperty("description");
    expect(metadata).not.toHaveProperty("alternates");
    expect(metadata.openGraph).toEqual(SHARED_OPEN_GRAPH);
    expect(metadata.twitter).toEqual({ card: "summary_large_image" });
  });
});
