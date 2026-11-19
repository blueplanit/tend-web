import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import {
  CONTENTFUL_CACHE_PROFILE,
  CONTENT_TYPES,
  contentTag,
  findEntry,
  type EntryLookup,
} from "./contentful/delivery";
import { DEFAULT_LANDING_COPY } from "./content";

// The landing page copy lives in the Contentful pageCopy entry "landing", as JSON.
// This schema is the contract for that JSON. The webhook expires nothing for a
// publish that fails it. The site keeps its cached copy until the next rebuild.
// See docs/adr/0001-contentful-content.md, Consequences.

const text = z.string().trim().min(1);

export const PIPPY_MOODS = ["content", "idle", "bored", "dozing"] as const;
export const APP_SCREENS = ["garden", "widget", "calendar", "check-in"] as const;

const faqSchema = z.strictObject({ question: text, answer: text });

export const landingCopySchema = z.strictObject({
  meta: z.strictObject({ title: text, description: text }),
  nav: z.array(z.strictObject({ label: text, href: text })),
  hero: z.strictObject({
    eyebrow: text,
    headline: text,
    subhead: text,
    mediaLabel: text,
  }),
  howItWorks: z.strictObject({
    heading: text,
    steps: z.array(z.strictObject({ title: text, body: text })).min(1),
  }),
  meetPippy: z.strictObject({
    heading: text,
    intro: text,
    // Each mood key picks its image in public/pippy/.
    moods: z.array(z.strictObject({ key: z.enum(PIPPY_MOODS), name: text, body: text })),
    quote: text,
  }),
  insideTheApp: z.strictObject({
    heading: text,
    // Each screen key picks its image in public/app-screens/.
    screens: z.array(
      z.strictObject({ key: z.enum(APP_SCREENS), title: text, body: text, alt: text }),
    ),
    note: text,
  }),
  whoFor: z.strictObject({ heading: text, points: z.array(text).min(1) }),
  beta: z.strictObject({
    heading: text,
    body: text,
    feedback: text,
    comingSoonNotice: text,
  }),
  faq: z.strictObject({ heading: text, items: z.array(faqSchema).min(1) }),
  footer: z.strictObject({ disclaimer: text }),
});

export type LandingCopy = z.infer<typeof landingCopySchema>;
export type Faq = z.infer<typeof faqSchema>;

export const LANDING_PAGE_KEY = "landing";
export const LANDING_TAG = contentTag(CONTENT_TYPES.pageCopy, LANDING_PAGE_KEY);
export const LANDING_LOOKUP: EntryLookup = {
  contentType: CONTENT_TYPES.pageCopy,
  field: "pageKey",
  value: LANDING_PAGE_KEY,
};

// Reads the landing copy from Contentful. On any failure it returns the default copy
// and caches that for minutes only, so the site picks up Contentful again soon.
export async function getLandingCopy(): Promise<LandingCopy> {
  "use cache";
  cacheTag(LANDING_TAG);

  try {
    const entry = await findEntry(LANDING_LOOKUP);
    if (!entry) throw new Error(`No published pageCopy entry "${LANDING_PAGE_KEY}".`);

    const parsed = landingCopySchema.safeParse(entry.fields.copy);
    if (!parsed.success) {
      throw new Error(`The landing copy JSON is invalid:\n${z.prettifyError(parsed.error)}`);
    }

    cacheLife(CONTENTFUL_CACHE_PROFILE);
    return parsed.data;
  } catch (error) {
    console.error("getLandingCopy: using the default copy.", error);
    cacheLife("minutes");
    return DEFAULT_LANDING_COPY;
  }
}
