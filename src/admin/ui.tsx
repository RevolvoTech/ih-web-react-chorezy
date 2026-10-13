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
}: {
  title: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <section className={`admin-panel ${className}`}>
      <header className="admin-panel-header">
        <h2>{title}</h2>
        {aside}
      </header>
      {children}
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
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
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
export const humanize = (value: string) => value.replace(/[_-]/g, " ");
export function time(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
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
