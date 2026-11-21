---
id: TASK-0008
title: Fandom-specific XP/history and duplicate protection
stage: 2
status: NOT STARTED — blocked
---

# TASK-0008 — XP/history and duplicate protection

## Purpose
Implement the owner-approved pieces of PRD §6.9/§6.11 XP tracking that do not depend on the
still-open XP amount/cap rule (DEC-02): per-fandom XP balance read, transaction history, and
idempotent award recording.

## Scope
In: `XP-01`, `XP-02` read routes; `grantXp()`-style internal award function keyed to
`(userId, sourceType, sourceId)` uniqueness (`server/db/schema/app.ts:277`, already modelled).
Out: deciding what XP amount any mission or activity grants (DEC-02) — this task may implement the
*mechanism*, never a specific number it invented.

## Role ownership
secure-implementer (XP/scoring is explicitly named security-sensitive in AGENTS.md). test-author
first. reviewer after.

## Inputs
PRD §6.9 (lines 508-616), §13.4 (lines 1717-1732), `decisions.md` DEC-02,
`server/db/schema/app.ts:267-279` (`xpTransaction`).

## Allowed output
**Illustrative only, not a confirmed file allowlist:** `server/api/xp/**` is guessed from the
endpoint names (`XP-01`, `XP-02`) in the guide index, not read directly in this session. The
actual file(s), including wherever the internal award function lives, are located by TASK-0001 and
approved by the owner before this task changes anything; plus tests. No change to `appSetting`
XP-rule values without an owner-approved number.

## Acceptance criteria
1. A second award attempt with the same `(userId, sourceType, sourceId)` is a no-op inside the
   same transaction — PRD §6.11 "prevent repeated event processing from awarding the same base
   reward twice" (line 744), tested with a literal duplicate-insert test, not just a unit check of
   the SQL constraint.
2. XP balance for a fandom membership is `SUM(amount)` over that membership's transactions only —
   never summed across fandoms (PRD line 1721, "XP balances are maintained separately for every
   fandom membership").
3. On account erasure, `xpTransaction.userId` is set null (already modelled,
   `server/db/schema/app.ts:269` comment) and historical rows are never edited or deleted — tested
   by erasing a user with existing XP rows and confirming row count is unchanged, only `userId`
   nulled.
4. Edge cases: a balance query for a membership with zero transactions returns 0, not an error or
   null; a transaction history page request with an invalid cursor →
   `VALIDATION_FAILED details.fields.cursor` (`guide/content/99.api-reference/0.index.md:173`); a
   very large number of transactions (thousands) paginates via keyset, never `OFFSET`
   (`guide/content/99.api-reference/0.index.md:172`), tested by seeding a large transaction count
   and checking no page duplicates or skips.

## Test expectations
Duplicate-award idempotency test; cross-fandom isolation test; erasure-nulls-not-deletes test;
large-history pagination test; concurrent duplicate-award race test (two simultaneous requests
with the same source key — exactly one row results).

## Independent reviewer
reviewer.

## Owner evidence required
Owner runs `pnpm test:unit`, `pnpm test:e2e`.

## Blockers
DEC-02 (blocks wiring any real mission to a real XP amount — the mechanism itself may still be
built and tested with placeholder/test-only amounts the owner has not endorsed as production
values). TASK-0007 (Stage 1 gate passed).

## Definition of done
Mechanism built and tested per acceptance criteria using non-production placeholder amounts only
until DEC-02 resolves; reviewed; owner has reported test results.
