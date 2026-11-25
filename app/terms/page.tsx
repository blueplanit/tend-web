import { LegalPage } from "@/components/legal-page";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLegalDocument, legalPageMetadata } from "@/lib/legal-documents";

export function generateMetadata() {
  return legalPageMetadata("terms");
}

export default async function TermsPage() {
  const [doc, { copy }] = await Promise.all([getLegalDocument("terms"), getLandingCopy()]);
  return <LegalPage doc={doc} copy={copy} />;
}
