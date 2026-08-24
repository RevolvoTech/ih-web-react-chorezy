import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalPages } from "@/content/legal-pages";

export const metadata: Metadata = {
  title: "Chorezy Privacy Notice | North America Waitlist",
  description: legalPages["/privacy"].description,
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return <LegalPage path="/privacy" />;
}
