import type { Metadata } from "next";
import { Suspense } from "react";
import { AppLinkPage } from "@/components/AppLinkPage";

export const metadata: Metadata = { title: "Reset your password | Chorezy", robots: { index: false, follow: false } };

export default function ResetPage() {
  return <Suspense fallback={null}><AppLinkPage action="reset" /></Suspense>;
}
