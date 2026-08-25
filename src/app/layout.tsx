import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "../styles.css";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const title = "Chorezy | Find Local Chore Help or Earn Nearby";
const description = "Chorezy is a U.S. neighborhood chore marketplace for posting local tasks, comparing helper offers, finding nearby work, and managing chores in one place.";

export const metadata: Metadata = {
  metadataBase: new URL("https://chorezy.com"),
  title,
  description,
  applicationName: "Chorezy",
  keywords: [
    "local chore help",
    "neighborhood helpers",
    "find help nearby",
    "local jobs for helpers",
    "household task marketplace",
    "United States chore app",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: "/brand/logo-color.png",
    apple: "/brand/logo-color.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Chorezy",
    locale: "en_US",
    title,
    description: "Post local chores, compare nearby helper offers, or find work close to home. Chorezy is launching in the United States.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: "Post local chores or find nearby work. Join the Chorezy U.S. waitlist.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#5b24ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
