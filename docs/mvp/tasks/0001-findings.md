Subagent agent_id=0b3bd48c completed successfully:

# TASK-0001 — Stage 0 backend gap assessment: researcher findings

**Coverage statement:** Read IN FULL this session (every file, no sampling):

- `server/api/` — all 97 route files (counted: 97 `.ts` files incl. catch-all `[...].ts` and `_docs/openapi.get.ts`)
- `server/db/schema/` — all 3 files (`app.ts` 320 lines, `auth.ts` 65 lines, `index.ts` 2 lines)
- `server/utils/` — 8 of 21 files read in full (admin, auth, community, drops, missions, reports; others grepped only — see NOT VERIFIED)
- `tests/unit/` — all 2 files; `tests/e2e/` — all 11 files (10 specs + helpers + global-setup)
- `guide/tests/` — all 4 files (out of plan scope but checked for the "contract test" claim)
- `guide/content/99.api-reference/` — all 9 pages
- `openapi/clautverse.yaml` — all 2047 lines
- PRD `Clautverse Ecosystem PRD.md` — read ranges: §6.11 lines 682–819, §6.18–6.19 lines 1040–1149, §16–19 lines 1902–2100, Star-side §12–§31 lines 3029–4467. **Fan-side §1–6.10, 6.12–6.17, 7–15, and Star-side §1–11 (lines 1–679, 1150–1901, 2142–3028) were NOT read this session** — planning docs' citations for those are relied on only where marked.

**No commands were run.** Every verdict below is at most `present+untested`. Tests exist for most "implemented" routes but pass/fail is unconfirmed — the owner must run `pnpm test:e2e` / `pnpm test:unit`.

---

## 1. Mandatory verification sets

### DEC-01 (lane names) — VERIFIED ABSENT
`membership.lane` is a nullable text column (`server/db/schema/app.ts:95`). **No route ever writes it**: join body accepts only `alertsEnabled` (`server/api/communities/[id]/join.post.ts:6`), `memberships/[id].patch.ts:5` accepts only `alertsEnabled`, and a grep for `.lane`/`lane:` across `server/` finds only reads (`utils/community.ts:20`, `members.get.ts:26`). Lane selection at join is absent → blocked by DEC-01 as expected.

### DEC-02 (XP amounts/caps) — PARTIALLY MODELLED
`appSetting` `xp_rules` shape exists (`app.ts:225-231`); runtime defaults `{ missionXpMin: 5, missionXpMax: 100 }` are hardcoded (`server/utils/missions.ts:8`); mission creation enforces the range (`missions/index.post.ts:26-28`); admin GET/PUT routes exist (`admin/xp-rules.get.ts`, `.put.ts`). No daily caps, no anti-abuse rules, no per-activity XP table. Open decision remains open.

### DEC-03 (removal counting/cooldown) — VERIFIED ABSENT
`membership.status` is `active|left|removed` (`app.ts:93`). **No removal-count column, no cooldown timestamp, no `FandomRemoval` table** anywhere in `app.ts` or `auth.ts`. Admin removal (`server/utils/reports.ts:53-61` `removeMember`) sets `status='removed'` permanently and `join.post.ts:19` blocks rejoin with `FORBIDDEN reason:"removed"` — i.e., the code implements "first removal = permanent ban", contradicting PRD §6.19's "first removal = 30-day block" (PRD lines 1127-1130). The PRD's own tracker leaves counting undefined (lines 2070-2072). New columns/table needed → DEC-03 correctly OPEN and blocking.

### DEC-04 (Original retirement vs rejoin) — VERIFIED: code KEEPS position on leave/rejoin
- Leave keeps the row with `originalPosition` intact (`leave.post.ts:15` only sets `status:'left'`).
- Rejoin after `left` reactivates the same row without touching `originalPosition` (`join.post.ts:20-24`).
- `removed` members cannot rejoin at all (`join.post.ts:19`); the position stays on the row but is masked in `membershipView` (`utils/community.ts:21`) and shown as a retired slot on the Originals wall (`originals.get.ts:18-19`).
- The counter `originalsAssigned` never decrements (`join.post.ts:26-27`; purge job comment `internal/jobs/purge.post.ts:5` "Original positions stay retired").

