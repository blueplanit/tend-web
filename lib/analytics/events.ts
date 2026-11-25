"use client";

import { trackAmplitude } from "./amplitude";
import { safely } from "./safely";

// One event, two names: Amplitude uses Title Case, GA4 uses snake_case.
// Each tool adds the attribution fields to every event. See ./attribution.ts.
export const EVENTS = {
  // A click on a beta button that has no link yet. It measures demand only.
  betaButtonClicked: {
    amplitude: "Beta Button Clicked",
    ga: "beta_button_click",
  },
  // A click that leaves the site for Google Play, TestFlight or the App Store.
  // destination names the store: play_store, testflight or app_store.
  storeClicked: {
    amplitude: "Store Clicked",
    ga: "store_click",
  },
} as const;

type EventProperties = Record<string, string | number | boolean>;

// Sends one event to Amplitude and to GA4. Each tool is off when its key is missing.
// current_page is the page of the click. The landing pages are attribution fields.
export function trackEvent(
  event: (typeof EVENTS)[keyof typeof EVENTS],
  properties?: EventProperties,
) {
  const withPage = { ...properties, current_page: window.location.pathname };
  trackAmplitude(event.amplitude, withPage);
  safely(`GA4 track ${event.ga}`, () => window.gtag?.("event", event.ga, withPage));
}
