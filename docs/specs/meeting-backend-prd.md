# Cloudverse MVP — Backend Product Requirements Document

**Version:** Draft v0.1  
**Status:** Working specification; not yet approved as a final build contract  
**Date:** 30 October 2026  
**Owner:** Afekhide Gbadamosi  
**Product:** Cloudverse reality-TV MVP

## 1. Purpose and source boundaries

This document turns the meeting-derived Cloudverse notes into a backend-focused build specification. It is intended to guide implementation planning, API design, data modeling, and testing while preserving the distinction between what the meeting settled and what still needs confirmation.

The meeting notes supplied by the product team are the source for product direction. Technical structure and acceptance criteria added here are recommendations unless marked as agreed. Do not treat open business rules as settled simply because a route or database field is proposed.

### Status labels

- **Agreed:** explicitly stated as a meeting decision in the supplied notes.
- **Proposed:** a technical or product recommendation to make implementation testable.
- **Open:** requires a decision or more transcript/design detail before the behavior is finalized.

## 2. Product and backend summary

Cloudverse is a fan platform where fans join communities around talents, participate in fandom activities, and earn XP. Rising Stars can build and monetize their fanbase through posts, missions, watch parties, and talent tools.

The MVP is focused on reality TV, with other interest categories visible but inactive. The experience is mobile-first. The backend must support fan onboarding, community membership, a feed, XP and missions, first-100 Originals membership, talent applications, watch parties, and essential Super Admin operations.

### MVP outcome

Provide a secure, reliable backend that supports a small reality-TV launch and can evolve without requiring a redesign of every API or data record. Do not overbuild for speculative future categories, regional servers, or monetization features that remain unresolved.

## 3. Working stack and deployment assumptions

These reflect the current working direction from the conversation, not a substitute for confirming implementation details.

| Layer | Working choice | Status / notes |
|---|---|---|
| Full-stack framework and API | Nuxt with Nitro server routes | Working direction; Nuxt/Vue matches the backend lead’s stronger experience. Confirm exact Nuxt version and project structure before scaffolding. |
| App hosting | Vercel | Selected by the user. Hobby may be used only where its non-commercial terms permit; check the plan before commercial use or launch. |
| Database | Neon PostgreSQL | Selected by the user. Keep the database separate from the Nuxt application. |
| ORM/query layer | Drizzle is a candidate | Proposed earlier, not yet explicitly selected. Choose before creating the first production schema/migrations. |
| Authentication | Provider and session model undecided | Open. Do not implement custom password storage before this decision. |
| Object/file storage | Provider undecided | Open. Store user-uploaded media outside ephemeral application storage. |
| Future hosting | Contabo with Docker for app and database | Future option only, not an MVP deployment requirement. Preserve portability and document the operational responsibilities of self-hosting. |

### Architecture principles

- Keep Nitro route handlers thin: validate requests, identify the caller, invoke a domain/service function, and return a consistent response.
- Put business rules in testable service modules rather than in UI components or route handlers.
- Keep database access behind a repository/query layer where useful.
- Use versioned migrations; do not manually change production schema.
- Keep credentials and privileged database access server-side.
- Avoid provider-specific behavior in core business rules where a portable alternative exists.
- Use transactions for multi-record changes and uniqueness-sensitive rules, especially Originals allocation and XP grants.

## 4. Roles and authorization

| Role / status | Description | Backend access expectations |
|---|---|---|
| Fan | Standard signed-in user | Can manage their own profile, onboarding choices, memberships, lane, alerts, and allowed participation. |
| Rising Star / Talent | Approved talent account | Can manage the approved talent profile and permitted community content, missions, watch parties, and dashboard data. |
| Super Admin | Platform operator | Can review applications and claims, manage communities and platform settings, moderate content/accounts, and access admin data. |
| Original | Membership entitlement for the first 100 eligible community members | Not necessarily a separate account role. Enforce as a community-specific entitlement; exact benefits and content access remain open. |
| Unauthenticated visitor | A visitor without a session | May access only routes and information explicitly designated public. Full public-vs-member visibility rules are open. |