So guide claim at `3.communities.md:41` is accurate to the code. **The code contradicts PRD §6.18** (lines 1050-1052, 1068, 1080, 1082: leaving "permanently retires" the number and XP/badge progress is "permanently removed"). DEC-04 is a real, confirmed conflict: code = position survives voluntary leave; PRD = retired forever.

### DEC-05 — VERIFIED: no Founding Pledge tables anywhere in schema.

### DEC-06 — VERIFIED: `community` has no privacy/visibility column (`app.ts:74-87`); join is unconditional for any onboarded fan (`join.post.ts:8-33` — no approval step, no invite check). `drop.audience` enum = `public|members|originals_only` only (`app.ts:170`).

### DEC-07 — No platform/cohort artefacts in backend. Still owner-owned.

### DEC-08 — PARTIALLY VERIFIED
- `requireAdmin` checks `user.roles` contains `'super_admin'` (`server/utils/admin.ts:8-14`). Note the actual role string is **`super_admin`**, not `admin` as the guide says (`0.index.md:185` says role `admin`); `grantRole` appends `'talent'`/`'super_admin'` to comma-joined `user.roles` (`admin.ts:16-20`, `auth.ts:16`).
- Every `/api/admin/**` route calls `requireAdmin` in-handler (read all 28 admin routes). Guide claims route-level middleware **and** handler check "defence in depth" (`7.talent-admin.md:76`) — **NOT VERIFIED**: no `server/middleware/` files were found by glob (only `server/api` and `server/utils` exist under `server/`; middleware, if any, lives elsewhere — flag for lead to check `server/` root).
- No MFA, no IP allowlist, no separate admin session-lifetime control found anywhere in `server/`. Suspend blocks admins (`utils/admin.ts:69`).
- `adminAudit` append-only table exists (`app.ts:142-150`); no route updates/deletes audit rows (verified across all admin routes); guide's claim of INSERT/SELECT-only DB role (`7.talent-admin.md:143`) is a deployment claim — NOT VERIFIED.

### DEC-09 — VERIFIED MECHANICS PRESENT
TAL-01..07 and ADM-02..07b all exist with real implementations (application submit/edit/queue/accept/decline; claim submit/queue/verify/reject with auto-reject of rivals and audited evidence views — `admin/claims/[id]/index.get.ts:12`). `TAL-08` analytics has **no route** (correctly deferred). Eligibility fields = categoryId + displayName + bio + links only (`talent-applications/index.post.ts:5-12`); evidence upload is stubbed via `rejectMediaIds` → `FEATURE_DISABLED` (`talent-applications/index.post.ts:19-20`). Whether that field set satisfies pilot eligibility is an owner decision.

### DEC-10 — VERIFIED: `notification.type` is free text (`app.ts:155`). Types actually emitted (read all call sites): `drop.published` (`utils/drops.ts:63`), `reply.replied` (`replies.post.ts:33`), `watch_party.created|reminder|cancelled` (`watch-parties/index.post.ts:24`, `internal/jobs/notifications.post.ts:13`, `cancel.post.ts:13`), `mission.completion_approved|rejected` (`mission-completions/[id]/*.post.ts`), `badge.awarded` (`admin/badges/[id]/awards.post.ts:19`), `talent_application.accepted|declined`, `identity_claim.verified|rejected`. **No report-related, removal, or membership notifications** — a removed fan is never notified (PRD §6.19 requires a removal notification). DEC-10 remains needed.

### DEC-11 — VERIFIED: `xpTransaction.amount` is a plain signed int, no floor (`app.ts:270`). `POST /api/admin/xp-adjustments` accepts any nonzero int ±100k (`admin/xp-adjustments.post.ts:6`) and **does not check the resulting balance** — a `-150` adjustment against balance 80 commits silently. No tier/demotion code exists at all (grep for tier|Supporter|Lurker|Superfan across `server/` = zero hits). DEC-11 correctly OPEN; current behaviour silently produces negative balances.

