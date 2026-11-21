---
title: MVP plan — master index
status: PLANNING ONLY — not an approval of any open rule, rewrite, or implementation
---

# MVP plan — master index

This is the entry point for the Clautverse backend-oriented MVP plan. It indexes the companion
documents produced from `docs/mvp/planning-brief.md` (the handoff that authorised this work) and
the owner's approved direction stated there. Read the brief first; it is not duplicated here.

**What this plan is not:** it is not a completed Stage 0 gap assessment, not a runtime
verification report, and not approval of any open policy decision. No command has been run in
this session. See [status.md](./status.md) §"Evidence basis" and NOT VERIFIED in each document.

## Documents in this set

| Document | Purpose |
|---|---|
| `plan.md` (this file) | Index, how the pieces fit together |
| [`decisions.md`](./decisions.md) | Decision register: every open question from the brief, given a stable ID (DEC-01…DEC-12), with its blocking effect |
| [`scope.md`](./scope.md) | What ships in the free pilot (Stage 0–3), what is deferred, and the one formula that is settled (tier thresholds) |
| [`status.md`](./status.md) | Current status of every decision and task, honestly stated |

## Task briefs (19 task IDs, 19 files — 0012 and 0015 each hold two sub-deliverables in one file; linked individually, not a glob)

| Task | File | Stage |
|---|---|---|
| TASK-0001 | [`tasks/0001-stage0-gap-assessment.md`](./tasks/0001-stage0-gap-assessment.md) | 0 |
| TASK-0002 | [`tasks/0002-identity-carryover-review.md`](./tasks/0002-identity-carryover-review.md) | 1 |
| TASK-0003 | [`tasks/0003-approved-star-access.md`](./tasks/0003-approved-star-access.md) | 1 |
| TASK-0004 | [`tasks/0004-fandom-browse-join-one-lane.md`](./tasks/0004-fandom-browse-join-one-lane.md) | 1 |
| TASK-0005 | [`tasks/0005-limited-content-publishing.md`](./tasks/0005-limited-content-publishing.md) | 1 |
| TASK-0006 | [`tasks/0006-minimum-admin-controls.md`](./tasks/0006-minimum-admin-controls.md) | 1 |
| TASK-0007 (gate — requires TASK-0012-A, TASK-0015-A) | [`tasks/0007-stage1-gate-review.md`](./tasks/0007-stage1-gate-review.md) | 1 |
| TASK-0008 | [`tasks/0008-xp-history-duplicate-protection.md`](./tasks/0008-xp-history-duplicate-protection.md) | 2 |
| TASK-0009 | [`tasks/0009-tier-calculation.md`](./tasks/0009-tier-calculation.md) | 2 |
| TASK-0010 | [`tasks/0010-second-lane-at-supporter.md`](./tasks/0010-second-lane-at-supporter.md) | 2 |
| TASK-0011 | [`tasks/0011-essential-notifications.md`](./tasks/0011-essential-notifications.md) | 2 |
| TASK-0012-A (Stage 1, mandatory safety) / TASK-0012-B (Stage 2 extension) | [`tasks/0012-reporting-blocking-leaving.md`](./tasks/0012-reporting-blocking-leaving.md) | 1 + 2 |
| TASK-0013 | [`tasks/0013-auditable-admin-reward-correction.md`](./tasks/0013-auditable-admin-reward-correction.md) | 2 |
| TASK-0014 | [`tasks/0014-conditional-originals.md`](./tasks/0014-conditional-originals.md) | pilot-conditional |
| TASK-0015-A (Stage 1) / TASK-0015-B (Stage 2) | [`tasks/0015-operational-measurement.md`](./tasks/0015-operational-measurement.md) | 1 + 2 |
| TASK-0016 (gate — requires TASK-0012-B, TASK-0019, TASK-0015-B) | [`tasks/0016-stage2-gate-review.md`](./tasks/0016-stage2-gate-review.md) | 2 |
| TASK-0017 (OWNER ONLY operates the pilot) | [`tasks/0017-stage3-operate-pilot.md`](./tasks/0017-stage3-operate-pilot.md) | 3 |
| TASK-0018 (gate) | [`tasks/0018-stage3-gate-review.md`](./tasks/0018-stage3-gate-review.md) | 3 |
| TASK-0019 (mission lifecycle — added: missions had no task) | [`tasks/0019-mission-lifecycle.md`](./tasks/0019-mission-lifecycle.md) | 2 |

## How the pieces fit together

1. **The PRD** (`/Users/aef/Projects/clautverse/Clautverse Ecosystem PRD.md`, read in full, all
   4467 lines, fan-side §1–20 and Star-side §1–31) is the source of fan-side and Star-side product
   requirements. It explicitly contains unresolved product decisions in two places (fan-side §19
   "Open product decisions", Star-side §30 "Product Decisions That Still Need Confirmation") and
   at least one internal inconsistency within itself (lane names — see `decisions.md` DEC-01). It
   is not rewritten by this plan.
2. **The schema** (`server/db/schema/app.ts`) is source code this planning session read in full
   and cites directly wherever it makes a schema-level claim. **The implementation guide**
   (`guide/content/99.api-reference/`) is the project's own **documentation**, not code this
   session read — it labels routes `implemented` and cites test files as proof, but no route
   source under `server/api/**` was read in this session. This plan treats every guide citation as
   a documentation claim, distinct from a schema citation, and never restates a guide claim as
   verified code behaviour (see `status.md`, "Evidence basis", and `decisions.md`'s citation
   discipline note). A future Stage 0 task (TASK-0001) re-verifies guide claims against the actual
   route source and real test runs.
3. **The owner's approved direction** (quoted in full in the brief) narrows the PRD to a free
   pilot and defers named features. Where the direction and the PRD conflict (e.g. paid XP Boost,
   paid badge skins, Original badge numbered recognition), the owner's direction governs for the
   pilot; the PRD requirement is recorded as deferred, not deleted.
4. **Task briefs** are the only place where role assignment, file allowlists, and acceptance
   criteria live. `scope.md` and `decisions.md` describe *what* must be true; task briefs describe
   *who* checks it and *how* it is accepted.

## Reading order for a new role agent

1. `docs/mvp/planning-brief.md` — the mandate.
2. This file.
3. `decisions.md` — know what is still open before touching anything decision-dependent.
4. `scope.md` — know what's in the pilot and what formulas apply.
5. `status.md` — know what's already done, what's blocked, and that no phase-gate freeze yet
   applies (though any behaviour the owner has separately confirmed stays protected regardless).
6. The specific task brief assigned to you, in full, including its "Inputs" section (which cites
   exact source lines you must re-read yourself — do not trust this index's paraphrase).

## Citation convention used throughout this set

`file:line` or `file:line-range` means the claim was read in this session at that location.
PRD citations use `PRD §<section>` with the section title, since the PRD has no stable line
anchors a future edit will preserve. A claim with no citation is either owner-stated direction
(quoted from the brief) or is marked NOT VERIFIED.
