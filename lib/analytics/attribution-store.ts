import {
  attributionParams,
  captureAttribution,
  readSavedAttribution,
  type Attribution,
} from "./attribution";

// Saved in localStorage, so the source survives page loads and later returns.
// It holds only source values and page paths, never personal information.
const STORAGE_KEY = "tend.attribution.v1";

let current: Attribution | null = null;

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // Storage is off, such as in some private windows.
  }
}

function readSaved() {
  try {
    return storage()?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
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
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {}
}

export function getAttribution(): Attribution | null {
  current ??= readSavedAttribution(readSaved());
  return current;
}

export function getAttributionParams(): Record<string, string> {
  const attribution = getAttribution();
  return attribution ? attributionParams(attribution) : {};
}