### DEC-12 — mission lifecycle row set (dedicated, per brief)
| Aspect | Code | Behaviour found |
|---|---|---|
| Creation | `missions/index.post.ts:14-43` | owner-or-admin only; `status:'approved'` at insert; xpReward range-checked vs `xp_rules`; deadline must be future; `review:'owner'` requires proof≠'none' (`:31-32`). Fans get FORBIDDEN — no `pending` fan-proposal path exercised (status enum keeps `pending` reserved). |
| Listing | `missions/index.get.ts:5-44` | `active` = approved & deadline>now (deadline asc nulls last); `expired` computed not stored; pending/rejected visible to staff-or-creator only (`:34`). |
| Submission | `missions/[id]/completions/index.post.ts:14-38` | active membership required (`:18-19`); expired/blocked via `missionStatus` (`utils/missions.ts:24-25` → `INVALID_STATE`); proof shape enforced: link = https URL (`:6`, `:23`), text required (`:24`); **proof `none` accepts anything submitted? — `proof` field optional in body; for `proof:'none'` missions no check that extra proof is absent (minor gap)**; auto-review grants XP in same tx (`:32-33`); one completion per fan enforced by `mission_completion_once_uq` + `onConflictDoNothing`. |
| Late submissions | same file `:16-17` | deadline pass → completion rejected outright. **No grace period; submissions-made-before-deadline but reviewed-after are allowed implicitly** (approve has no deadline check) — guide `5.missions-xp.md:69` confirms intent. |
| Review reversal | `approve.post.ts:10-11`, `reject.post.ts:14-15` | rejected→approve = INVALID_STATE; approved→reject = INVALID_STATE. Reversal is impossible (no unapprove). Rejection requires reason (`reject.post.ts:5`). No resubmit (unique constraint). |
| Duplicate award | `grantXp` `utils/missions.ts:16-22` + `xp_transaction_source_uq` `app.ts:277` | insert-or-return-existing; verified at schema level. |
| What's NOT implemented (DEC-12 scope) | none found | mission edit/close/pause route (mission `status:'closed'` in enum `app.ts:242` but **no route sets closed**); XP-reward-failure compensation; fan proposal routes MIS-04/05 correctly absent. |

### 2. Join-route concurrency vs `3.communities.md:40` — MECHANISM DIFFERS
Guide documents: `INSERT ... ON CONFLICT DO NOTHING` + `UPDATE communities SET originals_assigned = originals_assigned + 1 ... WHERE originals_assigned < 100 RETURNING`. **Actual code:** transaction + `SELECT ... FOR UPDATE` row lock on the community row (`join.post.ts:16` → `loadVisibleCommunity(..., lock=true)` → `community.ts:45` `.for('update')`) and `.for('update')` on the membership row (`:17`); position computed in app code (`:26`) and written unconditionally with the count update (`:27`); membership insert is a plain insert relying on the prior locked read (`:28`). **Equivalent guarantee** (community row lock serialises joins; ≤100 positions) but NOT the documented SQL mechanism — and the plain insert has no `ON CONFLICT` guard, so a race that somehow passed the locked read would hit the unique constraint as an unhandled 23505 error rather than a graceful 200. Flag to lead as a doc-vs-code mismatch plus a latent error-path gap.

### 3. Reporter identity vs `app.ts:206-207` comment — MOSTLY ENFORCED, ONE EXPOSURE
- Reporter-facing response carries only `{id, status, createdAt}` — no reporterId, no outcome (`reports/index.post.ts:12`).
- **Admin queue DOES expose `reporterId`** (`utils/reports.ts:31` `adminReportView` includes it; `admin/reports/index.get.ts:20` and `actions.post.ts:50` return it). The schema comment says "never revealed to the reported user" — admins seeing it may be intended (moderation needs), but it is a documentation gap that the admin payload includes reporter identity; whether that's acceptable under the "reporter does not see the outcome" + "never revealed to reported user" rule is an owner call. Test at `moderation.test.ts:53` asserts `reporterId` IS in the admin payload.
- No public route serializes reports to the reported user — verified (no GET for reports outside `/api/admin/**`).

