"use client";
import { useCallback, useRef, useState } from "react";
import { useAdmin } from "./auth";
import { useRemote } from "./hooks";
import { canAct, useWorkspace } from "./workspace-state";
import { DetailSkeleton } from "./loading";
import {
  AdminButton,
  ConfirmDialog,
  Empty,
  Fact,
  Notice,
  Panel,
  Status,
  humanize,
  time,
} from "./ui";
import { TemplatePicker } from "./template-picker";
import { unresolvedPlaceholders } from "./templates";
import type {
  Investigation,
  PreservationDiagnostic,
} from "./workspace-contracts";
type Action = "account_release" | "evidence_release" | "retry" | "diagnostic";
const labels: Record<Action, string> = {
  account_release: "Release this account freeze",
  evidence_release: "Release this evidence preservation",
  retry: "Retry evidence preservation",
  diagnostic: "Inspect recorded storage objects",
};
export function InvestigationControls({
  userId,
  onChanged,
}: {
  userId: string;
  onChanged?: () => void;
}) {
  const { api } = useAdmin();
  const { authority, refresh: refreshWorkspace } = useWorkspace();
  const [pages, setPages] = useState([""]),
    [pageIndex, setPageIndex] = useState(0);
  const cursor = pages[pageIndex];
  const read = useCallback(
    () => api.investigations(userId, cursor),
    [api, userId, cursor],
  );
  const state = useRemote(read, `investigations:${userId}:${cursor}`);
  const allowed = canAct(authority, "investigation.write", true);
  const [reason, setReason] = useState("");
  const [publicMessage, setPublicMessage] = useState(
    "Your account is under investigation. Contact support if you would like to appeal.",
  );
  const [actionReason, setActionReason] = useState("");
  const [pending, setPending] = useState<
    "create" | { action: Action; record: Investigation } | null
  >(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [diagnostic, setDiagnostic] = useState<PreservationDiagnostic | null>(
    null,
  );
  const request = useRef<{ key: string; payload: string } | null>(null),
    busyRef = useRef(false);
  const incomplete = (value: string) =>
    !value.trim() || unresolvedPlaceholders(value);
  function choose(action: Action, record: Investigation) {
    setActionReason("");
    setPending({ action, record });
  }
  async function submit() {
    if (!allowed || !pending || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (pending === "create") {
        const payload = JSON.stringify({
          reason: reason.trim(),
          publicMessage: publicMessage.trim(),
        });
        if (!request.current || request.current.payload !== payload)
          request.current = { key: crypto.randomUUID(), payload };
        const created = await api.createInvestigation(userId, {
          reason: reason.trim(),
          publicMessage: publicMessage.trim(),
          requestKey: request.current.key,
        });
        setNotice(
          created.preservation?.status === "active"
            ? "Account frozen. Current records are preserved; earlier deleted evidence cannot be restored."
            : "Account frozen. Evidence preservation is pending because an earlier operation is unresolved. No new deletions are allowed.",
        );
        setReason("");
        request.current = null;
        setPages([""]);
        setPageIndex(0);
      } else if (pending.action === "account_release") {
        await api.releaseInvestigation(
          userId,
          pending.record.id,
          actionReason.trim(),
        );
        setNotice(
          "This account freeze was released. Evidence remains preserved or pending. Other investigations and bans still apply.",
        );
      } else if (pending.action === "evidence_release") {
        await api.releasePreservation(
          userId,
          pending.record.id,
          actionReason.trim(),
        );
        setNotice(
          "This evidence preservation was released. Other holds and account restrictions remain unchanged.",
        );
      } else if (pending.action === "retry") {
        const updated = await api.retryPreservation(
          userId,
          pending.record.id,
          actionReason.trim(),
        );
        setNotice(
          updated.preservation?.status === "active"
            ? "Evidence preservation completed. The account freeze or release is unchanged."
            : "Preservation is still pending. The original operation must be reconciled; account access is unchanged.",
        );
      } else {
        setDiagnostic(
          await api.preservationDiagnostic(
            userId,
            pending.record.id,
            actionReason.trim(),
          ),
        );
        setNotice(
          "Storage observations loaded. No object was deleted and no preservation gate was released.",
        );
      }
      setActionReason("");
      setPending(null);
      state.refresh();
      refreshWorkspace();
      onChanged?.();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The result is unknown. Refresh investigations before retrying.",
      );
      state.refresh();
      refreshWorkspace();
      onChanged?.();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <Panel
      variant="padded"
      title="Investigations and preservation"
      aside={
        <AdminButton
          variant="secondary"
          onClick={state.refresh}
          disabled={state.loading || busy}
        >
          Refresh investigations
        </AdminButton>
      }
    >
      <p>
        An account freeze pauses normal account access until explicitly
        released. Support appeals and authorized emergency help remain
        available. Evidence preservation is separate and can remain after
        account release. These controls do not release or refund money.
      </p>
      {(state.error || error) && <Notice error>{error || state.error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {state.loading && !state.data && (
        <DetailSkeleton label="Loading investigations" />
      )}
      {state.data && !state.data.items.length && (
        <Empty>No investigations recorded for this account.</Empty>
      )}
      <ul className="admin-case-records">
        {state.data?.items.map((record) => {
          const choreCount = record.preservation?.subjects?.filter((subject) =>
            subject.startsWith("chore:"),
          ).length;
          return (
            <li key={record.id}>
              <div className="admin-record-top">
                <strong>{record.reason}</strong>
                <Status>
                  {record.status === "active"
                    ? "account_frozen"
                    : "account_released"}
                </Status>
              </div>
              <dl className="admin-facts">
                <Fact label="Opened">{time(record.createdAt)}</Fact>
                <Fact label="Public account message">
                  {record.publicMessage}
                </Fact>
                <Fact label="Evidence preservation">
                  {record.preservation?.status === "pending"
                    ? "Pending — an earlier operation is unresolved; protection is not fully confirmed"
                    : record.preservation?.status === "active"
                      ? record.preservation.coverage ===
                        "prior_deletion_recorded"
                        ? "Current records preserved; earlier removal recorded"
                        : "Current records preserved"
                      : record.preservation?.status === "released"
                        ? "This evidence preservation released; other holds may remain"
                        : "Unknown — requires reconciliation"}
                </Fact>
                <Fact label="Preservation scope">
                  This account and {choreCount ?? "an unrecorded number of"}{" "}
                  retained chore {choreCount === 1 ? "case" : "cases"}. Other
                  participants’ unrelated chores are outside this scope.
                </Fact>
                {record.releasedAt && (
                  <Fact label="Account freeze released">
                    {time(record.releasedAt)}
                  </Fact>
                )}
                {record.releaseReason && (
                  <Fact label="Account release reason">
                    {record.releaseReason}
                  </Fact>
                )}
              </dl>
              <div className="admin-actions">
                {record.status === "active" && (
                  <AdminButton
                    variant="secondary"
                    disabled={!allowed || busy}
                    onClick={() => choose("account_release", record)}
                  >
                    Release this account freeze
                  </AdminButton>
                )}
                {record.preservation?.status === "pending" && (
                  <>
                    <AdminButton
                      variant="secondary"
                      disabled={!allowed || busy}
                      onClick={() => choose("retry", record)}
                    >
                      Retry evidence preservation
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      disabled={!allowed || busy}
                      onClick={() => choose("diagnostic", record)}
                    >
                      Inspect recorded storage objects
                    </AdminButton>
                  </>
                )}
                {record.preservation?.status === "active" && (
                  <AdminButton
                    variant="secondary"
                    disabled={!allowed || busy}
                    onClick={() => choose("evidence_release", record)}
                  >
                    Release this evidence preservation
                  </AdminButton>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="admin-actions">
        <AdminButton
          variant="secondary"
          disabled={busy || state.loading || pageIndex === 0}
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          Previous investigation page
        </AdminButton>
        <span>Page {pageIndex + 1}</span>
        <AdminButton
          variant="secondary"
          disabled={busy || state.loading || !state.data?.nextCursor}
          onClick={() => {
            const next = state.data?.nextCursor;
            if (next) {
              setPages([...pages.slice(0, pageIndex + 1), next]);
              setPageIndex(pageIndex + 1);
            }
          }}
        >
          Next investigation page
        </AdminButton>
      </div>
      {diagnostic && (
        <section aria-label="Recorded storage observations">
          <h3>Recorded storage observations</h3>
          <p>{diagnostic.note}</p>
          {!diagnostic.observations.length && (
            <Empty>
              No unresolved operation was found in this recorded scope.
            </Empty>
          )}
          <ul className="admin-case-records">
            {diagnostic.observations.map((operation) => (
              <li key={operation.operationId}>
                <div className="admin-record-top">
                  <strong>{humanize(operation.kind)}</strong>
                  <Status>{operation.phase}</Status>
                </div>
                <small>Operation {operation.operationId}</small>
                {!operation.observations.length && (
                  <p>
                    No storage object reference was recorded. The original
                    worker operation still requires review.
                  </p>
                )}
                <ul>
                  {operation.observations.map((object, index) => (
                    <li key={object.keyHash}>
                      Object {index + 1}: {humanize(object.observation)} at{" "}
                      {time(object.observedAt)}
                    </li>
                  ))}
                </ul>
                <p>Operation remains unresolved. No gate was released.</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!allowed && (
        <Notice>
          Investigation changes require specific staff permission and a
          currently verified MFA session.
        </Notice>
      )}
      <form
        className="admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (allowed && !incomplete(reason) && !incomplete(publicMessage))
            setPending("create");
        }}
      >
        <label>
          Internal investigation reason
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={2000}
            disabled={!allowed || busy}
            required
          />
        </label>
        <TemplatePicker
          kind="internal"
          value={reason}
          onInsert={setReason}
          disabled={!allowed || busy}
          maxLength={2000}
        />
        <label>
          Message shown to the account holder
          <textarea
            value={publicMessage}
            onChange={(event) => setPublicMessage(event.target.value)}
            maxLength={500}
            disabled={!allowed || busy}
            required
          />
        </label>
        <TemplatePicker
          kind="restriction"
          value={publicMessage}
          onInsert={setPublicMessage}
          disabled={!allowed || busy}
          maxLength={500}
        />
        <AdminButton
          variant="danger"
          type="submit"
          disabled={
            !allowed ||
            busy ||
            state.loading ||
            Boolean(state.error) ||
            incomplete(reason) ||
            incomplete(publicMessage)
          }
        >
          Open investigation and freeze account
        </AdminButton>
      </form>
      {pending && (
        <ConfirmDialog
          title={
            pending === "create"
              ? "Freeze this account?"
              : `${labels[pending.action]}?`
          }
          label={
            pending === "create" ? "Freeze account" : labels[pending.action]
          }
          busy={busy}
          onClose={() => setPending(null)}
          onConfirm={submit}
          confirmDisabled={
            !allowed ||
            (pending === "create"
              ? incomplete(reason) || incomplete(publicMessage)
              : incomplete(actionReason))
          }
        >
          {pending === "create" ? (
            <>
              <p>
                Account access is frozen immediately. Preservation of retained
                evidence may remain pending if an earlier deletion is
                unresolved. Earlier deleted evidence cannot be restored.
              </p>
              <p>{publicMessage}</p>
            </>
          ) : (
            <>
              <p>
                {pending.action === "account_release"
                  ? "Release only this account freeze. Evidence remains preserved or pending; other bans and investigations still apply."
                  : pending.action === "evidence_release"
                    ? "Release only this completed evidence preservation. It does not unfreeze the account or clear other safety holds. Unknown external operations cannot be released here."
                    : pending.action === "retry"
                      ? "Retry preservation only after the original operation is reconciled. This never changes account access or unlocks an uncertain deletion."
                      : "Read only the exact storage references recorded by this operation. A present or absent snapshot does not prove a delete has finished and cannot release its gate."}
              </p>
              <label>
                {pending.action.includes("release")
                  ? "Release reason"
                  : "Action reason"}
                <textarea
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  maxLength={1000}
                  required
                  disabled={busy}
                />
              </label>
            </>
          )}
        </ConfirmDialog>
      )}
    </Panel>
  );
}
