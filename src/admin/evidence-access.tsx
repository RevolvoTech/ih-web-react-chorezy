"use client";
import { useRef, useState } from "react";
import { useAdmin } from "./auth";
import { AdminButton, Notice, safeMediaUrl, time } from "./ui";

export function EvidenceAccess({
  choreId,
  group,
  index,
  conversationId,
  messageId,
}: {
  choreId: string;
  group: string;
  index: number;
  conversationId?: string;
  messageId?: string;
}) {
  const { api } = useAdmin();
  const [access, setAccess] = useState<{
    url: string;
    expiresAt: string;
    type: string;
    filename: string;
  } | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  async function request() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setAccess(null);
    try {
      const result = await api.caseEvidence(choreId, {
        group,
        index,
        conversationId,
        messageId,
      });
      if (!safeMediaUrl(result.url))
        throw new Error("The evidence download URL is unavailable.");
      setAccess(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Evidence could not be opened.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="admin-evidence-access">
      <AdminButton
        variant="secondary"
        disabled={busy}
        onClick={() => void request()}
      >
        {busy
          ? "Checking evidence…"
          : access
            ? "Refresh evidence link"
            : "Open recorded evidence"}
      </AdminButton>
      {error && <Notice error>{error}</Notice>}
      {access && (
        <>
          <a
            className="admin-text-link"
            href={access.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View {access.filename}
          </a>
          <small>Temporary link expires {time(access.expiresAt)}</small>
          {access.type === "voice" && (
            <audio
              controls
              preload="none"
              src={access.url}
              aria-label="Recorded voice evidence"
            />
          )}
          {access.type === "video" && (
            <video
              controls
              preload="none"
              src={access.url}
              aria-label="Recorded safety video"
            />
          )}
        </>
      )}
    </div>
  );
}
