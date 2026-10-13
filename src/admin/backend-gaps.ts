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
      "Durable until-released investigation freeze",
      "Audited release preserving overlapping restrictions",
      "Linked investigation lifecycle",
    ],
    verificationGate: "Restriction concurrency, appeal and emergency access",
  },
  {
    feature: "evidence_preservation",
    requiredAuthority: "Chorezy backend/storage",
    missingContracts: [
      "Durable scoped holds",
      "Shared renewable preservation/deletion leases",
      "Deletion and retention guards for approved record/media/account hooks",
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
      "Reviewed emergency boundary for restricted accounts",
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
