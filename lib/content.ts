// All copy for the landing page lives here.
//
// Contentful groundwork: each top-level key maps to one future content type.
// When the copy moves to Contentful, a loader returns this same shape, and this
// file becomes the fallback copy. See asv2-web docs/adr/0003 for the caching
// pattern (cached reads, tags, and a revalidation webhook).
//
// Rules for this copy (tend-marketing GOAL.md and the Pippy brand kit):
// - Brand copy says "we".
// - No promised outcomes. No financial advice. No shame or fear.
// - Pippy is never sad, sick or gone.
// - Use the terms in tend-marketing GLOSSARY.md: garden, weed, mood, check-in,
//   extra payment. Write them in lowercase. Only names keep a capital: Tend, Pippy.
// - A metaphor always comes with the financial concept behind it. For example,
//   "a weed regrows" comes with what interest is and how it adds up.
// See AGENTS.md "Copy rules".
// - Each product fact comes from the prototype. Check it against the current app
//   before you push a change that adds one.

import { FEEDBACK_EMAIL } from "./site";

export type Faq = { question: string; answer: string };

export const content = {
  meta: {
    title: "Tend: a calmer way to pay down debt",
    description:
      "Tend is a debt payoff app with Pippy, a calm little creature that lives in your garden. Log your payments and see your progress. The beta is coming soon.",
  },

  nav: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Meet Pippy", href: "#meet-pippy" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    eyebrow: "Beta coming soon on Android and iPhone",
    // Other headline options for Founder review:
    // "A calmer way to keep up with your debt."
    // "Small payments. A happier garden."
    headline: "Your debts are weeds. Pippy helps you tend them.",
    subhead:
      "Tend is a cozy debt payoff app. Meet Pippy, a small, unhurried creature who lives in your garden and is always glad to see you. Log a payment, and Pippy hums and waters its plant. Step away for a while, and it naps until you're back.",
    mediaLabel: "Pippy, content and breathing slowly, in its garden",
  },

  howItWorks: {
    heading: "How Tend works",
    steps: [
      {
        title: "Plant your weeds",
        body: "Add each debt as a weed: a credit card, a student loan, a car loan. Each weed regrows a little every night. That regrowth is interest: the debt's balance times its interest rate (APR), divided by 365, added each day.",
      },
      {
        title: "Answer a check-in",
        body: "When a payment is due, Tend asks if you made it. Answer yes, enter the amount you paid, or choose “It's a tight month”. Tend records the payment against that debt's balance.",
      },
      {
        title: "See your progress",
        body: "Your garden shows how much of your debt you have paid and how much is left. The month calendar marks each on-time payment and each extra payment: any amount above the minimum. An extra payment lowers the balance faster, so the weed regrows less interest each night.",
      },
    ],
  },

  meetPippy: {
    heading: "Meet Pippy",
    intro:
      "Pippy lives in your garden. Its mood follows your payments. Pippy is never sad, sick or disappointed in you.",
    moods: [
      {
        key: "content",
        name: "Content",
        body: "You just paid, or paid extra. Pippy hums and waters its plant.",
      },
      {
        key: "idle",
        name: "Idle",
        body: "A due date is coming up. Pippy yawns and watches clouds.",
      },
      {
        key: "bored",
        name: "Bored",
        body: "A payment is due soon, and nothing is logged yet. Pippy rolls a pebble.",
      },
      {
        key: "dozing",
        name: "Dozing",
        body: "A payment is past due. Pippy naps until you come back, then perks right up.",
      },
    ],
    quote: "Pippy isn't upset. It just missed you.",
  },

  insideTheApp: {
    heading: "Inside the app",
    screens: [
      {
        src: "/app-screens/garden.png",
        title: "Your garden",
        body: "Your weeds, their balances and your progress, on one screen.",
        alt: "The Tend home screen. Pippy is content. Three weeds show a credit card, a student loan and a car loan.",
      },
      {
        src: "/app-screens/widget.png",
        title: "Home screen widget",
        body: "Pippy's mood and your progress, right on your phone's home screen.",
        alt: "A phone home screen with a Tend notification and two Tend widgets that show Pippy and progress.",
      },
      {
        src: "/app-screens/calendar.png",
        title: "Pippy's month",
        body: "Pippy's mood for each day, with on-time payments and extra payments.",
        alt: "A month calendar with Pippy's mood on each day, and totals for the month.",
      },
      {
        src: "/app-screens/check-in.png",
        title: "Check-in",
        body: "One question, with answers that never judge.",
        alt: "A check-in that asks whether a Visa payment got paid. One answer is “It's a tight month”.",
      },
    ],
    note: "The screens show sample data. Tend is in development, so the app can change.",
  },

  whoFor: {
    heading: "Tend is for you if",
    points: [
      "You have more than one credit card balance.",
      "You can make the minimum payments.",
      "You want to make extra payments more often.",
      "You want an easy way to see your progress.",
    ],
  },

  beta: {
    heading: "The beta is coming soon",
    body: "We are building Tend now. The beta opens soon on Android and iPhone. The app can change during the beta, and your feedback shapes it.",
    feedback: "Questions or ideas? Email us at",
    comingSoonNotice:
      "The beta is not open yet. We will add the install links on this page soon.",
  },

  faq: {
    heading: "Questions",
    items: [
      {
        question: "When can I try Tend?",
        answer:
          "The beta opens soon on Android and iPhone. The install links will appear on this page.",
      },
      {
        question: "What does Tend cost?",
        answer:
          "Tend will have a free version and a paid subscription. We have not set the price yet.",
      },
      {
        question: "Is Tend financial advice?",
        answer:
          "No. Tend is a tool to track your debts and payments. It does not give financial advice.",
      },
      {
        question: "How do I send feedback?",
        answer: `Email us at ${FEEDBACK_EMAIL}. We read every message.`,
      },
    ] satisfies Faq[],
  },

  footer: {
    disclaimer: "Tend does not give financial advice.",
  },
} as const;
