---
title: Stage 0 evidence matrix — present, absent, or unverified
---

# Evidence matrix (TASK-0001)

**What this is for a non-technical reader:** before any new feature is built, someone read every
page of code the pilot would rely on and wrote down, for each rule the product plan promises,
whether that rule is actually built, actually tested, missing, or only ever agreed in conversation
with no code behind it. Nothing was run by a computer in the original read-the-code session —
"present+untested" meant "the code exists and was read," not "the code works." The owner has since
run the test commands listed at the end and reported them passing; rows whose own cited test is
covered by that run are now marked `present+tested` below (see the update note that follows).

**This is an assessment for owner approval, not implementation approval.** Nothing in this
document authorises any later task to begin writing code. Every `absent` row, every defect, and
every migration proposal below requires an explicit owner decision (recorded in `decisions.md` or
a fresh ruling) before TASK-0002 onward may act on it.

**Source of truth:** `docs/mvp/tasks/0001-findings.md` (researcher's full-session read of 97
server/api routes, the 3 schema files, all tests, all guide pages, and the 2047-line OpenAPI
contract). Every citation below was file:line-verified against that document or against the
source files it cites. No citation appears here that the findings document did not itself support.

**Coverage actually achieved this session** (restated from findings §"Coverage statement" so this
document stands on its own): all 97 `server/api/**` route files, all 3 `server/db/schema/**`
files, 6 of 21 `server/utils/**` files (admin, auth, community, drops, missions, reports — 15
unread, listed under NOT VERIFIED below), all unit and e2e tests, all 9 guide pages, the full
OpenAPI yaml. PRD ranges read: §6.11, §6.18–6.19, §16–19, Star-side §12–§31. PRD ranges **not**
read: fan-side §1–6.10, 6.12–6.17, 7–15; Star-side §1–11 — any requirement whose only citation is
to one of those unread ranges is marked accordingly, not treated as confirmed PRD text.

**Update (post owner test run):** the owner has since run the test suite and reported a pass
(`pnpm test:e2e` — 47/47 passing across all 9 spec files; `pnpm test:unit` — 8/8; `pnpm typecheck`
— pass). On that basis, every row in section 1 whose own Test citation points at one of those now
confirmed-passing spec files has been promoted from `present+untested` to `present+tested` below.
Promotion is citation-scoped, not file-scoped: a row is only promoted if its own test citation
cites a passing spec, not merely because a related spec file exists and passed. Rows whose test
citation says "none found," or whose only evidence is documentation, are unaffected and remain
`absent` or untested as before. Qualifiers noting partial-vs-PRD behaviour, open decisions, or
known defects are kept unchanged on promoted rows — `present+tested` describes the code running
and the cited test passing, not that the behaviour matches the PRD or that any open decision is
resolved.

---

## 1. Requirements matrix — Stages 1–2 (per `scope.md`)

**Promotion basis and date-of-record:** owner-run `pnpm test:e2e`, 47/47, all specs passing (plus
`pnpm test:unit` 8/8 and `pnpm typecheck` pass). Rows below are marked `present+tested` only where
the row's own Test citation is to one of the now-confirmed-passing spec files.

