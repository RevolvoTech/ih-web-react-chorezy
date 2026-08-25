import type { Metadata } from "next";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Chorezy is launching in the United States first",
  description: "Chorezy is currently preparing its United States launch.",
  robots: { index: false, follow: false },
};

export default function NotAvailablePage() {
  return (
    <main className="country-gate">
      <section className="country-gate__card" aria-labelledby="country-gate-heading">
        <Brand compact />
        <p className="country-gate__badge">United States launch</p>
        <h1 id="country-gate-heading">We are starting close to home.</h1>
        <p>
          Chorezy is currently available to visitors in the United States only.
          We are focusing on one country first so each local launch can have the
          right mix of households, helpers, and support.
        </p>
      </section>
    </main>
  );
}
