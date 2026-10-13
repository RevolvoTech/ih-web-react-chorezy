"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import { useAdmin } from "./auth";
import { useRemote } from "./hooks";
import { DetailSkeleton, WorkspaceSkeleton } from "./loading";
import { TemplatePicker } from "./template-picker";
import { unresolvedPlaceholders } from "./templates";
import { canAct, useWorkspace } from "./workspace-state";
import { PagedRecords } from "./paged-records";
import type { SupportTicket } from "./contracts";
import type { SupportAction } from "./workspace-contracts";
import { SupportActivityHeartbeat } from "./support-presence";
import {
  AdminButton,
  Empty,
  Fact,
  Metrics,
  Notice,
  Panel,
  Status,
  safeMediaUrl,
  time,
} from "./ui";

export function SupportPage() {
  const { api } = useAdmin();
  const { authority, refresh: refreshWorkspace } = useWorkspace();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const unreadLink = params.get("attention") === "unread";
  const [statusSelection, setStatusSelection] = useState({
    unreadLink,
    value: unreadLink ? "unread" : "all",
  });
  const status =
    statusSelection.unreadLink === unreadLink
      ? statusSelection.value
      : unreadLink
        ? "unread"
        : "all";
  const setStatus = (value: string) =>
    setStatusSelection({ unreadLink, value });
  const urlTicket = params.get("ticketId") || "";
  const [selected, setSelected] = useState({ url: urlTicket, id: urlTicket });
  const id = selected.url === urlTicket ? selected.id : urlTicket;
  const setId = (value: string) => setSelected({ url: urlTicket, id: value });
  const [inboxCursors, setInboxCursors] = useState([""]);
  const [messageCursors, setMessageCursors] = useState([""]);
  const replyKeys = useRef<Record<string, { body: string; key: string }>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [receipts, setReceipts] = useState<
    Record<string, { notice: string; requiredVersion?: number }>
  >({});
  const load = useCallback(
    () => api.support(search, status, inboxCursors.at(-1)!),
    [api, search, status, inboxCursors],
  );
  const state = useRemote(
    load,
    `support:${search}:${status}:${inboxCursors.at(-1)}`,
    true,
  );
  const data = state.data;
  const loadDetail = useCallback(
    async () =>
      id
        ? {
            ticket: await api.supportTicket(id),
            messages: await api.supportMessages(id, messageCursors.at(-1)!),
          }
        : null,
    [api, id, messageCursors],
  );
  const details = useRemote(
    loadDetail,
    `ticket:${id}:${messageCursors.at(-1)}`,
    true,
  );
  const ticket = details.data?.ticket;
  const messages = details.data?.messages.items || [];
  const permitted = canAct(authority, "support.write");
  const draft = drafts[id] || "";
  const receipt = receipts[id];
  const notice = receipt?.notice || "";
  const uncertain = receipt?.requiredVersion !== undefined;
  const canCheckDelivery =
    uncertain &&
    !details.loading &&
    !details.error &&
    details.version >= receipt.requiredVersion!;
  const select = (next: string) => {
    setId(next);
    setMessageCursors([""]);
  };
  useEffect(() => {
    if (id && window.matchMedia("(max-width: 1120px)").matches) {
      document
        .getElementById("support-conversation")
        ?.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }, [id]);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (
      !ticket ||
      !draft.trim() ||
      busyRef.current ||
      uncertain ||
      details.error ||
      !permitted ||
      unresolvedPlaceholders(draft)
    )
      return;
    const target = ticket.id;
    const body = draft.trim();
    busyRef.current = true;
    setBusy(true);
    setReceipts((previous) => ({ ...previous, [target]: { notice: "" } }));
    try {
      const previousKey = replyKeys.current[target];
      const request =
        previousKey?.body === body
          ? previousKey
          : { body, key: crypto.randomUUID() };
      replyKeys.current[target] = request;
      await api.reply(target, body, request.key);
      delete replyKeys.current[target];
      setDrafts((previous) => ({ ...previous, [target]: "" }));
      setReceipts((previous) => ({
        ...previous,
        [target]: { notice: "Reply sent." },
      }));
      state.refresh();
      details.refresh();
      refreshWorkspace();
    } catch (error) {
      const requiredVersion = details.refresh();
      setReceipts((previous) => ({
        ...previous,
        [target]: {
          notice: `${error instanceof Error ? error.message : "Reply could not be confirmed."} Refresh and check the conversation before retrying; delivery may have succeeded.`,
          requiredVersion,
        },
      }));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <SupportActivityHeartbeat />
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query.trim());
          setInboxCursors([""]);
          select("");
        }}
      >
        <label>
          Search support
          <input
            type="search"
            placeholder="Name, email or ticket number"
            value={query}
            maxLength={100}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setInboxCursors([""]);
              select("");
            }}
          >
            {[
              "all",
              "unread",
              "open",
              "in_progress",
              "waiting",
              "resolved",
              "closed",
            ].map((value) => (
              <option value={value} key={value}>
                {value === "all"
                  ? "All statuses"
                  : value.charAt(0).toUpperCase() +
                    value.slice(1).replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <AdminButton type="submit" variant="secondary">
          Search
        </AdminButton>
        <AdminButton
          variant="secondary"
          disabled={state.loading}
          onClick={() => {
            state.refresh();
            details.refresh();
          }}
        >
          {state.loading ? "Refreshing…" : "Refresh"}
        </AdminButton>
      </form>
      {state.error && (
        <Notice error>
          {state.error}
          {data && " · Showing the last successful snapshot."}
        </Notice>
      )}
      {!data && state.loading && <WorkspaceSkeleton kind="support" />}
      {data && (
        <>
          <Metrics
            values={[
              { label: "Open tickets", value: data.metrics.open },
              { label: "Urgent tickets", value: data.metrics.urgent },
            ]}
          />
          <div className="admin-master-detail admin-support-grid">
            <Panel
              title="Conversations"
              id="support-inbox"
              aside={
                <span>{data.tickets.length} shown · Updates every 15s</span>
              }
            >
              <div className="admin-record-list">
                {data.tickets.map((item) => (
                  <button
                    className="admin-record"
                    key={item.id}
                    aria-pressed={id === item.id}
                    aria-controls="support-conversation"
                    disabled={busy}
                    onClick={() => select(item.id)}
                  >
                    <span className="admin-record-top">
                      <strong>{item.customer.name}</strong>
                      <Status>{item.priority}</Status>
                    </span>
                    <span>{item.subject}</span>
                    <small>
                      {item.ticketNumber} · {item.customer.role}
                    </small>
                    <span className="admin-message-preview">
                      {item.lastMessage}
                    </span>
                    <small>
                      {time(item.lastMessageAt)}
                      {item.unreadCount > 0 && ` · ${item.unreadCount} unread`}
                    </small>
                  </button>
                ))}
              </div>
              {!data.tickets.length && (
                <Empty>No conversations match this search.</Empty>
              )}
              <div className="admin-actions">
                <AdminButton
                  variant="secondary"
                  disabled={state.loading || inboxCursors.length === 1}
                  onClick={() => setInboxCursors(inboxCursors.slice(0, -1))}
                >
                  Previous page
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  disabled={state.loading || !data.nextCursor}
                  onClick={() => {
                    if (data.nextCursor)
                      setInboxCursors([...inboxCursors, data.nextCursor]);
                  }}
                >
                  Next page
                </AdminButton>
              </div>
            </Panel>
            <Panel
              title={ticket?.subject || "Conversation"}
              id="support-conversation"
              aside={
                ticket && (
                  <a href="#support-inbox" className="admin-back-to-list">
                    <IconArrowLeft size={16} aria-hidden />
                    Back to inbox
                  </a>
                )
              }
            >
              {details.error && (
                <Notice error>
                  {details.error}
                  {ticket && " · Showing the last successful conversation."}
                </Notice>
              )}
              {id && !ticket && details.loading ? (
                <DetailSkeleton label="Loading support conversation" />
              ) : !ticket ? (
                <Empty>Select a support conversation.</Empty>
              ) : (
                <>
                  <div className="admin-conversation-context">
                    <div className="admin-record-top">
                      <strong>{ticket.ticketNumber}</strong>
                      <Status>{ticket.status}</Status>
                    </div>
                    <p className="admin-customer-summary">
                      <strong>{ticket.customer.name}</strong> ·{" "}
                      {ticket.customer.role}
                    </p>
                    {ticket.customer.id && (
                      <Link
                        className="admin-text-link"
                        href={`/admin/safety/?identifier=${encodeURIComponent(ticket.customer.id)}`}
                      >
                        Open account safety record
                      </Link>
                    )}
                    {typeof ticket.context?.choreId === "string" && (
                      <Link
                        className="admin-text-link"
                        href={`/admin/cases/?choreId=${encodeURIComponent(ticket.context.choreId)}`}
                      >
                        Open chore case file
                      </Link>
                    )}
                    <details className="admin-context-details">
                      <summary>Customer details</summary>
                      <dl className="admin-facts">
                        <Fact label="Customer">{ticket.customer.name}</Fact>
                        <Fact label="Email">{ticket.customer.email}</Fact>
                        <Fact label="Role">{ticket.customer.role}</Fact>
                        <Fact label="Assigned to">{ticket.assignedTo}</Fact>
                      </dl>
                    </details>
                  </div>
                  <ol
                    className="admin-messages"
                    aria-label="Support conversation"
                  >
                    {messages.map((message) => (
                      <li key={message.id} data-sender={message.senderType}>
                        <div className="admin-message-meta">
                          <strong>
                            {message.senderName || message.senderType}
                          </strong>
                          <time dateTime={message.createdAt}>
                            {time(message.createdAt)}
                          </time>
                        </div>
                        <p>{message.body}</p>
                        {message.attachments?.map((attachment, index) =>
                          safeMediaUrl(attachment.url) ? (
                            <a
                              key={index}
                              href={safeMediaUrl(attachment.url)!}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {attachment.name || `Attachment ${index + 1}`}
                            </a>
                          ) : (
                            <span key={index}>Attachment link unavailable</span>
                          ),
                        )}
                        {message.deliveryStatus && (
                          <small>{message.deliveryStatus}</small>
                        )}
                      </li>
                    ))}
                  </ol>
                  {!messages.length && <Empty>No messages recorded.</Empty>}
                  <div className="admin-actions">
                    <AdminButton
                      variant="secondary"
                      disabled={details.loading || messageCursors.length === 1}
                      onClick={() =>
                        setMessageCursors(messageCursors.slice(0, -1))
                      }
                    >
                      Previous messages
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      disabled={
                        details.loading || !details.data?.messages.nextCursor
                      }
                      onClick={() => {
                        const next = details.data?.messages.nextCursor;
                        if (next) setMessageCursors([...messageCursors, next]);
                      }}
                    >
                      Next messages
                    </AdminButton>
                    <span>Message page {messageCursors.length}</span>
                  </div>
                  <SupportWorkflow
                    key={ticket.id}
                    ticket={ticket}
                    throughMessageId={messages.at(-1)?.id}
                    disabled={!permitted || busy || Boolean(details.error)}
                    onChanged={() => {
                      details.refresh();
                      state.refresh();
                      refreshWorkspace();
                    }}
                  />
                  <form className="admin-reply" onSubmit={send}>
                    <label>
                      Reply to {ticket.customer.name}
                      <textarea
                        rows={3}
                        maxLength={4000}
                        value={draft}
                        onChange={(event) =>
                          setDrafts((previous) => ({
                            ...previous,
                            [id]: event.target.value,
                          }))
                        }
                        disabled={busy || !permitted}
                        required
                        aria-describedby="support-reply-hint"
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            (event.metaKey || event.ctrlKey)
                          ) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                          }
                        }}
                      />
                    </label>
                    <TemplatePicker
                      key={ticket.id}
                      kind="support"
                      context={{
                        name: ticket.customer.name,
                        choreId:
                          typeof ticket.context?.choreId === "string"
                            ? ticket.context.choreId
                            : undefined,
                      }}
                      value={draft}
                      onInsert={(body) =>
                        setDrafts((previous) => ({ ...previous, [id]: body }))
                      }
                      disabled={busy || !permitted}
                    />
                    {unresolvedPlaceholders(draft) && (
                      <Notice error>
                        Edit all template placeholders before sending.
                      </Notice>
                    )}
                    {!permitted && (
                      <Notice>
                        Your staff account needs the support.write capability to
                        send replies or change ticket workflow. An authorized
                        owner can configure this in staff authority.
                      </Notice>
                    )}
                    <div className="admin-compose-hints">
                      <span id="support-reply-hint">
                        Reply is visible to the customer · Ctrl / ⌘ + Enter to
                        send
                      </span>
                      <span>{draft.length.toLocaleString()} / 4,000</span>
                    </div>
                    {notice && <Notice error={uncertain}>{notice}</Notice>}
                    {uncertain && (
                      <AdminButton
                        variant="secondary"
                        disabled={!canCheckDelivery}
                        onClick={() => {
                          if (!canCheckDelivery) return;
                          setReceipts((previous) => ({
                            ...previous,
                            [id]: { notice: "" },
                          }));
                        }}
                      >
                        I checked the refreshed conversation
                      </AdminButton>
                    )}
                    <div className="admin-actions">
                      <p>
                        Visible to the customer. Internal notes are separate.
                      </p>
                      <AdminButton
                        type="submit"
                        disabled={
                          busy ||
                          !draft.trim() ||
                          uncertain ||
                          Boolean(details.error) ||
                          !permitted ||
                          unresolvedPlaceholders(draft)
                        }
                      >
                        <IconSend size={16} aria-hidden />
                        {busy ? "Sending…" : "Send reply"}
                      </AdminButton>
                    </div>
                  </form>
                </>
              )}
            </Panel>
          </div>
          <p className="admin-read-status">
            {state.loading
              ? "Refreshing in the background…"
              : `Updated ${time(state.updatedAt || undefined)}`}
          </p>
        </>
      )}
    </>
  );
}

