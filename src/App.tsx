"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brand } from "./components/Brand";
import { Icon } from "./components/Icons";
import { WaitlistForm } from "./components/WaitlistForm";

const faqItems = [
  ["What is Chorezy?", "Chorezy is a neighborhood marketplace being built to connect people and local businesses who need help with young and adult helpers nearby."],
  ["Where is Chorezy launching?", "The current waitlist is limited to the United States and Canada. We use your ZIP or postal code to understand where demand is growing."],
  ["Who can become a helper?", "Chorezy supports Adult Helpers and Young Helpers. Young Helper access is designed to include parent or guardian involvement and age-appropriate work."],
  ["What kinds of chores will be available?", "Examples include yard work, pet care, errands, cleaning help, moving assistance, and other local tasks that match a helper's eligibility and skills."],
  ["Is Chorezy live yet?", "Not publicly. We are preparing the North American launch and inviting people to join the waitlist for location-based updates."],
  ["Does joining cost anything?", "No. Joining the launch waitlist is free and does not obligate you to use the app."],
] as const;

const roleCards = [
  { label: "For households", title: "Get the everyday list moving.", body: "Post the help you need, compare eligible offers, and choose a local helper who fits the task.", tone: "blue" },
  { label: "For helpers", title: "Earn close to home.", body: "Discover nearby opportunities that fit your availability, skills, and helper type.", tone: "green" },
  { label: "For guardians", title: "Stay part of the process.", body: "Young Helper participation is being designed around guardian visibility and age-appropriate work.", tone: "orange" },
] as const;

const steps = [
  ["01", "Tell us where you are", "Join with your U.S. ZIP code or Canadian postal code so we can prioritize launch areas."],
  ["02", "Choose your side", "Let us know whether you need help, want to help, support a Young Helper, or represent a business."],
  ["03", "Get a local launch update", "We will email you when Chorezy is ready for your area and role."],
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
          <p>Launching for communities across the United States and Canada.</p>
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
      <Navigation />
      <main>
        <section className="hero">
          <div className="shell hero__grid">
            <div className="hero__copy">
              <p className="eyebrow"><Icon name="pin" size={17} /> Launching in the United States + Canada</p>
              <h1>Get local help.<br /><span>Earn close to home.</span></h1>
              <p className="hero__lede">Chorezy is a neighborhood chore marketplace for people who need a hand and helpers ready to get things done—built with families, local businesses, and community safety in mind.</p>
              <div className="hero__actions">
                <a className="button button--primary" href="#waitlist">Join the waitlist <Icon name="arrow" /></a>
                <a className="text-link" href="#how">See how it will work</a>
              </div>
              <p className="hero__note">Free to join. Location-based launch updates only.</p>
            </div>
            <div className="hero-visual" aria-label="Illustration of local chores and helper offers">
              <div className="hero-visual__topline"><span>Nearby this weekend</span><span className="live-dot">Launch preview</span></div>
              <article className="task-card task-card--featured">
                <span className="task-card__icon"><Icon name="spark" /></span>
                <div><p>Yard cleanup</p><span>Saturday · 2–3 hours</span></div>
                <strong>3 offers</strong>
              </article>
              <article className="task-card"><span className="task-card__avatar">AM</span><div><p>Pet check-in</p><span>0.8 miles away</span></div><strong>Open</strong></article>
              <article className="task-card"><span className="task-card__avatar task-card__avatar--green">JR</span><div><p>Moving a bookshelf</p><span>Adult Helper</span></div><strong>Today</strong></article>
              <div className="hero-visual__footer"><Icon name="shield" /><span>Helper eligibility and safety controls are part of the product design.</span></div>
              <span className="illustration-label">Illustrative product preview</span>
            </div>
          </div>
        </section>

        <section className="role-section" aria-labelledby="built-for-heading">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">One neighborhood, different needs</p>
              <h2 id="built-for-heading">Built for both sides of the chore.</h2>
            </div>
            <div className="role-grid">
              {roleCards.map((card) => (
                <article className={`role-card role-card--${card.tone}`} key={card.label}>
                  <p className="role-card__label">{card.label}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="steps-section" id="how" aria-labelledby="how-heading">
          <div className="shell steps-layout">
            <div className="section-heading section-heading--sticky">
              <p className="eyebrow">How the waitlist works</p>
              <h2 id="how-heading">Start with your location, not a generic launch date.</h2>
              <p>Chorezy is preparing a community-by-community rollout. Your location helps us understand where posters and helpers can arrive together.</p>
            </div>
            <ol className="steps-list">
              {steps.map(([number, title, body]) => (
                <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="safety-section" id="safety" aria-labelledby="safety-heading">
          <div className="shell safety-grid">
            <div className="safety-panel">
              <div className="safety-panel__icon"><Icon name="shield" size={32} /></div>
              <p className="eyebrow">Safety by design</p>
              <h2 id="safety-heading">Local should feel familiar—not uncertain.</h2>
              <p>Chorezy is being built around identity and eligibility checks, guardian involvement for Young Helpers, in-app communication, protected payment flows, and task-level safety tools.</p>
                <Link className="text-link" href="/safety/">Read the safety approach <Icon name="arrow" /></Link>
            </div>
            <div className="safety-checks">
              {["Young and Adult Helper types", "Guardian visibility for Young Helpers", "Account and task eligibility controls", "In-app communication and safety reporting"].map((item) => (
                <div key={item}><span><Icon name="check" /></span><p>{item}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="region-section" id="north-america" aria-labelledby="region-heading">
          <div className="shell region-grid">
            <div>
              <p className="eyebrow"><Icon name="pin" size={17} /> North America only</p>
              <h2 id="region-heading">A focused launch across the U.S. and Canada.</h2>
            </div>
            <div className="region-copy">
              <p>The current Chorezy waitlist accepts United States ZIP codes and Canadian postal codes. We are not collecting signups for other countries yet.</p>
              <div className="country-row"><span>US</span><strong>United States</strong><span>CA</span><strong>Canada</strong></div>
            </div>
          </div>
        </section>

        <section className="faq-section" aria-labelledby="faq-heading">
          <div className="shell faq-layout">
            <div className="section-heading"><p className="eyebrow">Questions before joining</p><h2 id="faq-heading">The useful answers.</h2></div>
            <div className="faq-list">
              {faqItems.map(([question, answer]) => (
                <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="waitlist-section" id="waitlist" aria-labelledby="waitlist-heading">
          <div className="shell waitlist-layout">
            <div>
              <p className="eyebrow">North America launch waitlist</p>
              <h2 id="waitlist-heading">Make your neighborhood count.</h2>
              <p>Tell us where you are and how you would use Chorezy. We will send relevant launch updates—not a generic global newsletter.</p>
              <div className="privacy-note"><Icon name="shield" /><span>Your location is used for launch planning. We ask only for a ZIP or postal code, not a street address.</span></div>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
