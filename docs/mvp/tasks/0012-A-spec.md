---
id: TASK-0012-A-SPEC
title: Implementation specification — Stage 1 mandatory safety baseline (reporting, blocking, leaving, removal restriction)
status: READY FOR IMPLEMENTATION
owner_sign_off_required: one item — see "Owner sign-off required" below
---

# TASK-0012-A implementation specification

This document tells the implementer and test-author exactly what must exist, in what states, by
what rules, and in what exact wording, to satisfy TASK-0012-A. It does not choose a database
engine, an ORM pattern, a table name, or a code structure beyond what a rule requires to be
testable. Where this spec states a fact about the existing code or the PRD, it cites the file and
line read in this session. Where a sub-question has no settled source, it is marked **PROPOSED —
OWNER SIGN-OFF REQUIRED**, per the brief's instruction, rather than silently decided.

This spec covers four areas in order: (1) reporting fixes, (2) blocking, (3) voluntary leave
consequences, (4) removal restriction (DEC-03) and its notification (DEC-10). A final section
lists every acceptance criterion and test expectation, then owner-run commands.

---

## 0. Facts this spec is built on (read this session)

- `membership.status` enum is `active | left | removed` only, no removal-count column, no
  cooldown timestamp (`server/db/schema/app.ts:93`).
- `membership.originalPosition` is unique per community (`server/db/schema/app.ts:96,101`,
  `membership_original_position_uq`).
- `removeMember` (`server/utils/reports.ts:53-61`) sets `status:'removed'` permanently today and
  writes an **admin-audit** row with `action:'membership.removed'`
  (`server/utils/reports.ts:60`) — this is the append-only `admin_audit` table
  (`server/db/schema/app.ts:142-150`), **not** a row in the `notification` table
  (`server/db/schema/app.ts:152-159`). These are two different tables with, confusingly, the same
  string `'membership.removed'`. DEC-10 requires a **notification** row to the removed fan; the
  existing audit call does not produce one and must not be mistaken for satisfying DEC-10.
- `join.post.ts:19` blocks any rejoin of a `removed` row with `FORBIDDEN, reason:'removed'`, with
  no expiry check anywhere.
- `leave.post.ts` sets only `status:'left', leftAt: new Date()` (`:15`); `originalPosition` is
  untouched.
- `reports/index.post.ts` request body accepts `targetType` enum including `'mission'`
  (`:6`); `report.targetType` DB enum also includes `'mission'` (`server/db/schema/app.ts:210`).
- `assertReportTarget` (`server/utils/reports.ts:13-28`) has no branch for `targetType === 'mission'`
  and falls through to its final `else throw notFound()` (`:27`) — every mission report fails with
  404 regardless of whether the mission exists. This is Defect #1 in `evidence-matrix.md` §7, row 1.
- No `block` table or block route exists anywhere in `server/db/schema/**` or `server/api/**`
  (confirmed by TASK-0001, `0001-findings.md` DEC row for requirement #12 / `evidence-matrix.md`
  row 12: "none found").
- `notify(tx, userId, type, data)` (`server/utils/admin.ts:26`) is the existing helper that writes
  a `notification` row; `audit(tx, actorId, action, targetType, targetId, metadata)`
  (`server/utils/admin.ts:22`) is the existing helper that writes an `admin_audit` row. Both exist
  and take the shown parameters — this spec requires calling `notify`, not inventing a new helper.
- `canSeeDrop(d, isStaff, membership)` (`server/utils/drops.ts:13-17`) is the existing single choke
  point that decides whether a viewer may see a drop's body; it is read by `loadDrop`
  (`server/utils/drops.ts:43`) and `dropListViews` (`server/utils/drops.ts:47-58`), which together
  cover drop detail and drop-listing (feed/community timeline) reads. Reply visibility has no
  equivalent single function read in this session — the implementer must locate every reply read
  path before wiring in block suppression (see §2.4).
- DEC-04 ruling (`decisions.md` DEC-04, RESOLVED): voluntary leave must retire `originalPosition`
  (clear it or mark it retired); the slot remains consumed against the 100-cap; existing `left`
  rows that preserved positions are a separate data-migration question not in this task's scope.
- DEC-03 ruling (`decisions.md` DEC-03, RESOLVED): first removal = 30-day rejoin block, second
  removal = permanent ban, implemented via a removal-count and blocked-until column or a
  `FandomRemoval` table (additive).
- DEC-10 ruling (`decisions.md` DEC-10, RESOLVED): the emitted notification type list gains
  `membership.removed`, which "must be added in TASK-0012-A."
- PRD §6.18 (lines 1028-1101) and §6.19 (lines 1102-1170) are the full source for leave-consequence
  and removal-notice wording, reproduced and bound below.
- PRD §12 "Required fan controls" (lines 1585-1597) lists "Block unwanted accounts" as a required
  fan control, with no further mechanics specified anywhere in the read ranges of the PRD.
- PRD §19 (lines 2070-2072) explicitly asks this spec to define: what counts as a first/second
  removal, how appeals affect the count, how the 30-day window is calculated. Nothing elsewhere in
  the PRD answers these three questions — they are decided below as instructed.

---

## 1. Reporting — fixes to the existing baseline

### 1.1 Mission reports must work (fixes Defect #1)

**Rule:** `assertReportTarget` must validate `targetType:'mission'` the same way it validates
every other target type: confirm the target exists, then allow the report to proceed. It must not
require the reporter to be a member of the mission's community — no other branch
(`drop`, `community`, `reply`, `user`) imposes a membership check; `loadDrop` and
`loadVisibleCommunity` enforce only that the drop/community is visible to the viewer, not that the
viewer is a member. Mirror that same "exists and is visible to the reporter" standard for
missions: the mission must exist, and its parent community must be visible to the reporter under
the same visibility rule `loadVisibleCommunity` already applies to community reports.

