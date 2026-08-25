import HomePage from "@/App";
import { faqItems } from "@/content/faqs";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Chorezy",
    url: "https://chorezy.com/",
    logo: "https://chorezy.com/brand/logo-color.png",
    description: "A U.S. neighborhood marketplace being built for local chores and nearby earning opportunities.",
    areaServed: { "@type": "Country", name: "United States" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Chorezy",
    url: "https://chorezy.com/",
    description: "A U.S. neighborhood marketplace for posting local chores, comparing offers, and finding nearby work.",
    inLanguage: "en-US",
    publisher: { "@type": "Organization", name: "Chorezy", url: "https://chorezy.com/" },
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