### 4. OpenAPI vs code vs guide
- `guide/tests/unit/openapi-sync.test.ts` EXISTS and does verify guide↔yaml agreement (route IDs, statuses, paths) — the `0.index.md:6` claim is real, **but the test lives in `guide/tests/`, not `tests/`** as the brief's phrasing might suggest; and it only checks doc↔yaml, **not code↔contract** (no test compares `server/api/**` files to yaml paths — an orphan route or missing route would NOT be caught). `_docs/openapi.get.ts` derives `x-services` from code at runtime but is not a test.
- Route coverage vs yaml: all implemented yaml paths have matching route files (checked file list against yaml paths). Yaml `deferred` paths (PLN-01..04, TAL-08, ADM-18, MIS-04/05, MED-01) correctly have no handlers. Mismatches found:
  - `PATCH /api/admin/badges` and `POST /api/admin/badges/{id}` are declared in yaml (lines 151, 216) — **no such routes exist** (only `PATCH /api/admin/badges/{id}` and `POST /api/admin/badges`). The index row ADM-16 (`0.index.md:107`) also lists `PATCH /api/admin/badges` and `POST /api/admin/badges/:id` — doc/yaml list operations that don't exist; the sync test can't catch this because it only compares doc↔yaml.
  - No yaml entry for `GET /api/auth/username-check`'s query shape beyond a bare param; response schemas are empty throughout (all ops return only `200: description: Success`) — the contract is a route-list, not a payload contract.
  - `GET /api/me/memberships` yaml has no `status` parameter; code accepts `active|left` (`me/memberships.get.ts:5`) — minor.

### 5. Migration/backfill implications for later tasks
Additive (safe, no backfill harm): lane enum/check on `membership.lane` (nullable today — existing rows null, needs policy on whether null is allowed); removal-count + rejoin-blocked-until columns or a `FandomRemoval` table (new table is purely additive; a column on `membership` backfills 0); `communityId` column on `xp_transaction` for fandom-scoped XP (**needs backfill decision**: existing rows have no community; mission-completion rows could be backfilled via `missionCompletion→mission.communityId`, `admin_adjustment` rows cannot); tier derived columns (none needed if computed); notification type enum (additive constraint on free text — destructive only if existing type strings violate it).
Potentially destructive/none identified: no required change found that drops data; **changing DEC-04 behaviour (retire position on leave) is a semantic change, not a schema change — it would invalidate existing `left` memberships' preserved positions → flag for owner permission**; likewise changing `removed` semantics under DEC-03 (currently permanent ban) affects existing `removed` rows' rejoin eligibility.
Rollback: all proposed changes are additive columns/tables → reversible by dropping them without touching confirmed-working features, EXCEPT any DEC-04/DEC-03 behavioural change which alters meaning of existing rows and is not rollback-safe without a data audit.

---

## 2. Stage 1–2 requirement findings matrix
(verdicts: never `present+tested` — nothing was run)

