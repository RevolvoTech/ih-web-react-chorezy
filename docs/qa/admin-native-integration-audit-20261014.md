# Native dashboard integration audit — 2026-10-14

Replacement sole worker `/root/admin_native_audit` audited the Flutter CI worktree and the saved `admin-freeze-checkpoint-20261014.md`. Root owns native implementation and matrices. This audit records source contracts and remaining verification; it is not a claim that the native feature works in deployment.

## Backend contracts

| Operation | Exact API / envelope |
| --- | --- |
| Request restricted support access | `POST /api/v1/auth/support-access/request`: `{email, role, password, captchaToken}` → `{success:true,data:{challengeId,expiresAt,purpose:"support_only",message}}` |
| Confirm restricted support access | `POST /api/v1/auth/support-access/confirm`: `{challengeId,code,captchaToken}` → `{success:true,data:{token,expiresAt,accessLevel:"support_only",allowedActions,restriction}}` |
| Read last staff activity | `GET /api/v1/support-chat/availability` → `data.{lastActiveAt,checkedAt,historyAvailable,source,heartbeatExpirySeconds,message}`; private/no-store |
| Own support history | `GET /api/v1/support-chat/tickets` → top-level `tickets`; current Flutter gateway already parses this envelope |
| Create own ticket | `POST /api/v1/support-chat/tickets`: current subject/body/category/priority/tags/context contract |
| Reply to own ticket | `POST /api/v1/support-chat/tickets/:ticketId/messages`: `{body}`; foreign ticket returns 404 |
| Restricted emergency options | `GET /api/v1/noonlight/targets`, `GET /api/v1/noonlight/status` |
| Restricted emergency request | `POST /api/v1/noonlight/chores/:choreId/incidents`; existing request with idempotencyKey/emergencyType/optional subjectUserId/location |
| Restricted incident read/location | `GET /api/v1/noonlight/incidents/:incidentId`, `PUT /api/v1/noonlight/incidents/:incidentId/location` |

Both support access routes use the existing authentication limiter and `requireCaptchaAlways`. That middleware can reuse an already verified Express session. Flutter's current `http` client has no cookie jar, so obtain a new Turnstile token for each request/confirm operation rather than replaying a consumed token. Use the existing CAPTCHA dialog and OTP primitive; no new bypass.

Challenge duration is 10 minutes, bounded to five attempted codes, one-use confirmation. The issued session is 20 minutes with signed JWT audience `chorezy-support`, purpose `support_only`, a derived signing key, user `sub`, session `sid`, and current auth epoch. Its hash/current revocation/expiry and user existence/epoch are checked on every allowed request. It has no normal refresh token or marketplace profile/session. The confirm `restriction` field currently uses legacy account flags and may be null for an investigation; do not use it to clear a saved hold.

`protectSupportAccess` allows only availability, own tickets, create ticket and own-ticket reply. `protectEmergencyAccess` allows only the exact existing paths/methods above. The confirm `allowedActions` list describes support operations and does not enumerate emergency paths, although the verified limited token is admitted by the emergency middleware. The token cannot authenticate the general marketplace, payment, work, streaming or socket APIs.

## Native gaps at audit start

