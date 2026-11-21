---
id: TASK-0003
title: Approved Star access for the pilot
stage: 1
status: NOT STARTED — blocked
---

# TASK-0003 — Approved Star access

## Purpose
Define and, once DEC-09 is resolved, implement which existing talent-application/identity-claim
path (TAL-01..07, ADM-02..07b — `TAL-08` talent analytics is listed `deferred`, not part of this
pipeline, `guide/content/99.api-reference/0.index.md:86`) applies to the pilot's Star cohort, and
what pilot-specific eligibility narrows the PRD's full application form (PRD §4.3, lines
2364-2387).

## Scope
In: pilot eligibility criteria for Star access; wiring (if gap-assessment finds gaps) the accept/
decline/claim-verify flow to the pilot's narrower rules.
Out: category list changes, payment/plan selection (deferred — `PLN-*` routes are `deferred`,
`guide/content/99.api-reference/8.discover-plans.md:21-26`), any Established Star claim flow
(explicitly excluded by the PRD itself, Star-side §1.4 "Scope Boundaries": "An Established Star
claim flow" is out of scope unless separately approved).

## Role ownership
secure-implementer (approval/role-granting is permission-sensitive). test-author writes tests
before this task's code changes, covering acceptance/decline/claim-verify state transitions.
reviewer checks the finished task.

## Inputs
PRD §4.1-4.4 (Star-side, lines 2338-2397), `decisions.md` DEC-09,
`guide/content/99.api-reference/7.talent-admin.md` (read in full before starting — not fully read
in this planning session), `server/db/schema/app.ts:104-138` (`talentApplication`,
`identityClaim` tables).

## Allowed output
**Illustrative only, not a confirmed file allowlist:** the paths named here
(`server/api/talent-applications/**`, `server/api/admin/applications/**`,
`server/api/admin/claims/**`) are guessed from the route names in the endpoint index, not read
directly in this session. Only files TASK-0001's gap assessment names as needing a pilot-scope
change, plus test files under `tests/`, may actually be touched, and only once TASK-0001 has
confirmed the real paths and the owner has approved the resulting allowlist. No schema change
without Stage 0 proposing it first.

## Acceptance criteria
1. Pilot eligibility fields are an explicit, owner-approved subset of PRD §4.3's table — no field
   is invented; any field not owner-confirmed is omitted, not guessed.
2. One pending application per user is enforced (already modelled:
   `talent_application_one_pending_uq`, `server/db/schema/app.ts:119` — test confirms it, does not
   assume it).
3. A declined applicant cannot submit a new application that bypasses `internalNote`/
   `decisionReason` visibility rules (PRD: internal notes must stay internal — no PRD line gives
   fans access to `internalNote`; a test asserts the fan-facing response never includes it).
4. Edge cases: empty/missing required field → `VALIDATION_FAILED` with the specific field named;
   duplicate pending application → `409 CONFLICT` with `existingId`
   (`guide/content/99.api-reference/0.index.md:197`); an application submitted by an already-
   accepted talent → rejected, not silently accepted twice; a very large bio/links payload →
   rejected at the request body cap (`guide/content/99.api-reference/0.index.md:125`, 64 KB).

## Test expectations
test-author writes failing tests for the above before secure-implementer changes any route.
Concurrency case: two near-simultaneous submissions from the same user — only one pending row may
exist.

## Independent reviewer
reviewer, different from secure-implementer and test-author.

## Owner evidence required
Owner runs `pnpm test:unit` and `pnpm test:e2e`, reports result.

## Blockers
DEC-09 (pilot eligibility fields), TASK-0001 (confirm current TAL/ADM routes actually work before
changing them).

## Definition of done
Eligibility rule owner-approved, code changed only where Stage 0 identified a real gap, tests
pass per owner report, reviewed.
