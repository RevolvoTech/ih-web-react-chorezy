import Link from "next/link";
import { Footer, Navigation } from "@/App";
import type { DiscoveryPageData } from "@/content/discovery-pages";
import { Icon } from "./Icons";

export function DiscoveryPage({ page }: { page: DiscoveryPageData }) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.seoTitle,
      description: page.description,
      url: `https://chorezy.com${page.path}`,
      isPartOf: { "@type": "WebSite", name: "Chorezy", url: "https://chorezy.com/" },
      inLanguage: "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://chorezy.com/" },
        { "@type": "ListItem", position: 2, name: page.eyebrow, item: `https://chorezy.com${page.path}` },
      ],
    },
  ];

  return (
    <>
      {structuredData.map((data) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
          key={data["@type"]}
          type="application/ld+json"
        />
      ))}
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navigation />
      <main className="discovery-main" id="main-content">
        <section className="discovery-hero">
          <div className="shell discovery-hero__inner">
            <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>{page.eyebrow}</span></nav>
            <p className="section-kicker">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <Link className="button button--primary" href="/#waitlist">Join the U.S. waitlist <Icon name="arrow" /></Link>
          </div>
        </section>
        <section className="discovery-content">
          <div className="shell">
            <ul className="discovery-highlights">
              {page.highlights.map((item) => <li key={item}><Icon name="check" /><span>{item}</span></li>)}
            </ul>
            <div className="discovery-sections">
              {page.sections.map(([title, body], index) => (
                <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{body}</p></article>
              ))}
            </div>
            <aside className="discovery-cta">
              <div><p className="section-kicker">United States first</p><h2>Help bring Chorezy to your area.</h2><p>Your role and ZIP code help us plan where households and helpers can launch together.</p></div>
              <Link className="button button--primary" href="/#waitlist">Put your ZIP code on the map <Icon name="arrow" /></Link>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
