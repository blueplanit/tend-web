"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { ANALYTICS_ENABLED } from "@/lib/site";
import { getAttributionParams } from "./attribution-store";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let initialized = false;

// Analytics must never break the page it measures.
function safely(operation: string, fn: () => void) {
  try {
    fn();
  } catch (error) {
    console.error(`Amplitude ${operation} failed`, error);
  }
}

// Runs on the production deployment only, so local and preview visits stay out
// of the data. NEXT_PUBLIC_ANALYTICS_LOCAL=true turns it on for a local test.
export function initAmplitude() {
  if (initialized || !AMPLITUDE_API_KEY || !ANALYTICS_ENABLED) return;

  safely("init", () => {
    // Adds the attribution fields to every event, including page views.
    amplitude.add({
      name: "tend-attribution",
      type: "enrichment",
      execute: async (event) => {
        if (event.event_type.startsWith("$")) return event; // identify and group calls
        event.event_properties = { ...getAttributionParams(), ...event.event_properties };
        return event;
      },
    });
    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: {
        pageViews: true,
        // Off: ./attribution.ts holds the one attribution definition for every tool.
        attribution: false,
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
        elementInteractions: false,
      },
    });
    initialized = true;
  });
}

export function trackAmplitude(
  eventName: string,
  eventProperties?: Record<string, unknown>,
) {
  if (!initialized) return;
  safely(`track ${eventName}`, () => amplitude.track(eventName, eventProperties));
}
