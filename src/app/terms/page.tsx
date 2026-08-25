import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalPages } from "@/content/legal-pages";

export const metadata: Metadata = {
  title: "Chorezy Waitlist Terms | United States",
  description: legalPages["/terms"].description,
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return <LegalPage path="/terms" />;
}
