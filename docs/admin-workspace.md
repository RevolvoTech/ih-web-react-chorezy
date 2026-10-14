# Chorezy staff workspace

## Scope and design

This isolated branch implements the Chorezy staff console under `/admin/` and the matching Chorezy Express routes. MongoDB is the source of application records; the existing Supabase project authenticates staff. This work has not been deployed.

Seven primary sections are grouped by task: Case files, Account overview, User support, Safety, Emergency, Trust review and Referrals. Attention is an optional diagnostic route. Counts appear after the section text: Support counts unread messages, Case files counts trust cases in `needs_review`, and Emergency counts unresolved incidents, including dispatch failures. Links select the corresponding filter. Viewing records does not acknowledge unread work.

The interface uses existing shared admin panels, controls, notices, paged records and component skeletons. Bricolage Grotesque is used for page headings; local Cereal is used for navigation, forms and body text. Section accents follow the existing multicolor sidebar. Mobile layouts retain labels, keyboard access and 44px controls. Reduced motion disables placeholder animation.

## Implemented core contracts

All routes below are under `/api/v1/admin`; every request carries the current verified Supabase bearer token.

| Surface | Implemented behavior |
| --- | --- |
| Workspace authority | `/workspace/me`; explicit server capabilities and current JWT assurance level |
| Navigation counts | `/workspace/attention/counts`; filtered, independently paged attention lists |
| Case files | Exact identifier lookup; chore lifecycle, accepted bid, participants and recorded Guardian links, original proof/dispute/AI reasoning |
| Marketplace chat | Scoped conversations and original messages with independent cursor pagination and recorded moderation/Guardian state |
| Evidence access | Explicit authorized access to recorded chore/message/stream files; scoped storage checks and five-minute signed links |
| Linked money | Independently paged payment, escrow, wallet, transaction and gift-card records linked by explicit chore ID |
| Private profiles | Contact/account/verification status, persisted provenance, independently gated helper earnings, payout onboarding and paged account transactions |
| Support | Paged inbox, ticket details and messages; explicit page acknowledgement; version-checked resolve/reopen, priority and own assignment; internal notes; idempotent replies/notes |
| Safety | Existing suspension/exclusion/note operations with action-specific capability checks and current MFA for privileged operations |
| Investigations | Durable account freeze, separate account/evidence release, reason history and current `investigation.write` plus `aal2` |
| Preservation | Target account and linked retained chore holds; pending/held/released states; shared deletion coordination; bounded read-only storage diagnostics |
| Activity history | Server-timestamped support heartbeat and reply activity; consumer API returns the last recorded activity, never a fabricated live status |
| Limited support access | Password plus emailed challenge; short-lived, revocable session restricted to own support tickets and appeals |

Support greeting, reply, optional closing/inactivity, public restriction and internal-note templates are editable drafts. They never send or close work automatically. Unresolved double-bracket placeholders block submission in both the UI and backend. Ambiguous reply delivery retains the draft and requires a fresh conversation check; the same reply request key is reused for a deliberate retry.

Money values have explicit units. Payment, escrow and gift-card amounts are stored in dollars and normalized once to cents. Wallet ledger and Transaction amounts are already cents. Helper balances reuse the existing persisted Chorezy wallet calculation. Provider references and onboarding status are the last persisted records; no live provider balance or new reconciliation engine is implied. Unlinked account payouts are not attributed to a chore.

`case.read` does not grant finance access. Without `finance.read`, lookup excludes payment/transaction matches, chore details exclude payment states/counts and bid money fields, and safety context excludes payment/transaction records and money summaries. Profile finance and account transactions have separate backend gates. Original participant free text can contain amounts participants themselves wrote.

Raw identity documents, extracted identity details, bank details, provider creation receipts and recovery secrets are excluded. Arbitrary trust-event metadata is projected to the documented nonfinancial decision fields.

New workspace reads and evidence access record `attempt` followed by `completed`, `denied`, `rejected` or `failed`. Failed reads are not successful accesses. Evidence history records chore, group/index and conversation/message references plus a SHA-256 storage-key hash on completed access, without signed URLs or tokens. Events are append-only and signed; empty details are retained so database serialization does not invalidate signatures. This is application audit integrity, not an external immutable archive.

## Staff provisioning prerequisites

The existing Supabase `is_admin` predicate must return true. It is only the first staff boundary. A trusted staff administrator must provision **server-managed** `app_metadata.chorezy_staff.capabilities`; browser-editable `user_metadata` cannot grant authority.

For example, a case reader can be provisioned with:

```json
{"chorezy_staff":{"capabilities":["workspace.read","case.read","audit.read"]}}
```

Add `support.read` for support records, `support.write` for replies/workflow/heartbeat, and `finance.read` only for staff authorized for money records. Safety uses `safety.write`; permanent or device/IP enforcement uses `safety.privileged` and a current `aal2` bearer session. Referral release requires `referrals.write` and current MFA. Enrolling MFA alone does not upgrade the current session. Unknown or malformed capability entries invalidate the configuration and grant no authority.

