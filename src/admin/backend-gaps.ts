/** Remaining contracts only; implemented core workspace features are documented in docs/admin-workspace.md. */
export type AdminContractGap = {
  feature:
    | "investigation"
    | "evidence_preservation"
    | "payment_hold"
    | "money_timeline"
    | "failed_operations"
    | "restricted_support"
    | "chore_intervention"
    | "evidence_export";
  requiredAuthority: string;
  missingContracts: readonly string[];
  verificationGate: string;
};
export const adminContractGaps: readonly AdminContractGap[] = [
  {
    feature: "investigation",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Trusted production staff capability/audit provisioning and deployment",
      "Genuine current-MFA staff mutation verification",
      "Mobile restricted-account support/emergency integration",
    ],
    verificationGate: "Restriction concurrency, appeal and emergency access",
  },
  {
    feature: "evidence_preservation",
    requiredAuthority: "Chorezy backend/storage",
    missingContracts: [
      "Operational quiescence proof and separately authorized uncertain-delete reconciliation",
      "Managed audit key rotation/retention and storage preservation operations",
      "Deployed owned-record checks for the implemented deletion/retention hooks",
    ],
    verificationGate: "Competing hold/delete and storage race tests",
  },
  {
    feature: "payment_hold",
    requiredAuthority: "Chorezy payment ledger",
    missingContracts: [
      "Specific settlement hold/release/refund policy",
      "Idempotent financial state machine and reconciliation",
    ],
    verificationGate:
      "Separate owner authorization and owned provider sandbox checks",
  },
  {
    feature: "money_timeline",
    requiredAuthority: "Chorezy payment ledger",
    missingContracts: [
      "Provider payout/recovery reconciliation beyond persisted references",
      "Complete cross-ledger correlation of unlinked account payouts",
    ],
    verificationGate:
      "Financial unit/correlation and owned sandbox reconciliation checks",
  },
  {
    feature: "failed_operations",
    requiredAuthority: "Chorezy workers",
    missingContracts: [
      "Stuck operation queue",
      "Lease/attempt state and idempotent recovery",
    ],
    verificationGate: "Lost acknowledgement cannot charge or send twice",
  },
  {
    feature: "restricted_support",
    requiredAuthority: "Chorezy backend and mobile app",
    missingContracts: [
      "Mobile integration for the implemented limited support challenge/session",
      "Native own-ticket/appeal and participant-authorized emergency verification",
    ],
    verificationGate:
      "No marketplace bypass; own-ticket/appeal/emergency access",
  },
  {
    feature: "chore_intervention",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Authorized pause/cancel/escalation",
      "Recorded reason, notifications and financial policy",
    ],
    verificationGate: "Role, lifecycle, settlement and emergency interactions",
  },
  {
    feature: "evidence_export",
    requiredAuthority: "Chorezy backend",
    missingContracts: [
      "Scoped original-record export",
      "Integrity manifest and export history",
      "Sharing and privacy policy",
    ],
    verificationGate: "Separate export authority; no broad database export",
  },
];
