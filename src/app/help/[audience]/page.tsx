import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoveryPage } from "@/components/DiscoveryPage";
import { helpPages } from "@/content/discovery-pages";

type Props = { params: Promise<{ audience: string }> };

export function generateStaticParams() {
  return Object.keys(helpPages).map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { audience } = await params;
  const page = helpPages[audience as keyof typeof helpPages];
  if (!page) return {};
  return { title: page.seoTitle, description: page.description, alternates: { canonical: page.path } };
}

export default async function HelpPage({ params }: Props) {
  const { audience } = await params;
  const page = helpPages[audience as keyof typeof helpPages];
  if (!page) notFound();
  return <DiscoveryPage page={page} />;
}
