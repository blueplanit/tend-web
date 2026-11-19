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
import { getLandingCopy } from "@/lib/landing-copy";

export default async function Home() {
  const copy = await getLandingCopy();
  return (
    <>
      <SiteHeader nav={copy.nav} />
      <main className="flex-1">
        <Hero hero={copy.hero} comingSoonNotice={copy.beta.comingSoonNotice} />
        <HowItWorks howItWorks={copy.howItWorks} />
        <MeetPippy meetPippy={copy.meetPippy} />
        <InsideTheApp insideTheApp={copy.insideTheApp} />
        <WhoFor whoFor={copy.whoFor} />
        <Beta beta={copy.beta} />
        <Faq faq={copy.faq} />
      </main>
      <SiteFooter disclaimer={copy.footer.disclaimer} />
      <FaqStructuredData items={copy.faq.items} />
    </>
  );
}
