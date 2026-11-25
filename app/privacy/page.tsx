import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLegalDocument } from "@/lib/legal-documents";
import { openGraphFor } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getLegalDocument("privacy");
  return {
    title,
    description,
    alternates: { canonical: "/privacy" },
    openGraph: openGraphFor({ url: "/privacy", title, description }),
  };
}

export default async function PrivacyPage() {
  const [doc, { copy }] = await Promise.all([getLegalDocument("privacy"), getLandingCopy()]);
  return <LegalPage doc={doc} copy={copy} />;
}
