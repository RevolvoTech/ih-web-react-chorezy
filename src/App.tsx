"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "./components/Brand";
import { Icon } from "./components/Icons";
import { WaitlistForm } from "./components/WaitlistForm";

const faqItems = [
  ["What is Chorezy?", "Chorezy is a neighborhood marketplace being built to connect people and local businesses who need help with young and adult helpers nearby."],
  ["Where is Chorezy launching?", "The current waitlist is limited to the United States and Canada. Your ZIP or postal code helps us understand where local demand is growing."],
  ["Who can become a helper?", "Chorezy supports Adult Helpers and Young Helpers. Young Helper access is being designed around guardian involvement and age-appropriate work."],
  ["What kinds of chores will be available?", "Examples include yard work, pet care, errands, cleaning help, moving assistance, and other local tasks that match a helper's eligibility and skills."],
  ["Is Chorezy live yet?", "Not publicly. We are preparing the North American launch and inviting people to join the waitlist for location-based updates."],
  ["Does joining cost anything?", "No. Joining the launch waitlist is free and does not obligate you to use the app."],
] as const;

const choreTypes = ["Yard care", "Pet care", "Errands", "Home help", "Other"] as const;

const safetyItems = [
  "Young and Adult Helper types",
  "Guardian visibility for Young Helpers",
  "Account and task eligibility controls",
  "In-app communication and safety reporting",
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
          <Link href="/#north-america" onClick={() => setOpen(false)}>North America</Link>
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
        <div>
          <Brand />
          <p>Local help is closer than you think. Chorezy is preparing to launch across the United States and Canada.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/safety/">Safety</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <a href="mailto:hello@chorezy.com">hello@chorezy.com</a>
        </nav>
      </div>
      <div className="shell site-footer__bottom">
        <span>© {new Date().getFullYear()} Chorezy</span>
        <span>A Revolvo Tech product</span>
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
              <p className="launch-label"><Icon name="pin" size={18} /> U.S. + Canada launch waitlist</p>
              <h1>Get local help.<span>Earn close to home.</span></h1>
              <p className="hero__lede">A local chore marketplace for households, helpers, families, and businesses across the U.S. and Canada.</p>
              <div className="hero__actions">
                <a className="button button--primary" href="#waitlist">Join the waitlist <Icon name="arrow" /></a>
                <a className="text-link" href="#how">How Chorezy will work</a>
              </div>
            </div>

            <div className="hero-media">
              <div className="hero-media__frame">
                <Image
                  alt="Neighbors gardening together outside a North American home"
                  className="hero-media__image"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 48vw"
                  src="/images/chorezy-neighbors-hero.png"
                />
              </div>
              <div className="hero-media__stamp" aria-hidden="true"><Icon name="spark" size={22} /> Local looks good</div>
              <div className="hero-media__caption">
                <span>Help nearby</span>
                <span>Work that fits</span>
              </div>
            </div>
          </div>
          <div className="shell chore-ribbon" aria-label="Example chore categories">
            <span>Built for the everyday list</span>
            <div>{choreTypes.map((type) => <span key={type}>{type}</span>)}</div>
          </div>
        </section>

        <section className="audience-section" aria-labelledby="audience-heading">
          <div className="shell">
            <div className="section-intro">
              <p className="section-kicker">A marketplace with more than one side</p>
              <h2 id="audience-heading">There is a place for you in the neighborhood.</h2>
            </div>
            <div className="audience-grid">
              <article className="audience-card audience-card--household">
                <span className="audience-card__icon"><Icon name="house" size={28} /></span>
                <div><p>Households</p><h3>Move the everyday list forward.</h3><span>Post the help you need and choose an eligible local helper who fits the task.</span></div>
              </article>
              <article className="audience-card audience-card--helper">
                <span className="audience-card__icon"><Icon name="earn" size={28} /></span>
                <div><p>Adult + Young Helpers</p><h3>Turn free time into nearby earnings.</h3><span>Discover local opportunities that fit your availability, skills, and helper type.</span></div>
              </article>
              <article className="audience-card audience-card--guardian">
                <span className="audience-card__icon"><Icon name="family" size={28} /></span>
                <div><p>Parents + guardians</p><h3>Stay part of the process.</h3><span>Young Helper participation is being designed around guardian visibility and age-appropriate work.</span></div>
              </article>
              <article className="audience-card audience-card--business">
                <span className="audience-card__icon"><Icon name="store" size={28} /></span>
                <div><p>Local businesses</p><h3>Find an extra pair of hands nearby.</h3></div>
              </article>
            </div>
          </div>
        </section>

        <section className="journey-section" id="how" aria-labelledby="how-heading">
          <div className="shell journey-layout">
            <div className="journey-copy">
              <p className="section-kicker">How the waitlist works</p>
              <h2 id="how-heading">A local launch starts with local demand.</h2>
              <p>Chorezy is preparing a community-by-community rollout. Your signup helps posters and helpers arrive together.</p>
              <a className="text-link" href="#waitlist">Add your neighborhood <Icon name="arrow" /></a>
            </div>
            <div className="journey-path">
              <article><span><Icon name="pin" size={24} /></span><div><h3>Share your area</h3><p>Enter a U.S. ZIP code or Canadian postal code.</p></div></article>
              <article><span><Icon name="spark" size={24} /></span><div><h3>Choose your role</h3><p>Tell us if you need help, want to help, support a Young Helper, or represent a business.</p></div></article>
              <article><span><Icon name="mail" size={24} /></span><div><h3>Get the right update</h3><p>We will email you when Chorezy is ready for your area and role.</p></div></article>
            </div>
          </div>
        </section>

        <section className="safety-section" id="safety" aria-labelledby="safety-heading">
          <div className="shell safety-layout">
            <div className="safety-mark" aria-hidden="true"><Icon name="shield" size={72} /></div>
            <div className="safety-copy">
              <p className="section-kicker">Safety belongs in the product</p>
              <h2 id="safety-heading">Built for the people behind every task.</h2>
              <p>Chorezy is being designed around identity and eligibility checks, guardian involvement, in-app communication, protected payment flows, and task-level safety tools.</p>
              <Link className="text-link" href="/safety/">Read our safety approach <Icon name="arrow" /></Link>
            </div>
            <div className="safety-list">
              {safetyItems.map((item) => <div key={item}><Icon name="check" size={20} /><span>{item}</span></div>)}
            </div>
          </div>
        </section>

        <section className="region-section" id="north-america" aria-labelledby="region-heading">
          <div className="shell region-layout">
            <div className="region-title">
              <p className="section-kicker">North America first</p>
              <h2 id="region-heading">Two countries.<br />One focused launch.</h2>
            </div>
            <div className="region-countries" aria-label="Launch countries">
              <article><strong>US</strong><span>United States</span></article>
              <article><strong>CA</strong><span>Canada</span></article>
            </div>
            <p className="region-note">The current waitlist accepts U.S. ZIP codes and Canadian postal codes. Signups for other countries are not open yet.</p>
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
              <div className="privacy-note"><Icon name="shield" /><span>We ask for a ZIP or postal code, never your street address.</span></div>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
