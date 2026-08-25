import type { MetadataRoute } from "next";
import { chorePages, earnPages, helpPages } from "@/content/discovery-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-25T00:00:00.000Z");
  const discoveryPages = [...Object.values(chorePages), ...Object.values(earnPages), ...Object.values(helpPages)];
  return [
    {
      url: "https://chorezy.com/",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        "https://chorezy.com/images/chorezy-neighbors-hero.png",
        "https://chorezy.com/images/chorezy-working-families-banner.png",
        "https://chorezy.com/images/chorezy-safety-response-banner.png",
      ],
    },
    { url: "https://chorezy.com/safety/", lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://chorezy.com/chores/", lastModified, changeFrequency: "monthly", priority: 0.85 },
    ...discoveryPages.map((page) => ({
      url: `https://chorezy.com${page.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: page.path.startsWith("/chores/") ? 0.8 : 0.75,
    })),
    { url: "https://chorezy.com/privacy/", lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://chorezy.com/terms/", lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
