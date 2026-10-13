"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAdmin } from "./auth";
import { useRemote } from "./hooks";
import { DetailSkeleton } from "./loading";
import { PagedRecords } from "./paged-records";
import { AttentionRecords } from "./attention";
import { EvidenceAccess } from "./evidence-access";
import { PrivateUserProfile } from "./user-profile";
import { canAct, useWorkspace } from "./workspace-state";
import {
  AdminButton,
  Empty,
  Fact,
  Metrics,
  Notice,
  Panel,
  Status,
  humanize,
  money,
  time,
} from "./ui";
import type { ChoreCaseFile, LookupRecord } from "./workspace-contracts";

export function CasesPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { api } = useAdmin();
  const identifier = params.get("identifier") || "";
  const choreId = params.get("choreId") || "";
  const userId = params.get("userId") || "";
  const [query, setQuery] = useState(identifier);
  const lookup = useCallback(
    () =>
      identifier ? api.lookup(identifier) : Promise.resolve<LookupRecord[]>([]),
    [api, identifier],
  );
  const lookupState = useRemote(lookup, `lookup:${identifier}`);
  const read = useCallback(
    () =>
      choreId
        ? api.choreCase(choreId)
        : Promise.resolve<ChoreCaseFile | null>(null),
    [api, choreId],
  );
  const state = useRemote(read, `chore:${choreId}`);
  return (
    <>
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(
            `/admin/cases/?identifier=${encodeURIComponent(query.trim())}`,
          );
        }}
      >
        <label>
          Record identifier
          <input
            type="search"
            value={query}
            maxLength={160}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="User, chore, ticket, payment or case ID"
            required
          />
        </label>
        <AdminButton type="submit" disabled={!query.trim()}>
          Find record
        </AdminButton>
      </form>
      {identifier && (
        <Panel variant="padded" title="Matching records">
          {lookupState.error && <Notice error>{lookupState.error}</Notice>}
          {lookupState.loading && !lookupState.data && (
            <DetailSkeleton label="Finding linked records" />
          )}
          {lookupState.data && !lookupState.data.length && (
            <Empty>No record matches this exact identifier.</Empty>
          )}
          <ul className="admin-case-records">
            {lookupState.data?.map((record) => (
              <li key={`${record.type}:${record.id}`}>
                <strong>{record.label || record.id}</strong>
                <small>
                  {humanize(record.type)} · {record.id}
                </small>
                <div className="admin-actions">
                  {record.type === "user" && (
                    <>
                      <Link
                        className="admin-text-link"
                        href={`/admin/cases/?userId=${record.id}`}
                      >
                        View private participant profile
                      </Link>
                      <Link
                        className="admin-text-link"
                        href={`/admin/safety/?identifier=${record.id}`}
                      >
                        Account safety
                      </Link>
                    </>
                  )}
                  {(record.type === "chore" || record.choreId) && (
                    <Link
                      className="admin-text-link"
                      href={`/admin/cases/?choreId=${record.choreId || record.id}`}
                    >
                      Open chore case file
                    </Link>
                  )}
                  {record.choreIds?.map((id) => (
                    <Link
                      key={id}
                      className="admin-text-link"
                      href={`/admin/cases/?choreId=${id}`}
                    >
                      Open linked chore {id}
                    </Link>
                  ))}
                  {record.type === "ticket" && (
                    <Link
                      className="admin-text-link"
                      href={`/admin/support/?ticketId=${record.id}`}
                    >
                      Support conversation
                    </Link>
                  )}
                  {record.type === "case" && (
                    <Link
                      className="admin-text-link"
                      href={`/admin/trust/?caseId=${record.id}`}
                    >
                      Trust case
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {userId && <UserRecords userId={userId} />}
      {choreId && (
        <>
          {state.error && <Notice error>{state.error}</Notice>}
          {!state.data && state.loading && (
            <DetailSkeleton label="Loading chore case file" />
          )}
          <AdminButton
            variant="secondary"
            disabled={state.loading}
            onClick={state.refresh}
          >
            Refresh case file
          </AdminButton>
          {state.data && <ChoreFile record={state.data} />}
        </>
      )}
      {!identifier &&
        !choreId &&
        !userId &&
        params.get("attention") === "case" && (
          <AttentionRecords kind="case" title="Cases needing attention" />
        )}
      {!identifier && !choreId && !userId && (
        <Panel variant="padded" title="Find the record you need">
          <p>
            Use an exact user email, phone, Safety ID, chore ID, ticket number,
            case number, payment ID or provider payment reference.
          </p>
          <p>
            A chore case file links recorded participant chat, evidence
            references, lifecycle, AI reasoning and money records. Every list
            has separate pagination.
          </p>
        </Panel>
      )}
    </>
  );
}
function UserRecords({ userId }: { userId: string }) {
  const { api } = useAdmin();
  const [kind, setKind] = useState("identity");
  const chores = useCallback(
    (cursor: string) => api.userChores(userId, cursor),
    [api, userId],
  );
  const provenance = useCallback(
    async (cursor: string) => {
      const page = await api.userVerification(userId, kind, cursor);
      return {
        ...page,
        items: page.items.map((item) => ({ ...item, id: String(item.id) })),
      };
    },
    [api, userId, kind],
  );
  return (
    <>
      <PrivateUserProfile userId={userId} />
      <PagedRecords
        title="Participant chores"
        scope={`user:${userId}:chores`}
        load={chores}
        render={(record) => (
          <>
            <strong>{record.title}</strong>
            <p>
              {record.role} · <Status>{record.status}</Status>
            </p>
            <Link
              className="admin-text-link"
              href={`/admin/cases/?choreId=${record.id}`}
            >
              Open chore case file
            </Link>
          </>
        )}
      />
      <label className="admin-toolbar">
        Verification records
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="identity">Identity / document provenance</option>
          <option value="screening">Screening provenance</option>
        </select>
      </label>
      <p>
        Screening activation for Checkr and Yardstik is unavailable. This view
        shows persisted provenance and does not approve users or start a check.
      </p>
      <PagedRecords
        title="Verification provenance"
        scope={`user:${userId}:${kind}`}
        load={provenance}
        render={(record) => (
          <dl className="admin-facts">
            {Object.entries(record)
              .filter(([key]) => !["id", "userId", "_id"].includes(key))
              .map(([key, value]) => (
                <Fact key={key} label={humanize(key)}>
                  {display(value)}
                </Fact>
              ))}
          </dl>
        )}
      />
    </>
  );
}
function ChoreFile({ record }: { record: ChoreCaseFile }) {
  const { authority } = useWorkspace();
  const financeAllowed =
    record.financeAccess && canAct(authority, "finance.read");
  const [tab, setTab] = useState("chat");
  const proof = record.proof;
  const ai = proof.dispute.aiReview;
  return (
    <>
      <Panel variant="padded" title={record.title}>
        <div className="admin-record-top">
          <span>{record.id}</span>
          <Status>{record.status}</Status>
        </div>
        <p>{record.description}</p>
        <dl className="admin-facts">
          {financeAllowed && (
            <Fact label="Payment lifecycle">
              {humanize(record.paymentStatus || "unknown")}
            </Fact>
          )}
          <Fact label="Accepted bid">
            {record.acceptedBid && financeAllowed
              ? money(
                  record.acceptedBid.amountCents,
                  record.acceptedBid.currency,
                  true,
                )
              : record.acceptedBid
                ? "Amount requires finance access"
                : "No accepted bid recorded"}
          </Fact>
          <Fact label="Bid status">{record.acceptedBid?.status}</Fact>
          <Fact label="Accepted at">
            {time(record.acceptedBid?.acceptedAt)}
          </Fact>
        </dl>
        {record.acceptedBid?.message && (
          <p>Accepted offer: {record.acceptedBid.message}</p>
        )}
      </Panel>
      <Metrics
        values={[
          { label: "Conversations", value: record.counts.conversations },
          ...(financeAllowed
            ? [{ label: "Payments", value: record.counts.payments ?? 0 }]
            : []),
          { label: "Trust events", value: record.counts.trustEvents },
          { label: "Emergencies", value: record.counts.emergencies },
        ]}
      />
      <div className="admin-two-columns">
        <Panel variant="padded" title="Participants and Guardian consent">
          <ul className="admin-case-records">
            {record.participants.map((person) => (
              <li key={person.id}>
                <strong>{person.name}</strong>
                <p>
                  {person.choreRole} · {person.role} · {person.status}
                </p>
                <Link
                  className="admin-text-link"
                  href={`/admin/safety/?identifier=${person.id}`}
                >
                  Account safety and current restrictions
                </Link>
                <Link
                  className="admin-text-link"
                  href={`/admin/cases/?userId=${person.id}`}
                >
                  View private participant profile
                </Link>
                {person.guardians.map((guardian) => (
                  <p key={guardian.guardianId}>
                    Guardian {guardian.guardianId} ·{" "}
                    {guardian.relationship || "relationship not recorded"} ·{" "}
                    {guardian.active && guardian.approved
                      ? "current approved link"
                      : "inactive or unapproved link"}{" "}
                    ·{" "}
                    {guardian.relationshipVerified
                      ? "relationship verified"
                      : "relationship verification not recorded"}{" "}
                    · {time(guardian.approvedAt)}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel variant="padded" title="Recorded lifecycle">
          <ol className="admin-case-records">
            {record.lifecycle.map((event) => (
              <li key={event.kind}>
                <strong>{humanize(event.kind)}</strong>
                <time dateTime={event.at}>{time(event.at)}</time>
              </li>
            ))}
          </ol>
          {record.cancellationReason && (
            <p>Cancellation reason: {record.cancellationReason}</p>
          )}
        </Panel>
      </div>
      <Panel variant="padded" title="Completion, dispute and AI reasoning">
        <dl className="admin-facts">
          <Fact label="Proof status">{proof.status}</Fact>
          <Fact label="Dispute status">{proof.dispute.status}</Fact>
          <Fact label="AI provider / model">
            {[ai.provider, ai.model].filter(Boolean).join(" / ") ||
              "Not recorded"}
          </Fact>
          <Fact label="Analysis status">{ai.status}</Fact>
          <Fact label="Final decision">{ai.finalDecision}</Fact>
          <Fact label="Recommended outcome">{ai.recommendedOutcome}</Fact>
        </dl>
        {proof.message && <p>Completion report: {proof.message}</p>}
        {proof.reviewNote && <p>Review note: {proof.reviewNote}</p>}
        {proof.dispute.reason && <p>Dispute report: {proof.dispute.reason}</p>}
        {proof.dispute.response.message && (
          <p>Participant response: {proof.dispute.response.message}</p>
        )}
        {ai.summary && <p>AI assessment: {ai.summary}</p>}
        {ai.finalDecisionSummary && (
          <p>Decision reasoning: {ai.finalDecisionSummary}</p>
        )}
        {proof.dispute.resolution && (
          <p>Recorded resolution: {proof.dispute.resolution}</p>
        )}
        {[
          ...[...(ai.decisionFactors || [])].map((text) => ({
            label: "Decision factor",
            text,
          })),
          ...(ai.missingEvidence || []).map((text) => ({
            label: "Missing evidence",
            text,
          })),
        ].map((item, index) => (
          <p key={index}>
            {item.label}: {item.text}
          </p>
        ))}
        {(ai.errorMessage || proof.dispute.resolutionError) && (
          <Notice error>
            {ai.errorMessage || proof.dispute.resolutionError}
          </Notice>
        )}
      </Panel>
      <Panel variant="padded" title="Evidence references">
        <ul className="admin-case-records">
          {record.evidence.map((file) => (
            <li key={`${file.group}:${file.index}`}>
              <strong>{file.filename}</strong>
              <p>
                {humanize(file.group)} · {file.type} ·{" "}
                {file.size
                  ? `${file.size.toLocaleString()} bytes`
                  : "Size not recorded"}
              </p>
              <code>
                {file.storageKey ||
                  file.urlReference ||
                  "Storage reference unavailable"}
              </code>
              <small>
                {humanize(file.access)} · {time(file.uploadedAt)}
              </small>
              {[
                "authenticated_signed_download",
                "recorded_reference_only",
              ].includes(file.access) && (
                <EvidenceAccess
                  choreId={record.id}
                  group={file.group}
                  index={file.index}
                />
              )}
            </li>
          ))}
        </ul>
        {!record.evidence.length && (
          <Empty>No attachment references recorded.</Empty>
        )}
        <p>
          Safety recording: {record.safetyRecording.status || "not recorded"}
          {record.safetyRecording.legalHold
            ? " · preservation hold active"
            : ""}
          . Recorded references are evidence metadata; unavailable or deleted
          files are labelled.
        </p>
      </Panel>
      <label className="admin-toolbar">
        Case records
        <select value={tab} onChange={(event) => setTab(event.target.value)}>
          <option value="chat">Full participant chat</option>
          <option value="money" disabled={!financeAllowed}>
            Linked money timeline
          </option>
          <option value="linked">Support, trust and emergency records</option>
          <option value="audit" disabled={!canAct(authority, "audit.read")}>
            Staff read and action history
          </option>
        </select>
      </label>
      {tab === "chat" && <CaseChat choreId={record.id} />}
      {!financeAllowed && (
        <Notice>
          Finance access is required to view payment states and linked money
          records.
        </Notice>
      )}
      {tab === "money" && financeAllowed && <CaseMoney choreId={record.id} />}
      {tab === "linked" && <CaseLinks choreId={record.id} />}
      {tab === "audit" && canAct(authority, "audit.read") && (
        <CaseAudit choreId={record.id} />
      )}
    </>
  );
}
function CaseChat({ choreId }: { choreId: string }) {
  const { api } = useAdmin();
  const [conversation, setConversation] = useState("");
  const loadConversations = useCallback(
    (cursor: string) => api.caseConversations(choreId, cursor),
    [api, choreId],
  );
  const loadMessages = useCallback(
    (cursor: string) => api.caseMessages(choreId, conversation, cursor),
    [api, choreId, conversation],
  );
  return (
    <>
      <PagedRecords
        title="Chore conversations"
        scope={`chore:${choreId}:conversations`}
        load={loadConversations}
        render={(record) => (
          <>
            <strong>{record.id}</strong>
            <p>
              {humanize(record.conversationType)} · {record.conversationStatus}
            </p>
            <p>
              {record.guardianRequired
                ? `Guardian approval ${record.isGuardianApproved ? "recorded" : "pending / not recorded"}`
                : "Guardian approval not required"}
            </p>
            <p>
              {record.participants
                .map(
                  (person) =>
                    `${person.role}: ${person.userId}${person.active ? "" : " (inactive)"}`,
                )
                .join(" · ")}
            </p>
            <AdminButton
              variant="secondary"
              aria-pressed={conversation === record.id}
              onClick={() => setConversation(record.id)}
            >
              Read transcript
            </AdminButton>
          </>
        )}
      />
      {conversation && (
        <PagedRecords
          title="Participant transcript"
          scope={`chore:${choreId}:messages:${conversation}`}
          load={loadMessages}
          render={(message) => (
            <>
              <div className="admin-message-meta">
                <strong>{message.senderId}</strong>
                <time dateTime={message.createdAt}>
                  {time(message.createdAt)}
                </time>
              </div>
              <p className="admin-preserve-lines">{message.content}</p>
              <small>
                {message.messageType} · Guardian approval:{" "}
                {message.guardianApprovalStatus || "not recorded"}
              </small>
              {message.moderationReason && (
                <p>Moderation: {message.moderationReason}</p>
              )}
              {message.attachments.map((file) => (
                <div key={`${file.group}:${file.index}`}>
                  <p>
                    {file.type}:{" "}
                    <code>
                      {file.storageKey ||
                        file.urlReference ||
                        "Reference unavailable"}
                    </code>
                  </p>
                  <EvidenceAccess
                    choreId={choreId}
                    group="message"
                    index={file.index}
                    conversationId={conversation}
                    messageId={message.id}
                  />
                </div>
              ))}
            </>
          )}
        />
      )}
    </>
  );
}
function CaseMoney({ choreId }: { choreId: string }) {
  const { api } = useAdmin();
  const [kind, setKind] = useState("payment");
  const load = useCallback(
    (cursor: string) => api.caseMoney(choreId, kind, cursor),
    [api, choreId, kind],
  );
  return (
    <>
      <label className="admin-toolbar">
        Money record source
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          {["payment", "escrow", "wallet", "transaction", "gift_card"].map(
            (value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ),
          )}
        </select>
      </label>
      <p>
        Values are normalized to cents once. Records are linked by the explicit
        chore ID. Provider status reflects persisted callbacks and
        reconciliation; account payouts without a chore link cannot be
        attributed to this case.
      </p>
      <PagedRecords
        title="Linked money records"
        scope={`chore:${choreId}:money:${kind}`}
        load={load}
        render={(record) => (
          <>
            <div className="admin-record-top">
              <strong>
                {money(record.amountCents, record.currency || "USD", true)}
              </strong>
              <Status>{record.status}</Status>
            </div>
            <p>
              {record.type ||
                record.source ||
                record.paymentSource ||
                record.kind}{" "}
              · {record.id}
            </p>
            <small>
              Stored as {record.originalAmount} {record.originalUnit} ·{" "}
              {time(record.createdAt)}
            </small>
            <dl className="admin-facts">
              {Object.entries(record)
                .filter(
                  ([key, value]) =>
                    value &&
                    [
                      "paymentId",
                      "escrowId",
                      "reference",
                      "externalTransactionId",
                      "stripePaymentIntentId",
                      "stripeTransferId",
                      "tremendousOrderId",
                      "tremendousRewardId",
                      "refundDestination",
                      "holdReason",
                    ].includes(key),
                )
                .map(([key, value]) => (
                  <Fact key={key} label={humanize(key)}>
                    {String(value)}
                  </Fact>
                ))}
              {record.balanceBeforeCents !== undefined && (
                <Fact label="Wallet balance before / after">
                  {money(record.balanceBeforeCents, "USD", true)} /{" "}
                  {money(record.balanceAfterCents, "USD", true)}
                </Fact>
              )}
            </dl>
          </>
        )}
      />
    </>
  );
}
function CaseLinks({ choreId }: { choreId: string }) {
  const { api } = useAdmin();
  const [kind, setKind] = useState("trust_events");
  const load = useCallback(
    (cursor: string) => api.caseRecords(choreId, kind, cursor),
    [api, choreId, kind],
  );
  return (
    <>
      <label className="admin-toolbar">
        Linked records
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          {["trust_events", "trust_cases", "tickets", "emergencies"].map(
            (value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ),
          )}
        </select>
      </label>
      <PagedRecords
        title="Linked case records"
        scope={`chore:${choreId}:records:${kind}`}
        load={load}
        render={(record) => (
          <>
            <strong>
              {record.caseNumber ||
                record.ticketNumber ||
                record.kind ||
                record.id}
            </strong>
            <p>{record.summary || record.subject || record.outcome}</p>
            {record.status && <Status>{record.status}</Status>}
            <small>{time(record.createdAt || record.triggeredAt)}</small>
            {kind !== "trust_events" && (
              <Link
                className="admin-text-link"
                href={
                  kind === "tickets"
                    ? `/admin/support/?ticketId=${record.id}`
                    : kind === "trust_cases"
                      ? `/admin/trust/?caseId=${record.id}`
                      : `/admin/emergency/?incidentId=${record.id}`
                }
              >
                Open linked record
              </Link>
            )}
          </>
        )}
      />
    </>
  );
}
function CaseAudit({ choreId }: { choreId: string }) {
  const { api } = useAdmin();
  const load = useCallback(
    (cursor: string) => api.audit("chore", choreId, cursor),
    [api, choreId],
  );
  return (
    <PagedRecords
      title="Signed staff history"
      scope={`audit:chore:${choreId}`}
      load={load}
      render={(record) => (
        <>
          <strong>
            {humanize(record.action)} · {record.outcome}
          </strong>
          <p>
            {record.actorEmail} · {time(record.recordedAt)}
          </p>
          <Status>
            {record.integrity.valid ? "verified" : "integrity_failed"}
          </Status>
          <code>{record.eventId}</code>
        </>
      )}
    />
  );
}
function display(value: unknown): string {
  if (value === null || value === undefined) return "Not recorded";
  if (typeof value === "object")
    return Object.entries(value)
      .map(([key, item]) => `${humanize(key)}: ${display(item)}`)
      .join(" · ");
  return String(value);
}
