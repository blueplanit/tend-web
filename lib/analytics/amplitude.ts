"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { ANALYTICS_ENABLED } from "@/lib/site";
import { getAttributionParams } from "./attribution-store";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let initialized = false;

// Amplitude's page view plugin adds these campaign values to each page view, even
// with attribution capture off. They hold raw tags, click ids and the full referrer
// URL, which can carry personal information. ./attribution.ts is the one definition.
// The list matches BASE_CAMPAIGN in @amplitude/analytics-core. Check it after an upgrade.
const AMPLITUDE_CAMPAIGN_KEYS = [
  "utm_campaign",
  "utm_content",
  "utm_id",
  "utm_medium",
  "utm_source",
  "utm_term",
  "referrer",
  "referring_domain",
  "dclid",
  "gbraid",
  "gclid",
  "fbclid",
  "ko_click_id",
  "li_fat_id",
  "msclkid",
  "rdt_cid",
  "ttclid",
  "twclid",
  "wbraid",
];

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
    // Adds the attribution fields to every event, including page views. It also
    // removes the raw campaign values that Amplitude's page views add by themselves.
    amplitude.add({
      name: "tend-attribution",
      type: "enrichment",
      execute: async (event) => {
        if (event.event_type.startsWith("$")) return event; // identify and group calls
        const properties: Record<string, unknown> = { ...event.event_properties };
        for (const key of AMPLITUDE_CAMPAIGN_KEYS) delete properties[key];
        event.event_properties = { ...getAttributionParams(), ...properties };
        return event;
      },
    });
    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: {
        pageViews: true,
        // Off: ./attribution.ts holds the one attribution definition for every tool.
        attribution: false,
        // Off: it adds "[Amplitude] Previous Page Location" to every event. That holds
        // the full referrer URL, whose path and query can carry personal information.
        // Amplitude adds it during init, so it can run after our plugin and add the value back.
        pageUrlEnrichment: false,
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
        elementInteractions: false,
      },
    });
    initialized = true;
  });
  if (!initialized) return;

  // Amplitude sends queued events about once a second. A store link leaves the page
  // at once, so store_click would wait until the visitor comes back. A beacon still
  // sends after the page hides. Back on the page, the normal transport returns.
  window.addEventListener("pagehide", () =>
    safely("flush", () => {
      amplitude.setTransport("beacon");
      amplitude.flush();
    }),
  );
  window.addEventListener("pageshow", () =>
    safely("transport reset", () => amplitude.setTransport("fetch")),
  );
}

export function trackAmplitude(
  eventName: string,
  eventProperties?: Record<string, unknown>,
) {
  if (!initialized) return;
  safely(`track ${eventName}`, () => amplitude.track(eventName, eventProperties));
}
