---
id: TASK-0009
title: Tier calculation
stage: 2
status: NOT STARTED
---

# TASK-0009 — Tier calculation

## Purpose
Implement the tier formula from `docs/mvp/scope.md` ("Tier formula") against the authoritative
per-fandom XP balance, including the three worked examples and the negative-balance edge case
already flagged there as an open gap.

## Scope
In: deriving `tier` from `xp` on read (badge display, `BDG-01/02`) and on write (XP award
confirmation triggers tier recalculation, PRD line 570). Out: badge skins (deferred), Superfan
public featuring order rule (deferred per owner direction), General-tier privileges (deferred —
tier calculation itself still must correctly report "General" as a fact even though its
privileges are switched off elsewhere, per the distinctness rule in `scope.md`).

## Role ownership
secure-implementer (scoring). test-author first. reviewer after.

## Inputs
`docs/mvp/scope.md` "Tier formula", PRD §6.9 lines 560-616 ("Badge progression rules" and
acceptance criteria), TASK-0008's output (tier reads from the same XP balance).

## Allowed output
**Illustrative only, not a confirmed file allowlist:** `server/api/badges/**` is guessed from the
endpoint names (`BDG-01`, `BDG-02`) in the guide index, not read directly in this session.
Wherever the badge-tier derivation actually lives is located by TASK-0001 and approved by the
owner before this task changes anything, plus tests. No new column duplicating a tier value that
must instead always be derived live from XP
(PRD line 564: "The badge tier is calculated from the fandom's authoritative XP balance" — storing
a separate mutable `tier` column that can drift from this calculation is explicitly the kind of
bug this rule exists to prevent).

## Acceptance criteria
1. `tier(0)` = Lurker with no visible indicator (PRD line 524, 571) — tested by asserting the API
   response either omits a tier badge field or marks it explicitly non-displayable, per whatever
   shape TASK-0001/designer confirms the client expects.
2. Exact boundary tests at xp = 99, 100, 499, 500, 1999, 2000, 4999, 5000 (PRD §18 line 1978,
   "Badge progression at 100, 500, 2,000, and 5,000 XP" — boundary, not just interior, values).
3. Worked example 1 (340 XP → Supporter) and worked example 2 (85→100 XP transition → Supporter,
   instant) produce the documented result from `scope.md`. **Worked example 3 (negative balance)
   is explicitly NOT implemented by this task:** DEC-11 (negative XP balance / demotion policy) is
   an unresolved decision blocker, not a formula this task may invent. This task's formula is
   defined, implemented, and tested only for `xp >= 0`; for `xp < 0`, this task takes no position
   and ships no behaviour — the tier-calculation code must not be written in a way that silently
   produces a result for `xp < 0` without the owner's ruling on DEC-11 recorded first.
4. A higher tier replaces, never coexists with, a lower one (PRD line 569) — tested by asserting
   the API never returns more than one tier value for a membership.

## Test expectations
Boundary-value table test (all eight xp values above, all `>= 0`); tier-is-derived,
not-stored-and-drifted test (mutate XP, confirm tier changes on next read without any separate
tier-update call). No negative-balance test is written by this task — that test belongs to the
future task opened once DEC-11 is resolved.

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`.

## Blockers
TASK-0008 (for the `xp >= 0` formula, this task's actual scope). **DEC-11 blocks any negative-
balance or demotion behaviour outright** — not merely as an optional refinement; this task must
not ship a negative-balance code path under any circumstance until DEC-11 is resolved.

## Definition of done
Formula implemented exactly as specified, all boundary and worked-example tests pass per owner
report, reviewed.
