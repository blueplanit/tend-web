import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import {
  CONTENT_TYPES,
  findEntry,
  type DeliveredEntry,
  type EntryLookup,
} from "@/lib/contentful/delivery";
import {
  LANDING_LOOKUP,
  LANDING_PAGE_KEY,
  LANDING_TAG,
  landingCopySchema,
} from "@/lib/landing-copy";
import { legalDocumentSchema, legalLookup, legalTag } from "@/lib/legal-documents";

// The Contentful webhook calls this route when an entry is published.
// It confirms the Delivery API serves the new version and that the served version
// is valid. Then it expires that entry's cache tag at once, so the next visit
// rebuilds the page with the new copy.
//
// Only "publish" expires a tag. Unpublish, archive and delete are ignored, so the
// site keeps its cached copy and never loses a page. Invalid content expires
// nothing: 422 when the published content is invalid, 409 when the served version is.
// See docs/adr/0001-contentful-content.md and asv2-web docs/adr/0003.

const SECRET_HEADER = "x-revalidate-secret";
const TOPIC_HEADER = "x-contentful-topic";
const PUBLISH_TOPIC = "ContentManagement.Entry.publish";
const LOCALE = "en-US";

// Contentful accepts a publish before its Delivery API serves it. A visit inside
// that lag would refill the cache with the old version for the whole backstop window.
const CONFIRM_TIMEOUT_MS = 8000;
const CONFIRM_POLL_MS = 1000;

const payloadSchema = z.object({
  sys: z.object({
    id: z.string(),
    updatedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Not a date."),
    contentType: z.object({ sys: z.object({ id: z.string() }) }),
  }),
  fields: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
});

// A valid entry names the cache tag it expires and the lookup its page reader uses.
type Target = { tag: string; lookup: EntryLookup } | { ignore: string } | { reject: string };

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Invalid secret." }, { status: 401 });
  }

  const topic = request.headers.get(TOPIC_HEADER);
  if (topic !== PUBLISH_TOPIC) {
    return ignored(`Topic "${topic}" changes nothing on the site.`);
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "The payload is not a Contentful entry." }, { status: 400 });
  }
  const { sys, fields } = parsed.data;
  const contentType = sys.contentType.sys.id;

  // The webhook payload holds one value per locale. Read the site's locale.
  const published = resolveTarget(
    contentType,
    Object.fromEntries(Object.entries(fields).map(([name, value]) => [name, value[LOCALE]])),
  );
  if ("ignore" in published) return ignored(published.ignore);
  if ("reject" in published) {
    console.error(`Revalidate rejected ${sys.id}:`, published.reject);
    return Response.json({ error: published.reject }, { status: 422 });
  }

  // 503 lets Contentful retry. The cache stays as it is until the change is served.
  const delivered = await waitForVersion(published.lookup, sys.updatedAt);
  if (!delivered) {
    return Response.json(
      { error: `The Delivery API did not serve the change within ${CONFIRM_TIMEOUT_MS / 1000} seconds.` },
      { status: 503 },
    );
  }

  // A later publish can overtake this one. Check the version the site will read,
  // so an invalid later publish never replaces the cached good copy.
  const served = resolveTarget(contentType, delivered.fields);
  if ("ignore" in served) return ignored(served.ignore);
  if ("reject" in served) {
    console.error(`Revalidate found an invalid served version of ${sys.id}:`, served.reject);
    return Response.json(
      { error: `The Delivery API serves a newer version that is invalid. Nothing expired.\n${served.reject}` },
      { status: 409 },
    );
  }

  revalidateTag(served.tag, { expire: 0 });
  return Response.json({ revalidated: true, tag: served.tag });
}

function isAuthorized(request: Request) {
  const expected = process.env.CONTENTFUL_REVALIDATE_SECRET;
  const given = request.headers.get(SECRET_HEADER);
  if (!expected || !given) return false;
  const givenBytes = Buffer.from(given);
  const expectedBytes = Buffer.from(expected);
  return givenBytes.length === expectedBytes.length && timingSafeEqual(givenBytes, expectedBytes);
}

// Names the cache tag that a version of an entry expires, or why it expires nothing.
// `fields` holds one value per field, for the site's locale.
function resolveTarget(contentType: string, fields: Record<string, unknown>): Target {
  if (contentType === CONTENT_TYPES.pageCopy) {
    if (fields.pageKey !== LANDING_PAGE_KEY) {
      return { ignore: "This pageCopy entry is not used by a page." };
    }
    const copy = landingCopySchema.safeParse(fields.copy);
    if (!copy.success) {
      return { reject: `The landing copy JSON is invalid:\n${z.prettifyError(copy.error)}` };
    }
    return { tag: LANDING_TAG, lookup: LANDING_LOOKUP };
  }

  if (contentType === CONTENT_TYPES.legalDocument) {
    const doc = legalDocumentSchema.safeParse(fields);
    if (!doc.success) {
      return { reject: `The legal document is invalid:\n${z.prettifyError(doc.error)}` };
    }
    return { tag: legalTag(doc.data.slug), lookup: legalLookup(doc.data.slug) };
  }

  return { ignore: `No page reads content type "${contentType}".` };
}

// Polls the Delivery API until it serves a version no older than the published one.
// It uses the page reader's lookup, so it checks the URL that the page reads.
// Each request gets the time left before the deadline, so a stalled request
// cannot hold the webhook past CONFIRM_TIMEOUT_MS.
async function waitForVersion(
  lookup: EntryLookup,
  updatedAt: string,
): Promise<DeliveredEntry | null> {
  const expected = Date.parse(updatedAt);
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;

  for (;;) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return null;

    const entry = await findEntry(lookup, AbortSignal.timeout(remaining)).catch((error) => {
      console.error(`Revalidate could not read ${lookup.contentType} "${lookup.value}":`, error);
      return null;
    });
    if (entry && Date.parse(entry.updatedAt) >= expected) return entry;

    const wait = Math.min(CONFIRM_POLL_MS, deadline - Date.now());
    if (wait <= 0) return null;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

function ignored(reason: string) {
  return Response.json({ revalidated: false, reason });
}
