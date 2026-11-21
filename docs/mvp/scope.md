---
title: MVP scope, pipeline and formulas
---

# Scope, pipeline and formulas

This is what the free pilot includes and excludes, per the owner's direction in
`docs/mvp/planning-brief.md`, reconciled against the PRD and the existing backend. It does not
re-decide anything in `decisions.md`.

## Pilot principle

Free pilot. No money, no purchased progress, anywhere in Stage 0–3. This is a **deviation from
the full PRD** (which specifies paid XP Boosts, paid badge skins, and a Founding Pledge economy)
and requires explicit owner release acceptance before any paid feature is reintroduced (brief:
"This is a pilot deviation from full PRD, requiring explicit release acceptance").

## Stage 0 — Reconcile rules and assess existing backend

Not a build stage. Produces an evidence matrix (present code + tests vs. owner-confirmed
behaviour vs. PRD-only aspiration) and a rules reconciliation against `decisions.md`. See
`tasks/0001-stage0-gap-assessment.md`. **This planning document is not that assessment** — no
route, test, or migration was executed in this session.

## Stage 1 — Community foundation

In scope (owner direction, brief):
- Identity (sign up, sign in, session, verified email — PRD §6.1; existing routes claimed at
  `AUTH-01..08`, `guide/content/99.api-reference/0.index.md:14-22`).
- Approved Star access (DEC-09 governs pilot-specific eligibility; mechanics possibly already
  built per `TAL-*`/`ADM-0x` routes, not yet re-verified).
