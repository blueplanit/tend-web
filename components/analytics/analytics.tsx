"use client";

import Script from "next/script";
import { useEffect } from "react";
import { initAmplitude } from "@/lib/analytics/amplitude";
import { IS_PRODUCTION_DEPLOYMENT } from "@/lib/site";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Loads Amplitude and GA4 on the production deployment only.
// GA4 reads the utm_* parameters from the landing URL by itself.
export function Analytics() {
  useEffect(() => {
    initAmplitude();
  }, []);

  if (!GA_MEASUREMENT_ID || !IS_PRODUCTION_DEPLOYMENT) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
