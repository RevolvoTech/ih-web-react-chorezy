"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  IconLayoutDashboard,
  IconMessages,
  IconShieldCheck,
  IconGift,
  IconAlertTriangle,
  IconScan,
  IconLogout,
  IconSearch,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { useAdmin } from "./auth";
import { AdminButton } from "./ui";

const sections = [
  {
    slug: "overview",
    title: "Account overview",
    icon: IconLayoutDashboard,
    description: "Accounts, roles and launch geography.",
    accent: "blue",
    group: "Workspace",
  },
  {
    slug: "support",
    title: "User support",
    icon: IconMessages,
    description: "Conversations with people using Chorezy.",
    accent: "purple",
    group: "Workspace",
  },
  {
    slug: "safety",
    title: "Safety",
    icon: IconShieldCheck,
    description: "Account context, restrictions and audit history.",
    accent: "green",
    group: "Safety & trust",
  },
  {
    slug: "emergency",
    title: "Emergency",
    icon: IconAlertTriangle,
    description: "Incident status and provider activity.",
    accent: "orange",
    group: "Safety & trust",
  },
  {
    slug: "trust",
    title: "Trust review",
    icon: IconScan,
    description: "Risk signals and related case history.",
    accent: "pink",
    group: "Safety & trust",
  },
  {
    slug: "referrals",
    title: "Referrals",
    icon: IconGift,
    description: "Invites, eligibility and reward activity.",
    accent: "blue",
    group: "Growth",
  },
];
export const adminSections = sections.map((item) => item.slug);
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lookup, setLookup] = useState("");
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
          {sections.map((item, index) => (
            <div className="admin-nav-item" key={item.slug}>
              {sections[index - 1]?.group !== item.group && (
                <p className="admin-nav-group">{item.group}</p>
              )}
              <Link
                href={`/admin/${item.slug}/`}
                data-accent={item.accent}
                aria-current={item.slug === active.slug ? "page" : undefined}
              >
                <span className="admin-nav-icon">
                  <item.icon size={21} stroke={1.7} aria-hidden />
                </span>
                <span>{item.title}</span>
              </Link>
            </div>
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
          <form
            className="admin-account-lookup"
            onSubmit={(event) => {
              event.preventDefault();
              if (lookup.trim())
                router.push(
                  `/admin/safety/?identifier=${encodeURIComponent(lookup.trim())}`,
                );
            }}
          >
            <label>
              <span className="visually-hidden">
                Find an account by email, phone or ID
              </span>
              <IconSearch size={19} aria-hidden />
              <input
                type="search"
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                placeholder="Find an account · email, phone or ID"
                maxLength={160}
                required
              />
            </label>
            <AdminButton
              type="submit"
              variant="secondary"
              disabled={!lookup.trim()}
            >
              Look up
            </AdminButton>
          </form>
          <div className="admin-staff-controls">
            <span className="admin-staff-email">{email}</span>
            <AdminButton variant="secondary" onClick={() => void signOut()}>
              <IconLogout size={17} aria-hidden />
              Sign out
            </AdminButton>
          </div>
        </header>
        <main id="admin-content" tabIndex={-1}>
          <header className="admin-page-heading">
            <p className="admin-eyebrow">{active.group}</p>
            <h1>{active.title}</h1>
            <p>{active.description}</p>
          </header>
          {children}
        </main>
        <footer className="admin-footer">
          <span>
            Chorezy staff workspace · Times shown in your device timezone.
          </span>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            Open Chorezy website <IconArrowUpRight size={15} aria-hidden />
          </Link>
        </footer>
      </div>
    </div>
  );
}
