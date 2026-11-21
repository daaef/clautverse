---
title: MVP decision register
---

# Decision register

Every row is a question the PRD or the owner's direction leaves open, or a conflict between the
PRD and the existing backend. Each has a stable ID. "Blocks" lists task IDs (see `tasks/`) that
cannot reach their acceptance criteria until the decision is made. A decision being "approved
direction" (owner's pilot scope) is **not** the same as the underlying open rule being resolved —
per the brief: "Approved direction does not settle open policy decisions."

Status values: `OPEN` (no owner ruling yet), `DIRECTION SET` (owner has constrained the pilot
around it without resolving the underlying rule), `OUT OF PILOT SCOPE` (deferred, not decided).

**Citation discipline used below:** a citation to `server/db/schema/app.ts:<line>` means this
session read that exact source code. A citation to `guide/content/99.api-reference/**` is the
project's own **documentation**, describing route behaviour this session did not independently
read in `server/api/**` — it is marked "documentation claim" and must not be treated as verified
code behaviour until a future task (TASK-0001 or the specific feature task) reads the actual route
source.

## DEC-01 — Canonical lane names

**Conflict:** PRD §6.8 ("Fandom lanes") names the six lanes Rider, Fandom Builder, Builder,
Analyst, Creator, Mutual. PRD §8 Journey C lists them as "Rider, Fandom Builder, Builder, Analyst,
Maker, and Connector" — three names differ (Creator/Maker, Mutual/Connector), and Journey C omits
one and mislabels the count as six while naming six different-partly items.
**Evidence:** PRD lines 428–464 (§6.8 lane list with taglines) vs. PRD line 1339 (§8 Journey C).
**Schema evidence (code, verified):** `membership.lane` exists as a nullable free-text column with
the comment "reserved: lanes not defined yet" (`server/db/schema/app.ts:95`) — this is read
directly from the schema source, not from documentation.
**Documentation claim (not independently verified against route code):** no `LANE-*` endpoint ID
appears in the guide's endpoint index (`guide/content/99.api-reference/0.index.md:1-119`), and the
guide's own object-shape reference states lane is "reserved nullable DB column, not in API until
defined" (`guide/content/99.api-reference/0.index.md:216`). This session did not read
`server/api/**` to confirm no lane-selection route exists; TASK-0001 must do so before this claim
is treated as fact.
**Status:** RESOLVED (owner ruling) — canonical lane set is the PRD §6.8 requirements-section
list: **Rider, Fandom Builder, Builder, Analyst, Creator, Mutual**. Journey C's
Maker/Connector naming is treated as narrative drift. `membership.lane` is free text, so the
canonical set is enforced by validation in code. **Blocks cleared for:** TASK-0004 (one-lane
selection at join), TASK-0010 (second lane at Supporter).
**Still open within this decision:** whether lanes can be changed after selection (PRD §19
"Lane changes" remains undecided — not blocking the pilot, revisit later).

## DEC-02 — XP qualifying activities, amounts, caps, reversals, demotion, unlock effects

