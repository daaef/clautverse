---
id: TASK-0002
title: Identity carryover review (sign-up, sign-in, session, verified email)
stage: 1
status: NOT STARTED
---

# TASK-0002 — Identity carryover review

## Purpose
Confirm the existing auth stack (claimed `implemented` at `AUTH-01..08`,
`guide/content/99.api-reference/0.index.md:14-22`, built on Better Auth per
`README.md:3` and `package.json:21`) meets the pilot's security bar before Stage 1 features are
built on top of it, without assuming the guide's badges are current.

## Scope
In: review only, of `server/api/auth/**` (read in full — not read in this planning session) and
`guide/content/99.api-reference/1.auth.md` (read in full — not read in this planning session).
Out: no new identity feature (e.g. social sign-in, phone auth) — PRD §6.1 lists these as optional
("such as email or phone number"); not building them is in scope, deciding to add them is not.

## Role ownership
secure-implementer performs the review (auth is a security-sensitive path per AGENTS.md role
table). reviewer checks the finished review, a different person from the reviewer.

## Inputs
PRD §6.1 (lines 216-241, full acceptance criteria), `guide/content/99.api-reference/1.auth.md` in
full, `server/api/auth/**` in full, `server/db/schema/auth.ts` (referenced at
`server/db/schema/app.ts:3` import, not yet read — read it in full before writing findings).

## Allowed output
`docs/mvp/tasks/0002-findings.md` (planned deliverable, does not exist yet).

## Acceptance criteria
1. Confirms or corrects, with file:line citations, whether `EMAIL_NOT_VERIFIED` is enforced
   server-side on every state-changing route except the documented exceptions
   (`guide/content/99.api-reference/0.index.md:184` claims only `GET /api/me`, auth routes, and
   public catalog reads skip it — re-verify, don't re-cite).
2. Confirms session cookie flags (`HttpOnly`, `Secure`, `SameSite=Lax` per
   `guide/content/99.api-reference/0.index.md:183`) by reading the actual Better Auth
   configuration, not the guide's prose.
3. States what account-deletion grace period exists (PRD §6.1 "communicate the consequences
   before confirmation"; guide mentions a "30-day grace" purge job at
   `guide/content/99.api-reference/8.discover-plans.md:44` — re-verify this is wired to `DELETE
   /api/me`, `AUTH-08`).
4. Lists any gap against PRD §6.1 acceptance criteria (lines 235-241) with no gap left unstated.

## Test expectations
None written by this task — it is a review, not an implementation. It must name which existing
tests (if any, under `tests/`) the reviewer ran or asked the owner to run to support each finding.

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs any test file the review cites and reports the result.

## Blockers
TASK-0001 (Stage 0 matrix should already cover auth; this task either reuses that matrix's auth
rows or, if TASK-0001 has not reached auth yet, does the auth slice of it directly — avoid
duplicate work by checking TASK-0001's status first).

## Definition of done
Findings file written, reviewed, owner has run and reported the cited tests.
