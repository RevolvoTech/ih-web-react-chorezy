"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "./components/Brand";
import { CategoryCarousel } from "./components/CategoryCarousel";
import { Icon } from "./components/Icons";
import { WaitlistForm } from "./components/WaitlistForm";
import { WaitlistCount } from "./components/WaitlistCount";
import { faqItems } from "./content/faqs";

const safetyItems = [
  "Young Helpers ages 14–17 and Adult Helpers ages 18+",
  "Guardian visibility for Young Helpers",
  "In-app communication and active-task reporting",
  "Emergency response options with a direct 911 fallback",
] as const;

const marketplaceSteps = [
  {
    number: "01",
    title: "Post the work clearly",
    description: "Add the chore, timing, location, budget, checklist, and optional photos or voice context so helpers know what the job involves.",
  },
  {
    number: "02",
    title: "Compare nearby offers",
    description: "Eligible Adult and Young Helpers can discover suitable local work and make offers. The poster decides who is the right fit.",
  },
  {
    number: "03",
    title: "Keep the task together",
    description: "Use in-app conversation, arrival updates, and active-work progress instead of piecing the job together across separate apps.",
  },
  {
    number: "04",
    title: "Finish with a clear record",
    description: "Completion proof, payments, reviews, and dispute tools are being built into the chore flow from start to finish.",
  },
] as const;

