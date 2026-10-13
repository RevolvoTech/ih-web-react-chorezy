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
  SupportMessage,
  TrustCase,
  TrustDashboard,
  TrustEvent,
} from "./contracts";

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
      if ([401, 403].includes(response.status) && typeof window !== "undefined")
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
  return {
    overview: (days = 30) =>
      data<Geography>(`/platform-analytics/world-domination${query({ days })}`),
    support: (search = "", status = "all") =>
      request<SupportInbox>(
        `/support-chat/tickets${query({ query: search, status })}`,
      ),
    reply: (ticketId: string, body: string) =>
      request<{ message: SupportMessage }>(
        `/support-chat/tickets/${encodeURIComponent(ticketId)}/messages`,
        { method: "POST", body: JSON.stringify({ body }) },
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
