import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { termsOfUse } from "@/lib/legal";

export const metadata: Metadata = {
  title: termsOfUse.title,
  description: termsOfUse.description,
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms", title: termsOfUse.title, description: termsOfUse.description },
};

export default function TermsPage() {
  return <LegalPage doc={termsOfUse} />;
}
