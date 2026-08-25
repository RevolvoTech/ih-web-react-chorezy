import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoveryPage } from "@/components/DiscoveryPage";
import { chorePages } from "@/content/discovery-pages";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return Object.keys(chorePages).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const page = chorePages[category as keyof typeof chorePages];
  if (!page) return {};
  return {
    title: page.seoTitle,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: { title: page.seoTitle, description: page.description, url: page.path, type: "website", siteName: "Chorezy", locale: "en_US" },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.description },
  };
}

export default async function ChorePage({ params }: Props) {
  const { category } = await params;
  const page = chorePages[category as keyof typeof chorePages];
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}
