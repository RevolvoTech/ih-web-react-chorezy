import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/verify/", "/reset/", "/invite/"],
    },
    sitemap: "https://chorezy.com/sitemap.xml",
    host: "https://chorezy.com",
  };
}
