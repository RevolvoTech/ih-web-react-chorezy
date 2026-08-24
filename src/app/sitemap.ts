import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-24T00:00:00.000Z");
  return [
    { url: "https://chorezy.com/", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://chorezy.com/safety/", lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://chorezy.com/privacy/", lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://chorezy.com/terms/", lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
