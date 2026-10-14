# Staff dashboard worker checkpoint — 2026-10-14 08:05 PKT

Supersedes `admin-launch-resume-20261014.md` for the investigation/preservation slice. Sole worker `/root/admin_freeze_finish`; parent owns Flutter, test matrices, deployed backend, providers and rotation. Do not duplicate workers or reset these worktrees.

## Saved backend milestones

Worktree `../choreo/ih-app-express-chorezy-admin-qa`, branch `qa/admin-launch-controls-20261014`:

- `ae94834`: durable investigation freeze, independent account/evidence release, scoped preservation and shared deletion coordination. Freeze commits before linked-record discovery. Both account-delete/freeze races, simultaneous create idempotency and linked-read failure verified on an isolated Mongo replica set.
- `07aab5b`: clean sync of root session-bound push commit `b7824fb`.
- `0adee5e`: frozen private push previews denied; exact current participant-authorized `chore-emergency:updated` exception, no category/route/name bypass. Single/batch/durable failed reads retry without sending. A second restriction read immediately before dispatch closes the slow-auth snapshot gap. Five focused groups **59 PASS**, followed by **15 PASS** in the final investigation-push suite.
- `aa23614`: clean sync of root payout-reauthentication commit `63e68a8`. Payout regression plus then-current preservation suite **61 PASS** across four suites.
- `0165af9`: HEAD diagnostic limit of 20 operations and 20 objects, 10-second read budget, 2.5-second abort per object; truncation disclosed without relaxing any gate. Full preservation suite **28 PASS** at this milestone.
- `c48a8f4`: isolated payout integration extension after parent review. Current restriction is read before/after bcrypt and before final provider link/renewal. Six persisted/mock-provider failures reproduced against the prior source, then all six passed. Final preservation/payout/onboarding/refresh group **66 PASS across four suites**, exit 0, 34.471 seconds. No provider call on denial.
- `848d247`: private profile reports effective investigation/durable restriction separately from raw stored account status. Pending/held freezes display `under_investigation`; independent bans still apply after release. No legacy flags are changed. Full preservation suite **29 PASS** after this correction (37.626 seconds, exit 0).

Backend is clean. `docs/admin-preservation-20261014.md` records contracts and operational limitations. Additional regression groups: legacy safety/auth/socket **57 PASS, 1 existing skip**; upload/retention/supervision **19 PASS**. Counts overlap and must not be added to claim matrix progress.

## Website result

Existing implementation and label fixes resumed. Uses existing panels/buttons/templates, Bricolage/Cereal, semantic inline sidebar counts and current scoped permissions. Investigations appear in the private profile and unresolved Case files; account/evidence release are separate. Reason validation and current MFA gate writes. Critical mutation receipts reject malformed/wrong-account replies and released replays before displaying success; uncertain responses retain request identity and refresh current records.

Shared confirmation dialog wraps keyboard focus, defaults to Cancel and restores trigger on Escape; modal scrolling is contained. Templates remain optional drafts, with no automatic send/closing message or fake live presence. Finance data requires explicit `finance.read` and has no fallback.

TypeScript, ESLint, API **14 PASS**, isolated `.next-admin-qa` webpack build **38 pages**, and SEO validation passed. Normal `.next` generated imports were restored after the isolated build; final type checking validates the restored form. Website source plus reviewed evidence are committed as `4de3615`; this later checkpoint adds the parent-approved payout integration result. Both worktrees are clean after the final documentation commit.

## Fresh browser evidence

All three intercepted Playwright flows reran on the final API build. Eight screenshots in `docs/qa/admin-freeze-*-20261014.png` replaced earlier captures. Parent review caught the old fixture's misleading green Active badge; the fixture now derives current investigation status, all three flows assert the profile's Under investigation badge, and fresh desktop pending/mobile held screenshots were visually inspected.

