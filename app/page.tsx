import { FaqStructuredData } from "@/components/structured-data";
import {
  Beta,
  Faq,
  Hero,
  HowItWorks,
  InsideTheApp,
  MeetPippy,
  SiteFooter,
  SiteHeader,
  WhoFor,
} from "@/components/landing/sections";
import { content } from "@/lib/content";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <MeetPippy />
        <InsideTheApp />
        <WhoFor />
        <Beta />
        <Faq />
      </main>
      <SiteFooter />
      <FaqStructuredData items={content.faq.items} />
    </>
  );
}
