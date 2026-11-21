---
id: TASK-0006
title: Minimum admin controls (Stage 1)
stage: 1
status: NOT STARTED — blocked
---

# TASK-0006 — Minimum admin controls

## Purpose
Confirm and, where missing, build the minimum Super Admin controls Stage 1 needs: user suspend/
reinstate, report review, community veto/restore, and audit visibility — scoped to what the pilot
actually needs, not the PRD's full §14 admin-dependency table.

## Scope
In: `ADM-10/11/11a` (user management), `ADM-12/13` (report review/action), `ADM-08a/09/09a`
(community veto/restore), `ADM-14` (audit log read). Out: XP rules config (`ADM-15`), badge admin
(`ADM-16`), mission admin (`ADM-18`, already `deferred` per
`guide/content/99.api-reference/0.index.md:110`) — those belong to Stage 2 tasks (TASK-0013).

## Role ownership
secure-implementer (admin/moderation/audit is explicitly named security-sensitive in
AGENTS.md's role table). test-author first. reviewer after.

## Inputs
PRD §14 (lines 1811-1841), §12 (lines 1581-1623), `decisions.md` DEC-08,
`guide/content/99.api-reference/7.talent-admin.md` (read in full before starting).

## Allowed output
**Illustrative only, not a confirmed file allowlist:** this session has not read `server/api/**`
and does not know the actual file layout. The area of change is the routes implementing
`ADM-10/11/11a`, `ADM-12/13`, `ADM-08a/09/09a`, `ADM-14` listed in "Scope," wherever TASK-0001's
gap assessment locates them, plus their tests. The exact file paths and allowlist must be
determined by TASK-0001 and approved by the owner before this task may change any file. No new
admin role or permission concept beyond the single `admin` role already in the user record
(`guide/content/99.api-reference/0.index.md:185`) without an explicit owner decision — team-based
admin permissions are not in this plan.

## Acceptance criteria
1. Every admin route independently re-checks `requireRole(event, 'admin')` server-side
   (`guide/content/99.api-reference/0.index.md:184`) — confirmed by a test that calls the route as
   a non-admin and expects `403 FORBIDDEN`, not merely a hidden UI button.
2. Suspending a user takes effect immediately across all surfaces the suspended user could still
   call (PRD §6.1 acceptance, full clause, PRD line 241: "A deleted or suspended account cannot
   continue using authenticated features contrary to platform enforcement rules."), tested by
   attempting a write immediately after suspension in the same test.
3. Every admin action listed in scope writes an `adminAudit` row (`server/db/schema/app.ts:142-150`)
   with `actorId`, `action`, `targetType`, `targetId` — tested, not assumed, for each route.
4. Report reviewer identity (the admin who decided) is recorded (`report.decidedBy`,
   `server/db/schema/app.ts:217`) but the original reporter is never exposed to the reported user
   through any admin-facing or fan-facing response (`server/db/schema/app.ts:206-207` comment,
   verified by reading the actual response serializer, not assumed from the comment).

## Test expectations
Negative-permission tests (non-admin, suspended-admin-if-possible, signed-out) for every route in
scope; audit-row-written test for every admin action in scope; reporter-never-exposed test
reading both the admin response and (if applicable) any fan-facing echo of report status.

## Independent reviewer
reviewer, different from secure-implementer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`.

## Blockers
DEC-08 (what admin-specific security control, if any, already exists — do not assume MFA or
session hardening exists without Stage 0 confirming it). TASK-0001.

## Definition of done
Minimum admin routes confirmed or built, audited, permission-tested, reviewed, owner has reported
test results.
