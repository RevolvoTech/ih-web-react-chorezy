import HomePage from "@/App";

const faqItems = [
  ["What is Chorezy?", "Chorezy is a neighborhood marketplace being built to connect people and local businesses who need help with young and adult helpers nearby."],
  ["Where is Chorezy launching?", "The current waitlist is limited to the United States and Canada. We use your ZIP or postal code to understand where demand is growing."],
  ["Who can become a helper?", "Chorezy supports Adult Helpers and Young Helpers. Young Helper access is designed to include parent or guardian involvement and age-appropriate work."],
  ["What kinds of chores will be available?", "Examples include yard work, pet care, errands, cleaning help, moving assistance, and other local tasks that match a helper's eligibility and skills."],
  ["Is Chorezy live yet?", "Not publicly. We are preparing the North American launch and inviting people to join the waitlist for location-based updates."],
  ["Does joining cost anything?", "No. Joining the launch waitlist is free and does not obligate you to use the app."],
] as const;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Chorezy",
    url: "https://chorezy.com/",
    description: "A neighborhood chore marketplace being built for the United States and Canada.",
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Chorezy",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, iOS",
    url: "https://chorezy.com/",
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/PreOrder" },
    publisher: { "@type": "Organization", name: "Revolvo Tech", url: "https://revolvo.tech/" },
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
