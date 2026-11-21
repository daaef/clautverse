# MVP planning handoff

## Mandate and boundaries
The owner approved creating a backend-oriented MVP plan and role task briefs, saved in `docs/mvp/`. Planning only: no application, schema, test, dependency, deployment, or configuration edits. No implementation is authorised by this document. Existing behaviour is not assumed verified or frozen; any behaviour the owner has confirmed working requires agreement before changes. Never run commands: the owner alone runs builds, tests, installs, migrations, deployments, or other shell commands. Read/search/write tools may be used. Never expose secrets. Do not edit the source PRD or existing guide.

## Owner-approved direction
Plan broadly but build complete feature slices. Free pilot, no money or purchased progress. Stage 0 reconcile rules and assess existing backend. Stage 1 community foundation: identity, approved Star access, fandom information, browse/join with one lane, limited content publishing and fan interactions, reporting/blocking/leaving, minimum admin controls. Stage 2 participation loop: Star-created missions, submissions and review as applicable, fandom-specific XP/history and duplicate protection, tier calculations, optional second lane at Supporter, essential in-app notifications, auditable admin reward correction. Stage 3 operate and measure repeated participation, Star contribution and review effort, safety workload and disputes. Instrument necessary measurement during delivery, not after pilot begins.

Original numbered early-member recognition is conditional on resolving allocation/leave/rejoin rules, and must not block the pilot. Founding Pledge Stars and any unspecified Founding badge are deferred. Tier thresholds in PRD: Lurker 0 (no visible indicator), Supporter 100, Soldier 500, General 2000, Superfan 5000. Initially defer General fan mission proposals, special hostile-fan flags, Royal/Diamond skins and Superfan public featuring. Ordinary reporting is available regardless of earned tier. Never advertise deferred privileges as available. This is a pilot deviation from full PRD, requiring explicit release acceptance.

Deferred pipeline: payments, paid Star plans, badge skin purchases, boosts, in-app streaming/synchronised playback, referrals/rewarded growth, competitive leaderboards, advanced analytics/recommendations, fan-proposed missions/special flagging. Future monetisation is tracked with prerequisites and open decisions, not speculative tables, checkout routes or providers. Keep membership, authorisation, earned recognition and future purchase entitlements conceptually distinct. Backend release controls do not replace resource permission checks. No general messaging/DM capability.

## Sources to read in full
- `/Users/aef/Projects/clautverse/Clautverse Ecosystem PRD.md` (4467 lines; fan and Star PRDs, admin dependencies but not a standalone full admin PRD).
- `/Users/aef/Projects/clautverse/README.md`
- `/Users/aef/Projects/clautverse/package.json`
- `/Users/aef/Projects/clautverse/server/db/schema/app.ts`
- `/Users/aef/Projects/clautverse/guide/content/99.api-reference/8.discover-plans.md`
- `/Users/aef/.config/devin/AGENTS.md`
- `/Users/aef/.claude/CLAUDE.md`
Read other actual files before asserting implementation facts. Repository guide labels are documentation assertions, not passing-test evidence. No runtime verification has been performed in this session.

## Known questions to preserve, not decide silently
Canonical lane names differ between PRD definitions and joining journey; whether lanes change. XP qualifying activities, amounts, caps, reversals/demotion and unlock effects. Membership departure/rejoin/removal/appeal counting and policy; Star vs platform authority. Original badge retirement versus current backend preserving position on voluntary rejoin; Star-side Originals also described as publishable content. Founding pledge meaning undefined. Initial content formats, fan publishing authority, privacy/join rules, supported mobile platforms, pilot cohort and thresholds, admin security requirements, Star provisioning/application requirements, notification scope. Decisions block only dependent tasks; unrelated exploration can proceed. Do not invent approved policy, prices, enum values, endpoints, limits, legal age or delivery estimates.

## Required outputs
Create `docs/mvp/plan.md` as short master index and `docs/mvp/status.md` tracking decisions/tasks/gates with initial honest status, plus focused companion decision/scope/pipeline docs and small individually numbered task briefs under `docs/mvp/tasks/` as useful. Keep documents focused and roughly under 200 lines each. This brief is the handoff; no need to duplicate it in every file. All links must resolve to existing output or actual source, not future fictional files. Future output filenames must be labelled planned deliverables, not live links.

Plan must be immediately useful to global role agents: stable task IDs; dependency order; exact role ownership; per-task purpose, scope, inputs, allowed output boundaries (future implementation file allowlists approved after assessment), acceptance criteria, test expectations, independent reviewer, owner evidence, blockers and definition of done. Include test-author before security-sensitive implementation, secure-implementer for auth, membership authorisation, clocks, XP/scoring, permissions, moderation/audit, and reviewer after each code/spec task. Gate-reviewer only after all phase tasks pass. Designer for fan/Star/admin screen behaviour; researcher only for actual external questions; implementer for ordinary UI; editor only exact non-sensitive edits. The lead coordinates, not implementation. Future review uses a different role, not writer self-review. Role descriptions are assignments, not permissions to run commands.

Stage 0 gap assessment is a future full scoped task: inventory contracts, schema, consumers and tests against approved rules; evidence matrix distinguishes present code/tests from owner-confirmed behaviour. Do not pretend this planning task has completed that assessment. Include data migration/backfill and existing-user considerations, rollback/release strategy (no destructive steps without specific owner permission), visibility/privacy and concurrency tests, observability and minimal privacy-conscious analytics, cross-surface dependencies and pilot operations. Tests must cover empty/missing/malformed inputs, boundary values and large/concurrent/retry cases as applicable.

Document owner approval gates: planning acceptance is not approval of outstanding rules, rewrite or implementation. Current permission is create/review planning artifacts only. Cite PRD sections and real source locations for requirements. No architecture rewrite, microservice mandate, unverified new dependency or billing implementation.

## Worker report required
List files written and task map, decisions still blocked, one concrete pilot walkthrough, edge-case treatment, NOT VERIFIED and no claims tests pass. Independent reviewer will inspect and save a review in `docs/mvp/`. No commands are required to verify Markdown planning artifacts; owner review is the acceptance step.
