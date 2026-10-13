import { notFound } from "next/navigation";
import { adminSections } from "@/admin/sections";
import { AdminSection } from "@/admin/pages";
export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!adminSections.includes(section)) notFound();
  return <AdminSection section={section} />;
}
