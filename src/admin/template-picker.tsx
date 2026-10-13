"use client";
import { useId, useState } from "react";
import { AdminButton, ConfirmDialog, Notice } from "./ui";
import {
  templatesFor,
  unresolvedPlaceholders,
  type TemplateContext,
} from "./templates";
export function TemplatePicker({
  kind,
  context,
  value,
  onInsert,
  disabled = false,
  maxLength = 4000,
}: {
  kind: "support" | "restriction" | "internal";
  context?: TemplateContext;
  value: string;
  onInsert: (body: string) => void;
  disabled?: boolean;
  maxLength?: number;
}) {
  const id = useId();
  const [selection, setSelection] = useState("");
  const [preview, setPreview] = useState("");
  const [replace, setReplace] = useState(false);
  const templates = templatesFor(kind, context);
  return (
    <details className="admin-context-details admin-templates">
      <summary>Message templates</summary>
      <label htmlFor={`${id}-template`}>
        Choose a template
        <select
          id={`${id}-template`}
          value={selection}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            setSelection(next);
            setPreview(
              templates.find((template) => template.id === next)?.body || "",
            );
          }}
        >
          <option value="">Select a template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
      </label>
      {selection && (
        <>
          <label htmlFor={`${id}-preview`}>
            Edit the template preview
            <textarea
              id={`${id}-preview`}
              rows={4}
              value={preview}
              maxLength={maxLength}
              disabled={disabled}
              onChange={(event) => setPreview(event.target.value)}
            />
          </label>
          {unresolvedPlaceholders(preview) && (
            <Notice>
              Replace the text in double brackets before submitting the message
              or action.
            </Notice>
          )}
          {(value.trim() ? `${value}\n\n${preview}` : preview).length >
            maxLength && (
            <Notice error>
              The combined draft exceeds {maxLength.toLocaleString()}{" "}
              characters. Shorten it or replace the draft.
            </Notice>
          )}
          <div className="admin-actions">
            <AdminButton
              variant="secondary"
              disabled={
                disabled ||
                !preview.trim() ||
                (value.trim() ? `${value}\n\n${preview}` : preview).length >
                  maxLength
              }
              onClick={() =>
                onInsert(value.trim() ? `${value}\n\n${preview}` : preview)
              }
            >
              {value.trim() ? "Append to draft" : "Insert into draft"}
            </AdminButton>
            {value.trim() && (
              <AdminButton
                variant="secondary"
                disabled={
                  disabled || !preview.trim() || preview.length > maxLength
                }
                onClick={() => setReplace(true)}
              >
                Replace draft…
              </AdminButton>
            )}
          </div>
        </>
      )}
      {replace && (
        <ConfirmDialog
          title="Replace your draft?"
          label="Replace draft"
          busy={false}
          onClose={() => setReplace(false)}
          onConfirm={() => {
            onInsert(preview);
            setReplace(false);
          }}
        >
          <p>
            Your current unsent text will be replaced with the edited template
            preview.
          </p>
        </ConfirmDialog>
      )}
    </details>
  );
}
