import { LegalPage } from "@/components/legal-page";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLegalDocument, legalPageMetadata } from "@/lib/legal-documents";

export function generateMetadata() {
  return legalPageMetadata("privacy");
}

export default async function PrivacyPage() {
  const [doc, { copy }] = await Promise.all([getLegalDocument("privacy"), getLandingCopy()]);
  return <LegalPage doc={doc} copy={copy} />;
}
