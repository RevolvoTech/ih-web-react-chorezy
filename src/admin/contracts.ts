/** Contracts mirror the Chorezy Express admin serializers, not Revolvo demo data. */
export type RecordValue = string | number | boolean | null | undefined;
export interface Person {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  safetyId?: string;
  phone?: string;
  phoneNumber?: string;
  location?: string;
  accountStatus?: string;
  isActive?: boolean;
}
export interface SupportMessage {
  id: string;
  body: string;
  senderType: string;
  senderName?: string;
  deliveryStatus?: string;
  createdAt: string;
  clientRequestId?: string;
  attachments?: { url?: string; name?: string; type?: string }[];
}
export interface SupportTicket {
  id: string;
  version: number;
  assignedAgentId?: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  customer: Person;
  assignedTo: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  messages: SupportMessage[];
  context?: Record<string, unknown>;
}
export interface SupportInbox {
  tickets: SupportTicket[];
  metrics: { open: number; urgent: number };
  nextCursor?: string | null;
}
export interface SafetyAction {
  id: string;
  actionId: string;
  actionType: string;
  status: string;
  scope: SafetyScope;
  permanent?: boolean;
  reasonLabel: string;
  internalNote?: string;
  publicMessage?: string;
  evidenceSummary?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy?: { name?: string; email?: string };
  revocationReason?: string;
}
export interface SafetyScope {
  account: boolean;
  device?: boolean;
  ip?: boolean;
  ipDeviceHash?: boolean;
}
export interface SafetyPayload {
  targetUserId: string;
  actionType: string;
  durationMinutes: number;
  reasonCode: string;
  reasonLabel: string;
  internalNote: string;
  publicMessage: string;
  evidenceSummary: string;
  scope: SafetyScope;
  signals?: {
    deviceIds: string[];
    ipAddresses: string[];
    deviceHashes: string[];
  };
}
export interface SafetyContext {
  financeAccess?: boolean;
  user: Person & {
    verification?: Record<string, RecordValue>;
    sessions?: { activeCount: number };
  };
  matches: Person[];
  summary: {
    activeRestrictions: number;
    openChores: number;
    openSupportTickets: number;
    paymentIssues?: number;
  };
  signals: {
    deviceIds: string[];
    ipAddresses: string[];
    deviceHashes: string[];
  };
  safetyActions: SafetyAction[];
  activeRestrictions: SafetyAction[];
  chores: SafetyRecord[];
  conversations: SafetyRecord[];
  payments?: SafetyRecord[];
  transactions?: SafetyRecord[];
  supportTickets: SafetyRecord[];
}
export interface SafetyRecord {
  id: string;
  title?: string;
  choreTitle?: string;
  ticketNumber?: string;
  subject?: string;
  description?: string;
  type?: string;
  status?: string;
  amount?: number;
  amountCents?: number;
  currency?: string;
  reference?: string;
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  choreId?: string;
}
export interface SafetyResponse {
  data: SafetyContext;
  message: string;
  warnings?: string[];
}
export interface Geography {
  generatedAt: string;
  summary: {
    totalUsers: number;
    period: number;
    activeAccounts: number;
    verifiedAccounts: number;
    loggedInPeriod: number;
  };
  range: { days: number; from: string; to: string };
  tracking: {
    coverageRate: number;
    unknownLocationUsers: number;
    usaUnmappedUsers: number;
    outsideUsaUsers: number;
  };
  roles: { label: string; count: number }[];
  states: { code: string; name: string; total: number; period: number }[];
  series: { date: string; total: number }[];
}
export interface ReferralStats {
  overview: {
    totalReferrals: number;
    activeReferrals: number;
    pendingRewardCents: number;
    paidRewardCents: number;
  };
  conversionRate: string;
}
export interface Referrer {
  referrerId: string;
  fullName: string;
  email: string;
  role: string;
  invitedCount: number;
  qualifiedCount: number;
  rewardedCount: number;
  pendingRewardCents: number;
  earnedRewardCents: number;
  blockedCount: number;
}
export interface ReferralDashboard {
  stats: ReferralStats;
  referrers: Referrer[];
}
export interface TrustEvent {
  id: string;
  kind: string;
  severity: string;
  summary: string;
  outcome?: string;
  createdAt: string;
  choreId?: string;
  targetUserId?: string;
  targetBusinessId?: string;
  supportTicketId?: string;
  conversationId?: string;
}
export interface TrustCase {
  id: string;
  caseNumber: string;
  status: string;
  severity: string;
  reason: string;
  summary: string;
  targetRole: string;
  targetUserId?: string;
  targetBusinessId?: string;
  targetUser?: Person;
  targetBusiness?: { name?: string };
  metrics?: Record<string, number>;
  relatedChoreIds: string[];
  relatedConversationIds: string[];
  supportTicketIds: string[];
  thresholds: string[];
  signalTypes: string[];
  lastActivityAt: string;
  events: TrustEvent[];
}
export interface TrustDashboard {
  summary: {
    cases: { watching: number; needsReview: number; highSeverity: number };
    events24h: {
      total: number;
      weakEvidence: number;
      unsupportedDisputes: number;
    };
  };
  cases: TrustCase[];
  events: TrustEvent[];
}
export interface EmergencyIncident {
  id: string;
  status: string;
  triggeredAt: string;
  description?: string;
  subject?: Person;
  reporter?: Person;
  chore?: { id: string; title: string; address?: string };
  location?: { coordinates?: number[] };
  provider: {
    alarmId?: string;
    status?: string;
    mediaPending?: boolean;
    mode?: string;
    failureCode?: string;
    failureMessage?: string;
    dispatchPerformed?: boolean;
    webhookEvents?: {
      eventType?: string;
      type?: string;
      receivedAt?: string;
      createdAt?: string;
    }[];
    media?: {
      url?: string | null;
      attachedAt: string;
      requestedWindowSeconds?: number;
      windowSeconds?: number;
    }[];
  };
  locationHistory?: unknown[];
  auditTrail?: unknown[];
}
export interface EmergencyDashboard {
  summary: {
    active: number;
    responding: number;
    failed: number;
    last24Hours: number;
    provider: {
      mode?: string;
      configured?: boolean;
      dispatchAvailable?: boolean;
      liveDispatch?: boolean;
    };
  };
  incidents: EmergencyIncident[];
}
