import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacyPolicy } from "@/lib/legal";

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: privacyPolicy.description,
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", title: privacyPolicy.title, description: privacyPolicy.description },
};

export default function PrivacyPage() {
  return <LegalPage doc={privacyPolicy} />;
}
