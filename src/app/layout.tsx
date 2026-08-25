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

const title = "Chorezy | Local Chores and Trusted Neighborhood Helpers";
const description = "Chorezy is a neighborhood chore marketplace being built for the United States and Canada. Join the waitlist to find local help or earn close to home.";

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
    description: "Get local help or earn close to home. Chorezy is launching across the United States and Canada.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: "Get local help or earn close to home. Join the Chorezy North America waitlist.",
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
