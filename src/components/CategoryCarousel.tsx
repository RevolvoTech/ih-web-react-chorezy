"use client";

import {
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
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const categories = [
  { name: "Cleaning", color: "#009FE3", icon: PaintBucketIcon, examples: "Dusting · sweeping · deep cleaning", href: "/chores/cleaning/" },
  { name: "Yard care", color: "#4CAF50", icon: ShovelIcon, examples: "Watering · leaves · lawn care", href: "/chores/yard-care/" },
  { name: "Pet care", color: "#FF9800", icon: PawPrintIcon, examples: "Walks · feeding · routine visits", href: "/chores/pet-care/" },
  { name: "Errands", color: "#009688", icon: TruckIcon, examples: "Pickups · returns · local drop-offs", href: "/chores/errands/" },
  { name: "Food & groceries", color: "#FFB300", icon: CookingPotIcon, examples: "Groceries · meal prep · kitchen help", href: "/chores/food-and-groceries/" },
  { name: "Tech help", color: "#9C27B0", icon: LaptopIcon, examples: "Device setup · apps · smart-home help", href: "/chores/tech-help/" },
  { name: "Home help", color: "#7CB342", icon: ToolboxIcon, examples: "Organizing · setup · small repairs", href: "/chores/home-help/" },
  { name: "Assembly", color: "#F59E0B", icon: HammerIcon, examples: "Furniture · DIY kits · hardware setup", href: "/chores/assembly/" },
] as const;

type CategoryStyle = CSSProperties & { "--category-color": string };

function CategoryGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="category-group" aria-hidden={duplicate || undefined}>
      {categories.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <article className="category-card" key={category.name} style={{ "--category-color": category.color } as CategoryStyle}>
            <div className="category-card__main">
              <CategoryIcon className="category-card__icon" aria-hidden="true" size={48} weight="bold" />
              <h3>{category.name}</h3>
              <p>{category.examples}</p>
            </div>
            <Link href={category.href} tabIndex={duplicate ? -1 : undefined}>Explore {category.name.toLowerCase()} <ArrowRightIcon aria-hidden="true" size={18} weight="bold" /></Link>
          </article>
        );
      })}
    </div>
  );
}

export function CategoryCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const middleGroupRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ pointerId: -1, startX: 0, startScrollLeft: 0, moved: false });
  const suppressClickRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dragging, setDragging] = useState(false);

  const loopWidth = useCallback(() => {
    const first = firstGroupRef.current;
    const middle = middleGroupRef.current;
    return first && middle ? middle.offsetLeft - first.offsetLeft : 0;
  }, []);

  const normalizePosition = useCallback(() => {
    const rail = railRef.current;
    const width = loopWidth();
    if (!rail || !width) return;
    if (rail.scrollLeft >= width * 2) rail.scrollLeft -= width;
    if (rail.scrollLeft < width) rail.scrollLeft += width;
  }, [loopWidth]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const placeAtMiddleCopy = () => {
      const width = loopWidth();
      if (width) rail.scrollLeft = width;
    };
    placeAtMiddleCopy();
    const resizeObserver = new ResizeObserver(placeAtMiddleCopy);
    resizeObserver.observe(rail);
    return () => resizeObserver.disconnect();
  }, [loopWidth]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    let previousTime = 0;
    let position = railRef.current?.scrollLeft ?? 0;
    const animate = (time: number) => {
      const rail = railRef.current;
      if (!rail) return;
      if (Math.abs(rail.scrollLeft - position) > 2) position = rail.scrollLeft;
      const bounds = rail.getBoundingClientRect();
      const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      const isInteracting = rail.matches(":hover") || rail.contains(document.activeElement) || dragRef.current.pointerId !== -1;
      if (
        previousTime
        && !isInteracting
        && isVisible
        && document.visibilityState === "visible"
      ) {
        position += Math.min(time - previousTime, 32) * 0.032;
      }
      previousTime = time;
      const width = loopWidth();
      if (width) {
        if (position >= width * 2) position -= width;
        if (position < width) position += width;
      }
      rail.scrollLeft = position;
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [loopWidth, reducedMotion]);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: rail.scrollLeft, moved: false };
    rail.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function drag(event: ReactPointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail || dragRef.current.pointerId !== event.pointerId) return;
    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 6) dragRef.current.moved = true;
    rail.scrollLeft = dragRef.current.startScrollLeft - distance;
    normalizePosition();
  }

  function stopDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail || dragRef.current.pointerId !== event.pointerId) return;
    suppressClickRef.current = dragRef.current.moved;
    dragRef.current.pointerId = -1;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    setDragging(false);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    rail.scrollLeft += event.key === "ArrowLeft" ? -280 : 280;
    normalizePosition();
  }

  return (
    <section
      className="category-section"
      id="categories"
      aria-labelledby="category-heading"
    >
      <div className="shell category-header">
        <p className="section-kicker">Ways to use Chorezy</p>
        <h2 id="category-heading">What needs doing?</h2>
        <p>Browse a few of the ways households and businesses can ask for help—and helpers can find suitable work nearby.</p>
      </div>
      <div className="category-rail-wrap">
        <div
          className={`category-rail${dragging ? " is-dragging" : ""}`}
          ref={railRef}
          role="region"
          aria-label="Chore categories. Use the left and right arrow keys, or drag, to browse."
          tabIndex={0}
          onClickCapture={(event) => {
            if (!suppressClickRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
          }}
          onKeyDown={handleKeyDown}
          onPointerCancel={stopDrag}
          onPointerDown={startDrag}
          onPointerMove={drag}
          onPointerUp={stopDrag}
        >
          <div className="category-track">
            <div ref={firstGroupRef}><CategoryGroup duplicate /></div>
            <div ref={middleGroupRef}><CategoryGroup /></div>
            <div><CategoryGroup duplicate /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
