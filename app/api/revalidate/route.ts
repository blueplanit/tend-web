import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { CONTENT_TYPES, getEntry } from "@/lib/contentful/delivery";
import { LANDING_PAGE_KEY, LANDING_TAG, landingCopySchema } from "@/lib/landing-copy";
import { legalDocumentSchema, legalTag } from "@/lib/legal-documents";

// The Contentful webhook calls this route when an entry is published.
// It confirms the Delivery API serves the new version, then expires that entry's
// cache tag. Pages that read the entry rebuild on their next visit.
//
// Only "publish" expires a tag. Unpublish, archive and delete are ignored, so the
// site keeps the last good copy and never loses a page. An invalid landing copy JSON
// is rejected with 422 and expires nothing.
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
    updatedAt: z.string(),
    contentType: z.object({ sys: z.object({ id: z.string() }) }),
  }),
  fields: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
});

type Payload = z.infer<typeof payloadSchema>;

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
  const payload = parsed.data;

  const target = resolveTarget(payload);
  if ("ignore" in target) return ignored(target.ignore);
  if ("reject" in target) {
    console.error(`Revalidate rejected ${payload.sys.id}:`, target.reject);
    return Response.json({ error: target.reject }, { status: 422 });
  }

  // 503 lets Contentful retry. The cache stays as it is until the change is served.
  if (!(await isServed(payload.sys.id, payload.sys.updatedAt))) {
    return Response.json(
      { error: `The Delivery API did not serve the change within ${CONFIRM_TIMEOUT_MS / 1000} seconds.` },
      { status: 503 },
    );
  }

  revalidateTag(target.tag, "max");
  return Response.json({ revalidated: true, tag: target.tag });
}

function isAuthorized(request: Request) {
  const expected = process.env.CONTENTFUL_REVALIDATE_SECRET;
  const given = request.headers.get(SECRET_HEADER);
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function field(payload: Payload, name: string) {
  return payload.fields[name]?.[LOCALE];
}

// Names the cache tag that one publish expires, or why it expires nothing.
function resolveTarget(payload: Payload): { tag: string } | { ignore: string } | { reject: string } {
  const contentType = payload.sys.contentType.sys.id;

  if (contentType === CONTENT_TYPES.pageCopy) {
    if (field(payload, "pageKey") !== LANDING_PAGE_KEY) {
      return { ignore: "This pageCopy entry is not used by a page." };
    }
    const copy = landingCopySchema.safeParse(field(payload, "copy"));
    if (!copy.success) {
      return { reject: `The landing copy JSON is invalid:\n${z.prettifyError(copy.error)}` };
    }
    return { tag: LANDING_TAG };
  }

  if (contentType === CONTENT_TYPES.legalDocument) {
    const doc = legalDocumentSchema.safeParse(
      Object.fromEntries(Object.keys(payload.fields).map((name) => [name, field(payload, name)])),
    );
    if (!doc.success) {
      return { reject: `The legal document is invalid:\n${z.prettifyError(doc.error)}` };
    }
    return { tag: legalTag(doc.data.slug) };
  }

  return { ignore: `No page reads content type "${contentType}".` };
}

// Polls the Delivery API until it serves a version no older than the published one.
async function isServed(entryId: string, updatedAt: string) {
  const expected = new Date(updatedAt).getTime();
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;

  for (;;) {
    const entry = await getEntry(entryId).catch((error) => {
      console.error(`Revalidate could not read ${entryId}:`, error);
      return null;
    });
    if (entry && new Date(entry.updatedAt).getTime() >= expected) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, CONFIRM_POLL_MS));
  }
}

function ignored(reason: string) {
  return Response.json({ revalidated: false, reason });
}
