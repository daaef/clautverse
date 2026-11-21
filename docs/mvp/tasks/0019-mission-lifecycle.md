---
id: TASK-0019
title: Mission lifecycle — creation, submission, owner review, atomic award
stage: 2
status: NOT STARTED — blocked
---

# TASK-0019 — Mission lifecycle

A prior review found this plan had no dedicated task for mission creation/submission/review,
despite missions being core pilot scope (owner direction, Stage 2: "Star-created missions,
submissions and review as applicable"). This task closes that gap.

## Purpose
Implement Star-created mission creation, fan submission, and owner (or auto) review, with an
atomic, idempotent XP award on approval, within the schema that already exists
(`server/db/schema/app.ts:234-263` — `mission`, `missionCompletion`) and the ledger mechanism
TASK-0008 builds. **No API field, endpoint shape, or status code is guessed here** — the exact
request/response contract is determined by TASK-0001's assessment of the real route (if one
exists) and the documented conventions already in the guide (cited below as documentation claims
to verify, not invented).

## Build order (acyclic, stated explicitly to avoid circular task dependencies)
1. **TASK-0008** (XP ledger mechanism: idempotent `grantXp`-style award keyed to
   `(userId, sourceType, sourceId)`) ships first — it is the award primitive this task calls.
2. **TASK-0019** (this task) integrates mission completion approval with that primitive, using
   `sourceType = 'mission_completion'`, `sourceId = missionCompletion.id`
   (`server/db/schema/app.ts:271-277`, real schema, not guessed).
3. **TASK-0009** (tier calculation) does not depend on TASK-0019 and may proceed in parallel with
   it once TASK-0008 is done — tier is derived from the XP balance alone, regardless of which
   source produced it.

## Scope
In: mission creation by a fandom's owning Star (community ownership rule — "one talent owns one
community," `guide/content/99.api-reference/0.index.md:186`, a documentation claim to verify
against the actual ownership-check code); fan submission of a completion, gated on active
membership in that fandom; auto-approval when `mission.review = 'auto'`, owner-queue review when
`'owner'`; atomic, idempotent XP award on approval; rejection with a reason.
Out: fan-proposed missions and their Rising-Star-approval workflow (deferred by owner direction
regardless of tier — `scope.md` "Deferred pipeline"); any specific late-submission, deadline-grace,
or review-reversal rule (**DEC-12, a hard blocker on this entire task** — see below); any mission
analytics beyond what TASK-0015-B's measurement criteria require.

## What this task does NOT invent
- No late-submission or deadline-grace rule. `mission.deadline` exists in schema
  (`server/db/schema/app.ts:241`) but what happens to a submission after it passes is DEC-12,
  unresolved — this task must not guess "reject outright" or "grace period" or any other default.
- No review-reversal rule (can an `approved`/`rejected` completion be changed later) — DEC-12.
- No proof-shape validation rule at all (e.g., what makes a `proofLink` valid, whether a value is
  even required) — DEC-12. The existence of the `proofLink`/`proofText` columns bounds what data
  *can* be stored; it does not define what is acceptable or required. No default is assumed from
  the column types.
- No guessed endpoint path or request/response field name. The existing guide index lists
  `MIS-01..10` as mission/completion routes, several already `implemented` (`MIS-01,02,03,06-10`)
  and `MIS-04/05` (fan-proposal approve/reject) `deferred`
  (`guide/content/99.api-reference/0.index.md:54-63`) — this is a documentation claim TASK-0001
  must verify against the real route source before this task touches anything; this brief does not
  restate those paths as a confirmed allowlist.
- No invented retry/idempotency status code for mission decisions beyond the pattern the guide
  already documents project-wide: "Repeating the same decision → `200` with current resource (no
  new audit row). A different decision on a decided record → `409 INVALID_STATE`"
  (`guide/content/99.api-reference/0.index.md:196`) — this is the *existing documented contract*
  for admin/owner decisions generally, not a new rule invented for this task; TASK-0001 confirms
  it is really what the code does before this task relies on it.

