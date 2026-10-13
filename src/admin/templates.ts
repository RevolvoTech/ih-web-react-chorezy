export interface MessageTemplate {
  id: string;
  label: string;
  body: string;
}
export interface TemplateContext {
  name?: string;
  choreId?: string;
  reason?: string;
  expiry?: string;
}
export function unresolvedPlaceholders(value: string) {
  return /\[\[[^\]]+\]\]/.test(value);
}
export function templatesFor(
  kind: "support" | "restriction" | "internal",
  context: TemplateContext = {},
): MessageTemplate[] {
  const name = context.name || "there";
  if (kind === "support")
    return [
      {
        id: "greeting",
        label: "Support greeting",
        body: `Hi ${name}, thanks for contacting Chorezy support. I'm here to help. Could you share [[what happened and when]]?`,
      },
      {
        id: "details",
        label: "Request chore details",
        body: `Hi ${name}, please share ${context.choreId ? `what happened on chore ${context.choreId}` : "the chore ID and what happened"}, the time of the issue, and any relevant screenshots or messages. Please avoid sending passwords or payment card details.`,
      },
      {
        id: "payment",
        label: "Checking a payment",
        body: `Hi ${name}, we're checking the payment record${context.choreId ? ` for chore ${context.choreId}` : ""}. Please share the payment or chore reference and the status you see. We'll confirm the recorded outcome once we've reviewed it.`,
      },
      {
        id: "closing",
        label: "Optional closing message",
        body: `Hi ${name}, we'll close this support conversation for now because [[reason for closing]]. Your conversation history will be kept. If you still need help, reply to this ticket and it will reopen. Thank you for contacting Chorezy support.`,
      },
      {
        id: "inactivity",
        label: "Optional inactivity message",
        body: `Hi ${name}, we haven't heard back since [[last customer reply date]]. We'll close this support conversation for now. Your history will be kept, and replying to this ticket will reopen it if you still need help.`,
      },
    ];
  if (kind === "restriction")
    return [
      {
        id: "temporary",
        label: "Temporary restriction",
        body: `Your Chorezy account is temporarily restricted. Reason: ${context.reason || "[[restriction reason]]"}. The restriction ends ${context.expiry || "[[actual expiry date and time]]"}. Contact Chorezy support if you need to discuss this decision.`,
      },
      {
        id: "permanent",
        label: "Permanent restriction",
        body: `Your Chorezy account has been permanently restricted. Reason: ${context.reason || "[[restriction reason]]"}. Contact Chorezy support to request a review and include [[case or support reference]].`,
      },
    ];
  return [
    {
      id: "investigation",
      label: "Investigation note",
      body: "Report: [[report source and concern]]\nEvidence: [[record IDs and observed evidence]]\nAction: [[specific action and reason]]\nFollow-up: [[owner, next step and review date]]",
    },
  ];
}
