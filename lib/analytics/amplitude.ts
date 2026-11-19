"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { IS_PRODUCTION_DEPLOYMENT } from "@/lib/site";

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
// of the data.
export function initAmplitude() {
  if (initialized || !AMPLITUDE_API_KEY || !IS_PRODUCTION_DEPLOYMENT) return;

  safely("init", () => {
    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: {
        pageViews: true,
        // Captures utm_*, the referrer and click ids at session start.
        attribution: true,
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