- Unresolved template blocks freeze; open/cancel causes zero writes. Cancel focus, Tab wrapping, Escape dismissal/trigger restoration pass.
- Freeze succeeds while preservation stays pending. Account release leaves evidence pending; retry cannot refreeze. Exact-object diagnostics never clear the uncertain gate. Pending evidence remains in Case files and sidebar count. Counters: create 1/account release 1/evidence release 0/retry 1/diagnostic 1.
- Known evidence release leaves the account frozen and retains the other investigation hold. Counters: create 2/account release 0/evidence release 1.
- Current aal1 and missing investigation permission disable mutation. Case-reader profile requests no finance/transactions data and displays no finance panel; zero unexpected mutations.
- Desktop 1440px, mobile 390px and 320px long unsent content pass without horizontal overflow; visible buttons minimum 44px. Reduced-motion skeleton animation is none. Loading/failed-read states block new freeze, with readable dates/labels and established fonts.

`docs/qa/admin-freeze-20261014.json` records exact check groups, commands, outcomes, screenshots and remaining prerequisites. All auth/API/storage/provider actions were synthetic or mocked: providerCalls=0, realStaffMutations=0, fullMatrixRowsPromoted=0.

## Processes and remaining prerequisites

- Dedicated browser `admin-freeze-20261014` PID19928 and owned preview **4063 PID8584** are closed. Inherited **4062 PID8188** and owner previews **4058/4059** were preserved. No environment, provider, rotation or shutdown changes; no STOP marker.
- Parent's next profile switch is **09:28 PKT**. Work is checkpointed before it.
- Trusted staff provisioning: server-managed capabilities, genuine current MFA, audit signing key of at least 32 characters and managed key ID.
- Deployment prerequisites: Mongo replica-set transactions and investigation/hold/deletion indexes; deployed CORS and genuine authorized staff/nonstaff/owned-record integration.
- Native limited-support/appeal and current participant/Guardian emergency integration remains outside these worktrees.
- Unknown external deletion requires verified original operation termination/quiescence and a separately authorized signed reconciliation procedure. Present/absent HEAD results are insufficient. This UI has no general gate unlock.
- Financial hold/release/refund policy, recovery/intervention and scoped evidence export remain outside worker authorization.

No deployment, genuine staff mutation, real provider action, full matrix PASS promotion or STOP marker is claimed by this isolated milestone.

## Sole replacement worker continuation — 2026-10-14 10:06 PKT

`/root/admin_native_audit` completed the native contract audit and parent-approved auth correction as backend `cb64ac0`, with 17 new checks and 56 focused regression passes. New durable restriction DTOs identify the account; actual password login denies durable investigations before legacy expiry cleanup; restriction read faults return sanitized 503 without invalidating valid sessions. Website native audit is committed as `db2d755` in `docs/qa/admin-native-integration-audit-20261014.md`. Root owns the native implementation and deployed backend.

The same sole worker added an explicit isolated migration command:

```text
node scripts/migrations/20261014-admin-workspace-schema.js
node scripts/migrations/20261014-admin-workspace-schema.js --apply
```

Default is a read-only JSON plan; only the explicit `--apply` flag creates missing collections/indexes. Current schema scope is 11 collections/39 declared indexes, including the partial unique SupportMessage request-key index. Complete preflight conflicts stop all writes; additive apply preserves unrelated indexes, reports partial failures with sanitized codes and re-audits before success. No index drops, duplicate repair, startup hook or automatic production run. The loader disables automatic Mongoose schema creation, and the command requires `MONGO_URI` privately configured for the `chorezy` database. Exact commands, index inventory, exit codes and prerequisites are in backend `docs/qa/admin-workspace-schema-migration-20261014.md`.

The new migration suite has **18 PASS** on a dedicated database inside in-memory Mongo; syntax/diff gates and nonconnecting CLI help pass. Initial fixture/cleanup harness errors were corrected before the final gate. This script has not been applied to the VPS/application database. Runtime review confirmed API/worker 63e68a8, writable replica set and healthy services; metadata listing was unavailable with AtlasError 8000, so index presence remains unverified. API/worker audit-signing key and managed ID are absent. Legitimate current staff capability/MFA integration remains pending. Drain old API/worker writers before activating real preservation holds; old rollback images do not enforce the new authority.

No Flutter, test matrix, active backend, VPS, environment, provider, rotation or shutdown changes were made by this continuation. No genuine staff mutation, full matrix promotion, deployment or STOP marker is claimed.
