"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useAdmin } from "./auth";
import { WorkspaceSkeleton } from "./loading";
import { useSearchParams } from "next/navigation";
import type {
  SafetyAction,
  SafetyContext,
  SafetyPayload,
  SafetyRecord,
} from "./contracts";
import {
  AdminButton,
  ConfirmDialog,
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

const actions = [
  ["temporary_suspension", "Temporary suspension"],
  ["manual_review_hold", "Manual review hold"],
  ["permanent_suspension", "Permanent suspension"],
  ["platform_exclusion", "Platform exclusion"],
  ["support_note", "Support note"],
];
const reasons = [
  ["safety_policy_violation", "Safety policy violation"],
  ["minor_or_guardian_safety_risk", "Minor or guardian safety risk"],
  ["identity_or_impersonation_risk", "Identity or impersonation risk"],
  ["account_takeover_or_compromised", "Account takeover"],
  ["harassment_or_contact_abuse", "Harassment or contact abuse"],
  ["payment_or_chargeback_risk", "Payment or chargeback risk"],
  ["emergency_or_real_world_harm", "Emergency or real-world harm"],
  ["disqualifying_background_result", "Disqualifying background result"],
  ["known_offender_or_legal_exclusion", "Known offender or legal exclusion"],
  ["spam_or_automation_abuse", "Spam or automation abuse"],
  ["repeat_evasion_or_shared_device_abuse", "Repeated evasion"],
  ["support_escalation_note", "Support escalation note"],
];
export function SafetyPage() {
  const { api } = useAdmin();
  const linkedIdentifier = useSearchParams().get("identifier");
  const [identifier, setIdentifier] = useState("");
  const [context, setContext] = useState<SafetyContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const generation = useRef({ value: 0 });
  const [type, setType] = useState("temporary_suspension");
  const [reason, setReason] = useState(reasons[0][0]);
  const [duration, setDuration] = useState(1440);
  const [note, setNote] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [evidence, setEvidence] = useState("");
  const [device, setDevice] = useState(false);
  const [ip, setIp] = useState(false);
  const [ipHash, setIpHash] = useState(false);
  const [pending, setPending] = useState<
    { payload: SafetyPayload } | { revoke: SafetyAction } | null
  >(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [confirmedPermanent, setConfirmedPermanent] = useState(false);
  const lookup = useCallback(
    async (value: string) => {
      const request = ++generation.current.value;
      setLoading(true);
      setContext(null);
      setError("");
      setNotice("");
      setPending(null);
      try {
        const result = await api.safety(value.trim());
        if (generation.current.value === request) {
          setContext(result);
          setIdentifier(result.user.safetyId || value);
          setNote("");
          setPublicMessage("");
          setEvidence("");
          setDevice(false);
          setIp(false);
          setIpHash(false);
        }
      } catch (error) {
        if (generation.current.value === request)
          setError(
            error instanceof Error
              ? error.message
              : "Account could not be loaded.",
          );
      } finally {
        if (generation.current.value === request) setLoading(false);
      }
    },
    [api],
  );
  useEffect(() => {
    const requestState = generation.current;
    let active = true;
    if (linkedIdentifier) {
      queueMicrotask(() => {
        if (active) void lookup(linkedIdentifier);
      });
    }
    return () => {
      requestState.value++;
      active = false;
    };
  }, [lookup, linkedIdentifier]); // Every deep link resolves fresh account context.
  const permanent = ["permanent_suspension", "platform_exclusion"].includes(
    type,
  );
  const isNote = type === "support_note";
  function review(event: FormEvent) {
    event.preventDefault();
    if (!context || busy) return;
    setConfirmedPermanent(false);
    setPending({
      payload: {
        targetUserId: context.user.id!,
        actionType: type,
        durationMinutes: duration,
        reasonCode: reason,
        reasonLabel: reasons.find((item) => item[0] === reason)![1],
        internalNote: note.trim(),
        publicMessage: publicMessage.trim(),
        evidenceSummary: evidence.trim(),
        scope: isNote
          ? { account: false }
          : { account: true, device, ip, ipDeviceHash: ipHash },
      },
    });
  }
  async function apply() {
    if (
      !pending ||
      busyRef.current ||
      ("payload" in pending && permanent && !confirmedPermanent) ||
      ("revoke" in pending && !revokeReason.trim())
    )
      return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const request = generation.current.value;
    try {
      const result =
        "payload" in pending
          ? await api.applySafety(pending.payload)
          : await api.revokeSafety(
              pending.revoke.actionId,
              revokeReason.trim(),
            );
      // Back/forward can resolve a different account while this action finishes.
      if (generation.current.value !== request) return;
      setContext(result.data);
      setNotice([result.message, ...(result.warnings || [])].join(" "));
      setNote("");
      setEvidence("");
      setPublicMessage("");
      setPending(null);
    } catch (error) {
      if (generation.current.value !== request) return;
      setError(
        `${error instanceof Error ? error.message : "Action could not be confirmed."} Reload the account and inspect its action history before trying again.`,
      );
      setPending(null);
      setContext(null);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup(identifier);
        }}
      >
        <label>
          Safety ID, user ID, email or phone
          <input
            value={identifier}
            maxLength={160}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            disabled={busy}
          />
        </label>
        <AdminButton
          type="submit"
          disabled={loading || busy || !identifier.trim()}
        >
          {loading ? "Looking up…" : "Look up account"}
        </AdminButton>
      </form>
      {error && <Notice error>{error}</Notice>}
      {!context && loading && <WorkspaceSkeleton kind="safety" />}
      {notice && <Notice>{notice}</Notice>}
      {!context && !loading && !error && (
        <Empty>
          Find an account to inspect its history and safety controls.
        </Empty>
      )}
      {context && (
        <>
          <Panel title="Account context">
            <div className="admin-panel-body">
              <div className="admin-record-top">
                <div>
                  <h3>{context.user.name}</h3>
                  <p>
                    {context.user.email} · {context.user.role}
                  </p>
                </div>
                <Status>{context.user.accountStatus || "unknown"}</Status>
              </div>
              <dl className="admin-facts">
                <Fact label="Safety ID">{context.user.safetyId}</Fact>
                <Fact label="User ID">{context.user.id}</Fact>
                <Fact label="Phone">
                  {context.user.phoneNumber || "Not available"}
                </Fact>
                <Fact label="Active sessions">
                  {context.user.sessions?.activeCount ?? "Not reported"}
                </Fact>
              </dl>
              {context.matches.length > 1 && (
                <label>
                  Matching accounts
                  <select
                    value={context.user.id}
                    onChange={(event) => void lookup(event.target.value)}
                    disabled={busy}
                  >
                    {context.matches.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.email} · {item.id}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </Panel>
          <Metrics
            values={[
              {
                label: "Active restrictions",
                value: context.summary.activeRestrictions,
              },
              {
                label: "Recent open chores",
                value: context.summary.openChores,
              },
              {
                label: "Recent open tickets",
                value: context.summary.openSupportTickets,
              },
              {
                label: "Recent payment flags",
                value: context.summary.paymentIssues,
              },
            ]}
          />
          <div className="admin-two-columns">
            <Panel title="Apply a safety action">
              <form className="admin-panel-body admin-form" onSubmit={review}>
                <label>
                  Action
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    disabled={busy}
                  >
                    {actions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {!isNote && (
                  <Notice>
                    {type === "manual_review_hold"
                      ? "This is a timed whole-account suspension. It does not preserve evidence or hold money."
                      : permanent
                        ? "This blocks the account indefinitely and revokes its sessions."
                        : "This suspends the account for the selected duration and revokes its sessions."}
                  </Notice>
                )}
                {!permanent && !isNote && (
                  <label>
                    Duration
                    <select
                      value={duration}
                      onChange={(event) =>
                        setDuration(Number(event.target.value))
                      }
                    >
                      <option value={60}>1 hour</option>
                      <option value={1440}>24 hours</option>
                      <option value={10080}>7 days</option>
                      <option value={43200}>30 days</option>
                    </select>
                  </label>
                )}
                <label>
                  Reason
                  <select
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  >
                    {reasons.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Internal note
                  <textarea
                    rows={3}
                    maxLength={2000}
                    required
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
                {!isNote && (
                  <>
                    <label>
                      User-facing message
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={publicMessage}
                        onChange={(event) =>
                          setPublicMessage(event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Evidence summary
                      <textarea
                        rows={2}
                        maxLength={2000}
                        value={evidence}
                        onChange={(event) => setEvidence(event.target.value)}
                      />
                    </label>
                    <fieldset>
                      <legend>Enforcement scope</legend>
                      <p>
                        Account scope is always included. Shared devices or
                        networks may affect other people.
                      </p>
                      <label className="admin-check">
                        <input type="checkbox" checked disabled />
                        Account and sessions
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={device}
                          disabled={!context.signals.deviceIds.length}
                          onChange={(event) => setDevice(event.target.checked)}
                        />
                        Known devices ({context.signals.deviceIds.length})
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={ip}
                          disabled={!context.signals.ipAddresses.length}
                          onChange={(event) => setIp(event.target.checked)}
                        />
                        Known IP addresses ({context.signals.ipAddresses.length}
                        )
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={ipHash}
                          disabled={
                            !context.signals.ipAddresses.length ||
                            !context.signals.deviceHashes.length
                          }
                          onChange={(event) => setIpHash(event.target.checked)}
                        />
                        Known IP/device combinations
                      </label>
                    </fieldset>
                  </>
                )}
                <AdminButton
                  type="submit"
                  variant={isNote ? "primary" : "danger"}
                  disabled={busy || !note.trim()}
                >
                  Review {isNote ? "note" : "action"}
                </AdminButton>
              </form>
            </Panel>
            <Panel title="Safety action history">
              <div className="admin-panel-body admin-action-history">
                {context.safetyActions.map((action) => (
                  <article key={action.id}>
                    <div className="admin-record-top">
                      <strong>{humanize(action.actionType)}</strong>
                      <Status>{action.status}</Status>
                    </div>
                    <p>{action.reasonLabel}</p>
                    <p>{action.internalNote}</p>
                    <dl className="admin-facts">
                      <Fact label="Action ID">{action.actionId}</Fact>
                      <Fact label="Applied by">
                        {action.createdBy?.name || action.createdBy?.email}
                      </Fact>
                      <Fact label="Created">{time(action.createdAt)}</Fact>
                      <Fact label="Expiry">
                        {action.permanent
                          ? "Permanent"
                          : action.expiresAt
                            ? time(action.expiresAt)
                            : "No expiry"}
                      </Fact>
                    </dl>
                    {action.revocationReason && (
                      <p>Revocation: {action.revocationReason}</p>
                    )}
                    {action.status === "active" && (
                      <AdminButton
                        variant="secondary"
                        disabled={busy}
                        onClick={() => {
                          setRevokeReason("");
                          setPending({ revoke: action });
                        }}
                      >
                        Revoke {action.actionId}
                      </AdminButton>
                    )}
                  </article>
                ))}
                {!context.safetyActions.length && (
                  <Empty>No recorded safety actions.</Empty>
                )}
              </div>
            </Panel>
          </div>
          <p className="admin-note">
            Recent records only: up to 12 records per category. These summaries
            are not a complete case file, full conversation transcript or
            reconciled money ledger.
          </p>
          <RecordTable title="Recent chores" records={context.chores} />
          <RecordTable
            title="Conversation summaries"
            records={context.conversations}
          />
          <RecordTable
            title="Recent payment records"
            records={context.payments}
          />
          <RecordTable
            title="Recent transactions"
            records={context.transactions}
          />
          <RecordTable
            title="Recent support tickets"
            records={context.supportTickets}
          />
        </>
      )}
      {pending && (
        <ConfirmDialog
          title={
            "revoke" in pending
              ? "Revoke this safety action?"
              : isNote
                ? "Add internal support note?"
                : "Apply account restriction?"
          }
          label={
            "revoke" in pending
              ? "Revoke action"
              : isNote
                ? "Add note"
                : "Apply restriction"
          }
          busy={busy}
          confirmDisabled={
            ("payload" in pending && permanent && !confirmedPermanent) ||
            ("revoke" in pending && !revokeReason.trim())
          }
          onClose={() => setPending(null)}
          onConfirm={() => void apply()}
        >
          <p>
            Account: <strong>{context?.user.name}</strong>
            <br />
            {context?.user.email}
            <br />
            {context?.user.id}
          </p>
          {"revoke" in pending ? (
            <>
              <p>
                Only this action ({pending.revoke.actionId}) will be revoked.
                The backend determines the resulting account status.
              </p>
              <label>
                Revocation reason
                <textarea
                  value={revokeReason}
                  maxLength={1000}
                  onChange={(event) => setRevokeReason(event.target.value)}
                  required
                />
              </label>
            </>
          ) : (
            <>
              <p>
                {humanize(pending.payload.actionType)} ·{" "}
                {permanent
                  ? "Permanent"
                  : isNote
                    ? "No access restriction"
                    : `${duration} minutes`}
              </p>
              <p>{pending.payload.reasonLabel}</p>
              <p>{pending.payload.internalNote}</p>
              {(device || ip || ipHash) && (
                <Notice>
                  Shared-device/network scopes are selected. They may affect
                  other accounts using those signals.
                </Notice>
              )}
              {permanent && (
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={confirmedPermanent}
                    onChange={(event) =>
                      setConfirmedPermanent(event.target.checked)
                    }
                  />
                  I confirm permanent enforcement for this account.
                </label>
              )}
            </>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}
function RecordTable({
  title,
  records,
}: {
  title: string;
  records: SafetyRecord[];
}) {
  return (
    <Panel title={title}>
      <div className="admin-table-wrap">
        <table>
          <caption className="visually-hidden">
            {title}, limited to 12 recent records
          </caption>
          <thead>
            <tr>
              <th scope="col">Record</th>
              <th scope="col">Status</th>
              <th scope="col">Amount / messages</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <th scope="row">
                  {record.title ||
                    record.choreTitle ||
                    record.subject ||
                    record.description ||
                    record.type ||
                    record.id}
                  <small>
                    {record.ticketNumber || record.reference || record.id}
                  </small>
                </th>
                <td>
                  {record.status ? (
                    <Status>{record.status}</Status>
                  ) : (
                    "Not recorded"
                  )}
                </td>
                <td>
                  {record.amount !== undefined
                    ? money(record.amount, record.currency)
                    : record.messageCount !== undefined
                      ? `${record.messageCount} messages`
                      : "—"}
                </td>
                <td>{time(record.updatedAt || record.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!records.length && <Empty>No recent records in this category.</Empty>}
    </Panel>
  );
}
