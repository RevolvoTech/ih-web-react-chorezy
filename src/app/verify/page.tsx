import type { Metadata } from "next";
import { Suspense } from "react";
import { AppLinkPage } from "@/components/AppLinkPage";

export const metadata: Metadata = { title: "Verify your account | Chorezy", robots: { index: false, follow: false } };

export default function VerifyPage() {
  return <Suspense fallback={null}><AppLinkPage action="verify" /></Suspense>;
}
