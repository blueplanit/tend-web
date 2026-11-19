import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@/components/analytics/analytics";
import { SiteStructuredData } from "@/components/structured-data";
import { content } from "@/lib/content";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: content.meta.title, template: `%s | ${SITE_NAME}` },
  description: content.meta.description,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: content.meta.title,
    description: content.meta.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: content.meta.title,
    description: content.meta.description,
  },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#F4F7F3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <SiteStructuredData />
        <Analytics />
      </body>
    </html>
  );
}
