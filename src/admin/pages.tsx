"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { useAdmin } from "./auth";
import { useRemote } from "./hooks";
import { SafetyPage } from "./safety";
import { SupportPage } from "./support";
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
  safeMediaUrl,
  time,
} from "./ui";
import type { EmergencyIncident, TrustCase } from "./contracts";

export function AdminSection({ section }: { section: string }) {
  return section === "support" ? (
    <SupportPage />
  ) : section === "safety" ? (
    <SafetyPage />
  ) : section === "referrals" ? (
    <ReferralsPage />
  ) : section === "emergency" ? (
    <EmergencyPage />
  ) : section === "trust" ? (
    <TrustPage />
  ) : (
    <OverviewPage />
  );
}
function Refresh({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <AdminButton variant="secondary" onClick={onClick} disabled={busy}>
      <IconRefresh size={17} aria-hidden />
      {busy ? "Refreshing…" : "Refresh"}
    </AdminButton>
  );
}
function ReadStatus({
  error,
  loading,
  updatedAt,
  hasData,
}: {
  error: string | null;
  loading: boolean;
  updatedAt: string | null;
  hasData: boolean;
}) {
  return error ? (
    <Notice error>
      {error}
      {hasData && (
        <span>
          {" "}
          · Showing the last successful snapshot; counts may be outdated.
        </span>
      )}
    </Notice>
  ) : !hasData && loading ? (
    <Notice>Loading records…</Notice>
  ) : (
    <p className="admin-read-status" aria-live="polite">
      {loading
        ? "Refreshing records…"
        : `Updated ${time(updatedAt || undefined)}`}
    </p>
  );
}
function Search({
  label,
  onSearch,
  maxLength = 100,
  children,
}: {
  label: string;
  onSearch: (value: string) => void;
  maxLength?: number;
  children?: React.ReactNode;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="admin-toolbar"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
    >
      <label>
        {label}
        <input
          type="search"
          maxLength={maxLength}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <AdminButton type="submit" variant="secondary">
        Search
      </AdminButton>
      {children}
    </form>
  );
}
function OverviewPage() {
  const { api } = useAdmin();
  const [days, setDays] = useState(30);
  const load = useCallback(() => api.overview(days), [api, days]);
  const state = useRemote(load, `overview:${days}`);
  const data = state.data;
  return (
    <>
      <div className="admin-toolbar">
        <label>
          Reporting period
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
        <Refresh onClick={state.refresh} busy={state.loading} />
      </div>
      <ReadStatus {...state} hasData={Boolean(data)} />
      {data && (
        <>
          <Metrics
            values={[
              { label: "Total accounts", value: data.summary.totalUsers },
              { label: "New in period", value: data.summary.period },
              { label: "Active accounts", value: data.summary.activeAccounts },
              {
                label: "Verified accounts",
                value: data.summary.verifiedAccounts,
              },
            ]}
          />
          <div className="admin-two-columns">
            <Panel title="Accounts by role">
              <ul className="admin-breakdown">
                {data.roles.map((role) => (
                  <li key={role.label}>
                    <span>{humanize(role.label)}</span>
                    <strong>{role.count}</strong>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Location coverage">
              <dl className="admin-facts">
                <Fact label="Known location">
                  {data.tracking.coverageRate}%
                </Fact>
                <Fact label="Unknown location">
                  {data.tracking.unknownLocationUsers}
                </Fact>
                <Fact label="U.S. state not mapped">
                  {data.tracking.usaUnmappedUsers}
                </Fact>
                <Fact label="Outside the U.S.">
                  {data.tracking.outsideUsaUsers}
                </Fact>
              </dl>
            </Panel>
          </div>
          <Panel
            title="U.S. account geography"
            aside={
              <span>
                {data.range.from} – {data.range.to}
              </span>
            }
          >
            <div className="admin-table-wrap">
              <table>
                <caption className="visually-hidden">
                  Accounts by U.S. state
                </caption>
                <thead>
                  <tr>
                    <th scope="col">State</th>
                    <th scope="col">Total accounts</th>
                    <th scope="col">New in period</th>
                  </tr>
                </thead>
                <tbody>
                  {data.states.map((item) => (
                    <tr key={item.code}>
                      <th scope="row">
                        {item.name}{" "}
                        <span className="admin-muted">{item.code}</span>
                      </th>
                      <td>{item.total}</td>
                      <td>{item.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.states.length && (
              <Empty>No accounts have a mapped U.S. state.</Empty>
            )}
          </Panel>
          <p className="admin-note">
            Counts include QA accounts that remain in the database. Account
            totals are not a launch adoption claim.
          </p>
        </>
      )}
    </>
  );
}
function ReferralsPage() {
  const { api } = useAdmin();
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [limit, setLimit] = useState(100);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const load = useCallback(() => api.referrals(search), [api, search]);
  const state = useRemote(load, `referrals:${search}`);
  const data = state.data;
  const release = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await api.releaseReferrals(limit);
      setNotice({
        text: `Released ${result.released} rewards (${money(result.totalReleasedCents, "USD", true)}). ${result.blocked} blocked by eligibility checks.`,
        error: false,
      });
      state.refresh();
    } catch (error) {
      setNotice({
        text: `${error instanceof Error ? error.message : "Release failed."} Check reward activity before attempting another release.`,
        error: true,
      });
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };
  return (
    <>
      <Search label="Search referrers" onSearch={setSearch}>
        <Refresh onClick={state.refresh} busy={state.loading} />
      </Search>
      <ReadStatus {...state} hasData={Boolean(data)} />
      {notice && <Notice error={notice.error}>{notice.text}</Notice>}
      {data && (
        <>
          <Metrics
            values={[
              {
                label: "Total invites",
                value: data.stats.overview.totalReferrals,
              },
              {
                label: "Active invites",
                value: data.stats.overview.activeReferrals,
              },
              {
                label: "Pending rewards",
                value: money(
                  data.stats.overview.pendingRewardCents,
                  "USD",
                  true,
                ),
              },
              {
                label: "Paid rewards",
                value: money(data.stats.overview.paidRewardCents, "USD", true),
              },
            ]}
          />
          <Panel title="Referrer activity">
            <div className="admin-table-wrap">
              <table>
                <caption className="visually-hidden">
                  Referral activity, up to 100 matching referrers
                </caption>
                <thead>
                  <tr>
                    {[
                      "Referrer",
                      "Role",
                      "Invited",
                      "Qualified",
                      "Rewarded",
                      "Pending",
                      "Earned",
                      "Blocked",
                    ].map((label) => (
                      <th scope="col" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.referrers.map((row) => (
                    <tr key={row.referrerId}>
                      <th scope="row">
                        {row.fullName || "Unknown"}
                        <small>{row.email || "No email"}</small>
                      </th>
                      <td>{row.role}</td>
                      <td>{row.invitedCount}</td>
                      <td>{row.qualifiedCount}</td>
                      <td>{row.rewardedCount}</td>
                      <td>{money(row.pendingRewardCents, "USD", true)}</td>
                      <td>{money(row.earnedRewardCents, "USD", true)}</td>
                      <td>{row.blockedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.referrers.length && (
              <Empty>No referral activity matches this search.</Empty>
            )}
          </Panel>
          <Panel title="Reward recovery">
            <div className="admin-panel-body">
              <p>
                Release only rewards the backend currently finds eligible. This
                is a global batch, independent of the search above; exact users
                and amounts cannot be previewed yet.
              </p>
              <div className="admin-toolbar">
                <label>
                  Maximum rewards in batch
                  <select
                    value={limit}
                    onChange={(event) => setLimit(Number(event.target.value))}
                  >
                    <option value={1}>1</option>
                    <option value={10}>10</option>
                    <option value={100}>100</option>
                  </select>
                </label>
                <AdminButton
                  variant="secondary"
                  disabled={busy || state.loading || Boolean(state.error)}
                  onClick={() => setConfirm(true)}
                >
                  Review release
                </AdminButton>
              </div>
            </div>
          </Panel>
        </>
      )}
      {confirm && (
        <ConfirmDialog
          title="Release eligible rewards?"
          label="Release eligible rewards"
          busy={busy}
          onClose={() => setConfirm(false)}
          onConfirm={() => void release()}
        >
          <p>
            The backend will process up to <strong>{limit}</strong> eligible
            rewards across all referrers. This changes account balances. The
            current search does not limit this action.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
function TrustPage() {
  const { api } = useAdmin();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [id, setId] = useState("");
  const load = useCallback(
    () => api.trust(search, filter),
    [api, search, filter],
  );
  const state = useRemote(load, `trust:${search}:${filter}`);
  const data = state.data;
  return (
    <>
      <Search
        label="Search cases or events"
        maxLength={120}
        onSearch={(value) => {
          setSearch(value);
          setId("");
        }}
      >
        <label>
          Status
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setId("");
            }}
          >
            {[
              "active",
              "watching",
              "needs_review",
              "resolved",
              "dismissed",
              "all",
            ].map((value) => (
              <option value={value} key={value}>
                {humanize(value)}
              </option>
            ))}
          </select>
        </label>
        <Refresh onClick={state.refresh} busy={state.loading} />
      </Search>
      <ReadStatus {...state} hasData={Boolean(data)} />
      {data && (
        <>
          <Metrics
            values={[
              { label: "Watching", value: data.summary.cases.watching },
              { label: "Needs review", value: data.summary.cases.needsReview },
              {
                label: "High severity",
                value: data.summary.cases.highSeverity,
              },
              {
                label: "Events in 24 hours",
                value: data.summary.events24h.total,
              },
            ]}
          />
          <div className="admin-master-detail">
            <Panel title="Risk cases" aside={<span>Up to 100</span>}>
              <div className="admin-record-list">
                {data.cases.map((item) => (
                  <button
                    className="admin-record"
                    key={item.id}
                    aria-pressed={id === item.id}
                    onClick={() => setId(item.id)}
                  >
                    <span className="admin-record-top">
                      <strong>{item.caseNumber}</strong>
                      <Status>{item.severity}</Status>
                    </span>
                    <span>
                      {item.targetUser?.name ||
                        item.targetBusiness?.name ||
                        item.targetRole}
                    </span>
                    <small>
                      {humanize(item.reason)} · {time(item.lastActivityAt)}
                    </small>
                  </button>
                ))}
              </div>
              {!data.cases.length && (
                <Empty>No cases match these filters.</Empty>
              )}
            </Panel>
            {id ? (
              <TrustDetail key={id} id={id} />
            ) : (
              <Panel title="Case detail">
                <Empty>Select a case to view related records.</Empty>
              </Panel>
            )}
          </div>
          <Panel title="Recent trust events">
            <ol className="admin-timeline">
              {data.events.map((item) => (
                <li key={item.id}>
                  <div className="admin-record-top">
                    <strong>{humanize(item.kind)}</strong>
                    <Status>{item.severity}</Status>
                  </div>
                  <p>{item.summary || "No summary recorded."}</p>
                  <small>
                    {time(item.createdAt)} · Chore{" "}
                    {item.choreId || "not linked"}
                  </small>
                </li>
              ))}
            </ol>
            {!data.events.length && (
              <Empty>No recent events match this search.</Empty>
            )}
          </Panel>
          <p className="admin-note">
            Risk flags are signals, not proof of wrongdoing. This view does not
            apply restrictions or require approval of every account.
          </p>
        </>
      )}
    </>
  );
}
function TrustDetail({ id }: { id: string }) {
  const { api } = useAdmin();
  const load = useCallback(() => api.trustCase(id), [api, id]);
  const state = useRemote(load, `trustcase:${id}`);
  const item: TrustCase | null = state.data;
  return (
    <Panel title="Case detail">
      <ReadStatus {...state} hasData={Boolean(item)} />
      {item && (
        <div className="admin-panel-body">
          <div className="admin-record-top">
            <h3>{item.caseNumber}</h3>
            <Status>{item.status}</Status>
          </div>
          <p>{item.summary || "No summary recorded."}</p>
          <dl className="admin-facts">
            <Fact label="Account">
              {item.targetUser?.name ||
                item.targetBusiness?.name ||
                item.targetUserId ||
                item.targetBusinessId}
            </Fact>
            <Fact label="Role">{item.targetRole}</Fact>
            <Fact label="Last activity">{time(item.lastActivityAt)}</Fact>
            {Object.entries(item.metrics || {}).map(([key, value]) => (
              <Fact key={key} label={humanize(key)}>
                {value}
              </Fact>
            ))}
          </dl>
          {item.targetUserId && (
            <Link
              className="admin-text-link"
              href={`/admin/safety/?identifier=${encodeURIComponent(item.targetUserId)}`}
            >
              Open account safety record
            </Link>
          )}
          <h3>Related records</h3>
          <dl className="admin-facts">
            <Fact label="Chores">
              {item.relatedChoreIds?.join(", ") || "None linked"}
            </Fact>
            <Fact label="Conversations">
              {item.relatedConversationIds?.join(", ") || "None linked"}
            </Fact>
            <Fact label="Support tickets">
              {item.supportTicketIds?.join(", ") || "None linked"}
            </Fact>
          </dl>
          <h3>Case events</h3>
          <ol className="admin-timeline">
            {item.events?.map((event) => (
              <li key={event.id}>
                <strong>{humanize(event.kind)}</strong>
                <p>{event.summary}</p>
                <small>{time(event.createdAt)}</small>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Panel>
  );
}
function EmergencyPage() {
  const { api } = useAdmin();
  const [filter, setFilter] = useState("active");
  const [id, setId] = useState("");
  const load = useCallback(() => api.emergencies(filter), [api, filter]);
  const state = useRemote(load, `emergency:${filter}`, true);
  const data = state.data;
  return (
    <>
      <div className="admin-toolbar">
        <label>
          Incident status
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setId("");
            }}
          >
            {[
              "active",
              "responding",
              "failed",
              "resolved",
              "cancelled",
              "all",
            ].map((value) => (
              <option value={value} key={value}>
                {humanize(value)}
              </option>
            ))}
          </select>
        </label>
        <Refresh onClick={state.refresh} busy={state.loading} />
      </div>
      <ReadStatus {...state} hasData={Boolean(data)} />
      {data && (
        <>
          <Notice>
            Provider environment:{" "}
            <strong>{data.summary.provider.mode || "Not reported"}</strong>.
            This view shows incident records; it does not send or cancel
            emergency dispatch.
          </Notice>
          <Metrics
            values={[
              { label: "Active", value: data.summary.active },
              { label: "Responding", value: data.summary.responding },
              { label: "Failed", value: data.summary.failed },
              { label: "Last 24 hours", value: data.summary.last24Hours },
            ]}
          />
          <div className="admin-master-detail">
            <Panel title="Incidents" aside={<span>Updates every 15s</span>}>
              <div className="admin-record-list">
                {data.incidents.map((item) => (
                  <button
                    className="admin-record"
                    key={item.id}
                    aria-pressed={id === item.id}
                    onClick={() => setId(item.id)}
                  >
                    <span className="admin-record-top">
                      <strong>{item.subject?.name || "Unknown person"}</strong>
                      <Status context="emergency">{item.status}</Status>
                    </span>
                    <span>
                      {item.chore?.title ||
                        item.description ||
                        "Chore emergency"}
                    </span>
                    <small>{time(item.triggeredAt)}</small>
                  </button>
                ))}
              </div>
              {!data.incidents.length && (
                <Empty>No incidents match this status.</Empty>
              )}
            </Panel>
            {id ? (
              <EmergencyDetail key={id} id={id} />
            ) : (
              <Panel title="Incident detail">
                <Empty>
                  Select an incident to inspect its location and provider
                  timeline.
                </Empty>
              </Panel>
            )}
          </div>
        </>
      )}
    </>
  );
}
function EmergencyDetail({ id }: { id: string }) {
  const { api } = useAdmin();
  const load = useCallback(() => api.emergency(id), [api, id]);
  const state = useRemote(load, `incident:${id}`, true);
  const item: EmergencyIncident | null = state.data;
  const coordinates = item?.location?.coordinates;
  return (
    <Panel title="Incident detail">
      <ReadStatus {...state} hasData={Boolean(item)} />
      {item && (
        <div className="admin-panel-body">
          <Status context="emergency">{item.status}</Status>
          <dl className="admin-facts">
            <Fact label="Person at risk">{item.subject?.name}</Fact>
            <Fact label="Reporting person">{item.reporter?.name}</Fact>
            <Fact label="Contact">
              {item.subject?.phone || "Not available"}
            </Fact>
            <Fact label="Chore">{item.chore?.title}</Fact>
            <Fact label="Location">
              {coordinates?.length === 2
                ? `${coordinates[1]}, ${coordinates[0]}`
                : "Not available"}
              <br />
              {item.chore?.address}
            </Fact>
            <Fact label="Noonlight alarm">
              {item.provider.alarmId || "Not submitted"}
            </Fact>
            <Fact label="Provider mode">
              {item.provider.mode || "Not reported"}
            </Fact>
            <Fact label="Provider status">
              {item.provider.status || "Not reported"}
            </Fact>
          </dl>
          {item.provider.failureMessage && (
            <Notice error>{item.provider.failureMessage}</Notice>
          )}
          <h3>Emergency media</h3>
          {!item.provider.media?.length ? (
            <p>
              No media attached
              {item.provider.mediaPending
                ? "; recording upload is pending."
                : "."}
            </p>
          ) : (
            item.provider.media.map((media, index) => (
              <div key={`${media.attachedAt}-${index}`}>
                {safeMediaUrl(media.url) ? (
                  <video
                    controls
                    preload="none"
                    src={safeMediaUrl(media.url)!}
                    aria-label={`Incident recording ${index + 1}`}
                  />
                ) : (
                  <Notice>
                    Media is attached, but its viewing link is unavailable.
                  </Notice>
                )}
                <small>Attached {time(media.attachedAt)}</small>
                {media.requestedWindowSeconds &&
                media.windowSeconds &&
                media.windowSeconds > media.requestedWindowSeconds ? (
                  <p>
                    Requested {media.requestedWindowSeconds}s; full{" "}
                    {media.windowSeconds}s recording attached.
                  </p>
                ) : null}
              </div>
            ))
          )}
          <h3>Provider timeline</h3>
          <ol className="admin-timeline">
            {item.provider.webhookEvents?.map((event, index) => (
              <li key={index}>
                <strong>
                  {humanize(event.eventType || event.type || "Provider update")}
                </strong>
                <small>{time(event.receivedAt || event.createdAt)}</small>
              </li>
            ))}
          </ol>
          {!item.provider.webhookEvents?.length && (
            <p>No provider callback recorded.</p>
          )}
        </div>
      )}
    </Panel>
  );
}
