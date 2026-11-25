# App Store reporting

How to read App Store downloads by source, and what the numbers cannot tell you.

## How a download gets its source

1. The website builds the App Store link for each visitor. The link carries our provider token (`pt`) and one App Store label (`ct`).
2. The App Store label comes from the visitor's latest touch, such as `pa002` or `social-reddit`. [url-tags.md](url-tags.md) states the rules.
3. App Store Connect credits each first-time download to one label. The label comes from the last labelled link that the person used. That link must be at most 24 hours old.
4. App Store Connect shows the totals in App Analytics, under Acquisition, in the Campaigns view.

The link carries these fields only when `NEXT_PUBLIC_IOS_STORE_URL` is an `apps.apple.com` link and `NEXT_PUBLIC_APPLE_PROVIDER_TOKEN` is set. [README.md](../README.md) lists both.

## Read the numbers

- **A missing row is not zero.** Apple shows a label only after 5 or more people make a first-time download through it in the date range. Each metric of a shown label also needs 5 or more. A label or a metric below the limit does not show at all. Report it as "no data", never as 0.
- **Widen the date range** when a row is missing. A week or a month often passes the limit when a day does not.
- **The rows add up to less than the real total.** Hidden rows are not in the sum.
- **Data comes late.** A new label shows after at least 24 hours. Apple's Reports API marks a day as complete two days later.
- **Reports start after launch.** The Campaigns view shows only after the app is live on the App Store and has a day of data.
- **Name the download metric you read.** First-time downloads decide whether a label shows. Total downloads add redownloads to first-time downloads. Apple's documentation does not say how it credits a redownload to a label. So compare labels on first-time downloads.
- **Small groups by design.** A label names a group, such as `referral`, never one article or one site. One article rarely reaches 5 downloads. Use GA4 or Amplitude for article detail. Those tools show clicks, not downloads.

## Do not join the App Store numbers to people

App Store Connect gives totals per label. It never says who downloaded. Do not match an App Store total to a Tend user, a GA4 user or an Amplitude user. No supported connection exists for that. Compare totals side by side only. Match the clicks on every field that builds the label. For example, count `store_click` events with `destination` = `app_store`, `latest_medium` = `social` and `latest_source` = `reddit`. Put that count next to the `social-reddit` first-time downloads for the same weeks. A filter on `latest_source` = `reddit` alone also counts paid Reddit clicks. Those clicks carry other labels, such as `pa002`.

## Downloads without an App Store label

Some App Store downloads that start on the website carry no label:

- The provider token is not set. Apple then credits a tap in Safari to "Web Referrer" with our domain. It credits a tap in another browser to "App Referrer" with that browser, such as Chrome.
- The person copied a link without the fields, or found Tend in the App Store directly.

The website labels every App Store link that it builds, including `unknown` for a visitor with no source. So a labelled download started on the website. One exception applies: a copied link keeps its label. A shared copy counts under the label of the person who copied it.

## TestFlight

TestFlight takes no App Store label and has no source reports. The website sends a TestFlight link without changes.

- **Clicks:** `store_click` with `destination` = `testflight` in GA4 and Amplitude. It carries the first and latest touch.
- **Testers:** App Store Connect, TestFlight, shows the public link totals for 30 days. These are views, accepted, did not meet criteria, and did not accept. It also shows installs, sessions and crashes for each build.
- **No source for an install.** Nothing ties a TestFlight install to a source. Do not divide installs by click share and call it a source report.

## Sources

Read on 2026-11-25:

- [Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- [Acquisition sources](https://developer.apple.com/help/app-store-connect-analytics/acquisition/acquisition/)
- [Analytics Reports API](https://developer.apple.com/help/app-store-connect-analytics/overview/analytics-reports-api/)
- [TestFlight tester information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/view-and-manage-tester-information/)
- [TestFlight build metrics](https://developer.apple.com/help/app-store-connect/test-a-beta-version/view-build-status-and-metrics/)
