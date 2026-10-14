/* Intercepted browser fixtures for new workspace contracts. Never a server or provider client. */
module.exports = (state, person, at) => {
  const choreId = "000000000000000000000101";
  const conversationId = "000000000000000000000201";
  state.capabilities = [
    "workspace.read",
    "case.read",
    "finance.read",
    "support.read",
    "support.write",
    "safety.write",
    "safety.privileged",
    "referrals.write",
    "audit.read",
    "investigation.write",
  ];
  state.assuranceLevel = "aal2";
  state.permissionsConfigured = true;
  state.ticketVersion = 0;
  state.ticketStatus = "open";
  state.ticketPriority = "urgent";
  state.notes = [];
  state.replyKeys = {};
  state.investigations = [];
  state.investigationCreates = 0;
  state.investigationReleases = 0;
  state.preservationReleases = 0;
  state.preservationRetries = 0;
  state.storageDiagnostics = 0;
  state.preservationPending = false;
  const counts = () => ({
    supportUnread: state.readAcknowledged ? 0 : 2,
    supportUnreadMessages: state.readAcknowledged ? 0 : 3,
    supportUnresolved: state.ticketStatus === "resolved" ? 1 : 3,
    emergencyUnresolved: 2,
    casesNeedingAttention: 1 + state.investigations.filter((item) => item.status === "active" || ["active", "pending"].includes(item.preservation.status)).length,
    generatedAt: at,
    scope: "all_persisted_records",
  });
  const ticket = (id) => ({
    id,
    version: state.ticketVersion,
    ticketNumber: "CH-FIXTURE-1",
    subject: "Payment question",
    status: state.ticketStatus,
    priority: state.ticketPriority,
    category: "payments",
    customer: person,
    assignedTo: state.assigned ? "Fixture Staff" : "Unassigned",
    assignedAgentId: state.assigned ? "fixture-staff" : null,
    unreadCount: state.readAcknowledged ? 0 : 1,
    lastMessage: state.messages.at(-1).body,
    lastMessageAt: at,
    messages: [],
    context: { choreId },
  });
  const page = (items, cursor = null) => ({
    items,
    nextCursor: cursor,
    pageSize: 30,
  });
  const evidence = {
    group: "completionPhotos",
    index: 0,
    filename: "Fixture original proof.jpg",
    type: "file",
    storageKey: `ih/app/node/chorezy/chores/${choreId}/image/proof.jpg`,
    access: "authenticated_signed_download",
    size: 1024,
    uploadedAt: at,
  };
  return async ({ path, url, request, reply }) => {
    const respond = async (data, status = 200) => {
      await reply({ success: true, data }, status);
      return true;
    };
    if (path === "/workspace/me" && !state.permissionsConfigured) {
      await reply(
        {
          success: false,
          code: "STAFF_PERMISSIONS_UNCONFIGURED",
          message:
            "This staff account has no valid server-managed Chorezy capabilities. Ask a staff administrator to configure access.",
        },
        403,
      );
      return true;
    }
    if (path === "/workspace/me")
      return respond({
        id: "fixture-staff",
        email: "fixture.staff@example.invalid",
        capabilities: state.capabilities,
        assuranceLevel: state.assuranceLevel,
        mfaEnrolled: true,
        permissionsConfigured: true,
      });
    if (
      /^\/workspace\/users\/[^/]+\/investigations(?:\/[^/]+\/(?:release|preservation\/(?:retry|diagnostic|release)))?$/.test(
        path,
      )
    ) {
      if (request.method() === "GET")
        return respond(page(state.investigations));
      if (!state.capabilities.includes("investigation.write") || state.assuranceLevel !== "aal2") {
        await reply(
          {
            success: false,
            code: "STAFF_MFA_REQUIRED",
            message: "Specific permission and current MFA are required.",
          },
          403,
        );
        return true;
      }
      const body = request.postDataJSON();
      const recordId = path.split("/")[5],
        existing = state.investigations.find((item) => item.id === recordId);
      if (path.includes("/preservation/")) {
        if (path.endsWith("/diagnostic")) {
          state.storageDiagnostics++;
          return respond({ investigationId: recordId, gateRelaxed: false, preservationConfirmed: false, note: "Storage observations cannot prove the original delete has ended. No gate was released.", observations: [{ operationId: "fixture-unresolved", kind: "stream_recording_delete", phase: "uncertain", observations: [{ keyHash: "fixture-hashed-reference", observation: "absent_at_observation", observedAt: at }], unresolved: true }] });
        }
        if (path.endsWith("/release")) {
          if (existing.preservation.status !== "active") {
            await reply({ success: false, code: "PRESERVATION_STATE_UNKNOWN", message: "Pending preservation cannot be released." }, 409);
            return true;
          }
          state.preservationReleases++;
          existing.preservation.status = "released";
          return respond({ id: recordId, preservationStatus: "released", accountStatusUnchanged: true });
        }
        state.preservationRetries++;
        if (!state.preservationPending) existing.preservation.status = "active";
        return respond(existing);
      }
      if (path.endsWith("/release")) {
        state.investigationReleases++;
        const id = path.split("/").at(-2),
          record = state.investigations.find((item) => item.id === id);
        record.status = "released";
        record.releasedAt = at;
        record.releaseReason = body.reason;
        return respond({ id, status: "released", preservationRetained: true });
      }
      state.investigationCreates++;
      const record = {
        id: String(300 + state.investigationCreates).padStart(24, "0"),
        userId: "000000000000000000000001",
        status: "active",
        reason: body.reason,
        publicMessage: body.publicMessage,
        createdBy: "fixture-staff",
        createdAt: at,
        preservation: {
          status: state.preservationPending ? "pending" : "active",
          coverage: "current_records",
          priorDeletionCount: 0,
          subjects: [
            "user:000000000000000000000001",
            "chore:000000000000000000000101",
          ],
        },
      };
      state.investigations.push(record);
      return respond(record);
    }
    if (path === "/workspace/attention/counts") return respond(counts());
    if (path === "/workspace/support-presence") {
      state.lastActiveAt = new Date().toISOString();
      return respond({
        lastActiveAt: state.lastActiveAt,
        checkedAt: state.lastActiveAt,
        heartbeatExpirySeconds: 90,
      });
    }
    if (path.startsWith("/workspace/attention/")) {
      const kind = path.split("/").at(-1);
      if (kind === "investigation") return respond(page(state.investigations.filter((item) => item.status === "active" || ["active", "pending"].includes(item.preservation.status)).map((item) => ({ id: item.id, targetUserId: person.id, summary: item.reason, status: item.status === "active" ? "account_frozen" : `account_released_preservation_${item.preservation.status}`, kind }))));
      const item =
        kind === "support"
          ? {
              id: "ticket-1",
              kind,
              subject: "Unread fixture payment question",
              ticketNumber: "CH-FIXTURE-1",
              status: state.ticketStatus,
              unreadForSupport: 1,
              lastMessageAt: at,
              choreId,
            }
          : kind === "emergency"
            ? {
                id: "incident-fixture",
                kind,
                status: "active",
                triggeredAt: at,
                choreId,
              }
            : {
                id: "case-fixture",
                kind,
                status: "needs_review",
                caseNumber: "TR-FIXTURE-1",
                summary: "Fixture case needs attention",
                relatedChoreIds: [choreId],
              };
      return respond(page(state.emptyAttention ? [] : [item]));
    }
    if (path === "/workspace/lookup")
      return respond([
        { id: choreId, type: "chore", label: "Fixture garden chore" },
        { id: person.id, type: "user", label: person.name },
      ]);
    if (path === `/workspace/chores/${choreId}`)
      return respond({
        id: choreId,
        financeAccess: state.capabilities.includes("finance.read"),
        title: "Fixture garden chore",
        description:
          "Water the garden and tidy the path. This deliberately long participant report remains readable on mobile.",
        status: "completed",
        paymentStatus: state.capabilities.includes("finance.read")
          ? "held"
          : undefined,
        participants: [
          {
            ...person,
            choreRole: "helper",
            status: "active",
            guardians: [
              {
                guardianId: "000000000000000000000301",
                relationship: "legal_guardian",
                approved: true,
                active: false,
                relationshipVerified: true,
                approvedAt: at,
              },
            ],
          },
        ],
        acceptedBid: {
          id: "bid-fixture",
          amountCents: 1825,
          currency: "USD",
          status: "accepted",
          acceptedAt: at,
          bidderId: person.id,
          message: "I can help this afternoon.",
        },
        lifecycle: [
          { kind: "createdAt", at },
          { kind: "startedAt", at },
          { kind: "completedAt", at },
        ],
        proof: {
          status: "disputed",
          message: "Fixture completion report",
          reviewedAt: at,
          dispute: {
            status: "open",
            reason: "Fixture path still needs tidying",
            response: {
              message: "Fixture participant response",
              submittedAt: at,
            },
            aiReview: {
              provider: "fixture",
              model: "fixture",
              status: "completed",
              summary: "Recorded fixture assessment",
              finalDecision: "inconclusive",
              finalDecisionSummary:
                "Insufficient evidence to determine completion",
              decisionFactors: ["Before and after photos differ"],
              missingEvidence: ["Path close-up"],
            },
          },
        },
        evidence: [evidence],
        safetyRecording: { status: "deleted", deletedAt: at },
        counts: {
          conversations: 1,
          payments: 1,
          trustEvents: 1,
          emergencies: 1,
        },
      });
    if (path === `/workspace/chores/${choreId}/evidence/access`)
      return respond({
        url: "https://evidence.fixture.invalid/temporary-proof",
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        filename: evidence.filename,
        type: "file",
      });
    if (path === `/workspace/chores/${choreId}/conversations`)
      return respond(
        page([
          {
            id: conversationId,
            conversationType: "three_way",
            guardianRequired: true,
            isGuardianApproved: false,
            conversationStatus: "active",
            participants: [{ userId: person.id, role: "helper", active: true }],
          },
        ]),
      );
    if (
      path ===
      `/workspace/chores/${choreId}/conversations/${conversationId}/messages`
    ) {
      const second = Boolean(url.searchParams.get("cursor"));
      return respond(
        page(
          [
            {
              id: second ? "original-2" : "original-1",
              senderId: person.id,
              content: second
                ? "Fixture original transcript page two"
                : "Fixture original transcript page one",
              messageType: second ? "voice" : "text",
              createdAt: at,
              guardianApprovalStatus: "pending",
              attachments: second
                ? [{ ...evidence, group: "message:original-2", type: "voice" }]
                : [],
            },
          ],
          second ? null : "fixture-second-page",
        ),
      );
    }
    if (path.startsWith(`/workspace/chores/${choreId}/money/`))
      return respond(
        page([
          {
            id: "money-fixture",
            kind: path.split("/").at(-1),
            amountCents: 1825,
            currency: "USD",
            status: "held",
            originalAmount: 18.25,
            originalUnit: "dollars",
            createdAt: at,
            stripePaymentIntentId: "pi_fixture_original",
            reference: "fixture-reference",
          },
        ]),
      );
    if (path.startsWith(`/workspace/chores/${choreId}/records/`))
      return respond(page([]));
    if (path.startsWith("/workspace/audit/"))
      return respond(
        page([
          {
            id: "event-1",
            eventId: "fixture-audit-event",
            actorEmail: "fixture.staff@example.invalid",
            action: "case.read",
            outcome: "completed",
            recordedAt: at,
            integrity: { valid: true },
          },
        ]),
      );
    if (/^\/workspace\/users\/[^/]+\/profile$/.test(path))
      return respond({
        ...person,
        role: "Adult helper",
        status: state.investigations.some((item) => item.status === "active") ? "under_investigation" : "active",
        storedAccountStatus: "active",
        isActive: !state.investigations.some((item) => item.status === "active"),
        effectiveRestriction: state.investigations.some((item) => item.status === "active") ? { code: "ACCOUNT_UNDER_INVESTIGATION", type: "investigation", message: "Contact support to appeal.", expiresAt: null } : null,
        guardians: [],
        rawIdentityDocumentsAvailable: false,
        verification: {
          level: "verified",
          emailVerified: true,
          phoneVerified: false,
          lastUpdated: at,
          checks: [
            {
              kind: "identity.document",
              verified: true,
              status: "verified",
              provider: "Recorded identity provider",
              processedAt: at,
            },
            {
              kind: "identity.selfie",
              verified: false,
              status: "expired",
              provider: "Recorded identity provider",
              processedAt: at,
              expiresAt: at,
            },
            {
              kind: "backgroundCheck",
              verified: false,
              status: "not_recorded",
            },
          ],
        },
      });
    if (/^\/workspace\/users\/[^/]+\/finance$/.test(path))
      return respond({
        userId: person.id,
        earnings: state.unknownFinance
          ? null
          : {
              currency: "USD",
              generatedAt: at,
              balances: {
                available: { amountCents: 1825, currency: "USD" },
                pending: { amountCents: 700, currency: "USD" },
                lifetimeEarnings: { amountCents: 4325, currency: "USD" },
                paidOut: { amountCents: 1800, currency: "USD" },
              },
            },
        earningsNote:
          "Persisted Chorezy wallet calculation; this is not a provider balance or an instruction to release funds.",
        payout: state.unknownFinance
          ? null
          : {
              stripeAccountId: "acct_fixture_recorded",
              detailsSubmitted: true,
              payoutsEnabled: false,
              lastStatusRefreshAt: at,
              disabledReason: "requirements.past_due",
              requirementsCurrentlyDue: ["external_account"],
              requirementsPastDue: ["individual.verification.document"],
            },
        payoutNote:
          "Last persisted onboarding state. No live provider request, bank details or account creation secrets are returned.",
      });
    if (/^\/workspace\/users\/[^/]+\/transactions$/.test(path))
      return respond(
        page(
          state.emptyTransactions
            ? []
            : [
                {
                  id: "transaction-fixture-profile",
                  type: "withdrawal",
                  status: "pending",
                  amountCents: 1800,
                  currency: "USD",
                  originalAmount: 1800,
                  originalUnit: "cents",
                  createdAt: at,
                  reference: "fixture-account-transaction",
                },
              ],
        ),
      );
    if (/^\/workspace\/users\/[^/]+\/chores$/.test(path))
      return respond(
        page([
          {
            id: choreId,
            title: "Fixture garden chore",
            status: "completed",
            role: "helper",
          },
        ]),
      );
    if (/^\/workspace\/users\/[^/]+\/verification\//.test(path))
      return respond(
        page([
          {
            id: "verification-fixture",
            status: "expired",
            provider: "Recorded provider",
            processedAt: at,
            expiresAt: at,
            currentConsent: "inactive Guardian link",
          },
        ]),
      );
    if (/^\/support-chat\/tickets\/ticket-[12]$/.test(path))
      return respond(ticket(path.split("/").at(-1)));
    if (/^\/support-chat\/tickets\/ticket-[12]\/notes$/.test(path))
      return respond(page(state.notes));
    if (/^\/support-chat\/tickets\/ticket-[12]\/workflow$/.test(path)) {
      const input = request.postDataJSON();
      if (input.action === "resolve") state.ticketStatus = "resolved";
      if (input.action === "reopen") state.ticketStatus = "open";
      if (input.action === "assign_self") state.assigned = true;
      if (input.action === "unassign") state.assigned = false;
      if (input.action === "priority") state.ticketPriority = input.priority;
      if (input.action === "mark_read") state.readAcknowledged = true;
      if (input.action === "note")
        state.notes.push({
          id: `note-${state.notes.length + 1}`,
          actorName: "Fixture Staff",
          body: input.body,
          createdAt: at,
        });
      state.ticketVersion++;
      return respond(
        { version: state.ticketVersion, status: state.ticketStatus },
        201,
      );
    }
    if (/^\/support-chat\/tickets\/ticket-[12]\/messages$/.test(path)) {
      if (request.method() === "GET") return respond(page(state.messages));
      const input = request.postDataJSON();
      let message = state.replyKeys[input.clientRequestId];
      if (!message) {
        message = {
          id: `m${state.messages.length + 1}`,
          body: input.body,
          senderType: "agent",
          senderName: "Fixture Staff",
          createdAt: at,
          clientRequestId: input.clientRequestId,
          attachments: [],
        };
        state.replyKeys[input.clientRequestId] = message;
        state.messages.push(message);
      }
      if (state.replyFailureAfterCommit) {
        await reply(
          {
            success: false,
            message: "Fixture acknowledgement lost after commit",
          },
          503,
        );
        return true;
      }
      await reply({ success: true, message }, 201);
      return true;
    }
    return false;
  };
};
