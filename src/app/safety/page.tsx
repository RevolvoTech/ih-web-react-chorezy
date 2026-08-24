import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalPages } from "@/content/legal-pages";

export const metadata: Metadata = {
  title: "Safety at Chorezy | Neighborhood Chore Marketplace",
  description: legalPages["/safety"].description,
  alternates: { canonical: "/safety/" },
};

export default function SafetyPage() {
  return <LegalPage path="/safety" />;
}
