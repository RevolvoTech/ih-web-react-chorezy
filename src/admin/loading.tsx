import { Metrics, Panel } from "./ui";

export type WorkspaceKind =
  | "overview"
  | "support"
  | "safety"
  | "referrals"
  | "trust"
  | "emergency";

const metricLabels: Record<WorkspaceKind, string[]> = {
  overview: [
    "Total accounts",
    "New in period",
    "Active accounts",
    "Verified accounts",
  ],
  support: ["Open tickets", "Urgent tickets"],
  safety: [
    "Active restrictions",
    "Recent open chores",
    "Recent open tickets",
    "Recent payment flags",
  ],
  referrals: [
    "Total invites",
    "Active invites",
    "Pending rewards",
    "Paid rewards",
  ],
  trust: ["Watching", "Needs review", "High severity", "Events in 24 hours"],
  emergency: ["Active", "Responding", "Failed", "Last 24 hours"],
};

function Block({
  size = "line",
}: {
  size?: "line" | "short" | "value" | "paragraph";
}) {
  return <span className={`admin-skeleton admin-skeleton--${size}`} />;
}

function Rows({ count = 4 }: { count?: number }) {
  return (
    <div className="admin-loading-rows">
      {Array.from({ length: count }, (_, index) => (
        <div className="admin-loading-row" key={index}>
          <div>
            <Block />
            <Block size="short" />
          </div>
          <Block size="short" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton({
  label = "Loading record details",
}: {
  label?: string;
}) {
  return (
    <div
      className="admin-loading-detail"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true" className="admin-loading-detail-content">
        <Block />
        <Block size="paragraph" />
        <div className="admin-facts">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <Block size="short" />
              <Block />
            </div>
          ))}
        </div>
        <Block size="paragraph" />
        <Block size="paragraph" />
      </div>
    </div>
  );
}

export function WorkspaceSkeleton({ kind }: { kind: WorkspaceKind }) {
  const label = `Loading ${kind === "overview" ? "account overview" : kind} records`;
  const master = kind === "support" || kind === "trust" || kind === "emergency";
  return (
    <div
      className="admin-loading-workspace"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true" className="admin-loading-layout">
        <Metrics
          values={metricLabels[kind].map((label) => ({
            label,
            value: <Block size="value" />,
          }))}
        />
        {master ? (
          <div
            className={`admin-master-detail ${kind === "support" ? "admin-support-grid" : ""}`}
          >
            <Panel
              title={
                kind === "support"
                  ? "Conversations"
                  : kind === "trust"
                    ? "Risk cases"
                    : "Incidents"
              }
            >
              <Rows />
            </Panel>
            <Panel
              title={
                kind === "support"
                  ? "Conversation"
                  : kind === "trust"
                    ? "Case detail"
                    : "Incident detail"
              }
            >
              <div className="admin-loading-detail-content">
                <Block />
                <Block size="paragraph" />
                <Block size="paragraph" />
              </div>
            </Panel>
          </div>
        ) : kind === "overview" ? (
          <>
            <div className="admin-two-columns">
              <Panel title="Accounts by role">
                <Rows count={5} />
              </Panel>
              <Panel title="Location coverage">
                <div className="admin-loading-detail-content">
                  <Block />
                  <Block size="paragraph" />
                  <Block />
                </div>
              </Panel>
            </div>
            <Panel title="U.S. account geography">
              <Rows count={3} />
            </Panel>
          </>
        ) : kind === "referrals" ? (
          <Panel title="Referrer activity">
            <Rows count={5} />
          </Panel>
        ) : (
          <div className="admin-two-columns">
            <Panel title="Account context">
              <Rows />
            </Panel>
            <Panel title="Action history">
              <Rows />
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
