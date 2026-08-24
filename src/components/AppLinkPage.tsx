"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/Brand";

type Action = "verify" | "reset" | "invite";

export function AppLinkPage({ action }: { action: Action }) {
  const searchParams = useSearchParams();
  const copy = {
    verify: ["Open Chorezy to verify your account", "This secure verification link is intended for the Chorezy mobile app."],
    reset: ["Open Chorezy to reset your password", "Password reset codes are completed securely inside the Chorezy mobile app."],
    invite: ["You have a Chorezy invitation", "Open the Chorezy mobile app to review and continue with this invitation."],
  }[action];
  const query = searchParams.toString();
  const deepLink = `choreify://${action}${query ? `?${query}` : ""}`;

  return (
    <main className="app-link-page">
      <Brand />
      <div className="app-link-card">
        <p className="eyebrow">Secure app link</p>
        <h1>{copy[0]}</h1>
        <p>{copy[1]}</p>
        <a className="button button--primary" href={deepLink}>Open Chorezy</a>
        <Link className="text-link" href="/">Return to chorezy.com</Link>
      </div>
    </main>
  );
}