**Proposed requirement:** Every protected operation must authorize the caller on the server. Hiding a button in the frontend is not authorization. Scope talent permissions to the talent/community they own or manage. Record privileged admin actions in an audit log.

## 5. Scope

### 5.1 In scope for the backend MVP

- Registration/sign-in/session handling, subject to auth-provider selection.
- User profile and onboarding completion.
- Reality-TV category plus country, show, season, and talent catalog lookup.
- Talent profiles and Rising Star applications.
- Communities and fan memberships, including lane and alert preference.
- First-100 Originals assignment, once the edge cases are decided.
- Feed and drops, including audience and publication state.
- Reactions and replies if confirmed in the product screens.
- Missions, approval, completion tracking, and XP ledger after rules are finalized.
- Watch-party records and shareable links.
- Basic Super Admin tools for applications, claims, communities, moderation, badges, XP configuration, and audit history as required by finalized admin designs.
- Pagination, validation, errors, logging, migrations, and automated tests for implemented flows.

### 5.2 Out of scope or deferred

- Active sports, music, tech, esports, or other categories.
- Native mobile applications.
- Full subscription billing and payment-provider integration until launch scope and commercial rules are approved.
- Paid Discover placement and advertising.
- XP purchase flow until safeguards, pricing, and applicable operational requirements are approved.
- Advanced analytics, city-level insights, and exports unless required for the launch cutline.
- Regional deployments, microservices, and multi-region database topology.
- A separate real-time architecture unless polling/event requirements demonstrate it is needed.

## 6. Functional requirements

### 6.1 Authentication and account

**Proposed requirements**

- Users can register, sign in, sign out, and recover access using the selected authentication provider.
- A user must have a valid session before accessing private account data or protected actions.
- Responses must not expose password credentials, session secrets, private evidence, or privileged fields.
- Account states should support at least active and suspended/disabled states, subject to admin policy.
- Store created/modified timestamps for mutable records.

**Open:** Authentication provider, login methods, age/consent fields, username rules, account deletion/retention policy, and whether email verification is required.

### 6.2 Onboarding and catalog

**Agreed direction:** Reality TV is the only active category at launch; other categories may appear as inactive/coming soon. Onboarding maps a fan to interests and talent-related data.

**Proposed requirements**

- The client can fetch active categories, countries, shows, seasons, and talents through API endpoints.
- Catalog filtering should support the selected country/category/show context.
- The server rejects onboarding values that do not exist or are inactive.
- Onboarding completion is persisted and can be resumed if incomplete.
- Only collect fields required for a stated product purpose.

**Open:** Exact onboarding sequence, whether country/show/season/talent are required, full signup fields, age handling, and whether only one interest is required for the first release.

### 6.3 Talent profiles and applications

**Agreed direction:** A prospective talent can apply through “Building my fandom”; Super Admin reviews applications. Talent identity claims/evidence are part of the admin scope.

**Proposed requirements**

- Applicants can create and view their own application and see its status.
- Application status supports pending, accepted, and declined; additional states require confirmation.
- Only authorized admins can accept/decline applications or verify claims.
- A decision records the acting admin, decision, timestamp, and optional internal note.
- Do not expose identity evidence to other fans or talents.
- Only approved talent accounts can use protected talent-management endpoints.

**Open:** Required evidence, application edits/resubmission, notifications on decision, and whether approval automatically creates or links a talent account/community.

### 6.4 Communities, memberships, and Originals

**Agreed direction:** Fans must join a community to see its full posts. The first 100 fans to join become Originals. Users can switch membership lanes in Settings. Super Admin has veto power over communities.

**Proposed requirements**

- A user can list discoverable communities, inspect an allowed community preview, join, leave, and list their memberships.
- Membership is unique per user/community pair; repeated join calls must not create duplicates.
- The membership stores join time, lane, state, and alert preference.
- Lane changes apply to the user’s existing membership and are auditable if needed.
- Originals assignment is atomic and concurrency-safe: two near-simultaneous joins cannot exceed the cap of 100.
- Preserve an auditable record of the assigned Originals position and assignment time.
- Enforce member-only visibility on the server, not only in the feed UI.
- Community create/approve/veto actions are restricted to authorized owners/admins.

