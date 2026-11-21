---
id: TASK-0011
title: Essential in-app notifications
stage: 2
status: NOT STARTED — blocked
---

# TASK-0011 — Essential in-app notifications

## Purpose
Define the pilot's minimal notification event set and confirm/build delivery through the existing
`notification` table and `NOT-01..04` routes.

## Scope
In: notification creation for a small, owner-approved event list (candidates drawn from PRD
§13.7's suggested events, lines 1771-1807, filtered to Stage 1-2 pilot scope — e.g.
`mission_completed`, `badge_tier_upgraded`, admin removal notice); read/unread-count/mark-read via
existing routes. Out: push notifications (PRD's analytics list implies in-app only is being built
here; push is not named as in scope by the owner's "essential in-app notifications" wording —
treat push as out of scope unless the owner says otherwise), notification preference granularity
beyond on/off (`membership.alertsEnabled`, `server/db/schema/app.ts:94`, already exists).

## Role ownership
implementer for ordinary notification CRUD once the event list is owner-approved; secure-
implementer must review any notification tied to a moderation/removal event (PRD §6.19) since that
touches the permission/visibility of sensitive information (e.g. must not leak reporter identity
into a notification payload). test-author first. reviewer after.

## Inputs
`decisions.md` DEC-10, PRD §6.19 (lines 1102-1170), §13.7 (lines 1765-1809),
`server/db/schema/app.ts:152-159`.

## Allowed output
**Illustrative only, not a confirmed file allowlist:** `server/api/notifications/**` is guessed
from the `NOT-01..04` endpoint names in the guide index, not read directly in this session. The
actual notification route(s) and the event-trigger call sites inside the routes that cause each
approved event (e.g. mission-completion approval) are located by TASK-0001 and approved by the
owner before this task changes anything, plus tests. `notification.type` stays free text per
current schema (`server/db/schema/app.ts:155`) unless Stage 0/owner decide an enum is needed — no
enum invented here without that decision.

## Acceptance criteria
1. The exact event list is owner-approved before any trigger is wired — this task does not invent
   which events fire.
2. A removal notification never includes the reporter's identity or any report `internalNote`
   (cross-check with TASK-0006 acceptance criterion 4).
3. `unread-count` reflects only notifications with `readAt IS NULL` for the calling user
   (`NOT-02`), tested with a mix of read/unread rows.
4. Edge cases: marking an already-read notification as read again is a no-op, not an error
   (`NOT-03`); `read-all` with zero existing notifications succeeds with no rows affected, not an
   error; a very large unread backlog (thousands) does not block the unread-count query — tested
   with a seeded large count and a response-time expectation stated by the test (not a vague
   "fast").

## Test expectations
Event-list-matches-owner-approval test (one test per approved event, confirming it fires exactly
once per qualifying action, not duplicated on retry); no-reporter-leak test; mark-read idempotency
test; large-backlog unread-count test.

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`, and separately confirms the approved event list in
writing before implementation starts.

## Blockers
DEC-10 (event list), TASK-0007 (Stage 1 gate).

## Definition of done
Owner-approved event list implemented, tested per acceptance criteria, reviewed.