**Concretely:** add a branch — `else if (type === 'mission')`, before the final `else throw
notFound()` (`server/utils/reports.ts:27`) — that looks up the mission row by `id`, calls
`notFound()` if no row exists, and confirms the mission's `communityId` resolves via
`loadVisibleCommunity` to a community visible to `viewer` (same pattern as the existing `type ===
'community'` branch, `reports.ts:17`).

**Why this is not optional:** a `'mission'` report currently fails 100% of the time
(`reports.ts:13-28` has no matching branch, falls to `else throw notFound()`), yet `'mission'` is
an accepted value in both the request schema (`reports/index.post.ts:6`) and the DB enum
(`app.ts:210`) — the feature is advertised as available and is not. Per the brief's standing rule
("never advertise deferred privileges as available"), this is a defect, not a design choice, and
must be fixed as part of this task's reporting scope (it is in-scope per the task brief's "Scope
In: Reporting (RPT-01)" and the evidence matrix's explicit routing of Defect #1 to TASK-0012-A).

**Acceptance criterion:** reporting a mission that exists, in a community visible to the reporter,
succeeds with the same response shape as every other target type (`{id, status, createdAt}`,
`reports/index.post.ts:12`). Reporting a nonexistent mission ID, or a mission whose community is
not visible to the reporter, returns the same `NOT_FOUND` the other branches return for their
equivalent not-found/not-visible case — existence is not disclosed, consistent with the existing
pattern (every other branch uses the same shared `notFound()` closure, `reports.ts:14`).

### 1.2 Reporter identity (re-verified, not re-cited)

**Rule (unchanged, re-verified this session):** the reporter-facing creation response contains
only `{id, status, createdAt}` (`reports/index.post.ts:12`) — no `reporterId` is ever returned to
the reporter or to the reported party. This spec does not change this behaviour; it is listed here
because it is a shared acceptance criterion with TASK-0006 and must be re-tested, not assumed, by
this task's test suite.

**Separately noted, not an action item for this task:** `server/utils/reports.ts:31`
(`adminReportView`) includes `reporterId` in the admin queue payload, and both
`admin/reports/index.get.ts:20` and `actions.post.ts:50` return it to admins. This is a disclosure
to *admins*, not to the reported party, and `evidence-matrix.md` §6 flags it as a wording-ambiguity
in the schema comment, not a defect — it is **out of scope for TASK-0012-A** (it belongs to
whichever task owns the admin-reports schema comment, not this one) and must not be changed here.

### 1.3 Duplicate open report (already enforced, re-tested)

**Rule (unchanged):** one open report per `(reporterId, targetType, targetId)`, enforced by
`report_one_open_uq` (`app.ts:221`). A second report attempt from the same reporter against the
same target while the first is still `status:'open'` returns the **existing** report (same
`{id, status, createdAt}` shape), not a new row and not an error — this is the existing
`findOpen()`-then-insert-then-catch-unique-violation pattern (`reports/index.post.ts:18-32`).

**Acceptance criterion:** calling `POST /api/reports` twice in a row with identical
`{targetType, targetId}` from the same reporter, before any admin decision, returns the same
report `id` both times with HTTP 200 the second time (first call returns 201 per
`reports/index.post.ts:25`, the "already exists" path returns the view object directly with no
explicit status set — the implementer must confirm Nuxt's default success status in that branch
is 200, not re-use 201, since `setResponseStatus` is only called in the create branch,
`reports/index.post.ts:25`; if it is not 200 by default, this spec requires it be set explicitly
to 200 so the two paths are distinguishable by status code as well as by repeated `id`).

---

## 2. Blocking — a new feature, the `block` table and its effects

TASK-0001 confirmed no `block` table or route exists anywhere in the codebase
(`evidence-matrix.md` row 12, `0001-findings.md`). Per the task brief, a new table requires its own
migration review and owner approval before being added; this section specifies the minimum shape
needed to satisfy PRD §12's "Block unwanted accounts" requirement (line 1588) for the pilot, for
that review.

### 2.1 What "blocked" means in pilot scope (recommendation, bound by this spec once approved)

**Recommendation — minimal, defensible scope:** blocking is **fan-initiated, one-directional, and
affects content visibility only.** When fan A blocks fan B:

- B's drops and replies become invisible to A across every surface that currently calls
  `canSeeDrop` or otherwise lists drops/replies for A (feed, community timeline, drop detail).
- A's drops and replies do **not** become invisible to B (one-directional: the block only changes
  what the blocker sees, not what the blocked person sees). This matches the common, minimal
  interpretation of "block unwanted accounts" as a tool the blocker uses to curate their own
  experience, and avoids building a mutual-block or notification-to-the-blocked-party mechanism
  that neither the PRD nor the owner has specified.
- Blocking does **not** remove B's existing membership, does **not** prevent B from joining or
  posting in any community, does **not** prevent B from replying to A's drops (those replies are
  simply invisible to A under the same suppression rule), and does **not** generate a notification
  to either party. No PRD text (§12, lines 1585-1597, the only range read this session on this
  topic) requires any of these further effects, and the task brief directs "keep it minimal."

**This is the proposed minimal rule, not a PRD-specified one — PRD §12 names only the requirement
"Block unwanted accounts" (line 1588) with no mechanics.** The one-directional, visibility-only
scope above is this spec's proposal for owner sign-off (see "Owner sign-off required," end of this
document) before implementation begins, exactly as the task's framing requires ("propose minimal
columns... and what 'blocked' concretely suppresses in pilot scope").

### 2.2 Table shape

A new `block` table, additive, no existing table altered:

