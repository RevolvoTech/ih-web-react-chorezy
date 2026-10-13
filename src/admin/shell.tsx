"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconMessages,
  IconShieldCheck,
  IconGift,
  IconAlertTriangle,
  IconScan,
  IconLogout,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useAdmin } from "./auth";
import { AdminButton } from "./ui";

const sections = [
  {
    slug: "overview",
    title: "Account overview",
    icon: IconLayoutDashboard,
    description: "Accounts, roles and launch geography.",
  },
  {
    slug: "support",
    title: "User support",
    icon: IconMessages,
    description: "Conversations with people using Chorezy.",
  },
  {
    slug: "safety",
    title: "Safety",
    icon: IconShieldCheck,
    description: "Account context, restrictions and audit history.",
  },
  {
    slug: "emergency",
    title: "Emergency",
    icon: IconAlertTriangle,
    description: "Incident status and provider activity.",
  },
  {
    slug: "trust",
    title: "Trust review",
    icon: IconScan,
    description: "Risk signals and related case history.",
  },
  {
    slug: "referrals",
    title: "Referrals",
    icon: IconGift,
    description: "Invites, eligibility and reward activity.",
  },
];
export const adminSections = sections.map((item) => item.slug);
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { email, signOut } = useAdmin();
  const active =
    sections.find((item) => pathname.startsWith(`/admin/${item.slug}`)) ||
    sections[0];
  return (
    <div className="admin-shell">
      <a href="#admin-content" className="admin-skip">
        Skip to workspace
      </a>
      <aside className="admin-sidebar">
        <Link href="/admin/overview/" className="admin-brand">
          <Image src="/brand/logo-color.png" width={38} height={38} alt="" />
          <span>
            Chorezy<small>Staff workspace</small>
          </span>
        </Link>
        <nav aria-label="Admin sections">
          {sections.map((item) => (
            <Link
              key={item.slug}
              href={`/admin/${item.slug}/`}
              aria-current={item.slug === active.slug ? "page" : undefined}
            >
              <item.icon size={21} stroke={1.7} aria-hidden />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-note">
          <IconShieldCheck size={20} aria-hidden />
          <p>
            Staff access
            <br />
            <strong>Actions are recorded</strong>
          </p>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>Chorezy operations</span>
          <div>
            <span className="admin-staff-email">{email}</span>
            <AdminButton variant="secondary" onClick={() => void signOut()}>
              <IconLogout size={17} aria-hidden />
              Sign out
            </AdminButton>
          </div>
        </header>
        <main id="admin-content" tabIndex={-1}>
          <header className="admin-page-heading">
            <p className="admin-eyebrow">Operations / {active.title}</p>
            <h1>{active.title}</h1>
            <p>{active.description}</p>
          </header>
          {children}
        </main>
        <footer className="admin-footer">
          Chorezy staff workspace · Times shown in your device timezone.
        </footer>
      </div>
    </div>
  );
}
