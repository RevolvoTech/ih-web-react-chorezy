import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Navigation } from "@/App";
import { Icon } from "@/components/Icons";
import { choreDirectory, chorePages } from "@/content/discovery-pages";

export const metadata: Metadata = {
  title: "Browse Local Chore Categories | Chorezy",
  description: "Explore the local chore categories Chorezy is preparing for U.S. neighborhoods, from cleaning and gardening to tutoring, pet care, events, and more.",
  alternates: { canonical: "/chores/" },
  openGraph: {
    title: "Browse Local Chore Categories | Chorezy",
    description: "See the everyday chores households and businesses can post—and the local opportunities eligible helpers can choose.",
    url: "/chores/",
    type: "website",
    siteName: "Chorezy",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Local Chore Categories | Chorezy",
    description: "See the everyday chores Chorezy is preparing for U.S. neighborhoods.",
  },
};

type CategoryStyle = CSSProperties & { "--directory-color": string };

export default function ChoreDirectoryPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Chorezy chore categories",
      description: metadata.description,
      url: "https://chorezy.com/chores/",
      isPartOf: { "@type": "WebSite", name: "Chorezy", url: "https://chorezy.com/" },
      inLanguage: "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: choreDirectory.map(([slug, name], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
        url: `https://chorezy.com${chorePages[slug].path}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://chorezy.com/" },
        { "@type": "ListItem", position: 2, name: "Chore categories", item: "https://chorezy.com/chores/" },
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
      <main className="directory-main" id="main-content">
        <section className="directory-hero">
          <div className="shell directory-hero__inner">
            <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Chore categories</span></nav>
            <p className="section-kicker">Everyday help, clearly scoped</p>
            <h1>There is more than one way to help a neighborhood.</h1>
            <p>Explore the ways households and businesses can ask for a hand—and helpers can find suitable work nearby. Availability and eligibility will depend on the chore, local rules, and launch area.</p>
          </div>
        </section>

        <section className="directory-content" aria-labelledby="directory-heading">
          <div className="shell">
            <div className="directory-intro">
              <p className="section-kicker">Browse all categories</p>
              <h2 id="directory-heading">What could you get done—or help with?</h2>
            </div>
            <div className="directory-grid">
              {choreDirectory.map(([slug, name, color], index) => {
                const page = chorePages[slug];
                return (
                  <Link
                    className="directory-card"
                    href={page.path}
                    key={slug}
                    style={{ "--directory-color": color } as CategoryStyle}
                  >
                    <span className="directory-card__number">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{name}</h3>
                    <p>{slug === "errands" ? "Explore local pickups, returns, deliveries, and other eligible errand work for Adult Helpers." : page.description.replace(/^Join the Chorezy U\.S\. waitlist for /, "Explore ")}</p>
                    <span className="directory-card__link">Explore category <Icon name="arrow" size={18} /></span>
                  </Link>
                );
              })}
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
