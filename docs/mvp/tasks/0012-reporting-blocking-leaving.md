---
id: TASK-0012
title: Reporting, blocking, leaving — mandatory Stage 1 safety baseline, with a Stage 2 extension
stage: 1 (mandatory baseline) + 2 (extension)
status: NOT STARTED — blocked
---

# TASK-0012 — Reporting/blocking/leaving

This task is explicitly split into two sub-deliverables that ship at different gates. They are
recorded together here because they share the same PRD sections and schema, but they are **not**
one atomic unit of work and must not be treated as a single pass/fail criterion.

## TASK-0012-A (Stage 1, mandatory — blocks the Stage 1 gate outright)

### Purpose
Deliver the minimum safety baseline the brief requires before any pilot can run at all: reporting,
blocking, voluntary leave with access revocation, and the removal-restriction rule DEC-03 is meant
to define. **This is not optional machinery that can be waved through to a later stage.** Per the
lead's finding: no deployment or public pilot may proceed without a complete mandatory admin/
removal safety baseline; an unresolved decision (DEC-03) blocks the *rollout* that depends on it,
it does not merely leave an optional nice-to-have unbuilt.

### Scope
In:
- Reporting (`RPT-01`) and the never-expose-reporter rule.
- Blocking — the `Block` entity named in PRD line 1711 was not found in `server/db/schema/app.ts`
  in this session; TASK-0001 confirms whether it exists anywhere in the codebase before this task
  decides whether to add it.
- Voluntary leave: the fan's membership access is revoked immediately and the fan cannot act as a
  member of that fandom from the moment leave is confirmed (PRD §6.18).
