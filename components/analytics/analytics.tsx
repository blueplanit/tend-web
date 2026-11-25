"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";
import { initAmplitude } from "@/lib/analytics/amplitude";
import { initGa, trackGaPageView } from "@/lib/analytics/ga";
import { ANALYTICS_ENABLED, IS_LOCAL_ANALYTICS_TEST } from "@/lib/site";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_ENABLED = Boolean(GA_MEASUREMENT_ID) && ANALYTICS_ENABLED;

// Sets up GA4 and sends a page view on the first load and on each in-app page change.
// A child's effects run before its parent's, so GA4 setup happens here, not in Analytics.
// usePathname can suspend on a route with an unknown dynamic param, so this sits
// in its own Suspense boundary. See the usePathname docs on Cache Components.
function GaPageViews({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  useEffect(() => {
    initGa(measurementId, IS_LOCAL_ANALYTICS_TEST);
    trackGaPageView();
  }, [measurementId, pathname]);
  return null;
}

// Loads Amplitude and GA4 on the production deployment only.
// instrumentation-client.ts captures the attribution before this runs.
export function Analytics() {
  useEffect(() => {
    initAmplitude();
  }, []);

  if (!GA_ENABLED || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <GaPageViews measurementId={GA_MEASUREMENT_ID} />
      </Suspense>
    </>
  );
}
