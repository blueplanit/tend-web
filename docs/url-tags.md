# URL tags

Put these tags on each link to the Tend website that we place by hand.
The website records each tag value only when this list holds it.
`lib/analytics/attribution.ts` holds the same list. Change both together.

## `utm_medium`: how the visitor came

The paid status says whether a visit was paid for: `paid`, `unpaid` or `unknown`.

| Medium | Paid status | Use for | Set by |
|---|---|---|---|
| `cpc` | `paid` | Google or Bing paid ads | Google auto-tagging (`gclid`, or `gbraid` and `wbraid` on iOS), the Bing click ID (`msclkid`), or a hand tag |
| `paid-social` | `paid` | Paid ads on Reddit, TikTok, Instagram or YouTube | Hand tag, or the TikTok (`ttclid`) or Reddit (`rdt_cid`) click ID |
| `paid-article` | `paid` | Blog posts that we pay another site to publish | Hand tag |
| `social` | `unpaid` with a tag, `unknown` without | Our posts, comments and profile links on Reddit, TikTok, Instagram or YouTube | Hand tag, or the website from a Reddit, TikTok, Instagram or YouTube referrer |
| `organic` | `unpaid` | Search results (SEO) | The website, from the referrer. Never a hand tag |
| `ai-answer` | `unpaid` | Links in AI answers (AEO) | The website, from the referrer, or ChatGPT's own tag |
| `referral` | `unpaid` with a tag, `unknown` without | Links from other websites, including guest blog posts | The website, from the referrer, or a hand tag for a link we place |
| `email` | `unpaid` with a tag, `unknown` without | Newsletters | Hand tag, or the website from a Gmail referrer |

## `utm_source`: where the visitor came from

| Group | Values |
|---|---|
| Ad and social platforms | `google`, `reddit`, `tiktok`, `instagram`, `youtube` |
| Search engines (`organic`) | `google`, `bing`, `duckduckgo`, `yahoo`, `ecosia`, `brave` |
| AI assistants (`ai-answer`) | `chatgpt`, `perplexity`, `gemini`, `copilot`, `claude` |
| Email apps (`email`, from the referrer) | `gmail` |
| Paid blog posts and newsletters | One short name per publisher. Add it here before the link goes live |
| Other websites (`referral`) | The main domain of the referring site, such as `substack.com` for `jo-smith.substack.com`. A subdomain can name a person. A hand tag also records the main domain only |
| Other Android apps (`referral`) | The app's domain, such as `facebook.com` for the Facebook app |

## `utm_campaign`: the Campaign Code

- Paid traffic uses the Campaign Code, such as `pa002`.
- A Campaign Code is `pa` and three digits. Any other value records as `unlisted`.
- Unpaid traffic has no `utm_campaign`. A Campaign is paid only. A Campaign Code on an unpaid medium records as `unlisted`.

## `utm_content`: the content identifier

- This tag names the Creative, post or article that holds the link, such as `pa002-comic` or `tiktok-regrows`.
- This tag does not name the landing page. The website records the landing page and the current page itself.

## Referrers that the website reads

A visit with no tag gets its source from the referrer host in this table.
A host that starts with `*.` also matches each subdomain.
Android apps send their package name as the referrer.

| Source | Medium | Paid status | Website hosts | Android apps |
|---|---|---|---|---|
| `chatgpt` | `ai-answer` | `unpaid` | `chatgpt.com`, `*.chatgpt.com`, `chat.openai.com`, `*.chat.openai.com` | `com.openai.chatgpt` |
| `perplexity` | `ai-answer` | `unpaid` | `perplexity.ai`, `*.perplexity.ai` | `ai.perplexity.app.android` |
| `gemini` | `ai-answer` | `unpaid` | `gemini.google.com` | `com.google.android.apps.bard` |
| `copilot` | `ai-answer` | `unpaid` | `copilot.microsoft.com` | `com.microsoft.copilot` |
| `claude` | `ai-answer` | `unpaid` | `claude.ai` | `com.anthropic.claude` |
| `google` | `organic` | `unpaid` | `google.<country>`, `www.google.<country>`, such as `www.google.co.uk` | `com.google.android.googlequicksearchbox` |
| `bing` | `organic` | `unpaid` | `bing.com`, `*.bing.com` | |
| `duckduckgo` | `organic` | `unpaid` | `duckduckgo.com`, `*.duckduckgo.com` | |
| `yahoo` | `organic` | `unpaid` | `yahoo.com`, `www.yahoo.com`, `search.yahoo.<country>`, `*.search.yahoo.<country>` | |
| `ecosia` | `organic` | `unpaid` | `ecosia.org`, `*.ecosia.org` | |
| `brave` | `organic` | `unpaid` | `search.brave.com` | |
| `reddit` | `social` | `unknown` | `reddit.com`, `*.reddit.com` | `com.reddit.frontpage` |
| `tiktok` | `social` | `unknown` | `tiktok.com`, `*.tiktok.com` | `com.zhiliaoapp.musically`, `com.ss.android.ugc.trill` |
| `instagram` | `social` | `unknown` | `instagram.com`, `*.instagram.com` | `com.instagram.android` |
| `youtube` | `social` | `unknown` | `youtube.com`, `*.youtube.com`, `youtu.be`, `*.youtu.be` | `com.google.android.youtube` |
| `gmail` | `email` | `unknown` | `mail.google.com` | `com.google.android.gm` |

