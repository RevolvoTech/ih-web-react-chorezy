"use client";
import { useCallback, useState, type ReactNode } from "react";
import { useRemote } from "./hooks";
import { DetailSkeleton } from "./loading";
import { AdminButton, Empty, Notice, Panel } from "./ui";
import type { Page } from "./workspace-contracts";
export function PagedRecords<T extends { id: string }>({
  title,
  scope,
  load,
  render,
  empty = "No records found.",
  poll = false,
}: {
  title: string;
  scope: string;
  load: (cursor: string) => Promise<Page<T>>;
  render: (record: T) => ReactNode;
  empty?: string;
  poll?: boolean;
}) {
  const [paging, setPaging] = useState<{ scope: string; cursors: string[] }>({
    scope,
    cursors: [""],
  });
  const cursors = paging.scope === scope ? paging.cursors : [""];
  const cursor = cursors.at(-1)!;
  const read = useCallback(() => load(cursor), [load, cursor]);
  const state = useRemote(read, `${scope}:${cursor}`, poll);
  return (
    <Panel
      variant="padded"
      title={title}
      aside={<span>Page {cursors.length}</span>}
    >
      {state.error && (
        <Notice error>
          {state.error}
          {state.data && " · Showing the last successful page."}
        </Notice>
      )}
      {!state.data && state.loading && (
        <DetailSkeleton label={`Loading ${title.toLowerCase()}`} />
      )}
      {state.data && (
        <>
          <ol className="admin-case-records">
            {state.data.items.map((record) => (
              <li key={record.id}>{render(record)}</li>
            ))}
          </ol>
          {!state.data.items.length && <Empty>{empty}</Empty>}
        </>
      )}
      <div className="admin-actions">
        <AdminButton
          variant="secondary"
          disabled={state.loading || cursors.length === 1}
          onClick={() => setPaging({ scope, cursors: cursors.slice(0, -1) })}
        >
          Previous page
        </AdminButton>
        <AdminButton
          variant="secondary"
          disabled={state.loading || !state.data?.nextCursor}
          onClick={() => {
            if (state.data?.nextCursor)
              setPaging({
                scope,
                cursors: [...cursors, state.data.nextCursor],
              });
          }}
        >
          Next page
        </AdminButton>
        <AdminButton
          variant="secondary"
          disabled={state.loading}
          onClick={state.refresh}
        >
          {state.loading ? "Loading…" : "Refresh"}
        </AdminButton>
      </div>
    </Panel>
  );
}
