import {
  attributionParams,
  captureAttribution,
  parseAttribution,
  type Attribution,
} from "./attribution";
import { safely } from "./safely";

// Saved in localStorage, so the source survives page loads and later returns.
// It holds only source values, page paths and click ID hashes, never personal information.
const STORAGE_KEY = "tend.attribution.v1";

let current: Attribution | null = null;

// Storage can be off, such as in some private windows. Then the source lasts one page load.
function readSaved(): string | null {
  return safely("Attribution read", () => window.localStorage.getItem(STORAGE_KEY)) ?? null;
}

function navigationType() {
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type;
}

// Runs once per full page load, before the app starts. Client-side navigation
// does not run it again, so internal navigation never changes the source.
export function capturePageLoad() {
  const { attribution, changed } = captureAttribution(
    { href: window.location.href, referrer: document.referrer, navigationType: navigationType() },
    readSaved(),
  );
  current = attribution;
  if (!changed) return;
  safely("Attribution save", () => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution)));
}

export function getAttribution(): Attribution | null {
  current ??= parseAttribution(readSaved());
  return current;
}

export function getAttributionParams(): Record<string, string> {
  const attribution = getAttribution();
  return attribution ? attributionParams(attribution) : {};
}