- The website checks the rows in this order. So `gemini.google.com` is Gemini, not Google search.
- Any other host is a `referral`. Its source is the main domain of the host.
- Any other Android app is a `referral`. Its source is the main domain of its package name read backwards, such as `facebook.com` for `com.facebook.katana`.

## The App Store label

An App Store link carries one App Store label in Apple's `ct` field. App Store Connect counts downloads by it. The label comes from the latest touch. The first rule that matches sets it:

| Latest touch | App Store label | Example |
|---|---|---|
| `paid`, with a listed Campaign Code | The Campaign Code | `pa002` |
| No source | `unknown` | `unknown` |
| An unlisted medium or an unlisted source | `unlisted` | `unlisted` |
| A source in a fixed table above | `<medium>-<source>` | `social-reddit`, `organic-google`, `cpc-google` |
| Any other source | The medium only | `referral`, `paid-article` |

- Apple hides a label with fewer than 5 downloads. So a label names a group, never one article or one site. `utm_content` never reaches Apple.
- Every label is 30 characters or fewer. That is Apple's limit. The website cuts a longer label.
- Without a Campaign Code, a paid-article publisher in the source table gets its own label, such as `paid-article-<publisher>`. Keep publisher names short.
- [app-store-reporting.md](app-store-reporting.md) says how to read the App Store numbers.

## Values that the website records without a tag

| Value | Meaning |
|---|---|
| `unknown` | The visit has no tag and no external referrer. This value does not prove unpaid traffic. |
| `unlisted` | The link has a tag value that this list does not hold. Find and fix the tag. |

## Rules

- Use lowercase letters, digits and hyphens only. Use no spaces. A value in the wrong case records as `unlisted`.
- Tag each link that we place by hand. TikTok and Instagram in-app browsers often drop the referrer. Without a tag, the visit shows as `unknown`.
- A social site or another website can host a paid post. Without a tag, the website records its paid status as `unknown`.
- Never put personal information in a tag, such as a name, an email address or a user handle.
- The website does not record `utm_term` or click IDs.
- GA4 and Amplitude receive the page URL without other parameters or the fragment.
- GA4 also receives the four tags above, after this list applies. So `jo-smith.substack.com` becomes `substack.com`, and a value outside this list becomes `unlisted`.
- The Google Play install referrer receives the latest touch as `utm_` tags and the first touch as `first_` tags. Play Console reads only the `utm_` tags.
- The App Store link receives the latest touch as one App Store label. The first touch never reaches Apple. A TestFlight link receives no tags.
- GA4 receives only the origin of the referrer: its scheme and host. The path and query never reach GA4.
- A host in the referrer table stays, such as `https://www.google.com`. An Android app in the table stays as its package, such as `android-app://com.reddit.frontpage`.
- A subdomain of a domain in the referrer table also stays, such as `https://docs.google.com`. Its main domain alone would read as search in GA4.
- Any other referrer gives GA4 `https://` and its main domain only, such as `https://substack.com` for `jo-smith.substack.com`.
- A full page load from our own website gives GA4 the website's own origin.
- After a page change inside the website, the GA4 referrer is the previous page. It holds the tags after this list applies.
- The website uses click IDs only to detect a paid ad: `gclid`, `gbraid`, `wbraid`, `msclkid`, `ttclid` and `rdt_cid`.
- The browser keeps a short hash of each click ID. A new click ID counts as a new ad click. No tool receives the hash.
- A tagged link that already counted counts again only when another site or app sends the visitor. A link reopened from a bookmark or the browser history has no referrer, so it does not count again.
- A new visit from the latest source moves the latest landing page and paid status to that visit.
- A click ID sets the source, medium and paid status, even when the tags differ. The tags still set `utm_campaign` and `utm_content`.
- A visit from Google Play, TestFlight or the App Store keeps the earlier source. It is a return from a store click. GA4 receives no referrer for it.
- A link opened from Gmail has no tag. The website records its paid status as `unknown`.
- Instagram adds `fbclid` to unpaid clicks too, so `fbclid` does not prove a paid visit.
- Our own blog posts are not a source. They are landing or current pages. The source is the search engine or post that sent the visitor.
