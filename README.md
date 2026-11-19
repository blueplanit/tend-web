# tend-web

The landing page for Tend, a Blue Planit LLC app. Jira story: BP-1351.

Marketing rules, terms and the brand kit live in the `tend-marketing` repo.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
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

Edit the entry in Contentful and publish it. The webhook expires that page's cache at once. The next visit rebuilds the page with the new copy. There is no preview. Check the JSON before you publish.

- **Landing page:** the `landing` entry of the Page copy type. Keep the keys and the shape. The webhook rejects JSON that fails the schema in `lib/landing-copy.ts`. The site then keeps the last good copy. Contentful shows the rejection under Settings → Webhooks → Activity log: 422 for an invalid publish, 409 when a later invalid publish overtook a valid one.
- **Privacy policy and terms of use:** the Legal document entries. Change "Last updated" for a real policy change only, not for a typo fix.

A new page section or a new field needs a code change and a deploy.

## Change the content model

Add a numbered file to `contentful/migrations/`, then run it once:

```bash
npm run contentful:migrate -- contentful/migrations/003-example.cjs
```

Contentful does not record which migrations ran. Do not run a file twice.
