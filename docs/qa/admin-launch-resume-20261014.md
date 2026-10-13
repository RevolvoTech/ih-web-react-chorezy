# Admin launch worker resume checkpoint

Saved on 2026-10-14 before the owner's requested profile handoff. Continue the saved work; do not restart implementation. The feature changes remain uncommitted while the core build/browser gate is pending.

## Owned worktrees

- Website: `C:\Users\saada\Documents\IDE\GithubProjects\RevolvoTech\ih-web-react-chorezy-admin-qa`, branch `qa/chorezy-admin-20261013`, feature baseline `42b030de2f7c092aa4c4a38e32aa00e7cfb48e55`.
- Backend: `C:\Users\saada\Documents\IDE\GithubProjects\RevolvoTech\choreo\ih-app-express-chorezy-admin-qa`, branch `qa/admin-launch-controls-20261014`, baseline `7e69a7f7d5a8bb7140601ea12d7ed0a2e711b250`.
- Dependencies are existing junctions. Do not change providers, credentials, dependencies, Actions, VPS, Flutter, matrix artifacts, active backend or another Node/browser process. Owner previews on 4058/4059 stay running. Use `.next-admin-qa` and a separate fixture preview port.
- Root owns active backend `choreController.startChoreWork` (active backend HEAD last reported `0004f76`). No admin financial core edits approved.

## Saved implementation inventory

Backend: support workflow/version checks/idempotent staff replies and internal notes; attention aggregates and filtered lists; paged case files, original transcript and recorded proof/AI/lifecycle/money references; verification provenance with raw identity documents excluded; staff capabilities/current MFA; server-timestamped support activity; restricted support-only email/password challenge/session. New files include `adminWorkspace` routes, `staffCapabilities`, `protectSupportAccess`, admin workspace/event/presence/note/auth models and services, and `tests/integration/admin-workspace.test.js`. Existing support/auth/admin routes are modified.

Website: inline counts after sidebar text and relevant filters; Case files section and paged records; evidence access; workspace authority/count provider; explicit support workflow/read acknowledgement; optional editable template picker; server heartbeat; capability-gated mutation controls; shared loading skeletons; existing Bricolage large headings/Cereal controls and sidebar accents. New files are in `src/admin`, plus `scripts/admin-workspace-fixture.cjs`. Existing admin API/contracts/shell/pages/support/safety/CSS are modified.

An Attention route remains optional diagnostic only; no primary Attention navigation item. The existing `docs/admin-workspace.md`, `src/admin/backend-gaps.ts` and earlier `docs/qa/admin-ux-20261014.json` predate these feature changes and contain stale gaps/six-link claims. Update them only after verifying this milestone; earlier screenshots do not verify the new features.

Evidence access already records `attempt`, `completed`, `rejected`, precise group/index/conversation/message references and SHA-256 storage key hash. Signed URLs/tokens are excluded. Further review needed: capability-denied evidence access currently exits before this route's audit; distinguish denied, validation rejection and storage failure in the audit instead of treating all failures as `rejected`. Generic workspace reads currently record `read` before executing the query; do not present failed reads as successful access.

## Verified in this replacement turn

- Backend `npm test -- --runInBand tests/integration/admin-workspace.test.js tests/unit/support/supportChatRoutes.test.js`: PASS, 2 suites, 14 tests, 12.218 seconds. Fixture-only in-memory Mongo replica set; mocked auth/email/storage; no production records/provider actions. Shutdown printed a Mongo ECONNRESET warning; process exited 0.
- Website `npm run typecheck`: PASS.
- Website `node --test scripts/test-admin-api.mjs`: PASS, 13 tests.
- Website initial `npm run lint`: failed because generated `.next-admin-qa` output was not excluded (909 generated-output errors). Added `.next-admin-qa/**` to `eslint.config.mjs`; rerun `npm run lint`: PASS, no findings.
- No production build or new browser fixture run started in this replacement turn; root requested no long build before profile handoff.

## Required next work, in order

1. Finish bounded core permission/audit review. `staffCapabilities.staffAuthority` currently falls back to all READ_CAPABILITIES when server `app_metadata.chorezy_staff` is absent. That includes finance authority: fix to fail closed for missing/malformed metadata; verify read-only and denied roles explicitly. Current fixtures with absent metadata only assert denied mutation.
2. Staff earnings/payout states are still not built or tested as a dedicated profile contract. `adminSafety` context only requires `case.read`; inspect its payments/transactions payload so finance data cannot leak through that route. Add meaningful denied-role test proving `case.read` alone cannot get earnings, payout state or money records. Raw identity documents must remain excluded unless a separately approved capability is added.
3. Finish relevant tests after changes. Use fresh local fixtures only. Run backend suite above and website typecheck/lint/API tests. Inspect `git diff --check` and the complete changed feature inventory.
4. Build website into isolated output, then validate SEO:

   ```powershell
   $env:CHOREZY_QA_DIST_DIR = '.next-admin-qa'
   node node_modules/next/dist/bin/next build --webpack
   node scripts/validate-seo.mjs
   ```

   New Next version instructions in website `AGENTS.md` require relevant local `node_modules/next/dist/docs` before framework changes. Generated `next-env.d.ts` currently imports `.next-admin-qa` route types. Decide its final commit form after build; avoid breaking normal `.next` development.
5. Isolated browser fixture on a free separate port (e.g. check 4062/4063 before use). Preserve owner previews. `scripts/admin-ui-fixture.cjs` installs intercepted auth/API and returns mutable fixture state; it composes `admin-workspace-fixture.cjs`. Use CLI Playwright with a dedicated session, not another owner's browser. Verify desktop/mobile, counts not cleared by viewing, explicit acknowledgement, support drafts/no auto-send/close, template unresolved placeholders, scoped paged transcript/evidence, unknown/error/loading/disabled/long content and capability denial. Capture truthful new evidence under `output/playwright` or existing QA folders and report providerCalls=0, realStaffMutations=0, fullMatrixRowsPromoted=0.
6. Update docs with exactly built/tested/pending scope. Create bounded feature commits in each owned worktree only after this gate; send parent/root exact commit IDs and inventory. These changes are not deployed or full matrix production-ready.
7. Implement approved preservation and investigation slice after the core milestone, coordinating with root before shared authorizer changes. Approved hooks ONLY: `choreController.deleteChore`, `userController.deleteUser`, `User.cleanupExpiredUnverifiedAccounts`, S3 chore file deletion, streaming recording reset/deletion, stream recording retention service. Do not edit `startChoreWork`.

## Approved preservation design constraints / still pending

No preservation hooks or financial operation core have been implemented yet. Investigation freezes must persist until explicit staff release, retain support/appeal/emergency access, and audit ban reason/lift. Overlapping restrictions must remain safe when one is revoked. Evidence preservation must use current durable holds plus shared renewable deletion/preservation leases so stale read/S3 races are closed; a DB transaction flag alone is insufficient. Test competing holds/deletes and overlapping restriction/release cases. Root has not approved financial release/refund/payout core edits; coordinate before specific financial holds/recovery.

Owner replaced Online/Away/Offline by server `last active Xm/h` polling. Do not fabricate live status or instant reply. Optional support/restriction/internal-note/inactivity templates remain editable, never automatically sent or used to close work. Actual application data comes from Chorezy Mongo through the Chorezy backend; existing Supabase remains staff auth only.