| Column | Type / constraint | Purpose |
|---|---|---|
| `id` | UUID primary key, default random | row identity, consistent with every other table in `app.ts` (e.g. `community.id`, `app.ts:75`) |
| `blockerId` | references `user.id`, `onDelete: 'cascade'`, not null | the fan who initiated the block |
| `blockedId` | references `user.id`, `onDelete: 'cascade'`, not null | the fan being blocked |
| `createdAt` | timestamp with timezone, not null, default now | when the block was created |

**Constraints:**
- A unique constraint on `(blockerId, blockedId)` — the same pair, prevents duplicate block rows
  (mirrors `membership_user_community_uq`'s one-row-per-pair pattern, `app.ts:100`).
- A check constraint (or application-level validation, whichever the implementer's existing
  pattern favours elsewhere in the codebase — not specified here) that `blockerId <> blockedId`: a
  fan cannot block themself.
- No `status` column — a block exists or it does not; unblocking **deletes** the row (not a status
  flip), because nothing in scope needs block history retained (contrast with `membership`, which
  needs a `left`/`removed` history for the removal-restriction rule in §4; blocking has no
  equivalent restriction-counting requirement in the PRD).

### 2.3 Routes

Two routes, in whatever location mirrors the existing route-per-action pattern already used for
membership (`communities/[id]/join.post.ts`, `communities/[id]/leave.post.ts`):

- **Create a block** (e.g. `POST /api/users/[id]/block`): requires an authenticated fan
  (`requireUser`, consistent with every other mutating route read this session). The path `id` is
  the user to be blocked. Rules:
  - `blockerId = blockedId` → `VALIDATION_FAILED` (a fan cannot block themself).
  - Target user does not exist → `NOT_FOUND`, same existence-hiding standard applied elsewhere in
    this spec (§1.1) is **not** required here, because blocking a nonexistent user ID is a client
    error, not a privacy-sensitive lookup of another person's report target — this route may
    disclose "no such user" plainly, consistent with `assertReportTarget`'s own `type === 'user'`
    branch which does the same existence check without a special existence-hiding rule beyond the
    shared `notFound()` wording.
  - Already blocked (duplicate call) → **idempotent**: return the existing block row's `{id,
    createdAt}`, not an error and not a second row — same idempotency standard the task brief
    requires for leave (§3.4 below) and consistent with the unique constraint in §2.2.
- **Remove a block** (e.g. `DELETE /api/users/[id]/block`): requires an authenticated fan. Deletes
  the row if it exists. If no block exists between this blocker and this blocked ID, the call still
  succeeds (idempotent delete — same reasoning as the double-leave idempotency rule in §3.4):
  return success with no error, since "unblock someone you never blocked" has no harmful side
  effect to prevent.

### 2.4 Where suppression must be applied

Every read path that currently returns drop or reply content to a viewer must additionally exclude
content authored by anyone that viewer has blocked. Concretely, this requires:

- `canSeeDrop` (`server/utils/drops.ts:13-17`) or its caller must also check: is `d.authorId` in
  the viewer's block list? If so, the drop is treated as not visible, the same way
  `canSeeDrop` already returns `false` for audience/membership reasons. This single choke point
  covers `loadDrop` (`drops.ts:43`, used for drop detail and reporting) and `dropListViews`
  (`drops.ts:47-58`, used for feed/listing reads) — both already call `canSeeDrop`.
- **The implementer must separately locate every reply-listing route** (no single reply-visibility
  function was found and read in this session — `evidence-matrix.md`/`0001-findings.md` read only
  `drops.ts`, `missions.ts`, `community.ts`, `admin.ts`, `auth.ts`, `reports.ts` in full; reply
  routes under `server/api/drops/[id]/replies*` were not read in full in this session) and apply
  the same author-block suppression there before this task is marked done. **This spec does not
  assert reply routes already have an equivalent function to extend — that must be confirmed by
  reading those route files, not assumed from the drop pattern.**
- Suppression must not error or reveal that a block exists — a blocked author's content simply
  does not appear, the same silent-omission pattern `canSeeDrop` already uses for private-audience
  content a non-member requests.

### 2.5 Acceptance criteria (blocking)

1. Fan A blocks fan B → B's drops no longer appear in A's feed or in the community timeline view
   that A sees, and `GET` on one of B's drop IDs directly returns `NOT_FOUND` to A (same treatment
   as any other invisible drop under `canSeeDrop`).
2. B's visibility of A's content is unaffected (one-directional, per §2.1).
3. Blocking the same user twice is idempotent (§2.3) — second call returns the same block `id`,
   no second row (verifiable against the unique constraint in §2.2).
4. Unblocking a user never blocked succeeds with no error (§2.3).
5. A fan cannot block themself (`VALIDATION_FAILED`).
6. Blocking does not alter membership, does not emit a notification, does not affect the blocked
   user's ability to join or post (§2.1) — tested by confirming B's membership row and post
   capability are unchanged after A blocks B.

---

## 3. Voluntary leave — consequence screen, atomicity, and DEC-04's cleanup step

### 3.1 Required on-screen content before confirmation (PRD §6.18, lines 1038-1061)

Before the backend executes leave, the fan must see — in whatever UI component the app already
uses for this kind of screen (not specified here, per the task brief's explicit instruction not to
invent a mechanism) — content that states, at minimum, in the fandom's actual name context:

> ## Leaving this fandom?
>
> Please review what happens when you leave. These changes cannot be reversed.
>
> **Badge tier and XP for this fandom** — Permanently lost. Your progress in this fandom will not
> be restored automatically.
>
> **Leaderboard position** — You will be removed from this fandom's leaderboard.
>
> **Original badge, if held** — Permanently retired. Its number will never be re-issued to anyone.
>
> **Active Founding Pledge Stars** — Returned to your balance.
>
> [Confirm leave] [Go back]

This is the PRD's own example content structure (PRD lines 1038-1061), reproduced verbatim as the
baseline wording. **The Founding Pledge line must not be shown or acted on for the pilot**: DEC-05
(`decisions.md` DEC-05, OUT OF PILOT SCOPE) states no pilot task implements Founding Pledge, and no
`FoundingPledgeBalance` table exists (`0001-findings.md` DEC-05: "VERIFIED: no Founding Pledge
tables anywhere in schema"). **This is a direct conflict between the PRD's example screen text
(which includes the Founding Pledge line) and the owner's DEC-05 ruling that defers the entire
Founding Pledge concept** — this spec resolves it by omitting that line from the pilot's actual
screen content, since advertising a return of something that does not exist and cannot be computed
would violate the brief's "never advertise deferred privileges as available" rule. The leaderboard
line should likewise be omitted or reworded if TASK-0001's leaderboard-table question (open per
TASK-0012-B's scope note, `0012-reporting-blocking-leaving.md:131-132`) resolves to "no leaderboard
table exists in pilot scope" — that confirmation belongs to TASK-0001/TASK-0012-B, not this spec,
but this spec does not require TASK-0012-A to show or act on a leaderboard consequence that nothing
in the pilot backend currently computes (no leaderboard table was found by `0001-findings.md`'s
full schema read).

The exact mechanism by which the frontend signals "confirmed" to the backend (a specific request
field, a specific header, a specific confirm token) is explicitly **not specified here**, per the
task brief's "What this task does NOT invent" section (`0012-reporting-blocking-leaving.md:44-56`).
What is specified is the outcome: no membership change occurs until this screen has been shown and
an explicit, non-preselected confirming action has been taken (PRD lines 1073-1079, 1095).

### 3.2 Atomicity (PRD lines 1079, 1100)

**Rule:** leave is a single all-or-nothing database operation. The existing route already executes
leave inside one transaction (`leave.post.ts:9-18`, `useDb().transaction(...)`); this must be
preserved and extended, not replaced, when this task adds the DEC-04 cleanup step (§3.3): the
`originalPosition` clear must happen in the **same transaction** as the `status:'left'` update, not
as a follow-up call. If any step inside the transaction throws, the entire transaction must roll
back and the fan must remain `status:'active'` with `originalPosition` untouched.

**Test requirement:** a forced failure must be injected partway through the transaction (e.g. by
making a mock throw after the membership-status update but before the `originalPosition` clear, or
whichever point the implementer's actual statement order places second) and the test must assert
that, after the forced failure, the membership row is unchanged from its pre-leave state — not
partially updated.

### 3.3 DEC-04's leave-cleanup step: retire `originalPosition`

**Rule (per `decisions.md` DEC-04, RESOLVED):** when a fan with a non-null `originalPosition`
voluntarily leaves, that leave operation must clear or retire the position, and the slot must
remain counted against the community's 100-cap (`community.originalsAssigned`, `app.ts:85`,
already never decremented, `join.post.ts:26-27` confirms the counter logic the implementer must
not alter).

**Mechanism decision for this spec:** **null the `originalPosition` column on the membership row**
(not a separate boolean "retired" flag). Justification: `membership_original_position_uq`
(`app.ts:101`) is a uniqueness constraint on `(communityId, originalPosition)` — if the column is
nulled rather than flagged, the uniqueness constraint is naturally satisfied for rejoin (a later
row or the same reactivated row with `originalPosition: null` does not collide with any other
row's position, since PostgreSQL unique constraints treat multiple `NULL`s as distinct by default).
Adding a separate `retired` boolean instead would require the uniqueness constraint to be rewritten
to also ignore retired rows (a partial unique index), which is a larger, unjustified schema change
for the same outcome. Nulling the column is the minimal change that satisfies DEC-04's requirement
using the existing constraint shape.

**Critical adjacent rule — rejoin must NOT reassign a position:** after a voluntary leave has
nulled `originalPosition`, a later rejoin by the same fan must **not** receive a new position. The
existing join route's reactivation branch (`join.post.ts:20-24`) updates `status` and
`alertsEnabled` only, and does not touch `originalPosition` at all — this spec requires that this
remain true after the DEC-04 change lands: the reactivation branch must continue to leave
`originalPosition` exactly as it finds it (which will now be `null`, because leave nulled it), and
must **not** run the new-position-assignment logic that only the fresh-insert branch
(`join.post.ts:26-28`) currently runs. **This is a "must not regress" requirement, not a new
behaviour to add** — it is already true of the existing code and must be preserved.

**Acceptance criterion:** a fan holding `originalPosition = 7` who leaves has `originalPosition =
null` on their membership row immediately after leave; `community.originalsAssigned` is unchanged
(still reflects 7 having been issued, per the existing never-decrement rule); if that fan rejoins,
their `originalPosition` remains `null` (not reassigned to 7 or to any other number), and
`community.originalsAssigned` is unchanged by the rejoin.

### 3.4 Idempotency (double-leave)

**Rule (existing behaviour, re-verified, must be preserved):** `leave.post.ts:13` already returns
the existing row unchanged if `existing.status !== 'active'` — i.e., leaving twice in quick
succession returns the already-left state on the second call rather than erroring or re-running
the clearing logic. This must still hold after the DEC-04 `originalPosition` clear is added: the
second call must not attempt to clear `originalPosition` again (harmless if it did, since it is
already null, but the early return at `:13` already prevents this by short-circuiting before the
update statement is reached).

**Acceptance criterion:** two leave calls in immediate succession both return HTTP 200 with
identical membership state in the response; only one `status:'left'`/`originalPosition:null`
transition is ever written (verifiable by asserting `leftAt` does not change between the two
calls).

### 3.5 Leaving a fandom you are not a member of

**Rule (existing behaviour, re-verified):** `leave.post.ts:12` throws `NOT_FOUND, 'You are not a
member of this community.'` when no membership row exists at all. The task brief's acceptance
criterion #5 asks this to be "consistent with the existence-hiding rule" documented at
`guide/content/99.api-reference/0.index.md:164` — **this guide citation is a documentation claim,
not independently read in this session** (out of this spec's required reading list); this spec
does not change the existing `NOT_FOUND` behaviour, since it already matches the general pattern of
every other not-found case read directly in code this session (`assertReportTarget`'s shared
`notFound()`, `reports.ts:14`; `join.post.ts`'s handling of a nonexistent membership row, which
falls through to the fresh-insert branch rather than erroring). **NOT VERIFIED**: whether the guide
page's specific wording for this exact case matches `leave.post.ts:12`'s message — the test-author
must read the actual guide page before writing an assertion against its exact wording, rather than
trusting this spec's summary of it.

---

## 4. Removal restriction (DEC-03) and removal notification (DEC-10)

### 4.1 Scope and counting unit — per-community, removals only (sub-question (a))

**Rule:** the first/second removal count is **scoped to one community per fan, not global across
all communities.** A fan removed from Community X and separately removed from Community Y has one
removal recorded against each community independently — these are two separate "first removals,"
not a second removal anywhere. Justification: PRD §6.19's trigger is "The platform admin team
removes a fan **from a fandom**" (line 1112, singular, fandom-scoped), and the rejoin restriction
it defines is explicitly about rejoining "**the** fandom" (line 1129-1130: "the fan cannot rejoin
**the fandom**... permanently banned **from that fandom**") — every sentence in §6.19 is scoped to
a single fandom, never to the fan's account globally. Nothing in the PRD (within the ranges read in
this task's required inputs, PRD §6.18-6.19, §12, §19) describes a cross-fandom or global ban.

**Rule:** only **admin removals** count toward this total. A voluntary `left` status does not
increment the removal count and does not trigger any rejoin restriction — PRD §6.19's trigger
clause names exactly one event, "the platform admin team removes a fan from a fandom" (line 1112);
§19's open question (line 2072) asks what counts as "a first or second removal" in the context of
a section titled "Fandom removal" that is itself a continuation of §6.19's admin-removal trigger.
Voluntary leave has its own, separate, non-punitive consequence section (§6.18), which contains no
rejoin restriction of any kind — a fan who leaves voluntarily may rejoin immediately, and
rejoining does not interact with the removal count in either direction (rejoining after a
voluntary leave neither increments nor resets a removal count, because leaving never touched it).

**Worked examples:**
1. Fan joins Community A, is removed by an admin once. Removal count for (fan, A) = 1 → 30-day
   block applies. Fan is never removed from Community B. Removal count for (fan, B) = 0 → no
   restriction there.
2. Fan is removed from Community A (count = 1, 30-day block), later (after the block expires)
   rejoins A, is removed from A a second time. Removal count for (fan, A) = 2 → permanent ban from
   A. The fan's separate, unrelated membership in Community B is untouched.
3. **Edge case:** fan voluntarily leaves Community A, rejoins, then is removed by an admin for the
   first time. Removal count for (fan, A) = 1 → 30-day block. The earlier voluntary leave does not
   count and does not combine with the later removal — "first removal" means the first *admin
   removal* event, regardless of how many prior voluntary leave/rejoin cycles preceded it.

### 4.2 How the 30-day window is calculated (sub-question (b))

**Rule — recommended mechanism:** at the moment an admin removal is recorded, the backend computes
and stores a server-side timestamp, `blockedUntil = removedAt + 30 days`, on the removal record
(see §4.4 for where this is stored). `removedAt` is the server's own transaction timestamp at the
moment the removal is committed (the same `new Date()` the existing code already uses,
`reports.ts:58`) — not a client-supplied time, consistent with the brief's standing instruction
that the backend, not the client, enforces restrictions (PRD §6.19 line 1156: "Enforce restrictions
on the backend, not only in the interface").

A rejoin attempt is evaluated by comparing the current server time against the stored
`blockedUntil` for that (fan, community) pair's **most recent** removal record: if `now() <
blockedUntil` **and** the removal count for that pair is exactly 1, the rejoin is blocked with the
restriction still active; if `now() >= blockedUntil` and the count is exactly 1, the rejoin is
permitted (the 30-day window has elapsed). If the count is 2 or more, the ban is permanent
regardless of `blockedUntil` or elapsed time (§4.1, example 2) — `blockedUntil` becomes irrelevant
once a second removal has occurred for that pair.

**Worked examples:**
1. Removal recorded at `2025-01-01T00:00:00Z`. `blockedUntil = 2025-01-31T00:00:00Z`. A rejoin
   attempt at `2025-01-15T00:00:00Z` (15 days later) is blocked — `now() < blockedUntil`.
2. Same removal. A rejoin attempt at `2025-01-31T00:00:01Z` (30 days and 1 second later) is
   permitted — `now() >= blockedUntil`.
3. **Edge case — exact boundary:** a rejoin attempt at exactly `2025-01-31T00:00:00Z` (precisely 30
   days later, to the second) is **permitted** — the comparison is `now() >= blockedUntil`, not
   `now() > blockedUntil`, so the boundary instant itself counts as the window having elapsed, not
   as still-blocked. This must be stated explicitly because "30 days" is otherwise ambiguous at the
   exact boundary and the brief requires rules to be stated so they are testable, not left to
   implementation accident.

"30 days" means a fixed 30×24-hour duration added to the removal timestamp, not a calendar-month
offset — no PRD text (§6.19, the only section defining this number) specifies calendar-month
semantics, and a fixed duration is the only interpretation that produces an unambiguous, testable
instant from any `removedAt` value, including on leap days or at month boundaries.

### 4.3 Appeal effect on the count (sub-question (c))

**PRD does not define appeal mechanics anywhere in the ranges read for this task** (§6.19 line
1125 and line 1158 both say an appeal/support route should be offered "if the platform's
moderation policy permits one" / "only if that route exists and is permitted by policy" —
conditional on a policy that is never itself defined; §19 line 2068 separately lists "appeal
handling" for **hostile fan flags**, a different mechanism from fandom removal appeals; §19 line
2072 asks "how appeals affect the count" for fandom removal specifically, without ever defining
what a fandom-removal appeal *is* or who hears it). No appeal route, appeal table, or
appeal-outcome field was found anywhere in `server/db/schema/app.ts` or `server/api/**` by
TASK-0001's full read (`0001-findings.md` coverage statement, all 97 routes and all 3 schema files
read).

**PROPOSED — OWNER SIGN-OFF REQUIRED (minimal defensible rule, not a PRD-sourced one):** this spec
proposes that a fandom-removal appeal, for the pilot, consists only of an **admin reinstating** a
removed member through the existing admin action pathway (the reverse of `removeMember`, which
this task must add if it does not already exist — `0001-findings.md`'s DEC-12/admin-routes read
found no "reinstate member" route among the 28 admin routes read, so this is new route surface,
not a re-use of an existing one). The proposed rule:

- A reinstatement **clears the active block**: it sets the membership back to `status:'active'`
  and clears any `blockedUntil` restriction currently in effect, so the fan may act as a member
  again immediately.
- A reinstatement does **not** decrement the historical removal count: if this was the fan's first
  removal from this community and an admin reinstates them, the count stays at 1. If that fan is
  later removed from the same community again, that second removal is still counted as removal #2
  (permanent ban), not treated as a fresh "first removal" because an earlier one was appealed.

**Justification for "does not decrement":** a reinstatement is a decision that this particular
removal was wrong or should be excused *this time* — it is not evidence that the underlying event
never happened. Treating an appealed-and-reinstated removal as if it never occurred would let a fan
exhaust an unlimited number of removal-appeal-reinstate cycles while never advancing toward the
PRD's second-removal permanent-ban protection, defeating the purpose of a two-strikes rule the
owner has already approved (DEC-03). This is the spec's reasoning, offered because the PRD is
silent — **it must be confirmed by the owner before this task is built**, exactly as the task
brief instructs ("if the PRD is silent, present it as the proposed minimal rule for owner sign-off,
flagged clearly").

**Worked examples (assuming the proposed rule is approved):**
1. Fan removed from Community A (count=1, 30-day block active). Admin reinstates on day 5. Fan is
   `status:active` again immediately, `blockedUntil` restriction lifted. Count remains 1.
2. Continuing example 1: 60 days later, the same fan is removed from Community A again. This is
   removal #2 for that pair (count becomes 2) → **permanent ban**, not a fresh 30-day block, because
   the earlier reinstatement did not reset the count.
3. **Edge case:** fan is removed, reinstated, removed again, reinstated again, removed a third
   time. Count reaches 3 at the third removal. The rule as proposed does not distinguish a 2nd from
   a 3rd+ removal — PRD §6.19 only defines first and second-removal outcomes (lines 1129-1130); this
   spec treats any count ≥ 2 as "permanent ban," so a 3rd removal produces the same permanent-ban
   outcome as the 2nd, not a harsher or different one (there is no PRD text for a 3rd-removal tier).

### 4.4 Schema change — recommendation and justification

**Recommendation: add two columns to `membership`, not a new `FandomRemoval` table.**

Proposed additive columns on `membership` (`server/db/schema/app.ts:89-102`):
- `removalCount` — integer, not null, default 0. Incremented by 1 each time `removeMember` runs
  against a row (including when reinstated-and-removed-again, since the existing row is reused —
  `removeMember` already looks up and reuses the existing membership row rather than creating a
  new one, `reports.ts:55`).
- `blockedUntil` — timestamp with timezone, nullable. Set to `removedAt + 30 days` on a first
  removal (`removalCount` becomes 1); left as whatever it already is (irrelevant, per §4.2) once
  `removalCount` reaches 2; cleared (`null`) on a reinstatement, per §4.3.

**Justification for columns-on-membership over a new `FandomRemoval` table:** `evidence-matrix.md`
§4 (Migration section, row 2) and `0001-findings.md` §5 both independently note that "a new table
is purely additive; a new column on `membership` can default/backfill to `0`/`null` for all
existing rows with no data loss" — both options are additive and backfillable, so the choice is a
genuine design decision, not a correctness requirement. Columns-on-membership is recommended here
because: (a) the restriction is inherently a property of one (fan, community) pair's current state
— "is this fan currently blocked from rejoining this community, and by how much" — which is
exactly what `membership`'s existing `status`/`leftAt` columns already represent for the
`left`/`removed` states, so extending the same row keeps the one-row-per-pair model consistent
(mirrors `membership_user_community_uq`, `app.ts:100`); (b) a separate `FandomRemoval` table would
require a join on every rejoin check (`join.post.ts:17`'s existing single-row lock-and-read) purely
to read two scalar values that describe the current row's own restriction state, adding complexity
with no behavioural benefit for the pilot's single-current-restriction-per-pair model; (c) a
`FandomRemoval` table would become valuable **only** if the pilot needed a full historical log of
every individual removal event (e.g., for the admin moderation record PRD §6.19 line 1160 requires:
"Record the removal event, reason category, timestamp, and applicable restriction in the moderation
record") — and that requirement is **already satisfied** by the existing append-only `adminAudit`
table, since `removeMember` already writes an audit row with `action:'membership.removed'` and
metadata including `userId`, `communityId`, `originalPosition` (`reports.ts:60`); this task should
extend that existing metadata to also include the reason category and the resulting
`removalCount`/`blockedUntil`, rather than building a second, parallel history table that
duplicates what `adminAudit` already does.

**Flagged non-rollback-safe, per `evidence-matrix.md` §4-5:** changing the meaning of existing
`removed` rows (currently a permanent ban with no expiry, per the code as found —
`0001-findings.md` DEC-03) to the new "first-removal = 30-day, second = permanent" rule is a
semantic change to existing data, not purely additive. **This spec does not resolve what happens to
pre-migration `removed` rows** (whether they become immediately rejoin-eligible, retroactively
assigned a computed `blockedUntil`, or grandfathered as permanent) — `evidence-matrix.md` §4
explicitly states this is an owner decision, separate from DEC-03's policy ruling itself. Given the
pilot has not yet launched (per `evidence-matrix.md`'s general framing of this as a dev-database,
low-stakes environment), the implementer should confirm with the owner whether any pre-existing
`removed` test/dev rows need handling at all, or whether this only matters once the pilot has real
removed members — **this spec flags the question rather than assuming an answer.**

### 4.5 Removal notification — DEC-10's required addition

**Rule:** when `removeMember` runs, in the same transaction, call the existing `notify` helper
(`server/utils/admin.ts:26`) to write a `notification` row of `type: 'membership.removed'` to the
removed fan's `userId`, with `data` including at minimum the community ID/name and the resulting
`removalCount` (so the client can distinguish a 30-day-block notice from a permanent-ban notice,
per PRD §6.19's requirement to "Display the correct removal count and rejoin restriction," line
1153). This is a **new call**, separate from and in addition to the existing `audit(...)` call at
`reports.ts:60` — the two are not interchangeable (see §0's "two different tables" note). Without
this call, DEC-10's requirement ("must be added in TASK-0012-A," `decisions.md` DEC-10) remains
unmet and PRD §6.19's full-screen notice (lines 1108-1146) has no backend event to trigger it from.

**Rule:** no notification is generated for voluntary leave — PRD §6.19 line 1151 explicitly
requires the app to "Distinguish admin removal from voluntary departure," and line 1169's
acceptance criterion states "The notice does not appear for voluntary departures." `leave.post.ts`
must not call `notify` with this or any removal-flavoured type.

### 4.6 Rejoin enforcement

**Rule:** `join.post.ts:19`'s current unconditional block (`if (existing?.status === 'removed')
throw apiError('FORBIDDEN', ..., { reason: 'removed' })`) must become conditional on the new
columns:
- If `removalCount >= 2` → still unconditionally blocked (permanent ban), same error shape as
  today.
- If `removalCount === 1` and `now() < blockedUntil` → blocked, same error shape, optionally with
  `blockedUntil` included in the error detail so the client can render "you may rejoin after
  [date]" (PRD line 1123, "State the rejoin timeline" — the exact response field name is an
  implementation choice not specified here, since the task brief's "What this task does NOT
  invent" section explicitly leaves error-code/field details to the route's actual contract).
- If `removalCount === 1` and `now() >= blockedUntil` → rejoin is **permitted**, following the
  existing reactivation branch (`join.post.ts:20-24`), which must remain unmodified in its
  `originalPosition`-preserving behaviour per §3.3's "must not reassign" rule.

**Rule — bypass prevention (PRD line 1157, "Prevent invitations, deep links, or repeated Join
Fandom requests from bypassing restrictions"):** because this check lives inside the single
`join.post.ts` route that is the only path that creates or reactivates a membership row (confirmed
by `0001-findings.md`'s full read of all 97 routes — no other route writes `membership.status`
except `leave.post.ts` and `removeMember`), there is no separate invitation or deep-link code path
that could bypass it; this spec does not need to additionally patch any other route, but the
implementer must re-confirm, at implementation time, that no new route created by a sibling task
(e.g. a future invitation feature) writes to `membership` without going through this same checked
path.

---

## 5. Acceptance criteria and test expectations — full list

| # | Area | Acceptance criterion | Test |
|---|---|---|---|
| 1 | Reporting | Mission reports succeed for an existing, visible-community mission (§1.1) | New test: report a mission, assert 201/200 and correct response shape |
| 2 | Reporting | Mission reports 404 for a nonexistent mission ID or one in a non-visible community (§1.1) | New test |
| 3 | Reporting | Reporter identity never returned to reporter (§1.2, re-verified) | Re-run/confirm existing assertion against `reports/index.post.ts:12` |
| 4 | Reporting | Duplicate open report returns existing report, no new row (§1.3) | Existing test re-confirmed + status-code check added |
| 5 | Blocking | A blocks B → B's content invisible to A; B unaffected (§2.1, §2.5.1-2) | New test |
| 6 | Blocking | Duplicate block/unblock idempotent; self-block rejected (§2.5.3-5) | New test |
| 7 | Blocking | Blocking has no membership/notification side effects (§2.5.6) | New test |
| 8 | Leave | Consequence content shown before confirmation; no change before confirm (§3.1) | New/existing UI-level test per the app's actual confirmation mechanism |
| 9 | Leave | Atomic: forced mid-transaction failure leaves membership unchanged (§3.2) | New test with injected failure |
| 10 | Leave | `originalPosition` nulled on leave; counter unchanged; rejoin does not reassign (§3.3) | New test |
| 11 | Leave | Double-leave idempotent, single `leftAt` write (§3.4) | New test |
| 12 | Leave | Leaving a non-membership 404s (§3.5, existing behaviour) | Existing test re-confirmed |
| 13 | Removal | First removal → 30-day block; rejoin blocked within window, allowed after (§4.2) | New test, including the exact-boundary case |
| 14 | Removal | Second removal (same pair) → permanent ban regardless of elapsed time (§4.1, §4.2) | New test |
| 15 | Removal | Removal count is per-community, not global (§4.1 example 1) | New test |
| 16 | Removal | Voluntary leave never increments removal count or blocks rejoin (§4.1) | New test |
| 17 | Removal | Reinstatement clears active block, does not decrement count (§4.3 — **pending owner sign-off**) | New test, written against whichever rule the owner confirms |
| 18 | Removal notice | `membership.removed` notification row created on admin removal, with correct data; none on voluntary leave (§4.5) | New test |
| 19 | Removal | Rejoin bypass prevention — only `join.post.ts` can reactivate membership (§4.6) | Confirmed by code review, not a runtime test (structural claim) |

---

## 6. Owner sign-off required

One item in this spec is a proposal, not a sourced rule, and must be confirmed by the owner before
implementation of that specific piece begins (the rest of this spec may proceed without waiting,
since the removal-count/blocked-until mechanism in §4.1-4.2 and §4.4 does not depend on the appeal
rule):

- **§4.3 — appeal effect on removal count.** Proposed rule: an admin reinstatement clears the
  active block (fan is `active` again immediately) but does **not** decrement the historical
  `removalCount`. The PRD is silent on fandom-removal appeal mechanics everywhere this task's
  required reading covers (§6.19, §12, §19) — this is this spec's own minimal, defensible proposal,
  not a PRD-sourced rule, per the task brief's explicit instruction to flag it as such.

No other item in this spec requires owner sign-off: reporting fixes (§1) correct a confirmed
defect against an already-approved feature; blocking's one-directional/visibility-only scope (§2.1)
is also flagged as a recommendation but is lower-stakes (reversible, no counting/permanent-state
implications) — it is listed for the owner's awareness but does not block the rest of this task the
way §4.3 would block implementing a reinstate route correctly; §3 and §4.1/§4.2/§4.4/§4.5/§4.6
directly implement already-RESOLVED decisions (DEC-04, DEC-03, DEC-10) with this spec supplying
only the mechanical detail those rulings explicitly delegated to this document.

---

## 7. Owner-run commands

No command in this document has been run by this session. Once the implementer and test-author
have completed their work, the owner runs:

```
pnpm test:unit
pnpm test:e2e
pnpm typecheck
```

A pass means: the existing 47 e2e tests and 8 unit tests continue to pass unchanged (regression),
plus every new test listed in §5's table passes. The owner separately records, in `decisions.md`
under DEC-03, confirmation of the §4.3 appeal-count sign-off (or a substitute rule the owner
prefers instead), per this task's "Owner evidence required" clause
(`0012-reporting-blocking-leaving.md:104-106`).

---

## 8. NOT VERIFIED (this session)

- Whether `guide/content/99.api-reference/0.index.md:164`'s existence-hiding wording matches
  `leave.post.ts:12`'s actual error message text (§3.5) — the guide page itself was not read this
  session; only cited from the task brief's own citation of it.
- Whether `guide/content/99.api-reference/0.index.md:192`'s idempotency pattern description
  matches this spec's §3.4 rule exactly in wording — same reason, not read this session.
- Whether any reply-listing route (`server/api/drops/[id]/replies*`) has an existing
  single-choke-point visibility function equivalent to `canSeeDrop`, or whether suppression must be
  added ad hoc per route (§2.4) — those route files were not read in full in this session (outside
  this spec's required reading list of `leave.post.ts`, `join.post.ts`, `reports/index.post.ts`,
  `reports.ts`, and the `app.ts` sections named in the task brief).
- Whether Nuxt's default response status for the "already exists" report branch
  (`reports/index.post.ts:18-20`) is 200 by default or inherits some other default — not traced
  through the framework's defaults in this session (§1.3).
- Whether any pre-existing `removed` membership rows exist in the current dev database that would
  be affected by the DEC-03 schema/semantic change (§4.4's non-rollback-safe flag) — no database
  was queried in this session; this is a question for the owner/implementer to check against the
  actual running database, not something a document read can answer.

---

## 9. Cross-check — statements in this document checked against each other

- §3.3 ("rejoin must not reassign a position") and §4.6 ("existing reactivation branch... must
  remain unmodified") describe the same `join.post.ts:20-24` branch and agree: neither requires a
  code change to that branch, both require it be left alone.
- §4.1 ("voluntary leave never increments removal count") and §3's leave specification (§3.1-3.5)
  do not describe any removal-count interaction for leave — consistent, no leave-side rule touches
  `removalCount`/`blockedUntil`.
- §4.5 ("no notification...for voluntary leave") and §3 do not instruct `leave.post.ts` to call
  `notify` anywhere — consistent.
- §2.1's "one-directional, visibility-only" blocking scope and §2.4's suppression mechanism agree:
  only the blocker's reads are filtered; no change is specified to what the blocked user sees or to
  any write path.
- §4.2's boundary rule (`now() >= blockedUntil` permits rejoin) and §4.2 example 3 agree with each
  other (both state the exact-instant boundary is permitted, not blocked).

No contradiction was found between any two statements in this document on re-reading.

## 9. Owner ruling (received — now binding)

- **Appeal/reinstatement effect on removal count:** an admin reinstatement clears the active block (status active, blockedUntil cleared) but does NOT decrement the historical removal count — a first removal stays counted as removal #1 even if reinstated; a later removal counts as #2 (permanent).
- The mission-report-404 fix and reportSubject mission case are ALREADY DONE (issue #23, defect fix landed and reviewed); that part of this spec is complete, not to be re-implemented.
