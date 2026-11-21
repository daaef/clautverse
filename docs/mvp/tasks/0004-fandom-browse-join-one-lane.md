---
id: TASK-0004
title: Fandom information, browse/join with one lane
stage: 1
status: NOT STARTED — blocked
---

# TASK-0004 — Browse/join with one lane

## Purpose
Let a fan view fandom information and join with exactly one lane selected, per PRD §6.7-§6.8,
within the pilot's free, no-second-lane-yet scope.

## Scope
In: fandom discovery/detail display (reusing `COM-01`, `COM-02` if Stage 0 confirms they work),
lane selection as a required step of join, one lane only in Stage 1 (second lane is TASK-0010,
Stage 2).
Out: lane names/enum (blocked on DEC-01 — this task cannot select a lane name set itself),
private/invite-only join rules (blocked on DEC-06), voluntary leave and the admin-removal/rejoin
rule (owned entirely by TASK-0012-A, DEC-03 — not this task).

## Role ownership
secure-implementer (membership + authorization). designer specifies the lane-selection screen
behaviour (card grid, one selectable, confirmation) per PRD §6.8 "Lane UI requirements" before
implementation starts. test-author writes tests first. reviewer after.

## Inputs
PRD §6.7 (lines 387-418), §6.8 (lines 420-506), `decisions.md` DEC-01/DEC-06,
`server/db/schema/app.ts:89-102` (`membership` table, `lane` column reserved).

## Allowed output
Blocked until DEC-01 resolved: this task may not add a lane enum or lane values. Once resolved,
allowed files: `server/db/schema/app.ts` (lane column type change, via a generated migration, not
hand-edited production data — `README.md:31`); the join route — **`server/api/communities/:id/join`
is an illustrative guess at the path, not confirmed by reading `server/api/**` in this session**,
so the real file is whatever TASK-0001 identifies and the owner approves; test files; and a
designer spec file at `docs/mvp/tasks/0004-lane-selection-screen.md`.

## Acceptance criteria
1. Join is rejected (`VALIDATION_FAILED`) without a lane value once DEC-01 is resolved and lane
   becomes a required, enumerated field — PRD §6.8 acceptance: "A fan cannot join a fandom without
   one valid lane" (line 501).
2. Duplicate lane assignment within the same fandom membership is impossible (PRD line 503,
   already a Stage 1 rule even though the second lane itself ships in Stage 2 — the backend must
   still reject selecting the same lane twice even for the single-lane case, since DEC-01's chosen
   lane set could technically be fed twice if the field is accidentally sent as an array).
3. Lane is scoped per fandom membership, never shared across fandoms (PRD line 505, "Lane data is
   removed when the corresponding fandom membership is permanently cleared" — see TASK-0012-A for
   the clearing behaviour itself).
4. Edge cases: empty lane string → `VALIDATION_FAILED`; lane value not in the approved set →
   `VALIDATION_FAILED` (never silently coerced to a default); join retried with the same
   Idempotency-Key → original response replayed, not a second lane assignment
   (`guide/content/99.api-reference/0.index.md:198`); joining a vetoed/removed-status community →
   `NOT_FOUND` per the existence-hiding rule (`guide/content/99.api-reference/0.index.md:164`).

## Test expectations
test-author covers: valid single join; missing lane; invalid lane value; duplicate join
(idempotent per `guide/content/99.api-reference/0.index.md:191`); concurrent joins from the same
user (only one membership row results, consistent with existing `ON CONFLICT DO NOTHING`
behaviour cited at `guide/content/99.api-reference/3.communities.md:40` — re-verified by
TASK-0001, not re-assumed here).

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`, reports result.

## Blockers
DEC-01 (lane names) — hard blocker on any schema/route change. DEC-06 (join/privacy rules) blocks
anything beyond "public, open join." TASK-0001 must have assessed the current join route first.

## Definition of done
Lane selection enforced server-side with an owner-approved lane set, tests pass per owner report,
designer spec reviewed, code reviewed by a different role.
