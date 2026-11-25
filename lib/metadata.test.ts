import { describe, expect, it } from "vitest";
import { deploymentEnv, importWithEnv } from "./test-utils/import-with-env";

function loadFor(vercelEnv: string) {
  return importWithEnv(deploymentEnv(vercelEnv), () => import("./metadata"));
}

describe("NON_PRODUCTION_NOINDEX", () => {
  it("adds no robots tag in production", async () => {
    expect((await loadFor("production")).NON_PRODUCTION_NOINDEX).toBeUndefined();
  });

  it("marks preview pages noindex", async () => {
    expect((await loadFor("preview")).NON_PRODUCTION_NOINDEX).toEqual({ index: false, follow: false });
  });

  it("marks local pages noindex", async () => {
    expect((await loadFor("")).NON_PRODUCTION_NOINDEX).toEqual({ index: false, follow: false });
  });
});

describe("pageMetadata", () => {
  it("sets the title, description, canonical URL and Open Graph fields of one page", async () => {
    const { pageMetadata, SHARED_OPEN_GRAPH } = await loadFor("production");
    expect(pageMetadata({ path: "/terms", title: "Terms of use", description: "The rules." })).toEqual({
      title: "Terms of use",
      description: "The rules.",
      alternates: { canonical: "/terms" },
      openGraph: { ...SHARED_OPEN_GRAPH, url: "/terms", title: "Terms of use", description: "The rules." },
    });
  });
});
