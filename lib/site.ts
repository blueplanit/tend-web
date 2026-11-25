export const SITE_NAME = "Tend";
export const COMPANY_NAME = "Blue Planit LLC";

// The domain is not set yet (BP-1351). Set NEXT_PUBLIC_SITE_URL in Vercel when it is.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tend-web-eight.vercel.app";

export const FEEDBACK_EMAIL = "admin@blueplanit.co";

export type BetaPlatform = "android" | "ios";

// null shows "Coming soon". Paste each beta install link here when it exists.
// The links: tend-marketing/listings/README.md.
// Android: set NEXT_PUBLIC_ANDROID_STORE_URL in Vercel, then redeploy. Use the store
// listing, https://play.google.com/store/apps/details?id=com.blueplanit.tend.
// Only the store listing keeps the install referrer. The open test join page drops it.
// A tester joins the open test once, then installs from the store listing.
export const BETA_LINKS: Record<BetaPlatform, string | null> = {
  android: process.env.NEXT_PUBLIC_ANDROID_STORE_URL || null,
  ios: null, // TestFlight public link
};

// Analytics and indexing run on the production deployment only.
// Vercel sets VERCEL_ENV, and exposes it to the browser as NEXT_PUBLIC_VERCEL_ENV.
export const IS_PRODUCTION_DEPLOYMENT =
  (process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV) === "production";

// Set NEXT_PUBLIC_ANALYTICS_LOCAL=true in .env.local to test analytics on your machine.
// GA4 then runs in debug mode, so test events show in DebugView.
export const IS_LOCAL_ANALYTICS_TEST =
  !IS_PRODUCTION_DEPLOYMENT && process.env.NEXT_PUBLIC_ANALYTICS_LOCAL === "true";

export const ANALYTICS_ENABLED = IS_PRODUCTION_DEPLOYMENT || IS_LOCAL_ANALYTICS_TEST;
