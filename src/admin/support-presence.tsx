"use client";
import { useEffect, useRef } from "react";
import { useAdmin } from "./auth";
import { canAct, useWorkspace } from "./workspace-state";
/** Only a visible support workspace records staff support activity. */
export function SupportActivityHeartbeat() {
  const { api } = useAdmin();
  const { authority } = useWorkspace();
  const permitted = canAct(authority, "support.write");
  const session = useRef<{ id: string; sequence: number } | null>(null);
  useEffect(() => {
    if (!permitted) return;
    session.current ??= { id: crypto.randomUUID(), sequence: 0 };
    const current = session.current;
    let disposed = false;
    let pending = false;
    async function send() {
      if (pending || disposed || document.visibilityState !== "visible") return;
      pending = true;
      try {
        await api.supportPresence({
          sessionId: current.id,
          sequence: ++current.sequence,
        });
      } catch {
        /* A failed heartbeat never advances the server's last activity. */
      } finally {
        pending = false;
      }
    }
    void send();
    const timer = setInterval(() => void send(), 25000);
    document.addEventListener("visibilitychange", send);
    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", send);
    };
  }, [api, permitted]);
  return null;
}
