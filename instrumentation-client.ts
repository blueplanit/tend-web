import { capturePageLoad } from "@/lib/analytics/attribution-store";
import { safely } from "@/lib/analytics/safely";

// Next.js runs this file once per full page load, before the app starts.
safely("Attribution capture", capturePageLoad);
