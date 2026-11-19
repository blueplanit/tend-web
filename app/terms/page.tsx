import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLegalDocument } from "@/lib/legal-documents";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getLegalDocument("terms");
  return {
    title,
    description,
    alternates: { canonical: "/terms" },
    openGraph: { url: "/terms", title, description },
  };
}

export default async function TermsPage() {
  const [doc, copy] = await Promise.all([getLegalDocument("terms"), getLandingCopy()]);
  return <LegalPage doc={doc} copy={copy} />;
}
