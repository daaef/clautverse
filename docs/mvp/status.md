---
title: MVP status
---

# Status

## Evidence basis (read this before trusting anything else in this file)

Everything in this planning set was produced from: a full read of `docs/mvp/planning-brief.md`;
the full PRD (`Clautverse Ecosystem PRD.md`, all 4467 lines read in this session, across both the
fan-side PRD, lines 1–2141, and the Star-side PRD, lines 2142–4467, including Subscription and
Plan Management §6, Star Dashboard §7, Content Management §8, Drops §9, Originals §10, Fandom
Management §11, Missions §12, Live Sessions §13, Watch-Party Scheduling §14, Analytics §15,
Notifications §16, Settings §17, Rising/Established Star differences §18, Global UI States §19,
Super Admin Dependencies §20, Technical Architecture §21, Proposed Data Model §22, API/Integration
Requirements §23, Security/Privacy/Compliance §24, Performance/Accessibility §25, Analytics and
Product Measurement §26, MVP Scope §27, QA Plan §28, Definition of Done §29, Product Decisions
§30, and Final Product Vision §31 — none of this was skipped); `README.md` (31 lines, full);
`package.json` (42 lines, full); `server/db/schema/app.ts` (320 lines, full, the only application
source-code file read this session); AGENTS.md and the global CLAUDE.md (full, as provided in the
session's standing instructions).

Additionally read, as supplementary, non-required background: the implementation guide's
plans/operations page (full) and endpoint-index page (full), and one guide domain page
(`3.communities.md`, partial, 45 of 96 lines). These guide pages are **the project's own
documentation**, not source code.

**Scope of this claim:** this is an account of what the spec-writing investigation behind this
document set read. It is not a claim about what anyone else on the project — the lead, a
developer, or a future role — has or has not read or examined. In particular, it does not assert
that no route source file under `server/api/**` exists, is tested, or has been read by anyone;
it states only that this specification investigation did not read that directory and therefore
does not cite it as evidence. Where a task brief needs route-level ground truth, that reading is
explicitly assigned to TASK-0001 (or the specific feature task), not asserted or pre-empted here.
No `pnpm` command, test, or build was run by this investigation. Every claim in this document set
that cites a `guide/content/**` page is labelled a "documentation claim" and is explicitly
distinguished from a citation to `server/db/schema/app.ts`, which is source code this
investigation read directly. Guide "implemented" badges and "Proof: `tests/e2e/...`" notes are
documentation claims, not evidence this investigation gathered, and are never restated here as
confirmed facts.

## Decisions (see `decisions.md` for full detail)

| ID | Topic | Status |
|---|---|---|
| DEC-01 | Canonical lane names | RESOLVED — §6.8 set (Creator, Mutual); lane-changes sub-question open, non-blocking |
| DEC-02 | XP amounts/caps/reversals | RESOLVED for pilot — Stars set 5–100/mission, missions only source, no caps |
| DEC-03 | Removal/rejoin/appeal counting | RESOLVED — first removal 30-day block, second permanent; counting/appeal mechanics to be spec'd in TASK-0012-A |
| DEC-04 | Original badge retirement vs. rejoin-preserves-position | RESOLVED — voluntary leave retires the number (PRD rule), slot stays consumed |
| DEC-05 | Founding Pledge meaning | OUT OF PILOT SCOPE |
| DEC-06 | Content formats / publishing authority / privacy-join rules | RESOLVED — current behaviour: public communities, open join, existing audiences |
| DEC-07 | Supported platforms / pilot cohort | RESOLVED — 1 Star, 1 community, ~4–6 weeks |
| DEC-08 | Admin security requirements | RESOLVED — accept current (super_admin gate + audit); MFA deferred |
| DEC-09 | Star provisioning for pilot | RESOLVED — existing application→admin-accept flow |
| DEC-10 | Notification scope | RESOLVED — existing set + membership.removed |
| DEC-11 | Negative XP balance / demotion policy | RESOLVED — negative-producing corrections rejected; tier derived from balance |
| DEC-12 | Mission lifecycle policy (proof validation, deadlines, late/retry review rules) | RESOLVED — adopt tested code as policy: no late submissions, final reviews, proof per type |

All pilot-blocking decisions are now RESOLVED by owner ruling except DEC-05 (out of scope).
Reporter-ID visibility: resolved as an additional ruling in `decisions.md`.

## Tasks

| ID | Title | Stage | Role | Status | Blocked by |
|---|---|---|---|---|---|
| TASK-0001 | Stage 0 gap assessment | 0 | lead-coordinated: researcher + spec-writer, reviewer, owner approval (no gate-reviewer — not a phase gate) | NOT STARTED | none |
| TASK-0002 | Identity carryover review | 1 | secure-implementer (review), reviewer | NOT STARTED | TASK-0001 |
| TASK-0003 | Approved Star access for pilot | 1 | secure-implementer | NOT STARTED | DEC-09, TASK-0001 |
| TASK-0004 | Fandom browse/join with one lane | 1 | secure-implementer | NOT STARTED | DEC-01, DEC-06, TASK-0001 |
| TASK-0005 | Limited content publishing & fan interactions | 1 | implementer | NOT STARTED | DEC-06, TASK-0001 |
| TASK-0006 | Minimum admin controls (Stage 1) | 1 | secure-implementer | NOT STARTED | DEC-08, TASK-0001 |
| TASK-0007 (gate) | Stage 1 gate review | 1 | gate-reviewer | NOT STARTED | TASK-0002..0006, **TASK-0012-A**, **TASK-0015-A** |
| TASK-0008 | Fandom-specific XP/history & duplicate protection | 2 | secure-implementer | NOT STARTED | DEC-02, TASK-0007 |
| TASK-0009 | Tier calculation (`xp >= 0` only — DEC-11 blocks negative/demotion) | 2 | secure-implementer | NOT STARTED | TASK-0008, DEC-11 (hard block on negative/demotion scope) |
| TASK-0010 | Optional second lane at Supporter | 2 | secure-implementer | NOT STARTED | DEC-01, TASK-0009 |
| TASK-0011 | Essential in-app notifications | 2 | implementer | NOT STARTED | DEC-10, TASK-0007 |
| TASK-0012-A | Reporting/blocking/voluntary leave/removal restrictions — **mandatory Stage 1 safety baseline** | 1 | secure-implementer | NOT STARTED — blocked | DEC-03 (removal-restriction piece; must have a recorded disposition before TASK-0007 can pass), TASK-0001 |
| TASK-0012-B | Atomic XP/tier cleanup on leave/removal — Stage 2 extension | 2 | secure-implementer | NOT STARTED | TASK-0012-A, TASK-0008, TASK-0009 |
| TASK-0013 | Auditable admin reward correction (negative/demoting corrections unsupported/deferred — DEC-11, no contract chosen) | 2 | secure-implementer | NOT STARTED | DEC-02, DEC-11 (hard block — no endpoint contract/status chosen for the deferred case), TASK-0008 |
| TASK-0014 | Conditional Originals (numbered recognition) | pilot-conditional | spec-writer then secure-implementer | BLOCKED — options only | DEC-04 |
| TASK-0015-A | Stage 1 measurement: join/leave/report (data-access/auth half is secure-implementer, test-first) | 1 | secure-implementer (data/auth) + designer/implementer (presentation) | NOT STARTED | TASK-0004, TASK-0012-A (**not** TASK-0008, **not** TASK-0007 — avoids a circular gate dependency) |
| TASK-0015-B | Stage 2 measurement: missions/XP/recognition | 2 | secure-implementer (data/auth) + designer/implementer (presentation) | NOT STARTED | TASK-0019, TASK-0008, TASK-0015-A |
| TASK-0016 (gate) | Stage 2 gate review | 2 | gate-reviewer | NOT STARTED | TASK-0008..0011, **TASK-0012-B**, TASK-0013, TASK-0014 (disposition recorded), **TASK-0019**, **TASK-0015-B** |
| TASK-0017 | Stage 3 — collect measured-operation evidence; **pilot operation is OWNER ONLY, never the lead or any role** | 3 | secure-implementer (evidence tooling) + designer (presentation); owner alone operates the pilot and decides cohort/thresholds | NOT STARTED — blocked | DEC-07, TASK-0015-A, TASK-0015-B, TASK-0016, owner's own launch act |
| TASK-0018 (gate) | Stage 3 gate / release-readiness review | 3 | gate-reviewer | NOT STARTED | TASK-0017 |
| TASK-0019 | Mission lifecycle — creation, submission, owner review, atomic award (added: no prior task covered missions) | 2 | secure-implementer | NOT STARTED — blocked | DEC-12 (hard block on deadline/review-reversal/proof-shape scope), TASK-0008, TASK-0001 |

"NOT STARTED" means no file under this plan's allowlist has been written for that task. "BLOCKED
— options only" means the task may produce a decision paper for the owner but may not write
implementation code or schema. TASK-0012-A/B and TASK-0015-A/B are each two sub-deliverables of one
task brief (`tasks/0012-reporting-blocking-leaving.md`, `tasks/0015-operational-measurement.md`),
split because they gate at different stages or would otherwise create a circular dependency; they
are not independent task files. 19 task IDs total (0001–0019), held in 19 files.

## Frozen behaviour: NOT ESTABLISHED

No frozen behaviour has been established **by this planning session** — this is distinct from, and
does not override, the global rule that any behaviour the owner has separately confirmed as
working stays protected from change regardless of whether any phase gate has passed. Two separate
protections apply, and neither substitutes for the other:
1. **AGENTS.md rule 4 ("Frozen means frozen")** applies once a phase passes its gate; no phase gate
   has passed yet (see "Tasks" table above — TASK-0001 has not started), so this specific
   gate-based protection does not yet apply to anything.
2. **The brief's own, separate rule** — "Existing behaviour is not assumed verified or frozen; any
   behaviour the owner has confirmed working requires agreement before changes" — means that any
   behaviour the owner has personally confirmed as working is already protected, with or without a
   passed gate. This plan has not been told of any such owner-confirmed behaviour, so none is
   listed here, but the absence of a gate must never be read as license to change something the
   owner has actually confirmed.

Any route, schema column, or behaviour the guide labels "implemented" remains an unverified
documentation claim (see "Evidence basis") until TASK-0001 reads the actual source and the owner
reports a real test result; it must not be treated as frozen, stable, or safe-to-build-on in the
meantime — and it must equally not be treated as safe to change if the owner separately confirms
it is real, working behaviour they rely on.

## What this session did NOT do (reiterated)

- Did not run `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e`, or any other command.
- Did not verify that any route the guide calls "implemented" actually passes its cited test.
- This specification investigation did not itself read any file under `server/api/**` — see
  "Evidence basis" for the exact scope of that statement; it is not a claim that no such file
  exists or that no one else has read it.
- Did not change any application, schema, test, or configuration file.
- Did not decide any item in `decisions.md`.
- Did not invent or approve any pilot cohort size, launch threshold, notification event list, or
  release-readiness criterion — those remain for the owner (see TASK-0017, TASK-0018).
