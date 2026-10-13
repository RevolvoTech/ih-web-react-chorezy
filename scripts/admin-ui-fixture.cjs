/* Local browser fixture only. No real users, credentials, provider calls or writes. */
module.exports = async (page) => {
  const origin = "http://127.0.0.1:4058";
  const at = "2026-10-13T16:00:00.000Z";
  const user = {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: "fixture.staff@example.invalid",
    app_metadata: {},
    user_metadata: {},
    created_at: at,
  };
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      aud: "authenticated",
      role: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.fixture-signature`;
  const person = {
    id: "000000000000000000000001",
    name: "Fixture Alex Morgan",
    email: "fixture.alex@example.invalid",
    role: "Adult Helper",
    safetyId: "CHU-FIXTURE-0001",
    phone: "+1 202-555-0101",
    phoneNumber: "+1 202-555-0101",
    accountStatus: "active",
    sessions: { activeCount: 1 },
  };
  const state = {
    admin: true,
    apiStatus: 200,
    errorPath: "",
    calls: [],
    messages: [
      {
        id: "m1",
        body: "Fixture message: I need help understanding my payment.",
        senderType: "user",
        senderName: person.name,
        deliveryStatus: "delivered",
        createdAt: at,
        attachments: [],
      },
    ],
    actions: [],
    releaseCount: 0,
  };
  const safety = () => ({
    user: person,
    matches: [person],
    signals: {
      deviceIds: ["fixture-device"],
      ipAddresses: ["192.0.2.1"],
      deviceHashes: ["fixture-hash"],
    },
    summary: {
      activeRestrictions: state.actions.filter(
        (item) => item.status === "active",
      ).length,
      openChores: 1,
      openSupportTickets: 1,
      paymentIssues: 0,
    },
    activeRestrictions: state.actions.filter(
      (item) => item.status === "active",
    ),
    safetyActions: state.actions,
    chores: [
      {
        id: "chore-fixture",
        title: "Water the garden",
        status: "assigned",
        amount: 25,
        currency: "USD",
        createdAt: at,
      },
    ],
    conversations: [
      {
        id: "conversation-fixture",
        choreTitle: "Water the garden",
        status: "active",
        messageCount: 4,
        updatedAt: at,
      },
    ],
    payments: [
      {
        id: "payment-fixture",
        status: "held_in_escrow",
        amount: 25,
        amountCents: 2500,
        currency: "USD",
        createdAt: at,
      },
    ],
    transactions: [
      {
        id: "transaction-fixture",
        type: "escrow_deposit",
        description: "Fixture $25 funding",
        status: "completed",
        amount: 25,
        amountCents: 2500,
        currency: "USD",
        reference: "fixture-ledger",
        createdAt: at,
      },
    ],
    supportTickets: [
      {
        id: "ticket-fixture",
        ticketNumber: "CH-FIXTURE-1",
        subject: "Payment question",
        status: "open",
        createdAt: at,
      },
    ],
  });
  const risk = {
    id: "case-fixture",
    caseNumber: "TR-FIXTURE-1",
    status: "watching",
    severity: "medium",
    reason: "dispute_pattern",
    summary: "Synthetic risk pattern for fixture rendering only.",
    targetRole: "Adult Helper",
    targetUserId: person.id,
    targetUser: person,
    metrics: { disputeReceived30d: 2, disputeLosses30d: 1 },
    relatedChoreIds: ["chore-fixture"],
    relatedConversationIds: ["conversation-fixture"],
    supportTicketIds: ["ticket-fixture"],
    thresholds: [],
    signalTypes: [],
    lastActivityAt: at,
    events: [],
  };
  const incident = {
    id: "incident-fixture",
    status: "active",
    triggeredAt: at,
    subject: person,
    reporter: { name: "Fixture Guardian" },
    chore: {
      id: "chore-fixture",
      title: "Water the garden",
      address: "Synthetic address, not a real incident",
    },
    location: { coordinates: [-77.0365, 38.8977] },
    provider: {
      alarmId: "fixture-alarm",
      status: "ACTIVE",
      mode: "sandbox",
      mediaPending: true,
      media: [],
      webhookEvents: [{ eventType: "alarm.created", receivedAt: at }],
    },
  };
  state.emptySupport = false;
  state.delayMs = 0;
  state.rpcDelayMs = 0;
  state.signInDelayMs = 0;
  state.supportReadDelayMs = 0;
  state.replyDelayMs = 0;
  state.replyFailureAfterCommit = false;
  // Runtime knobs are held by the automation process, not shipped in the app.
  globalThis.chorezyAdminFixture = state;
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Content-Type": "application/json",
    };
    const reply = (body, status = 200) =>
      route.fulfill({ status, headers, body: JSON.stringify(body) });
    if (url.origin === origin) return route.continue();
    if (request.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers });
    if (url.hostname === "chorezy-admin-fixture.supabase.co") {
      const delay =
        url.pathname === "/auth/v1/token"
          ? state.signInDelayMs
          : url.pathname === "/rest/v1/rpc/is_admin"
            ? state.rpcDelayMs
            : 0;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      if (url.pathname === "/auth/v1/token")
        return reply({
          access_token: token,
          refresh_token: "fixture-refresh-token",
          token_type: "bearer",
          expires_in: 3600,
          user,
        });
      if (url.pathname === "/rest/v1/rpc/is_admin") return reply(state.admin);
      if (url.pathname === "/auth/v1/user") return reply(user);
      if (url.pathname === "/auth/v1/logout") return reply({});
      return reply({ message: "Unsupported fixture authentication path" }, 404);
    }
    if (url.origin !== "http://127.0.0.1:4059")
      return route.abort("blockedbyclient");
    if (url.pathname === "/__fixture/control") {
      if (request.method() === "POST")
        Object.assign(state, request.postDataJSON());
      return reply({
        admin: state.admin,
        apiStatus: state.apiStatus,
        errorPath: state.errorPath,
        calls: state.calls,
        actionCount: state.actions.length,
        releaseCount: state.releaseCount,
      });
    }
    const path = url.pathname.replace("/api/v1/admin", "");
    state.calls.push({ path, method: request.method() });
    if (path === "/support-chat/tickets" && state.supportReadDelayMs)
      await new Promise((resolve) => setTimeout(resolve, state.supportReadDelayMs));
    if (state.delayMs)
      await new Promise((resolve) => setTimeout(resolve, state.delayMs));
    if (state.apiStatus !== 200 || state.errorPath === path)
      return reply(
        {
          success: false,
          code:
            state.apiStatus === 400 ? "APP_VERSION_REQUIRED" : "FIXTURE_ERROR",
          message: `Fixture request failure (${state.apiStatus === 200 ? 503 : state.apiStatus})`,
        },
        state.apiStatus === 200 ? 503 : state.apiStatus,
      );
    if (path === "/support-chat/tickets" && state.emptySupport)
      return reply({ tickets: [], metrics: { open: 0, urgent: 0 } });
    if (path === "/platform-analytics/world-domination")
      return reply({
        data: {
          generatedAt: at,
          summary: {
            totalUsers: 14,
            period: 4,
            activeAccounts: 12,
            verifiedAccounts: 9,
            loggedInPeriod: 8,
          },
          range: { days: 30, from: "2026-09-13", to: "2026-10-13" },
          tracking: {
            coverageRate: 71.4,
            unknownLocationUsers: 4,
            usaUnmappedUsers: 1,
            outsideUsaUsers: 1,
          },
          roles: [
            { label: "Adult Helper", count: 4 },
            { label: "Chore Poster", count: 4 },
            { label: "Young Helper", count: 2 },
            { label: "Guardian", count: 2 },
            { label: "Business", count: 2 },
          ],
          states: [
            { code: "CA", name: "California", total: 4, period: 2 },
            { code: "TX", name: "Texas", total: 3, period: 1 },
          ],
          series: [],
        },
      });
    if (path === "/support-chat/tickets")
      return reply({
        tickets: [1, 2].map((number) => ({
          id: `ticket-${number}`,
          ticketNumber: `CH-FIXTURE-${number}`,
          subject:
            number === 1 ? "Payment question" : "Chore scheduling question",
          status: "open",
          priority: number === 1 ? "urgent" : "medium",
          category: "payments",
          customer: person,
          assignedTo: "Unassigned",
          unreadCount: 1,
          lastMessage: state.messages.at(-1).body,
          lastMessageAt: at,
          messages: state.messages,
          context: {},
        })),
        metrics: { open: 2, urgent: 1 },
      });
    if (/^\/support-chat\/tickets\/ticket-[12]\/messages$/.test(path)) {
      if (state.replyDelayMs)
        await new Promise((resolve) => setTimeout(resolve, state.replyDelayMs));
      const body = request.postDataJSON().body;
      const message = {
        id: `m${state.messages.length + 1}`,
        body,
        senderType: "agent",
        senderName: "Fixture Staff",
        createdAt: at,
        attachments: [],
      };
      state.messages.push(message);
      if (state.replyFailureAfterCommit)
        return reply({ message: "Fixture lost acknowledgement after delivery" }, 503);
      return reply({ message });
    }
    if (path === "/safety/context") return reply({ data: safety() });
    if (path === "/safety/actions") {
      const body = request.postDataJSON();
      const action = {
        ...body,
        id: `action-${state.actions.length + 1}`,
        actionId: `SA-FIXTURE-${state.actions.length + 1}`,
        status: "active",
        createdAt: at,
        createdBy: { name: "Fixture Staff" },
        expiresAt: "2026-10-14T16:00:00Z",
        permanent: body.actionType === "permanent_suspension",
      };
      state.actions.push(action);
      return reply(
        {
          data: safety(),
          message: "Fixture safety action applied.",
          warnings: [],
        },
        201,
      );
    }
    if (path.endsWith("/revoke")) {
      const action = state.actions.find((item) => path.includes(item.actionId));
      action.status = "revoked";
      action.revocationReason = request.postDataJSON().reason;
      return reply({
        data: safety(),
        message: "Fixture safety action revoked.",
      });
    }
    if (path === "/referrals/stats")
      return reply({
        data: {
          overview: {
            totalReferrals: 12,
            activeReferrals: 4,
            pendingRewardCents: 2500,
            paidRewardCents: 5000,
          },
          conversionRate: "40.00",
        },
      });
    if (path === "/referrals/referrers")
      return reply({
        data: [
          {
            referrerId: person.id,
            fullName: person.name,
            email: person.email,
            role: person.role,
            invitedCount: 12,
            qualifiedCount: 6,
            rewardedCount: 5,
            pendingRewardCents: 2500,
            earnedRewardCents: 5000,
            blockedCount: 1,
          },
        ],
      });
    if (path === "/referrals/release-eligible") {
      state.releaseCount++;
      return reply({
        data: { released: 1, totalReleasedCents: 500, blocked: 0 },
      });
    }
    if (path === "/trust-review/summary")
      return reply({
        data: {
          cases: { watching: 1, needsReview: 0, highSeverity: 0 },
          events24h: { total: 1, weakEvidence: 0, unsupportedDisputes: 0 },
        },
      });
    if (path === "/trust-review/cases") return reply({ data: [risk] });
    if (path === "/trust-review/events") return reply({ data: [] });
    if (path === "/trust-review/cases/case-fixture")
      return reply({ data: risk });
    if (path === "/emergency-operations/summary")
      return reply({
        data: {
          active: 1,
          responding: 0,
          failed: 0,
          last24Hours: 1,
          provider: { mode: "sandbox", configured: true, liveDispatch: false },
        },
      });
    if (path === "/emergency-operations/incidents")
      return reply({ data: [incident] });
    if (path === "/emergency-operations/incidents/incident-fixture")
      return reply({ data: incident });
    return reply({ message: "Unsupported fixture API path" }, 404);
  });
  return {
    fixtureInstalled: true,
    authAndApiIntercepted: true,
    productionWrites: 0,
  };
};
