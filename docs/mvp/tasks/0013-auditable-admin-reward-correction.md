---
id: TASK-0013
title: Auditable admin reward correction
stage: 2
status: NOT STARTED — blocked
---

# TASK-0013 — Auditable admin reward correction

## Purpose
Confirm/build the admin XP-correction path (`ADM-17 POST /api/admin/xp-adjustments`) so every
correction is auditable, idempotent, and reflected correctly in tier calculation (TASK-0009).

## Scope
In: admin-initiated XP adjustment with a required reason; audit trail. **A correction that would
produce a negative or demoting balance is explicitly unsupported and deferred pending DEC-11 —
this task does not implement any path for it, successful or rejecting, and does not choose an
endpoint contract or status code for it now.** Out: automated/bulk corrections, any self-service
fan-initiated dispute flow (not named by the owner's direction; PRD does not define one either —
do not invent it), and any resolution of DEC-11 itself.

## Role ownership
secure-implementer (XP/scoring + admin). test-author first. reviewer after.

## Inputs
PRD §13.4 line 1732 ("every important tier, reward, purchase, removal, and retirement event is
auditable"), `decisions.md` DEC-02, `server/db/schema/app.ts:267-279` (`xpTransaction`,
`sourceType: 'admin_adjustment'`), `server/db/schema/app.ts:142-150` (`adminAudit`).

## Allowed output
**Illustrative only, not a confirmed file allowlist:** `server/api/admin/xp-adjustments` is
guessed from the `ADM-17` endpoint path in the guide index, not read directly in this session. The
actual file is located by TASK-0001 and approved by the owner before this task changes anything,
plus tests.

## Acceptance criteria
1. Every correction writes both an `xpTransaction` row (`sourceType: 'admin_adjustment'`,
   `actorId`, `reason`) and an `adminAudit` row — tested as two assertions per correction, not one.
2. A correction is rejected without a `reason` (PRD's auditability requirement implies a reason is
   mandatory, not optional, for this specific action — state this explicitly since the PRD does
   not spell out a validation rule here and this task must not silently relax it).
3. **A correction that would drive a membership's balance below zero, or below a threshold the fan
   has already crossed (demotion), must never actually be applied by this task's code.** DEC-11
   (negative XP balance / demotion policy) is an unresolved decision blocker: this task has no
   authority to decide what a negative or sub-threshold balance means, what HTTP status or error
   code applies to attempting one, or what the request/response contract looks like for that case
   — none of that is chosen here. This task's test suite must prove the code path cannot silently
   produce such a balance (e.g., the attempt does not commit, whatever outward response it
   currently gives), without the test asserting any specific status code as "the" contract. The
   actual contract (status code, error shape) is decided once DEC-11 is resolved and is a separate,
   future task's acceptance criterion, not this one's.
4. Edge cases: a correction of exactly 0 → rejected as meaningless (`VALIDATION_FAILED`) unless the
   owner confirms a 0-amount audit-only correction is a real use case (do not assume either way
   without asking); two admins issuing corrections on the same user at nearly the same time → both
   recorded as separate ledger rows if neither would cross zero or demote, no lost update (tested
   with concurrent requests); two concurrent corrections where either alone is safe but their sum
   would go negative → at most one may actually commit, the other's attempt does not silently sum
   into a negative balance (per criterion 3 — no status code asserted here either).

## Test expectations
Dual-write (ledger + audit) test; missing-reason-rejected test; negative-or-demoting-correction-
does-not-commit test (asserts the balance is unaffected, not a specific status code — replaces any
"negative-balance-tier" test, since there is no tier behaviour to test until DEC-11 is resolved);
concurrent-correction-no-lost-update test, including the concurrent-sum-would-go-negative case.

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`, and confirms the zero-amount-correction question in
writing before this task's acceptance criterion 4 is finalized.

## Blockers
DEC-02 (does not block the mechanism, only the production-default amounts elsewhere). **DEC-11
blocks any negative/demoting-balance behaviour outright — this task may prove such a balance
cannot be committed, but it must not choose, guess, or document a specific endpoint contract or
status code for that case; that remains unsupported/deferred until DEC-11 is resolved.** TASK-0008,
TASK-0009.

## Definition of done
Correction path dual-writes ledger+audit for ordinary corrections; negative/demoting corrections
are proven not to commit, with no contract or status code chosen for that case (left
unsupported/deferred pending DEC-11); tests pass per owner report, reviewed.