function SupportWorkflow({
  ticket,
  throughMessageId,
  disabled,
  onChanged,
}: {
  ticket: SupportTicket;
  throughMessageId?: string;
  disabled: boolean;
  onChanged: () => void;
}) {
  const { api } = useAdmin();
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState(ticket.priority);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [notesVersion, setNotesVersion] = useState(0);
  const noteKey = useRef<{ body: string; key: string } | null>(null);
  const loadNotes = useCallback(
    (cursor: string) => api.supportNotes(ticket.id, cursor),
    [api, ticket.id],
  );
  async function apply(action: SupportAction["action"]) {
    if (disabled || lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    setFailed(false);
    try {
      const payload: SupportAction = {
        action,
        expectedVersion: ticket.version,
        reason,
        priority,
        throughMessageId,
      };
      if (action === "note") {
        const request =
          noteKey.current?.body === note
            ? noteKey.current
            : { body: note, key: crypto.randomUUID() };
        noteKey.current = request;
        payload.body = note;
        payload.clientRequestId = request.key;
      }
      await api.supportWorkflow(ticket.id, payload);
      setNotice(
        action === "resolve"
          ? "Ticket resolved. A customer reply reopens it; no closing message was sent."
          : "Workflow updated.",
      );
      if (action === "note") {
        setNote("");
        noteKey.current = null;
        setNotesVersion((version) => version + 1);
      }
      onChanged();
    } catch (error) {
      setFailed(true);
      setNotice(
        error instanceof Error
          ? error.message
          : "Workflow could not be confirmed. Refresh before retrying.",
      );
      onChanged();
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <details className="admin-context-details">
      <summary>Ticket workflow and internal notes</summary>
      <p>
        Resolution preserves chat history. Closing text is optional.
        Availability is separate from ticket status.
      </p>
      <label>
        Reason for workflow change
        <input
          value={reason}
          maxLength={1000}
          onChange={(event) => setReason(event.target.value)}
          disabled={disabled || busy}
        />
      </label>
      <label>
        Priority
        <select
          value={priority}
          disabled={disabled || busy}
          onChange={(event) => setPriority(event.target.value)}
        >
          {["low", "medium", "high", "urgent"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <div className="admin-actions">
        <AdminButton
          variant="secondary"
          disabled={disabled || busy || !throughMessageId}
          onClick={() => void apply("mark_read")}
        >
          Mark this page read
        </AdminButton>
        {["resolve", "reopen", "assign_self", "unassign", "priority"].map(
          (action) => (
            <AdminButton
              key={action}
              variant="secondary"
              disabled={disabled || busy || reason.trim().length < 5}
              onClick={() => void apply(action as SupportAction["action"])}
            >
              {
                {
                  resolve: "Resolve ticket",
                  reopen: "Reopen ticket",
                  assign_self: "Assign to me",
                  unassign: "Release my assignment",
                  priority: "Set priority",
                }[action]
              }
            </AdminButton>
          ),
        )}
      </div>
      <label>
        Internal staff note
        <textarea
          rows={4}
          value={note}
          maxLength={4000}
          onChange={(event) => setNote(event.target.value)}
          disabled={disabled || busy}
        />
      </label>
      <TemplatePicker
        kind="internal"
        value={note}
        onInsert={setNote}
        disabled={disabled || busy}
      />
      <AdminButton
        variant="secondary"
        disabled={
          disabled ||
          busy ||
          !note.trim() ||
          reason.trim().length < 5 ||
          unresolvedPlaceholders(note)
        }
        onClick={() => void apply("note")}
      >
        Add internal note
      </AdminButton>
      {notice && <Notice error={failed}>{notice}</Notice>}
      <PagedRecords
        key={`${ticket.id}:${notesVersion}`}
        title="Staff notes"
        scope={`ticket:${ticket.id}:notes`}
        load={loadNotes}
        render={(record) => (
          <>
            <strong>{record.actorName}</strong>
            <small>{time(record.createdAt)}</small>
            <p className="admin-preserve-lines">{record.body}</p>
          </>
        )}
      />
    </details>
  );
}
