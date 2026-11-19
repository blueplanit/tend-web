// The privacy policy and the terms of use. One of each covers the Tend website and app.
//
// Decisions behind this text (Founder grilling, 2026-11-19):
// - Written as if Tend has launched. No mention of a beta.
// - US residents aged 18 or older. Florida law. No arbitration clause.
// - Third parties by category. Google Analytics is named because its terms require it.
// - App facts assumed until the app confirms them: Apple and Google sign-in, email is the
//   only sign-in data kept, debts and payments stored on our servers, push notifications,
//   app analytics, and an in-app account deletion button.
// - Not reviewed by a lawyer yet.
//
// Change a fact here, then update LAST_UPDATED. Tell users before a material change.
//
// Text format: a block is a paragraph, or { list: [...] }. Inline links use [text](url).

import { COMPANY_NAME, FEEDBACK_EMAIL } from "./site";

export type LegalBlock = string | { list: string[] };
export type LegalSection = { heading: string; blocks: LegalBlock[] };
export type LegalDoc = {
  title: string;
  description: string;
  lastUpdated: string; // ISO date
  intro: LegalBlock[];
  sections: LegalSection[];
};

const LAST_UPDATED = "2026-11-19";
const EMAIL = `[${FEEDBACK_EMAIL}](mailto:${FEEDBACK_EMAIL})`;

export const privacyPolicy: LegalDoc = {
  title: "Privacy policy",
  description:
    "What data the Tend app and website collect, why we collect it, and the choices you have.",
  lastUpdated: LAST_UPDATED,
  intro: [
    `This privacy policy explains what data ${COMPANY_NAME} ("we") collects through the Tend app and the Tend website, why we collect it, and the choices you have. ${COMPANY_NAME} is a Florida company.`,
    "Tend is a tool to track your debts and payments. We never ask for your bank login, card numbers or account numbers. We do not sell your personal data.",
  ],
  sections: [
    {
      heading: "Data we collect in the app",
      blocks: [
        {
          list: [
            "**Account data.** You sign in with Apple or Google. We receive and keep your email address only. If you use Apple's Hide My Email, we receive a relay address instead.",
            "**Debts and payments you enter.** For each debt: the name you give it, its balance, interest rate, minimum payment and due date. We also keep the payments you log and your answers to check-ins. You enter all of this yourself.",
            "**Device data.** Your device type, operating system, app version, and a push notification token if you allow notifications.",
            "**Usage data.** The screens you open and the features you use. Our analytics provider collects this for us.",
          ],
        },
      ],
    },
    {
      heading: "Data we collect on the website",
      blocks: [
        "When you visit the Tend website, we collect the pages you view, your browser and device type, the site that sent you, campaign tags in the link you followed (such as utm_source), and an approximate location based on your IP address. We collect this with cookies and similar technology.",
        "When you email us, we receive your email address and your message.",
      ],
    },
    {
      heading: "How we use data",
      blocks: [
        {
          list: [
            "To run Tend: store your debts and payments, show your progress, estimate interest, and set Pippy's mood.",
            "To send the notifications you allow, such as a reminder before a payment is due.",
            "To answer your questions and feedback.",
            "To understand how people use Tend, and to improve it.",
            "To measure our own advertising campaigns.",
            "To keep Tend secure, and to meet our legal duties.",
          ],
        },
      ],
    },
    {
      heading: "How we share data",
      blocks: [
        "We do not sell your personal data. Tend does not show ads at this time. We share data only with:",
        {
          list: [
            "**Service providers** that run parts of Tend for us: hosting and databases, sign-in (Apple and Google), push notifications, analytics, and email. They may use the data only to provide their service to us.",
            "**Ad platforms**, such as Google Ads. When you install Tend after you see one of our ads, we share limited data with that platform, such as an install or sign-up event and, where your device settings allow it, an advertising identifier. This tells us which campaigns work. We do not share your debts or payments.",
            "**Authorities**, when the law requires it, or to protect the rights and safety of our users and of Tend.",
            "**A new owner**, if Blue Planit LLC or Tend is sold or merged. This privacy policy would still protect your data.",
          ],
        },
      ],
    },
    {
      heading: "Google Analytics",
      blocks: [
        "Our website uses Google Analytics to understand how visitors use it. Google collects data through cookies when you visit. [How Google uses this data](https://policies.google.com/technologies/partner-sites). To opt out, install the [Google Analytics opt-out add-on](https://tools.google.com/dlpage/gaoptout).",
      ],
    },
    {
      heading: "Cookies and Do Not Track",
      blocks: [
        "Our website uses cookies for analytics only. You can block or delete cookies in your browser settings. The website still works without them.",
        "Our website does not respond to Do Not Track signals.",
      ],
    },
    {
      heading: "Your choices",
      blocks: [
        {
          list: [
            "**Notifications.** Turn them on or off at any time in your phone's settings.",
            `**A copy of your data.** Email us at ${EMAIL}. We answer within 30 days.`,
            `**Corrections.** Change your debts and payments in the app, or email us at ${EMAIL}.`,
            "**Website analytics.** Block cookies in your browser, or use the Google Analytics opt-out add-on.",
          ],
        },
      ],
    },
    {
      heading: "Deleting your account",
      blocks: [
        `You can delete your account in the app, or by email to ${EMAIL}. We delete your account data within 30 days, and from our backups within 90 days. We may keep data that the law requires us to keep.`,
      ],
    },
    {
      heading: "How long we keep data",
      blocks: [
        "We keep your account data while your account is open, then delete it as described above. Website analytics data is kept for up to 14 months.",
      ],
    },
    {
      heading: "Security",
      blocks: [
        "We use reasonable technical and organizational measures to protect your data. No method of storage or transfer is completely secure, so we cannot guarantee security.",
      ],
    },
    {
      heading: "Who Tend is for",
      blocks: [
        `Tend is for people aged 18 or older who live in the United States. We store and process data in the United States. We do not knowingly collect data from anyone under 18. If you believe a child has given us data, email us at ${EMAIL} and we will delete it.`,
      ],
    },
    {
      heading: "Changes to this privacy policy",
      blocks: [
        "When we change this privacy policy, we update the date at the top. Before a material change takes effect, such as showing ads, we tell you in the app or by email.",
      ],
    },
    {
      heading: "Contact us",
      blocks: [`Questions about your privacy? Email us at ${EMAIL}.`],
    },
  ],
};

