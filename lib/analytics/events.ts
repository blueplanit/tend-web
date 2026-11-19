"use client";

import { trackAmplitude } from "./amplitude";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// One event, two names: Amplitude uses Title Case, GA4 uses snake_case.
export const EVENTS = {
  betaButtonClicked: {
    amplitude: "Beta Button Clicked",
    ga: "beta_button_click",
  },
} as const;

type EventProperties = Record<string, string | number | boolean>;

// Sends one event to Amplitude and to GA4. Each tool is off when its key is missing.
export function trackEvent(
  event: (typeof EVENTS)[keyof typeof EVENTS],
  properties?: EventProperties,
) {
  trackAmplitude(event.amplitude, properties);
  try {
    window.gtag?.("event", event.ga, properties);
  } catch (error) {
    console.error(`GA4 track ${event.ga} failed`, error);
  }
}
