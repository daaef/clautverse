---
id: TASK-0018
title: Stage 3 gate / release-readiness review
stage: 3
status: NOT STARTED
---

# TASK-0018 — Stage 3 gate / release-readiness review

## Purpose
Independently review the pilot operation evidence produced by TASK-0017 and form a view, for the
owner, on whether the pilot's measured operation supports a release-readiness decision — without
itself deciding what "ready" means numerically, since no pass/fail threshold has been set by the
owner (DEC-07 remains open for cohort/threshold matters; this plan invents no substitute number).

## Scope
In: re-checking TASK-0017's arithmetic against the same raw data it claims to summarize; checking
that every acceptance criterion in TASK-0017 was actually met, not just asserted; checking that no
deferred feature (badge skins, XP Boost, Founding Pledge, numbered Originals, referrals,
leaderboards — see `scope.md` "Deferred pipeline") was silently activated during the pilot without
an explicit owner decision recorded as a new entry in `decisions.md`.
Out: declaring the pilot a success or failure — that judgement belongs to the owner, who holds the
only threshold-setting authority this plan recognizes (gate-reviewer is read-only per AGENTS.md).

## Role ownership
gate-reviewer only, after TASK-0017 is done.

## Inputs
TASK-0017's operation report and the raw queries behind it; `docs/mvp/decisions.md` (to check no
OPEN decision was quietly treated as resolved during Stage 3 operation); `docs/mvp/scope.md`
"Deferred pipeline" (to check no deferred item went live).

## Allowed output
`docs/mvp/gate-stage3-review.md` (planned deliverable).

## Acceptance criteria
1. Every number in TASK-0017's operation report is independently recomputed from the same raw
   data (not re-trusted) and any discrepancy is reported as a blocking finding.
2. A check, with citation, that no deferred-pipeline item (`scope.md` table) was enabled in
   production during the pilot period without a corresponding new `decisions.md` entry recording
   the owner's decision to do so.
3. A check that DEC-01 through DEC-11 are each still accurately reflected as OPEN, DIRECTION SET,
   or OUT OF PILOT SCOPE in `decisions.md` — i.e. the gate reviewer confirms the decision register
   itself has been kept honest during Stage 1-3 delivery, not left stale.
4. The review explicitly states that it does not set, and has not been asked to set, any
   numerical bar for "pilot succeeded" — that determination is returned to the owner alongside the
   verified evidence.

## Test expectations
None new — this task consumes TASK-0017's evidence and recomputes it; it does not write new
application tests.

## Independent reviewer
N/A — gate-reviewer is itself the independent check at this level; findings go to the owner.

## Owner evidence required
Owner has already reported TASK-0017's query test results; the owner makes the actual
release-readiness decision using this gate review plus the underlying evidence — this task and
this plan do not make that decision on the owner's behalf.

## Blockers
TASK-0017 must be done.

## Definition of done
Gate review document written, every TASK-0017 number independently recomputed, decision-register
staleness check complete, no deferred feature found silently activated, findings delivered to the
owner without a substituted pass/fail threshold.
