"use client";

import Script from "next/script";
import { useEffect } from "react";
import { initAmplitude } from "@/lib/analytics/amplitude";
import { initGa } from "@/lib/analytics/ga";
import { ANALYTICS_ENABLED, IS_LOCAL_ANALYTICS_TEST } from "@/lib/site";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Loads Amplitude and GA4 on the production deployment only.
// instrumentation-client.ts captures the attribution before this runs.
export function Analytics() {
  useEffect(() => {
    initAmplitude();
    if (GA_MEASUREMENT_ID && ANALYTICS_ENABLED) {
      initGa(GA_MEASUREMENT_ID, IS_LOCAL_ANALYTICS_TEST);
    }
  }, []);

  if (!GA_MEASUREMENT_ID || !ANALYTICS_ENABLED) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  );
}
