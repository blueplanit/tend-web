# GA4 reporting

How to read website visits and store clicks in GA4, and what the numbers cannot tell you.
[README.md](../README.md) lists the events. [url-tags.md](url-tags.md) states how the website sets each touch.

## Set up the property once

A Founder does these steps in GA4. Each step needs the Editor role or above on the property.

1. **Check the production configuration.** Vercel production needs `NEXT_PUBLIC_GA_MEASUREMENT_ID`. "Automatically expose System Environment Variables" must stay on.
2. **Turn off one page view setting.** Go to Admin > Data streams > the web stream > Enhanced measurement > Page views > Show advanced settings. Turn off "Page changes based on browser history events". The website sends its own `page_view` for each page change. With the setting on, GA4 counts each page change twice.
3. **Register the custom dimensions.** Go to Admin > Data display > Custom definitions > Create custom dimension. Set the scope to Event. Use the event parameter name as the dimension name. Register all 17 parameters in the table below.
4. **Filter out local test traffic.** Go to Admin > Data filters > Create filter > Developer traffic. Set the filter to Active. A local test with `NEXT_PUBLIC_ANALYTICS_LOCAL=true` sends events to the same property in debug mode. This filter removes them from reports.
5. **Check delivery.** Open the production site. Then open Reports > Realtime. Look for `page_view`. Click a store button and look for `store_click`.

Do step 3 before launch. A new custom dimension shows data 24 to 48 hours after you create it. Google does not say that it shows events sent before you created it. So treat events before that date as missing from these dimensions.
Do step 4 before the first local test. An Active filter is permanent. It never removes events that GA4 already processed.

### Custom dimensions

| Event parameter | Events | What it holds |
|---|---|---|
| `first_source` | All | The Source of the first touch |
| `first_medium` | All | The medium of the first touch |
| `first_campaign` | All | The Campaign Code of the first touch, when paid |
| `first_content` | All | The `utm_content` of the first touch, when tagged |
| `first_paid_status` | All | The paid status of the first touch: `paid`, `unpaid` or `unknown` |
| `first_landing_page` | All | The page path of the first touch |
| `latest_source` | All | The Source of the latest touch |
| `latest_medium` | All | The medium of the latest touch |
| `latest_campaign` | All | The Campaign Code of the latest touch, when paid |
| `latest_content` | All | The `utm_content` of the latest touch, when tagged |
| `latest_paid_status` | All | The paid status of the latest touch |
| `latest_landing_page` | All | The page path of the latest touch |
| `current_page` | Clicks | The page path of the click |
| `platform` | Clicks | `android` or `ios` |
| `location` | Clicks | The button position: `hero` or `beta_section` |
| `destination` | `store_click` | The Destination: `play_store`, `testflight` or `app_store` |
| `available` | `beta_button_click` | Always `false`. The button had no link yet |

These are 17 of the 50 event-scoped custom dimensions that a standard property allows.

## Build the reports

### Visits by landing page

Use the built-in report: Reports > Engagement > Landing page. Add the secondary dimension "Session source / medium". The metric is Sessions.
These are GA4's own definitions. [Read the numbers](#read-the-numbers) says how they differ from the touch fields.

### Store clicks by touch

Make a free-form exploration: Explore > Free form.

- **Rows:** `latest_landing_page`, `latest_source` and `latest_medium`. Use the `first_` fields for the first touch. Never add both views in one table. One click then shows in two rows.
- **Columns:** `destination`.
- **Values:** Event count.
- **Filter:** Event name exactly matches `store_click`.

### Beta-button interest

Duplicate the store-click exploration. Change the filter to `beta_button_click`. Change the columns to `platform`.
A `beta_button_click` shows interest in a beta that has no link yet. Nobody left the site. Never add it to `store_click`.

GA4 enhanced measurement also sends a `click` event with `outbound` = `true` for each link to another site. A store click therefore sends a `click` event too. Count store clicks with `store_click` only.

## Read the numbers

- **A session is not a touch.** GA4 starts a new session after 30 minutes without activity, by default. Its "Landing page" is the first page of each session. Our `first_landing_page` and `latest_landing_page` change only when a new touch arrives. So the landing-page totals differ between the two reports.
- **GA4 has its own source rules.** "Session source / medium" comes from GA4's rules for each session. The touch fields come from the website's rules in [url-tags.md](url-tags.md). For example, an untagged return keeps the earlier touch on our side. Compare trends between the two, not totals.
- **`unknown` is not unpaid.** A touch is `unknown` when nothing proves its paid status. Report it apart from `unpaid`.
- **Data comes late.** Daily data is usually ready after about 12 hours. Processing can take 24 to 48 hours, and numbers can still change in that time.
- **Small rows can hide.** GA4 can withhold rows to protect individual users. A wider date range often shows them.
- **Too many values fold into "(other)".** A dimension with more than about 500 values in one day can fold the rare values into an "(other)" row. Our values come from fixed lists, so this is rare. Landing pages and `utm_content` can grow as articles ship.
- **A GA4 user is a browser.** One person on two devices counts as two users. A person who clears cookies counts again.
- **Some visitors send nothing.** Ad blockers and privacy settings can stop GA4. All counts are a floor, not a total.
- **GA4 and Amplitude differ a little.** Both receive the same events, but each tool counts on its own.
- **Report totals only.** Do not match a GA4 row to a person. Do not join GA4 numbers to App Store or Google Play numbers person by person. [app-store-reporting.md](app-store-reporting.md) says how to compare them side by side.

## Outside GA4

- **Search queries, impressions and search clicks** come from Google Search Console. GA4 does not have them.
- **App Store downloads** are in App Store Connect. See [app-store-reporting.md](app-store-reporting.md).
- **Google Play installs** are in Play Console. It reads the latest touch from the install referrer.

## Previews and local runs

- Previews and local runs send no analytics. The website loads GA4 only when `VERCEL_ENV` is `production`. A local test with `NEXT_PUBLIC_ANALYTICS_LOCAL=true` is the one exception. Step 4 filters it out.
- Vercel Deployment Protection sends a visitor to a preview to the Vercel login. Vercel also sends `x-robots-tag: noindex` on previews. So search engines do not index previews. Keep Deployment Protection on.

## When the permanent domain arrives

- Change the web stream URL in Admin > Data streams. The measurement ID stays the same.
- Returning visitors count as new users. GA4 cookies and the saved touches in the browser do not move to a new domain. Their first touch starts again.
- Add an annotation with the switch date to the reports.

## Sources

Read on 2026-11-25:

- [Create custom dimensions and metrics](https://support.google.com/analytics/answer/14239696)
- [About custom dimensions and metrics](https://support.google.com/analytics/answer/14240153)
- [Configuration limits](https://support.google.com/analytics/answer/12229528)
- [Enhanced measurement events](https://support.google.com/analytics/answer/9216061)
- [Filter out developer traffic](https://support.google.com/analytics/answer/13296662)
- [Landing page report](https://support.google.com/analytics/answer/12931766)
- [Data freshness](https://support.google.com/analytics/answer/11198161)
- [About data thresholds](https://support.google.com/analytics/answer/9383630)
- [About the (other) row](https://support.google.com/analytics/answer/13331684)
