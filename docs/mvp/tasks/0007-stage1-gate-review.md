---
id: TASK-0007
title: Stage 1 gate review
stage: 1
status: NOT STARTED
---

# TASK-0007 — Stage 1 gate review

## Purpose
Independently confirm, after every Stage 1 task is individually reviewed and done, that Stage 1
as a whole delivers a complete, working slice (brief: "build complete feature slices") before
Stage 2 work starts — **including mandatory safety, not only the originally-listed feature
tasks.** A prior review found this gate's dependency list incomplete: it named only TASK-0002
through TASK-0006 and omitted TASK-0012-A (mandatory reporting/blocking/leave/removal-restriction
safety baseline) and TASK-0015-A (Stage 1 instrumentation, split out from TASK-0015 specifically
so it does not create a circular dependency with this gate). Both are corrected below.

## Scope
In: re-reading every Stage 1 task's finished output, its reviewer's sign-off, and the owner's
reported test results; forming an independent view of whether Stage 1's community foundation
actually works end to end for one real fan, **including the mandatory safety baseline — no pilot
or deployment may proceed without it** (see `status.md` pilot walkthrough once produced).
Out: fixing anything itself — gate-reviewer is read-only (AGENTS.md role table).

## Role ownership
gate-reviewer only, after all Stage 1 tasks individually pass (AGENTS.md: "Gate-reviewer only
after all phase tasks pass").

## Inputs
TASK-0002, TASK-0003, TASK-0004, TASK-0005, TASK-0006, **TASK-0012-A (mandatory)**, and
**TASK-0015-A** (Stage 1 instrumentation), with their reviewer sign-offs; `docs/mvp/scope.md`
Stage 1 section; `docs/mvp/decisions.md` (confirm no Stage-1-blocking decision was silently worked
around, and specifically confirm DEC-03 has a recorded disposition per TASK-0012-A's acceptance
criterion 4).

## Allowed output
`docs/mvp/gate-stage1-review.md` (planned deliverable).

## Acceptance criteria
1. Every Stage 1 acceptance criterion across TASK-0002, TASK-0003, TASK-0004, TASK-0005,
   TASK-0006, and **TASK-0012-A** is independently re-checked against cited evidence, not
   re-trusted from the task's own report.
2. No Stage 1 task's implementation silently resolved an OPEN decision from `decisions.md` (e.g.
   TASK-0004 must not have picked a lane name set itself) — gate-reviewer flags any such
   violation as a blocking finding, not a note.
3. **DEC-03 has a recorded disposition** (resolved by the owner, or explicitly "no admin removal
   enforcement during pilot") per TASK-0012-A's acceptance criterion 4 — **this gate fails outright
   if TASK-0012-A's removal-restriction piece is simply missing with no recorded reason**, per the
   lead's finding that an unresolved decision blocks the dependent rollout rather than leaving
   optional machinery unbuilt.
4. TASK-0015-A's measurement criteria (as folded into TASK-0004 and TASK-0012-A's own acceptance
   tests) are present and passing — this gate does not pass on feature completeness alone if the
   Stage 1 instrumentation commitment was skipped.
5. A concrete end-to-end walkthrough is attempted on paper: a new fan signs up, verifies email,
   browses a fandom, joins with one lane, posts/reacts, reports, leaves (with the consequence
   confirmation and atomic access revocation from TASK-0012-A). Every step cites which task
   covered it; any uncovered step is a gate failure.

## Test expectations
None new — this task consumes the named Stage 1 tasks' test evidence; it does not write tests.

## Independent reviewer
N/A — gate-reviewer is itself the independent check at this level; it does not get reviewed by a
further role, but its findings go back to the owner.

## Owner evidence required
Owner has already reported individual task test results; the owner additionally confirms they
accept the gate-reviewer's finding before Stage 2 begins.

## Blockers
TASK-0002, TASK-0003, TASK-0004, TASK-0005, TASK-0006, **TASK-0012-A**, and **TASK-0015-A** must
all be individually reviewed and done, with TASK-0012-A's DEC-03 disposition on record.

## Definition of done
Gate review document written, no unresolved blocking finding, owner has acknowledged the gate.