export function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.classList.add("menu-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Brand compact />
        <nav aria-label="Primary navigation" className={open ? "nav nav--open" : "nav"}>
          <Link href="/#how" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/#safety" onClick={() => setOpen(false)}>Safety</Link>
          <Link href="/#launch" onClick={() => setOpen(false)}>Launch</Link>
          <Link className="button button--nav" href="/#waitlist" onClick={() => setOpen(false)}>Join waitlist</Link>
        </nav>
        <button
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="menu-button"
          onClick={() => setOpen(!open)}
          type="button"
        >
          <Icon name={open ? "close" : "menu"} size={24} />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div className="site-footer__brand">
          <Brand />
          <p>Turn everyday tasks into clear local opportunities—whether you need a hand or want to earn nearby.</p>
          <Link className="site-footer__cta" href="/#waitlist">Join the waitlist <Icon name="arrow" /></Link>
        </div>
        <nav aria-label="Footer navigation" className="site-footer__nav">
          <div>
            <h2>Explore</h2>
            <Link href="/#how">How it works</Link>
            <Link href="/#categories">Chore categories</Link>
            <Link href="/help/working-families/">For busy families</Link>
          </div>
          <div>
            <h2>Earn nearby</h2>
            <Link href="/earn/young-helpers/">Young Helpers</Link>
            <Link href="/earn/adult-helpers/">Adult Helpers</Link>
            <Link href="/chores/yard-care/">Yard care</Link>
          </div>
          <div>
            <h2>Trust</h2>
            <Link href="/safety/">Safety</Link>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
          </div>
        </nav>
      </div>
      <div className="shell site-footer__bottom">
        <span>© {new Date().getFullYear()} Chorezy</span>
        <span>Local help, made easier.</span>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navigation />
      <main id="main-content">
        <section className="hero">
          <div className="shell hero__grid">
            <div className="hero__copy">
              <p className="launch-label"><Icon name="pin" size={18} /> United States launch waitlist</p>
              <h1>Get local help.<span>Earn close to home.</span></h1>
              <p className="hero__lede">A local chore marketplace for households, helpers, families, and businesses across the United States.</p>
              <WaitlistForm idPrefix="hero-waitlist" variant="hero" />
            </div>

            <div className="hero-media">
              <div className="hero-media__frame">
                <Image
                  alt="Neighbors gardening together outside a United States home"
                  className="hero-media__image"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 48vw"
                  src="/images/chorezy-neighbors-hero.png"
                />
              </div>
            </div>
          </div>
        </section>

        <CategoryCarousel />

        <section className="audience-section" aria-labelledby="audience-heading">
          <div className="shell">
            <div className="section-intro">
              <p className="section-kicker">A marketplace with more than one side</p>
              <h2 id="audience-heading">There is a place for you in the neighborhood.</h2>
            </div>
            <div className="audience-grid">
              <article className="audience-card audience-card--household">
                <span className="audience-card__icon"><Icon name="house" size={28} /></span>
                <div><p>Working moms + busy families</p><h3>Move the everyday list forward.</h3><span>Post the help you need and choose an eligible local helper who fits the task.</span><Link href="/help/working-families/">How Chorezy helps families</Link></div>
              </article>
              <article className="audience-card audience-card--helper">
                <span className="audience-card__icon"><Icon name="earn" size={28} /></span>
                <div><p>Young Helpers · ages 14–17</p><h3>Turn school breaks into nearby earnings.</h3><span>Explore age-appropriate local opportunities designed around guardian involvement.</span><Link href="/earn/young-helpers/">Learn about Young Helpers</Link></div>
              </article>
              <article className="audience-card audience-card--adult">
                <span className="audience-card__icon"><Icon name="family" size={28} /></span>
                <div><p>Adult Helpers · ages 18+</p><h3>Choose flexible work close to home.</h3><span>Discover eligible local chores, review the details, and make an offer when the work fits.</span><Link href="/earn/adult-helpers/">Learn about Adult Helpers</Link></div>
              </article>
              <article className="audience-card audience-card--business">
                <span className="audience-card__icon"><Icon name="store" size={28} /></span>
                <div><p>Local businesses</p><h3>Find an extra pair of hands nearby.</h3><span>Join the launch waitlist for eligible local operational tasks and flexible help.</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="family-story" aria-labelledby="family-story-heading">
          <div className="shell family-story__layout">
            <div className="family-story__image">
              <Image
                alt="A working mother and teenage helper preparing gardening tools outside a suburban home"
                fill
                sizes="(max-width: 980px) 100vw, 58vw"
                src="/images/chorezy-working-families-banner.png"
              />
            </div>
            <div className="family-story__copy">
              <p className="section-kicker">More room in a full week</p>
              <h2 id="family-story-heading">Built for families who need time—and neighbors ready to earn.</h2>
              <p>Working moms and busy households can turn a lingering task into a clear local chore. Young Helpers ages 14–17 can explore suitable work with guardian involvement, while Adult Helpers ages 18+ can choose flexible opportunities nearby.</p>
              <div className="family-story__links">
                <Link className="text-link" href="/help/working-families/">For busy families <Icon name="arrow" /></Link>
                <Link className="text-link" href="/earn/young-helpers/">For Young Helpers <Icon name="arrow" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="inside-section" id="how" aria-labelledby="inside-heading">
          <div className="shell">
            <div className="inside-heading">
              <p className="section-kicker">One flow from post to done</p>
              <h2 id="inside-heading">Less chasing. More getting things done.</h2>
              <p>Chorezy is being built to keep the details, people, progress, and payment for local chores in one place.</p>
            </div>
            <ol className="inside-grid">
              {marketplaceSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="journey-section" id="launch" aria-labelledby="launch-heading">
          <div className="shell journey-layout">
            <div className="journey-copy">
              <p className="section-kicker">How the waitlist works</p>
              <h2 id="launch-heading">A local launch starts with local demand.</h2>
              <p>Chorezy is preparing a community-by-community rollout. Your signup helps posters and helpers arrive together.</p>
              <a className="text-link" href="#waitlist">Add your neighborhood <Icon name="arrow" /></a>
            </div>
            <div className="journey-path">
              <article><span><Icon name="pin" size={24} /></span><div><h3>Share your area</h3><p>Enter your U.S. ZIP code.</p></div></article>
              <article><span><Icon name="family" size={24} /></span><div><h3>Choose your role</h3><p>Tell us if you need help, want to help, support a Young Helper, or represent a business.</p></div></article>
              <article><span><Icon name="mail" size={24} /></span><div><h3>Get the right update</h3><p>We will email you when Chorezy is ready for your area and role.</p></div></article>
            </div>
          </div>
        </section>

        <section className="safety-section" id="safety" aria-labelledby="safety-heading">
          <div className="shell safety-layout">
            <div className="safety-visual">
              <Image
                alt="Illustration of a guardian and Young Helper connected to chore safety and emergency response tools"
                fill
                sizes="(max-width: 980px) 100vw, 40vw"
                src="/images/chorezy-safety-response-banner.png"
              />
            </div>
            <div className="safety-copy">
              <p className="section-kicker">Safety belongs in the product</p>
              <h2 id="safety-heading">Built for the people behind every task.</h2>
              <p>Chorezy is being designed around identity and eligibility checks, guardian involvement, in-app communication, protected payment flows, and task-level safety tools. The active-chore emergency flow supports police/safety, medical, and fire requests through our response integration, while keeping a direct 911 option visible.</p>
              <Link className="text-link" href="/safety/">Read our safety approach <Icon name="arrow" /></Link>
            </div>
            <div className="safety-list">
              {safetyItems.map((item) => <div key={item}><Icon name="check" size={20} /><span>{item}</span></div>)}
            </div>
          </div>
        </section>

        <section className="region-section" id="united-states" aria-labelledby="region-heading">
          <div className="shell region-layout">
            <div className="region-title">
              <p className="section-kicker">United States first</p>
              <h2 id="region-heading">One country.<br />A focused launch.</h2>
            </div>
            <div className="region-countries" aria-label="Launch country">
              <article><strong>US</strong><span>United States</span></article>
            </div>
            <p className="region-note">The current waitlist accepts U.S. ZIP codes only. Chorezy is starting with one market so local demand, helpers, and support can grow together.</p>
          </div>
        </section>

        <section className="faq-section" aria-labelledby="faq-heading">
          <div className="shell faq-layout">
            <div className="faq-title"><p className="section-kicker">Before you join</p><h2 id="faq-heading">Questions, answered plainly.</h2></div>
            <div className="faq-list">
              {faqItems.map(([question, answer]) => (
                <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="waitlist-section" id="waitlist" aria-labelledby="waitlist-heading">
          <div className="shell waitlist-shell">
            <div className="waitlist-copy">
              <p className="section-kicker">Your neighborhood starts here</p>
              <h2 id="waitlist-heading">Put your area on the Chorezy map.</h2>
              <p>Tell us where you are and how you would use Chorezy. We will send relevant launch updates, not a generic global newsletter.</p>
              <WaitlistCount />
              <div className="privacy-note"><Icon name="shield" /><span>We ask for a ZIP code, never your street address.</span></div>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