export const termsOfUse: LegalDoc = {
  title: "Terms of use",
  description: "The rules for using the Tend app and website.",
  lastUpdated: LAST_UPDATED,
  intro: [
    `These terms of use are an agreement between you and ${COMPANY_NAME} ("we"), a Florida company. They cover the Tend app and the Tend website. When you use Tend, you agree to these terms and to our [privacy policy](/privacy).`,
  ],
  sections: [
    {
      heading: "Who can use Tend",
      blocks: ["You must be 18 or older and live in the United States to use Tend."],
    },
    {
      heading: "Your account",
      blocks: [
        "You sign in with Apple or Google. Keep your device and your sign-in secure. You are responsible for what happens in your account.",
        "We may suspend or close an account that misuses Tend or breaks these terms.",
      ],
    },
    {
      heading: "Tend is not financial advice",
      blocks: [
        "Tend is a tool to track your debts and payments. It does not give financial, legal or tax advice. For advice about your situation, talk to a qualified professional.",
      ],
    },
    {
      heading: "You make your own payments",
      blocks: [
        "Tend does not pay your lenders or move your money. You stay responsible for paying each debt on time, even when Tend sends no reminder.",
      ],
    },
    {
      heading: "Numbers in Tend are estimates",
      blocks: [
        "Balances, interest and progress in Tend are estimates, based on the numbers you enter. For example, a weed's nightly regrowth estimates the interest a debt adds each day. Your lender can calculate interest differently. Your lender's statement is the official record of what you owe.",
      ],
    },
    {
      heading: "Using Tend fairly",
      blocks: [
        "Do not misuse Tend. For example, do not try to access other people's data, disrupt the service, copy or reverse engineer the app, or use Tend for anything unlawful.",
      ],
    },
    {
      heading: "Your data",
      blocks: [
        "The debts and payments you enter belong to you. You let us store and process them to run Tend, as our [privacy policy](/privacy) describes.",
      ],
    },
    {
      heading: "Our content",
      blocks: [
        `Tend, Pippy, and the app's software, artwork and text belong to ${COMPANY_NAME}. We give you a personal, non-commercial, non-transferable license to use the app while you follow these terms.`,
      ],
    },
    {
      heading: "Feedback",
      blocks: [
        "If you send us ideas or suggestions, we may use them to improve Tend, with no payment or credit to you.",
      ],
    },
    {
      heading: "App stores",
      blocks: [
        "If you got Tend from the App Store or Google Play, that store's terms also apply. Apple and Google are not parties to these terms, and they are not responsible for Tend.",
      ],
    },
    {
      heading: "Changes to Tend",
      blocks: [
        "We can add, change or remove features, and we can stop offering Tend.",
      ],
    },
    {
      heading: "No warranty",
      blocks: [
        'We provide Tend "as is" and "as available", without warranties of any kind, to the extent the law allows. We do not promise that Tend will be error-free or always available.',
      ],
    },
    {
      heading: "Limit of liability",
      blocks: [
        "To the extent the law allows, we are not liable for indirect, incidental, special or consequential damages, such as late fees or lost savings. Our total liability to you is limited to the greater of $50 or the amount you paid us in the 12 months before the claim.",
      ],
    },
    {
      heading: "Florida law and disputes",
      blocks: [
        "Florida law governs these terms, without regard to its conflict-of-law rules. Any dispute goes to the state or federal courts located in Florida.",
      ],
    },
    {
      heading: "Changes to these terms",
      blocks: [
        "When we change these terms, we update the date at the top. Before a material change takes effect, we tell you in the app or by email. If you keep using Tend after a change, you accept the new terms.",
      ],
    },
    {
      heading: "Ending",
      blocks: [
        "You can stop using Tend and delete your account at any time. The sections on feedback, no warranty, limit of liability, and Florida law still apply after you stop.",
      ],
    },
    {
      heading: "Contact us",
      blocks: [`Questions about these terms? Email us at ${EMAIL}.`],
    },
  ],
};
