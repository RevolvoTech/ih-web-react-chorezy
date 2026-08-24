import Link from "next/link";
import { Footer, Navigation } from "@/App";
import { Icon } from "@/components/Icons";
import { legalPages, type LegalPath } from "@/content/legal-pages";

export function LegalPage({ path }: { path: LegalPath }) {
  const page = legalPages[path];
  return (
    <>
      <Navigation />
      <main className="legal-main">
        <div className="shell legal-hero">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <span>Last updated August 24, 2026</span>
        </div>
        <div className="shell legal-content">
          {page.sections.map(([heading, body]) => (
            <section key={heading}><h2>{heading}</h2><p>{body}</p></section>
          ))}
          <Link className="button button--primary" href="/#waitlist">Join the waitlist <Icon name="arrow" /></Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
