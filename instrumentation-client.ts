import { capturePageLoad } from "@/lib/analytics/attribution-store";

// Next.js runs this file once per full page load, before the app starts.
// Analytics must never break the page it measures.
try {
  capturePageLoad();
} catch (error) {
  console.error("Attribution capture failed", error);
}
