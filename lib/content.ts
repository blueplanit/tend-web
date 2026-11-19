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
// - Use the terms in tend-marketing GLOSSARY.md: Garden, Weed, Mood, Check-in,
//   Extra Payment.
// - Each product fact comes from the prototype. Check it against the current app
//   before you push a change that adds one.

import { FEEDBACK_EMAIL } from "./site";

export type Faq = { question: string; answer: string };

export const content = {
  meta: {
    title: "Tend: a calmer way to pay down debt",
    description:
      "Tend is a debt payoff app with Pippy, a calm little creature that lives in your Garden. Log your payments and see your progress. The beta is coming soon.",
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
    // "Small payments. A happier Garden."
    headline: "Your debts are Weeds. Pippy helps you tend them.",
    subhead:
      "Tend is a debt payoff app with a small, calm creature called Pippy. Log your payments, answer a quick Check-in, and Pippy stays content in its Garden.",
    mediaLabel: "Pippy, content and breathing slowly, in its Garden",
  },

  howItWorks: {
    heading: "How Tend works",
    steps: [
      {
        title: "Plant your Weeds",
        body: "Add each debt as a Weed: a credit card, a student loan, a car loan. Each Weed shows how much interest it regrows each night.",
      },
      {
        title: "Answer a Check-in",
        body: "When a payment is due, Tend asks one question: did it get paid? “It's a tight month” is always a fine answer.",
      },
      {
        title: "See your progress",
        body: "Your Garden shows what you paid and what is left. The month calendar shows each payment and each Extra Payment.",
      },
    ],
  },

  meetPippy: {
    heading: "Meet Pippy",
    intro:
      "Pippy lives in your Garden. Its Mood follows your payments. Pippy is never sad, sick or disappointed in you.",
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
        src: "/screens/garden.png",
        title: "Your Garden",
        body: "Your Weeds, their balances and your progress, on one screen.",
        alt: "The Tend home screen. Pippy is content. Three Weeds show a credit card, a student loan and a car loan.",
      },
      {
        src: "/screens/widget.png",
        title: "Home screen widget",
        body: "Pippy's Mood and your progress, right on your phone's home screen.",
        alt: "A phone home screen with a Tend notification and two Tend widgets that show Pippy and progress.",
      },
      {
        src: "/screens/calendar.png",
        title: "Pippy's month",
        body: "Pippy's Mood for each day, with payments on time and Extra Payments.",
        alt: "A month calendar with Pippy's Mood on each day, and totals for the month.",
      },
      {
        src: "/screens/check-in.png",
        title: "Check-in",
        body: "One question, with answers that never judge.",
        alt: "A Check-in that asks whether a Visa payment got paid. One answer is “It's a tight month”.",
      },
    ],
    note: "The screens show sample data. Tend is in development, so the app can change.",
  },

  whoFor: {
    heading: "Tend is for you if",
    points: [
      "You have more than one credit card balance.",
      "You can make the minimum payments.",
      "You want to make Extra Payments more often.",
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
