import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import { SiteFooter, SiteHeader } from "@/components/landing/sections";
import type { LandingCopy } from "@/lib/landing-copy";
import type { LegalDocument } from "@/lib/legal-documents";

const linkClass = "font-bold text-leaf underline underline-offset-4 hover:text-leaf-dark";

// The legal body is Markdown from Contentful. Raw HTML is never rendered.
const ALLOWED_ELEMENTS = ["p", "h2", "h3", "ul", "ol", "li", "strong", "em", "a", "br"];

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 font-display text-2xl font-semibold text-ink">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 font-display text-xl font-semibold text-ink">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-3">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-sprout">{children}</ul>
  ),
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-6">{children}</ol>,
  strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
  a: ({ href = "", children }) => {
    // "//host/path" is a protocol-relative link to another site, not a site path.
    const external = href.startsWith("http") || href.startsWith("//");
    if (href.startsWith("/") && !external) {
      return (
        <Link href={href} className={linkClass}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className={linkClass}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
};

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function LegalPage({ doc, copy }: { doc: LegalDocument; copy: LandingCopy }) {
  return (
    <>
      <SiteHeader nav={copy.nav} />
      <main className="flex-1 px-4 py-12 sm:px-6 md:py-16">
        <article className="mx-auto max-w-3xl rounded-[2rem] bg-white px-6 py-10 sm:px-10 md:py-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Last updated <time dateTime={doc.lastUpdated}>{formatDate(doc.lastUpdated)}</time>
          </p>
          <div className="mt-5 text-muted">
            <Markdown
              allowedElements={ALLOWED_ELEMENTS}
              unwrapDisallowed
              components={components}
            >
              {doc.body}
            </Markdown>
          </div>
        </article>
      </main>
      <SiteFooter disclaimer={copy.footer.disclaimer} />
    </>
  );
}