**Open:** Whether a departing Original’s slot can be reassigned, how suspended/removed members affect Original status, whether membership requires XP, how previews work, and the exact Originals-only content entitlement.

### 6.5 Drops and feed

**Agreed direction:** Talent can publish drops in text, voice, or image formats; feed aggregates posts from joined communities. Audience/locked content is not fully decided.

**Proposed requirements**

- A drop records author, community, type, content/media reference, audience, status, and publication/scheduling timestamps.
- Only authorized authors can create or edit their content.
- Draft and scheduled content are not returned as published content before the publish time.
- Feed supports filtering by community and date, with cursor-based pagination.
- Each page of results has a stable sort order and does not repeat items across cursors.
- Reactions and replies are permission-checked and tied to valid drops.
- The response omits locked content body and sensitive media references when the viewer is not entitled to access them.

**Open:** Whether fans may publish drops, whether fan mission posts require approval in a separate workflow, audience values, public previews, editing/deletion rules, and whether voice/image uploads are required at launch.

### 6.6 Missions, completions, XP, and badges

**Agreed direction:** Missions have rewards and expiry; fan-created mission posts need owner approval before becoming public. XP and badges can be configured in the Super Admin dashboard. XP purchase was mentioned as a possible revenue point.

**Proposed requirements**

- A mission has a community, creator, title, description, reward, deadline, status, and completion policy.
- Pending missions are not publicly discoverable until approved by an authorized owner/admin.
- Expired or rejected missions cannot award XP.
- A completion record prevents duplicate reward claims unless repeat completion is expressly allowed.
- XP changes are recorded in an append-only ledger with user, amount, source, timestamp, actor, and related mission/activity where applicable.
- Update any displayed XP balance atomically with its ledger record or derive the balance from the ledger.
- Admin changes to XP rules and badge criteria are authorized and auditable.

**Open:** Mission proof/evidence, who reviews completion, reward values, repeatability, thresholds, whether XP is purchasable at launch, whether XP expires, and which privileges XP unlocks. Do not implement paid XP or enforce a 100-XP threshold until confirmed.

### 6.7 Watch parties

**Agreed direction:** Users can discover upcoming/past watch parties; Rising Stars can create/manage them and notify fans.

**Proposed requirements**

- Store title, community, host, start time/time zone, status, shareable link, and created/modified timestamps.
- Only authorized hosts/talent/admins can create or update events.
- Listing supports upcoming and past states with pagination or bounded date ranges.
- Notifications are sent only if notification behavior and provider are implemented and approved.

**Open:** Whether Cloudverse hosts video/chat or records an external link only; time-zone behavior; RSVP/attendance; reminders; event cancellation; and notification channels.

### 6.8 Discover, plans, and analytics

- Discover can return active talents/communities and suggested listings based on confirmed MVP rules.
- Featured/paid placements are deferred unless explicitly approved for launch.
- Plan names shown in designs do not establish price, entitlements, billing provider, or launch scope.
- Basic talent dashboard values may include fan count and growth, but metric definitions and aggregation windows must be documented before exposing them.
- Advanced/city-level analytics and exports are not required for backend launch unless confirmed by the final dashboard design.

### 6.9 Super Admin, moderation, and audit

**Proposed requirements**

- Admin endpoints require an explicit admin permission check on every request.
- Admin can review fans, talents, applications, claims, communities, content, reports, missions, plans, badges, and XP rules only to the extent needed for the approved launch dashboard.
- Reports include target type/ID, reporter, reason, status, and created/modified timestamps.
- Account/content actions are represented explicitly and logged.
- Audit entries include actor, action, target, timestamp, and optional internal note; normal users cannot modify or delete audit history.
- Veto, suspend, approve, reject, and other high-impact actions require server-side validation and clear outcomes.

**Open:** Exact admin pages/fields/actions, report status lifecycle, appeal process, moderation response time, and who besides Super Admin can review reports.