Verdict key: `present+untested` (code and/or test exist, not run), `present+tested` (code and the
row's own cited test exist, and that cited spec file has been run by the owner and reported
passing — this still does not mean the behaviour matches the PRD; see each row's qualifiers),
`absent` (no code found), `owner-confirmed, no code found` (used only where the owner has stated
the behaviour works and no code citation could be located — none of the rows below currently
qualify for this verdict; it is reserved and defined here per the acceptance criteria).

| # | Requirement | PRD citation | Code citation | Test citation | Verdict |
|---|---|---|---|---|---|
| 1 | Sign up / sign in / session / verified email | §6.1 (heading at PRD:216; range 216–243 not read this session) | `server/api/auth/[...all].ts:1-2`; `server/utils/auth.ts:14-91` (`requireEmailVerification:true` at :21; DOB/age gate :56-59; reserved usernames :53) | `tests/e2e/api.test.ts:24-77` | present+tested |
| 2 | Onboarding + interest selection | §6.2 (heading at PRD:243) | `server/api/onboarding/index.get.ts`; `index.put.ts:13-35`; `complete.post.ts:13-26` | `tests/e2e/api.test.ts:99-121` | present+tested |
| 3 | Approved Star access (application → accept → role+talent+community) | §6.3(:333) / Star-side §4(:2336), §20.1(:3635-3649) | `server/api/talent-applications/index.post.ts`; `admin/applications/[id]/accept.post.ts:9-29` (atomic grant); `ensureTalentCommunity` in `server/utils/admin.ts:42-52` | `tests/e2e/talent.test.ts:35-60` | present+tested |
| 4 | Identity claim path | Star-side §2.2, §23.1 | `server/api/talents/[id]/claims.post.ts`; `admin/claims/**` | `tests/e2e/talent.test.ts:78-102` | present+tested |
| 5 | Fandom browse + join | §6.7(:387) | `server/api/communities/index.get.ts`; `[id]/index.get.ts`; `[id]/join.post.ts` | `tests/e2e/communities.test.ts:31-67` | present+tested |
| 6 | **Lane selection at join (one lane)** | §6.8(:420-465), Journey C(:1333), KPI(:1915), §18(:1975) | **none found** — `membership.lane` (`server/db/schema/app.ts:95`) is never written by any route (grep confirms only reads at `utils/community.ts:20`, `members.get.ts:26`; join body accepts only `alertsEnabled`, `communities/[id]/join.post.ts:6`) | none found | **absent** — blocked by DEC-01 (owner decision on lane names not made) |
| 7 | Limited content publishing (text drops allowed; voice/image blocked) | §6.6(:361), Star-side §8-9 | `server/api/drops/index.post.ts:26` (`FEATURE_DISABLED` for non-text); `dropView` locking in `server/utils/drops.ts:20-26`; audience enforcement `canSeeDrop` `:13-17` | `tests/e2e/drops.test.ts:34-110` | present+tested |
| 8 | Fan interactions (likes/replies) | §6.6, §6.12 | `server/api/drops/[id]/reactions/*`; `replies*`; `replies/[id].delete.ts` | `tests/e2e/drops.test.ts:136-171` | present+tested |
| 9 | Feed (membership-scoped, keyset, scheduled visibility) | §6.3(:268) | `server/api/feed.get.ts:17-28` | `tests/e2e/drops.test.ts:112-134` | present+tested |
| 10 | Voluntary leave | §6.18(:1028) | `server/api/communities/[id]/leave.post.ts` — sets `status:'left'` only, no XP/tier/original cleanup | `tests/e2e/communities.test.ts:43-46` | present+tested, **and the code is partial against PRD §6.18 lines 1066-1080 (no cleanup on leave) — see DEC-04 row below** |
| 11 | Reporting | §12(:1581), §6.19 trigger | `server/api/reports/index.post.ts`; `admin/reports/*` | `tests/e2e/moderation.test.ts:36-61` | present+tested, **with a confirmed defect for `targetType:'mission'` — see Defect Register #1** |
| 12 | **Blocking** | §12 fan controls (heading only at PRD:1585-1597; range not read this session) | **none found** — no block table, no block route anywhere in `server/api/**` or `server/db/schema/**` | none found | **absent** |
| 13 | Removal restriction (30-day block / permanent-on-second-removal counting) | §6.19(:1127-1130), §19(:2070-2072) | **none found** — `membership.status` enum is only `active\|left\|removed` (`app.ts:93`); no count column, no cooldown timestamp, no `FandomRemoval` table; current code makes first removal a **permanent** ban (`server/utils/reports.ts:53-61` `removeMember`; `communities/[id]/join.post.ts:19` blocks rejoin with reason `"removed"`) | removal itself is tested and that spec now confirmed passing (`tests/e2e/moderation.test.ts:63-80`) but the counting/30-day rule is not, because it does not exist | **absent** — blocked by DEC-03, which `decisions.md` records as OPEN and as a hard block on TASK-0012-A |
| 14 | Removal notification to the removed fan | §6.19(:1108-1144) | **none found** — no call to any notification helper from `removeMember` (`server/utils/reports.ts:53-61`); the full list of notification types actually emitted (checked across all call sites) does not include any removal or membership type | none found | **absent** — see Defect Register #9 (this is both a missing requirement and an identified gap against PRD §6.19) |
| 15 | Minimum admin controls | §14(:1811), Star-side §20 | all 28 `admin/**` routes call `requireAdmin` in-handler (`server/utils/admin.ts:8-14`, checking `user.roles` contains `super_admin`); `adminAudit` append-only table (`app.ts:142-150`) | `tests/e2e/talent.test.ts:104-130`; `tests/e2e/moderation.test.ts` | present+tested — **but see DEC-08 row: route-level middleware, MFA, IP allowlist, and session-lifetime controls claimed by the guide were not found** |
| 16 | Star-created missions + fan completions + owner review | §6.11(:682-702), Star-side §12(:3029-3144) | `server/api/missions/*`; `mission-completions/*` — full behaviour in the DEC-12 row set (section 3 below) | `tests/e2e/missions.test.ts:35-117` | present+tested |
| 17 | Fan-proposed missions | §12.4(:3092-3099), §6.9 General tier | **none found** — intentionally deferred (owner direction, `scope.md` "Out of Stage 2") | none | **absent (intentionally deferred, not a gap)** |
| 18 | Fandom-specific XP (per-community balance) | §6.9(:508-576), "fandom's authoritative XP balance" (:564) | **none found** — `xpTransaction` has no `communityId` column (`app.ts:267-279`); `/api/xp/me.get.ts:7-10` returns one global sum across all fandoms | none for fandom-scoped reads | **absent — requires a schema migration (see Migration section #3)** |
| 19 | Duplicate XP-award protection | §6.11(:702, :744) | `xp_transaction_source_uq` (`app.ts:277`); `grantXp` (`server/utils/missions.ts:16-22`, insert-or-return-existing); `mission_completion_once_uq` (`app.ts:261`) | `tests/e2e/missions.test.ts:56-74` | present+tested |
| 20 | Tier calculation (Lurker..Superfan) | §6.9(:518-576), :1364, §18(:1978) | **none found** — zero tier code anywhere in `server/`; `xp/me.get.ts:3` comment states XP is "a score only" | none found | **absent** |
| 21 | Second lane unlock at Supporter (100 XP) | §6.9, :1364, Journey D(:1346), §18(:1977) | **none found** — depends on both lane (#6, absent) and tier (#20, absent) | none found | **absent** |
| 22 | Essential in-app notifications | §6.15(:907), §10(:1494), Star-side §16 | `server/api/notifications/*`; emission set enumerated in DEC-10 row below | `tests/e2e/watch-parties.test.ts:100-116` | present+tested — **event set for the pilot is DEC-10, still OPEN** |
| 23 | Auditable admin reward correction | §13.4(:1717), §6.6 | `server/api/admin/xp-adjustments.post.ts`; `xp.adjusted` audit write at `:15` | `tests/e2e/missions.test.ts:119-133` | present+tested — **missing the negative-balance guard DEC-11 requires; see Defect Register #4** |
| 24 | Atomic XP/tier cleanup on leave/removal (TASK-0012-B) | §6.18(:1066-1080) | **none found** — leave and removal routes touch only the membership row and the member-count counter | none found | **absent** |
| 25 | Measurement surfaces: join/leave/report & mission/XP | §16(:1902-1931) | raw timestamp columns exist (`membership.joinedAt/leftAt`; `report.created_at/decided_at` at `app.ts:218-219`; `mission_completion.created_at/reviewed_at` at `app.ts:258-259`); **no aggregation route or event exists**; `admin/dashboard.get.ts:15-16` hardcodes `openReports: 0` even though reports now exist | none found | **absent — data exists, no measurement surface built; see Defect Register #2** |
| 26 | Originals wall | §6.18/§10, PRD:1729 | `server/api/communities/[id]/originals.get.ts`; `originalsAssigned` cap enforced via row lock in `join.post.ts` | `tests/e2e/communities.test.ts:51-52,56-67` | present+tested — **governed by the DEC-04 policy conflict below; must not be advertised as the PRD's "permanent retirement" behaviour until DEC-04 is resolved. e2e now confirms the distinction: admin-initiated `removeMember` retires the Originals position, while voluntary leave preserves it — see the DEC-04 row's added note.** |
| 27 | Watch parties | §6.13(:851), Star-side §14 | `server/api/watch-parties/**`; cron job `internal/jobs/notifications.post.ts` | `tests/e2e/watch-parties.test.ts:34-98` | present+tested |
| 28 | Account deletion / purge | §12 privacy, Star-side §17.5 | `server/api/me/index.delete.ts`; `internal/jobs/purge.post.ts` | `tests/e2e/api.test.ts:65-76`; `tests/e2e/watch-parties.test.ts:118-135` | present+tested |

---

## 2. DEC-01 .. DEC-12 verification rows

Each row confirms or corrects the backend-state claim in the matching `decisions.md` entry,
against code read in this session.

| Decision | `decisions.md` claim | This session's code-verified finding | Confirmed / corrected |
|---|---|---|---|
| DEC-01 (lane names) | `membership.lane` is a nullable reserved column; no route writes it (decisions.md asserted this from the schema comment only, not from reading routes) | **Confirmed.** `membership.lane` nullable text, comment "reserved: lanes not defined yet" (`app.ts:95`). Join body accepts only `alertsEnabled` (`communities/[id]/join.post.ts:6`); `memberships/[id].patch.ts:5` same; grep of `server/` for `.lane`/`lane:` finds only reads (`utils/community.ts:20`, `members.get.ts:26`). No lane-selection route exists anywhere. | **Confirmed, now with route-level evidence** (decisions.md's claim was schema-only; this closes the "TASK-0001 must confirm" gap it flagged). |
| DEC-02 (XP amounts/caps) | Open; only a shape (`missionXpMin/Max`) exists in `appSetting`, no owner-approved values read | **Confirmed, and partially modelled beyond what decisions.md stated:** `xp_rules` shape exists (`app.ts:225-231`); runtime defaults `{missionXpMin:5, missionXpMax:100}` hardcoded (`server/utils/missions.ts:8`); mission creation enforces the range (`missions/index.post.ts:26-28`); admin GET/PUT routes exist (`admin/xp-rules.get.ts`, `.put.ts`). No daily caps, no anti-abuse rules, no per-activity XP table. | **Confirmed as still OPEN** — the existence of a range-check is not the same as the owner having approved amounts, caps or anti-abuse rules. |
| DEC-03 (removal counting) | PRD states first-removal 30-day block (lines 1127-1130) but also flags counting as unresolved (2070-2072); no removal-count column, no cooldown, no `FandomRemoval` table found in schema | **Confirmed, and the conflict is sharper than decisions.md stated:** the code does not merely lack the 30-day mechanism — it actively implements a *different* rule: `removeMember` (`server/utils/reports.ts:53-61`) sets `status='removed'` **permanently**, and `join.post.ts:19` blocks any rejoin for a `removed` row with reason `"removed"`, with no expiry logic anywhere. This is "first removal = permanent ban" in production code, directly contradicting the PRD's documented "first removal = 30-day block, second = permanent" rule. | **Confirmed real conflict (code implements first-removal=permanent-ban vs PRD's first-removal=30-day).** Still OPEN, still blocks TASK-0012-A per decisions.md. |
| DEC-04 (Originals retirement vs rejoin) | Guide (documentation, not code) describes rejoin keeping `originalPosition`; decisions.md explicitly deferred confirming this to TASK-0001 | **Confirmed by reading the actual routes, not the guide:** Leave sets only `status:'left'`, leaving `originalPosition` untouched (`leave.post.ts:15`). Rejoin after `left` reactivates the same row without touching `originalPosition` (`join.post.ts:20-24`). `removed` members cannot rejoin at all (`join.post.ts:19`); their position stays on the row but is masked in `membershipView` (`utils/community.ts:21`) and shown as a retired slot on the Originals wall (`originals.get.ts:18-19`). The `originalsAssigned` counter never decrements (`join.post.ts:26-27`; purge job comment `internal/jobs/purge.post.ts:5`: "Original positions stay retired"). **The owner's `pnpm test:e2e` run (47/47 passing) confirms this distinction in practice, not just by code reading:** `tests/e2e/communities.test.ts` exercises both paths and the now-passing assertions show admin-initiated removal (`removeMember`) retiring the Originals position (masked/shown-retired on the wall) while voluntary leave leaves the position intact and visible — a nuance the earlier findings-document read of the code did not call out as a tested distinction between the two exit paths. | **Confirmed real conflict:** code preserves `originalPosition` across voluntary leave/rejoin; PRD §6.18 (lines 1050-1052, 1068, 1080, 1082) requires leaving to "permanently retire" the number. The guide's documentation text (`3.communities.md:41`) matches the code exactly — it is the PRD the code disagrees with, not the guide. The leave-vs-removal distinction above is additive evidence, not a resolution of the conflict: the PRD still requires retirement on voluntary leave, which the code still does not do. |
| DEC-05 (Founding Pledge) | No tables exist; out of pilot scope | **Confirmed.** No `FoundingPledgeBalance`/`FoundingPledgeTransaction` table anywhere in `app.ts` (full file read). | Confirmed, no correction. |
| DEC-06 (privacy/join rules) | No visibility/privacy column on `community`; `decisions.md` noted route-level logic was not checked | **Confirmed, now with route evidence:** `community` has no privacy/visibility column (`app.ts:74-87`); `join.post.ts:8-33` is unconditional for any onboarded fan — no approval step, no invite check anywhere in the route. `drop.audience` enum is `public\|members\|originals_only` only (`app.ts:170`). | Confirmed, with the previously-unchecked route logic now verified: there is no hidden approval gate outside the schema. |
| DEC-07 (platforms/cohort) | Still owner-owned, no code to find | No code or data artefact of any kind related to platform/cohort found. | Confirmed, no correction. |
| DEC-08 (admin security) | Guide (documentation) claims role `admin`, route-level middleware, MFA, IP allowlist, session-lifetime control — none independently verified | **Partially corrected:** `requireAdmin` checks `user.roles` contains **`super_admin`** (`server/utils/admin.ts:8-14`), **not** `admin` as the guide states (`0.index.md:185`) — the guide's role name is wrong against the code. All 28 `/api/admin/**` routes call `requireAdmin` in-handler (every one read). The guide's "defence in depth" claim of route-level middleware (`7.talent-admin.md:76`) is **NOT VERIFIED**: no `server/middleware/` directory was found by glob; only `server/api` and `server/utils` exist under `server/` in what was searched. No MFA, no IP allowlist, no separate admin session-lifetime control found anywhere read. Suspended admins are blocked (`utils/admin.ts:69`). `adminAudit` is append-only in practice (no route updates/deletes it, all 28 admin routes checked); the guide's DB-role claim (INSERT/SELECT-only grant, `7.talent-admin.md:143`) is a deployment claim, NOT VERIFIED from application code. | **Corrected:** role string is `super_admin` not `admin`; middleware existence is unresolved, not confirmed absent — flagged under NOT VERIFIED, not asserted either way. |
| DEC-09 (Star provisioning mechanics) | Guide labels TAL-01..07/ADM-02..07b "implemented," not independently verified | **Confirmed present with real implementations:** application submit/edit/queue/accept/decline and claim submit/queue/verify/reject (with auto-reject of rival claims and audited evidence views, `admin/claims/[id]/index.get.ts:12`) all exist and were read. `TAL-08` (analytics) correctly has no route (deferred, as the guide states). Eligibility fields actually captured are only `categoryId`, `displayName`, `bio`, `links` (`talent-applications/index.post.ts:5-12`); evidence upload is a stub that returns `FEATURE_DISABLED` for `rejectMediaIds` (`:19-20`). | **Confirmed mechanics present.** Whether this narrow field set satisfies pilot eligibility criteria remains an **owner decision**, not something this session can resolve. |
| DEC-10 (notification scope) | Guide labels NOT-01..04 "implemented," event set for pilot not found defined | **Confirmed, with the actual emitted type list now enumerated** (all call sites read): `drop.published` (`utils/drops.ts:63`), `reply.replied` (`replies.post.ts:33`), `watch_party.created\|reminder\|cancelled` (`watch-parties/index.post.ts:24`; `internal/jobs/notifications.post.ts:13`; `cancel.post.ts:13`), `mission.completion_approved\|rejected` (`mission-completions/[id]/*.post.ts`), `badge.awarded` (`admin/badges/[id]/awards.post.ts:19`), `talent_application.accepted\|declined`, `identity_claim.verified\|rejected`. **No report-related, removal, or membership-change notification is ever emitted** — confirming the PRD §6.19 removal-notification requirement is unmet. `notification.type` is free text, not an enum (`app.ts:155`). | Confirmed as still OPEN; the emitted-type list above is new evidence not previously recorded. |
| DEC-11 (negative XP balance/demotion) | No floor/check constraint on `xpTransaction.amount`; open | **Confirmed, with the exact silent-failure path identified:** `xpTransaction.amount` is a plain signed int (`app.ts:270`). `POST /api/admin/xp-adjustments` accepts any nonzero int up to ±100k (`admin/xp-adjustments.post.ts:6`) and **does not check the resulting balance** — e.g. a `-150` adjustment against a balance of 80 commits silently, producing a negative balance with no guard. No tier/demotion code exists at all (grep for `tier|Supporter|Lurker|Superfan` across `server/` returns zero hits). | Confirmed OPEN; current behaviour silently produces negative balances, which `scope.md`'s formula explicitly forbids assuming a rule for. |
| DEC-12 (mission lifecycle) | Open; schema columns exist but no rule for deadline-passed/reversal/proof-shape | See dedicated row set, section 3 below. | Confirmed OPEN per the detail below; mechanics outside the open policy questions are present. |

---

## 3. DEC-12 mission lifecycle row set

Full detail of what the real `mission` / `missionCompletion` routes do, as required by the task
brief's instruction to give DEC-12 its own dedicated set since missions are core pilot scope.

| Aspect | Code citation | Behaviour found |
|---|---|---|
| Creation | `server/api/missions/index.post.ts:14-43` | Owner-or-admin only (fans get `FORBIDDEN`). `status:'approved'` is set at insert time — there is no `pending` fan-proposal path actually exercised, even though `pending` remains in the status enum. `xpReward` is range-checked against `xp_rules` (`:26-28`). Deadline must be in the future. `review:'owner'` requires `proof` to not equal `'none'` (`:31-32`). |
| Listing | `server/api/missions/index.get.ts:5-44` | `active` = `status:'approved'` and deadline in the future or null (ordered deadline ascending, nulls last). "Expired" is computed at read time, not stored as a status. Pending/rejected missions are visible only to staff or the creating Star (`:34`). |
| Submission | `server/api/missions/[id]/completions/index.post.ts:14-38` | Requires active membership (`:18-19`). Expired or non-approved missions are blocked via `missionStatus` (`server/utils/missions.ts:24-25` → `INVALID_STATE`). Proof shape is partially enforced: `proof:'link'` requires an `https://` URL (`:6`, `:23`); `proof:'text'` requires non-empty text (`:24`). For `proof:'none'` missions, the route does not reject extra proof fields submitted anyway — they are stored as null and silently discarded, not validated against (see Defect Register #3). Auto-review grants XP in the same transaction as the submission (`:32-33`). One completion per fan is enforced by the `mission_completion_once_uq` constraint plus `onConflictDoNothing`. |
| Late submissions | same file, `:16-17` | A submission attempted after the deadline is rejected outright (`INVALID_STATE`) — there is no grace period. A submission made **before** the deadline but reviewed **after** it is implicitly allowed, because the approve route has no deadline check at all. The guide (`5.missions-xp.md:69`) confirms this is the intended behaviour, but it is a documentation statement, not an owner ruling on DEC-12's open late-submission policy question. |
| Review reversal | `missions/[id]/completions/[completionId]/approve.post.ts:10-11`; `reject.post.ts:14-15` | A `rejected` completion cannot later be approved (`INVALID_STATE`); an `approved` completion cannot later be rejected (`INVALID_STATE`). Reversal of any review decision is impossible in the current code — there is no "unapprove" route. Rejection requires a reason (`reject.post.ts:5`). There is no resubmission path after rejection (blocked by the unique constraint). |
| Duplicate award protection | `grantXp`, `server/utils/missions.ts:16-22`; `xp_transaction_source_uq`, `app.ts:277` | Insert-or-return-existing pattern, enforced at the schema level by a unique constraint — verified present and structurally sound. |
| What is explicitly NOT implemented (in DEC-12's scope) | — | No route sets a mission's `status` to `'closed'`, even though `'closed'` exists in the status enum (`app.ts:242`) — there is no mission edit/close/pause route at all. There is no XP-reward-failure compensation path for the case PRD §12.7 names ("an XP reward failing to process"). Fan-proposed-mission routes (`MIS-04`/`MIS-05`) are correctly absent per owner direction to defer them. |

**Conclusion for TASK-0019:** mission creation, membership-gated submission, duplicate protection,
atomic approve+award, and rejection-reason requirements are built and may be relied on as a
starting point. Deadline-after-submission-before-review handling, review reversal, and the
`proof:'none'` extra-field gap remain exactly the open questions `decisions.md` DEC-12 says they
are — none of them may be treated as already decided by the fact that columns exist for them.

---

## 4. Migration / backfill section

Every schema change a later task in this plan would require, with an additive-vs-destructive
classification and a backfill note. **No row below authorises writing a migration** — this is an
inventory for the owner to approve or reject, per the task brief.

| # | Change needed | For | Additive or destructive | Backfill note |
|---|---|---|---|---|
| 1 | A lane enum/check constraint on `membership.lane` | DEC-01 / Stage 1 lane selection | Additive (column already exists, nullable, `app.ts:95`) | Existing rows are already `null`. Needs an owner policy decision on whether `null` remains a valid value after the enum is added (e.g. for members who joined before lanes existed), or whether a one-time default-lane backfill is required. |
| 2 | A removal-count column and/or a cooldown-until timestamp on `membership`, or a new `FandomRemoval` table | DEC-03 / TASK-0012-A removal-restriction piece | Additive — a new table is purely additive; a new column on `membership` can default/backfill to `0`/`null` for all existing rows with no data loss | No existing data describes prior removals beyond the current `status='removed'` flag, so a numeric "times removed" count cannot be backfilled accurately past 1 for any row already marked `removed` — this is a backfill **limitation**, not a blocker, but the owner must accept that pre-migration removals will be undercounted. |
| 3 | A `communityId` column on `xp_transaction` | DEC-02/08/18 fandom-scoped XP requirement | Additive column | **Needs an explicit owner backfill decision**, not a mechanical one: rows whose `source_type` ties back to a mission (`missionCompletion → mission.communityId`) can be backfilled automatically; rows with `source_type = 'admin_adjustment'` have no community reference anywhere in the schema and **cannot** be backfilled from existing data — the owner must decide whether those historical rows are left community-less (and if so, how a fandom-scoped balance sum should treat them) or manually reassigned. |
| 4 | A `notification.type` enum/check constraint in place of free text | DEC-10 | Additive constraint, **unless** an existing row's `type` string would violate the proposed enum, in which case the constraint add is destructive for those rows until they are corrected or excluded | The actual emitted type list (section 2, DEC-10 row) must become the canonical enum list before this constraint can be added — any value not on that enumerated list, present in existing rows, would fail the constraint. |
| 5 | Tier derived value | DEC-11/Stage 2 tier calculation | Not needed as a stored column if tier is always computed from the XP balance at read time (no new table/column required) | N/A — no backfill question if nothing is stored. |

**No required change identified in this session drops data or removes an existing column.**

**Flagged as semantic (behaviour) changes on existing rows, requiring explicit owner permission
before any later task may act on them** — these are not schema migrations but changes to what
existing data is interpreted to mean, and the task brief's rollback section requires calling these
out separately from additive schema work:

- **DEC-04**: changing the code so that leaving retires `originalPosition` (per PRD) rather than
  preserving it (current code) would invalidate the preserved positions on every existing `left`
  membership row. This is a behavioural change, not a schema change, and is not reversible by
  dropping a column — it requires a data audit of existing `left` rows before the owner approves it.
- **DEC-03**: changing `removed` from "permanent" (current code) to "30-day then eligible to
  rejoin" (PRD) changes the rejoin eligibility of every existing `removed` row the moment the rule
  changes — the owner must decide whether existing removed members become immediately rejoin-eligible,
  subject to a newly-computed cooldown, or grandfathered as permanent under the old rule.

---

## 5. Rollback section

Per proposed change in section 4:

| Change | Rollback |
|---|---|
| Lane enum/check on `membership.lane` (#1) | Additive — reversible by dropping the constraint with no data loss, since the underlying column and its existing `null` values are untouched. |
| Removal-count column / `FandomRemoval` table (#2) | Additive — reversible by dropping the new column/table; no existing confirmed-working feature (join/leave/report) reads it today, so dropping it affects nothing else. |
| `communityId` on `xp_transaction` (#3) | Additive — reversible by dropping the column. **Not** reversible without data loss if any downstream feature is built that writes new rows relying on the column being present (e.g. new fandom-scoped mission completions) before rollback — the rollback window closes once dependent writes exist. |
| `notification.type` enum/constraint (#4) | Additive if no existing row violates it; otherwise rollback requires first identifying and either correcting or excluding the violating rows before the constraint can be safely reapplied, which is not a pure drop-and-restore operation. |
| DEC-04 behavioural change (retire position on leave) | **Not rollback-safe without a data audit.** Reverting the code change after it has run against live rows does not restore positions that were retired in the interim — this requires a data audit, not a schema rollback, and is called out here per the task brief's explicit requirement to flag this. |
| DEC-03 behavioural change (30-day vs permanent) | **Not rollback-safe without a data audit**, for the same reason — rejoin decisions made under the new rule cannot be mechanically un-made by reverting code alone. |

---

## 6. Visibility/privacy subsection

**Report-reporter identity (schema comment at `app.ts:206-207`: "never revealed to the reported
user"):**

- The comment's narrow claim is enforced for the **reported user**: the reporter-facing creation
  response returns only `{id, status, createdAt}` — no `reporterId`, no outcome
  (`reports/index.post.ts:12`), and no route anywhere outside `/api/admin/**` serializes a report
  back to anyone (verified — no public GET for reports was found).
- **The admin queue does expose `reporterId`**: `adminReportView` includes it
  (`server/utils/reports.ts:31`), and both `admin/reports/index.get.ts:20` and
  `actions.post.ts:50` return it in their response. A test explicitly asserts `reporterId` is
  present in the admin payload (`tests/e2e/moderation.test.ts:53`).
- **This never reaches the reported user** — there is no code path by which a reported user's
  client receives the admin payload. But the schema comment's wording ("never revealed") does not
  distinguish "the reported user" from "any other party," and admins seeing the reporter's identity
  is a judgment call the comment does not make explicit either way.
- **Owner ruling needed:** is admin visibility of `reporterId` acceptable moderation practice
  (likely yes, for abuse investigation), or does the "never revealed" rule need to be made
  explicit as "never revealed to the reported user, always visible to admins" in the schema
  comment and the guide, so a future reader does not mistake the comment for a stronger privacy
  guarantee than the code provides?

## 6b. Concurrency subsection

**Community join concurrency vs. the documented mechanism
(`guide/content/99.api-reference/3.communities.md:40`):**

- **The guide documents:** `INSERT ... ON CONFLICT DO NOTHING` followed by
  `UPDATE communities SET originals_assigned = originals_assigned + 1 ... WHERE originals_assigned < 100 RETURNING`.
- **The code actually does something different:** a transaction takes a `SELECT ... FOR UPDATE`
  row lock on the community row (`communities/[id]/join.post.ts:16` → `loadVisibleCommunity(...,
  lock=true)` → `server/utils/community.ts:45` `.for('update')`) and a second `.for('update')` lock
  on the membership row (`:17`); the Originals position is then computed in application code
  (`:26`) and written unconditionally together with the counter update (`:27`); the membership
  insert itself is a plain insert relying on the prior locked read (`:28`).
- **This is an equivalent guarantee by a different mechanism**: the community row lock serialises
  concurrent joins and the ≤100 Originals cap is still enforced, just through pessimistic row
  locking rather than a conditional `UPDATE ... WHERE ... RETURNING`.
- **One real gap this exposes:** the final membership `insert` has no `ON CONFLICT` guard. If a
  race condition somehow reached that insert despite the locked read (e.g. a future code change
  that weakens the locking), the unique constraint violation would surface as an **unhandled
  Postgres error code 23505** — a raw 500 — rather than the graceful response the documented
  `ON CONFLICT DO NOTHING` mechanism implies. This is flagged in the Defect Register below (#5) as
  a latent error-path gap, not a currently-reproduced failure.

---

## 7. Defect register

Real bugs and gaps found while reading the code, each pointed at a plan item per the "every
finding points somewhere" rule.

| # | Defect | Citation | Points to |
|---|---|---|---|
| 1 | Reporting a mission always fails. `assertReportTarget` (`server/utils/reports.ts:13-28`) does not handle `targetType:'mission'` at all and falls through to `notFound()`, even though `'mission'` is a valid value in both the report-target enum (`app.ts:210`) and the request body enum (`reports/index.post.ts:6`). | `server/utils/reports.ts:13-28`; `reports/index.post.ts:6,22`; `app.ts:210` | TASK-0012-A (reporting) — not covered by any existing task brief as a named defect; **propose a follow-up fix task before TASK-0012-A is marked done.** |
| 2 | `admin/dashboard.get.ts:15-16` hardcodes `openReports: 0` with a stale comment ("until the reports domain ships") — the reports domain has shipped, so the admin dashboard currently always under-reports open safety workload regardless of real report volume. | `server/api/admin/dashboard.get.ts:15-16` | TASK-0015-B (Stage 2 safety-workload measurement) and TASK-0006 (minimum admin controls) — **not covered by any existing task brief; propose a follow-up fix task.** |
| 3 | `missions/[id]/completions/index.post.ts:6` does not reject proof fields submitted on a `proof:'none'` mission — extra text/link is silently discarded rather than rejected. Low severity (harmless today) but it means the API silently accepts malformed requests instead of returning a validation error. | `server/api/missions/[id]/completions/index.post.ts:6,28` | TASK-0019 (mission lifecycle) — covered by DEC-12's open proof-shape-validation question; no separate action needed beyond what DEC-12 already requires the owner to resolve. |
| 4 | `admin/xp-adjustments.post.ts` performs no balance check before committing a correction — a correction that would drive a balance negative commits silently. | `server/api/admin/xp-adjustments.post.ts` | DEC-11 (OPEN) and TASK-0013 (admin reward correction) — `scope.md`'s own formula section already states no task may implement negative-balance handling until DEC-11 is ruled on; this defect confirms the current code does the opposite of that rule (it allows the negative balance to commit rather than rejecting it) and must be fixed as part of TASK-0013, not worked around. |
| 5 | Join-route membership insert has no `ON CONFLICT` guard — a race that reached it would surface as an unhandled Postgres 23505 error rather than a graceful response. | `server/api/communities/[id]/join.post.ts:28` | TASK-0004 (browse/join) — **not covered by any existing task brief as a named defect; propose a follow-up fix task** (low priority given the row lock already prevents the race in the normal case). |
| 6 | The OpenAPI yaml and the guide's endpoint index both document `PATCH /api/admin/badges` and `POST /api/admin/badges/{id}` (yaml lines 151, 216; `0.index.md:107`) — **neither route exists.** The real routes are `PATCH /api/admin/badges/{id}` and `POST /api/admin/badges` (operations swapped/malformed in the documentation). The existing doc↔yaml sync test (`guide/tests/unit/openapi-sync.test.ts`) cannot catch this because it only compares the guide to the yaml, never either of them to the actual route files. | `openapi/clautverse.yaml:151,216`; `guide/content/99.api-reference/0.index.md:107`; `guide/tests/unit/openapi-sync.test.ts` | Not covered by any existing task brief — **propose a follow-up documentation-fix task**, and separately flag to the owner that the `0.index.md:6` claim ("an automated test catches guide/contract disagreement") is narrower than it reads: it catches guide↔yaml drift only, not code↔contract drift. |
| 7 | The guide states the admin role is named `admin` (`0.index.md:185`); the actual code checks for `super_admin` (`server/utils/admin.ts:8-14`). Anyone implementing or reviewing against the guide's wording alone would reference the wrong role string. | `guide/content/99.api-reference/0.index.md:185`; `server/utils/admin.ts:8-14` | DEC-08 — already corrected in section 2 above; **propose a documentation-fix follow-up** so the guide stops stating the wrong role name. |
| 8 | Rate limits are documented more generously than the code enforces, and several write routes have no rate limit at all. Guide states join and report are rate-limited at roughly 60/min; code limits join at 60/hour and report at 10/min (findings §3 item 6). **No rate limit exists at all on: drop creation, like/unlike, RSVP, membership patch, or mission-completion submission.** | findings §3 item 6 (rate-limit figures read from route-level calls; `rate-limit.ts` itself was not read — see NOT VERIFIED) | Not covered by any existing task brief as a named gap — **propose a follow-up task to align documented and actual limits, and to decide whether the unrated-limited write routes need one before pilot launch**, since unlimited mission-completion submission and unlimited drop creation are both routes a hostile or buggy client could abuse. |
| 9 | `removeMember` (`server/utils/reports.ts:53-61`) issues no notification to the removed fan, even though PRD §6.19 requires one. | `server/utils/reports.ts:53-61`; PRD §6.19 (lines 1108-1144) | Already recorded as requirement row #14 above and as part of DEC-10's OPEN status — no separate follow-up task needed beyond what DEC-10/TASK-0012-A must already resolve. |
| 10 | `watch-parties/[id]/rsvp.put.ts:12-14` hardcodes `going` to `true` with a dead `else` branch that can never execute; the same dead-branch pattern exists in `.delete.ts` with `going` hardcoded to `false` (findings §3 item 8, findings line 136). Low severity — harmless duplication, not a behavioural bug, but it is unreachable code sitting in a live route. | findings §3 item 8 (findings line 136); `server/api/watch-parties/[id]/rsvp.put.ts:12-14`; `server/api/watch-parties/[id]/rsvp.delete.ts` | Not covered by any existing task brief — not a blocker for any task; **noted here for a future cleanup pass**, no fix required before pilot launch. |
| 11 | `me/index.delete.ts:12-15` requires password re-authentication before account deletion. No OAuth-only accounts exist in the pilot today, so this is not a defect against any current user — but if a future OAuth-only sign-in method is added without a corresponding change to this route, an OAuth-only account would have no password to re-authenticate with and could never delete itself (findings §3 item 13, findings line 141). | findings §3 item 13 (findings line 141); `server/api/me/index.delete.ts:12-15` | Not covered by any existing task brief and not a defect in the current pilot scope (no OAuth accounts exist) — **record for whoever later scopes OAuth sign-in or account-deletion changes**, so the password-only re-auth assumption is revisited at that time. |

**Coverage note:** findings §3 ("Notable input-validation / authz / edge-case gaps observed") lists
15 items. Item 1 (dashboard `openReports` hardcoded) is Defect Register row #2; item 2 (join insert
with no `ON CONFLICT`) is row #5; item 3 (proof fields not validated for `proof:'none'`) is row #3;
item 4 (`xp-adjustments` no balance check) is row #4; item 5 (reporting a mission 404s) is row #1;
item 6 (rate-limit gaps) is row #8. Items 8 and 13 are added above as new rows #10 and #11. Items 7,
9, 10, 11, 12, and 14 are confirmations that the code is correct, not defects, and are not entered
in the Defect Register for that reason — they remain recorded only in findings §3 itself. Item 15
(possible `claimed`/`isClaimed` shape mismatch) is carried under §8 NOT VERIFIED, not the Defect
Register, because findings itself could not resolve it without reading an unread file
(`talentProfile.ts`). With rows #10 and #11 added, every item in findings §3 now has an explicit
disposition somewhere in this document — none is silently dropped.

---

## 8. NOT VERIFIED

Everything in this section requires either a command the owner must run, or a file this session
did not read. None of it may be treated as fact until closed.

- **All test results — now closed for the suites the owner has run.** The owner has reported
  `pnpm typecheck` passing, `pnpm test:unit` passing (8/8), and `pnpm test:e2e` passing (47/47
  across all 9 spec files). Every section 1 row whose own test citation pointed at one of those
  now-run files has been promoted to `present+tested` accordingly. This closes the "all test
  results" item for those citations specifically — it does not mean every future test file or
  future spec added later is pre-verified; any row whose test citation names a spec file not
  covered by this run stays `present+untested` or `absent` until that file is run and reported.
- **15 of 21 `server/utils/**` files were not read**: `age`, `api-error`, `catalog`, `cron`,
  `cursor`, `db`, `email`, `notifications`, `onboarding`, `paginate`, `rate-limit`,
  `talent-applications`, `talentProfile`, `validate`, `watchParties`. (The 6 read were: admin,
  auth, community, drops, missions, reports.) In particular, the rate-limit figures cited in
  Defect Register #8 come from call sites, not from reading `rate-limit.ts` itself to confirm it
  implements a fixed-window Postgres counter as the guide describes.
- **`server/db/migrations/0000_keen_doctor_faustus.sql`** exists but was not read — whether the
  migration baseline actually matches the current schema file is unconfirmed.
- **Whether Nitro middleware exists** for admin defence-in-depth, request-ID stamping, CSRF
  Origin checking, or a body-size cap (all claimed by the guide at §1.5/§1.4/§1.1) — no
  `server/middleware/**` directory was found by glob, but a root-level middleware location outside
  what was searched is not ruled out.
- **PRD sections not read this session:** fan-side §1–6.10, 6.12–6.17, 7–15 (lines 1–679,
  1150–1901) and Star-side §1–11 (lines 2142–3028). Section headings are known from the table of
  contents; their content is not. No requirement whose only possible citation falls in one of
  these ranges is asserted as PRD fact anywhere in this document — any such requirement (e.g.
  anything only describable from fan-side §7–15 content) is simply not covered here and must be
  read before being treated as in or out of scope.
- **`scripts/seed.mjs`**, referenced by `tests/e2e/global-setup.ts:15`, was not read — its
  behaviour (and therefore what state the e2e tests assume the database starts in) is unconfirmed.
- **`talentView` in `talentProfile.ts`** was not read — findings §3 item 15 flags a possible shape
  inconsistency (`claimed` vs `isClaimed`) between two different talent-profile serializers that
  this session could not fully resolve without reading that file.

---

## 9. Owner action required before any row may be upgraded

The owner has run, and reported the pass/fail result of, each of:

```
pnpm typecheck      — REPORTED PASS (after docs-shell type fixes, issue #28)
pnpm test:unit      — REPORTED PASS (8/8: tests/unit/age.test.ts, cursor.test.ts)
pnpm test:e2e       — REPORTED PASS (47/47 across all 9 spec files — api, communities, discover-talent, drops, missions, moderation, signup-concurrency, talent, watch-parties)
```

No role in this project runs these commands on the owner's behalf; that remains true going
forward. For this round, the owner has reported a result, and every section 1 row whose own test
citation pointed at one of the now-passing spec files has been promoted to `present+tested` above
on that basis. This rule still applies prospectively: any row added later, or any row whose test
citation names a spec file outside this run, stays `present+untested` (or `absent`, if no test
exists) until the owner runs that specific file and reports a pass — no later task may claim test
coverage this document has not confirmed was actually run.

---

## Self-check — statements that could read as disagreeing, resolved

- Section 1 row 26 (Originals wall) says "present+tested" while section 2's DEC-04 row says the
  code conflicts with the PRD. These do not disagree: the route exists and its cited test is now
  confirmed passing (hence present+tested), but what it implements is the guide's documented
  behaviour, not the PRD's — both statements are held simultaneously and the row explicitly
  cross-references DEC-04 so a reader does not take "present+tested" as "matches the PRD."
  Likewise elsewhere in section 1: wherever a row carries both a `present+tested` verdict and a
  qualifier pointing at an open decision or a partial-vs-PRD gap, the verdict describes only that
  the cited test runs and passes — it never resolves the open decision or closes the PRD gap.
- Section 6 (reporter identity) says the comment's claim is "mostly enforced" while also saying
  admins can see `reporterId`. These are reconciled explicitly in the text: the comment's actual
  scope (never revealed to the *reported user*) is fully enforced; what remains open is whether
  the comment's wording was ever meant to also restrict admin visibility, which this session
  cannot determine from code alone and sends to the owner as a ruling, not a defect.
- Section 2 DEC-08 states both "no middleware was found" and "this is NOT VERIFIED, not confirmed
  absent" — restated together deliberately so a reader does not mistake "not found" for "proven
  not to exist"; only a glob was run, not an exhaustive directory read of everything under
  `server/`.

No other cross-page contradiction was found between this document's own sections.

---

**Plain-English summary:** this document lists, for every pilot requirement, every decision on
record, and every schema change later work would need, exactly what was found in the real code —
built-and-confirmed-working, built-but-not-yet-confirmed, missing, or only ever assumed — with
every bug found along the way pointed at the task that owns it. The owner has since run the three
commands this document originally asked for (`pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e`)
and reported all passing, so every requirement whose own cited test falls in that run is now
marked proven-to-run (`present+tested`) above; it is still not the same as proven-to-match-the-PRD
— several promoted rows carry an explicit note that the behaviour tested is not the behaviour the
PRD describes, and those notes still stand.