## Role ownership
secure-implementer (XP award, membership/ownership authorization — security-sensitive). test-author
writes tests first, before any implementation (AGENTS.md: "test-author before security-sensitive
implementation"). reviewer after.

## Inputs
PRD §6.11 (lines 682-702), PRD Star-side §12 (lines 3029-3144), `decisions.md` DEC-02, DEC-12,
`server/db/schema/app.ts:234-279` (`mission`, `missionCompletion`, `xpTransaction`), TASK-0008's
finished ledger mechanism, TASK-0001's evidence matrix for the real mission/completion routes.

## Allowed output
**Illustrative only, not a confirmed file allowlist:** this session has not read `server/api/**`.
The area of change is whatever route(s) implement mission creation, completion submission, and
completion review, wherever TASK-0001 locates them, plus tests. No schema change without its own
migration review.

## Acceptance criteria
1. Mission creation is restricted to the fandom's owning Star (or admin) — tested by attempting
   creation as a non-owner and expecting rejection.
2. Completion submission requires active membership in the mission's fandom — tested by attempting
   submission as a non-member.
3. One completion per fan per mission is enforced (`mission_completion_once_uq`,
   `server/db/schema/app.ts:261`) — tested, not assumed from the constraint's existence alone.
4. Proof type matches `mission.proof`: a `'link'` mission's completion carries a non-empty
   `proofLink`, a `'text'` mission's completion carries non-empty `proofText`, a `'none'` mission's
   completion requires neither — tested for all three, including the case where the wrong field is
   supplied for the mission's proof type.
5. Approval of a completion atomically (a) sets `missionCompletion.status = 'approved'`, (b) grants
   XP exactly once via the TASK-0008 ledger primitive keyed to
   `(userId, 'mission_completion', completionId)`, and (c) records `xpTransactionId` on the
   completion row — tested by forcing a failure between steps and confirming no partial state.
6. Repeating the same review decision (approve an already-approved completion) returns the
   existing state, grants no second XP, and creates no second audit trace — tested directly,
   consistent with the project's documented decision-idempotency pattern (cited above, verified by
   TASK-0001 first).
7. Rejection requires a reason, consistent with other reviewed-decision patterns in this plan
   (TASK-0013's same requirement) — tested.
8. **Deadline and review-reversal behaviour are explicitly NOT implemented or tested by this task
   until DEC-12 is resolved** — if `mission.deadline` has passed at submission time, this task
   takes no position and must not guess a behaviour; the submission path for a past-deadline
   mission is out of this task's scope entirely pending DEC-12.
9. Edge cases: submitting a completion to a mission with `status != 'approved'` (e.g. `'pending'`,
   `'rejected'`, `'closed'`) is rejected; a fan who leaves the fandom before their completion is
   reviewed — this interacts with TASK-0012-A/B and must not create an orphaned completion that
   later awards XP to a non-member (tested as a cross-task scenario, coordinated with TASK-0012-B).

## Test expectations
Ownership-restricted-creation test; membership-restricted-submission test; duplicate-completion
test; proof-type-matching test (all three types, plus mismatches); atomic approve+award test under
forced failure; approve-twice idempotency test; reject-without-reason-rejected test; left-member
pending-completion test (coordinated with TASK-0012-B).

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`.

## Blockers
**DEC-12 — hard blocker on this entire task's deadline/late-review/proof-shape behaviour; this
task may ship only the parts above that do not require DEC-12 (creation, membership-gated
submission, duplicate protection, atomic approve+award, decision idempotency, rejection reason)
and must explicitly exclude deadline/reversal behaviour until DEC-12 resolves.** TASK-0008 (XP
ledger primitive must exist first — see "Build order" above). TASK-0001 (route location, mission
ownership-check verification, decision-idempotency pattern verification).

## Definition of done
Mission creation/submission/review implemented and tested per acceptance criteria 1-7 and 9;
deadline/review-reversal explicitly excluded with DEC-12 cited as the reason, not silently absent;
reviewed; owner has reported test results.
