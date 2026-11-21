---
id: TASK-0005
title: Limited content publishing and fan interactions
stage: 1
status: NOT STARTED — blocked
---

# TASK-0005 — Limited content publishing and fan interactions

## Purpose
Ship the pilot's scoped version of PRD §6.6 (post interactions) and the publishing half of §6.7,
using the drop/reply model already in schema (`server/db/schema/app.ts:163-195`) rather than the
full PRD content surface (video, link cards, saves — PRD §6.6 lines 369-371).

## Scope
In: text/voice/image drop creation and publishing by Stars (`drop.type` enum,
`server/db/schema/app.ts:167`), like reactions and replies by fans (`dropReaction`, `reply`
tables, lines 179-195), reporting a drop/reply (`report.targetType`, line 210).
Out: video content, link previews, save/unsave (not in the current schema — Stage 0 must confirm
absence before this task assumes it, per DEC-06).

## Role ownership
implementer (ordinary content CRUD, not a security-sensitive clock/auth/scoring path) for drop/
reply CRUD; secure-implementer only for the audience-gating logic (`drop.audience`:
`public|members|originals_only`, line 170) since it is an authorization check. test-author writes
tests for both before implementation. reviewer after.

## Inputs
PRD §6.6 (lines 361-385), `server/db/schema/app.ts:161-195`,
`guide/content/99.api-reference/4.feed.md` (read in full before starting — not fully read this
session).

## Allowed output
**Illustrative only, not a confirmed file allowlist:** `server/api/drops/**`,
`server/api/communities/:id/drops`, `server/api/feed`, `server/api/reports` are guessed from
endpoint names in the guide index, not read directly in this session. Only files TASK-0001's gap
assessment names as needing a pilot-scope change, plus tests, may actually be touched, once the
owner approves the resulting allowlist. No new `drop.type` value without a cited owner decision
(DEC-06 covers "initial content formats").

## Acceptance criteria
1. A fan cannot see a `members`-audience drop in a community they have not joined, nor an
   `originals_only` drop without qualifying — the `originals_only` audience must not be wired to
   the unresolved numbered-recognition concept (DEC-04) without the owner confirming that link;
   until confirmed, `originals_only` content is treated as inaccessible to everyone except the
   community owner/admin in the pilot, per the brief's instruction not to advertise a deferred
   privilege as available.
2. A fan can like a drop once (`dropReaction` primary key `(dropId, userId)`,
   `server/db/schema/app.ts:179-184` — naturally idempotent, re-liking is a no-op, not an error).
3. A fan can reply to a drop and to a reply (threaded via `parentReplyId`,
   `server/db/schema/app.ts:190`); a removed drop's replies become inaccessible consistent with
   PRD §6.6 "Handle deleted, moderated, or unavailable posts gracefully."
4. Edge cases: empty reply body → `VALIDATION_FAILED`; reply to a non-existent/removed drop →
   `NOT_FOUND`; reporting the same target twice while one report is still open →
   enforced by `report_one_open_uq` (`server/db/schema/app.ts:221`), tested, not assumed; very
   long drop body (above the 64 KB request cap,
   `guide/content/99.api-reference/0.index.md:125`) → `PAYLOAD_TOO_LARGE`.

## Test expectations
Audience gating tested for all three `audience` values across member/non-member/owner/admin
callers; idempotent-like tested with concurrent double-tap; report uniqueness tested with two
rapid reports from the same user on the same target.

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`.

## Blockers
DEC-06 (content formats/publishing authority), TASK-0001 (confirm current drop/reply routes'
actual state).

## Definition of done
Audience-gated publishing and interactions working per acceptance criteria, tests pass per owner
report, reviewed.
