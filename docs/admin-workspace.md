# Chorezy staff workspace

## Scope and design brief

This branch adds `/admin/` to the Chorezy Next.js website. It uses the existing
Chorezy API and staff identity authority. The public website remains a separate
marketing experience; its layouts and visual styles are unchanged.

- Audience: authorized staff investigating user support, safety, incidents and
  account/reward activity. Financial and child-safety records are sensitive.
- Tasks: find a record, inspect its context, reply, apply or revoke a supported
  safety action, and inspect/recover eligible referrals.
- Layout: persistent six-section navigation, compact headings and metrics,
  searchable lists with a detail panel. Mobile stacks these panels and retains
  explicit labels and 44px targets.
- Typography/color: existing local Cereal font, Chorezy cobalt, neutral reading
  surfaces, semantic warning/success colors. No promotional hero layouts.
- Components: shared admin button, notice, metrics, panel, status and native
  confirmation dialog. CSS is scoped under `.chorezy-admin`.
- Motion: short control feedback only; reduced motion disables transitions.
- States: initial loading, background refreshing, successful empty response,
  failed response, expired/denied access, mutation pending and ambiguous delivery.
- Resources: project `DESIGN.md` and real API serializers first; ui-skills-root,
  ui-ux-pro-max, focused fixing-accessibility, local Next 16.3.2 docs and Design
  Systems MCP accessible-dialog guidance. General marketplace suggestions from
  UI Pro Max were adapted to a staff workspace rather than used as landing-page
  instructions.

## Configuration

Set these **public build-time** values on the website:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CHOREZY_ADMIN_API_URL` | `https://api.chorezy.com/api/v1`; an origin also works |
| `NEXT_PUBLIC_STAFF_SUPABASE_URL` | Existing authorized staff Supabase project URL |
| `NEXT_PUBLIC_STAFF_SUPABASE_ANON_KEY` | Its public anon or publishable key; never service role |

These are independent of the server-only waitlist configuration. Stripe,
Tremendous, Noonlight, S3 and service-role credentials stay in their backend.
New public variables require rebuilding the website.

Before deployment, allow the website origin in the Chorezy backend's CORS
configuration and verify that the staff Supabase project exposes the existing
`is_admin` predicate for the intended staff accounts. This interface uses
password sign-in without public registration or URL token detection. A future
OAuth/recovery flow needs explicit callback routes and approved redirect URLs.

The login shell can load publicly, but records and controls are not mounted
until the staff predicate succeeds. Every admin API endpoint remains the actual
authorization boundary. `401`/`403` clears the record workspace. Staff session
storage is separate from the public waitlist/app. Sign-out is local to this staff
browser; it does not intentionally sign out other devices.

Admin routes bypass the consumer U.S. geo gate so authorized staff can work from
other countries. They carry `noindex,nofollow`, `private,no-store` and are excluded
from robots. Neither SEO exclusions nor browser checks substitute for backend
authorization.

## Existing contracts used

All paths are under `/api/v1/admin` and send the current Supabase bearer token.
No mobile version headers, demo fallback or provider keys are synthesized.

| Page | Existing operations |
| --- | --- |
| Account overview | `GET /platform-analytics/world-domination?days=...` |
| User support | `GET /support-chat/tickets`; `POST /support-chat/tickets/:id/messages` |
| Safety | `GET /safety/context`; `POST /safety/actions`; `POST /safety/actions/:actionId/revoke` |
| Referrals | `GET /referrals/stats`; `GET /referrals/referrers`; confirmed `POST /referrals/release-eligible` |
| Emergency | Summary, incidents and individual incident reads |
| Trust review | Summary, cases, individual case and event reads |

Safety supports a temporary suspension, timed manual review hold, permanent
suspension, exclusion and support note. The manual hold is currently a **timed
whole-account suspension** (24 hours by default), not an investigation record,
evidence hold or settlement hold. The UI says this explicitly.

