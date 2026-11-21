---
id: TASK-0016
title: Stage 2 gate review
stage: 2
status: NOT STARTED
---

# TASK-0016 — Stage 2 gate review

## Purpose
Independently confirm the participation loop (missions, XP, tiers, second lane, notifications,
admin correction) works as one slice before any Stage 3 operational decision or future paid-
feature reactivation is considered. **A prior review found this gate's dependency list
incomplete: it omitted TASK-0019 (mission lifecycle) and TASK-0015-B (Stage 2 measurement).** Both
are corrected below — missions are core Stage 2 scope and this gate cannot pass without them.

## Scope
In: re-checking TASK-0008 through TASK-0013, **TASK-0012-B** (Stage 2 atomic XP/tier cleanup),
**TASK-0019** (mission lifecycle), and **TASK-0015-B** (Stage 2 measurement), against their own
acceptance criteria and the owner's reported test results. Also confirms the
**conditional-Originals decision (TASK-0014) has a recorded disposition** before Stage 2 is
considered closed — not because Originals is in the pilot (it is not), but because an open
decision paper left permanently unresolved and unmentioned at a gate is itself a planning gap.
Out: fixing anything (read-only role).

## Role ownership
gate-reviewer, after all Stage 2 tasks individually pass.

## Inputs
TASK-0008, TASK-0009, TASK-0010, TASK-0011, **TASK-0012-B**, TASK-0013, TASK-0014, **TASK-0019**,
**TASK-0015-B** outputs and reviewer sign-offs; `docs/mvp/decisions.md` (confirm DEC-02 either
resolved or the mechanism-only scope boundary was actually honoured, not quietly crossed; confirm
DEC-11 blocked all negative/demotion work exactly as specified, with no silent exception; confirm
DEC-12 blocked TASK-0019's deadline/review-reversal/proof-shape scope exactly as specified; confirm
TASK-0014's options paper was delivered to the owner and its disposition — resolved, or still
explicitly open and pilot-excluded — is recorded).

## Allowed output
`docs/mvp/gate-stage2-review.md` (planned deliverable).

## Acceptance criteria
1. Every Stage 2 task's acceptance criteria, including TASK-0012-B, independently re-checked
   against cited evidence.
2. Confirms no Stage 2 task shipped a production XP amount without an owner-approved value (DEC-02
   guard) — if any task used a "placeholder" number, the gate review must flag whether that
   placeholder reached anything resembling a production code path.
3. Confirms TASK-0009 and TASK-0013 shipped exactly what DEC-11 permits — the `xp >= 0` tier
   formula and a hard rejection of negative/demoting corrections — and did not implement, test, or
   leave reachable any negative-balance or demotion code path.
4. Confirms TASK-0012-B's atomic XP/tier cleanup on leave/removal is in place and did not regress
   TASK-0012-A's Stage 1 behaviour (re-run of TASK-0012-A's test suite, per TASK-0012-B's own
   acceptance criterion 3).
5. Confirms TASK-0014's options paper has a recorded disposition from the owner (resolved one way,
   or explicitly left open with Originals confirmed still excluded from the pilot) — an
   indefinitely silent, unmentioned open decision is itself flagged as a gap, even though no
   pilot feature depends on resolving it.
6. Confirms TASK-0019 shipped exactly what DEC-12 permits (creation, membership-gated submission,
   duplicate protection, atomic approve+award, decision idempotency, rejection reason) and
   explicitly excluded deadline/review-reversal/proof-shape behaviour, citing DEC-12, not silently
   omitting it.
7. Confirms TASK-0015-B's Stage 2 measurement criteria (mission/XP/recognition data) are present
   and passing, and that its data-access/authorization portion was built by secure-implementer,
   test-first, per its own role-ownership requirement.
8. A concrete end-to-end walkthrough on paper: a Star creates a mission, a fan submits a
   completion, it is approved, XP is granted exactly once, the fan crosses into Supporter, selects
   a second lane, receives a notification, an admin issues a correction, tier recalculates, and a
   fan who leaves afterward has XP/tier atomically cleared — every step cites the task that covers
   it.

## Test expectations
None new; consumes existing test evidence, including a check that TASK-0012-A's regression suite
was actually re-run per TASK-0012-B's own requirement.

## Independent reviewer
N/A (gate-reviewer is the independent check); findings go to the owner.

## Owner evidence required
Owner acknowledges the gate-reviewer's findings before Stage 3 operational work or any future
paid-feature task is opened. Owner's TASK-0014 disposition is on record.

## Blockers
TASK-0008, TASK-0009, TASK-0010, TASK-0011, **TASK-0012-B**, TASK-0013, **TASK-0019**,
**TASK-0015-B** must each be individually reviewed and done; TASK-0014's options paper must have
been delivered (its disposition may still be "owner leaves it open," which is an acceptable
recorded outcome, but it must be recorded, not silently absent).

## Definition of done
Gate review written, no unresolved blocking finding, owner has acknowledged the gate.
