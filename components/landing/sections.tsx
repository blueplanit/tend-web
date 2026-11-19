import Image from "next/image";
import Link from "next/link";
import { content } from "@/lib/content";
import { COMPANY_NAME, FEEDBACK_EMAIL } from "@/lib/site";
import { BetaButtons } from "./beta-buttons";

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const sectionHeading =
  "font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/5 bg-mist/90 backdrop-blur">
      <div className={`${container} flex items-center justify-between gap-4 py-3`}>
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-2xl font-semibold"
        >
          <Image src="/pippy/pippy-content.svg" alt="" width={36} height={36} unoptimized />
          Tend
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 font-bold text-muted md:flex">
          {content.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#beta"
          className="rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white hover:bg-leaf-dark"
        >
          Get the beta
        </Link>
      </div>
    </header>
  );
}

export function Hero() {
  const { hero } = content;
  return (
    <section
      id="top"
      className={`${container} grid items-center gap-10 pt-10 pb-16 md:grid-cols-2 md:gap-14 md:pt-20 md:pb-24`}
    >
      <div>
        <p className="inline-flex rounded-full bg-warm px-3 py-1 text-sm font-bold">
          {hero.eyebrow}
        </p>
        <h1 className="mt-5 font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {hero.headline}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">{hero.subhead}</p>
        <div className="mt-8">
          <BetaButtons location="hero" />
        </div>
      </div>

      <div
        role="img"
        aria-label={hero.mediaLabel}
        className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2.5rem] bg-sky shadow-[0_30px_60px_-30px_rgb(38_51_46/0.35)] md:max-w-none"
      >
        <video
          className="h-full w-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/pippy/pippy-content-garden.png"
          aria-hidden="true"
        >
          <source src="/pippy/pippy-content-garden.mp4" type="video/mp4" />
        </video>
        <Image
          src="/pippy/pippy-content-garden.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="hidden object-cover motion-reduce:block"
        />
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { howItWorks } = content;
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className={container}>
        <h2 className={sectionHeading}>{howItWorks.heading}</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="rounded-3xl bg-mist p-6 sm:p-8">
              <span className="grid size-10 place-items-center rounded-full bg-garden font-display text-lg font-semibold text-leaf">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function MeetPippy() {
  const { meetPippy } = content;
  return (
    <section id="meet-pippy" className="scroll-mt-20 py-16 md:py-24">
      <div className={container}>
        <div className="max-w-2xl">
          <h2 className={sectionHeading}>{meetPippy.heading}</h2>
          <p className="mt-4 text-lg text-muted">{meetPippy.intro}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {meetPippy.moods.map((mood) => (
            <li key={mood.key} className="rounded-3xl bg-white p-5 text-center sm:p-6">
              <Image
                src={`/pippy/pippy-${mood.key}.svg`}
                alt={`Pippy, ${mood.name.toLowerCase()}`}
                width={140}
                height={140}
                unoptimized
                className="mx-auto size-28 sm:size-36"
              />
              <h3 className="mt-3 font-display text-xl font-semibold">{mood.name}</h3>
              <p className="mt-1 text-sm text-muted sm:text-base">{mood.body}</p>
            </li>
          ))}
        </ul>
        <blockquote className="mt-10 text-center font-display text-2xl font-semibold text-leaf sm:text-3xl">
          “{meetPippy.quote}”
        </blockquote>
      </div>
    </section>
  );
}

export function InsideTheApp() {
  const { insideTheApp } = content;
  return (
    <section id="inside-the-app" className="scroll-mt-20 bg-sky/60 py-16 md:py-24">
      <div className={container}>
        <h2 className={sectionHeading}>{insideTheApp.heading}</h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {insideTheApp.screens.map((screen) => (
            <li key={screen.src}>
              <Image
                src={screen.src}
                alt={screen.alt}
                width={1278}
                height={2640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="mx-auto h-auto w-full max-w-64"
              />
              <h3 className="mt-4 font-display text-xl font-semibold">{screen.title}</h3>
              <p className="mt-1 text-sm text-muted sm:text-base">{screen.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-muted">{insideTheApp.note}</p>
      </div>
    </section>
  );
}

export function WhoFor() {
  const { whoFor } = content;
  return (
    <section className="py-16 md:py-24">
      <div className={`${container} grid items-center gap-10 md:grid-cols-[1fr_auto]`}>
        <div>
          <h2 className={sectionHeading}>{whoFor.heading}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {whoFor.points.map((point) => (
              <li key={point} className="flex gap-3 rounded-2xl bg-white p-5 text-lg">
                <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-garden text-leaf">
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 10.5l3.2 3L15 7" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/pippy/pippy-idle.svg"
          alt=""
          width={220}
          height={220}
          unoptimized
          className="mx-auto hidden md:block"
        />
      </div>
    </section>
  );
}

export function Beta() {
  const { beta } = content;
  return (
    <section id="beta" className="scroll-mt-20 px-4 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[2.5rem] bg-leaf px-6 py-12 text-white sm:px-12 md:grid-cols-[1fr_auto] md:py-16">
        <div>
          <h2 className={sectionHeading}>{beta.heading}</h2>
          <p className="mt-4 max-w-2xl text-lg text-white/90">{beta.body}</p>
          <div className="mt-8">
            <BetaButtons location="beta_section" tone="dark" />
          </div>
          <p className="text-white/90">
            {beta.feedback}{" "}
            <a href={`mailto:${FEEDBACK_EMAIL}`} className="font-bold underline underline-offset-4">
              {FEEDBACK_EMAIL}
            </a>
            .
          </p>
        </div>
        <Image
          src="/pippy/pippy-content.svg"
          alt=""
          width={200}
          height={200}
          unoptimized
          className="mx-auto hidden md:block"
        />
      </div>
    </section>
  );
}

export function Faq() {
  const { faq } = content;
  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24">
      <div className={`${container} max-w-3xl`}>
        <h2 className={sectionHeading}>{faq.heading}</h2>
        <div className="mt-8 divide-y divide-ink/10 rounded-3xl bg-white px-6">
          {faq.items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden="true" className="text-2xl text-leaf transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className={`${container} flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:justify-between`}>
        <p>
          © {COMPANY_NAME}. {content.footer.disclaimer}
        </p>
        <nav aria-label="Legal and contact" className="flex flex-wrap gap-x-5 gap-y-1 font-bold">
          <Link href="/privacy" className="hover:text-ink">Privacy policy</Link>
          <Link href="/terms" className="hover:text-ink">Terms of use</Link>
          <a href={`mailto:${FEEDBACK_EMAIL}`} className="hover:text-ink">
            {FEEDBACK_EMAIL}
          </a>
        </nav>
      </div>
    </footer>
  );
}
