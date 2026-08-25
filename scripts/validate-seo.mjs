import { readFile } from "node:fs/promises";
import path from "node:path";

const files = [
  ".next/server/app/index.html",
  ".next/server/app/safety.html",
  ".next/server/app/privacy.html",
  ".next/server/app/terms.html",
];

for (const file of files) {
  const content = await readFile(path.resolve(file), "utf8");
  if (/choreo\.revolvo\.tech|choreify\.revolvo\.tech|\bChoreify\b|\bChoreo\b/.test(content)) {
    throw new Error(`Legacy Chorezy identity found in ${file}`);
  }
}

const home = await readFile(path.resolve(files[0]), "utf8");
for (const required of [
  "https://chorezy.com/",
  "Find Local Chore Help or Earn Nearby",
  'name="description"',
  'property="og:title"',
  'type="application/ld+json"',
  'name="msvalidate.01" content="33F6A01ACF0E0CE564EE162F12747A4C"',
]) {
  if (!home.includes(required)) throw new Error(`Missing SEO requirement: ${required}`);
}

const discoveryRoutes = [
  "/chores/",
  "/chores/cleaning/",
  "/chores/yard-care/",
  "/chores/pet-care/",
  "/chores/car-care/",
  "/chores/errands/",
  "/chores/food-and-groceries/",
  "/chores/tech-help/",
  "/chores/art-and-crafts/",
  "/chores/sports/",
  "/chores/tutoring/",
  "/chores/home-help/",
  "/chores/senior-care/",
  "/chores/events/",
  "/chores/photography/",
  "/chores/assembly/",
  "/chores/holiday-help/",
  "/chores/recycling/",
  "/chores/child-care/",
  "/earn/young-helpers/",
  "/earn/adult-helpers/",
  "/help/working-families/",
];

for (const route of discoveryRoutes) {
  const outputPath = `.next/server/app${route.slice(0, -1)}.html`;
  const content = await readFile(path.resolve(outputPath), "utf8");
  const canonical = `https://chorezy.com${route}`;
  for (const required of [
    `<link rel="canonical" href="${canonical}"`,
    `property="og:url" content="${canonical}"`,
    'name="description"',
    'type="application/ld+json"',
    '"@type":"BreadcrumbList"',
  ]) {
    if (!content.includes(required)) throw new Error(`Missing ${required} in ${route}`);
  }
}

const sitemap = await readFile(path.resolve(".next/server/app/sitemap.xml.body"), "utf8");
for (const route of discoveryRoutes) {
  const canonical = `https://chorezy.com${route}`;
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error(`Sitemap is missing ${canonical}`);
}

const appPathManifest = await readFile(path.resolve(".next/server/app-paths-manifest.json"), "utf8");
for (const route of ["/page", "/safety/page", "/privacy/page", "/terms/page", "/robots.txt/route", "/sitemap.xml/route"]) {
  if (!appPathManifest.includes(`\"${route}\"`)) throw new Error(`Missing generated route: ${route}`);
}

console.log("SEO output validation passed.");
