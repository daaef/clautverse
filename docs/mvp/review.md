---
title: Independent review of the MVP planning set
---

# Independent review — docs/mvp/

**Reviewer:** independent `reviewer` role (agent 356268ee), static planning-artifact review only.
**Scope reviewed:** `plan.md`, `decisions.md`, `scope.md`, `status.md`, and all task briefs
`tasks/0001`–`tasks/0019` — read in full across three passes, not sampled. External citations
(PRD, `server/db/schema/app.ts`, `README.md`, `package.json`, guide pages) were re-verified
directly in the first two passes.
**What this review is NOT:** no `server/api/**` route source was read, no command was run, and no
claim is made about runtime behaviour. This is document-conformance review only — the backend
gap assessment remains TASK-0001's job.

## Verdict: PASS

All blocking findings raised during review were corrected and re-verified:

- TAL-08 miscited as "implemented" (it is `deferred`) — fixed in `decisions.md`.
- Truncated PRD §6.1 quote presented as a direct quote — fixed in `tasks/0006`.
- Language implying `server/api/**` might not exist — corrected to "not read in this session"
  across `status.md` and the task briefs.
- TASK-0001 used gate-reviewer outside a phase gate — rewritten to lead-coordinated
  researcher + spec-writer + reviewer + owner approval.
- Stage 1 gate (TASK-0007) originally did not require the safety baseline — TASK-0012 split
  into **A** (Stage 1 mandatory safety: reporting, blocking, voluntary leave, removal
  restrictions) and **B** (Stage 2 atomic XP/tier cleanup extension); TASK-0007 now requires
  0012-A and the Stage 1 portion of TASK-0015.
- TASK-0015 (measurement) had an apparent circular dependency — split into **A** (Stage 1,
  depends only on TASK-0004/TASK-0012-A) and **B** (Stage 2, depends on TASK-0008/0019).
- Missions had no owning task — **TASK-0019** added (mission creation, submission, owner
  review, atomic XP award, decision idempotency) with **DEC-12** opened for unresolved
  deadline/review-reversal/proof-shape policy.
- TASK-0017 implied "owner/lead" launch authority — corrected to OWNER ONLY; the lead
  coordinates documents and tooling, never launches or operates the pilot.
- TASK-0013 asserted a `409 INVALID_STATE` contract for negative/demoting corrections —
  removed; such actions are unsupported/deferred pending DEC-11, with no response contract
  invented.

## Graph check

Dependency graph traced by hand: `0001 → {0002–0006, 0012-A} → 0015-A → 0007 → 0008 →
{0009–0011, 0012-B, 0013, 0019} → 0015-B → 0016 → 0017 → 0018`, with DEC-01…DEC-12 as
side-inputs and TASK-0014 feeding TASK-0016's disposition check. **No cycles.**

## Post-review cleanup

Two non-blocking wording findings from the final pass (a "18 files" miscount and a DEC-12
"in full" vs "in part" block description) were corrected in `plan.md`, `status.md`, and
`decisions.md` after the PASS verdict. These were summary-prose fixes only and were not
re-reviewed; they do not change scope, dependencies, or any acceptance criterion.

## What this plan is

A complete, internally consistent, evidence-cited planning set that:

- keeps every open decision open (DEC-01…DEC-12) instead of guessing;
- defers money, Founding Pledges, streaming, leaderboards, and all paid-progression features;
- assigns security-sensitive work to `secure-implementer` with `test-author` writing failing
  tests first and a distinct `reviewer` checking every finished task;
- reserves `gate-reviewer` for phase ends only;
- requires owner-run verification (`pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e`)
  reported back before any task is done;
- requires the owner's decisions on the blocking DEC items before implementation begins.

**Acceptance of this plan is not approval of any open decision, any rewrite, or any
implementation. All 19 tasks remain NOT STARTED.**
