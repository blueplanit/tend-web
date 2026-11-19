import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/landing/sections";
import type { LegalBlock, LegalDoc } from "@/lib/legal";

// Renders **bold** and [text](url) inside one line of legal text.
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) {
      parts.push(<strong key={match.index} className="font-bold text-ink">{match[1]}</strong>);
    } else {
      const href = match[3];
      const className = "font-bold text-leaf underline underline-offset-4 hover:text-leaf-dark";
      if (href.startsWith("/")) {
        parts.push(<Link key={match.index} href={href} className={className}>{match[2]}</Link>);
      } else {
        const external = href.startsWith("http");
        parts.push(
          <a
            key={match.index}
            href={href}
            className={className}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {match[2]}
          </a>,
        );
      }
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p>{inline(block)}</p>;
  return (
    <ul className="list-disc space-y-2 pl-6 marker:text-sprout">
      {block.list.map((item) => (
        <li key={item}>{inline(item)}</li>
      ))}
    </ul>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:px-6 md:py-16">
        <article className="mx-auto max-w-3xl rounded-[2rem] bg-white px-6 py-10 sm:px-10 md:py-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Last updated <time dateTime={doc.lastUpdated}>{formatDate(doc.lastUpdated)}</time>
          </p>
          <div className="mt-8 space-y-4 text-lg text-muted">
            {doc.intro.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
          {doc.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-display text-2xl font-semibold">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-muted">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
