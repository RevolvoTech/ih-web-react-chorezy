"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PaintBucketIcon,
  CookingPotIcon,
  HammerIcon,
  LaptopIcon,
  PawPrintIcon,
  ShovelIcon,
  ToolboxIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

const categories = [
  { name: "Cleaning", color: "#009FE3", icon: PaintBucketIcon, examples: "Dusting · sweeping · deep cleaning", href: "/chores/home-help/" },
  { name: "Yard care", color: "#4CAF50", icon: ShovelIcon, examples: "Watering · leaves · lawn care", href: "/chores/yard-care/" },
  { name: "Pet care", color: "#FF9800", icon: PawPrintIcon, examples: "Walks · feeding · routine visits", href: "/chores/pet-care/" },
  { name: "Errands", color: "#009688", icon: TruckIcon, examples: "Pickups · returns · local drop-offs", href: "/chores/errands/" },
  { name: "Food & groceries", color: "#FFB300", icon: CookingPotIcon, examples: "Groceries · meal prep · kitchen help", href: "/#waitlist" },
  { name: "Tech help", color: "#9C27B0", icon: LaptopIcon, examples: "Device setup · apps · smart-home help", href: "/#waitlist" },
  { name: "Home help", color: "#7CB342", icon: ToolboxIcon, examples: "Organizing · setup · small repairs", href: "/chores/home-help/" },
  { name: "Assembly", color: "#F59E0B", icon: HammerIcon, examples: "Furniture · DIY kits · hardware setup", href: "/#waitlist" },
] as const;

type CategoryStyle = CSSProperties & { "--category-color": string };

export function CategoryCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const normalizedIndex = (index + categories.length) % categories.length;
    const card = rail.children.item(normalizedIndex) as HTMLElement | null;
    if (!card) return;
    const left = card.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
    rail.scrollTo({ left, behavior: "smooth" });
    setActiveIndex(normalizedIndex);
  }, []);

  const move = useCallback((direction: -1 | 1) => {
    goTo(activeIndex + direction);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || reducedMotion.matches) return;
    const timer = window.setInterval(() => goTo(activeIndex + 1), 5000);
    return () => window.clearInterval(timer);
  }, [activeIndex, goTo, paused]);

  function syncActiveCard() {
    const rail = railRef.current;
    if (!rail) return;
    const railLeft = rail.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    Array.from(rail.children).forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - railLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  }

  return (
    <section
      className="category-section"
      id="categories"
      aria-labelledby="category-heading"
      onBlurCapture={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchEnd={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="shell category-header">
        <div>
          <p className="section-kicker">Ways to use Chorezy</p>
          <h2 id="category-heading">What needs doing?</h2>
          <p>Browse a few of the ways households and businesses can ask for help—and helpers can find suitable work nearby.</p>
        </div>
        <div className="category-controls" aria-label="Category carousel controls">
          <button aria-label="View previous categories" onClick={() => move(-1)} type="button"><ArrowLeftIcon aria-hidden="true" size={22} weight="bold" /></button>
          <button aria-label="View next categories" onClick={() => move(1)} type="button"><ArrowRightIcon aria-hidden="true" size={22} weight="bold" /></button>
        </div>
      </div>
      <div className="category-rail-wrap">
        <div
          className="category-rail"
          ref={railRef}
          role="region"
          aria-label="Chore categories"
          aria-roledescription="carousel"
          onScroll={syncActiveCard}
        >
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <article className="category-card" key={category.name} style={{ "--category-color": category.color } as CategoryStyle}>
                <span className="category-card__icon"><CategoryIcon aria-hidden="true" size={30} weight="bold" /></span>
                <div><h3>{category.name}</h3><p>{category.examples}</p></div>
                <Link href={category.href}>Explore {category.name.toLowerCase()} <ArrowRightIcon aria-hidden="true" size={18} weight="bold" /></Link>
              </article>
            );
          })}
        </div>
      </div>
      <div className="category-dots" aria-label="Choose a chore category">
        {categories.map((category, index) => (
          <button
            aria-label={`Show ${category.name}`}
            aria-pressed={activeIndex === index}
            key={category.name}
            onClick={() => goTo(index)}
            style={{ "--category-color": category.color } as CategoryStyle}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="shell category-note">Featured categories are representative. Availability and helper eligibility will vary by category and launch area.</p>
    </section>
  );
}
