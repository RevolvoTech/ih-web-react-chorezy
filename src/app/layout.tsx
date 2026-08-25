import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "../styles.css";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = localFont({
  src: [
    { path: "../fonts/airbnb-cereal/AirbnbCereal-Book.otf", weight: "400", style: "normal" },
    { path: "../fonts/airbnb-cereal/AirbnbCereal-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/airbnb-cereal/AirbnbCereal-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/airbnb-cereal/AirbnbCereal-ExtraBold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  preload: false,
});

const title = "Chorezy | Find Local Chore Help or Earn Nearby";
const description = "Chorezy is a U.S. neighborhood chore marketplace for posting local tasks, comparing helper offers, finding nearby work, and managing chores in one place.";

export const metadata: Metadata = {
  metadataBase: new URL("https://chorezy.com"),
  title,
  description,
  applicationName: "Chorezy",
  alternates: { canonical: "/" },
  icons: {
    icon: "/brand/logo-color.png",
    apple: "/brand/logo-color.png",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    other: {
      "msvalidate.01": "33F6A01ACF0E0CE564EE162F12747A4C",
    },
  },
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
  themeColor: "#226dff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-US" data-scroll-behavior="smooth">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
