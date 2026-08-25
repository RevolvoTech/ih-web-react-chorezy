import type { Metadata } from "next";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Chorezy is not available in your country yet",
  description: "Chorezy is not currently available in this location.",
  openGraph: {
    title: "Chorezy is not available in your country yet",
    description: "Chorezy is not currently available in this location.",
    url: "/not-available",
  },
  twitter: {
    title: "Chorezy is not available in your country yet",
    description: "Chorezy is not currently available in this location.",
  },
  robots: { index: false, follow: false },
};

export default function NotAvailablePage() {
  return (
    <main className="country-gate">
      <section className="country-gate__card" aria-labelledby="country-gate-heading">
        <Brand compact />
        <p className="country-gate__badge">Not available in your country right now</p>
        <h1 id="country-gate-heading">We are not there yet.</h1>
        <p>
          Chorezy is not available in your country right now. We are expanding
          carefully so each local launch has the right mix of households,
          helpers, and support.
        </p>
      </section>
    </main>
  );
}
