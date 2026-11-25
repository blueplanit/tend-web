# Tend website

The words for the Tend website. The product terms are for the copy. The visitor terms are for the attribution code and reports. Use each term as written here. A synonym reads as a second concept.

The product terms come from the prototype. The features, copy and terms of the app can change as it develops. When the app changes a term, change it here.

## Team

**Founder**:
One of the three people who build Tend: Jin, Alice or Matt. Any Founder can approve work.
_Avoid_: operator, owner, admin

## Product

**Tend**:
The name of the Blue Planit gamified mobile app for debt tracking and repayment. The name can still change.
_Avoid_: the app, the debt app

**Pippy**:
The creature that lives in the user's Garden. Its Mood shows how the user keeps up with payments. Pippy is never sad, sick or gone.
_Avoid_: Pip, mascot, pet, avatar

**Garden**:
Pippy's world in Tend. Each of the user's debts shows in it as a Weed.
_Avoid_: dashboard, home screen

**Weed**:
One debt in the user's Garden, such as a credit card or a car loan. It "regrows" by its daily interest.
_Avoid_: debt card, account, balance

**Mood**:
Pippy's state, set by the user's payment status. The four Moods are Content, Idle, Bored and Dozing.
_Avoid_: emotion, health, status

**Check-in**:
The prompt in Tend that asks whether the user made a payment on a Weed.
_Avoid_: reminder, nudge

**Extra Payment**:
A payment on a Weed above its minimum payment.
_Avoid_: overpayment, additional payment, bonus payment

## Visitors

**Campaign**:
One paid-ads campaign on one ad platform, with its own goal, budget and dates.
_Avoid_: ad test, experiment, ad set

**Campaign Code**:
The code of one Campaign: `pa` and three digits, such as `pa001`. Codes go in launch order.
_Avoid_: campaign ID, UTM campaign

**Creative**:
One image or video in a Campaign.
_Avoid_: asset, ad image, banner

**Source**:
Where a website visitor came from, such as `reddit` or `google`. The values are in [docs/url-tags.md](docs/url-tags.md).
_Avoid_: channel, acquisition source

**Paid status**:
Whether a visit was paid for: `paid`, `unpaid` or `unknown`. A visit is `unknown` when nothing proves it either way.
_Avoid_: acquisition, paid flag

**Touch**:
The Source of one website visit, with the page it landed on. The website keeps the first touch and the latest touch of each visitor.
_Avoid_: acquisition, attribution event

**App Store label**:
The one label that an App Store link carries in Apple's `ct` field, such as `pa002` or `social-reddit`. It names the group of the latest touch. App Store Connect counts downloads by it. The rules are in [docs/url-tags.md](docs/url-tags.md).
_Avoid_: campaign token, campaign name (a Campaign is paid only)

**Provider token**:
The fixed ID of our Apple developer account, in Apple's `pt` field. App Store Connect gives it. Every App Store link carries the same provider token.
_Avoid_: pt, Apple token, account ID

**Destination**:
The store that a beta button opens: `play_store`, `testflight` or `app_store`. Each `store_click` event carries it. The website reads it from the host of the link.
_Avoid_: store type, target

The `platform` event property is different. It holds `android` or `ios`.

## Legal

**Privacy policy**:
The page that says what data the Tend website and app collect, why, and who receives it. One privacy policy covers both.
_Avoid_: privacy notice, data policy

**Terms of use**:
The page that sets the rules for using the Tend website and app. One terms of use covers both.
_Avoid_: terms and conditions, terms of service, ToS