Missing/malformed server metadata fails closed with `STAFF_PERMISSIONS_UNCONFIGURED`. The record workspace is cleared by the existing denied-access boundary; there is no read or finance fallback. This may block an existing owner login until a trusted administrator provisions its capabilities. No staff account, provider setting or secret environment value was changed by this task.

Backend workspace access also requires `ADMIN_AUDIT_SIGNING_KEY` of at least 32 characters and a managed key identifier. If signing is unavailable, audited access fails closed. Key provisioning/rotation and retention need operational review before release.

The website needs the existing public staff Supabase URL/key and `NEXT_PUBLIC_CHOREZY_ADMIN_API_URL`, plus backend CORS for the deployed website origin. Public keys do not replace server capability checks. Auth routes are noindex; admin pages are private/no-store and do not load public analytics.

## Remaining work and release gates

`src/admin/backend-gaps.ts` lists remaining contracts and operational verification gates. Durable until-released investigations and shared preservation/deletion coordination are implemented in this isolated branch. The old manual review action remains a timed suspension; use the separate investigation controls for an until-released freeze. The account freeze commits before preservation coordination and remains active if storage is uncertain. Account release does not release evidence, and known evidence release does not release the account or other holds. Pending evidence remains actionable in Case files after account release. Specific financial hold/release/refund/payout operations are not approved here. Recovery queues, chore intervention and scoped evidence export remain pending.

Limited support/appeal access and the exact participant/current-Guardian Noonlight restricted-session boundary are implemented on the backend. Native limited-session integration and end-to-end verification remain pending. Ordinary frozen-account push previews are blocked; only the exact existing participant-authorized emergency event can pass. Support/appeal/restriction messages currently have no FCM producer, so no arbitrary safety/account category grants a push exception. Legacy Emergency media reads and older staff operations still need broader audit coverage. Raw identity-document access requires a separately approved capability and policy.

An uncertain external deletion is never automatically retried or released by lease expiry. HEAD diagnostics are read-only, limited to 20 operations and 20 privately recorded object references, with a 10-second HEAD read budget and a 2.5-second abort per object. Truncated/unavailable observations are explicit. Present or absent snapshots do not prove the original delete has terminated. Verify the original worker's termination/quiescence and make a separately authorized operational reconciliation decision before changing its gate; this UI has no general unlock endpoint. Audit integrity is application signing, not an external immutable archive.

Before release, verify genuine staff/nonstaff access, explicit capabilities/current MFA, deployed CORS, audit configuration, restrictive account flows, and owned sandbox mutations. Fixture browser actions do not prove real owner mutations, provider behavior or production readiness.

## Verification

The 2026-10-14 core milestone uses only an in-memory Mongo replica set and fully intercepted browser auth/API fixtures. Owner previews on ports 4058/4059 remain running. The dedicated website output is `.next-admin-qa`; fixture preview used port 4062 and was stopped after verification; the dedicated fixture browser was closed.

```powershell
npm run typecheck
npm run lint
node --test scripts/test-admin-api.mjs
$env:CHOREZY_QA_DIST_DIR = '.next-admin-qa'
node node_modules/next/dist/bin/next build --webpack
node scripts/validate-seo.mjs
```

Backend: `npm test -- --runInBand tests/integration/admin-workspace.test.js tests/unit/support/supportChatRoutes.test.js` passed 17 tests across two suites. A Mongo shutdown ECONNRESET warning did not change exit code 0. Website API tests passed 13 tests; final TypeScript, ESLint, isolated webpack build and SEO validation passed. Normal `.next` imports were restored in generated `next-env.d.ts` and type checking passed with that form. The final gate and browser outcomes are recorded in `docs/qa/admin-launch-core-20261014.json`.

The later investigation/preservation verification is recorded in `docs/qa/admin-freeze-20261014.json` and the current worker checkpoint. It includes real Mongo transaction races, final push/session and payout sync checks, and intercepted desktop/390px/320px browser states. The fixture browser and owned port 4063 preview are closed. Inherited port 4062 and owner 4058/4059 previews were preserved. New mutation receipts reject malformed/wrong-account replies and released replays before displaying a successful freeze/release; uncertain responses retain the request identity and refresh the record.

The private participant badge shows the effective current account restriction, independent of the legacy stored account status. Pending and held investigations show Under investigation; another durable ban remains Restricted after investigation release. The server returns stored status separately without rewriting legacy flags. The final preservation suite is **29 PASS**, and the refreshed fixture screenshots verify the same effective badge.

Historical UX evidence in `admin-ux-20261014.json` predates these feature slices. No full matrix row is promoted from fixtures: providerCalls=0, realStaffMutations=0, fullMatrixRowsPromoted=0.