| Requirement | PRD citation | Code citation | Test citation | Verdict |
|---|---|---|---|---|
| Sign up/sign in/session/verified email | §6.1 (lines 216-243 — line range NOT read this session; heading at :216) | `auth/[...all].ts:1-2`, `utils/auth.ts:14-91` (requireEmailVerification:true at :21; DOB/age gate :56-59; reserved usernames :53) | `tests/e2e/api.test.ts:24-77` | present+untested |
| Onboarding + interest selection | §6.2 (:243) | `onboarding/index.get.ts`, `index.put.ts:13-35`, `complete.post.ts:13-26` | `api.test.ts:99-121` | present+untested |
| Approved Star access (application → accept → role+talent+community) | §6.3(:333)/Star-side §4 (:2336), §20.1 (:3635-3649) | `talent-applications/index.post.ts`, `admin/applications/[id]/accept.post.ts:9-29` (atomic grant), `ensureTalentCommunity` `utils/admin.ts:42-52` | `talent.test.ts:35-60` | present+untested |
| Identity claim path | Star-side §2.2, §23.1 | `talents/[id]/claims.post.ts`, `admin/claims/**` | `talent.test.ts:78-102` | present+untested |
| Fandom browse + join | §6.7 (:387) | `communities/index.get.ts`, `[id]/index.get.ts`, `join.post.ts` | `communities.test.ts:31-67` | present+untested |
| **Lane selection at join (one lane)** | §6.8 (:420-465), Journey C (:1333), PRD KPI :1915, §18 :1975 | **none found** — `lane` never written (grep, §DEC-01 above) | **none found** | absent |
| Limited content publishing (text drops; voice/image blocked) | §6.6 (:361), Star-side §8-9 | `drops/index.post.ts:26` FEATURE_DISABLED for non-text; `dropView` locking `utils/drops.ts:20-26`; audience enforcement `canSeeDrop` `:13-17` | `drops.test.ts:34-110` | present+untested |
| Fan interactions (likes/replies) | §6.6, §6.12 | `drops/[id]/reactions/*`, `replies*`, `replies/[id].delete.ts` | `drops.test.ts:136-171` | present+untested |
| Feed (membership-scoped, keyset, scheduled visibility) | §6.3 (:268) | `feed.get.ts:17-28` | `drops.test.ts:112-134` | present+untested |
| Voluntary leave | §6.18 (:1028) | `leave.post.ts` — **but no XP/tier/original cleanup, contradicting PRD :1066-1080** | `communities.test.ts:43-46` | present+untested (partial vs PRD) |
| Reporting | §12 (:1581), PRD §6.19 trigger | `reports/index.post.ts`, `admin/reports/*` | `moderation.test.ts:36-61` | present+untested |
| **Blocking** | §12 required fan controls (:1585-1597 — NOT read; heading only) | **none found** — no block table/route | none found | absent |
| Removal restriction (30-day / permanent counting) | §6.19 (:1127-1130), §19 :2070-2072 | **none found** — permanent ban only, no count/cooldown | none found (removal tested at `moderation.test.ts:63-80` but not counting) | absent |
| Removal notification to fan | §6.19 (:1108-1144) | **none found** — no `membership.removed` notify call | none found | absent |
| Minimum admin controls (DEC-08 scope) | §14 (:1811), Star-side §20 | all `admin/**` routes (28) role-gated + audited; dashboard/audit/users/communities/reports/xp/badges | `talent.test.ts:104-130`, `moderation.test.ts` | present+untested |
| Star-created missions + fan completions + owner review | §6.11 (:682-702), Star-side §12 (:3029-3144) | `missions/*`, `mission-completions/*` (full row set above) | `missions.test.ts:35-117` | present+untested |
| Fan-proposed missions | §12.4 (:3092-3099), PRD §6.9 General tier | **none found** (deferred intentionally) | none | absent (intentionally deferred) |
| **Fandom-specific XP** | §6.9 (:508-576), "fandom's authoritative XP balance" (:564) | **none found** — `xpTransaction` has **no communityId** (`app.ts:267-279`); `/api/xp/me` returns a global sum (`xp/me.get.ts:7-10`) | none for fandom scope | absent (schema gap → migration needed) |
| Duplicate XP protection | §6.11 :702, :744 | `app.ts:277` `xp_transaction_source_uq`, `grantXp` `utils/missions.ts:16-22`, `mission_completion_once_uq` `app.ts:261` | `missions.test.ts:56-74` | present+untested |
| Tier calculation (Lurker..Superfan) | §6.9 (:518-576), :1364, §18 :1978 | **none found** — zero tier code; XP is "a score only" (`xp/me.get.ts:3`) | none found | absent |
| Second lane at Supporter (100 XP) | §6.9, :1364, Journey D (:1346), §18 :1977 | **none found** — depends on lane + tier, both absent | none found | absent |
| Essential in-app notifications | §6.15 (:907), §10 (:1494), Star-side §16 | `notifications/*` routes; emission set enumerated under DEC-10 above | `watch-parties.test.ts:100-116` | present+untested (event set for pilot = DEC-10) |
| Auditable admin reward correction | §13.4 (:1717), PRD §6.6 | `admin/xp-adjustments.post.ts` + `xp.adjusted` audit `:15` — **no negative-balance guard (DEC-11)** | `missions.test.ts:119-133` | present+untested (missing DEC-11 guard) |
| Atomic XP/tier cleanup on leave/removal (TASK-0012-B) | §6.18 :1066-1080 | **none found** — leave/removal touch only membership row + memberCount | none found | absent |
| Measurement: join/leave/report & mission/XP | §16 (:1902-1931) | raw columns exist (`membership.joinedAt/leftAt`, `report.created_at/decided_at` `:218-219`, `missionCompletion.created_at/reviewed_at` `:258-259`); **no aggregation routes/events**; `admin/dashboard` has hardcoded `openReports: 0` (`admin/dashboard.get.ts:15-16` — stale: reports now exist but the count is still 0) | none found | absent (data present, no measurement surface) |
| Originals wall | §6.18/§10, PRD :1729 | `originals.get.ts`, `originalsAssigned` cap enforced via row lock | `communities.test.ts:51-52,56-67` | present+untested (DEC-04 governs policy conflict) |
| Watch parties | §6.13 (:851), Star-side §14 | `watch-parties/**` + cron job `internal/jobs/notifications.post.ts` | `watch-parties.test.ts:34-98` | present+untested |
| Account deletion/purge | §12 privacy, Star-side §17.5 | `me/index.delete.ts`, `internal/jobs/purge.post.ts` | `api.test.ts:65-76`, `watch-parties.test.ts:118-135` | present+untested |

