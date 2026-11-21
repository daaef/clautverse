---
id: TASK-0017
title: Stage 3 — operate pilot and collect measured-operation evidence
stage: 3
status: NOT STARTED — blocked
---

# TASK-0017 — Operate the pilot and collect measured-operation evidence

## Purpose
Support the owner's Stage 3 direction to actually "operate and measure repeated participation,
Star contribution and review effort, safety workload and disputes" once Stage 1-2 are gated
(TASK-0007, TASK-0016) and the instrumentation from TASK-0015-A/B exists. **"Operating the pilot" —
actually enabling access for a real cohort, inviting real users, running the pilot in a real
environment for a real period — is OWNER-ONLY authority. The lead coordinates document and
review work around this task; the lead has no launch authority and does not operate the pilot.**
No role, and not the lead, is authorised to take a real operational action (flip a feature flag
live, invite real users, open real registration) on its own initiative; only the owner personally
does that, at the owner's own chosen time, outside this document set. What a role *may* do, once
the owner has operated the pilot and reports that it is running: build and maintain the read-only
evidence-query tooling, and compile/report what the resulting real data shows. This task is
distinct from TASK-0015-A/B (which build the measurement capability before any pilot runs) and
from TASK-0018 (which independently, read-only, reviews whether the pilot's evidence supports
moving forward).

## Scope
In: **once the owner has personally operated the pilot and reports it is live for a stated cohort
and period** — building/maintaining the read-only query tooling needed to compute the measurement
surfaces already defined in `scope.md` ("Stage 3 — Operate and measure"), and compiling a plain
evidence report (counts, rates, latencies) for the owner from data TASK-0015-A/B already made
queryable. Out: **no role, and not the lead, operates the pilot itself** — nobody under this plan
enables access for real users, invites a real cohort, or flips any pilot-launch switch; only the
owner does that, reported to this task after the fact. This task also does not set the pilot
cohort size, start date, end date, or any pass/fail threshold — those are DEC-07 (still OPEN) and
the owner's own operational decision, not decided or executed by this task, any role, or the lead.

## Role ownership
**OWNER ONLY launches or operates the pilot. No role in this plan, and not the lead, has launch
authority.** secure-implementer builds and maintains the read-only evidence-query tooling
(admin-only, same permission discipline as TASK-0006/TASK-0015-A/B) strictly against data the
owner's own operation of the pilot has already produced. designer specifies how the summary is
presented to the owner/admin (a plain table or dashboard, not a new consumer-facing feature, and
not a control surface for operating the pilot). The lead's role here is limited to coordinating
this documentation/tooling work and relaying the owner's written cohort/period decision into this
task — the lead does not decide, approve, or execute any operational action.

## Inputs
`docs/mvp/scope.md` "Stage 3 — Operate and measure", TASK-0015-A/B's output (the queries/surfaces
they built), `decisions.md` DEC-07, the owner's written cohort/period decision (does not yet exist
— this task cannot begin without it).

## Allowed output
`docs/mvp/tasks/0017-pilot-operation-report.md` (planned deliverable, produced once the pilot has
actually run for the owner-set period) and any admin-only summary route TASK-0015-A/B already
authorised extending. No new consumer-facing feature, no new schema table beyond what
TASK-0015-A/B already proposed and had reviewed.

## Acceptance criteria
1. The pilot cohort, start date, and run length are stated as the owner's own written decision,
   quoted and cited (e.g. "owner, <date>: cohort = <N> communities, period = <N> weeks") — never
   invented by this task.
2. The three measurement surfaces from `scope.md` are reported with real counts from the pilot
   period, each with its computation shown (not just a final number) — e.g. "mission completion
   rate = completed / started = X/Y = Z%", so the owner can verify the arithmetic, not just trust
   it.
3. Safety workload is reported as open-report count and resolution-time distribution (not just an
   average — report both median and the slowest case, since an average alone can hide a stuck
   report), per the brief's instruction to measure "safety workload and disputes."
4. No report content, evidence link, or moderation internal note appears in the operation report
   (same privacy rule as TASK-0015-A/B, re-verified here against the actual report produced, not
   assumed carried over).
5. Edge cases: a cohort with zero activity in the period is reported as zero, not omitted or
   extrapolated; a cohort where one single fandom accounts for the overwhelming majority of
   activity is flagged explicitly (so the owner is not misled by an aggregate that one outlier
   dominates) rather than silently averaged in.

## Test expectations
A query-correctness test with a small seeded dataset, matching TASK-0015-A/B's precedent
(hand-computed expected values checked against the query's actual output). No test of "is the
pilot a success" — that is a judgement call for the owner using the report, not a pass/fail this
task computes.

## Independent reviewer
reviewer for any code (summary query); gate-reviewer for the operation report itself as part of
TASK-0018.

## Owner evidence required
**Owner personally** states the cohort/period decision in writing before this task starts, and
**owner personally** operates (launches) the pilot — neither step may be delegated to the lead or
to any role. Owner runs any test file the query cites and reports the result. Owner reviews the
finished operation report.

## Blockers
DEC-07 (cohort/platform — this task cannot define it), TASK-0015-A and TASK-0015-B (measurement
mechanism must exist first), TASK-0007 and TASK-0016 (Stage 1 and Stage 2 gates must have passed
before operating a pilot on top of them), and the **owner's own act of launching the pilot**, which
no task or role may substitute for.

## Definition of done
Owner-stated cohort/period on record, operation report produced from real pilot-period data with
shown arithmetic, no privacy leak, reviewed.