Account scope is always included for enforcement. Known device/IP options are
available only when those signals exist. Creating arbitrary network/device
signals is not exposed. Permanent actions need an explicit confirmation;
revocation needs a recorded reason and uses the public action ID, not Mongo ID.
Backend privilege distinctions and overlapping-restriction correctness remain
required gates before live enforcement.

Safety context includes up to 12 recent records per category and at most 30
actions. Summary counts reflect that bounded context, not exhaustive history.
Marketplace conversations are summaries, not transcripts. Payment and
Transaction DTO `amount` values are **dollars**; `amountCents` is an optional
explicit reconciliation field in the updated backend. Referral reward fields
named `*Cents` are divided once for display.

Support and Emergency refresh every 15 seconds while visible. Existing data is
retained during polling; failure is shown and stale data labelled. Support drafts
are keyed by ticket and retained on failed sends. No mutation is automatically
retried. After an ambiguous support response, staff must inspect the refreshed
conversation before retrying. Backend reply idempotency is still a gap.
An uncertain reply warning stays with its ticket after selection/filter changes.
The acknowledgement control requires a successful read started after the failed
send; a previous snapshot or failed refresh cannot unlock it.

Referral release is a **global** bounded batch. Search does not limit it. The
confirmation says so and offers limits 1, 10 or 100. The API lacks a dry-run
preview; the UI does not fabricate an exact amount or recipient preview.

Emergency and Trust are read-only. Viewing incident records does not dispatch,
cancel dispatch, resolve a risk case or forward evidence to police.

## New product contracts still needed

`src/admin/backend-gaps.ts` is the typed planning list. It is not imported as
working operations or endpoints. It covers case files, investigation freezes,
evidence preservation, specific payment holds, complete transcripts, reconciled
money timelines, stuck-operation recovery, restricted-user support, active chore
intervention, scoped exports, support workflow and granular staff permissions.
Those new controls have not been implemented and do not appear as active buttons.

## Verification and release gates

Local fixture QA is distinct from real sign-in and backend enforcement. Browser
fixture tests must intercept auth and API network traffic and never submit to a
production endpoint. No test session or credentials are committed.

Commands:

```sh
npm run typecheck
npm run lint
node --test scripts/test-admin-api.mjs
node node_modules/next/dist/bin/next build --webpack
node scripts/validate-seo.mjs
```

The QA worktree uses a dependency junction to the existing installation. Webpack
is used for its build; no dependency versions have been changed. Generated
`next-env.d.ts` route-type imports may switch between dev and build outputs.

Before a production release: configure public staff values/CORS, verify genuine
admin and non-admin access, validate all read contracts, run owned sandbox
support/safety/referral mutations, test restrictive accounts and overlapping
actions, and review audit visibility. No production deployment is part of this
branch's work.

### Parent review checkpoint (2026-10-13)

- Thirteen API/presentation tests, TypeScript and ESLint passed.
- The webpack production build and SEO output validator passed.
- Parent browser reproduction found an uncertain-send warning was cleared by
  ticket reselection. The corrected browser run proved retained ticket warning,
  fresh-read gating, failed-read gating, retained draft, one visible committed
  message and no automatic retry (two deliberate fixture sends only).
- A denied API response removed navigation and private incident data; explicit
  access retry restored the intercepted fixture session.
- Mobile support/emergency surfaces were visually inspected. Emergency at
  390px had no document overflow, 44px minimum button height, active incidents
  styled as danger, read-only operations and reduced-motion mode. The ordinary
  viewport screenshot confirmed the off-screen skip link remains hidden until
  focus; Chromium full-page captures show a fixed-element capture artifact.
- Staff pages did not load the public Vercel analytics script.
- Auth/API were intercepted local fixtures throughout these new-UI checks.
  They do not prove deployment CORS, real Supabase permissions, or financial
  and safety write behavior on the VPS. Existing genuine admin reads are
  recorded separately in the Chorezy QA matrices.
- The parent fixture server was stopped after browser review. Generated
  `next-env.d.ts` imports reflect the completed production build.