---

## 3. Notable input-validation / authz / edge-case gaps observed

1. **`admin/dashboard.get.ts:15-16`** — `openReports` hardcoded to 0 with a stale comment "until the reports domain ships"; reports domain shipped. Real bug: admin dashboard under-reports safety workload.
2. **`join.post.ts:28`** — plain `insert` without `onConflictDoNothing`; unique-violation path is an unhandled 500 rather than graceful (guide documented ON CONFLICT).
3. **`missions/[id]/completions/index.post.ts:6`** — for `proof:'none'` missions, a client can still submit proof text/links; stored as null so harmless, but silently ignored rather than rejected — also `proof.link` allowed on `proof:'text'` missions? Code only stores the required field (`:28`), so extra fields are discarded silently.
4. **`admin/xp-adjustments.post.ts`** — no balance check (DEC-11), also `userId` is a free string (not uuid-validated) though user IDs are text — consistent with user.id being text.
5. **`reports/index.post.ts:22`** — `assertReportTarget` for `targetType:'mission'` falls through to `notFound()` (`utils/reports.ts:13-28`: mission not handled despite being in the enum `app.ts:210` and the body enum `:6`) — **reporting a mission always 404s**. Real bug.
6. **`rateLimit` coverage is partial**: join (60/hr — guide §1.7 says 60/min), report (10/min — guide says 60/min writes), reply, username-check, delete-me, talent-application, identity-claim, onboarding-complete. **No rate limit on drop creation, like/unlike, RSVP, membership patch, mission completion submissions.** NOT VERIFIED whether `rate-limit.ts` implements fixed-window Postgres counters as designed (file grepped, not read).
7. **`assertReportTarget` for `user` (`reports.ts:23-26`)**: any existing user ID is reportable with no visibility check — acceptable for users, but note `targetId` for user-type reports accepts any string ≤100 chars (`index.post.ts:7`) — fine.
8. **`watch-parties/[id]/rsvp.put.ts:12-14`** — `going` is hardcoded `true` with dead else-branch (same in `.delete.ts` with `going=false`); harmless duplication but the `delete` path in put is unreachable.
9. **`loadDrop` authz subtlety (`utils/drops.ts:39`)**: non-live drop → NOT_FOUND for non-staff non-author — good; but draft visibility for *community owner who isn't author* relies on `isStaff` via `talent.userId` — verified correct.
10. **`originals.get.ts`** is public per guide intent; `members.get.ts` requires active membership or staff — matches guide.
11. **`purge.post.ts:13-14`** decrements member_count for `active` memberships of purged users — correct; positions stay retired as designed.
12. **`missions/index.get.ts:17`** — non-admin viewers see missions only where `community.status='active'`; but `communityId` filter path uses `loadVisibleCommunity` first — consistent.
13. **`me/index.delete.ts:12-15`** — password re-auth via Better Auth context verify; users without a credential account (future OAuth-only) would 403 forever — edge case for later.
14. **No `PATCH`/`DELETE` on `admin/audit`** — verified (test also asserts 404).
15. **`talents/[id]/index.get.ts:12`** — `claimed` is a boolean but guide shape says `isClaimed`; test asserts `isClaimed` in `discover-talent.test.ts:72` — check: that assertion is on `PATCH /api/talent/profile` response (`talentView`), not CAT-06. Minor shape inconsistency between `talentView` and CAT-06's hand-built view (`talents/[id]/index.get.ts:12` uses `claimed`). Verify `talentView` in `talentProfile.ts` — NOT VERIFIED (file not read).

