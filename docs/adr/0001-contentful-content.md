# ADR-0001: Page copy and legal text come from Contentful

**Status:** Accepted
**Date:** 2026-11-19
**Jira:** BP-1351

## Context

The Founders want to change the landing page copy, the privacy policy and the terms of use without a deploy. The Founders are engineers. Blog posts come later and get their own content types.

The space is TendApp, on the Contentful free plan. It serves this site only, so it has its own Delivery API quota.

asv2-web ADR-0003 sets the caching design for Contentful reads in our other sites. This ADR uses that design and records only what differs.

## Decisions

### 1. Landing copy is one JSON entry. Legal text is Markdown.

The `pageCopy` content type holds the landing copy as one JSON object. Its shape matches `LandingCopy` in `lib/landing-copy.ts`, and zod checks it. The page layout lives in code, so a new section needs a deploy with any content model. Field-level structure in Contentful would add little.

The `legalDocument` content type holds the privacy policy and the terms of use. Its body is Markdown. The legal text is about 8,000 characters of prose. As JSON strings, it would need escapes and no line breaks.

### 2. Content types are code

Migration files in `contentful/migrations/` define each content type. The model is then reviewed in git, and blog types follow the same path.

### 3. An invalid publish expires nothing

The webhook checks a published entry against its schema: the landing JSON or a legal document. If the entry fails, the webhook answers 422 and expires nothing. The site keeps its cached copy until the next rebuild. See Consequences.

The webhook also checks the version that the Delivery API serves. A later invalid publish can overtake a valid one while the webhook waits. The webhook then answers 409 and expires nothing.

There is no preview. The webhook activity log in Contentful is the only place a Founder sees a rejection.

### 4. Only a publish changes the site

The webhook ignores unpublish, archive and delete. These pages always need their entry. No removal is a valid edit. To remove a page, change the code.

Ignoring a removal only delays its effect. Contentful then serves no entry, not an earlier version. At the next rebuild, the landing page shows the default copy, and a legal page fails the build. A failed build blocks every deploy until the entry is published again. The README tells a Founder never to unpublish or delete these entries.

Expiring the cache on a removal makes this worse. `{ expire: 0 }` serves no stale page. A legal page then fails on the next visit.

### 5. Only the landing page has a default copy

- **Landing page:** on any failed or invalid read, it shows the default copy in `lib/content.ts`. That copy stays cached for minutes only (`cacheLife("minutes")`), so the site reads Contentful again soon. `lib/content.ts` is not kept in sync with Contentful. Old marketing copy is harmless.
- **Legal pages:** no default copy. A failed read throws. Vercel keeps serving the last good page, and a fresh build fails loudly. Old legal text with an old date is worse than a failed build.

### 6. Contentful history is the only legal record

Legal text is no longer in git. Contentful's version history records each change. We chose not to export the entries back into git.

### 7. Differences from asv2-web ADR-0003

- This repo uses `"use cache"`, `cacheTag` and `cacheLife`, not `unstable_cache`. `cacheComponents` is on for the whole app.
- The backstop window is the `contentful` cache profile in `next.config.ts`: revalidate after 7 days. **This is not a bug.** It only matters when a webhook fails.
- The webhook waits up to 8 seconds, not 15, for the Delivery API to serve the change. Each request gets the time left before that deadline. A timeout gets 503, and Contentful retries.
- The webhook polls with the page reader's own query, not the entry ID. Contentful's CDN can cache two URLs apart, so the webhook checks the URL that the page reads.
- A page read stops after 10 seconds. The landing page then uses the default copy, and a legal page throws.
- The webhook calls `revalidateTag(tag, { expire: 0 })`, not `"max"`. With `"max"`, the first visit after a publish gets the old page. The webhook has already confirmed the new version, so no visitor needs the old page.
- Reads use `fetch`, not the Contentful SDK.
- **The default landing copy is cached, for minutes.** ADR-0003 decision 7 says a failure is never cached. Here the page output caches whatever the reader returns, so the default copy is cached too. A short `cacheLife("minutes")` makes the site read Contentful again within about a minute.
- **One cache tag per entry.** ADR-0003 decision 1 adds a tag per content type. Each page here reads one known entry, and no page lists entries, so a type tag expires nothing extra. The blog adds a type tag when it adds a listing.
- **No expiry by path.** ADR-0003 decision 2 also expires each rendered route by path, for metadata routes such as the sitemap. No metadata route here reads Contentful, so the tag reaches every page that uses the entry.

## Consequences

- A Founder sees a rejected entry in the webhook activity log. Nothing alerts the Founder until a rebuild reads the rejected entry.
- Each page states its copy source in a meta tag: `tend-copy-source` is `contentful` or `default`. An UptimeRobot keyword monitor reads the homepage every 5 minutes. It emails a Founder when the homepage shows `content="default"`. It sees only what the cached page holds. It cannot see an invalid entry that no rebuild has read yet.
- A rejected entry stays the published version. The site keeps its cached copy only until the next rebuild: a deploy, the backstop, or another expiry. That rebuild reads the invalid entry. The landing page shows the default copy, and a legal page fails the build. We accept this limit. The README rule tells a Founder to act at once: fix and republish the entry, or restore its last good version and publish that. To remove the limit, store the last approved copy outside Contentful, for example in Vercel Blob.
- A change to the landing JSON shape needs a code change first. Deploy the code, then publish the new shape. In the other order, the webhook rejects the publish.
- Each deploy reads each entry again. That costs 3 Delivery API calls per deploy.
- A broken webhook is invisible for up to 7 days.

## What the legal text assumes

These notes moved from `lib/legal.ts` when the text moved to Contentful. They come from the Founder grilling on 2026-11-19.

- Written as if Tend has launched. No mention of a beta.
- US residents aged 18 or older. Florida law. No arbitration clause.
- Third parties are named by category. Google Analytics is named because its terms require it.
- App facts assumed until the app confirms them: Apple and Google sign-in, email is the only sign-in data kept, debts and payments stored on our servers, push notifications, app analytics, and an in-app account deletion button.
- No lawyer has reviewed the text yet.
- Change "Last updated" for a real policy change. Tell users before a material change.
