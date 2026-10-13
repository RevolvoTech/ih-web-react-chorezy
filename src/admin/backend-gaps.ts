/** Planning contracts only. These are not API endpoints or implemented controls. */
export type AdminContractGap = {
  feature:
    | "investigation"
    | "evidence_preservation"
    | "payment_hold"
    | "case_file"
    | "marketplace_transcript"
    | "money_timeline"
    | "failed_operations"
    | "restricted_support"
    | "chore_intervention"
    | "evidence_export"
    | "support_workflow"
    | "staff_permissions";
  requiredAuthority: string;
  missingContracts: readonly string[];
  verificationGate: string;
};
export const adminContractGaps: readonly AdminContractGap[] = [
  {
    feature: "investigation",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Case creation/read/update",
      "Until-released restriction policy",
      "Linked people/chore/payment IDs",
      "Audited release without lifting unrelated restrictions",
    ],
    verificationGate: "AM61 full scope, owner expiry policy",
  },
  {
    feature: "evidence_preservation",
    requiredAuthority: "Chorezy backend/storage",
    missingContracts: [
      "Scoped preservation snapshot",
      "Deletion/retention guards across chats, media, accounts and payments",
      "Audited hold release",
    ],
    verificationGate: "Retention and authorization regression checks; AM61",
  },
  {
    feature: "payment_hold",
    requiredAuthority: "Chorezy backend payment ledger",
    missingContracts: [
      "Specific settlement hold",
      "Hold/release/refund state machine",
      "Idempotent actions and reconciliation",
    ],
    verificationGate:
      "AM62; no duplicate refund/release, unrelated money unchanged",
  },
  {
    feature: "case_file",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Unified case lookup",
      "Scoped record pagination",
      "Provider/context correlation",
    ],
    verificationGate: "Complete records and staff access boundaries",
  },
  {
    feature: "marketplace_transcript",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Full chore-conversation messages",
      "Attachment/audio viewing authorization",
      "Guardian approval state",
    ],
    verificationGate:
      "Restricted staff access, full pagination, retention redactions",
  },
  {
    feature: "money_timeline",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Reconciled escrow, wallet, provider transfer/payout/refund timeline",
      "Provider references",
      "Explicit monetary units",
    ],
    verificationGate: "Cross-ledger reconciliation with sandbox fixtures",
  },
  {
    feature: "failed_operations",
    requiredAuthority: "Chorezy backend workers",
    missingContracts: [
      "Stuck operation queue",
      "Lease/attempt state",
      "Idempotent recovery action",
    ],
    verificationGate: "Lost acknowledgement/retry cannot charge or send twice",
  },
  {
    feature: "restricted_support",
    requiredAuthority: "Chorezy backend and mobile app",
    missingContracts: [
      "Limited-session support/appeal capability",
      "Restriction explanation",
      "Emergency capability for affected users",
    ],
    verificationGate: "Cannot access marketplace or bypass restriction; AM61",
  },
  {
    feature: "chore_intervention",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Authorized pause/cancel/escalation",
      "Participants notified",
      "Financial policy and recorded reason",
    ],
    verificationGate: "Role/lifecycle/settlement/emergency interaction",
  },
  {
    feature: "evidence_export",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Authorized scoped original-record export",
      "Export history and integrity manifest",
      "Temporary signed downloads",
    ],
    verificationGate:
      "No broad database export; legal/privacy sharing policy confirmed",
  },
  {
    feature: "support_workflow",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Resolve/reopen",
      "Priority and assignment changes",
      "Ticket internal notes",
      "Idempotent reply request IDs",
    ],
    verificationGate: "Audited ownership and duplicate-request tests",
  },
  {
    feature: "staff_permissions",
    requiredAuthority: "Supabase staff authority and Chorezy backend",
    missingContracts: [
      "Read/support/safety/finance role capabilities",
      "Privileged permanent/device/IP enforcement",
      "Action-specific authorization",
    ],
    verificationGate:
      "Backend currently checks a single is_admin predicate; granular roles need backend enforcement",
  },
];
