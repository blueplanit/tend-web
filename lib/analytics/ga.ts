"use client";

import { getAttributionParams } from "./attribution-store";

let initialized = false;

// Queues the GA4 setup. gtag.js reads the queue when it loads.
// The attribution fields go out with every event, including GA4's own page views.
export function initGa(measurementId: string, debug: boolean) {
  if (initialized) return;
  initialized = true;
  try {
    const dataLayer = (window.dataLayer ??= []);
    // gtag.js reads an arguments object from the queue, not an array.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("set", getAttributionParams());
    window.gtag("config", measurementId, debug ? { debug_mode: true } : {});
  } catch (error) {
    console.error("GA4 init failed", error);
  }
}
