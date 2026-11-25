import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@/components/analytics/analytics";
import { SiteStructuredData } from "@/components/structured-data";
import { getLandingCopy } from "@/lib/landing-copy";
import { NON_PRODUCTION_NOINDEX, SHARED_OPEN_GRAPH } from "@/lib/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// The brand fonts are stored in the repo, so a build needs no network access.
const fredoka = localFont({
  src: "./fonts/Fredoka.ttf",
  variable: "--font-fredoka",
  weight: "300 700",
  display: "swap",
});

const nunito = localFont({
  src: "./fonts/Nunito.ttf",
  variable: "--font-nunito",
  weight: "200 1000",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const {
    copy: { meta },
    source,
  } = await getLandingCopy();
  return {
    metadataBase: new URL(SITE_URL),
    // An UptimeRobot keyword monitor reads the homepage. It emails a Founder when
    // the homepage shows content="default". See docs/adr/0001, Consequences.
    other: { "tend-copy-source": source },
    title: { default: meta.title, template: `%s | ${SITE_NAME}` },
    // Only site-wide fields go here. lib/metadata.ts says why.
    applicationName: SITE_NAME,
    robots: NON_PRODUCTION_NOINDEX,
    openGraph: SHARED_OPEN_GRAPH,
    // X reads the title and the description from the Open Graph fields.
    twitter: { card: "summary_large_image" },
    icons: { apple: "/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#F4F7F3",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const {
    copy: { meta },
  } = await getLandingCopy();
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <SiteStructuredData description={meta.description} />
        <Analytics />
      </body>
    </html>
  );
}
