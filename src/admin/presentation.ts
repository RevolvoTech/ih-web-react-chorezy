export type StatusTone = "danger" | "success" | "neutral";
const dangerousStates = new Set([
  "urgent",
  "high",
  "critical",
  "failed",
  "suspended",
  "needs_review",
  "permanent_suspension",
  "platform_exclusion",
]);
const successfulStates = new Set([
  "resolved",
  "active",
  "verified",
  "paid",
  "paid_out",
  "completed",
  "succeeded",
]);
export function statusTone(
  value: string,
  context: "default" | "emergency" = "default",
): StatusTone {
  const state = value.trim().toLowerCase();
  if (context === "emergency" && ["active", "responding"].includes(state))
    return "danger";
  return dangerousStates.has(state)
    ? "danger"
    : successfulStates.has(state)
      ? "success"
      : "neutral";
}
