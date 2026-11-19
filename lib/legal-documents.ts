import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import {
  CONTENTFUL_CACHE_PROFILE,
  CONTENT_TYPES,
  contentTag,
  findEntry,
} from "./contentful/delivery";

// The privacy policy and the terms of use live in Contentful legalDocument entries.
// Contentful's version history is their only record. There is no fallback copy:
// a failed read throws, so the site keeps serving the last good page and a fresh
// build fails loudly. See docs/adr/0001-contentful-content.md.

export const LEGAL_SLUGS = ["privacy", "terms"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

const text = z.string().trim().min(1);

export const legalDocumentSchema = z.object({
  slug: z.enum(LEGAL_SLUGS),
  title: text,
  description: text,
  // Contentful stores a date-only field as YYYY-MM-DD. Older values can carry a time.
  lastUpdated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/)
    .transform((value) => value.slice(0, 10)),
  body: text, // Markdown
});

export type LegalDocument = z.infer<typeof legalDocumentSchema>;

export function legalTag(slug: string) {
  return contentTag(CONTENT_TYPES.legalDocument, slug);
}

export async function getLegalDocument(slug: LegalSlug): Promise<LegalDocument> {
  "use cache";
  cacheTag(legalTag(slug));
  cacheLife(CONTENTFUL_CACHE_PROFILE);

  const entry = await findEntry(CONTENT_TYPES.legalDocument, "slug", slug);
  if (!entry) throw new Error(`No published legalDocument entry "${slug}".`);
  return legalDocumentSchema.parse(entry.fields);
}
