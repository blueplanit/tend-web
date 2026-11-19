import type { Faq } from "@/lib/landing-copy";
import { COMPANY_NAME, FEEDBACK_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

// JSON-LD tells search engines and AI assistants what the page describes.
// The < escape blocks script injection through a string value.
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function SiteStructuredData({ description }: { description: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: COMPANY_NAME,
            email: FEEDBACK_EMAIL,
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          {
            // No "offers": the price is not set. Add it when it is.
            "@type": "MobileApplication",
            "@id": `${SITE_URL}/#app`,
            name: SITE_NAME,
            url: SITE_URL,
            operatingSystem: "Android, iOS",
            applicationCategory: "FinanceApplication",
            description,
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        ],
      }}
    />
  );
}

export function FaqStructuredData({ items }: { items: readonly Faq[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
