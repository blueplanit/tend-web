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
| `lib/content.ts` | All page copy. Contentful replaces it later. |
| `lib/site.ts` | Site URL, feedback email and the beta install links |
| `components/landing/` | Page sections and the beta buttons |
| `lib/analytics/` | Amplitude, GA4 and UTM pass-through to Google Play |
| `components/structured-data.tsx` | JSON-LD for search engines and AI assistants |
| `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` | SEO files |
| `public/pippy/`, `public/screens/` | Brand kit assets |
| `app/fonts/` | Fredoka and Nunito, stored so a build needs no network |

## Environment variables

Set these in Vercel. Each one is optional. A missing key turns its feature off.

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_AMPLITUDE_API_KEY` | Amplitude project key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID, `G-…` |
| `NEXT_PUBLIC_SITE_URL` | The final domain. The default is the Vercel URL. |

Analytics and indexing run on the production deployment only. The site reads `VERCEL_ENV` and `NEXT_PUBLIC_VERCEL_ENV` to know this. Keep "Automatically expose System Environment Variables" on in Vercel.

## Events

| Amplitude | GA4 | Properties |
|---|---|---|
| `[Amplitude] Page Viewed` | `page_view` | UTM parameters and referrer, captured automatically |
| `Beta Button Clicked` | `beta_button_click` | `platform`, `location`, `available` |

A click on a "Coming soon" button sends `available: false`. That measures demand for each platform before the beta opens.

## Add a beta link

Paste the link into `BETA_LINKS` in `lib/site.ts`. The button then links to the store. An Android link also carries the visit's UTM parameters as the Play `referrer`.
