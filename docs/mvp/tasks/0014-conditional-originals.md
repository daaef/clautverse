---
id: TASK-0014
title: Conditional Originals — numbered early-member recognition
stage: pilot-conditional, not in baseline
status: BLOCKED — options paper only
---

# TASK-0014 — Conditional Originals (numbered recognition)

## Purpose
Per owner direction, numbered early-member recognition ("Original badge") is conditional on
resolving the allocation/leave/rejoin rules (DEC-04) and must not block the pilot. This task's
only currently authorised output is a decision paper for the owner — not implementation.

## Scope
In: writing a short options paper that lays out, side by side: (a) the PRD's stated rule
(permanent retirement on any leave, never reassigned, PRD §6.18), (b) what the project's own
documentation *says* the current join/leave behaviour is (rejoin preserves position; only
admin-removal retires it, `guide/content/99.api-reference/3.communities.md:41` — a documentation
claim this task must re-confirm against the actual route source before presenting it as fact, not
merely restate it), and (c) a third option if the owner wants neither as-is. Out: any schema
change, any route change, any UI work, any pilot launch with this feature advertised as available.

## Role ownership
spec-writer writes the options paper. reviewer checks it reflects the two real, cited positions
accurately (not a strawman of either). No implementer or secure-implementer role is engaged until
the owner picks an option and a new task number is opened for it.

## Inputs
`decisions.md` DEC-04 in full, `server/db/schema/app.ts:74-102` (`community.originalsAssigned`,
`membership.originalPosition`), `guide/content/99.api-reference/3.communities.md:31-43`,
PRD §6.18 (lines 1050-1101), PRD §10 (lines 2869-2924, the separate Star-published-content meaning
of "Originals" — the paper must keep these two meanings visually distinct, not conflate them).

## Allowed output
`docs/mvp/tasks/0014-originals-options.md` (planned deliverable). No other file.

## Acceptance criteria
1. The paper states the documentation's description of current behaviour as a direct quote with
   citation, clearly labelled as a documentation claim unless this task has independently read the
   join/leave route source to confirm it — in which case the paper cites the route file:line
   directly and the documentation citation becomes secondary.
2. The paper states the PRD's literal requirement as a direct quote with citation.
3. The paper does not recommend an option — it is decision support, not a decision. (If the owner
   wants a recommendation, that must be a separate, explicitly requested step, not folded in here.)
4. The paper explicitly flags that the Star-side "Originals" (published content, PRD §10) is a
   different concept from the numbered badge and states the `drop.audience = 'originals_only'`
   schema value (`server/db/schema/app.ts:170`) as the one piece of code that currently references
   the word "originals" outside the numbered-badge system, without claiming they are linked unless
   TASK-0005 or TASK-0001 found an actual code-level link.

## Test expectations
None — this is a planning document, not code.

## Independent reviewer
reviewer.

## Owner evidence required
None (no command). The owner's written decision becomes a new DEC entry and, if applicable, a new
numbered task.

## Blockers
DEC-04 is exactly what this paper exists to help resolve — it is not itself blocked by DEC-04, but
every task beyond it (schema/route changes) is blocked until the owner decides.

## Definition of done
Options paper written, reviewed for accuracy against both cited sources, delivered to the owner.
No code, schema, or UI change occurs under this task number.
