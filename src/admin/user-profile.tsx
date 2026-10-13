"use client";
import { useCallback } from "react";
import { useAdmin } from "./auth";
import { useRemote } from "./hooks";
import { canAct, useWorkspace } from "./workspace-state";
import { DetailSkeleton } from "./loading";
import { PagedRecords } from "./paged-records";
import {
  AdminButton,
  Empty,
  Fact,
  Notice,
  Panel,
  Status,
  humanize,
  money,
  time,
} from "./ui";

export function PrivateUserProfile({ userId }: { userId: string }) {
  const { api } = useAdmin();
  const { authority } = useWorkspace();
  const load = useCallback(() => api.userProfile(userId), [api, userId]);
  const state = useRemote(load, `user:${userId}:profile`);
  const profile = state.data;
  return (
    <>
      <Panel
        variant="padded"
        title="Private participant profile"
        aside={
          <AdminButton
            variant="secondary"
            disabled={state.loading}
            onClick={state.refresh}
          >
            {state.loading ? "Loading…" : "Refresh profile"}
          </AdminButton>
        }
      >
        {state.loading && !profile && (
          <DetailSkeleton label="Loading participant profile" />
        )}
        {state.error && <Notice error>{state.error}</Notice>}
        {profile && (
          <>
            <div className="admin-record-top">
              <strong>{profile.name}</strong>
              <Status>{profile.status || "unknown"}</Status>
            </div>
            <dl className="admin-facts">
              <Fact label="Role">{profile.role}</Fact>
              <Fact label="Safety ID">{profile.safetyId}</Fact>
              <Fact label="Email">{profile.email}</Fact>
              <Fact label="Phone">{profile.phoneNumber}</Fact>
              <Fact label="Verification level">
                {humanize(profile.verification.level)}
              </Fact>
              <Fact label="Email verified">
                {profile.verification.emailVerified ? "Yes" : "No"}
              </Fact>
              <Fact label="Phone verified">
                {profile.verification.phoneVerified ? "Yes" : "No"}
              </Fact>
            </dl>
            <ul className="admin-case-records">
              {profile.verification.checks.map((check) => (
                <li key={check.kind}>
                  <strong>{humanize(check.kind.replaceAll(".", "_"))}</strong>
                  <Status>{check.status}</Status>
                  <p>
                    Recorded verification:{" "}
                    {check.verified ? "verified" : "not verified"} · Provider:{" "}
                    {check.provider || "not recorded"}
                  </p>
                  <small>
                    Processed {time(check.processedAt)} · Expires{" "}
                    {time(check.expiresAt)}
                  </small>
                </li>
              ))}
            </ul>
            <p>
              Identity documents and extracted identity details are excluded
              from this view. Recorded provenance does not grant approval.
            </p>
          </>
        )}
      </Panel>
      {!authority ? (
        <Notice>Checking staff finance access…</Notice>
      ) : canAct(authority, "finance.read") ? (
        <PrivateUserFinance userId={userId} />
      ) : (
        <Notice>
          Finance access is required to view earnings, payout states and account
          money records.
        </Notice>
      )}
    </>
  );
}
function PrivateUserFinance({ userId }: { userId: string }) {
  const { api } = useAdmin();
  const load = useCallback(() => api.userFinance(userId), [api, userId]);
  const transactions = useCallback(
    (cursor: string) => api.userTransactions(userId, cursor),
    [api, userId],
  );
  const state = useRemote(load, `user:${userId}:finance`);
  const finance = state.data;
  return (
    <>
      <Panel
        variant="padded"
        title="Earnings and payout state"
        aside={
          <AdminButton
            variant="secondary"
            disabled={state.loading}
            onClick={state.refresh}
          >
            {state.loading ? "Loading…" : "Refresh finance"}
          </AdminButton>
        }
      >
        {state.loading && !finance && (
          <DetailSkeleton label="Loading recorded earnings and payout state" />
        )}
        {state.error && <Notice error>{state.error}</Notice>}
        {finance && (
          <>
            {finance.earnings ? (
              <dl className="admin-facts">
                {Object.entries(finance.earnings.balances).map(
                  ([kind, amount]) => (
                    <Fact
                      key={kind}
                      label={humanize(
                        kind.replace(
                          /[A-Z]/g,
                          (letter) => `_${letter.toLowerCase()}`,
                        ),
                      )}
                    >
                      {money(amount.amountCents, amount.currency, true)}
                    </Fact>
                  ),
                )}
              </dl>
            ) : (
              <Empty>No applicable helper earnings.</Empty>
            )}
            <p>{finance.earningsNote}</p>
            {finance.earnings && (
              <small>Calculated {time(finance.earnings.generatedAt)}</small>
            )}
            <dl className="admin-facts">
              <Fact label="Payout account">
                {finance.payout?.stripeAccountId || "Not recorded"}
              </Fact>
              <Fact label="Details submitted">
                {finance.payout
                  ? finance.payout.detailsSubmitted
                    ? "Yes"
                    : "No"
                  : "Not recorded"}
              </Fact>
              <Fact label="Payouts enabled">
                {finance.payout
                  ? finance.payout.payoutsEnabled
                    ? "Yes"
                    : "No"
                  : "Not recorded"}
              </Fact>
              <Fact label="Last provider status refresh">
                {time(finance.payout?.lastStatusRefreshAt)}
              </Fact>
              <Fact label="Disabled reason">
                {finance.payout?.disabledReason || "Not recorded"}
              </Fact>
              <Fact label="Requirements due">
                {finance.payout?.requirementsCurrentlyDue?.join(", ") ||
                  "None recorded"}
              </Fact>
              <Fact label="Requirements past due">
                {finance.payout?.requirementsPastDue?.join(", ") ||
                  "None recorded"}
              </Fact>
            </dl>
            <p>{finance.payoutNote}</p>
          </>
        )}
      </Panel>
      <PagedRecords
        title="Account transactions"
        scope={`user:${userId}:transactions`}
        load={transactions}
        render={(record) => (
          <>
            <div className="admin-record-top">
              <strong>
                {money(record.amountCents, record.currency || "USD", true)}
              </strong>
              <Status>{record.status}</Status>
            </div>
            <p>
              {humanize(record.type || "transaction")} · {record.id}
            </p>
            <small>
              {time(record.createdAt)} · Stored in {record.originalUnit}
            </small>
            {record.reference && <p>Reference: {record.reference}</p>}
          </>
        )}
      />
    </>
  );
}
