// Reads published entries from the Contentful Delivery API (CDA) with plain fetch.
// The callers cache each read with "use cache". See docs/adr/0001-contentful-content.md
// and asv2-web docs/adr/0003-contentful-delivery-quota.md for the caching design.

export const CONTENT_TYPES = {
  pageCopy: "pageCopy",
  legalDocument: "legalDocument",
} as const;

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

// The cacheLife profile for Contentful reads (next.config.ts). The webhook delivers
// content in seconds. This window only catches a webhook that failed.
export const CONTENTFUL_CACHE_PROFILE = "contentful";

const LOCALE = "en-US";

// One tag per entry. The webhook expires the tag of the entry that changed.
export function contentTag(contentType: ContentType, key: string) {
  return `contentful:${contentType}:${key}`;
}

export type DeliveredEntry = {
  id: string;
  updatedAt: string;
  fields: Record<string, unknown>;
};

type CdaEntry = {
  sys: { id: string; updatedAt: string };
  fields: Record<string, unknown>;
};

function config() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;
  if (!spaceId || !token) {
    throw new Error("Set CONTENTFUL_SPACE_ID and CONTENTFUL_DELIVERY_TOKEN.");
  }
  return { spaceId, token };
}

async function cdaGet(path: string, params: Record<string, string> = {}) {
  const { spaceId, token } = config();
  const url = new URL(
    `https://cdn.contentful.com/spaces/${spaceId}/environments/master${path}`,
  );
  url.searchParams.set("locale", LOCALE);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}

function toEntry(item: CdaEntry): DeliveredEntry {
  return { id: item.sys.id, updatedAt: item.sys.updatedAt, fields: item.fields };
}

// Returns the one published entry of a content type whose field has the value, or null.
export async function findEntry(
  contentType: ContentType,
  field: string,
  value: string,
): Promise<DeliveredEntry | null> {
  const response = await cdaGet("/entries", {
    content_type: contentType,
    [`fields.${field}`]: value,
    limit: "1",
  });
  if (!response.ok) {
    throw new Error(`Contentful ${contentType} read failed: HTTP ${response.status}`);
  }
  const body = (await response.json()) as { items: CdaEntry[] };
  return body.items[0] ? toEntry(body.items[0]) : null;
}

// Returns the published entry, or null when the Delivery API does not serve it.
export async function getEntry(entryId: string): Promise<DeliveredEntry | null> {
  const response = await cdaGet(`/entries/${encodeURIComponent(entryId)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Contentful entry ${entryId} read failed: HTTP ${response.status}`);
  }
  return toEntry((await response.json()) as CdaEntry);
}
