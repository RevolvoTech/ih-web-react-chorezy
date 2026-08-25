import HomePage from "@/App";
import { faqItems } from "@/content/faqs";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Chorezy",
    url: "https://chorezy.com/",
    description: "A neighborhood chore marketplace being built for the United States.",
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Chorezy",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, iOS",
    url: "https://chorezy.com/",
    areaServed: { "@type": "Country", name: "United States" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/PreOrder" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  },
];

export default function Page() {
  return (
    <>
      {structuredData.map((data) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
          key={data["@type"]}
          type="application/ld+json"
        />
      ))}
      <HomePage />
    </>
  );
}
