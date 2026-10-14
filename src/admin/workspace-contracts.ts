import type { Person } from "./contracts";
export interface Investigation {
  id: string;
  userId: string;
  status: "active" | "released";
  reason: string;
  publicMessage: string;
  createdBy: string;
  createdAt: string;
  releasedAt?: string;
  releaseReason?: string;
  preservation?: {
    status: "active" | "released" | "pending";
    coverage?: "current_records" | "prior_deletion_recorded";
    priorDeletionCount?: number;
    subjects?: string[];
    failureCode?: string;
  };
}
export interface PreservationDiagnostic {
  investigationId: string;
  preservationConfirmed: boolean;
  gateRelaxed: false;
  note: string;
  observations: {
    operationId: string;
    kind: string;
    phase: string;
    unresolved: true;
    observations: {
      keyHash: string;
      observation: string;
      observedAt: string;
    }[];
  }[];
}
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  pageSize: number;
}
export interface StaffAuthority {
  id: string;
  email: string;
  capabilities: string[];
  permissionsConfigured: boolean;
  mfaEnrolled: boolean;
  assuranceLevel: string;
}
export interface AttentionCounts {
  supportUnread: number;
  supportUnreadMessages: number;
  supportUnresolved: number;
  emergencyUnresolved: number;
  casesNeedingAttention: number;
  generatedAt: string;
  scope: "all_persisted_records";
}
export interface AttentionRecord {
  id: string;
  kind: string;
  ticketNumber?: string;
  subject?: string;
  status: string;
  priority?: string;
  unreadForSupport?: number;
  caseNumber?: string;
  summary?: string;
  severity?: string;
  choreId?: string;
  relatedChoreIds?: string[];
  targetUserId?: string;
  triggeredAt?: string;
  lastMessageAt?: string;
  lastActivityAt?: string;
  userId?: string;
}
export interface LookupRecord {
  id: string;
  type: string;
  label: string;
  choreId?: string;
  choreIds?: string[];
  userId?: string;
  person?: CasePerson;
}
export interface CasePerson extends Person {
  choreRole?: string;
  status?: string;
  verified?: boolean;
  guardians: {
    guardianId: string;
    relationship: string;
    approved: boolean;
    active: boolean;
    approvedAt?: string;
    relationshipVerified: boolean;
    trustStatus?: string;
  }[];
}
export interface EvidenceReference {
  group: string;
  index: number;
  filename: string;
  type: string;
  storageKey?: string;
  urlReference?: string;
  access: string;
  size?: number;
  duration?: number;
  uploadedAt?: string;
}
export interface ChoreCaseFile {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  financeAccess: boolean;
  paymentStatus?: string;
  participants: CasePerson[];
  acceptedBid: {
    id: string;
    amountCents?: number;
    currency?: string;
    message?: string;
    status: string;
    acceptedAt?: string;
    bidderId: string;
    priceHistory?: {
      previousAmountCents: number;
      amountCents: number;
      changedAt: string;
    }[];
  } | null;
  lifecycle: { kind: string; at: string }[];
  cancellationReason?: string;
  proof: {
    status?: string;
    submittedAt?: string;
    message?: string;
    reviewNote?: string;
    reviewedAt?: string;
    dispute: {
      status?: string;
      reason?: string;
      openedAt?: string;
      resolvedAt?: string;
      resolution?: string;
      resolutionState?: string;
      resolutionError?: string;
      response: { message?: string; submittedAt?: string };
      aiReview: {
        status?: string;
        provider?: string;
        model?: string;
        analyzedAt?: string;
        assessment?: string;
        confidence?: number;
        summary?: string;
        finalDecision?: string;
        finalDecisionSummary?: string;
        recommendedOutcome?: string;
        decisionFactors?: string[];
        scopeEvidence?: string[];
        visibleIssues?: string[];
        missingEvidence?: string[];
        errorMessage?: string;
      };
    };
  };
  evidence: EvidenceReference[];
  safetyRecording: {
    status?: string;
    uploadedAt?: string;
    deletedAt?: string;
    legalHold?: boolean;
  };
  counts: {
    conversations: number;
    payments?: number;
    trustEvents: number;
    emergencies: number;
  };
}
export interface UserProfile extends CasePerson {
  phoneNumber?: string;
  storedAccountStatus?: string;
  effectiveRestriction?: {
    code: string;
    type: string;
    message: string;
    expiresAt: string | null;
  } | null;
  rawIdentityDocumentsAvailable: false;
  verification: {
    level: string;
    lastUpdated?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    checks: {
      kind: string;
      verified: boolean;
      status: string;
      provider?: string;
      processedAt?: string;
      expiresAt?: string;
    }[];
  };
}
export interface UserFinance {
  userId: string;
  earnings: {
    currency: string;
    generatedAt: string;
    balances: Record<string, { amountCents: number; currency: string }>;
  } | null;
  earningsNote: string;
  payout: {
    stripeAccountId?: string;
    detailsSubmitted?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    lastStatusRefreshAt?: string;
    disabledReason?: string;
    requirementsCurrentlyDue?: string[];
    requirementsPastDue?: string[];
  } | null;
  payoutNote: string;
}
export interface CaseConversation {
  id: string;
  conversationType: string;
  guardianRequired: boolean;
  isGuardianApproved: boolean;
  conversationStatus: string;
  participants: { userId: string; role: string; active: boolean }[];
}
export interface MarketplaceMessage {
  id: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  guardianApprovalStatus?: string;
  moderationReason?: string;
  attachments: EvidenceReference[];
}
export interface MoneyRecord {
  id: string;
  kind: string;
  amountCents: number;
  currency?: string;
  status: string;
  originalAmount: number;
  originalUnit: "cents" | "dollars";
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  source?: string;
  paymentSource?: string;
  paymentId?: string;
  escrowId?: string;
  reference?: string;
  externalTransactionId?: string;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  tremendousOrderId?: string;
  tremendousRewardId?: string;
  refundedAt?: string;
  refundDestination?: string;
  holdReason?: string;
  platformFee?: number;
  balanceBeforeCents?: number;
  balanceAfterCents?: number;
}
export interface InternalNote {
  id: string;
  actorName: string;
  body: string;
  createdAt: string;
}
export interface SupportAction {
  action:
    | "mark_read"
    | "resolve"
    | "reopen"
    | "priority"
    | "assign_self"
    | "unassign"
    | "note";
  expectedVersion?: number;
  reason?: string;
  priority?: string;
  throughMessageId?: string;
  body?: string;
  clientRequestId?: string;
}
export interface AuditEvent {
  id: string;
  eventId: string;
  actorEmail: string;
  action: string;
  scopeType: string;
  scopeId: string;
  outcome: string;
  details: Record<string, unknown>;
  recordedAt: string;
  digest: string;
  signature: string;
  integrity: { valid: boolean; reason?: string };
}
export interface LinkedRecord {
  id: string;
  status?: string;
  kind?: string;
  summary?: string;
  outcome?: string;
  severity?: string;
  caseNumber?: string;
  ticketNumber?: string;
  subject?: string;
  createdAt?: string;
  triggeredAt?: string;
  relatedChoreIds?: string[];
  caseId?: string;
}
