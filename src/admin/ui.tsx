"use client";
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { statusTone } from "./presentation";

export function AdminButton({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={`admin-button admin-button--${variant} ${className}`}
      type="button"
      {...props}
    />
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`admin-notice ${error ? "admin-notice--error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Panel({
  title,
  children,
  className = "",
  aside,
  id,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
  id?: string;
  variant?: "default" | "padded";
}) {
  return (
    <section id={id} className={`admin-panel ${className}`}>
      <header className="admin-panel-header">
        <h2>{title}</h2>
        {aside}
      </header>
      {variant === "padded" ? (
        <div className="admin-panel-body">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
export function Metrics({
  values,
}: {
  values: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="admin-metrics">
      {values.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Status({
  children,
  context = "default",
}: {
  children: string;
  context?: "default" | "emergency";
}) {
  return (
    <span className="admin-status" data-tone={statusTone(children, context)}>
      {humanize(children)}
    </span>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="admin-empty">{children}</p>;
}
export function Fact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children ?? "Not available"}</dd>
    </div>
  );
}
export function ConfirmDialog({
  title,
  children,
  label,
  busy,
  confirmDisabled = false,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  label: string;
  busy: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="admin-dialog"
      aria-labelledby="admin-confirm-title"
      tabIndex={-1}
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const dialog = event.currentTarget;
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        if (!controls.length) {
          event.preventDefault();
          dialog.focus();
        } else if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
          event.preventDefault();
          controls[0].focus();
        }
      }}
    >
      <h2 id="admin-confirm-title">{title}</h2>
      {children}
      <div className="admin-actions">
        <AdminButton
          variant="secondary"
          disabled={busy}
          onClick={onClose}
          autoFocus
        >
          Cancel
        </AdminButton>
        <AdminButton
          variant="danger"
          disabled={busy || confirmDisabled}
          onClick={onConfirm}
        >
          {busy ? "Applying…" : label}
        </AdminButton>
      </div>
    </dialog>
  );
}
export function humanize(value: string) {
  const words = value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/[_ .-]+/g, " ")
    .trim()
    .toLowerCase();
  const acronyms: Record<string, string> = {
    ai: "AI",
    id: "ID",
    ip: "IP",
    s3: "S3",
    url: "URL",
    usd: "USD",
    otp: "OTP",
  };
  const result = words
    .split(" ")
    .map((word) => acronyms[word] || word)
    .join(" ");
  return result ? result[0].toUpperCase() + result.slice(1) : "Not recorded";
}
export function time(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Invalid timestamp"
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}
export function formatRecordValue(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return time(value.toISOString());
  if (Array.isArray(value))
    return value.length
      ? value.map(formatRecordValue).join(" · ")
      : "None recorded";
  if (typeof value === "object") {
    const fields = Object.entries(value);
    return fields.length
      ? fields
          .map(([key, item]) => `${humanize(key)}: ${formatRecordValue(item)}`)
          .join(" · ")
      : "Not recorded";
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return time(value);
  return String(value);
}
export function money(value?: number, currency = "USD", cents = false) {
  if (value === undefined || !Number.isFinite(value)) return "Not available";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cents ? value / 100 : value);
  } catch {
    return `${value} ${currency}`;
  }
}
export function safeMediaUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
