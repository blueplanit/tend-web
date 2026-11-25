# GA4 reporting

How to read website visits and store clicks in GA4, and what the numbers cannot tell you.
[README.md](../README.md) lists the events. [url-tags.md](url-tags.md) states how the website sets each touch.

## Access that a Founder needs

- **Vercel:** a member of the project who can edit environment variables.
- **GA4:** the Editor role or above on the property.
- **Amplitude:** access to the Tend project.

## Set up the property once

A Founder does these steps.

1. **Check the production configuration.** Vercel production needs `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_AMPLITUDE_API_KEY`. "Automatically expose System Environment Variables" must stay on.
   `NEXT_PUBLIC_GA_MEASUREMENT_ID` must match the measurement ID of the web stream, in Admin > Data streams. A wrong ID sends the events to another property.
2. **Turn off one page view setting.** Go to Admin > Data streams > the web stream > Enhanced measurement > Page views > Show advanced settings. Turn off "Page changes based on browser history events". The website sends its own `page_view` for each page change. With the setting on, GA4 counts each page change twice.
3. **Register the custom dimensions.** Go to Admin > Data display > Custom definitions > Create custom dimension. Set the scope to Event. Use the event parameter name as the dimension name. Register all 17 parameters in the table below.
4. **Keep local test traffic out of the reports.** A local test with `NEXT_PUBLIC_ANALYTICS_LOCAL=true` sends events to GA4 and Amplitude.
   - **GA4:** Go to Admin > Data filters > Create filter > Developer traffic. Set the filter to Active. Local tests send GA4 events in debug mode. This filter removes them.
   - **Amplitude:** Amplitude has no debug filter. In `.env.local`, set `NEXT_PUBLIC_AMPLITUDE_API_KEY` to the key of a separate test project. An empty key turns Amplitude off for local tests.
5. **Check delivery.** Open the production site. In GA4, open Reports > Realtime and look for `page_view`. Click a beta button. A button with a store link sends `store_click`. A "Coming soon" button sends `beta_button_click`. In Amplitude, look for the same events under their Amplitude names.

Do step 3 before launch. A new custom dimension shows data 24 to 48 hours after you create it. Google does not say that it shows events sent before you created it. So treat events before that date as missing from these dimensions.
Do step 4 before the first local test. An Active filter is permanent. It never removes events that GA4 already processed.

### Custom dimensions

| Event parameter | Events | What it holds |
|---|---|---|
| `first_source` | All | The Source of the first touch |
| `first_medium` | All | The medium of the first touch |
| `first_campaign` | All | The Campaign Code of the first touch, or `unlisted`. Missing when the touch has no `utm_campaign` |
| `first_content` | All | The `utm_content` of the first touch. Missing when the touch has none |
| `first_paid_status` | All | The paid status of the first touch: `paid`, `unpaid` or `unknown` |
| `first_landing_page` | All | The page path of the first touch |
| `latest_source` | All | The Source of the latest touch |
| `latest_medium` | All | The medium of the latest touch |
| `latest_campaign` | All | The Campaign Code of the latest touch, or `unlisted`. Missing when the touch has no `utm_campaign` |
| `latest_content` | All | The `utm_content` of the latest touch. Missing when the touch has none |
| `latest_paid_status` | All | The paid status of the latest touch |
| `latest_landing_page` | All | The page path of the latest touch |
| `current_page` | Clicks | The page path of the click |
| `platform` | Clicks | `android` or `ios` |
| `location` | Clicks | The button position: `hero` or `beta_section` |
| `destination` | `store_click` | The Destination: `play_store`, `testflight` or `app_store`. Missing when the link goes to another host |
| `available` | `beta_button_click` | Always `false`. The button had no link yet |

These are 17 of the 50 event-scoped custom dimensions that a standard property allows.

## Build the reports

Do not filter any report by hostname. The website moves to a permanent domain later. A hostname filter then hides the new data.

### Visits by landing page

Use the built-in report: Reports > Engagement > Landing page. Add the secondary dimension "Session source / medium". The metric is Sessions.
These are GA4's own definitions. [Read the numbers](#read-the-numbers) says how they differ from the touch fields.

### Page views by touch

This report uses our Source, not GA4 session source. Make a free-form exploration: Explore > Free form.

- **Rows:** `latest_landing_page`, `latest_source` and `latest_medium`.
- **Values:** Event count.
- **Filter:** Event name exactly matches `page_view`.

It counts page views, not sessions. One visit to three pages counts three times.

### Store clicks by touch

Make a free-form exploration: Explore > Free form.

- **Rows:** `latest_landing_page`, `latest_source` and `latest_medium`.
- **Columns:** `destination`.
- **Values:** Event count.
- **Filter:** Event name exactly matches `store_click`.

Then duplicate the exploration and change the rows to the `first_` fields.
The two tables answer different questions. The latest touch says what sent the visitor most recently before the click. The first touch says what sent the visitor first.