- Fandom information, browse and join with **one lane** (DEC-01 blocks the lane name/enum; one
  lane only — no second lane until Stage 2's Supporter unlock).
- Limited content publishing and fan interactions (PRD §6.6; `DROP-*`, `FEED-*` routes claimed
  implemented).
- **Reporting/blocking/voluntary leave with access revocation and removal restrictions — TASK-0012-A,
  a mandatory Stage 1 safety baseline, not optional machinery that can slip to a later stage.** PRD
  §6.18, §12; `RPT-01`, `COM-04` claimed implemented. DEC-03 (removal/rejoin counting) blocks the
  removal-restriction piece specifically: per the lead's finding, an unresolved decision blocks the
  *rollout* that depends on it, it does not merely leave an optional refinement unbuilt. The Stage
  1 gate (TASK-0007) requires DEC-03 to have a recorded disposition — resolved, or an explicit
  owner decision not to use admin removal during the pilot — before it can pass; it does not
  require DEC-04 (Original badge retirement), which is excluded from this safety baseline entirely
  and deferred under its own terms (see DEC-04).
- Minimum admin controls (DEC-08 — do not assume more exists than is found).

Out of Stage 1: second lane, missions/XP, Originals-as-numbered-recognition, notifications beyond
what identity/auth already requires (e.g. verification email), and TASK-0012-B's atomic XP/tier
cleanup extension (depends on the Stage 2 XP system, which does not exist yet in Stage 1).

## Stage 2 — Participation loop

In scope (owner direction, brief):
- **Star-created missions, submissions, and owner review — TASK-0019, the dedicated mission
  lifecycle task** (a prior review found this plan had no such task despite missions being core
  Stage 2 scope). PRD §6.11, §12; `MIS-01,02,03,06-10` claimed implemented; `MIS-04/05`
  (fan-proposed-mission approve/reject) listed `deferred` in the guide
  (`guide/content/99.api-reference/0.index.md:57-58`), consistent with deferring General-tier fan
  mission proposals. **DEC-12 blocks TASK-0019's deadline/review-reversal/proof-shape behaviour.**
- Fandom-specific XP/history and duplicate protection (PRD §6.9, §13.4; DEC-02 blocks the actual
  XP amounts/caps; duplicate protection via the unique XP ledger key already exists in schema,
  `server/db/schema/app.ts:277` `xp_transaction_source_uq`).
- Tier calculations (see "Tier formula" below — not open).
- Optional second lane at Supporter (DEC-01 blocks lane identity; threshold itself is 100 XP, not
  open — PRD §6.8 line 480).
- Essential in-app notifications (DEC-10 blocks exact event set).
- Auditable admin reward correction (PRD §13.4 "every important tier, reward... event is
  auditable"; `ADM-17 POST /api/admin/xp-adjustments` and `xpTransaction.sourceType =
  'admin_adjustment'` already modelled, `server/db/schema/app.ts:271`) — **DEC-11 is a hard block
  on any negative-balance or demotion behaviour within this correction path; the task ships only a
  rejection of such corrections, never a resolution of DEC-11.**
- **TASK-0012-B: atomic XP/tier cleanup folded into leave/removal, extending TASK-0012-A once the
  XP system (TASK-0008/0009) exists** — this is the Stage 2 completion of the Stage 1 safety
  baseline, not a separate feature.

Out of Stage 2: General-tier fan mission proposals, hostile fan flags, Royal/Diamond skins,
Superfan public featuring, Founding Pledge, paid XP Boost — all deferred per owner direction.

## Stage 3 — Operate and measure

Owner direction: "operate and measure repeated participation, Star contribution and review
effort, safety workload and disputes. Instrument necessary measurement during delivery, not after
pilot begins." Every Stage 1/2 task's acceptance criteria must include what gets measured and how,
not a separate pass bolted on afterward. Instrumentation is split to avoid a circular gate
dependency: **TASK-0015-A** (Stage 1: join/leave/report measurement, required by the Stage 1 gate,
depends only on TASK-0004/TASK-0012-A) and **TASK-0015-B** (Stage 2: mission/XP measurement,
depends on TASK-0019/TASK-0008, required by the Stage 2 gate). Actually running the pilot and
collecting real evidence over an **owner-set, owner-operated** period is
`tasks/0017-stage3-operate-pilot.md` — **operating the pilot is OWNER-ONLY authority; the lead
coordinates the surrounding documentation/tooling work but has no launch authority.**
Independently reviewing that evidence is `tasks/0018-stage3-gate-review.md`. None of these tasks
sets the pilot cohort, start date, run length, or any numerical success threshold — that is DEC-07,
left to the owner.

Minimum measurement surface for the pilot (derived from the owner's three named concerns):
1. **Repeated participation** — distinct active days per fan per fandom per week; mission
   completion rate (PRD §16 already proposes this KPI, line 1918).
2. **Star contribution and review effort** — missions created per Star; mission-completion review
   latency (submit → approve/reject timestamp delta, both already columns on
   `mission_completion`: `created_at`, `reviewed_at`, `server/db/schema/app.ts:258-259`).
3. **Safety workload and disputes** — open report count and report resolution time (PRD §16 line
   1929 proposes this KPI; `report.created_at`/`decided_at` already columns,
   `server/db/schema/app.ts:218-219`).

Privacy: PRD §13.7 requires excluding sensitive data from analytics payloads (line 1809); no
analytics event is defined in this plan that captures report content, evidence links, or
moderation internal notes.

## Formulas

### Tier formula (owner-approved, not open)

Given a fandom membership's authoritative XP balance `xp` (PRD §6.9, lines 518-558, 564):

```
tier(xp) =
  Lurker     if 0   <= xp < 100
  Supporter  if 100 <= xp < 500
  Soldier    if 500 <= xp < 2000
  General    if 2000 <= xp < 5000
  Superfan   if xp >= 5000
```

Thresholds are inclusive at the lower bound (PRD line 565-568: "Supporter unlocks **at** 100 XP").
This formula is defined only for `xp >= 0`. What happens for `xp < 0` (reachable only via an admin
correction) is DEC-11, an open decision blocker — see worked example 3 below. This plan does not
extend the formula below zero.

**Worked example 1 (ordinary case):** a fan has 340 XP in a fandom. `100 <= 340 < 500` →
Supporter. The fan does not yet have Royal-skin eligibility (that unlocks at Soldier, 500 XP,
PRD line 542) — but Royal itself is deferred for the pilot regardless (`scope.md` "Deferred
pipeline").

**Worked example 2 (exact threshold):** a fan's XP balance is updated by a mission award from 85
to 100. At exactly 100, `tier(100)` = Supporter (lower bound inclusive) and the second-lane
privilege unlocks the instant this balance is confirmed (PRD line 570: "update automatically once
a qualifying XP award is confirmed"). This is the boundary case every tier-crossing test must
cover (PRD §18, line 1978).

**Worked example 3 (edge case — negative balance / demotion, NOT a formula this plan supplies):**
an admin reward correction (`ADM-17`) issues a `-150` adjustment against a fan whose balance was
`80` (still Lurker). What the resulting balance and tier should be is **DEC-11, an open decision
blocker** (`decisions.md`) — this plan does not assume a floor of zero, does not assume automatic
demotion from a previously-earned tier, and does not assume any previously-granted privilege is
revoked. No task in this plan (TASK-0009, TASK-0013) may implement negative-balance or demotion
behaviour until the owner rules on DEC-11; until then, any correction that would produce a
negative or sub-threshold balance must be rejected rather than silently applied with an invented
rule.

### XP Boost (PRD feature, deferred — dependency summary only, no calculation policy here)

XP Boost is in the deferred pipeline (see table below). This plan does **not** specify a
multiplier formula, a stacking rule, or a pending-event-at-expiry policy — PRD §6.11 itself states
the pending-event-at-expiry case is unresolved ("the backend must use the recorded qualifying
event time and an explicitly defined reward policy", PRD line 746) and §19 lists boost stacking as
an open product decision (PRD line 2042-2044). Any future reactivation of XP Boost requires the
owner to resolve those PRD-acknowledged open questions first; no task in this plan builds or
assumes a calculation for it.

## Deferred pipeline (owner direction, brief — tracked with prerequisites, not built)

| Deferred item | Prerequisite before any implementation task is written | PRD reference |
|---|---|---|
| Payments / paid Star plans | Billing provider, pricing, entitlement model chosen by owner | PRD §19 "Monetization and billing" |
| Badge skin purchases (Royal, Diamond, Gold Glow, Crystal, Flame) | Prices confirmed; account-wide vs. fandom-scoped ownership decided | PRD §6.10, §19 "Badge skin prices" |
| XP Boost | Stacking rule, pending-event-at-expiry policy (PRD line 811, 746) | PRD §6.11 |
| In-app streaming / synchronised playback | Streaming integration selected; not in current scope boundary (PRD §1.4 "Scope Boundaries" excludes "Features that require third-party streaming... until the integrations are selected") | PRD Star-side §1.4 |
| Referrals / rewarded growth | Referral attribution and qualification rules (PRD §19) | PRD §6 "Invitations" |
| Competitive leaderboards | None named as blocking by owner; simply not in pilot build order | PRD §6.7, §6.9 |
| Advanced analytics / recommendations | Privacy-reviewed third-party selection if added (guide: `guide/content/99.api-reference/8.discover-plans.md:32`) | PRD §9, §13.7 |
| Fan-proposed missions / special hostile-fan flagging | General tier privileges deferred by owner direction regardless of XP; DEC-02, DEC-09 | PRD §6.9 "General tier privileges" |
| Founding Pledge Stars / Founding badge | Meaning undefined — DEC-05 | PRD §19 "Founding Pledge Stars" |
| Original numbered early-member recognition | DEC-04 (allocation/leave/rejoin conflict) must be resolved first; must not block pilot launch | PRD §6.18, §10 |
| Star subscription plans (Freemium/Starter/Growth/Pro) | Prices, intervals, feature entitlements per plan, billing provider — all explicitly unconfirmed in the PRD itself (PRD §6.2 "These are plan positions, not a final entitlement matrix", line 2548; §30 "Plans and Monetization") | PRD Star-side §6 |
| Live sessions (in-app streaming or external integration) | Streaming technology and replay policy undecided (PRD §13.5 "Replay availability, storage duration, downloads, and visibility are product decisions to confirm", line 3220; explicitly excluded from current scope boundary at §1.4) | PRD Star-side §13 |
| Established Star claim flow | Explicitly excluded by the PRD itself, not merely deferred by the owner: "An Established Star claim flow" is listed under "outside the defined scope unless separately approved" (PRD Star-side §1.4, line 2206) | PRD Star-side §1.4, §2.2 |
| Star team member / shared-account permissions | "A proposed capability" only; "must be governed by explicit roles and permissions rather than shared account credentials" if ever added (PRD line 2229) | PRD Star-side §2.1 |

Future monetisation is tracked here with prerequisites and open decisions only — no checkout
route, price, or provider is specified by this plan (brief: "not speculative tables, checkout
routes or providers").

## Distinctness rule (binding on every task)

Per the brief: "Keep membership, authorisation, earned recognition and future purchase
entitlements conceptually distinct. Backend release controls do not replace resource permission
checks." Concretely:
- A fan's **membership status** (`active|left|removed`) is not the same as their **role**
  (`fan|talent|admin`, `guide/content/99.api-reference/0.index.md:185`), which is not the same as
  their **tier** (Lurker..Superfan, XP-derived), which is not the same as any **future paid
  entitlement** (deferred). No task may use one as a stand-in for another.
- A feature flag that disables a route for the pilot (`FEATURE_DISABLED`,
  `guide/content/99.api-reference/0.index.md:159`) is a release control, not a permission check;
  every route must still independently enforce who may call it even while flagged on.