**Evidence:** PRD §19 "XP eligibility" (line 2038-2040: "Define the base XP for every mission and
activity, daily caps, and anti-abuse rules") is listed as an open product decision in the PRD
itself. The existing schema has an `appSetting` row shape described as `xp_rules = {
missionXpMin, missionXpMax }` (`server/db/schema/app.ts:225-226` comment) — a range exists in the
data model but no owner-approved values were read anywhere in this session.
**Status:** RESOLVED for the pilot (owner ruling) — Stars set each mission's XP within the
existing `missionXpMin`/`missionXpMax` range (runtime default 5–100); **missions are the only
XP source in the pilot**; no daily caps or additional anti-abuse rules for now (revisit if
abuse appears). Demotion/reversal detail remains under DEC-11. **Blocks cleared for:**
TASK-0008, TASK-0009, TASK-0013.
**Formula note:** whatever the per-mission XP amount turns out to be, the tier thresholds
themselves are **not** open — see `scope.md` "Tier thresholds" (owner-approved, PRD §6.9).

## DEC-03 — Membership departure/rejoin/removal/appeal counting and policy

**Evidence:** PRD §6.19 defines a first-removal 30-day rejoin block and a second-removal permanent
ban (lines 1127-1130), but PRD §19 "Fandom removal" (lines 2070-2072) still asks "Define what
counts as a first or second removal, how appeals affect the count, and how the 30-day restriction
is calculated" — the PRD states the rule and simultaneously flags it unresolved.
**Schema evidence (code, verified):** `membership.status` enum is `active | left | removed` only
(`server/db/schema/app.ts:93`); there is no removal-count column, no cooldown-until timestamp, and
no `FandomRemoval` table in `app.ts` (the PRD's own data-entity list at line 1710 names one that
this session did not find in the schema file).
**Status:** RESOLVED (owner ruling) — implement the PRD rule: **first removal = 30-day rejoin
block, second removal = permanent ban** for that fandom. Requires a removal-count and
blocked-until column or a `FandomRemoval` table (additive change per the evidence matrix's
migration analysis) — and it changes the meaning of existing `removed` rows, which becomes a
data/semantic migration decision when the schema change lands (flagged non-rollback-safe in
`evidence-matrix.md` §4–5).
**Remaining sub-questions for implementation spec (not new owner decisions, to be written by
spec-writer from the PRD):** exact counting semantics (what counts as first vs second), appeal
effect on count, and how the 30-day window is calculated — PRD §19 lines 2070-2072 names these;
TASK-0012-A's spec must state them explicitly before code.
**Blocks cleared for:** TASK-0004, TASK-0012-A; TASK-0007's recorded-disposition requirement
is satisfied by this ruling.

## DEC-04 — Original badge retirement vs. the project's documented rejoin behaviour

**Conflict:** PRD §6.18 requires that leaving a fandom "permanently retires" an Original badge
number so it is "never re-issued" (lines 1050-1052, 1068, 1082, 1098, 1729).
**Documentation claim (not independently verified against route code):** the project's own
implementation guide describes the opposite behaviour on voluntary leave: "Rejoin after leave:
reactivates the same row and **keeps** the original position... Users `removed` by an admin lose
their position (retired, not reassigned)" (`guide/content/99.api-reference/3.communities.md:41`,
citing its own "decision 6"). This is a quote from the project's documentation page, not from a
join/leave route this session read — it describes what the guide *says* the code does, not
observed code behaviour. TASK-0001 must read the actual join/leave route source before this claim
is used as the basis for any implementation decision.
**Schema evidence (code, verified):** `community.originalsAssigned` row-locked counter
(`server/db/schema/app.ts:85`) and `membership.originalPosition` with a uniqueness constraint per
community (`server/db/schema/app.ts:96,101`) are real columns this session read directly — their
existence is fact; what the route logic actually does with them on rejoin is, per above, only a
documentation claim until TASK-0001 confirms it.
**Also conflated in PRD:** the Star-side PRD additionally describes Originals as Star-published
content ("Originals is a known part of the Star-side product", PRD line 2871, §10), with its own
proposed `Original` content entity (PRD line 2884, §22 "Proposed Data Model": "Original | Original
content details | Content ID, metadata, audience, status") — a *second*, different meaning of
"Original" from the fan-side numbered early-member badge. The PRD itself lists "Meaning and rules
of the first 100 Originals" as an unresolved product decision (PRD §30, line 4408, "Content and
Originals"), confirming this is not settled anywhere in the PRD, not only a conflict this plan
found. These are not the same concept and must not be assumed interchangeable.
**Status:** RESOLVED (owner ruling) — **voluntary leave permanently retires the Originals
number**, matching the PRD §6.18 rule and the existing admin-removal behaviour (e2e confirms
`remove_member` already retires positions; voluntary leave currently preserves them — the
behaviour change is scoped to the leave path). The number remains consumed forever and is never
reissued. Implementation detail for TASK-0012-A/TASK-0014: leaving must clear `originalPosition`
(or mark it retired) while the slot stays counted against the 100-cap; existing `left` rows with
preserved positions become a data-migration question when the change lands (dev DB, low stakes,
flagged non-rollback-safe in evidence-matrix §4–5).
**Blocks cleared for:** TASK-0014 may now proceed to implementation spec, not just an options
paper. DEC-04 never blocked TASK-0012-A (its retirement step was excluded from the Stage 1
baseline); the leave-cleanup side of this ruling is implemented in TASK-0012-B alongside the
XP/tier cleanup it governs.
**Pilot treatment:** per owner direction, Originals-as-numbered-recognition is **not** part of
the Stage 1–3 pilot baseline and must not be advertised as available (brief: "Never advertise
deferred privileges as available"). Originals-as-Star-published-content audience value
(`drop.audience = 'originals_only'`, `server/db/schema/app.ts:170`) already exists in the schema
and is a separate question from the numbered-badge concept — Stage 0 must determine whether that
audience value is itself gated on the unresolved numbered-badge concept or is independently usable.

## DEC-05 — Founding Pledge meaning

**Evidence:** PRD §19 "Founding Pledge Stars" (line 2058-2060): "Define the meaning of active
pledges, return conditions, and the authoritative balance and transaction rules" — the PRD
describes return mechanics (§6.18, lines 1054-1056, 1069, 1081, 1099) without ever defining what a
Founding Pledge Star *is*, how it is earned, or what it is spent on.
**Schema evidence (code, verified):** no `FoundingPledgeBalance` or `FoundingPledgeTransaction`
table exists in `server/db/schema/app.ts`, read in full in this session; these are named only in
the PRD's data entity table (PRD line 1704-1705).
**Status:** OUT OF PILOT SCOPE per owner direction ("Founding Pledge Stars and any unspecified
Founding badge are deferred"). No pilot task implements it. Recorded here so no later task
invents a meaning for it.

## DEC-06 — Initial content formats, fan publishing authority, privacy/join rules

**Evidence:** PRD §6.7 requires "Support membership requests or invitations where required" and
privacy differentiation, without defining which privacy/join model is launch scope; PRD §19
"Fandom privacy" (line 2030-2032) asks to "Confirm public, private, invite-only and
approval-based membership rules."
**Schema evidence (code, verified):** `community` has no visibility/privacy column
(`server/db/schema/app.ts:74-87`); `drop.audience` supports `public | members | originals_only`
only (`server/db/schema/app.ts:170`) — the schema itself has no invite-only or approval-gated
community column. Whether any join route enforces something beyond the schema (e.g. in
application logic not backed by a column) was not checked — no `server/api/**` file was read.
**Status:** RESOLVED for the pilot (owner ruling) — **adopt current tested behaviour**: public
communities, open join (no invite or approval step), content audiences limited to the existing
`public | members | originals_only` enum, fans cannot publish drops (Stars publish; fans
interact via likes/replies). Private/invite-only/approval-based communities are deferred
post-pilot. **Blocks cleared for:** TASK-0004, TASK-0005.

## DEC-07 — Supported mobile platforms, pilot cohort and thresholds

**Evidence:** PRD §19 "Launch scope" (line 2090-2092): "Confirm MVP feature list, supported
platforms, minimum OS versions and rollout plan" is explicitly unresolved in the PRD; the owner's
direction in the brief does not name a platform, a cohort size, or a pilot start threshold.
**Status:** RESOLVED (owner ruling) — pilot cohort is **1 Rising Star, 1 community, ~4–6
weeks**, fans invited directly by that Star. Success signal: fans return for a second or later
activity within the period, the Star publishes and reviews consistently, and moderation
workload stays manageable — exact thresholds are set in TASK-0017's spec, not invented here.
Supported platform/OS versions remain undefined (the app is a Nuxt web app; a mobile wrapper is
a separate future decision).

## DEC-08 — Admin security requirements

**Schema evidence (code, verified):** an append-only `adminAudit` table exists
(`server/db/schema/app.ts:142-150`).
**Documentation claim (not independently verified against route code):** the guide describes an
`admin` role ("roles... `admin` (Super Admin; seeded, never self-assignable)",
`guide/content/99.api-reference/0.index.md:185`) and a `requireRole` helper — neither the role
check nor any MFA/IP-allowlist/session-lifetime control was confirmed by reading actual
`server/api/**` source in this session.
**Status:** RESOLVED for the pilot (owner ruling) — **accept current controls**: `super_admin`
role gate on all `/api/admin/**` routes (verified present in all 28 handlers by TASK-0001, not
`admin` as the guide says), append-only `adminAudit`, suspension enforced. No MFA, IP
allowlisting, or separate admin session lifetime required for the pilot; deferred to a later
hardening pass. TASK-0006 is now a verification-and-gap task (incl. the `openReports: 0`
defect), not a new-controls task.

## DEC-09 — Star provisioning/application requirements for the pilot

**Evidence:** PRD §19 "Rising Star onboarding" (line 2078-2080) is explicitly open.
**Documentation claim (not independently verified against route code):** the guide's endpoint
index labels an application/claim/accept pipeline `implemented` for `TAL-01..07` and
`ADM-02..07b` (`guide/content/99.api-reference/0.index.md:79-95`); **`TAL-08` (`GET
/api/talent/analytics`) is listed `deferred`, not implemented** (`0.index.md:86`) — it is talent
analytics, not application/claim/accept, and must not be included in the "implemented" range.
This session did not read `server/api/**` to confirm any of the `implemented`-labelled routes
exist or behave as described. The owner's
direction for the pilot says only "approved Star access" (brief §"Owner-approved direction",
Stage 1) without naming which eligibility fields (category, bio, links, evidence) apply to the
pilot cohort, or what test coverage the documentation-claimed routes actually have.
**Status:** RESOLVED for the pilot (owner ruling) — **use the existing application →
admin-accept flow** for pilot Stars. TASK-0001 verified the mechanics exist and e2e-confirmed
(`talent.test.ts`: accept creates talent + community + role + audit + notification atomically;
decline blocks reapply for 7 days; claim verify auto-rejects rivals). Evidence upload is
stubbed (`FEATURE_DISABLED` via `rejectMediaIds`) — acceptable for the 1-Star pilot cohort
(DEC-07); eligibility is exercised by the owner/admin reviewing the application. **Blocks
cleared for:** TASK-0003.

## DEC-10 — Notification scope for the pilot

**Evidence:** Owner direction names only "essential in-app notifications" for Stage 2.
**Schema evidence (code, verified):** a `notification` table exists with a free-text `type` column,
not an enum (`server/db/schema/app.ts:152-159`, specifically `app.ts:155`).
**Documentation claim (not independently verified against route code):** the guide's endpoint
index labels `NOT-01..04` routes `implemented` (`guide/content/99.api-reference/0.index.md:75-78`)
— not confirmed by reading `server/api/**` in this session. The set of `type` values that will
actually fire for the pilot (which events generate a notification) was not found defined anywhere
read in this session.
**Status:** RESOLVED for the pilot (owner ruling) — **adopt the existing emitted set plus one
addition**: `drop.published`, `reply.replied`, `watch_party.created|reminder|cancelled`,
`mission.completion_approved|rejected`, `badge.awarded`, `talent_application.accepted|declined`,
`identity_claim.verified|rejected` — **plus `membership.removed`** (PRD §6.19 requires a removal
notification; currently absent, must be added in TASK-0012-A). Report-outcome notifications to
reporters are deferred; the tier-gated hostile-fan-flag event stays deferred with its feature.
**Blocks cleared for:** TASK-0011 (now verification + the removal-event addition).

## DEC-11 — Negative XP balance and demotion policy

**Evidence:** PRD §6.9 describes only upward progression ("Automatically advance at 100, 500,
2,000, and 5,000 XP", PRD line 1364) and states tier is "calculated from the fandom's authoritative
XP balance" (PRD line 564) without ever addressing what happens if an admin correction
(`xp_transaction.source_type = 'admin_adjustment'`, `server/db/schema/app.ts:271`) drives a
balance below a previously reached threshold, or below zero. No PRD line in §6.9, §13.4, or §19
answers: (a) whether a balance may go negative, (b) whether a fan is demoted from a
previously-earned tier when their balance drops below that tier's threshold, or (c) whether any
previously-granted tier privilege (e.g. an already-selected second lane) is revoked on demotion.
**Schema evidence (code, verified):** `xpTransaction.amount` is a plain signed integer column with
no floor/check constraint (`server/db/schema/app.ts:270`) — nothing in the schema itself prevents
or governs a negative resulting balance.
**Status:** RESOLVED for the pilot (owner ruling) — **an admin correction that would make a
balance negative is rejected and never commits.** No negative balances exist in the pilot;
tier is always derived from the current balance (no stored demotion state or privilege
revocation needed — a corrected balance below a threshold simply computes the lower tier).
The endpoint contract/status code for the rejected case is decided in TASK-0013's spec, not
here. **Blocks cleared for:** TASK-0009 (xp ≥ 0 formula is now the whole domain), TASK-0013
(must add the balance check the current code lacks — evidence-matrix defect #4).

## DEC-12 — Mission lifecycle policy: proof validation, deadlines, late/retry review rules

**Evidence:** PRD §6.11 requires server-side completion validation and duplicate-award prevention
(lines 702, 744) but does not define a concrete proof-validation rule, a late-submission or
grace-period policy, or what happens when a review decision is retried or reversed. PRD Star-side
§12.7 "Mission Edge Cases" (lines 3130-3144) lists exactly these as unresolved: "A mission ending
while a fan is in progress," "Duplicate completion events," "An XP reward failing to process" —
named as cases the system "must handle," without saying how.
**Schema evidence (code, verified):** `mission` has `deadline` (nullable), `review: 'auto'|'owner'`,
`proof: 'none'|'link'|'text'` (`server/db/schema/app.ts:241,243-244`); `missionCompletion` has
`status: 'submitted'|'approved'|'rejected'`, `proofLink`, `proofText`, `rejectionReason`,
`xpTransactionId`, `reviewedBy`, and a `mission_completion_once_uq` unique constraint
(`server/db/schema/app.ts:252-263`). These columns exist and bound what is possible, but no rule
in the PRD or anywhere read this session states: what happens to a `submitted` completion when the
mission's `deadline` has already passed; whether a `reviewed` decision may ever be reversed; or
what the exact proof-shape requirement is per `proof` value (e.g., is `proofLink` mandatory when
`proof = 'link'`, and is it validated as a URL).
**Status:** RESOLVED (owner ruling) — **adopt the current tested code behaviour as policy**:
no late submissions (deadline pass → submission rejected, no grace period); review decisions
are final (approve after reject = INVALID_STATE and vice versa, no reversal); proof validated
per type (`link` = https URL, `text` = required text, `none` = no proof expected — the minor
gap where extra proof fields on a `none` mission are silently discarded instead of rejected is
closed under TASK-0019 as part of defect #3). All confirmed by e2e (`missions.test.ts`).
**Blocks cleared for:** TASK-0019 — its remaining work is verification/close-out plus the
defect #3 hardening, since the policy equals shipped behaviour.

## Additional owner rulings outside the DEC series

- **Reporter identity visibility (from evidence-matrix §6, owner ruling):** admins may see
  `reporterId` in the moderation queue — moderation needs context, and the identity is never
  exposed to the reported user (the schema comment's actual scope). No change required; the
  comment's wording may be clarified in a future doc pass.

## Decisions NOT reopened by this plan (owner-approved, binding)

These are stated once here so no task brief re-litigates them:

- **No money, no purchased progress, in the pilot** (brief, "Owner-approved direction").
- **Tier thresholds**: Lurker 0, Supporter 100, Soldier 500, General 2000, Superfan 5000 XP (PRD
  §6.9 lines 518-558, owner-confirmed in the brief). See `scope.md` for the worked formula.
- **Deferred for the pilot, not decided, not built in Stage 0–3**: Founding Pledge Stars and any
  Founding badge; General-tier fan mission proposals; special hostile-fan flags; Royal/Diamond
  skins; Superfan public featuring; paid plans/skins/boosts; in-app streaming/synchronised
  playback; referrals/rewarded growth; competitive leaderboards; advanced analytics/
  recommendations; fan-proposed missions; general messaging/DM. Full list and rationale in
  `scope.md` "Deferred pipeline".
- **Ordinary reporting is available regardless of earned tier** (brief). This does not resolve
  DEC-10's hostile-fan-flag question, which remains tier-gated and deferred.