## 7. Proposed logical data model

This is a starting model, not a final migration. Confirm field requirements and relations against the final designs and transcript before production schema lock.

| Entity | Core fields / purpose | Key considerations |
|---|---|---|
| User | ID, username, email/auth reference, status, profile fields, timestamps | Auth secrets should be managed securely; age fields and retention need approval. |
| Category | ID, name, active state, sort order | Reality TV active; future categories inactive. |
| Country | ID, name/code, active state | Confirm whether this is catalog data or a user preference. |
| Show | ID, country/category, name, status | Validate onboarding references. |
| Season | ID, show, name/label, dates/status | Season representation needs product confirmation. |
| Talent | ID, user/account link if applicable, name, bio, links, image reference, status, claimed state | Distinguish an unclaimed talent profile from an authenticated talent user. |
| TalentApplication | Applicant, category, bio, links, image/evidence references, status, reviewer, timestamps | Evidence access should be restricted. |
| IdentityClaim | Talent, claimant, evidence reference, status, reviewer, decision timestamps | Keep private evidence out of ordinary API responses. |
| Community | ID, name, scope, owner, status, creator, timestamps | Define ownership, admin veto, and discoverability. |
| Membership | User, community, lane, joined time, status, alerts, Originals position | Unique user/community; concurrency-safe first-100 assignment. |
| Drop | Author, community, type, content/media ref, audience, state, schedule/publish time | Audience values remain open. Avoid returning protected body to unauthorized users. |
| Reaction / Reply | User, drop, content or reaction type, timestamps | Define uniqueness and moderation/deletion behavior. |
| Mission | Community, creator, title, description, XP reward, deadline, approval/status | Approval state and completion rules must be finalized. |
| MissionCompletion | User, mission, submission/proof, status, review, timestamp | Add uniqueness/idempotency based on repeatability decision. |
| XPTransaction | User, amount, source, related record, actor, timestamp | Append-only; use idempotent award logic. |
| Badge / UserBadge | Badge criteria and user/community award state | Criteria and recalculation behavior require confirmation. |
| WatchParty | Community, host, title, start/end, link, status | External link vs hosted event remains open. |
| Notification | User, type, read state, related object, timestamps | Notification channels and events are not finalized. |
| Plan / Subscription | Plan name/perks and talent subscription status | Defer billing implementation until plans/prices are agreed. |
| Report | Reporter, target, reason, status, timestamps | Define lifecycle and moderation rules. |
| AdminAudit | Admin, action, target, timestamp, internal note | Append-only and access-controlled. |

### Suggested integrity rules

- Use database constraints for primary/foreign keys, unique membership, and required fields.
- Use transactions or a database-safe locking strategy for Originals assignment and XP awarding.
- Give state transitions explicit allowed paths; do not accept arbitrary status changes from clients.
- Store timestamps consistently in UTC and render in the user’s locale.
- Store uploads as object-storage references, not large binary values in regular database rows, unless the storage decision dictates otherwise.

## 8. Proposed API surface

Endpoint names are examples for design discussion, not an approved public contract. Prefer consistent resource naming, request validation, authorization, pagination, and documented response/error shapes.

### Auth and account

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `PATCH /api/me`
- `GET /api/auth/username-check?username=...`

### Onboarding/catalog

- `GET /api/categories`
- `GET /api/countries`
- `GET /api/shows?countryId=...&categoryId=...`
- `GET /api/seasons?showId=...`
- `GET /api/stars?seasonId=...`
- `POST /api/onboarding/complete`

### Communities and memberships

- `GET /api/communities`
- `GET /api/communities/popular`
- `GET /api/communities/:id`
- `POST /api/communities/:id/join`
- `POST /api/communities/:id/leave`
- `PATCH /api/memberships/:id/lane`
- `PATCH /api/memberships/:id/alerts`
- `GET /api/communities/:id/members`
- `GET /api/communities/:id/originals`

### Feed and drops

