import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LANDING_COPY } from "./content";
import { getLandingCopy, type LandingCopy } from "./landing-copy";

// The reader runs outside Next.js here, so the cache functions do nothing.
vi.mock("next/cache", () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }));

// The Delivery API is faked at the HTTP level: each test answers fetch itself.
function deliveryApiServes(entries: unknown[], status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ items: entries }, { status })),
  );
}

function landingEntry(copy: unknown) {
  return {
    sys: { id: "landing", updatedAt: "2026-11-19T10:00:00Z" },
    fields: { pageKey: "landing", copy },
  };
}

// A known-good copy that differs from the default copy, so a test can tell them apart.
const CONTENTFUL_COPY: LandingCopy = {
  ...DEFAULT_LANDING_COPY,
  hero: { ...DEFAULT_LANDING_COPY.hero, headline: "A headline from Contentful" },
};

beforeEach(() => {
  vi.stubEnv("CONTENTFUL_SPACE_ID", "space");
  vi.stubEnv("CONTENTFUL_DELIVERY_TOKEN", "token");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getLandingCopy", () => {
  it("returns the Contentful copy, with source contentful, for a valid entry", async () => {
    deliveryApiServes([landingEntry(CONTENTFUL_COPY)]);

    const result = await getLandingCopy();

    expect(result.source).toBe("contentful");
    expect(result.copy.hero.headline).toBe("A headline from Contentful");
  });

  it("returns the default copy, with source default, when no entry is published", async () => {
    deliveryApiServes([]);

    const result = await getLandingCopy();

    expect(result.source).toBe("default");
    expect(result.copy).toEqual(DEFAULT_LANDING_COPY);
  });

  it("returns the default copy, with source default, when the Delivery API answers an HTTP error", async () => {
    // A valid entry in the body proves the reader rejects the status, not the body.
    deliveryApiServes([landingEntry(CONTENTFUL_COPY)], 500);

    const result = await getLandingCopy();

    expect(result.source).toBe("default");
    expect(result.copy).toEqual(DEFAULT_LANDING_COPY);
  });

  it("returns the default copy, with source default, when the landing JSON is invalid", async () => {
    deliveryApiServes([landingEntry({ ...CONTENTFUL_COPY, hero: undefined })]);

    const result = await getLandingCopy();

    expect(result.source).toBe("default");
    expect(result.copy).toEqual(DEFAULT_LANDING_COPY);
  });

  // Real time: the read limit is 10 seconds, and AbortSignal.timeout ignores fake timers.
  it(
    "returns the default copy, with source default, when the read stalls past the read limit",
    async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(
          (_url: URL, init?: RequestInit) =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
            }),
        ),
      );

      const result = await getLandingCopy();

      expect(result.source).toBe("default");
      expect(result.copy).toEqual(DEFAULT_LANDING_COPY);
    },
    15_000,
  );
});
