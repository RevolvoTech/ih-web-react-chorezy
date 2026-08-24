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
  "Local Chores and Trusted Neighborhood Helpers",
  'name="description"',
  'property="og:title"',
  'type="application/ld+json"',
]) {
  if (!home.includes(required)) throw new Error(`Missing SEO requirement: ${required}`);
}

const appPathManifest = await readFile(path.resolve(".next/server/app-paths-manifest.json"), "utf8");
for (const route of ["/page", "/safety/page", "/privacy/page", "/terms/page", "/robots.txt/route", "/sitemap.xml/route"]) {
  if (!appPathManifest.includes(`\"${route}\"`)) throw new Error(`Missing generated route: ${route}`);
}

console.log("SEO output validation passed.");