- `GET /api/feed?communityId=...&from=...&to=...&cursor=...`
- `POST /api/drops`
- `GET /api/drops/:id`
- `PATCH /api/drops/:id`
- `POST /api/drops/:id/reactions`
- `GET /api/drops/:id/replies`
- `POST /api/drops/:id/replies`

### Missions, XP, badges

- `GET /api/missions?communityId=...&status=...&cursor=...`
- `POST /api/missions`
- `POST /api/missions/:id/approve`
- `POST /api/missions/:id/reject`
- `POST /api/missions/:id/completions`
- `GET /api/missions/:id/completions/me`
- `GET /api/xp/me`
- `GET /api/badges/me`

### Watch parties

- `GET /api/watch-parties?status=upcoming`
- `POST /api/watch-parties`
- `PATCH /api/watch-parties/:id`
- `POST /api/watch-parties/:id/notify` (only if approved notification behavior exists)

### Talent and admin

- `POST /api/talent-applications`
- `GET /api/talent-applications/me`
- `GET /api/talent/dashboard`
- `GET /api/talent/analytics`
- `PATCH /api/talent/profile`
- `GET /api/admin/dashboard`
- `GET /api/admin/applications`
- `POST /api/admin/applications/:id/accept`
- `POST /api/admin/applications/:id/decline`
- `GET /api/admin/claims`
- `POST /api/admin/claims/:id/verify`
- `POST /api/admin/communities`
- `GET /api/admin/reports`
- `POST /api/admin/reports/:id/actions`
- `GET /api/admin/audit`

### API quality requirements

- Use a consistent error response with a stable machine-readable code and safe user-facing message.
- Validate path, query, and body inputs server-side.
- Do not return secrets or unauthorized content.
- Use cursor-based pagination for potentially large feeds/members/admin lists.
- Define idempotency behavior for actions that award XP, join a community, or create a completion.
- Document authorization requirements for each route.
- Keep API response contracts stable where practical; introduce changes through reviewed, backward-compatible migrations and updates.

## 9. Security, privacy, and operations

### Security

- Enforce authentication and role/community authorization server-side.
- Use secure, HTTP-only session cookies or the selected provider’s recommended session pattern.
- Never store plaintext passwords or expose privileged database credentials to the client.
- Validate and normalize user input; apply request size limits and rate limits to sensitive routes as appropriate.
- Restrict access to identity evidence, reports, admin notes, and private content.
- Log high-impact admin actions without logging secrets or unnecessary personal data.

### Privacy and safety

- Confirm why age is collected, whether minors may use the service, and what consent/retention rules apply before launch.
- Define data deletion/export and retention behavior before collecting sensitive data at scale.
- Make report and moderation paths explicit; do not expose reporter identity unless product policy allows it.
- Minimize personal data in logs and analytics.

### Reliability and performance

- Keep API functions stateless for Vercel deployment.
- Use a Neon-compatible connection strategy/pooling configuration for serverless request patterns; test connection behavior under concurrent requests.
- Add health/build checks and structured error logging without exposing internals to clients.
- Define backups and a restoration test for the database.
- Set measurable latency, uptime, and recovery goals before launch rather than inventing targets here.

### Vercel and Neon deployment

- Use separate development/preview and production environments with separate credentials/databases or carefully isolated branches.
- Store database URLs and auth secrets in server-only environment variables.
- Run migrations as a controlled deployment step; avoid running destructive schema changes automatically on every function invocation.
- Test Vercel preview deployments against a non-production Neon database.
- Confirm Vercel plan terms before commercial launch; Vercel Hobby is not for commercial use.

### Future Contabo/Docker migration

A later Contabo deployment is optional. Keep the application portable by using Nuxt’s Node server output where possible, ordinary PostgreSQL features, environment-based configuration, and versioned migrations. A future self-hosting plan must separately specify Docker Compose, persistent database volumes, TLS/reverse proxy, firewalling, backups/off-site copies, monitoring, upgrades, secrets, and incident response. Do not treat “Docker for app and DB” as a complete operations plan by itself.

## 10. Testing and acceptance criteria

### Test layers

