"use client";

import { getAttributionParams } from "./attribution-store";
import { pageLocationForGa } from "./page-url";
import { safely } from "./safely";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let previousLocation: string | undefined;

// Queues the GA4 setup. gtag.js reads the queue when it loads.
// The attribution fields go out with every event.
// GA4's own page view records the full URL and referrer, so it is off. trackGaPageView
// sends a clean one instead.
export function initGa(measurementId: string, debug: boolean) {
  if (initialized) return;
  safely("GA4 init", () => {
    const dataLayer = (window.dataLayer ??= []);
    // gtag.js reads an arguments object from the queue, not an array.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("set", getAttributionParams());
    window.gtag("config", measurementId, { send_page_view: false, ...(debug ? { debug_mode: true } : {}) });
    initialized = true;
  });
}

// The referrer's origin only. Its path and query can carry personal information.
function referrerOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : "";
  } catch {
    return "";
  }
}

// Sends one page view with a clean page location and referrer. Every later event on
// the page reuses them. GA4's enhanced measurement setting "Page changes based on
// browser history events" must be off, or GA4 counts in-app page changes twice.
export function trackGaPageView() {
  if (!initialized) return;
  safely("GA4 page view", () => {
    const location = pageLocationForGa(window.location.href);
    window.gtag?.("set", { page_location: location, page_referrer: previousLocation ?? referrerOrigin() });
    window.gtag?.("event", "page_view");
    previousLocation = location;
  });
}
