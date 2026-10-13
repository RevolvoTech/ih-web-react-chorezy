"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useAdmin } from "./auth";
import { useWorkspace } from "./workspace-state";
import { PagedRecords } from "./paged-records";
import { AdminButton, Metrics, Notice, Status, time } from "./ui";
import { WorkspaceSkeleton } from "./loading";
export function AttentionPage() {
  const { counts, countsError, refreshing, refresh } = useWorkspace();
  const [kind, setKind] = useState("support");
  return (
    <>
      {countsError && (
        <Notice error>
          {countsError}
          {counts && " · Counts are from the last successful read."}
        </Notice>
      )}
      {!counts && !countsError && <WorkspaceSkeleton kind="attention" />}
      {counts && (
        <Metrics
          values={[
            {
              label: "Unread support messages",
              value: counts.supportUnreadMessages,
            },
            {
              label: "Tickets with unread messages",
              value: counts.supportUnread,
            },
            {
              label: "Unresolved support tickets",
              value: counts.supportUnresolved,
            },
            {
              label: "Unresolved emergencies",
              value: counts.emergencyUnresolved,
            },
            {
              label: "Cases needing attention",
              value: counts.casesNeedingAttention,
            },
          ]}
        />
      )}
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          refresh();
        }}
      >
        <label>
          Attention category
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="support">Unread or urgent support</option>
            <option value="emergency">Unresolved emergencies</option>
            <option value="case">Cases needing review</option>
          </select>
        </label>
        <AdminButton type="submit" variant="secondary" disabled={refreshing}>
          Refresh counts
        </AdminButton>
      </form>
      <p>
        Unread support messages and tickets are separate totals. Unresolved
        incidents stay here until their incident state changes. Counts cover all
        persisted records.
      </p>
      <AttentionRecords kind={kind} />
    </>
  );
}

export function AttentionRecords({
  kind,
  title = "Pending work",
}: {
  kind: string;
  title?: string;
}) {
  const { api } = useAdmin();
  const load = useCallback(
    (cursor: string) => api.attention(kind, cursor),
    [api, kind],
  );
  return (
    <PagedRecords
      title={title}
      poll
      scope={`attention:${kind}`}
      load={load}
      render={(record) => (
        <>
          <div className="admin-record-top">
            <strong>
              {record.subject || record.caseNumber || `Emergency ${record.id}`}
            </strong>
            <Status
              context={record.kind === "emergency" ? "emergency" : "default"}
            >
              {record.status}
            </Status>
          </div>
          <p>{record.summary || record.ticketNumber || record.id}</p>
          <small>
            {time(
              record.lastMessageAt ||
                record.triggeredAt ||
                record.lastActivityAt,
            )}
            {record.unreadForSupport
              ? ` · ${record.unreadForSupport} unread messages`
              : ""}
          </small>
          <div className="admin-actions">
            <Link
              className="admin-text-link"
              href={
                record.kind === "support"
                  ? `/admin/support/?ticketId=${encodeURIComponent(record.id)}`
                  : record.kind === "emergency"
                    ? `/admin/emergency/?incidentId=${encodeURIComponent(record.id)}`
                    : `/admin/trust/?caseId=${encodeURIComponent(record.id)}`
              }
            >
              Open {record.kind === "case" ? "trust case" : record.kind}
            </Link>
            {(record.choreId || record.relatedChoreIds?.[0]) && (
              <Link
                className="admin-text-link"
                href={`/admin/cases/?choreId=${encodeURIComponent(record.choreId || record.relatedChoreIds![0])}`}
              >
                Open chore case file
              </Link>
            )}
          </div>
        </>
      )}
    />
  );
}
