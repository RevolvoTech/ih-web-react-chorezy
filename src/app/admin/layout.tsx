import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuth } from "@/admin/auth";
import { AdminShell } from "@/admin/shell";
import "./admin.css";

export const metadata: Metadata = {
  title: "Chorezy admin",
  description: "Authorized Chorezy staff workspace.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: null },
};
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="chorezy-admin">
      <AdminAuth>
        <AdminShell>{children}</AdminShell>
      </AdminAuth>
    </div>
  );
}