- Unit tests for domain rules, access checks, XP calculations, and state transitions.
- Database/integration tests for migrations, uniqueness, transactions, and serverless connection behavior.
- API tests for request validation, authorization, response shape, and error cases.
- End-to-end tests for the core fan and admin journeys once the frontend flows are available.

### Backend MVP acceptance criteria

1. Reality TV is returned as active; other categories are inactive and cannot be selected as active interests.
2. Unauthenticated callers cannot access protected profile, membership, talent, or admin data.
3. A fan can complete the confirmed onboarding flow and retrieve their saved profile.
4. A fan can join a community without creating duplicate memberships.
5. Server-side membership checks prevent unauthorized access to full community content.
6. Originals assignment, when enabled, cannot exceed 100 even under concurrent joins.
7. Feed pagination returns stable, non-duplicated results and filters by membership/audience rules.
8. A pending or expired mission cannot issue XP; duplicate completion attempts cannot double-award XP unless repeat rules explicitly allow it.
9. Every XP balance change is traceable to a ledger entry and source.
10. Only authorized talent/admin users can create or manage protected resources.
11. Admin decisions and high-impact moderation/account actions create audit records.
12. Automated tests pass for access boundaries, critical business rules, migrations, and error handling.
13. Preview deployment uses non-production data and does not expose server secrets.
14. All behaviors still marked Open in this document are either excluded from the MVP or have an approved decision recorded before implementation.

## 11. Suggested build sequence

1. **Foundation:** confirm repository, Nuxt/Nitro version, auth strategy, database access layer, migrations, environments, logging, validation, and API error convention.
2. **Identity and onboarding:** account/session flow, catalog reads, onboarding persistence, route guards.
3. **Communities:** community read/join/leave, membership/lane/alerts, access checks; finalize Originals rule before awarding status.
4. **Feed and drops:** membership-scoped feed, audience enforcement, pagination, reactions/replies if confirmed.
5. **Talent/admin:** applications, review actions, core community/admin operations, audit events.
6. **Missions and XP:** only after proof/completion/reward/threshold rules are finalized; implement ledger and idempotency tests first.
7. **Watch parties and notifications:** implement the confirmed external-link/event behavior and notification scope.
8. **Hardening:** privacy review, rate limits where appropriate, backup/restore test, trusted-user testing, and launch sign-off.

## 12. Decision register and transcript follow-up

Resolve or explicitly defer these before freezing the affected schema/API:

1. **Framework confirmation:** Nuxt/Nitro is the working choice; record stakeholder confirmation because React/Next.js was discussed in the meeting.
2. **Authentication:** provider, login methods, verification, recovery, session behavior.
3. **Signup/onboarding:** required fields, age handling, and exact country/show/season/talent flow.
4. **Originals:** vacancy/reassignment behavior, leave/rejoin behavior, status changes, and exact content/feature benefits.
5. **Content audiences:** public, community member, and Originals-only semantics; locked-preview data contract.
6. **Missions:** who can create, approval roles, evidence, review, expiry, repeatability, and abuse prevention.
7. **XP:** earning/spending sources, reward values, thresholds, purchase scope, limits, corrections, and whether rewards can be reversed.
8. **Watch parties:** hosted vs external, RSVP/attendance, time zone, reminders, and notification channels.
9. **Talent applications/claims:** evidence, decision lifecycle, notifications, and ability to resubmit.
10. **Admin:** exact required launch screens, fields, permitted actions, moderation lifecycle, and audit requirements.
11. **Plans/revenue:** pricing, entitlements, billing provider, paid Discover, and whether any belong in the first release.
12. **Privacy/safety:** age rules, minors, retention, deletion, reports, suspension, and data access.
13. **Operational targets:** launch success measures, performance targets, backup recovery expectations, and ownership of incidents.

## 13. Definition of ready for implementation

A backend feature is ready when its user-facing behavior, authorization rules, data lifecycle, error/empty cases, and acceptance tests are agreed; its API and schema proposal has been reviewed; and unresolved decisions that could change the schema or entitlements have been resolved or explicitly deferred. Implementing a route name alone does not make a feature ready.
