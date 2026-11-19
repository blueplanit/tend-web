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

### 3. An invalid publish keeps the last good copy

The webhook checks a published landing JSON against the schema. If the JSON fails, the webhook answers 422 and expires nothing. The site keeps the last good copy.

There is no preview. The webhook activity log in Contentful is the only place an editor sees a rejection.

### 4. Only a publish changes the site

The webhook ignores unpublish, archive and delete. A Founder cannot take down the landing page or a legal page from Contentful by mistake. To remove a page, change the code.

### 5. Fallbacks differ by page

- **Landing page:** on any failed or invalid read, it shows `lib/content.ts`. That copy stays cached for minutes only (`cacheLife("minutes")`), so the site reads Contentful again soon. `lib/content.ts` is not kept in sync with Contentful. Old marketing copy is harmless.
- **Legal pages:** no fallback. A failed read throws. Vercel keeps serving the last good page, and a fresh build fails loudly. Old legal text with an old date is worse than a failed build.

### 6. Contentful history is the only legal record

Legal text is no longer in git. Contentful's version history records each change. We chose not to export the entries back into git.

### 7. Differences from asv2-web ADR-0003

- This repo uses `"use cache"`, `cacheTag` and `cacheLife`, not `unstable_cache`. `cacheComponents` is on for the whole app.
- The backstop window is the `contentful` cache profile in `next.config.ts`: revalidate after 7 days. **This is not a bug.** It only matters when a webhook fails.
- The webhook waits up to 8 seconds, not 15, for the Delivery API to serve the change. It answers 503 on a timeout, and Contentful retries.
- Reads use `fetch`, not the Contentful SDK.

## Consequences

- An editor sees a bad landing JSON only in the webhook activity log. Read the log after a large edit.
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
