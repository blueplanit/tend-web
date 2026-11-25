import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLegalDocument } from "@/lib/legal-documents";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getLegalDocument("terms");
  return { title, ...pageMetadata({ path: "/terms", title, description }) };
}

export default async function TermsPage() {
  const [doc, { copy }] = await Promise.all([getLegalDocument("terms"), getLandingCopy()]);
  return <LegalPage doc={doc} copy={copy} />;
}
