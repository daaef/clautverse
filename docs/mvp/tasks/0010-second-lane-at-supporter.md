---
id: TASK-0010
title: Optional second lane at Supporter
stage: 2
status: NOT STARTED — blocked
---

# TASK-0010 — Second lane at Supporter

## Purpose
Implement PRD §6.8's second-lane unlock: once a fandom membership reaches Supporter (100 XP), the
fan may optionally select one more, distinct lane in that same fandom.

## Scope
In: unlock check at tier-crossing into Supporter (reuses TASK-0009); second-lane selection
endpoint; duplicate-lane prevention. Out: lane changes/swaps after selection (PRD §19 "Lane
changes" is explicitly open — this task only adds a second lane, it does not let a fan replace an
existing one).

## Role ownership
secure-implementer. test-author first. reviewer after.

## Inputs
PRD §6.8 lines 476-506, TASK-0004 (lane mechanism), TASK-0009 (tier source of truth),
`decisions.md` DEC-01.

## Allowed output
Same lane-related files as TASK-0004, once DEC-01 is resolved and TASK-0004 is done; tests.

## Acceptance criteria
1. Second-lane selection is rejected below Supporter (100 XP) — `FORBIDDEN` or `FEATURE_DISABLED`
   per the existing error taxonomy, not a silent allow (PRD line 480, 502).
2. The same lane cannot be selected twice in one fandom (PRD line 483, 503) — tested directly.
3. Reaching exactly 100 XP unlocks the privilege the instant the award is confirmed (PRD line 504,
   570) — tested as a boundary case shared with TASK-0009's xp=100 test.
4. Edge cases: a fan who later drops below 100 XP via an admin correction (TASK-0013) keeps an
   already-selected second lane (PRD does not state retroactive revocation — do not invent one);
   a fan attempting to select a third lane → rejected (PRD's model is exactly two: one plus one
   optional second, never stated as extensible — do not assume a third tier of lanes exists).

## Test expectations
Below-threshold-rejected test; exact-threshold-unlock test; duplicate-lane-rejected test;
post-unlock-then-XP-correction-does-not-revoke test.

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`.

## Blockers
DEC-01 (lane set), TASK-0004, TASK-0009.

## Definition of done
Second-lane unlock implemented and tested per acceptance criteria, reviewed, owner has reported
test results.