### Beta-button interest

Duplicate the store-click exploration. Change the filter to `beta_button_click`. Change the columns to `platform`.
A `beta_button_click` shows interest in a beta that has no link yet. Nobody left the site. Never add it to `store_click`.

GA4 enhanced measurement also sends a `click` event with `outbound` = `true` for each link to another site. A click on a store link therefore sends a `click` event too. Count store clicks with `store_click` only.

## Read the numbers

- **A session is not a touch.** GA4 starts a new session after 30 minutes without activity, by default. Its "Landing page" is the first page of each session. Our `first_landing_page` and `latest_landing_page` change only when a new touch arrives. So the landing-page totals differ between the two reports.
- **GA4 session source has its own rules.** "Session source / medium" comes from GA4's rules for each session. The touch fields come from the website's rules in [url-tags.md](url-tags.md). For example, an untagged return keeps the earlier touch on our side. Compare trends between the two, not totals.
- **`unknown` is not unpaid.** A touch is `unknown` when nothing proves its paid status. Report it apart from `unpaid`.
- **Data comes late.** Daily data is usually ready after about 12 hours. Processing can take 24 to 48 hours. Numbers can change in that time.
- **Small rows can hide.** GA4 can withhold rows to protect individual users. A wider date range often shows them.
- **Too many values fold into "(other)".** A dimension with more than about 500 values in one day can fold the rare values into an "(other)" row. Most of our values come from fixed lists. Referral sources, landing pages and `utm_content` can grow.
- **A GA4 user is a browser.** One person on two devices counts as two users. A person who clears cookies counts again.
- **Some visitors send nothing.** Ad blockers and privacy settings can stop GA4. All counts are a floor, not a total.
- **GA4 and Amplitude differ a little.** Both tools receive the same events. Each tool counts on its own.
- **Report totals only.** Do not match a GA4 row to a person. Do not join GA4 numbers to App Store or Google Play numbers person by person. [app-store-reporting.md](app-store-reporting.md) says how to compare them side by side.

## Outside GA4

- **Search queries, impressions and search clicks** come from Google Search Console. GA4 does not have them.
- **App Store downloads** are in App Store Connect. See [app-store-reporting.md](app-store-reporting.md).
- **Google Play installs** are in Play Console. It reads the latest touch from the install referrer.

## New pages

- A new page, such as an article, sends `page_view` and the touch fields with no extra code. The root layout loads analytics on every page.
- Only the `BetaButtons` component sends `beta_button_click` and `store_click`. Use it for each store link on a new page. A plain link sends no store click.
- Each new page sets its description, canonical URL and Open Graph fields with `pageMetadata` from `lib/metadata.ts`. `app/privacy/page.tsx` shows how. A page without it has no canonical URL.
- Do not set `robots` on a page. A page `robots` field replaces the `noindex` tag on previews and local runs.
- Add each new page to `app/sitemap.ts`.

## Previews and local runs

- Previews and local runs send no analytics. The website loads GA4 and Amplitude only when `VERCEL_ENV` is `production`. A local test with `NEXT_PUBLIC_ANALYTICS_LOCAL=true` is the one exception. Step 4 keeps it out of the reports.
- Each page on a preview or a local run carries a `noindex` tag. The robots.txt of a preview or a local run allows crawling. A crawler can then read the tag.
- Vercel Deployment Protection sends a visitor to a preview to the Vercel login. Vercel also sends `x-robots-tag: noindex` on previews. Keep Deployment Protection on.

## When the permanent domain arrives

1. Set `NEXT_PUBLIC_SITE_URL` to the domain in Vercel. Then redeploy. Canonical URLs, the sitemap and robots.txt then use the domain.
2. Change the web stream URL in GA4, in Admin > Data streams. The measurement ID stays the same.
3. Check each GA4 and Amplitude report and filter for the old hostname.
4. Add an annotation with the switch date in GA4 and in Amplitude.

Returning visitors count as new users after the switch. GA4 cookies and the saved touches in the browser do not move to a new domain. Their first touch starts again.
Search Console has its own steps for the switch.

## Sources

Read on 2026-11-25:

- [Create custom dimensions and metrics](https://support.google.com/analytics/answer/14239696)
- [About custom dimensions and metrics](https://support.google.com/analytics/answer/14240153)
- [Configuration limits](https://support.google.com/analytics/answer/12229528)
- [Enhanced measurement events](https://support.google.com/analytics/answer/9216061)
- [Filter out developer traffic](https://support.google.com/analytics/answer/13296662)
- [Free-form exploration](https://support.google.com/analytics/answer/9327972)
- [Landing page report](https://support.google.com/analytics/answer/12931766)
- [Data freshness](https://support.google.com/analytics/answer/11198161)
- [About data thresholds](https://support.google.com/analytics/answer/9383630)
- [About the (other) row](https://support.google.com/analytics/answer/13331684)
