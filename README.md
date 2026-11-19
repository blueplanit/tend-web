# tend-web

The landing page for Tend, a Blue Planit LLC app. Jira story: BP-1351.

Marketing rules, terms and the brand kit live in the `tend-marketing` repo.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npm test         # Vitest
```

## Where things are

| Path | Holds |
|---|---|
| Contentful space TendApp | The live copy: the `landing` Page copy entry (JSON), and the `privacy` and `terms` Legal document entries (Markdown) |
| `lib/landing-copy.ts`, `lib/legal-documents.ts` | Contentful reads, and the schema each entry must pass |
| `lib/content.ts` | Default landing copy. The site shows it only when Contentful fails. |
| `app/api/revalidate/route.ts` | The Contentful webhook. A publish reaches the site in seconds. |
| `contentful/` | Content model migrations and the seed script |
| `lib/site.ts` | Site URL, feedback email and the beta install links |
| `components/landing/` | Page sections and the beta buttons |
| `lib/analytics/` | Amplitude, GA4 and UTM pass-through to Google Play |
| `components/structured-data.tsx` | JSON-LD for search engines and AI assistants |
| `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` | SEO files |
| `public/pippy/`, `public/app-screens/` | Brand kit assets. Give a changed image a new path, so no cache serves the old one. |
| `app/fonts/` | Fredoka and Nunito, stored so a build needs no network |

## Environment variables

Contentful:

| Variable | Where | Use | When it is missing |
|---|---|---|---|
| `CONTENTFUL_SPACE_ID` | Vercel Production and Preview, `.env.local` | The TendApp space ID | The landing page shows the default copy. The legal pages fail the build. |
| `CONTENTFUL_DELIVERY_TOKEN` | Vercel Production and Preview, `.env.local` | Delivery API token, from Settings → API keys | The same as `CONTENTFUL_SPACE_ID` |
| `CONTENTFUL_REVALIDATE_SECRET` | Vercel Production, `.env.local` | The webhook sends it in the `x-revalidate-secret` header. | The webhook answers 401. A publish reaches the site only after the 7-day backstop. |
| `CONTENTFUL_MANAGEMENT_TOKEN` | `.env.local` only. Never in Vercel. | Personal management token for the `contentful:*` scripts | The scripts stop. The site is not affected. |

Analytics and site URL, in Vercel. Each one is optional. A missing key turns its feature off.

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_AMPLITUDE_API_KEY` | Amplitude project key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID, `G-…` |
| `NEXT_PUBLIC_SITE_URL` | The final domain. The default is the Vercel URL. |
| `NEXT_PUBLIC_ANALYTICS_LOCAL` | `true` turns analytics on locally, for a test. Set it in `.env.local` only, never in Vercel. GA4 then runs in debug mode. |

Analytics and indexing run on the production deployment only. The site reads `VERCEL_ENV` and `NEXT_PUBLIC_VERCEL_ENV` to know this. Keep "Automatically expose System Environment Variables" on in Vercel.

## Events

| Amplitude | GA4 | Properties |
|---|---|---|
| `[Amplitude] Page Viewed` | `page_view` | UTM parameters and referrer, captured automatically |
| `Beta Button Clicked` | `beta_button_click` | `platform`, `location`, `available` |

A click on a "Coming soon" button sends `available: false`. That measures demand for each platform before the beta opens.

## Add a beta link

Paste the link into `BETA_LINKS` in `lib/site.ts`. The button then links to the store. An Android link also carries the visit's UTM parameters as the Play `referrer`.

## Edit copy

Edit the entry in Contentful and publish it. The webhook expires the cache of each page that shows the entry. The next visit rebuilds the page with the new copy. There is no preview. Check the entry before you publish.

- **Landing page:** the `landing` entry of the Page copy type. Keep the keys and the shape. The JSON must pass the schema in `lib/landing-copy.ts`. The landing copy also feeds the page titles, the header and the footer on every page.
- **Privacy policy and terms of use:** the Legal document entries. Change "Last updated" for a real policy change only, not for a typo fix.

A new page section or a new field needs a code change and a deploy.

### After you publish

Contentful always accepts the publish. The webhook decides if the site uses it.

1. Reload the live site. A valid publish shows on the next page load.
2. If your change is not there, open Settings → Webhooks → "tend-web revalidate (production)" → Activity log.
3. Open the newest call. Its response body names the error.
4. Do one of these at once:
   - Fix the entry and publish it again.
   - Restore the last good version. Open the entry's Versions sidebar, restore the last good version, and publish it.

**Never unpublish or delete the `landing` entry or a Legal document entry.** Contentful then serves no entry at all, not an earlier version. The webhook ignores the change. The site looks fine until the next rebuild. Then the landing page shows the default copy. A legal page then blocks every deploy. A deleted entry also loses its version history.

| Status | Response body | Meaning |
|---|---|---|
| 200 | `"revalidated": true` | The site uses the new copy. |
| 200 | `"revalidated": false` | The change does not affect the site, for example an entry no page reads. |
| 422 | `"error": …` | The published entry is invalid: landing JSON or a legal document. The site keeps its cached copy. |
| 409 | `"error": …` | A later, invalid publish replaced a valid one. The site keeps its cached copy. |
| 400 | `"error": …` | The call is not a Contentful entry. Check the webhook settings. |
| 401 | `"error": …` | The secret in Vercel and the webhook differ. |
| 503 | `"error": …` | Contentful was slow. Contentful retries the call. |

**Why step 4 is urgent:** an invalid entry stays the published version. The site keeps its cached copy only until the next rebuild. A deploy or the 7-day backstop then reads the invalid entry. The landing page then shows the default copy from `lib/content.ts`. A legal page then fails the build, and Vercel keeps the last deploy. Nothing alerts a Founder to a 422 or 409.

## Change the content model

Add a file to `contentful/migrations/`. Give it the next free number, for example `006-add-field.cjs`. Then run it once:

```bash
npm run contentful:migrate -- contentful/migrations/006-add-field.cjs
```

Contentful does not record which migrations ran. Run each file once only.
