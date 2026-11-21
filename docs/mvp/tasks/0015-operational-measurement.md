---
id: TASK-0015
title: Operational measurement instrumentation — split by stage to avoid a circular gate dependency
stage: 1 (A) + 2 (B)
status: NOT STARTED
---

# TASK-0015 — Operational measurement instrumentation

A prior review found the original single-task version created a circular dependency: it was a
dependency of the Stage 1 gate (TASK-0007) while also being described as depending on TASK-0008
(a Stage 2 task that itself depends on TASK-0007 having passed). This file is split into two
independent sub-deliverables to fix that.

## TASK-0015-A (Stage 1 — join/content/safety measurement)

### Purpose
Instrument the Stage 1 measurement surfaces during Stage 1 delivery itself, per the owner's
instruction to "instrument necessary measurement during delivery, not after pilot begins."

### Scope
In: adding measurement acceptance criteria to **TASK-0004** (join/leave counts) and **TASK-0012-A**
(report resolution time) as those tasks are implemented. Out: any mission/XP/recognition
measurement (that is TASK-0015-B, Stage 2) and any third-party analytics SDK (PRD §13.7/§9, no
such provider is selected by this plan). **This sub-deliverable does not depend on TASK-0008 or on
TASK-0007** — it feeds into TASK-0007 (the Stage 1 gate requires it), so it cannot also depend on
TASK-0007 without creating a cycle; it depends only on TASK-0004 and TASK-0012-A, both Stage 1.

### Role ownership
**The data-access and authorization half is security-sensitive and owned by secure-implementer,
test-first** — what report/membership data a query reads, and who may call any summary route, are
not ordinary UI work. Only the presentation of resulting numbers is designer (spec) / implementer
(visual UI).

### Inputs
`docs/mvp/scope.md` "Stage 3 — Operate and measure" (the Stage 1 portion), PRD §16 lines 1918,
1929 (KPI definitions), TASK-0004 and TASK-0012-A's own schemas.

### Allowed output
Small additions to TASK-0004 and TASK-0012-A's own test/acceptance files; a read-only admin
summary query, file path to be determined by TASK-0001 and approved by the owner.

### Acceptance criteria
1. Join/leave counts and report resolution time are computable from data TASK-0004/TASK-0012-A
   already write, without a new tracking table — confirmed by a query secure-implementer writes
   and tests.
2. No summary response includes report content, evidence links, moderation internal notes, or raw
   contact data.
3. The summary surface is admin-only, independently permission-checked (shared pattern with
   TASK-0006).

### Test expectations
Query-correctness test against a small seeded dataset with hand-computed expected values.

### Independent reviewer
reviewer.

### Owner evidence required
Owner runs the relevant test file and reports the result.

### Blockers
TASK-0004, TASK-0012-A must exist (at least in test form). **Not** TASK-0008, **not** TASK-0007.

### Definition of done
Stage 1 measurement criteria folded into TASK-0004/TASK-0012-A's own acceptance tests, summary
surface (if built) admin-only and PII-free, reviewed — done before or alongside Stage 1 delivery,
feeding into (not depending on) the TASK-0007 gate.

---

## TASK-0015-B (Stage 2 — missions/XP/recognition measurement)

### Purpose
Instrument the remaining two Stage 3 measurement surfaces — repeated participation (mission
completion rate) and Star contribution/review effort — once the mission and XP systems exist.

### Scope
In: adding measurement acceptance criteria to **TASK-0019** (mission lifecycle) and **TASK-0008**
(XP history) as those tasks are implemented; extending TASK-0015-A's summary surface with the
Stage 2 figures. Out: any third-party analytics SDK (same exclusion as TASK-0015-A).

### Role ownership
Same split as TASK-0015-A: data-access/authorization is secure-implementer, test-first;
presentation only is designer/implementer.

### Inputs
`docs/mvp/scope.md` "Stage 3 — Operate and measure" (the Stage 2 portion), PRD §16 line 1918
(mission completion rate), TASK-0019 and TASK-0008's own schemas.

### Allowed output
Small additions to TASK-0019 and TASK-0008's own test/acceptance files; extension of
TASK-0015-A's summary query/route, once the owner approves the extended allowlist.

### Acceptance criteria
1. Mission completion rate and mission-review latency (submit → approve/reject delta, using
   `mission_completion.created_at`/`reviewed_at`, `server/db/schema/app.ts:258-259`) are computable
   without a new tracking table — confirmed by a query secure-implementer writes and tests.
2. No summary response includes mission proof content, proof links, or rejection reasons verbatim
   (only counts/rates/latencies) — tested.
3. The extended summary surface remains admin-only, independently permission-checked.

### Test expectations
Query-correctness test with a small seeded dataset (worked example: 10 missions started, 6
completed → 60% completion rate — matching TASK-0015-A's existing worked-example convention).

### Independent reviewer
reviewer.

### Owner evidence required
Owner runs the relevant test file and reports the result.

### Blockers
TASK-0019, TASK-0008 must exist (at least in test form). TASK-0015-A (extends it, not a fresh
surface).

### Definition of done
Stage 2 measurement criteria folded into TASK-0019/TASK-0008's own acceptance tests, extended
summary surface admin-only and PII-free, reviewed — required for the TASK-0016 (Stage 2) gate.
