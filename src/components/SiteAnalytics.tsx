"use client";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

/** Public marketing analytics must not receive staff routes or record identifiers. */
export function SiteAnalytics() {
  const pathname = usePathname();
  return pathname === "/admin" || pathname.startsWith("/admin/") ? null : (
    <Analytics />
  );
}
