import type { Metadata } from "next";
import { Suspense } from "react";
import { AppLinkPage } from "@/components/AppLinkPage";

export const metadata: Metadata = { title: "Chorezy invitation", robots: { index: false, follow: false } };

export default function InvitePage() {
  return <Suspense fallback={null}><AppLinkPage action="invite" /></Suspense>;
}
