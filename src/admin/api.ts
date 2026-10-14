import type {
  EmergencyDashboard,
  EmergencyIncident,
  Geography,
  ReferralDashboard,
  Referrer,
  ReferralStats,
  SafetyContext,
  SafetyPayload,
  SafetyResponse,
  SupportInbox,
  SupportTicket,
  SupportMessage,
  TrustCase,
  TrustDashboard,
  TrustEvent,
} from "./contracts";
import type {
  Page,
  StaffAuthority,
  AttentionCounts,
  AttentionRecord,
  LookupRecord,
  ChoreCaseFile,
  CaseConversation,
  MarketplaceMessage,
  MoneyRecord,
  InternalNote,
  SupportAction,
  AuditEvent,
  LinkedRecord,
  UserProfile,
  UserFinance,
  Investigation,
  PreservationDiagnostic,
} from "./workspace-contracts";

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}
export type TokenProvider = () => Promise<string | null>;
export function withTimeout<T>(
  work: PromiseLike<T>,
  message: string,
  milliseconds = 12000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    Promise.resolve(work).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
export function normalizeApiBase(value: string) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Use an HTTP API URL without credentials, query or fragment.",
    );
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  )
    throw new Error("The staff API must use HTTPS outside localhost.");
  return value.replace(/\/+$/, "").replace(/\/api\/v1$/, "") + "/api/v1/admin";
}
export function createAdminApi(
  base: string,
  tokenProvider: TokenProvider,
  fetcher: typeof fetch = fetch,
) {
  const endpoint = normalizeApiBase(base);
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await withTimeout(
      tokenProvider(),
      "Staff session lookup timed out. Sign in again.",
    );
    if (!token) {
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("chorezy-admin-access-revoked"));
      throw new AdminApiError(
        401,
        "SESSION_REQUIRED",
        "Your staff session has ended. Sign in again.",
      );
    }
    const response = await fetcher(`${endpoint}${path}`, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(20000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.success === false) {
      if (
        (response.status === 401 ||
          (response.status === 403 &&
            ![
              "STAFF_CAPABILITY_REQUIRED",
              "STAFF_MFA_REQUIRED",
              "TICKET_OWNER_REQUIRED",
            ].includes(body?.code))) &&
        typeof window !== "undefined"
      )
        window.dispatchEvent(new Event("chorezy-admin-access-revoked"));
      throw new AdminApiError(
        response.status,
        body?.code || "ADMIN_REQUEST_FAILED",
        body?.message || `Request failed (${response.status}). Please retry.`,
      );
    }
    if (!body || typeof body !== "object")
      throw new AdminApiError(
        502,
        "INVALID_RESPONSE",
        "The API returned an unreadable response.",
      );
    return body as T;
  }
  const data = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const body = await request<{ data: T }>(path, init);
    if (body.data === undefined)
      throw new AdminApiError(
        502,
        "MISSING_DATA",
        "The API response is missing its data.",
      );
    return body.data;
  };
  const query = (values: Record<string, string | number>) =>
    `?${new URLSearchParams(Object.entries(values).map(([k, v]) => [k, String(v)]))}`;
  const unconfirmedInvestigation = () =>
    new AdminApiError(502, "INVESTIGATION_RESULT_UNCONFIRMED", "The investigation result could not be confirmed. Refresh this account before retrying.");
  const confirmedInvestigation = (record: Investigation, id: string) => {
    if (!record || typeof record !== "object" || Array.isArray(record) ||
        !/^[a-f\d]{24}$/i.test(record.id || "") || typeof record.userId !== "string" ||
        record.userId.toLowerCase() !== id.toLowerCase() ||
        !["active", "released"].includes(record.status) ||
        !["pending", "active", "released"].includes(record.preservation?.status || ""))
      throw unconfirmedInvestigation();
    return record;
  };
  return {
    overview: (days = 30) =>
      data<Geography>(`/platform-analytics/world-domination${query({ days })}`),
    staffAuthority: () => data<StaffAuthority>("/workspace/me"),
    supportPresence: (payload: { sessionId: string; sequence: number }) =>
      data<{
        lastActiveAt: string;
        checkedAt: string;
        heartbeatExpirySeconds: number;
      }>("/workspace/support-presence", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    attentionCounts: () => data<AttentionCounts>("/workspace/attention/counts"),
    attention: (kind: string, cursor = "") =>
      data<Page<AttentionRecord>>(
        `/workspace/attention/${encodeURIComponent(kind)}${query({ cursor })}`,
      ),
    lookup: (identifier: string) =>
      data<LookupRecord[]>(`/workspace/lookup${query({ identifier })}`),
    investigations: (id: string, cursor = "") =>
      data<Page<Investigation>>(
        `/workspace/users/${encodeURIComponent(id)}/investigations${query({ cursor })}`,
      ),
    createInvestigation: async (
      id: string,
      payload: { reason: string; publicMessage: string; requestKey: string },
    ) => {
      const record = confirmedInvestigation(await data<Investigation>(
        `/workspace/users/${encodeURIComponent(id)}/investigations`,
        { method: "POST", body: JSON.stringify(payload) },
      ), id);
      if (record.status !== "active") throw new AdminApiError(409, "INVESTIGATION_ALREADY_RELEASED", "This investigation was already released. Refresh this account to review its current restrictions.");
      return record;
    },
    releaseInvestigation: async (
      id: string,
      investigationId: string,
      reason: string,
    ) => {
      const receipt = await data<{ id: string; status: string }>(
        `/workspace/users/${encodeURIComponent(id)}/investigations/${encodeURIComponent(investigationId)}/release`,
        { method: "POST", body: JSON.stringify({ reason }) },
      );
      if (!receipt || receipt.id !== investigationId || receipt.status !== "released") throw unconfirmedInvestigation();
      return receipt;
    },
    retryPreservation: async (id: string, investigationId: string, reason: string) => {
      const record = confirmedInvestigation(await data<Investigation>(
        `/workspace/users/${encodeURIComponent(id)}/investigations/${encodeURIComponent(investigationId)}/preservation/retry`,
        { method: "POST", body: JSON.stringify({ reason }) },
      ), id);
      if (record.id !== investigationId) throw unconfirmedInvestigation();
      return record;
    },
    preservationDiagnostic: async (
      id: string,
      investigationId: string,
      reason: string,
    ) => {
      const receipt = await data<PreservationDiagnostic>(
        `/workspace/users/${encodeURIComponent(id)}/investigations/${encodeURIComponent(investigationId)}/preservation/diagnostic`,
        { method: "POST", body: JSON.stringify({ reason }) },
      );
      if (!receipt || receipt.investigationId !== investigationId || receipt.gateRelaxed !== false || !Array.isArray(receipt.observations)) throw unconfirmedInvestigation();
      return receipt;
    },
    releasePreservation: async (
      id: string,
      investigationId: string,
      reason: string,
    ) => {
      const receipt = await data<{ id: string; preservationStatus: string }>(
        `/workspace/users/${encodeURIComponent(id)}/investigations/${encodeURIComponent(investigationId)}/preservation/release`,
        { method: "POST", body: JSON.stringify({ reason }) },
      );
      if (!receipt || receipt.id !== investigationId || receipt.preservationStatus !== "released") throw unconfirmedInvestigation();
      return receipt;
    },
    choreCase: (id: string) =>
      data<ChoreCaseFile>(`/workspace/chores/${encodeURIComponent(id)}`),
    caseEvidence: (
      id: string,
      payload: {
        group: string;
        index: number;
        conversationId?: string;
        messageId?: string;
      },
    ) =>
      data<{ url: string; expiresAt: string; type: string; filename: string }>(
        `/workspace/chores/${encodeURIComponent(id)}/evidence/access`,
        { method: "POST", body: JSON.stringify(payload) },
      ),
    caseConversations: (id: string, cursor = "") =>
      data<Page<CaseConversation>>(
        `/workspace/chores/${encodeURIComponent(id)}/conversations${query({ cursor })}`,
      ),
    caseMessages: (id: string, conversation: string, cursor = "") =>
      data<Page<MarketplaceMessage>>(
        `/workspace/chores/${encodeURIComponent(id)}/conversations/${encodeURIComponent(conversation)}/messages${query({ cursor })}`,
      ),
    caseMoney: (id: string, kind: string, cursor = "") =>
      data<Page<MoneyRecord> & { correlationNote: string }>(
        `/workspace/chores/${encodeURIComponent(id)}/money/${encodeURIComponent(kind)}${query({ cursor })}`,
      ),
    caseRecords: (id: string, kind: string, cursor = "") =>
      data<Page<LinkedRecord>>(
        `/workspace/chores/${encodeURIComponent(id)}/records/${encodeURIComponent(kind)}${query({ cursor })}`,
      ),
    userProfile: (id: string) =>
      data<UserProfile>(`/workspace/users/${encodeURIComponent(id)}/profile`),
    userFinance: (id: string) =>
      data<UserFinance>(`/workspace/users/${encodeURIComponent(id)}/finance`),
    userTransactions: (id: string, cursor = "") =>
      data<Page<MoneyRecord>>(
        `/workspace/users/${encodeURIComponent(id)}/transactions${query({ cursor })}`,
      ),
    userChores: (id: string, cursor = "") =>
      data<Page<{ id: string; title: string; status: string; role: string }>>(
        `/workspace/users/${encodeURIComponent(id)}/chores${query({ cursor })}`,
      ),
    userVerification: (id: string, kind: string, cursor = "") =>
      data<Page<Record<string, unknown>> & { providerNote: string }>(
        `/workspace/users/${encodeURIComponent(id)}/verification/${encodeURIComponent(kind)}${query({ cursor })}`,
      ),
    audit: (scopeType: string, scopeId: string, cursor = "") =>
      data<Page<AuditEvent>>(
        `/workspace/audit/${encodeURIComponent(scopeType)}/${encodeURIComponent(scopeId)}${query({ cursor })}`,
      ),
    supportMessages: (id: string, cursor = "") =>
      data<Page<SupportMessage>>(
        `/support-chat/tickets/${encodeURIComponent(id)}/messages${query({ cursor })}`,
      ),
    supportTicket: (id: string) =>
      data<SupportTicket>(`/support-chat/tickets/${encodeURIComponent(id)}`),
    supportNotes: (id: string, cursor = "") =>
      data<Page<InternalNote>>(
        `/support-chat/tickets/${encodeURIComponent(id)}/notes${query({ cursor })}`,
      ),
    supportWorkflow: (id: string, payload: SupportAction) =>
      data<{ version?: number; noteId?: string; replayed?: boolean }>(
        `/support-chat/tickets/${encodeURIComponent(id)}/workflow`,
        { method: "POST", body: JSON.stringify(payload) },
      ),
    support: (search = "", status = "all", cursor = "") =>
      request<SupportInbox>(
        `/support-chat/tickets${query({ query: search, status: status === "unread" ? "all" : status, unread: status === "unread" ? "true" : "false", cursor, includeMessages: "false" })}`,
      ),
    reply: (ticketId: string, body: string, clientRequestId: string) =>
      request<{ message: SupportMessage }>(
        `/support-chat/tickets/${encodeURIComponent(ticketId)}/messages`,
        { method: "POST", body: JSON.stringify({ body, clientRequestId }) },
      ),
    safety: (identifier: string) =>
      data<SafetyContext>(`/safety/context${query({ identifier })}`),
    applySafety: (payload: SafetyPayload) =>
      request<SafetyResponse>("/safety/actions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    revokeSafety: (actionId: string, reason: string) =>
      request<SafetyResponse>(
        `/safety/actions/${encodeURIComponent(actionId)}/revoke`,
        { method: "POST", body: JSON.stringify({ reason }) },
      ),
    referrals: async (search = ""): Promise<ReferralDashboard> => {
      const [stats, referrers] = await Promise.all([
        data<ReferralStats>("/referrals/stats"),
        data<Referrer[]>(
          `/referrals/referrers${query({ search, limit: 100 })}`,
        ),
      ]);
      return { stats, referrers };
    },
    releaseReferrals: (limit = 100) =>
      data<{ released: number; totalReleasedCents: number; blocked: number }>(
        "/referrals/release-eligible",
        { method: "POST", body: JSON.stringify({ limit }) },
      ),
    trust: async (search = "", status = "active"): Promise<TrustDashboard> => {
      const [summary, cases, events] = await Promise.all([
        data<TrustDashboard["summary"]>("/trust-review/summary"),
        data<TrustCase[]>(
          `/trust-review/cases${query({ search, status, limit: 100 })}`,
        ),
        data<TrustEvent[]>(
          `/trust-review/events${query({ search, limit: 80 })}`,
        ),
      ]);
      return { summary, cases, events };
    },
    trustCase: (id: string) =>
      data<TrustCase>(`/trust-review/cases/${encodeURIComponent(id)}`),
    emergencies: async (status = "active"): Promise<EmergencyDashboard> => {
      const [summary, incidents] = await Promise.all([
        data<EmergencyDashboard["summary"]>("/emergency-operations/summary"),
        data<EmergencyIncident[]>(
          `/emergency-operations/incidents${query({ status, limit: 100 })}`,
        ),
      ]);
      return { summary, incidents };
    },
    emergency: (id: string) =>
      data<EmergencyIncident>(
        `/emergency-operations/incidents/${encodeURIComponent(id)}`,
      ),
  };
}
export type AdminApi = ReturnType<typeof createAdminApi>;
