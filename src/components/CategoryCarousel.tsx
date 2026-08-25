"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BroomIcon,
  CookingPotIcon,
  HammerIcon,
  HouseIcon,
  LaptopIcon,
  PawPrintIcon,
  PlantIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { type CSSProperties, useRef } from "react";

const categories = [
  { name: "Cleaning", color: "#009FE3", icon: BroomIcon, examples: "Dusting · sweeping · deep cleaning", href: "/chores/home-help/" },
  { name: "Yard care", color: "#4CAF50", icon: PlantIcon, examples: "Watering · leaves · lawn care", href: "/chores/yard-care/" },
  { name: "Pet care", color: "#FF9800", icon: PawPrintIcon, examples: "Walks · feeding · routine visits", href: "/chores/pet-care/" },
  { name: "Errands", color: "#009688", icon: TruckIcon, examples: "Pickups · returns · local drop-offs", href: "/chores/errands/" },
  { name: "Food & groceries", color: "#FFB300", icon: CookingPotIcon, examples: "Groceries · meal prep · kitchen help", href: "/#waitlist" },
  { name: "Tech help", color: "#9C27B0", icon: LaptopIcon, examples: "Device setup · apps · smart-home help", href: "/#waitlist" },
  { name: "Home help", color: "#7CB342", icon: HouseIcon, examples: "Organizing · setup · small repairs", href: "/chores/home-help/" },
  { name: "Assembly", color: "#F59E0B", icon: HammerIcon, examples: "Furniture · DIY kits · hardware setup", href: "/#waitlist" },
] as const;

type CategoryStyle = CSSProperties & { "--category-color": string };

export function CategoryCarousel() {
  const railRef = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.min(rail.clientWidth * 0.82, 760), behavior: "smooth" });
  }

  return (
    <section className="category-section" aria-labelledby="category-heading">
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
        <div className="category-rail" ref={railRef} role="region" aria-label="Chore categories" aria-roledescription="carousel">
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
      <p className="shell category-note">Featured categories are representative. Availability and helper eligibility will vary by category and launch area.</p>
    </section>
  );
}
