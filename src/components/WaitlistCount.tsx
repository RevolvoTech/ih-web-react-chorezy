"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";

type WaitlistCountProps = {
  className?: string;
};

export function WaitlistCount({ className = "" }: WaitlistCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCount() {
      try {
        const response = await fetch("/api/waitlist/count", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { count?: unknown };
        if (typeof payload.count === "number" && payload.count >= 0) {
          setCount(payload.count);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Could not load the Chorezy waitlist count.");
        }
      }
    }

    void loadCount();
    const handleJoined = (event: Event) => {
      const detail = (event as CustomEvent<{ created?: boolean }>).detail;
      if (detail?.created) setCount((current) => current === null ? 1 : current + 1);
    };
    window.addEventListener("chorezy:waitlist-joined", handleJoined);
    return () => {
      controller.abort();
      window.removeEventListener("chorezy:waitlist-joined", handleJoined);
    };
  }, []);

  if (count === null) {
    return <span className={`waitlist-count waitlist-count--loading ${className}`.trim()} aria-hidden="true" />;
  }

  return (
    <p className={`waitlist-count ${className}`.trim()} aria-live="polite">
      <span className="waitlist-count__icon" aria-hidden="true"><Icon name="family" size={18} /></span>
      {count === 0 ? (
        <span className="waitlist-count__copy">
          <strong>Be the first signup</strong>
          <span className="waitlist-count__detail">Help put your area on the map.</span>
        </span>
      ) : (
        <span className="waitlist-count__copy">
          <strong><span className="waitlist-count__number">{count.toLocaleString("en-US")}</span> {count === 1 ? "signup" : "signups"} so far</strong>
          <span className="waitlist-count__detail">Join the growing U.S. waitlist.</span>
        </span>
      )}
    </p>
  );
}