## 4. NOT VERIFIED (requires commands or unread files)
- All test results — owner must run `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e`.
- `server/utils/` files not read: age, api-error, catalog, cron, cursor, db, email, notifications, onboarding, paginate, rate-limit, talent-applications, talentProfile, validate, watchParties (15 files; the 6 read were admin, auth, community, drops, missions, reports).
- `server/db/migrations/0000_keen_doctor_faustus.sql` — exists, not read; whether a migration baseline matches the schema is unverified.
- Whether Nitro middleware exists for admin defence-in-depth, requestId, CSRF Origin check, body-size cap (guide §1.5/§1.4/§1.1 claims) — no `server/middleware/**` found via glob, but root-level middleware location not confirmed.
- Fan-side PRD §1–6.10, 6.12–6.17, 7–15 (lines 1–679, 1150–1901) and Star-side §1–11 (lines 2142–3028) — section names enumerated from headers but content not read this session.
- Seed script (`scripts/seed.mjs` referenced by `tests/e2e/global-setup.ts:15`) — not read.

## 5. Key file counts (for coverage proof)
- `server/api/`: **97 route files** read in full
- `server/db/schema/`: **3 files** read in full
- `tests/unit/`: **2 files**; `tests/e2e/`: **11 files** (10 specs + `helpers.ts` + `global-setup.ts`) — all read
- `guide/content/99.api-reference/`: **9 pages** — all read
- `guide/tests/`: **4 files** — all read
- `openapi/clautverse.yaml`: 2047 lines — all read
- PRD: sections §6.11, §6.18–6.19, §16–19, Star §12–§31 read (ranges cited above)

**Top findings to relay:** (1) lanes, fandom-scoped XP, tiers, blocking, removal counting, removal notification, XP-cleanup-on-leave, and measurement surfaces are all **absent** — the Stage 2 XP/tier/lane work needs a schema migration (communityId on xp_transaction needs a backfill policy). (2) DEC-04 confirmed real conflict: code preserves Originals position on leave/rejoin, PRD requires retirement. (3) Join concurrency works via SELECT FOR UPDATE row lock, not the guide's documented conditional UPDATE — same guarantee, different mechanism, plus a missing ON CONFLICT safety net. (4) Admin report view exposes `reporterId` — needs owner ruling whether that's acceptable. (5) `targetType:'mission'` reports always 404; `admin/dashboard` openReports is a hardcoded 0. (6) The doc↔yaml contract test exists but lives in `guide/tests/` and cannot detect code↔contract drift — demonstrated by two phantom admin badge operations in yaml/index.