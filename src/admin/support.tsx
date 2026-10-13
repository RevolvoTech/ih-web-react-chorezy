"use client";
import Link from "next/link";
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
import { WorkspaceSkeleton } from "./loading";
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
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [id, setId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [receipts, setReceipts] = useState<
    Record<string, { notice: string; requiredVersion?: number }>
  >({});
  const load = useCallback(
    () => api.support(search, status),
    [api, search, status],
  );
  const state = useRemote(load, `support:${search}:${status}`, true);
  const data = state.data;
  const ticket = data?.tickets.find((item) => item.id === id);
  const draft = drafts[id] || "";
  const receipt = receipts[id];
  const notice = receipt?.notice || "";
  const uncertain = receipt?.requiredVersion !== undefined;
  const canCheckDelivery =
    uncertain &&
    !state.loading &&
    !state.error &&
    state.version >= receipt.requiredVersion!;
  const select = (next: string) => {
    setId(next);
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
    if (!ticket || !draft.trim() || busyRef.current || uncertain || state.error)
      return;
    const target = ticket.id;
    const body = draft.trim();
    busyRef.current = true;
    setBusy(true);
    setReceipts((previous) => ({ ...previous, [target]: { notice: "" } }));
    try {
      await api.reply(target, body);
      setDrafts((previous) => ({ ...previous, [target]: "" }));
      setReceipts((previous) => ({
        ...previous,
        [target]: { notice: "Reply sent." },
      }));
      state.refresh();
    } catch (error) {
      const requiredVersion = state.refresh();
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
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query.trim());
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
              select("");
            }}
          >
            {[
              "all",
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
          onClick={state.refresh}
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
              {!ticket ? (
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
                    {ticket.messages.map((message) => (
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
                  {!ticket.messages.length && (
                    <Empty>No messages recorded.</Empty>
                  )}
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
                        disabled={busy}
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
                        Visible to the customer. Internal notes are added in
                        Safety.
                      </p>
                      <AdminButton
                        type="submit"
                        disabled={
                          busy ||
                          !draft.trim() ||
                          uncertain ||
                          Boolean(state.error)
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