- `ApiClient` reads only legacy securityBlock/banInfo/accountStatus, with no top-level durable restriction parsing. Root is correcting this separately.
- Restriction notice persistence was not scoped to an account; expired countdown/401 refresh could clear it. Root is implementing typed investigation state, account scope and server-authoritative release.
- `ChoreoAccountRestrictionDialog` offered neither support/appeals nor emergency actions. Existing phone-only `ChoreoEmergencyCallButton` can open the system dialer without server/session; no test should actually place a call.
- Normal frozen bearer is rejected by `protect` on support/emergency. Obtain the separately verified support-only session for these paths; do not relax ordinary authentication globally.
- Current `ApiClient` has no explicit alternate bearer parameter and automatically retries 401 with the normal refresh session. Add a separate typed/scoped transport or service for limited access, with no normal refresh, global token overwrite or socket login.
- Current `SupportChatService` has an injectable gateway, allowing reuse of the existing screen with a restricted transport. The route guard currently requires normal authentication; the restricted support route/navigation must admit only its separate verified support session and retain the underlying freeze. Back/close cannot expose marketplace content.
- Current `ChoreEmergencyService.loadTargets` requires `AuthService.userId` and uses its bearer; use a scoped restricted emergency gateway. Status/target/incident reads must not reuse private cached data across accounts. Provider/target read failures show direct-phone fallback and do not imply dispatch availability.
- Support screen currently labels successful HTTP polling `Connected`; this is transport status, not staff presence. Display server `lastActiveAt`/`checkedAt` as last support activity, with the supplied no-immediate-response message. No online/away/offline staff claim.

## Socket and Guardian boundaries

Investigation publication calls `accountSocketRevocationService.publishRestriction`, which disconnects current normal sockets. It sends no native account restriction event. Client reconnect errors currently only set connection status; a bounded account/status recheck after an authenticated disconnect/error/resume is needed to reveal a newly imposed freeze without another task request. Existing hold persists on 503/offline. Support-only sessions use HTTP polling, not normal sockets.

Emergency participant authority stays on the server. Targets include only currently assigned/in-progress owned chores, or currently approved/active Guardian links. Candidate discovery is rechecked before returning routing IDs and labels; no address/coordinates/contact/media/money data is returned by target discovery. Incident reads recheck current Guardian authority even when the Guardian originally reported it. Pending/revoked/conflicting Guardian links, unrelated children/chores, wrong incident and stale current-role/session must deny. Target selection in Flutter is display input, never authorization.

## Smallest next implementation and meaningful verification

1. Root's durable typed/account-scoped restriction boundary, including malformed response/read-fault/cold-start/other-account/expiry cases. Never count down an investigation into access.
2. Dedicated limited support session manager and exact-method/path HTTP gateway. Fresh CAPTCHA and password/code verification; use memory-only token or separate short-lived secure storage, keyed to expected account and generation. Reject stale completions, expiry/revocation/epoch change, malformed/wrong-purpose token, and foreign-account results. Never apply it to `AuthService` or general API/socket calls.
3. Explicit Support and appeals flow using existing fields/OTP/support screen; keep the restriction intact while open, returning to the hold on close. Server last activity with loading/unknown/error states; unsent drafts optional and never auto-send/auto-close.
4. Restricted emergency flow using existing emergency sheet and narrow gateway; immediate direct phone fallback available even before CAPTCHA. Do not auto-submit incidents. Recover current targets on open and let the server recheck at submission. Preserve sandbox mode and no-dispatch test fixtures.
5. Tests must exercise real service/transport requests and state boundaries, not only visual clones: correct endpoint bearer, zero normal refresh/global session replacement, blocked marketplace/deep links, restriction still active after support, no old-account result after switch, expiry and 401 handling, inactive Guardian loss between target load/submission, provider unavailable fallback, malformed incident/target replies, and cached socket→read-fault→current freeze.
6. Native light/dark, keyboard, 320px/long content, loading/empty/error/disabled states, plus required format/analyze/architecture gates; normal fresh login after actual staff release; genuine authorized staff/native integration only when prerequisites exist.

## Narrow backend correction completed by this worker

Found and fixed actual exported password-login omission and sanitized restriction-read-failure handling in the isolated admin backend. New durable DTOs include `restriction.accountId`; failure code is HTTP 503 `ACCOUNT_RESTRICTION_UNAVAILABLE` and does not invent a restriction or imply release. Baseline 15 fail/2 pass → 17 pass; focused preservation/login/session regression 56 pass across four suites. Full evidence is in backend `docs/qa/account-restriction-boundary-20261014.md`. No deployment, provider calls, genuine staff mutation, native completion, full matrix-row PASS or STOP marker is claimed.