- Removal restrictions (admin-removed fan cannot rejoin): **this piece is blocked on DEC-03**
  (what counts as a first/second removal, how appeals affect the count, how the 30-day window is
  calculated). Until DEC-03 is resolved, this task cannot implement enforceable removal
  restrictions — and per the lead's finding, **the Stage 1 gate (TASK-0007) must not pass with
  this piece missing and no owner disposition of DEC-03 on record.** The owner may resolve DEC-03
  normally, or may explicitly decide (in writing, recorded as an update to DEC-03's status) that
  admin removal is not used during the pilot — either resolution unblocks the gate; silently
  deferring the decision without a recorded disposition does not.
Out: Original badge retirement (DEC-04), Founding Pledge return (DEC-05) — both explicitly
deferred by owner direction and excluded from this mandatory baseline; the Stage 2 extension
below (atomic XP/tier cleanup on leave/removal).

### What this task does NOT invent
The previous version of this brief specified a particular backend mechanism — "a confirm token or
explicit confirm field" — and specific error-code choices for edge cases. **Neither is specified
here.** This task requires only the outcome: (a) the fan sees and can read the UX consequence
confirmation described in PRD §6.18 before anything changes, (b) the backend executes leave as a
single authoritative, atomic operation only after that confirmation, with no partial state change
possible on failure, and (c) the exact request/response contract (what field or mechanism signals
confirmation, which error codes apply to which failure) is decided by TASK-0001's assessment of
the actual current route and the error-code table already in the guide
(`guide/content/99.api-reference/0.index.md:148-162`, a documentation claim to verify, not a
contract this task invents independently). No specific mechanism is read into PRD line 1077 ("the
backend validates") beyond "the backend, not only the client, enforces this" — PRD line 1077 does
not itself specify a confirm-token design and this task must not attribute one to it.

### Role ownership
secure-implementer (membership state, access revocation, moderation — all security-sensitive).
test-author first. reviewer after.

### Inputs
PRD §6.18 (lines 1028-1101), §6.19 (lines 1102-1170), §12 (lines 1581-1623), `decisions.md` DEC-03,
DEC-04, `server/db/schema/app.ts:89-102,207-223`, TASK-0001's evidence matrix (for the actual leave
route, the `Block` entity question, and the guide's error-code table).

### Allowed output
**Illustrative only, not a confirmed file allowlist:** this session has not read `server/api/**`.
The area of change is whatever route implements community leave and reporting, wherever TASK-0001
locates it, plus a new `block` table/route only if TASK-0001 confirms none exists and the owner
approves adding it (a schema change needs its own migration review, never a silent addition), plus
tests.

### Acceptance criteria
1. A fan sees the PRD §6.18 consequences content and must take an explicit confirming action
   before the backend executes leave — the exact mechanism is whatever TASK-0001/the implementer
   determines fits the existing route contract, not a mechanism this brief specifies.
2. Leave is a single atomic operation: either it fully succeeds (membership ends, access revoked)
   or it fully fails with the fan still a full member and no partial change (PRD lines 1079, 1100)
   — tested by forcing a mid-operation failure.
3. Reporter identity is never exposed to the reported party (re-verify, don't re-cite, the
   `server/db/schema/app.ts:206-207` comment) — shared acceptance criterion with TASK-0006.
4. Removal restrictions are either (a) fully implemented and tested per the owner's DEC-03
   resolution, or (b) explicitly absent with DEC-03 recorded as "owner decision: no admin removal
   enforcement during pilot" — no third outcome (silently unbuilt with no recorded reason) is
   acceptable at the Stage 1 gate.
5. Edge cases: leaving a fandom the fan is not a member of → an error consistent with the
   existence-hiding rule the gap assessment confirms is real (`guide/content/99.api-reference/
   0.index.md:164`, a documentation claim to verify); reporting while an open report on the same
   target already exists from the same reporter → enforced by `report_one_open_uq`, tested;
   leave retried twice in quick succession (double-tap) → second call returns the already-left
   state, not a second clearing operation or an error (idempotent, consistent with the pattern
   described in `guide/content/99.api-reference/0.index.md:192`, a documentation claim to verify).

### Test expectations
Consequence-confirmation-required test; atomic leave (all-or-nothing) test under forced failure;
reporter-never-exposed test; double-leave idempotency test; duplicate open-report test;
removal-restriction test (if (a) above) or an explicit "removal enforcement intentionally absent"
note in the test plan (if (b)).

### Independent reviewer
reviewer.

### Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`. Owner records, in writing, the DEC-03 disposition
used for acceptance criterion 4.

### Blockers
DEC-03 — **blocks this task's removal-restriction piece outright, and blocks TASK-0007 (Stage 1
gate) from passing until DEC-03 has a recorded disposition** (resolved, or explicitly "not used in
pilot"). DEC-04 (blocks only the Original-retirement step, excluded from this task entirely).
TASK-0001 (route location, `Block` entity existence, error-code table verification).

### Definition of done
Reporting, blocking (if it exists or is approved), voluntary leave with atomic access revocation,
and a recorded DEC-03 disposition are all in place; reviewed; owner has reported test results.

---

## TASK-0012-B (Stage 2 extension — depends on TASK-0008/TASK-0009)

### Purpose
Extend TASK-0012-A's leave/removal operation so it also atomically clears the fandom-specific XP
balance and tier state once those systems exist (TASK-0008 XP ledger, TASK-0009 tier
calculation) — PRD §6.18 requires XP/tier loss on leave, but that cannot be built or tested before
the XP/tier mechanism itself exists.

### Scope
In: extending the already-built TASK-0012-A leave/removal operation to also clear
fandom-specific XP and tier data (and leaderboard entry, if a leaderboard table exists in pilot
scope — confirm with TASK-0001 before claiming this step, since leaderboards are listed as
deferred-for-*display*, not confirmed to exist as a clearable table) within the same atomic
operation as the membership change — not as a separate, later, non-atomic cleanup step. Out:
Original badge retirement (DEC-04), Founding Pledge return (DEC-05) — still deferred.

### Role ownership
secure-implementer. test-author first. reviewer after.

### Inputs
TASK-0012-A's finished leave/removal operation, TASK-0008 and TASK-0009's outputs, PRD §6.18 lines
1066-1069, 1080.

### Allowed output
The same leave/removal route TASK-0012-A modified, extended; no new file beyond what TASK-0001 or
TASK-0012-A already identified; tests.

### Acceptance criteria
1. Leave/removal and the XP/tier clearing happen in one atomic operation — a forced failure after
   membership ends but before XP clearing (or vice versa) must leave the system in the
   pre-operation state, not a half-cleared one.
2. A fan who leaves and later rejoins (where permitted) starts at Lurker/0 XP in that fandom, not
   with any residual balance (PRD line 575).
3. This extension does not alter TASK-0012-A's already-reviewed access-revocation or reporting
   behaviour — tested by re-running TASK-0012-A's existing test suite unchanged alongside the new
   tests.

### Test expectations
Atomic combined-cleanup test (forced failure mid-operation); post-rejoin-starts-at-zero test;
regression run of TASK-0012-A's test suite.

### Independent reviewer
reviewer.

### Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`.

### Blockers
TASK-0012-A (must be done first), TASK-0008, TASK-0009. **This sub-deliverable belongs to the
Stage 2 gate (TASK-0016), not the Stage 1 gate** — TASK-0007 requires only TASK-0012-A.

### Definition of done
XP/tier cleanup folded atomically into the existing leave/removal operation, regression-tested
against TASK-0012-A, reviewed, owner has reported test results.
