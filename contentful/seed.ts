// Creates and publishes the landing pageCopy entry from the default copy in this repo.
// Usage: npm run contentful:seed
// It only creates entries that do not exist, so it never overwrites an edit made
// in Contentful.
//
// The legal documents were seeded once, on 2026-11-19, from lib/legal.ts (see git
// history). Contentful is now their only home. See docs/adr/0001-contentful-content.md.
import { DEFAULT_LANDING_COPY } from "../lib/content";

const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN } = process.env;
if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
  throw new Error("Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN in .env.local.");
}

const BASE = `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries`;
const HEADERS = {
  Authorization: `Bearer ${CONTENTFUL_MANAGEMENT_TOKEN}`,
  "Content-Type": "application/vnd.contentful.management.v1+json",
};

const localized = (fields: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, { "en-US": value }]));

async function seedEntry(id: string, contentType: string, fields: Record<string, unknown>) {
  const existing = await fetch(`${BASE}/${id}`, { headers: HEADERS });
  if (existing.ok) {
    console.log(`${id}: exists, skipped.`);
    return;
  }
  if (existing.status !== 404) throw new Error(`${id}: read failed, HTTP ${existing.status}`);

  const created = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { ...HEADERS, "X-Contentful-Content-Type": contentType },
    body: JSON.stringify({ fields: localized(fields) }),
  });
  if (!created.ok) throw new Error(`${id}: create failed, ${await created.text()}`);
  const { sys } = (await created.json()) as { sys: { version: number } };

  const published = await fetch(`${BASE}/${id}/published`, {
    method: "PUT",
    headers: { ...HEADERS, "X-Contentful-Version": String(sys.version) },
  });
  if (!published.ok) throw new Error(`${id}: publish failed, ${await published.text()}`);
  console.log(`${id}: created and published.`);
}

async function main() {
  await seedEntry("landing", "pageCopy", { pageKey: "landing", copy: DEFAULT_LANDING_COPY });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
