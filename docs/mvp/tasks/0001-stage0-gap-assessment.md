---
id: TASK-0001
title: Stage 0 — reconcile rules and assess existing backend
stage: 0
status: NOT STARTED
---

# TASK-0001 — Stage 0 gap assessment

## Purpose
Produce the evidence matrix this planning document explicitly could not produce: for every
PRD requirement in scope for Stages 1–3 (`scope.md`), determine whether it is (a) present in code
with a passing test the assessor ran themselves, (b) present in code but unverified/untested,
(c) absent, or (d) owner-confirmed working behaviour with no code citation found. This is the
precondition for every other task in this plan; it is itself a future scoped task, not something
this planning session has completed (brief: "Do not pretend this planning task has completed that
assessment").

## Scope
In: `server/db/schema/app.ts` and any other schema file under `server/db/schema/`, every route
under `server/api/` (not yet read in this planning session — a NOT VERIFIED gap this task closes),
every file under `guide/content/99.api-reference/`, every file under `tests/` (unit and e2e),
`openapi/clautverse.yaml` (referenced at `guide/content/99.api-reference/0.index.md:6` as the
contract whose disagreement with the guide an automated test is claimed to catch — this task
verifies that claim rather than repeating it).
Out: writing any new application code; deciding any item in `decisions.md`.

## Role ownership
**This is a read-only assessment task, not implementation — it does not use implementer,
secure-implementer, or gate-reviewer.** The lead coordinates. researcher does the actual reading
and fact-gathering (source/code facts are in scope for researcher on this task, not only external
documentation — reading `server/api/**`, `tests/`, and the schema against the PRD is exactly the
kind of "facts from the current, actual source" this task needs, cited with file:line/command,
the same discipline researcher applies to external sources). spec-writer turns those gathered
facts into the finished evidence-matrix document (the "rulebook" of what is present, absent, or
unverified). A different reviewer independently checks the finished written assessment against
this brief and against the cited sources before it is treated as settled. **The owner approves the
evidence matrix before any later task begins implementation against it** — this is a planning
gate, not a pass/fail code review. gate-reviewer is never used here: AGENTS.md reserves
gate-reviewer exclusively for an actual phase-end gate (TASK-0007 for Stage 1, TASK-0016 for
Stage 2, TASK-0018 for Stage 3), and this task is none of those — it is a prerequisite
investigation that happens before Stage 1 work can begin, not the end of a phase.

## Inputs
- `docs/mvp/scope.md`, `docs/mvp/decisions.md` (this plan's own output — treat as a checklist of
  what to re-verify, not as settled fact).
- All source files named in "Scope" above, read in full by the assessor, not sampled.
- The PRD, specifically the sections this planning session did not finish reading (after line
  3109) — read those in full before claiming any Star-side subscription, live-session, or
  settings requirement is in or out of scope.

## Allowed output
`docs/mvp/evidence-matrix.md` (new file, planned deliverable — does not exist yet; this filename
is not a live link anywhere in this plan). No other file.

## Acceptance criteria
1. Every row names: the requirement, its PRD citation, its code citation (file:line) or "none
   found", its test citation (file:line, and whether the assessor ran it and what the owner-run
   result was) or "none found", and a verdict: `present+tested`, `present+untested`,
   `absent`, `owner-confirmed, no code found`.
2. Every `decisions.md` entry gets an explicit row confirming or correcting the backend-state
   claim made in that entry (e.g. re-check DEC-04's claim about `originalPosition` rejoin
   behaviour by reading the actual join-route code, not only the guide's prose). **DEC-12 (mission
   lifecycle policy) specifically gets its own row set** covering the real `mission`/
   `missionCompletion` routes (if any), since TASK-0019 depends entirely on this assessment and
   missions are core pilot scope that a prior review found missing from this plan entirely.
3. A migration/backfill section lists every schema change this plan's later tasks would require
   (e.g. a lane enum for DEC-01, a removal-count/cooldown column for DEC-03) and whether it needs
   a backfill for existing rows, consistent with the brief's instruction to "Include data
   migration/backfill and existing-user considerations, rollback/release strategy."
4. A rollback section states, for each proposed schema change, whether it is additive
   (reversible by dropping a column/table with no data loss to existing confirmed-working
   features) or destructive, and flags any destructive step for explicit owner permission before
   any later task may execute it.
5. Visibility/privacy and concurrency are each given their own subsection addressing at minimum:
   community join concurrency — the project's documentation describes a specific concurrency
   mechanism (`guide/content/99.api-reference/3.communities.md:40`), but this is a documentation
   claim, not code this planning session read; this task must read the actual join route and
   state whether the documented mechanism is really what the code does — and report-visibility
   (reporter identity never exposed, per the schema comment at
   `server/db/schema/app.ts:206-207`, which is real code but only a comment, not the enforcing
   logic itself — this task must read the route that serializes report responses to confirm the
   comment's intent is actually enforced).

## Test expectations
This task's own output is a document, not code — but it must report, for each `present+tested`
verdict, the exact command the owner can run to reproduce the test result, and must not mark
anything `present+tested` without the assessor having been told by the owner that the command
passed (per AGENTS.md: the owner runs commands, not the assessor).

## Independent reviewer
reviewer (different from whoever built the matrix).

## Owner evidence required
The owner runs `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e` and reports pass/fail back
before any row may be marked `present+tested`.

## Blockers
None — this is the first task.

## Definition of done
`docs/mvp/evidence-matrix.md` exists, reviewed by a different role, every decisions.md entry has
a corresponding verification row, and the owner has reported real command results for every
`present+tested` claim.
