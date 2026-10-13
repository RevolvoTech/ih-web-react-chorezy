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

| Variable                              | Purpose                                                |
| ------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_CHOREZY_ADMIN_API_URL`   | `https://api.chorezy.com/api/v1`; an origin also works |
| `NEXT_PUBLIC_STAFF_SUPABASE_URL`      | Existing authorized staff Supabase project URL         |
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

| Page             | Existing operations                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Account overview | `GET /platform-analytics/world-domination?days=...`                                              |
| User support     | `GET /support-chat/tickets`; `POST /support-chat/tickets/:id/messages`                           |
| Safety           | `GET /safety/context`; `POST /safety/actions`; `POST /safety/actions/:actionId/revoke`           |
| Referrals        | `GET /referrals/stats`; `GET /referrals/referrers`; confirmed `POST /referrals/release-eligible` |
| Emergency        | Summary, incidents and individual incident reads                                                 |
| Trust review     | Summary, cases, individual case and event reads                                                  |

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

### UX refinement brief (2026-10-13)

Owner requested clearer task flow, a multicolor sidebar, the website font
combination and Alshubaily-style component skeletons. This remains a compact
Next.js staff console for support, money and youth-safety operations. Navigation
is grouped by task, with section accents, text labels, a persistent selected
indicator and account lookup by email/phone/ID. Bricolage Grotesque is limited to
page titles; local Cereal is used for navigation, content and controls. Reading
surfaces remain neutral. Shared skeletons reserve metric/list/detail geometry
for initial reads; refresh retains the last successful data, errors show retry,
and real zero/empty states appear only after successful responses. Reduced
motion disables placeholder animation. Support prioritizes messages/composition,
with expandable customer details, a mobile return-to-inbox action and an
explicit customer-visible reply hint.

References: project DESIGN.md/components, Alshubaily AcceptanceContentSkeleton
(read-only reference), UI/UX Pro Max loading/navigation guidance, focused
fixing-accessibility, and Carbon loading-pattern guidance through Design Systems
MCP. Existing backend contracts govern available controls. New investigation,
transcript, ledger, preservation/export and staff privilege contracts remain
recorded in backend-gaps.ts; this pass does not invent those operations.

Local owner preview: `node scripts/admin-local-preview.mjs` serves port4058 and a
loopback-only fixed Chorezy admin API proxy on4059. Only public staff Supabase
values are copied into ignored `.env.local`. API authorization stays at Chorezy;
unknown origins/paths and unauthenticated requests are rejected by the proxy.
Do not deploy the local proxy or localhost API setting as website production
configuration. Owner may log in using their existing authorized staff account.

### UX verification checkpoint (2026-10-14)

The requested typography, sidebar and component loading changes passed desktop,
390px/320px, keyboard and reduced-motion checks. Initial failures show retry;
refresh failures retain successful values and support drafts. A lost reply
acknowledgement still requires a fresh conversation check and produces no
automatic retry. Customer account context is accessible without expanding the
details panel. Two rapid keyboard sends produced one fixture request.

Browser Back during a delayed Safety action reproduced a previous account's
response replacing the newly resolved account. Success/error UI updates now
check the current lookup generation. The regression retained the newly selected
account and sent one action to the originally confirmed target. An ordinary
same-account action still shows success and clears its draft.

TypeScript, focused ESLint, 13 API/presentation tests, the final webpack production
build and SEO output validation passed. All new browser writes were intercepted
fixtures. No full matrix row was promoted. See [structured evidence](qa/admin-ux-20261014.json)
and the adjacent screenshots; production auth/CORS, real mutations and new
backend product controls remain the separate release gates above.
