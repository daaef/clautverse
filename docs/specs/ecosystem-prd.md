# Fan Experience Application

Product Requirements Document \| Fan-Side Application \| Version 1.1 \| October 2026

This PRD defines the fan-facing Clautverse mobile application, covering its product vision, user experience, navigation, social and community features, Rising Star and fan interactions, monetization, notifications, safety, technical requirements, and acceptance criteria.

The document builds on the Clautverse direction we have discussed: Clautverse is a fan ecosystem, not a Discord or Twitter clone. The mobile app is one part of a wider platform that also includes a Rising Star experience and a Super Admin dashboard for managing platform activities.

Where a business rule has not yet been finalized, it is identified as a proposed requirement rather than an already-approved decision.

## 1\. Product overview

Product name: Clautverse

A digital fan ecosystem that connects fans with the people, creators, public figures, content, and communities they care about.

Product surface: Fan mobile app

The primary experience for fans to discover interests, follow Rising Stars, join fandoms, select fandom lanes, engage with content, complete missions, earn XP, and participate in fan activities.

Wider ecosystem

* Fan mobile application  
* Rising Star experience  
* Clautverse Super Admin dashboard

### Product vision

To create a central digital space where fans can discover, connect, interact, and build meaningful relationships around the people and interests they love.

### Product mission

Make fandom more interactive and rewarding by bringing content discovery, community participation, Rising Star engagement, fan identity, and fan experiences into one connected platform.

### Problem statement

Fan interactions are often spread across multiple social networks, messaging platforms, websites, and membership services. This makes it difficult for fans to find relevant communities, keep up with their favourite Rising Stars, participate meaningfully, and access experiences designed specifically for them.

Clautverse aims to bring these interactions into one dedicated fan ecosystem where participation is recognized through XP, fandom-specific badges, lane identities, missions, and community activities.

### Product goals

* Help fans discover Rising Stars, interests, content, and fandoms that match their preferences.  
* Make following and engaging with Rising Stars simple.  
* Encourage meaningful participation rather than passive content consumption.  
* Allow fans to express their role and identity within each fandom through lanes.  
* Reward legitimate fan participation through XP and badge progression.  
* Build a competitive but healthy fandom culture through missions, leaderboards, rallies, and watch parties.  
* Give fans customization options for their fandom badges.  
* Introduce optional paid XP Boosts and badge skins as monetization opportunities.  
* Enable Rising Stars to build and grow their fanbases.  
* Support a safe, moderated, and scalable platform.

### Non-goals

The fan app should not simply reproduce the full functionality of Discord, Twitter/X, or a generic messaging application.

The following are not core fan-side responsibilities:

* Managing the entire platform's operations.  
* Administering other users' accounts or platform permissions.  
* Managing Rising Star operations and analytics intended for their dedicated experience.  
* Performing moderation decisions reserved for authorized moderators or administrators.  
* Providing unrestricted public messaging without appropriate privacy and safety controls.  
* Allowing fans to create unapproved missions with immediate community-wide effect.  
* Allowing paid XP Boosts to bypass eligibility rules, moderation restrictions, or mission requirements.

## 2\. Product scope and ecosystem

Clautverse operates as a connected ecosystem. Each surface has a different role, but all three should work from a shared platform foundation.

01\. Fan mobile app

This PRD

Discover, follow, join fandoms, select lanes, publish or interact with content, complete missions, earn XP, customize badges, participate in watch parties, and manage personal activity.

02\. Rising Star experience

Build and manage a fandom, publish content, manage fan activities, review engagement, configure missions, approve fan-created mission proposals, and manage fandom-specific experiences.

03\. Super Admin dashboard

Manage users, Rising Stars, fandoms, reports, hostile fan flags, removals, moderation, XP rules, rewards, payments, platform configuration, and permissions.

### 2.1 Fan-side scope

The fan app should provide:

* Account registration, authentication, onboarding, and profile management.  
* Personalized home feed and discovery.  
* Rising Star profiles and following.  
* Fandom discovery, joining, and membership management.  
* Mandatory lane selection when joining a new fandom.  
* Fandom-specific XP, badge progression, and leaderboards.  
* Fan badge skin customization.  
* Missions and mission progress.  
* XP Boost purchase, activation, countdown, and expiry.  
* Watch parties, attendance tracking, and related XP.  
* Fan-created mission proposals at General tier, subject to Rising Star approval.  
* Hostile fan flagging at General tier.  
* Invitations, referrals, activity feeds, and notifications.  
* Fandom leaving, removal, suspension, and rejoining restrictions.  
* Privacy, safety, reporting, blocking, and account controls.

### 2.2 Out of scope for this PRD

The following belong primarily to other surfaces, although the fan app must support related user-facing actions:

* Full Rising Star management experience.  
* Super Admin account and role management.  
* Internal moderation queues and platform-wide enforcement tools.  
* Financial reconciliation and payment-provider administration.  
* Internal analytics configuration and backend administration.

## 3\. Target users and personas

**Persona A:** The casual fan

Primary user

Wants to discover favourite Rising Stars, follow updates, watch content, and interact without spending too much time navigating the app.

Needs: Simple onboarding, relevant feed, easy following, quick reactions, and clear notifications.

**Persona B:** The dedicated fan

Wants to feel connected to a Rising Star, participate in fan activities, earn XP, unlock badge tiers, and gain recognition within a fandom.

Needs: Fandom-specific identity, missions, XP, watch parties, rallies, lane progression, badge customization, and leaderboards.

**Persona C:** The fandom community builder

Wants to recruit fans, help the fandom grow, coordinate participation, and compete for recognition.

Needs: Builder lane, referral tools, missions, XP progression, leaderboards, and community activities.

**Persona D:** The creative fan

Wants to express their support through edits, artwork, threads, videos, and other fan-created work.

Needs: Maker lane, content discovery, publishing or sharing tools, recognition, and fandom participation.

**Persona E:** The dedicated fandom contributor

Tracks information, supports community discussions, helps organize activities, and wants to contribute beyond basic engagement.

Needs: Analyst and Fandom Builder lanes, advanced missions, moderation-aware participation, and higher-tier privileges.

## 4\. Product principles

1. Fandom first: Every major feature should support discovering, following, connecting, or participating in a fan ecosystem.  
2. Personal relevance: Prioritize content, Rising Stars, fandoms, and missions related to a fan's interests.  
3. Participation over passive scrolling: Give fans meaningful ways to contribute through discussions, watch parties, rallies, and missions.  
4. Progression with purpose: XP, lanes, and badge tiers should reflect meaningful involvement and unlock clearly explained privileges.  
5. Recognition without manipulation: Rewards should recognize legitimate participation without encouraging spam or artificial engagement.  
6. Identity within every fandom: A fan's lane, XP, badge tier, and leaderboard position belong to that specific fandom.  
7. Monetization without coercion: Paid badge skins and XP Boosts must be optional, clearly priced, and transparent about their effects.  
8. Trust and safety: Users should have clear controls over privacy, unwanted interactions, reports, and fandom removal.  
9. Mobile-first usability: Optimize for one-handed navigation, responsive layouts, low-bandwidth conditions, and clear loading states.  
10. Creator and fan separation: Fans should not be exposed to Rising Star management controls unless they enter an authorized Rising Star experience.

## 5\. Information architecture and navigation

The following is the proposed baseline navigation model for the fan app. It should be reconciled against the existing mobile frames before visual implementation.

Clautverse

Fan app

Persistent bottom navigation

Home · Discover · Communities · Activity · More

Home

Personalized feed, fandom updates and XP Boost banner

Discover

Search, trending topics, Rising Stars and fandoms

Communities

Fandoms, lanes, discussions, missions and watch parties

Activity

Notifications, XP rewards, invites and fandom updates

More

Profile, fandom badges, missions, XP Boost, saved content, settings, support, and Rising Star Hub

### Navigation requirements

* The active destination must be visually distinguishable.  
* Navigation state should persist when opening a detail page and returning.  
* Deep links from notifications should open the relevant post, profile, mission, watch party, or fandom.  
* Unread activity should be indicated without overwhelming the interface.  
* Protected or unavailable features must show a meaningful explanation rather than a dead end.  
* Back navigation must return users to their previous context, including search terms and feed position where practical.  
* XP Boost banners must appear directly below the page header on the Home feed, Missions Hub, and Watch Party room while the boost is active.  
* Fandom-specific information must always identify which fandom the XP, lane, badge, and leaderboard data belongs to.

## 6\. Functional requirements

Priority labels:

* P0: Required for the core launch experience.  
* P1: Important for a complete first release.  
* P2: Suitable for a subsequent release or when dependencies are ready.

These priorities are proposed planning recommendations, not approved release commitments.

### 6.1 Registration and authentication

Priority: P0

Objective: Enable users to create accounts, securely sign in, and recover access.

Functional requirements:

* Register with approved authentication methods, such as email or phone number.  
* Support secure sign-in and sign-out.  
* Verify contact details where required.  
* Provide password recovery or equivalent account-recovery flows.  
* Validate required fields and provide understandable error messages.  
* Prevent duplicate accounts according to platform identity rules.  
* Maintain secure sessions and handle expired sessions.  
* Support account deletion requests and communicate the consequences before confirmation.  
* Provide access to terms of service and privacy policy.  
* Provide a way to report authentication problems.

Acceptance criteria:

* A user can register and sign in with valid credentials.  
* Invalid or incomplete submissions produce clear validation feedback.  
* Recovery links or verification codes follow defined expiry and retry rules.  
* Authentication errors do not expose passwords, verification codes, or sensitive account information.  
* A deleted or suspended account cannot continue using authenticated features contrary to platform enforcement rules.

### 6.2 Onboarding and interest selection

Priority: P0

Objective: Help new users build a relevant Clautverse experience.

Functional requirements:

* Introduce Clautverse and its core value in a short onboarding sequence.  
* Collect a display name, username, and profile image where appropriate.  
* Allow users to select interests, favourite Rising Stars, and relevant categories.  
* Recommend fandoms and Rising Stars based on selected interests.  
* Allow users to follow suggested Rising Stars directly from onboarding.  
* Provide skip or later options for non-essential questions.  
* Save onboarding progress and selections.  
* Request notification permissions contextually.  
* Avoid making every onboarding step mandatory unless required for account security.

Acceptance criteria:

* A new user can finish onboarding without unnecessary steps.  
* Selected interests influence initial discovery recommendations.  
* Skipping optional steps does not prevent access to core features.  
* Onboarding is not repeated unnecessarily on every app launch.

### 6.3 Home feed

Priority: P0

Objective: Provide a personalized entry point into the Clautverse fan ecosystem.

Functional requirements:

* Display posts and updates from followed Rising Stars and joined fandoms.  
* Show recommended content from relevant interests.  
* Support trending or featured content where available.  
* Display author identity, profile image, timestamp, content, media, and relevant engagement counts.  
* Support text and approved media formats.  
* Provide post actions such as like/react, comment, share, save, and report according to permissions.  
* Include pagination or infinite scrolling with reliable loading states.  
* Support pull-to-refresh where appropriate.  
* Provide empty, loading, offline, and error states.  
* Allow users to indicate that content is not relevant, where supported.  
* Prevent duplicate posts caused by pagination or refresh.  
* Preserve scroll position when navigating back from a post.

XP Boost requirements:

* Display the persistent gold XP Boost banner directly below the page header while a boost is active.  
* Show a lightning bolt icon and the text “XP Boost active \- 2× on everything.”  
* Display a live countdown on the right, such as `23h 44m left`.  
* Update the countdown from the authoritative expiry timestamp.  
* Remove the banner automatically when the boost expires.  
* Tapping the banner should open the XP Boost details or status screen.

Acceptance criteria:

* The feed displays content the current user is authorized to view.  
* Engagement actions update their visual state and synchronize with the backend.  
* Failed actions provide retry feedback and do not falsely indicate success.  
* Blocked or removed content is handled according to visibility rules.  
* A user with no followed Rising Stars or fandoms receives useful discovery suggestions.  
* The XP Boost banner appears on every eligible Home feed session while the boost remains active.

### 6.4 Discover and search

Priority: P0

Objective: Help fans find Rising Stars, content, topics, and fandoms.

Functional requirements:

* Provide global search.  
* Support searching for Rising Stars, users, fandoms, posts, and trending topics, subject to availability.  
* Display relevant search suggestions.  
* Provide category or content-type filters.  
* Show recent searches and allow users to clear them.  
* Display trending topics and featured fandoms.  
* Support discovery based on interests and engagement.  
* Provide a follow action from appropriate search results.  
* Handle misspellings or empty results gracefully.  
* Ensure blocked, private, suspended, or restricted entities are surfaced only according to access rules.

Acceptance criteria:

* Search results correspond to the selected query and filters.  
* Users can open a result and return to the same search context.  
* Empty results offer alternative discovery options.  
* Search does not expose private content or restricted account information.

### 6.5 Rising Star profiles and following

Priority: P0

Objective: Let fans discover, follow, and engage with their favourite Rising Stars.

Functional requirements:

* Display a Rising Star's profile image, cover image, name, handle, bio, and relevant verification status.  
* Display published posts and publicly available content.  
* Display follower information where appropriate.  
* Provide follow and unfollow actions.  
* Support relevant external links when permitted.  
* Show exclusive or access-restricted content with a clear explanation of access requirements.  
* Display upcoming or active fandom activities where supported.  
* Provide reporting and blocking controls.  
* Allow fans to see their followed Rising Stars in a dedicated list.  
* Reflect account suspension, deletion, and visibility settings.  
* Provide a clear action to view or join the Rising Star's fandom.

Acceptance criteria:

* Following and unfollowing updates the relationship state correctly.  
* Duplicate follow requests do not create duplicate relationships.  
* Restricted content does not become accessible merely because a user can view the profile.  
* Profile changes and status changes are reflected consistently throughout the app.  
* Joining a fandom from a Rising Star profile starts the required lane selection flow.

### 6.6 Content and post interactions

Priority: P0

Objective: Enable fans to interact with content rather than only consume it.

Functional requirements:

* Display supported text, image, video, and link content.  
* Allow reactions or likes, comments, replies, and sharing where supported.  
* Allow users to save and unsave content.  
* Provide reporting controls for posts and comments.  
* Display engagement counts and update them as changes are confirmed.  
* Allow authors to edit or delete their own content where supported.  
* Enforce comment and posting permissions.  
* Support pagination of comments and replies.  
* Prevent duplicate submissions caused by repeated taps or network retries.  
* Handle deleted, moderated, or unavailable posts gracefully.

Acceptance criteria:

* Users cannot modify content they do not own unless explicitly authorized.  
* Comments and reactions respect fandom and account restrictions.  
* Removed content is no longer presented as available to unauthorized viewers.  
* Shared links open the correct public destination or show an appropriate access screen.

### 6.7 Fandoms and community membership

Priority: P0

Objective: Give fans dedicated spaces to gather around Rising Stars and shared interests, with a clear role and identity inside each fandom.

Functional requirements:

* Display fandom name, image, description, Rising Star ownership, membership count, and relevant status.  
* Provide fandom discovery and search.  
* Allow users to view fandom information before joining.  
* Require every fan joining a new fandom to select exactly one lane before completing membership.  
* Support membership requests or invitations where required.  
* Display fandom posts, discussions, missions, watch parties, rallies, and leaderboards where supported.  
* Display fandom rules and reporting controls.  
* Show pinned or featured posts.  
* Display membership status and access restrictions.  
* Support fandom-specific notifications and preferences.  
* Respect owner, moderator, and member permissions.  
* Provide empty states for new fandoms without activity.  
* Allow users to leave a fandom through a dedicated flow that explains the consequences before confirmation.  
* Support admin removal, rejoin restrictions, and removal notifications.

Acceptance criteria:

* Users cannot complete a new fandom membership without selecting a lane.  
* A fan can hold only one lane in a fandom until they unlock and select a second lane.  
* Lane and badge data is stored separately for each fandom.  
* Joining, leaving, or removal updates membership and permissions consistently.  
* Private fandom content is available only to authorized members.  
* A removed fan cannot bypass the rejoin restriction by repeatedly using invitations or deep links.  
* The Leave Fandom consequences screen appears before any final confirmation.

### 6.8 Fandom lanes

Priority: P0

Objective: Give each fan a distinct participation identity within every fandom.

A lane represents the type of fan a person is within a particular fandom. It is separate from the user's badge tier: the lane expresses how the fan participates, while the badge tier indicates how much the fan has contributed.

The six lane options are:

1\. Rider

“You are here for the person. Their story, their struggles, their wins. The career is secondary.”

Focus: personal connection, milestones, and the Rising Star's journey.

2\. Fandom Builder

“You follow the career: the projects, the deals, the stats, every professional move they make.”

Focus: professional milestones, releases, career developments, and achievements.

3\. Builder

“You live to grow the fandom. You recruit, compete, and will not rest until your team is number one.”

Focus: fandom growth, eligible referrals, participation drives, and healthy competition.

4\. Analyst

“You track receipts, know the facts, and keep the fandom accurate. Rumours end with you.”

Focus: reliable information, source checking, factual discussions, and correcting misinformation responsibly.

5.Creator [vikktohh@gmail.com](mailto:vikktohh@gmail.com)

“You create: edits, art, threads, videos. Your love for them comes out in what you make.”

Focus: fan art, edits, videos, threads, creative contributions, and sharing original work.

6\. Mutual [vikktohh@gmail.com](mailto:vikktohh@gmail.com)

“The fandom community is your reason for being here. You are here for the people as much as the Star.”

Focus: welcoming members, community participation, meaningful connections, and helping fans feel included.

#### Lane selection flow

1. A fan opens a fandom and taps Join Fandom.  
2. The app introduces the lane system and explains that the choice represents their participation style.  
3. The fan views all six lane cards, including their descriptions.  
4. The fan selects one lane.  
5. The app displays the selected lane and a final Join Fandom action.  
6. Upon successful membership, the chosen lane appears on the fan's fandom profile.  
7. The lane is saved to that specific fandom membership.

#### Lane progression rules

* Every fan begins with one lane in each fandom they join.  
* A fan can have only one lane in a particular fandom before unlocking the second-lane privilege.  
* Reaching Supporter at 100 XP unlocks the ability to select a second lane in that fandom.  
* The second lane is optional, not mandatory.  
* A fan may choose a second lane from the remaining eligible options.  
* A fan cannot select the same lane twice in one fandom.  
* A fan can have different lanes in different fandoms.  
* The second lane privilege remains available after it has been unlocked, subject to membership status and platform rules.  
* Leaving a fandom permanently removes the fandom-specific lane assignments along with that fandom's XP and badge progress.  
* Rejoining after a permitted rejoin begins a new fandom membership under the platform's applicable rules.

#### Lane UI requirements

* Show all six lanes in a selectable card grid or list.  
* Each card includes lane name, description, and a clear selection state.  
* Only one lane can be selected during initial onboarding.  
* When the fan has unlocked the second lane, show the first lane as selected and offer an explicit Add a second lane action.  
* Clearly distinguish the primary lane from the secondary lane.  
* Show a lock indicator and the Supporter threshold when the second lane is unavailable.  
* Never imply that the lane itself determines badge tier or XP balance.

Acceptance criteria:

* A fan cannot join a fandom without one valid lane.  
* The backend prevents more than one lane before the second-lane entitlement is earned.  
* The backend prevents duplicate lane assignments.  
* The second lane unlock is granted when the fandom-specific XP reaches the defined threshold.  
* Lane selection and XP progress remain consistent across devices.  
* Lane data is removed when the corresponding fandom membership is permanently cleared.

### 6.9 Fandom badge tiers and XP progression

Priority: P0

Objective: Recognize the level of a fan's involvement in each fandom and unlock privileges as the fan progresses.

Each fandom membership has its own XP balance and badge tier. The fan's badge tier should be visible on their profile within that fandom and wherever their fandom identity is displayed.

The five tiers are:

1\. Lurker

Starting tier

## 0 XP

Everyone begins here. No visible tier indicator is displayed.

Privileges: standard fan participation according to membership permissions.

2\. Supporter

## 100 XP

A fan who has started demonstrating meaningful involvement.

Unlock: privilege to select a second lane in this fandom.

3\. Soldier

## 500 XP

A consistently active fan who contributes to the fandom.

Unlock: Royal badge skin eligibility.

4\. General

## 2,000 XP

A highly involved fan with additional community participation privileges.

Unlocks: create mission proposals requiring Rising Star approval, flag hostile fans, and access Diamond badge skin eligibility.

5\. Superfan

## 5,000 XP

The highest badge tier, recognizing exceptional fandom involvement.

Unlocks: animated star icon and public featuring on the fandom page.

#### Badge progression rules

* Every new fandom membership begins at Lurker with 0 XP.  
* XP is tracked separately for each fandom.  
* The badge tier is calculated from the fandom's authoritative XP balance.  
* Supporter unlocks at 100 XP.  
* Soldier unlocks at 500 XP.  
* General unlocks at 2,000 XP.  
* Superfan unlocks at 5,000 XP.  
* A higher tier replaces the previous tier as the fan's current tier; it does not create multiple simultaneous tier statuses.  
* The current badge tier should update automatically once a qualifying XP award is confirmed.  
* The Lurker tier does not display a tier indicator, although the fandom's member list may still show the fan's basic identity.  
* Badge skins customize the appearance of the tier indicator but do not change the fan's tier, XP, or privileges.  
* Tier and XP progress are permanent within a fandom until the membership is ended or another explicitly defined platform rule applies.  
* Leaving a fandom permanently clears the associated XP and badge progress.  
* A fan who joins a different fandom starts again at Lurker with 0 XP.

#### General tier privileges

Mission creation

* General-tier fans may create mission proposals within the fandom.  
* A proposal must include the mission title, description, objective, eligibility rules, completion criteria, proposed XP reward, and duration where applicable.  
* Proposals are submitted to the Rising Star who owns the fandom for approval.  
* A proposal must remain pending until approved.  
* Approval activates the mission only after server-side validation and any additional required configuration.  
* Rejected proposals should display a status and reason where the Rising Star chooses to provide one.  
* The fan must not be able to award themselves XP simply by creating or submitting a mission.  
* XP rewards and eligibility remain controlled by the approved mission rules.

Hostile fan flagging

* General-tier fans may flag users whose behaviour appears hostile or violates fandom rules.  
* A flag must capture the target user, fandom, reason, relevant evidence where available, and submission time.  
* Flagging must not automatically punish or remove the target.  
* The flag enters the appropriate moderation workflow for review.  
* Repeated malicious or abusive flagging can itself be subject to moderation.  
* The interface must distinguish flagging from blocking and from submitting a general content report.

#### Superfan visibility

* The Superfan badge includes an animated star icon.  
* The animation should be subtle and accessible, with a static fallback where animation is reduced or unsupported.  
* Superfans may be featured publicly on the relevant fandom page.  
* The fandom page must not display a fan as Superfan unless the authoritative XP tier qualifies them.  
* If multiple Superfans are featured, the display order should follow a documented, configurable rule.

Acceptance criteria:

* XP thresholds are enforced by the backend.  
* A fan receives each tier's privileges only after reaching the relevant threshold.  
* XP and badge information is correctly scoped to the fandom.  
* Mission creation is unavailable below General tier.  
* Mission proposals require Rising Star approval before becoming active.  
* Hostile fan flags are logged and routed for review.  
* Superfan visibility and animated badge treatment reflect the actual tier.  
* No badge skin can falsely imply a higher tier.

### 6.10 Badge skin customization

Priority: P1

Objective: Allow fans to personalize the appearance of their fandom badge without changing their XP, badge tier, or earned privileges.

The badge customization screen should display available skins in a visual grid, show the currently applied skin, and explain any purchase or tier requirements.

#### Badge skin catalog

| Skin | Price | Access |
| ----- | ----- | ----- |
| Default | Free | Available to all fans |
| Gold Glow | \$1.99 | Paid |
| Crystal | \$2.99 | Paid |
| Flame | \$3.99 | Paid |
| Royal | Not specified | Locked until Soldier tier |
| Diamond | Not specified | Locked until General tier |

Royal and Diamond are locked skins for higher tiers. Their final prices, if any, must be confirmed before implementation. Their tier requirements do not grant a free purchase unless the business rules explicitly state otherwise.

#### Screen requirements

* Show a grid of badge skin options.  
* Each skin displays its name, visual preview, and price or lock status.  
* Clearly distinguish the selected skin from the currently applied skin.  
* Display the user's current fandom badge tier.  
* Show a lock icon and unlock requirement for Royal and Diamond when unavailable.  
* Allow fans to select a skin to preview it before purchase.  
* For paid skins, display a preview strip directly below the grid.  
* The preview strip contains:  
  * The selected skin's emoji or icon inside a bordered square.  
  * The skin name.  
  * The text “Applied immediately after payment.”  
  * The price aligned on the right.  
* Provide a clear purchase action.  
* Display payment processing, success, and failure states.  
* On successful purchase, apply the selected skin immediately.  
* Persist ownership and application state across devices.  
* Allow fans to switch between skins they already own without paying again.  
* Provide a clear way to return to Default.  
* Never represent an unowned paid skin as applied.

#### Purchase behaviour

1. The fan opens badge customization for a specific fandom.  
2. The app retrieves their current tier, owned skins, and applied skin.  
3. The fan taps a skin.  
4. The preview strip updates to reflect the selected skin.  
5. If the skin is paid and unowned, the purchase action is enabled.  
6. The fan confirms the purchase using the supported payment mechanism.  
7. The backend validates the transaction and records ownership.  
8. The new skin is applied to the relevant fandom badge.  
9. The profile and other eligible badge surfaces reflect the change.

Acceptance criteria:

* Skin ownership is associated with the user's account.  
* Skin application is scoped to the intended fandom badge unless the final commercial rules define account-wide ownership.  
* A completed purchase cannot charge the user twice for the same transaction.  
* A failed or cancelled payment does not apply a paid skin.  
* Royal remains locked below Soldier, and Diamond remains locked below General.  
* Tier upgrades unlock eligible skins without incorrectly modifying the badge tier itself.

### 6.11 XP missions and XP Boost

Priority: P1 for missions; P1 for XP Boost

Objective: Reward meaningful fandom participation and offer an optional paid way to double eligible XP earnings for 24 hours.

#### Missions Hub

The Missions Hub should display:

* Available, active, completed, expired, and pending missions.  
* Mission title, description, eligibility, deadline, progress, and XP reward.  
* Fandom association.  
* Completion requirements.  
* Mission status and any validation pending state.  
* XP Boost multiplier tags when an active boost applies.  
* Clear empty, loading, and error states.

Fans may gain XP by completing eligible missions and participating in other approved activities, including watch parties.

The platform must validate mission completion server-side and prevent duplicate XP awards.

#### XP Boost purchase screen

## XP Boost \- 24 hours

Every action earns double XP. Applied immediately on purchase.

Missions earn 2× XP.  
Watch party attendance earns 2× XP.  
Expires exactly 24 hours after purchase.

# \$0.99

one-off · 24 hours

Get boost for \$0.99

Not right now

The mockup above represents the intended purchase-screen content and hierarchy. The actual application must use a functioning payment action and the approved Clautverse design system.

#### XP Boost purchase requirements

* Display the exact product name: XP Boost \- 24 hours.  
* Display the short description: “Every action earns double XP. Applied immediately on purchase.”  
* Display all three benefit statements exactly as listed above.  
* Display the one-off price of \$0.99.  
* Provide the primary CTA “Get boost for \$0.99.”  
* Provide the secondary text action “Not right now.”  
* Clearly state that the boost starts immediately upon successful purchase.  
* Explain that the boost lasts exactly 24 hours from the successful purchase timestamp.  
* Do not start the countdown before payment is confirmed.  
* Prevent a failed or cancelled payment from activating the boost.  
* Store the activation and expiry timestamps on the backend.

#### XP Boost calculation rules

* The normal XP reward is defined by the mission or eligible activity.  
* When a boost is active, eligible base XP rewards are multiplied by two.  
* For example, a mission worth 50 base XP awards 100 XP during the boost.  
* XP Boost applies to eligible mission rewards and validated watch party attendance rewards.  
* The system must prevent repeated event processing from awarding the same base reward twice.  
* XP Boost must not bypass mission eligibility, completion rules, moderation restrictions, or account limitations.  
* If a reward is pending validation when the boost expires, the backend must use the recorded qualifying event time and an explicitly defined reward policy to determine whether the multiplier applies.  
* XP Boost does not transfer XP between fandoms.  
* XP Boost does not directly increase a user's badge tier unless the resulting fandom-specific XP reaches the required threshold.

#### Persistent active-boost banner

After a successful purchase, a persistent gold banner appears directly below the page header on every eligible content screen.

XP Boost active \- 2× on everything

Double XP is active

### 23h 44m

left

The banner must appear on:

* Home feed.  
* Missions Hub.  
* Watch Party room.

Banner behaviour:

* Display a lightning bolt icon.  
* Show the exact text “XP Boost active \- 2× on everything.”  
* Show a countdown timer on the right.  
* Update the countdown continuously while the screen is active.  
* Recalculate remaining time from the authoritative expiry timestamp after app restart or reconnection.  
* Remove the banner automatically when the boost expires.  
* Avoid showing the banner on screens outside the defined scope unless the product team explicitly expands that scope.

#### Mission cards during an active boost

Every eligible mission card in the Missions Hub must:

* Display a gold “⚡ 2× XP” tag in the top-right corner.  
* Show the boosted XP reward prominently.  
* Show the original base XP reward beside it in smaller grey strikethrough text.  
* Update the reward display immediately when the boost activates or expires.  
* Distinguish a reward that is pending validation from XP that has already been awarded.

Example:

Join the fandom discussion

Complete the eligible discussion mission.

⚡ 2× XP

# 100 XP

50 XP

#### XP Boost expiry

* The boost expires exactly 24 hours after the successful purchase timestamp.  
* Expiry must be calculated server-side.  
* The countdown must never extend because the app is closed, offline, or restarted.  
* At expiry, the multiplier returns to normal.  
* Mission cards revert to their base XP presentation.  
* The banner disappears from eligible screens.  
* The purchase history retains the completed transaction.  
* A future purchase or stacking rule must follow the final approved policy.

Open decision: Whether fans may purchase a second XP Boost while one is active, and whether overlapping purchases extend the duration or are blocked, must be defined before launch.

Acceptance criteria:

* Successful purchase activates the boost immediately.  
* Failed payments never activate it.  
* Eligible mission and watch party rewards use the correct multiplier.  
* The countdown reaches expiry at the correct timestamp.  
* The banner and mission tags update consistently across sessions.  
* XP awards are idempotent and remain associated with the correct fandom.  
* The displayed boosted amount matches the amount the backend will award.

### 6.12 Discussions, reactions, and fan connections

Priority: P1

Objective: Encourage fans to connect around shared interests without turning Clautverse into a generic messaging platform.

Functional requirements:

* Support discussions attached to posts, fandoms, or fan activities.  
* Allow threaded replies where supported.  
* Provide reactions to discussion contributions.  
* Show relevant user identity, lane, and badge tier where appropriate.  
* Recommend fan connections based on shared interests or fandom participation, subject to privacy controls.  
* Provide follow, connect, or equivalent relationship actions according to the chosen social model.  
* Support blocking and reporting from user profiles and interactions.  
* Apply rate limits to prevent spam and harassment.  
* Avoid implying that a lane grants moderation authority unless the fan also holds the required tier and permission.

Acceptance criteria:

* Discussion replies appear in the correct thread.  
* Relationship actions are clearly distinguishable from Rising Star following.  
* Users can control unwanted contact according to platform settings.  
* Lane labels and badge tiers accurately reflect the user's fandom membership.  
* Blocked interactions are handled consistently across app surfaces.

Product decision required: Finalize whether fan-to-fan connections use a one-way follow model, mutual connection requests, or both.

### 6.13 Live watches and watch parties

Priority: P1

Objective: Coordinate shared fan participation around scheduled or ongoing experiences.

Functional requirements:

* Display upcoming, active, and completed watch parties.  
* Show the host, description, scheduled time, status, and participation requirements.  
* Allow users to join or leave eligible activities.  
* Provide countdowns and reminders.  
* Display relevant event information and participation instructions.  
* Support real-time attendance or participation updates where required.  
* Provide chat or discussion only if the activity supports it.  
* Display completion status and eligible XP rewards.  
* Apply 2× XP to eligible watch party attendance rewards when the XP Boost is active.  
* Handle cancellation, rescheduling, and ended activities.  
* Respect participant limits and access permissions.

Acceptance criteria:

* Activity times are shown in the user's local time zone.  
* Users receive reminders according to their preferences.  
* Participation status is consistent across sessions and devices.  
* Cancelled or ended activities cannot be joined as active experiences.  
* Rewards are issued only for validated participation.  
* XP Boost is applied using the defined event-time and reward-validation rules.

Important dependency: The product must define whether watch parties are hosted video sessions, coordinated external viewing experiences, scheduled community events, or a combination. The app should not promise in-app streaming unless that capability is part of the approved technical scope.

### 6.14 Invitations and referrals

Priority: P1

Objective: Enable fans to invite others into Clautverse and participate in eligible referral activities.

Functional requirements:

* Generate or retrieve a valid invitation link or code.  
* Support native device sharing where available.  
* Attribute eligible registrations to the correct referral source.  
* Display referral status where a referral program is enabled.  
* Explain qualification requirements before users invite others for rewards.  
* Prevent self-referrals, duplicate attribution, and obvious referral abuse.  
* Provide a fallback when a recipient does not have the app installed.  
* Respect user consent and applicable communication rules.  
* Ensure that referral actions contribute XP only if a configured mission explicitly rewards the qualifying action.

Acceptance criteria:

* Valid invitation links resolve to the intended app destination or web fallback.  
* Referral attribution follows defined rules.  
* Users are not rewarded for unqualified or fraudulent referrals.  
* The UI does not display a reward as earned before the qualifying condition is met.

### 6.15 Activity and notifications

Priority: P0 for in-app activity; P1 for advanced notification controls

Objective: Keep fans informed about relevant interactions and activities.

Notification categories should include, where supported:

* New followers or fan connections.  
* Reactions and comments on the user's content.  
* Replies and mentions.  
* Updates from followed Rising Stars.  
* Fandom announcements and discussions.  
* Mission progress and XP awards.  
* Badge tier upgrades and second-lane unlocks.  
* Watch party and rally reminders.  
* XP Boost purchase confirmation and expiry reminders, where configured.  
* Invitations and referral updates.  
* Rising Star mission proposal approval or rejection.  
* Hostile fan flag status, where appropriate to disclose.  
* Fandom removal and rejoin restriction notices.  
* Account security and important platform notices.

Functional requirements:

* Provide an in-app activity center.  
* Support unread and read states.  
* Allow users to open related content directly.  
* Support push notifications when permission is granted.  
* Provide notification preferences by category.  
* Prevent excessive duplicate notifications.  
* Support deep links to posts, profiles, fandoms, missions, and activities.  
* Handle expired or deleted notification targets.  
* Clearly distinguish important account/security messages from optional engagement notifications.

Acceptance criteria:

* Read status is synchronized where required.  
* Notifications open the correct destination.  
* Users can disable optional notification categories.  
* Security-critical notifications follow the platform's security policy.  
* Tier upgrade notifications identify the correct fandom and tier.  
* Removal notices cannot be mistaken for ordinary leave-fandom confirmations.

### 6.16 Fan profile and personal activity

Priority: P0

Objective: Give users control over their identity and activity within Clautverse.

Functional requirements:

* Display and edit profile image, cover image if supported, display name, username, bio, and approved profile fields.  
* Display followed Rising Stars and joined fandoms.  
* Display public contributions where appropriate.  
* Provide access to saved posts and personal activity.  
* Show XP and mission progress by fandom.  
* Show the user's current badge tier for each fandom.  
* Display the user's selected lane or lanes within each fandom.  
* Display a customizable badge skin where a visible tier badge applies.  
* Display the animated star icon for Superfans.  
* Show public featuring status for Superfans when selected by the fandom page's display rules.  
* Allow profile visibility controls where supported.  
* Provide access to blocked accounts and privacy settings.  
* Support username validation and availability checks.  
* Provide clear feedback when a profile update fails.  
* Ensure private information is not exposed on public profile pages.

Acceptance criteria:

* Changes persist after reopening the app.  
* Invalid usernames and duplicate usernames are rejected with clear guidance.  
* Public and private fields follow selected visibility settings.  
* XP and badge information is scoped to the correct fandom.  
* Lurker has no visible tier indicator.  
* Customization changes the badge appearance but does not change the underlying tier.

### 6.17 More page and Rising Star Hub

Priority: P1

The More page should act as the fan's account and utility hub.

Proposed More page sections:

* My Profile  
* My Fandoms  
* Fandom Badges  
* Missions and XP  
* XP Boost  
* Saved Content  
* Invitations and Referrals  
* Notification Preferences  
* Privacy and Security  
* Help and Support  
* Terms and Privacy Policy  
* Rising Star Hub  
* Sign Out  
* Delete Account

The Rising Star Hub should explain how a fan can create or access a Rising Star account.

The Rising Star journey should support:

* Viewing the benefits of becoming a Rising Star.  
* Reviewing eligibility requirements.  
* Starting account creation or an application.  
* Providing required profile and verification details.  
* Viewing submission status.  
* Accessing the Rising Star experience after approval.  
* Handling rejected, pending, suspended, or incomplete applications.

Access control requirement: The fan app should not expose Rising Star-only controls simply because a user has opened Rising Star Hub. Authorized users should be routed to the appropriate experience, and permissions must be checked by the backend.

Acceptance criteria:

* Fans can access account utilities from a predictable location.  
* Rising Star application status is accurate and clearly explained.  
* Unauthorized users cannot access Rising Star management endpoints.  
* Returning Rising Stars can access the correct account without creating duplicate identities.

### 6.18 Leave Fandom flow and consequences

Priority: P0

Objective: Ensure fans understand the permanent consequences of leaving a fandom before they confirm the action.

When a fan taps Leave Fandom, the app must display a dedicated consequences screen before any final confirmation. It must not immediately remove the fan or use a generic confirmation modal as a substitute.

The screen must communicate exactly what will be lost:

## Leaving this fandom?

Please review what happens when you leave. These changes cannot be reversed.

Badge tier and XP for this fandom

Permanently lost. Your progress in this fandom will not be restored automatically.

Leaderboard position

You will be removed from this fandom's leaderboard.

Original badge, if held

Permanently retired. Its number will never be re-issued to anyone.

Active Founding Pledge Stars

Returned to your balance.

Confirm leave

Go back

This is the intended content hierarchy. The actual screen should use the approved Clautverse components and the real, functional buttons.

#### Required consequences

1. Badge tier and XP: permanently removed for the fandom.  
2. Leaderboard: the fan is removed from that fandom's leaderboard.  
3. Original badge: if the fan holds one, it is permanently retired and its number is never re-issued.  
4. Active Founding Pledge Stars: returned to the fan's balance.

#### Interaction requirements

* The consequence screen appears immediately after the user taps Leave Fandom.  
* The fandom name must be clearly identified.  
* The screen must state the consequences in plain language.  
* No preselected confirmation checkbox or deceptive interaction is allowed.  
* Confirm leave executes the leave operation after a final server-side validation.  
* Go back returns the fan to the previous screen without changing membership or progress.  
* If the operation fails, the fan remains a member and receives a clear error message.  
* A successful leave removes the fan from the fandom, removes their leaderboard entry, clears fandom-specific XP and badge progress, and retires the Original badge number if applicable.  
* Eligible active Founding Pledge Stars are returned to the fan's balance according to the authoritative transaction record.  
* The system must prevent the Original badge number from being assigned to another fan.  
* The app should explain any rejoining restrictions that apply under the platform's rules.

#### Design principles

* No guilt-tripping.  
* No dark patterns.  
* No misleading urgency.  
* No hidden consequences.  
* No unnecessary extra steps after the user has clearly confirmed.

Acceptance criteria:

* No membership change occurs before the fan selects Confirm leave.  
* Go back cancels the operation without data loss.  
* All listed consequences are executed consistently.  
* Original badge numbers remain permanently retired.  
* Founding Pledge Stars are returned exactly once.  
* Failed leave operations do not partially clear the user's data.

### 6.19 Fan removal notification

Priority: P0

Objective: Inform a fan when they have been removed from a fandom by the platform admin team and explain the applicable rejoin restriction.

The notification must be designed from scratch as a full-screen notice, not a standard toast, generic alert, or ordinary leave-fandom confirmation.

#### Trigger

* The platform admin team removes a fan from a fandom.  
* The removal event is recorded by the backend.  
* The app receives the removal status and displays the full-screen notice at the next eligible app interaction or through an appropriate immediate notification flow.

#### Required content

The screen must:

* Identify the fandom the fan was removed from.  
* Clearly state that the removal was performed by the platform admin team.  
* Explain that the action relates to community guidelines or flagged behaviour, using the confirmed reason where disclosure is permitted.  
* State the rejoin timeline.  
* Explain the consequences for fandom membership and access.  
* Provide an appropriate support or appeal action if the platform's moderation policy permits one.

The required removal timeline is:

* First removal: the fan cannot rejoin the fandom for 30 days.  
* Second removal: the fan is permanently banned from that fandom.

#### Example content structure

# You've been removed from this fandom

The Clautverse platform admin team has removed your membership following a community guidelines or flagged-behaviour review.

Rejoining restriction

First removal: You cannot rejoin this fandom for 30 days.

Second removal: You are permanently banned from this fandom.

Your current access to this fandom has been revoked. Check the notice for any available review or appeal options.

Continue

#### Functional requirements

* Display the screen only when a confirmed removal event exists.  
* Distinguish admin removal from voluntary departure.  
* Display the correct fandom name.  
* Display the correct removal count and rejoin restriction.  
* Do not allow the fan to rejoin during the first-removal 30-day restriction.  
* Permanently block rejoining after the second removal.  
* Enforce restrictions on the backend, not only in the interface.  
* Prevent invitations, deep links, or repeated Join Fandom requests from bypassing restrictions.  
* Provide a support or appeal route only if that route exists and is permitted by policy.  
* Avoid disclosing sensitive reporter information.  
* Record the removal event, reason category, timestamp, and applicable restriction in the moderation record.  
* Ensure the fan's membership and access are updated consistently.

Acceptance criteria:

* The removal notice is shown for the correct fandom.  
* The first removal creates a 30-day rejoin restriction.  
* The second removal results in a permanent fandom ban.  
* The fan cannot bypass the restriction through alternate entry points.  
* The notice does not appear for voluntary departures.  
* The removal reason shown to the fan matches the approved disclosure policy.

### 6.20 Error states

Priority: P0

Objective: Provide warm, on-brand recovery experiences for common application and network errors.

The four required error states must be designed from scratch and integrated into the corresponding navigation and content flows.

# 404: This page took a wrong turn.

The requested page or destination could not be found.

Back to home feed

# Your fandom is warming up.

The feed has no available content yet. Discover missions and start participating.

Browse missions

# You're offline.

Check your internet connection and try again.

Retry

# We'll be back in a moment.

Something went wrong on our end. Please try again shortly.

Retry

#### Error-state requirements

404

* Triggered when the destination cannot be found or is no longer available.  
* Display: “This page took a wrong turn.”  
* CTA: “Back to home feed.”  
* The CTA navigates to the Home feed and clears the invalid destination.

Empty feed

* Triggered when no eligible content is available for the feed.  
* Display: “Your fandom is warming up.”  
* CTA: “Browse missions.”  
* The CTA opens the Missions Hub, preserving fandom context where possible.  
* The empty state must not be shown for a network or server error that prevented content from loading.

No internet connection

* Triggered when the device has no usable network connection for a required request.  
* Display: “You're offline.”  
* CTA: “Retry.”  
* Retry attempts the failed request again when connectivity is available.  
* Previously cached content may remain visible if supported, but the app must not claim that a pending action succeeded without confirmation.

Server error

* Triggered when a required server request fails unexpectedly.  
* Display: “We'll be back in a moment.”  
* CTA: “Retry.”  
* Retry safely repeats the request.  
* Non-idempotent actions must not be duplicated.  
* Where practical, preserve the user's previous screen and entered information.

Acceptance criteria:

* Each error has a defined trigger and correct message.  
* CTAs navigate to the specified destination or retry the failed request.  
* Errors do not erase valid local state unnecessarily.  
* The empty-feed state is not incorrectly shown for connectivity or server failures.  
* XP purchases, badge purchases, membership changes, and mission actions remain safe against duplicate retries.

## 7\. Screen-by-screen requirements

This section translates the features into concrete screens for product design and engineering.

| Screen | Required UI elements and behaviour | Priority |
| ----- | ----- | ----- |
| Splash / app launch | Brand mark, initialization, session check, update handling | P0 |
| Welcome | Product introduction, sign up, sign in | P0 |
| Registration | Identity fields, validation, terms acceptance | P0 |
| Verification | Code entry, resend, expiry and error states | P0 |
| Login / recovery | Authentication, recovery, error handling | P0 |
| Interest onboarding | Interest selection, Rising Star suggestions, follow actions | P0 |
| Home feed | Content cards, interactions, refresh, pagination, XP Boost banner | P0 |
| Discover | Search, trending, featured Rising Stars and fandoms | P0 |
| Search results | Query, filters, result cards, empty states | P0 |
| Rising Star profile | Profile information, follow action, posts, fandom entry | P0 |
| Post detail | Content, comments, replies, reactions, reporting | P0 |
| Fandom discovery | Fandom information, rules, membership options | P0 |
| Lane selection | Six lane cards, descriptions, selection and confirmation | P0 |
| Fandom detail | Information, rules, membership, discussions and activities | P0 |
| Fan profile | Profile details, fandom memberships, lanes and badge tiers | P0 |
| Fandom badge detail | XP progress, current tier, next tier and privileges | P0 |
| Edit profile | Editable fields, image upload, validation | P0 |
| Activity center | Notifications, unread state, deep links | P0 |
| Leave Fandom consequences | Permanent losses, Original badge retirement and pledge return | P0 |
| Fandom removal notice | Removal reason, restriction timeline and permitted appeal | P0 |
| Error states | 404, empty feed, offline and server error | P0 |
| Saved content | Saved posts, removal and empty state | P1 |
| Missions Hub | Available missions, requirements, progress, rewards and boost tags | P1 |
| XP and rewards | Balance, history, progression and eligibility | P1 |
| XP Boost purchase | \$0.99 offer, benefits, payment and activation | P1 |
| Badge customization | Skin grid, tier locks, preview strip and payment | P1 |
| Watch parties | Schedule, activity details, participation and XP | P1 |
| Fan rallies | Rally details, participation, status and outcomes | P1 |
| Leaderboard | Fandom ranking, tier information and participation position | P1 |
| Invitations | Referral link, sharing, status and eligibility | P1 |
| More | Account utilities and settings navigation | P0 |
| Rising Star Hub | Benefits, application, status and creator entry | P1 |
| Privacy and security | Privacy controls, sessions, blocking and account access | P0 |
| Help and support | FAQs, support request, report follow-up where available | P1 |
| Delete account | Warning, confirmation, optional reason and outcome | P0 |

### 7.1 Essential screen states

Every screen that retrieves data or performs an action must define its applicable states:

* Default or populated.  
* Loading or skeleton.  
* Empty.  
* Error with retry.  
* Offline or connection lost.  
* Success or completed.  
* Restricted or permission denied.  
* Pending or processing.  
* Disabled or unavailable.  
* Deleted, expired, or no longer accessible.  
* Locked tier or locked skin.  
* Purchase pending, successful, cancelled, or failed.  
* XP Boost active or expired.  
* Fandom membership active, pending, left, removed, or permanently banned.

Designers should create these states as part of each feature, not treat them as development-only details.

## 8\. Core user journeys

### Journey A: New fan joins Clautverse

Open app  
Create account and verify  
Select interests and favourite Rising Stars  
Follow Rising Stars and discover fandoms  
Enter personalized Home feed

Success: the user completes onboarding, has a meaningful starting feed, and can begin interacting without needing to understand every feature first.

### Journey B: Fan discovers and follows a Rising Star

1. Open Discover.  
2. Search for a Rising Star or browse recommendations.  
3. Open the Rising Star profile.  
4. Review profile information and public content.  
5. Tap Follow.  
6. See the updated following state.  
7. Return to the feed or explore the Rising Star's fandom.

Success: the Rising Star appears in the user's followed list, and eligible updates can appear in the feed and activity center.

### Journey C: Fan joins a fandom and selects a lane

1. Discover a fandom through search, recommendations, or a Rising Star profile.  
2. Open the fandom details.  
3. Review the description, rules, and membership requirements.  
4. Tap Join Fandom.  
5. Review the six lane options: Rider, Fandom Builder, Builder, Analyst, Maker, and Connector.  
6. Select one lane.  
7. Review the selected lane and confirm membership.  
8. Enter the fandom with the chosen lane and Lurker badge tier at 0 XP.

Success: the fan joins the correct fandom, has one valid lane, and can begin earning XP.

### Journey D: Fan unlocks a second lane

1. Open a fandom where the fan is already a member.  
2. Review the fandom-specific XP and badge progress.  
3. Complete missions or other eligible activities.  
4. Reach 100 XP and unlock Supporter.  
5. Receive confirmation that the second-lane privilege is available.  
6. Open lane settings and select one additional lane.  
7. Confirm the selection.

Success: the fan has two distinct lanes in that fandom. Their existing lane, XP, badge tier, and leaderboard position remain intact.

### Journey E: Fan progresses through badge tiers

1. Open the fandom profile or badge progress screen.  
2. Review current XP and the next badge threshold.  
3. Complete eligible missions and activities.  
4. Receive validated XP.  
5. Automatically advance at 100, 500, 2,000, and 5,000 XP.  
6. Access newly unlocked privileges.  
7. Customize the badge appearance if desired.

Success: XP, badge tier, and tier-specific permissions stay synchronized.

### Journey F: Fan completes a mission

1. Open Missions Hub.  
2. Review an available mission and its requirements.  
3. Start or participate in the qualifying activity.  
4. Allow the system to validate completion.  
5. Display completed or pending status.  
6. Update the fandom's XP balance once the reward is confirmed.  
7. Apply a 2× multiplier if a valid XP Boost was active under the reward rules.

Success: the fan receives the correct reward once, with a clear explanation of progress and eligibility.

### Journey G: Fan purchases an XP Boost

1. Open XP Boost from the Missions Hub or More.  
2. Review the 24-hour offer and \$0.99 price.  
3. Tap Get boost for \$0.99.  
4. Complete the approved payment flow.  
5. Activate the boost after payment confirmation.  
6. Display the persistent gold banner and countdown.  
7. Display 2× XP tags and boosted rewards on eligible mission cards.  
8. Expire the boost automatically after 24 hours.

Success: the purchase is recorded, eligible rewards are doubled, and the boost expires on time.

### Journey H: Fan customizes a badge

1. Open a fandom badge.  
2. Open badge customization.  
3. Review available skins and locked tier requirements.  
4. Select a skin.  
5. Review the preview strip and price.  
6. Complete payment if the skin is paid and unowned.  
7. Apply the skin immediately after successful payment.

Success: the selected skin appears on the appropriate fandom badge without changing XP, tier, or privileges.

### Journey I: Fan leaves a fandom

1. Open fandom settings.  
2. Tap Leave Fandom.  
3. Review the permanent consequences screen.  
4. Choose Go back or Confirm leave.  
5. If confirmed, execute the leave operation.  
6. Clear fandom-specific XP and badge progress.  
7. Remove the leaderboard entry.  
8. Retire an Original badge number if held.  
9. Return eligible active Founding Pledge Stars to the fan's balance.

Success: the fan understands the consequences before leaving, and every resulting state change is applied consistently.

### Journey J: Fan is removed from a fandom

1. The platform admin team records the removal.  
2. The backend revokes fandom membership and access.  
3. The fan receives the full-screen removal notice.  
4. The screen displays the reason category and applicable restriction.  
5. For a first removal, rejoining is blocked for 30 days.  
6. For a second removal, rejoining is permanently blocked.  
7. Any permitted appeal or support route is made available.

Success: the fan is informed, the restriction is enforced, and alternate entry points cannot bypass it.

### Journey K: Fan becomes a Rising Star

1. Open More.  
2. Select Rising Star Hub.  
3. Review the benefits and eligibility requirements.  
4. Start the Rising Star account process.  
5. Complete required information and verification.  
6. View the application status.  
7. Access the authorized Rising Star experience once approved.

Success: the fan's existing account and identity are preserved while the appropriate Rising Star capabilities are enabled.

## 9\. Engagement and personalization logic

Clautverse should personalize the fan experience using transparent, configurable rules rather than relying on an unexplained algorithm from the outset.

### 9.1 Proposed content-ranking signals

* Followed Rising Stars and joined fandoms.  
* Selected interests.  
* Recent relevant interactions.  
* Content freshness.  
* Fandom relevance.  
* Activity participation.  
* User feedback such as hiding or dismissing content.  
* Content availability and moderation status.

### 9.2 Feed rules

* Prioritize relevant content without making the feed entirely repetitive.  
* Balance followed content with discovery recommendations.  
* Exclude content the user cannot access.  
* Apply blocking, muting, and moderation rules before displaying content.  
* Avoid repeatedly recommending content that the user has explicitly dismissed.  
* Clearly label sponsored content if monetization is introduced.  
* Provide a fallback feed when personalization data is insufficient.  
* Surface relevant missions and activities without overwhelming the feed.

### 9.3 Trending logic

Trending topics should be based on configurable measures such as recent participation, engagement velocity, unique contributors, and relevance over a defined time window.

The platform should detect and reduce manipulation from bots, spam, coordinated artificial engagement, or repeated actions from the same account.

### 9.4 XP and progression rules

The XP system must use server-authoritative rules.

* Define each qualifying event and its XP value.  
* Set limits on repeated actions and daily rewards.  
* Record reward issuance and reversal events.  
* Separate earned XP from pending rewards.  
* Allow authorized administrators to configure missions and reward rules.  
* Preserve records of XP changes for dispute resolution and abuse investigation.  
* Calculate the badge tier from the authoritative fandom-specific XP balance.  
* Apply XP Boost multipliers only to eligible rewards.  
* Unlock the second lane at 100 XP in the relevant fandom.  
* Unlock General-tier privileges only when the fan reaches 2,000 XP.  
* Unlock Superfan visibility at 5,000 XP.  
* Never let paid badge skins modify XP or tier status.

## 10\. Notifications specification

| Trigger | Suggested delivery | User control |
| ----- | ----- | ----- |
| New follower or connection | In-app, optional push | Yes |
| Comment or reply | In-app, optional push | Yes |
| Mention | In-app, optional push | Yes |
| Followed Rising Star publishes content | In-app, optional push | Yes |
| Fandom announcement | In-app, optional push | Yes |
| Mission completed | In-app, optional push | Yes |
| XP reward confirmed | In-app, optional push | Yes |
| Badge tier upgrade | In-app, optional push | Yes |
| Second lane unlocked | In-app, optional push | Yes |
| Watch party or rally reminder | In-app, optional push | Yes |
| XP Boost purchase confirmed | In-app, optional push | Yes |
| XP Boost nearing expiry | Optional in-app or push | Yes |
| Referral status updated | In-app, optional push | Yes |
| Mission proposal approved or rejected | In-app, optional push | Yes |
| Fandom removal | Full-screen notice and appropriate notification | Governed by policy |
| Security or account change | In-app and security-appropriate delivery | Governed by security policy |

Implementation requirements:

* Store notification events independently of device push delivery.  
* Handle retries without generating duplicate notification records.  
* Track delivery status where the notification provider supports it.  
* Support per-user preferences and device-level push permission.  
* Avoid placing sensitive information in lock-screen previews.  
* Include a clear destination and fallback for every actionable notification.  
* Establish retention and cleanup policies.  
* Ensure removal notifications are not suppressed by ordinary fandom notification preferences.

## 11\. Monetization and fan support

The fan app must be prepared to support creator monetization without assuming every payment feature is already approved for launch.

Confirmed monetization concepts in this PRD include:

* Paid badge skins.  
* XP Boost at \$0.99 for 24 hours.

Potential additional capabilities include:

* Access to exclusive Rising Star content.  
* Paid fan memberships or subscriptions.  
* Fan support or creator contributions.  
* Paid access to special activities.  
* Reward redemption, if supported by the business model.

These additional capabilities are proposed, not confirmed commitments.

### 11.1 Paid badge skins

* Gold Glow: \$1.99.  
* Crystal: \$2.99.  
* Flame: \$3.99.  
* Royal: locked until Soldier tier; price to be confirmed if paid.  
* Diamond: locked until General tier; price to be confirmed if paid.  
* Default: free.

The payment flow must verify the transaction, record ownership, and apply the skin only after confirmation.

### 11.2 XP Boost

* Product: XP Boost \- 24 hours.  
* Price: \$0.99.  
* Purchase type: one-off.  
* Duration: exactly 24 hours.  
* Effect: 2× XP on eligible missions and watch party attendance.  
* Activation: immediately after successful purchase.  
* Expiry: based on the authoritative purchase timestamp.

### 11.3 General payment requirements

* Display the price, currency, benefits, duration, and renewal terms before purchase.  
* Clearly explain access restrictions.  
* Support applicable payment and app-store billing requirements.  
* Provide transaction status, receipts, and purchase history.  
* Handle failed, pending, successful, cancelled, and refunded transactions.  
* Synchronize entitlement status with the backend.  
* Prevent access to paid content without valid entitlement.  
* Provide purchase restoration where required.  
* Explain cancellation and refund policies.  
* Protect against duplicate charges and duplicate purchase processing.

The final payment provider, supported currencies, store billing arrangements, and refund policies must be confirmed before implementation. The listed dollar prices must be mapped to the supported purchase currency and market rules.

## 12\. Safety, privacy, and moderation

Fan participation requires safety controls across every feature, not just a standalone reporting page.

### Required fan controls

* Report users, Rising Stars, posts, comments, and fandoms.  
* Block unwanted accounts.  
* Mute or reduce unwanted content where supported.  
* Access fandom rules.  
* Control profile visibility and optional notifications.  
* Manage account sessions and security.  
* Request account deletion.  
* Access privacy and support information.  
* Flag hostile fans when the fan has General tier in the relevant fandom.  
* View removal notices and any permitted appeal information.

### Platform enforcement requirements

* Enforce suspended or restricted account states across all app surfaces.  
* Apply content visibility rules consistently.  
* Rate-limit repeated posts, comments, reactions, invitations, and mission actions.  
* Detect suspicious mission and XP activity.  
* Prevent unauthorized access to private fandoms.  
* Maintain audit records for sensitive moderation and account actions.  
* Provide appropriate handling for reported content and appeals according to platform policy.  
* Avoid exposing reporter identities unless disclosure is explicitly authorized and appropriate.  
* Ensure lane selection does not grant permissions beyond the fan's actual role.  
* Ensure General-tier flags are reviewed rather than automatically treated as proof of misconduct.  
* Enforce the first-removal 30-day rejoin restriction and second-removal permanent ban server-side.

### Privacy requirements

* Collect only data necessary for defined product purposes.  
* Obtain appropriate consent for optional data processing and device permissions.  
* Protect personal information in transit and at rest.  
* Apply role-based access controls to personal data.  
* Define retention, deletion, export, and access policies.  
* Keep authentication credentials and secrets out of client-side logs.  
* Provide a clear privacy policy and explain how user-generated content is handled.  
* Retain the minimum necessary records to enforce permanent Original badge retirement and applicable moderation decisions.

The final legal and compliance requirements should be reviewed for the markets where Clautverse operates.

## 13\. Technical and system requirements

### 13.1 Architecture

The fan application should use a shared backend with the Rising Star experience and Super Admin dashboard.

Fan App

Rising Star

Super Admin

API gateway and authentication

Authorization, validation, rate limiting and session handling

Shared platform services

Users · Content · Search · Fandoms · Lanes · XP · Badges · Missions · Watch parties · Notifications · Payments · Moderation

Database and storage

Push and event services

This is a logical architecture, not a mandated technology stack. Engineering should align implementation with the existing Clautverse backend and approved infrastructure.

### 13.2 API and integration requirements

The application will need authenticated APIs for:

* Authentication and account management.  
* User profiles and relationships.  
* Content feeds, posts, comments, and reactions.  
* Rising Star profiles and following.  
* Fandom discovery and membership.  
* Lane selection and second-lane entitlement.  
* Badge tier calculation and XP balances.  
* Badge skin catalog, ownership, purchases, and application.  
* Missions, XP rewards, and progression.  
* XP Boost purchase, activation, status, and expiry.  
* Watch parties, rallies, attendance, and rewards.  
* Invitations and referrals.  
* Notifications and preferences.  
* Reports, hostile fan flags, blocks, and moderation status.  
* Fandom leaving and membership removal.  
* Original badge retirement and Founding Pledge Star returns.  
* Rising Star account applications.  
* Payments and entitlements.

Every API should define authentication, authorization, request validation, response schemas, error codes, pagination, rate limits, and idempotency requirements where applicable.

### 13.3 Core data entities

| Entity | Purpose |
| :---- | :---- |
| User | Identity, account status and authentication reference |
| FanProfile | Fan-specific profile information and preferences |
| RisingStarAccount | Rising Star identity, approval status and public profile |
| Follow | Relationship between a fan and a Rising Star |
| FanConnection | Fan-to-fan relationship, if enabled |
| Fandom | Fandom identity, ownership, settings and status |
| FandomMembership | User's membership and status in a fandom |
| FandomLane | Available lane definitions and descriptions |
| FanLaneAssignment | Primary and secondary lane assignments per fandom |
| FandomXPAccount | Authoritative XP balance per user and fandom |
| XPTransaction | XP award, adjustment, reversal and audit record |
| BadgeTier | Tier thresholds and associated privileges |
| FanBadge | Fandom-specific badge tier and applied appearance |
| BadgeSkin | Skin catalog, price, eligibility and availability |
| BadgeSkinOwnership | Purchased or owned skins and associated entitlements |
| PaymentTransaction | Purchase, payment, refund and transaction status |
| XPBoostEntitlement | Boost activation, purchase and expiry timestamps |
| Mission | Mission rules, eligibility and reward definition |
| MissionProgress | Individual fan progress and completion |
| MissionProposal | Fan-created mission proposals and Rising Star approval status |
| WatchParty | Watch party details, schedule and status |
| ActivityParticipation | Attendance and participation status |
| LeaderboardEntry | Fandom-specific rank and ranking data |
| OriginalBadge | Unique badge number, ownership and permanent retirement status |
| FoundingPledgeBalance | Fan's available Founding Pledge Stars balance |
| FoundingPledgeTransaction | Issuance, use and return of Founding Pledge Stars |
| Referral | Invitation attribution and qualification status |
| Notification | Notification event, read status and destination |
| Report | Reported content or account and review status |
| HostileFanFlag | General-tier fan flags and moderation review status |
| FandomRemoval | Removal event, reason, count and rejoin restriction |
| Block | User-to-user restriction |
| Entitlement | Access rights for exclusive or paid content |
| AuditLog | Record of sensitive or administrative actions |

A single user identity should support appropriate fan and Rising Star capabilities without creating unnecessary duplicate accounts.

### 13.4 Data integrity and business rules

The backend must enforce the following:

* XP balances are maintained separately for every fandom membership.  
* A fan's badge tier is derived from their authoritative fandom-specific XP.  
* A fan can hold one lane until the Supporter threshold is reached, then may add a second lane.  
* No duplicate lane assignments are permitted within the same fandom.  
* Mission XP awards are processed idempotently.  
* XP Boost activation and expiry use authoritative timestamps.  
* Paid skin ownership is recorded only after confirmed payment.  
* General-tier mission proposals remain inactive until Rising Star approval.  
* Original badge numbers are never re-issued after retirement.  
* Founding Pledge Star returns occur once per eligible leave transaction.  
* Fandom removal and rejoin restrictions cannot be bypassed through client-side manipulation.  
* Every important tier, reward, purchase, removal, and retirement event is auditable.

### 13.5 Performance and reliability

Proposed initial service targets:

* Common API requests: p95 response time under 500 ms under agreed test conditions.  
* Initial usable feed: target within 3 seconds on a representative supported network and device.  
* App crash-free sessions: target of at least 99.5%.  
* Feed pagination: avoid repeated content and maintain responsive scrolling.  
* Failed network actions: show clear status and support safe retries.  
* Uploads: provide progress, cancellation where supported, and recovery from interrupted uploads.  
* App updates: preserve user data and sessions where appropriate.  
* XP Boost countdown: recalculate from the authoritative expiry timestamp after app restart or reconnection.  
* Purchase confirmation: update entitlements only after verified transaction confirmation.

These are proposed targets for planning. They must be validated against actual infrastructure, device profiles, content volume, and expected traffic.

### 13.6 Accessibility and device support

* Support the agreed minimum iOS and Android versions.  
* Respect device font scaling and accessibility settings.  
* Provide screen-reader labels for meaningful interactive elements.  
* Maintain sufficient text and control contrast.  
* Avoid communicating state through colour alone.  
* Support keyboard and focus behaviour where relevant.  
* Make touch targets comfortable to use.  
* Handle poor network connectivity and smaller screens gracefully.  
* Optimize image and video delivery for mobile bandwidth.  
* Provide accessible text labels for badge tiers and lanes.  
* Provide a static fallback for the Superfan animated star.  
* Ensure gold XP Boost banners and skin previews remain readable for users with visual impairments.

### 13.7 Analytics and event tracking

Track meaningful product events without collecting unnecessary personal information.

Suggested events include:

* `signup_started`  
* `signup_completed`  
* `onboarding_completed`  
* `interest_selected`  
* `rising_star_followed`  
* `rising_star_unfollowed`  
* `feed_post_viewed`  
* `post_reacted`  
* `comment_created`  
* `search_submitted`  
* `fandom_join_started`  
* `fandom_lane_selected`  
* `fandom_joined`  
* `second_lane_unlocked`  
* `second_lane_selected`  
* `xp_awarded`  
* `badge_tier_upgraded`  
* `badge_skin_previewed`  
* `badge_skin_purchase_started`  
* `badge_skin_purchase_completed`  
* `mission_started`  
* `mission_completed`  
* `mission_proposal_submitted`  
* `mission_proposal_approved`  
* `hostile_fan_flag_submitted`  
* `xp_boost_purchase_started`  
* `xp_boost_purchase_completed`  
* `xp_boost_activated`  
* `xp_boost_expired`  
* `watch_party_joined`  
* `watch_party_attendance_validated`  
* `referral_shared`  
* `fandom_leave_started`  
* `fandom_leave_completed`  
* `fandom_removal_notice_viewed`  
* `rising_star_application_started`  
* `rising_star_application_completed`

Events should include appropriate identifiers, timestamps, feature context, and outcome status while excluding sensitive data from analytics payloads.

## 14\. Super Admin dependencies

The fan app depends on the Super Admin dashboard to manage platform-wide rules and operations.

| Admin capability | Effect on the fan app |
| ----- | ----- |
| User management | Account access and status |
| Rising Star management | Rising Star visibility, verification and account status |
| Fandom management | Fandom status, ownership and membership rules |
| Lane management | Lane definitions and availability |
| Badge tier configuration | XP thresholds and tier privileges |
| Badge skin management | Available skins, prices and tier locks |
| XP configuration | Reward values, multipliers and eligibility |
| Mission management | Available missions, deadlines and rewards |
| Mission proposal oversight | Visibility and enforcement of mission policies |
| Watch party management | Scheduled activities and attendance rules |
| Leaderboard management | Ranking rules and visibility |
| Hostile fan flag review | Review and resolution of flags |
| Fandom removal management | Removal reasons and rejoin restrictions |
| Original badge management | Number allocation and permanent retirement |
| Founding Pledge management | Balance and transaction records |
| Notification management | Platform announcements and relevant broadcasts |
| Referral configuration | Invitation eligibility and qualification rules |
| Monetization configuration | Prices, entitlements and transaction policies |
| Analytics | Measurement of engagement and product performance |
| Roles and permissions | Authorized access to management capabilities |
| Platform settings | Global configuration and feature availability |

The Rising Star experience must support approval of General-tier mission proposals for the relevant fandom. The Super Admin team retains platform-wide oversight and enforcement responsibilities.

The fan app must not rely on client-side checks alone to enforce these decisions. The backend must remain authoritative.

## 15\. MVP and release roadmap

The following is a proposed phased roadmap. The precise schedule depends on existing implementation, design readiness, integrations, and team capacity.

Phase 1

## Core fan experience

MVP launch

* Registration, authentication and onboarding.  
* Home feed and content interactions.  
* Discover, search and Rising Star profiles.  
* Follow and unfollow.  
* Fandom discovery and membership.  
* Mandatory lane selection on joining.  
* Fan profile and fandom membership details.  
* Lurker, Supporter, Soldier, General and Superfan tier framework.  
* Fandom-specific XP and badge progression.  
* In-app activity center.  
* Reporting, blocking and essential safety controls.  
* Leave Fandom consequences screen.  
* Admin removal notice and rejoin enforcement.  
* Essential error states.

Phase 2

## Engagement and participation

Retention and community growth

* Missions and XP.  
* Second-lane unlock at Supporter.  
* General-tier mission proposals and Rising Star approval.  
* Hostile fan flagging.  
* Watch parties and fan rallies.  
* Leaderboards.  
* Invitations and referrals.  
* Expanded fandom discussions.  
* Advanced notification preferences.  
* Saved content and richer activity history.

Phase 3

## Customization and monetization

Growth and revenue

* Paid badge skins and skin ownership.  
* XP Boost purchase, countdown and expiry.  
* Boosted mission rewards and watch party XP.  
* Rising Star Hub and Rising Star onboarding.  
* Exclusive content access, if approved.  
* Fan memberships or subscriptions, if approved.  
* Expanded XP progression and reward redemption.  
* Advanced personalization and discovery.

Release gate: Phases are not substitutes for dependencies. For example, XP Boost must not launch until purchase verification, expiry handling, and reward calculations work correctly. General-tier mission creation must not launch until Rising Star approval and audit workflows are available.

## 16\. Success metrics and KPIs

The following metrics should be tracked from launch, with targets established after a baseline is measured.

| KPI | Definition |
| ----- | ----- |
| Registration conversion | Percentage of users who complete registration after starting |
| Onboarding completion | Percentage of new accounts that finish onboarding |
| Activation rate | Percentage of new users who perform a defined meaningful action within the activation window |
| Day 1 / Day 7 / Day 30 retention | Percentage of users returning after the respective time period |
| DAU / MAU | Daily and monthly active users |
| Follow conversion | Percentage of eligible Rising Star profile visitors who follow |
| Fandom join rate | Percentage of eligible fandom visitors who join |
| Lane selection completion | Percentage of new fandom memberships with a valid lane assignment |
| Second-lane unlock rate | Percentage of eligible fans who reach Supporter |
| Second-lane selection rate | Percentage of fans who use their second-lane privilege |
| Mission completion rate | Completed eligible missions divided by started eligible missions |
| XP integrity | Rate of confirmed duplicate, fraudulent, or incorrect XP awards |
| Badge progression | Distribution of fans across the five badge tiers |
| Badge skin conversion | Percentage of eligible fans purchasing a paid badge skin |
| XP Boost conversion | Percentage of eligible users purchasing XP Boost |
| XP Boost usage | Eligible XP earned while a valid boost is active |
| Watch party attendance | Number and percentage of eligible participants with validated attendance |
| General-tier proposal approval rate | Approved mission proposals divided by submitted proposals |
| Referral conversion | Qualified registrations attributed to referrals |
| Notification engagement | Eligible notification opens or actions, measured by category |
| Fandom removal rate | Removal events relative to active fandom memberships |
| Report resolution time | Time from report submission to the applicable review outcome |
| Crash-free sessions | Percentage of sessions without a crash |
| Rising Star conversion | Eligible fans who complete the Rising Star process |

### Proposed activation definition

For initial analytics, define an activated fan as a newly registered user who, within seven days:

* Follows at least one Rising Star, or  
* Joins at least one fandom and selects a lane, or  
* Completes another explicitly approved meaningful participation action.

This definition should be validated with real usage data before it becomes the official company KPI.

## 17\. Risks and mitigation

| Risk | Mitigation |
| ----- | ----- |
| The app feels like a generic social network | Prioritize fandom-specific experiences, lane identity, activities and Rising Star relationships |
| Empty feed for new users | Seed recommendations using interests and available public content |
| Low community participation | Improve discovery, onboarding and community activity prompts |
| XP farming and referral abuse | Server-side validation, rate limits, eligibility rules and audit logs |
| Notification fatigue | User-controlled categories, deduplication and frequency limits |
| Moderation overload | Reporting workflows, prioritization, permissions and enforcement tools |
| Confusing lane and badge concepts | Clearly explain that lanes describe participation style while tiers reflect XP progress |
| Lane selection creates unnecessary friction | Keep descriptions concise, allow clear selection, and explain the second-lane unlock |
| Badge customization causes confusion | Separate tier progression from cosmetic skins and display locked requirements |
| XP Boost calculation disputes | Display base and boosted XP, define eligibility, and retain reward records |
| Payment failure or duplicate purchases | Verify transactions, use idempotency, and synchronize entitlements |
| Confusion about fandom departure | Display permanent consequences before confirmation |
| Original badge numbers are accidentally reused | Enforce permanent retirement in the backend with audit records |
| Unfair or malicious hostile fan flags | Require review, retain evidence, and moderate abuse of the flagging feature |
| Confusing Rising Star transition | Clear eligibility, application status and separate authorized Rising Star access |
| Slow performance on mobile networks | Caching, pagination, optimized media and resilient error handling |
| Inconsistent fan and Rising Star experiences | Shared identity, APIs, access rules and event definitions |

## 18\. QA and acceptance strategy

Before release, QA should validate:

* Authentication and session expiry.  
* Registration, onboarding, and recovery.  
* Feed pagination, refresh, and duplicate prevention.  
* Following and unfollowing.  
* Post creation or interaction permissions.  
* Fandom membership and private content access.  
* Mandatory lane selection when joining a new fandom.  
* Prevention of duplicate lane assignments.  
* Second-lane unlock at 100 XP.  
* Badge progression at 100, 500, 2,000, and 5,000 XP.  
* Lurker's lack of a visible tier indicator.  
* General-tier mission proposal creation and Rising Star approval.  
* General-tier hostile fan flagging and moderation routing.  
* Superfan animation and public featuring.  
* Badge skin previews, prices, locked tiers, payments, and ownership.  
* XP Boost purchase, activation, countdown, expiry, and boosted rewards.  
* Watch party attendance and reward validation.  
* Notification routing and preference enforcement.  
* Fandom leaderboard updates.  
* Fandom leaving, XP loss, Original badge retirement, and Founding Pledge Star returns.  
* First-removal 30-day restriction and second-removal permanent ban.  
* Removal notices and any permitted appeal flow.  
* Referral attribution and qualification.  
* Rising Star application and access controls.  
* Blocking, reporting, moderation, and account deletion.  
* 404, empty feed, offline, and server error states.  
* API failures, offline handling, retries, and session recovery.  
* Performance, accessibility, and device compatibility.  
* Integration with the Rising Star experience and Super Admin dashboard.

### Definition of done

A feature is complete only when:

1. Its functional requirements are implemented.  
2. Its UI matches the approved Clautverse design system.  
3. Its loading, empty, error, success, and restricted states are covered where applicable.  
4. Permissions are enforced by the backend.  
5. Analytics events are verified.  
6. QA test cases pass.  
7. Accessibility and security checks are completed.  
8. Relevant documentation and API contracts are updated.  
9. Product acceptance criteria are met.  
10. No unresolved critical or high-severity defects remain for that release.  
11. Any XP, payment, badge, lane, or membership changes are auditable and idempotent.  
12. All tier thresholds and restrictions are tested at boundary values.

## 19\. Open product decisions

The following decisions should be finalized before the PRD is treated as implementation-ready. The new lane and badge rules are included here only where further operational detail is needed.

Product decision tracker

Mark items resolved as decisions are approved.

## 0/18

Fan-to-fan connections

Decide between one-way follows, mutual connections, or both.

Fandom privacy

Confirm public, private, invite-only and approval-based membership rules.

Lane changes

Decide whether fans can change their first or second lane after selection, and whether changes have limits.

XP eligibility

Define the base XP for every mission and activity, daily caps, and anti-abuse rules.

XP Boost stacking

Decide whether fans can purchase a second boost while one is active and how overlapping purchases are handled.

XP Boost event timing

Finalize how pending mission and watch party rewards are treated when qualifying activity occurs near boost expiry.

Badge skin prices

Confirm whether Royal and Diamond are paid, their prices, and whether ownership is account-wide or fandom-specific.

Original badge rules

Define badge assignment, transfer restrictions, retirement records, and recovery procedures.

Founding Pledge Stars

Define the meaning of active pledges, return conditions, and the authoritative balance and transaction rules.

Mission approvals

Define Rising Star review times, rejection reasons, editing rules, and whether approved missions can be paused or withdrawn.

Hostile fan flags

Define evidence requirements, review ownership, escalation, appeal handling, and protections against malicious flags.

Fandom removal

Define what counts as a first or second removal, how appeals affect the count, and how the 30-day restriction is calculated.

Watch parties

Confirm whether these are scheduled external viewing experiences, in-app streams, or a combination.

Rising Star onboarding

Confirm eligibility, verification, approval workflow, and how the Rising Star experience opens from mobile.

Monetization and billing

Confirm payment providers, supported markets, purchase restoration, refunds, and applicable app-store billing requirements.

Brand and navigation

Validate all screens against the existing Clautverse mobile frames and design system.

Launch scope

Confirm MVP feature list, supported platforms, minimum OS versions and rollout plan.

Governance and compliance

Confirm community policies, moderation escalation, appeals, privacy, and account-deletion requirements.

Copy decision tracker

## 20\. Final product summary

Clautverse's fan app is built around five connected pillars.

Discover

Find Rising Stars, content, interests, trending topics, and fandoms.

Connect

Follow Rising Stars, engage with posts, join discussions, select fandom lanes, and build fan connections.

Participate

Join fandoms, complete missions, participate in watch parties and rallies, and help grow the community.

Progress

Earn XP, progress from Lurker to Superfan, unlock a second lane, propose missions at General tier, and gain recognition for involvement.

Personalize and grow

Customize fandom badges, purchase optional XP Boosts, invite other fans, support Rising Stars where available, and become a Rising Star when eligible.

### Core rules the entire product must preserve

* One lane to start: Every new fandom membership requires the fan to select one of the six lanes.  
* A second lane is earned: Supporter at 100 XP unlocks the privilege to select another lane within that fandom.  
* Five badge tiers: Lurker at 0 XP, Supporter at 100 XP, Soldier at 500 XP, General at 2,000 XP, and Superfan at 5,000 XP.  
* Progression unlocks privileges: Soldier unlocks Royal skin eligibility, General unlocks Diamond skin eligibility and mission proposal and hostile fan flagging privileges, and Superfan unlocks the animated star and public fandom-page featuring.  
* Cosmetics remain cosmetic: Paid badge skins do not increase XP or change a fan's actual tier.  
* XP Boost is time-limited: A successful \$0.99 purchase activates 2× XP on eligible missions and watch party attendance for exactly 24 hours.  
* Leaving is permanent for that membership: The fan loses their fandom XP and tier, is removed from the leaderboard, permanently retires an Original badge number if held, and receives eligible active Founding Pledge Stars back.  
* Removal is enforced: The first admin removal blocks rejoining for 30 days; the second results in a permanent ban from that fandom.  
* Safety and permissions remain authoritative: The backend validates XP, purchases, mission approvals, tier privileges, membership, and removal restrictions.

The fan app, Rising Star experience, and Super Admin dashboard must operate as one ecosystem, with shared identity, consistent permissions, synchronized activity, and a reliable backend.

The most important product principle is that Clautverse should make fans feel like active participants in the communities and Rising Star ecosystems they care about, rather than simply another audience scrolling through a feed.

Design handoff note: Use the existing Clautverse mobile frames as the source of truth for colours, typography, components, spacing, and established interaction patterns. This PRD defines functional scope and behaviour; it should not override the approved visual design system.

# **Clautverse Star-Side Application PRD**

## **Rising Star and Established Star Experiences**

**Product Requirements Document**

## **1\. Product Overview**

Clautverse is a fandom platform designed to connect Stars with their fans through content, communities, interactive experiences, missions, live sessions, watch parties, and fan engagement tools.

The Star-side application gives public figures, entertainers, creators, artists, and other approved personalities a dedicated space to build and manage their presence on Clautverse. It should allow them to grow their fanbase, communicate with their audience through published content and community activities, publish exclusive content, manage fandoms, understand engagement, and access the tools available to their account type and subscription plan.

The Star experience should not feel like a standard social media profile with a few extra features. It should feel like a dedicated workspace for managing a fandom.

**Core product positioning:** Your fans. Your space. Your rules.

Supporting product message: Create your Star Account and grow your fanbase.

### **1.1 Product Scope**

This PRD covers two account types:

**Rising Star**

For emerging talent and creators. Rising Stars apply to join Clautverse, go through an application review and acceptance process, set up their Star profile, choose a subscription plan, and gain access to the Star Hub according to their approval status and entitlements.

**Established Star**

For recognized public figures and established talent. Established Stars use the Star Hub to manage an existing or recognized public presence, engage their fans, publish content, and access the features permitted for their account and plan. Their onboarding and access must support an established account status without introducing a separate Established Star claim flow.

Both account types should share the same core Star Hub design language and platform services wherever practical. Differences should be driven by account status, permissions, verification, and plan entitlements rather than creating two disconnected products.

### **1.2 Product Objectives**

1. Give Stars control over their profile, content, fanbase, and community experience.  
2. Make it easy to publish updates and exclusive content to the right audience.  
3. Help Stars understand fan growth and engagement through useful analytics.  
4. Enable structured interaction through missions, live sessions, and watch parties.  
5. Give Stars tools to manage fandoms, community activity, and fan access.  
6. Support a sustainable subscription and monetization model.  
7. Make the application and approval process transparent for Rising Stars.  
8. Provide Established Stars with an appropriate account setup and management experience.  
9. Connect the Star app to the fan app and Super Admin dashboard through consistent permissions and data.  
10. Encourage meaningful fan participation, not just passive content consumption.

### **1.3 Product Principles**

* **Fan-first:** Every major tool should help Stars build a stronger relationship with their fans.  
* **Creator control:** Stars should understand who can see their content, who can participate, and how community access is managed.  
* **Clear progression:** Rising Stars should understand their application status, available features, plan limits, and next steps.  
* **Simple management:** High-frequency tasks such as posting, scheduling, and checking performance should require minimal effort.  
* **Trust and safety:** Verification, reporting, moderation, privacy, and account restrictions must be enforced by the backend.  
* **Transparent monetization:** Plans, limits, charges, transaction statuses, and feature access must be clear.  
* **Consistent ecosystem:** Actions in the Star app should reflect correctly in the fan app and Super Admin dashboard.  
* **Design consistency:** Uploaded Clautverse mobile screens are the source of truth for existing colours, typography, components, spacing, and established patterns.

### **1.4 Scope Boundaries**

This document covers the Star-side application, including Rising Star application and onboarding, Established Star access, the Star Hub, subscriptions, content, analytics, missions, Originals, community management, live sessions, watch parties, notifications, settings, and global states.

The following are outside the defined scope unless separately approved:

* The fan-side experience in full.  
* Super Admin interface screens in full, although their dependencies are specified.  
* An Established Star claim flow.  
* Unconfirmed payout rules, revenue shares, or pricing not yet defined by product.  
* Features that require third-party streaming, payment, or other integrations until the integrations are selected.

Messaging and direct messages are not supported by Clautverse and are excluded from this PRD.

Where a rule has not been confirmed in previous product discussions, it is marked as a product decision to confirm rather than treated as an established requirement.

---

## **2\. Users, Account Types, and Permissions**

### **2.1 Primary Users**

| User type | Description | Primary needs |
| ----- | ----- | ----- |
| Rising Star applicant | A creator who has applied but has not yet been approved | Application tracking, review status, next steps, and support |
| Approved Rising Star | An emerging creator accepted onto Clautverse | Profile setup, plan selection, audience growth, and content tools |
| Active Rising Star | An approved creator actively using Star Hub | Publishing, analytics, community management, and engagement |
| Established Star | An established public figure with authorized Star access | Profile management, fanbase management, publishing, and advanced engagement |
| Star team member | An authorized assistant or manager, if team access is enabled | Perform permitted tasks without unrestricted access to the Star account |
| Platform administrator | A Super Admin user managing Clautverse | Review applications, manage accounts, configure plans, and investigate issues |

Team member access is a proposed capability. If included, it must be governed by explicit roles and permissions rather than shared account credentials.

### **2.2 Account Lifecycle**

Rising Star statuses:

* Draft  
* Submitted  
* Under Review  
* Information Requested  
* Accepted  
* Rejected  
* Withdrawn  
* Suspended  
* Closed

The proposed Rising Star lifecycle is:

1. Application started.  
2. Application submitted.  
3. Application reviewed.  
4. Additional information requested, if necessary.  
5. Application accepted or rejected.  
6. Accepted applicant completes profile setup.  
7. Applicant selects a subscription plan where required.  
8. Applicant enters the Star Hub.

The application status must remain separate from the subscription status. An accepted applicant may still need to complete profile setup or select a plan before accessing plan-restricted features.

Established Star statuses:

* Active  
* Setup Incomplete  
* Restricted  
* Suspended  
* Closed

Established Star access should be granted through the platform's approved account-provisioning or authorization process. The separate claim flow is excluded.

### **2.3 Permission Model**

The app should calculate feature access using a combination of:

* Account type.  
* Account status.  
* Verification status.  
* Subscription plan.  
* Feature entitlement.  
* Moderation or restriction status.  
* Resource ownership and role.  
* Applicable age, region, or compliance requirements.

The frontend may hide unavailable actions, but the backend must independently validate every protected request.

Examples:

* An unapproved Rising Star cannot publish public Star content.  
* A suspended account cannot start a live session, even if the live-session button was previously available.  
* A plan without a particular premium feature cannot access that feature through a direct URL or API request.  
* A team member, if supported, cannot change billing or transfer account ownership without the required permission.  
* A pending payment must not unlock paid features before payment confirmation.

---

## **3\. Information Architecture and Navigation**

### **3.1 Main Navigation**

The main Star Hub should make the most important daily tasks easy to access. Use the uploaded Clautverse mobile frames to determine whether this should be a bottom navigation bar, drawer, or another existing pattern.

Recommended primary destinations:

| Destination | Purpose |
| ----- | ----- |
| Home / Dashboard | Overview of account performance, activity, and next actions |
| Content | Create, manage, schedule, and review published content |
| Community | Manage fandoms, Originals, missions, and fan activity |
| Live & Events | Manage live sessions and watch parties |
| Analytics | Understand reach, engagement, and audience activity |
| More / Settings | Profile, plan, billing, notifications, security, help, and account controls |

If the existing design system uses a different navigation pattern, retain the established pattern and map these destinations into it rather than inventing a competing navigation system.

### **3.2 Global Application Elements**

The application should provide consistent access to:

* Current Star profile and account type.  
* Profile completion or setup status where relevant.  
* Notification centre and unread count.  
* Subscription plan and usage limits.  
* Primary creation action.  
* Search or navigation to major Star Hub areas.  
* Help and support.  
* Account settings and sign out.  
* Clear error, loading, empty, and restricted states.

### **3.3 Role-Aware Navigation**

Navigation must respond to entitlements and account status.

A newly accepted Rising Star may see profile setup, subscription selection, and a guided checklist before the complete dashboard. An active Established Star may go directly to the dashboard with existing profile information.

If a feature is unavailable, the interface should explain why and provide an appropriate next step, such as completing setup, selecting a plan, requesting access, or contacting support. Do not show a button that appears active but silently fails.

---

## **4\. Authentication and Rising Star Application**

### **4.1 Entry Screen**

The entry screen should clearly explain the purpose of the Star app and allow users to:

* Sign in to an existing authorized Star account.  
* Create a regular Clautverse account where required.  
* Apply to become a Rising Star.  
* Access support.  
* Read the relevant terms and privacy information.

The interface should distinguish between signing into an existing Star account and applying for Rising Star status.

### **4.2 Authentication Requirements**

Support the authentication methods approved for the Clautverse ecosystem. At minimum, the architecture should support:

* Email or phone-based account identification, depending on the existing authentication system.  
* Password or the selected secure sign-in mechanism.  
* Verification of contact details.  
* Password reset or account recovery.  
* Session management and sign out.  
* Handling of expired sessions.  
* Rate limiting and protection against repeated failed attempts.

Social sign-in should only be included if already supported or approved for implementation.

### **4.3 Rising Star Application Form**

The application form should collect sufficient information for a meaningful review without overwhelming applicants.

| Field | Requirement |
| ----- | ----- |
| Full name | Required |
| Public or stage name | Required |
| Email address | Required |
| Phone number | According to platform verification policy |
| Primary category | Required |
| Short biography | Required |
| Country or region | Required where needed for eligibility and compliance |
| Primary profile image | Required or completed during setup, depending on workflow |
| Existing public profiles | At least one relevant profile where applicable |
| Portfolio or work samples | Required or optional based on category |
| Audience information | Optional unless needed for eligibility |
| Reason for joining Clautverse | Recommended |
| Supporting evidence | Optional or requested by reviewers |
| Terms and declarations | Required where applicable |

Suggested categories include music, film and television, comedy, sports, gaming, fashion, beauty, art, education, lifestyle, digital creation, and other approved categories. The category list must be configurable by Super Admin.

Do not hard-code eligibility thresholds such as follower counts or minimum audience sizes until Clautverse has approved them.

### **4.4 Application Validation**

The app should validate:

* Required fields.  
* Valid email and phone formats.  
* Image and file type, size, and upload status.  
* Duplicate or existing applications.  
* Terms acceptance.  
* Any eligibility restrictions configured by the platform.  
* Whether the applicant already has an active Star account.

Validation errors should appear next to the relevant field and preserve entered information wherever safe.

### **4.5 Application Review Screen**

After submission, the applicant should see a dedicated status page with:

* Current status.  
* Submission date.  
* A brief explanation of the current stage.  
* Any outstanding actions.  
* A way to contact support.  
* A timeline of status changes where useful.

Suggested copy:

**Under review**

"Your application is with the Clautverse team. We'll notify you when there's an update."

**Information requested**

"We need a little more information to continue reviewing your application. Check the request below and submit the required updates."

**Accepted**

"Your Rising Star application has been accepted. Complete your Star profile to get started."

**Rejected**

"Your application was not approved at this time. You can review the decision details and contact support if you need clarification."

The platform must decide whether rejected applicants can reapply, how long they must wait, and whether rejection reasons are displayed. The app must follow the configured policy.

### **4.6 Application Updates and Resubmission**

If more information is requested:

* Show the specific fields or documents requiring attention.  
* Preserve previously submitted information.  
* Allow the applicant to update only the requested items where practical.  
* Record the resubmission time.  
* Return the application to the appropriate review state.  
* Notify the applicant when the status changes.

All application decisions, reviewer notes, and status transitions must be auditable in the administrative system. Internal reviewer notes must not be exposed to applicants unless explicitly designated as user-visible.

---

## **5\. Star Profile Setup**

After acceptance or authorized account access, the Star should complete or review their public profile.

### **5.1 Profile Setup Fields**

* Public display name.  
* Username or unique handle.  
* Profile photo.  
* Cover image or profile banner, if supported by the existing design system.  
* Short bio.  
* Primary category and additional categories, if supported.  
* Country or region, where applicable.  
* Website or external links.  
* Social links.  
* Public contact or business enquiry option, if supported.  
* Profile visibility settings.  
* Verification status, where applicable.  
* Fandom or community introduction.  
* Optional welcome post.

The profile should include a preview of how it will appear in the fan app.

### **5.2 Profile Completion Checklist**

Provide a progress checklist with items such as:

* Add profile photo.  
* Complete biography.  
* Select category.  
* Add public links.  
* Publish first post.  
* Create or activate a fandom, if required.  
* Review community settings.  
* Configure notification preferences.

The checklist should distinguish between required setup and recommended actions. A Star should not be blocked by optional tasks.

### **5.3 Profile Editing**

Stars should be able to:

* Update profile information.  
* Replace photos and banners.  
* Change external links.  
* Preview changes before saving where practical.  
* Discard unsaved changes.  
* See validation errors.  
* Review changes that require moderation or re-verification.

Certain changes, such as changing the public identity of a verified account, may require review. The exact list must be configurable.

### **5.4 Profile Preview**

Profile preview should show the fan-facing representation, including:

* Name and profile image.  
* Bio and links.  
* Verification badge, where applicable.  
* Follow action.  
* Published content.  
* Fandom entry point.  
* Originals or exclusive content, if enabled.  
* Upcoming live sessions or watch parties.  
* Any other publicly available profile modules.

Preview must not expose private analytics, internal notes, unpublished posts, or moderation information.

---

## **6\. Subscription and Plan Management**

The Rising Star experience includes a subscription selection step. The known plan structure is **Freemium, Starter, Growth, and Pro**. Exact prices, usage limits, billing intervals, and entitlements must be supplied by the approved Clautverse pricing configuration.

### **6.1 Plan Selection Screen**

The plan screen should present each plan with:

* Plan name.  
* Price and billing interval.  
* Short description.  
* Included features.  
* Usage limits.  
* Any relevant restrictions.  
* A clear selection or upgrade action.  
* Current plan indicator where applicable.  
* Terms for recurring billing, if applicable.

The plan comparison should make it easy to understand the difference between tiers. Avoid relying on vague labels such as "more features" without explaining what those features are.

### **6.2 Plan Framework**

| Plan | Intended role | Requirements |
| ----- | ----- | ----- |
| Freemium | Entry-level access | Define free features and limits |
| Starter | Early-stage Star | Define included creation and engagement tools |
| Growth | Expanding audience | Define higher limits and growth tools |
| Pro | Advanced Star operations | Define premium tools and any advanced analytics or interaction entitlements |

These are plan positions, not a final entitlement matrix. Product and business teams must approve exact differences before implementation.

### **6.3 Subscription Purchase Flow**

1. Star selects a plan.  
2. The app displays price, billing interval, included features, and renewal terms.  
3. Star confirms the selection.  
4. Payment is processed through the approved payment provider or store billing mechanism.  
5. The backend verifies the transaction.  
6. The subscription entitlement is activated.  
7. The app confirms the active plan and available features.  
8. A transaction record and receipt or payment reference are made available where supported.

A payment success screen must not be displayed based only on the client-side payment callback. The backend must verify the transaction.

### **6.4 Subscription Management**

The plan management screen should show:

* Current plan.  
* Active or inactive status.  
* Billing period.  
* Next renewal date, if applicable.  
* Payment status.  
* Available upgrades and downgrades.  
* Payment method management, if supported.  
* Billing history.  
* Cancellation or renewal controls.  
* Failed payment messages.  
* Support access.

### **6.5 Subscription Edge Cases**

The app must handle:

* Payment pending.  
* Payment failed.  
* Duplicate payment callback.  
* Payment successful but entitlement not yet synchronized.  
* Expired subscription.  
* Cancellation requested but not yet effective.  
* Upgrade or downgrade pending.  
* Plan limits reached.  
* Refund or chargeback.  
* Account suspension while a subscription is active.  
* App closed during checkout.

The system must define whether existing content remains published after a plan downgrade or expiry and what happens to features or content that exceed the new plan's limits.

---

## **7\. Star Dashboard**

The dashboard is the main operational screen of the Star Hub. It should provide a quick overview of the Star's profile, audience, content performance, and outstanding activities.

### **7.1 Dashboard Layout**

Recommended sections, in order of importance:

1. Welcome header with Star name, avatar, account type, and current status.  
2. Setup checklist for incomplete accounts.  
3. Key performance metrics.  
4. Recent audience activity.  
5. Content performance.  
6. Community and fandom summary.  
7. Upcoming live sessions and watch parties.  
8. Missions and community activity.  
9. Quick actions.  
10. Notifications and recommendations.

The final arrangement should follow the existing Clautverse visual system and mobile layout constraints.

### **7.2 Dashboard Metrics**

| Metric | Meaning |
| ----- | ----- |
| Total followers | Current number of accounts following the Star |
| New followers | New follows during the selected period |
| Follower growth | Change in followers over time |
| Total reach | Number of unique accounts reached, if measurable |
| Content views | Total views across eligible content |
| Engagement | Defined interactions relative to views or reach |
| Post performance | Views, likes, comments, shares, and other supported interactions |
| Active fandom members | Current membership count across applicable fandoms |
| Mission participation | Fans participating in or completing missions |
| Live attendance | Attendance across eligible live sessions |
| Watch-party attendance | Attendance for hosted watch parties |
| Originals performance | Views and engagement on Originals, where applicable |

Only metrics supported by reliable event collection should be displayed. Do not present estimated values as exact counts or combine metrics that use incompatible definitions.

### **7.3 Dashboard Date Filters**

Provide date ranges appropriate to the underlying data:

* Last 7 days.  
* Last 30 days.  
* Last 90 days.  
* Custom range, if supported.

The dashboard should clearly state which date range applies to each metric group. Metrics should use a consistent timezone policy.

### **7.4 Quick Actions**

Recommended quick actions:

* Create post.  
* Create drop.  
* Start or schedule a live session.  
* Schedule a watch party.  
* Create a mission.  
* Manage fandom.  
* View analytics.  
* Edit Star profile.

Quick actions must respect account status, plan entitlements, and permissions.

### **7.5 Dashboard States**

**New account:** Show a welcoming setup checklist, an explanation of the Star Hub, and clear first steps. Use helpful zero states instead of blank metric cards.

**Active account:** Display real metrics, recent content, upcoming activities, and community updates.

**No analytics yet:** Explain when metrics will become available, such as after publishing content or receiving audience activity.

**Plan limit reached:** Explain which limit has been reached and what the Star can do next.

**Restricted account:** Display the restriction message and permitted actions. Do not expose restricted functionality through quick actions.

**Loading or unavailable data:** Use skeletons or clear retry states. Never substitute fabricated sample data for real account metrics.

---

## **8\. Content Management and Publishing**

Content publishing is one of the Star Hub's core functions. Stars should be able to create, preview, publish, schedule, and manage content without needing to leave the app.

### **8.1 Content Types**

The content system should support the following content types where enabled:

* Standard posts.  
* Text updates.  
* Image posts.  
* Video posts.  
* Mixed media posts.  
* Announcements.  
* Drops.  
* Exclusive content.  
* Originals.  
* Scheduled posts.  
* Live-session announcements.  
* Watch-party announcements.  
* Fandom-targeted posts.

The exact supported media formats and size limits must be configurable by the backend.

### **8.2 Create Content Flow**

1. Star taps Create.  
2. Star chooses the content type.  
3. Star adds text, media, or other required information.  
4. Star selects the audience.  
5. Star configures any applicable visibility or access conditions.  
6. Star previews the content.  
7. Star publishes immediately, schedules publication, or saves a draft.  
8. The app confirms the result and updates the content list.

The app must clearly distinguish between saving a draft, scheduling content, and publishing immediately.

### **8.3 Content Editor Requirements**

The editor should include:

* Text input.  
* Media upload and preview.  
* Media removal or replacement.  
* Upload progress.  
* Upload retry.  
* Caption or description.  
* Audience selector.  
* Relevant content settings.  
* Preview.  
* Save draft.  
* Publish.  
* Schedule, if supported.  
* Confirmation before destructive actions.

If content upload fails, the app should preserve the draft and allow retrying without forcing the Star to start again.

### **8.4 Audience and Visibility**

Recommended audience options are:

* Public.  
* Followers.  
* A specific fandom or community.  
* Exclusive or entitled audience, where supported.  
* Draft or unpublished.

The final audience options must match the backend's actual access model. Do not display audience types that have no corresponding enforcement mechanism.

Before publishing, the app should explain when a selection materially limits visibility. For example, a post restricted to a specific fandom should not appear as a public post to everyone else.

### **8.5 Drafts and Scheduled Content**

The content library should include:

* Drafts.  
* Scheduled.  
* Published.  
* Failed.  
* Archived, if supported.

Each item should show its title or preview, content type, status, creation or publication date, and relevant actions.

Scheduled publishing requirements:

* Select a date and time.  
* Display the timezone used.  
* Validate that the selected time is permitted.  
* Allow editing or cancelling before publication.  
* Prevent duplicate publication if a scheduling job retries.  
* Show an error if the scheduled post fails.  
* Notify the Star if a meaningful publishing failure requires action.

### **8.6 Published Content Management**

For eligible content, Stars should be able to:

* View the published post.  
* Review its performance.  
* Edit permitted fields.  
* Delete or archive content according to policy.  
* Change audience settings where allowed.  
* Copy or share a link where supported.  
* Review moderation status.

Editing a post must not silently bypass moderation. If a changed caption or uploaded media requires review, the app should show the new review status.

### **8.7 Content Moderation States**

Content should support states such as:

* Draft.  
* Uploading.  
* Processing.  
* Scheduled.  
* Published.  
* Under Review.  
* Rejected.  
* Failed.  
* Removed.  
* Archived.

The platform must define whether content under review remains visible, whether rejected content can be edited and resubmitted, and how Stars are notified of removals.

### **8.8 Content Performance**

Each published item should expose the relevant metrics, which may include:

* Views.  
* Reach.  
* Likes or reactions.  
* Comments.  
* Shares.  
* Saves, if supported.  
* Follower conversion, if reliably attributed.  
* Audience breakdown, where permitted.

Metrics must use clear definitions and avoid implying that a view equals a unique person when it does not.

---

## **9\. Drops and Exclusive Content**

Drops are a known part of the Rising Star experience. They should provide a way to publish a notable release or special content item to the Star's audience.

### **9.1 Drop Creation**

A Drop should support the fields appropriate to the selected drop type:

* Title.  
* Description.  
* Cover image or media preview.  
* Content or media attachment.  
* Publication date and time.  
* Audience or access rules.  
* Optional expiry, if supported.  
* Optional pinned or featured placement, if supported.

The app should show a preview before publishing and clearly distinguish a Drop from an ordinary post.

### **9.2 Drop Management**

Stars should be able to:

* Create a Drop.  
* Save it as a draft.  
* Publish immediately.  
* Schedule it, if supported.  
* View its current status.  
* Edit allowed fields.  
* Review performance.  
* Remove or archive it according to platform rules.

### **9.3 Exclusive Content Rules**

If a Drop is restricted to a paid or otherwise entitled audience:

* The access rule must be displayed before publication.  
* The backend must enforce access.  
* Unentitled fans must not be able to access the underlying media through a direct URL.  
* The Star must be able to understand which audience can view the content.  
* Any payment, entitlement, or subscription dependency must be explicitly configured.  
* The app must not imply that all Drops are paid or exclusive if some are public.

The commercial model for Drops, including whether fans pay per item or access them through another entitlement, remains a product decision unless already defined in the approved business rules.

---

## **10\. Originals and Community Content**

Originals is a known part of the Star-side product and should be treated as a first-class community feature, not merely a label for ordinary posts.

The previous product specification includes an initial **first 100 Originals** concept. The exact meaning of the first 100, including whether this refers to content slots, a launch collection, or an onboarding target, must be confirmed before implementation.

### **10.1 Originals Overview**

The Originals section should let a Star understand:

* Published Originals.  
* Draft Originals.  
* Originals awaiting review, if applicable.  
* Performance and engagement.  
* Available publishing capacity or limits, if any.  
* Relevant audience or access settings.  
* Creation and management actions.

### **10.2 Original Creation**

The creation flow should support:

* Original title.  
* Description or caption.  
* Media upload.  
* Cover image, where applicable.  
* Audience and access rules.  
* Preview.  
* Save draft.  
* Publish or schedule, where supported.  
* Content status and any moderation requirements.

The supported media formats, duration limits, file limits, and publishing caps must be configurable.

### **10.3 Originals Discovery and Fan Experience**

In the fan app, eligible Originals should appear in the relevant Star profile or community surface. Visibility must respect the selected audience and access conditions.

The Star app should provide a preview of the fan-facing presentation and show the content's actual performance where analytics are available.

### **10.4 Originals Analytics**

Track supported metrics such as:

* Views and unique reach.  
* Engagement.  
* Completion or watch time for supported video content.  
* Follower or fandom activity attributed to the Original, where reliable.  
* Performance over time.

### **10.5 Content Ownership and Moderation**

The platform must define its content ownership terms, rights to uploaded media, permitted reuse, and removal process.

If an Original is reported, removed, or restricted, the Star should receive the appropriate status and explanation, subject to the platform's moderation and safety policies.

---

## **11\. Fandom and Community Management**

Fandoms are central to Clautverse. The Star Hub must provide tools to manage the community associated with the Star and give fans a consistent place to participate.

### **11.1 Fandom Overview**

The fandom management screen should show:

* Fandom name and image.  
* Description and community rules.  
* Membership count.  
* Recent activity.  
* Community posts.  
* Active missions.  
* Upcoming events.  
* Relevant moderation activity.  
* Fandom status and access settings.  
* Management actions.

The screen should clearly distinguish between public profile followers and members of a specific fandom. Following a Star should not automatically imply membership in a fandom unless that is the chosen product rule.

### **11.2 Fandom Setup and Editing**

Where Stars are permitted to create or manage a fandom, the form should support:

* Fandom name.  
* Description.  
* Avatar or cover image.  
* Community guidelines.  
* Visibility or join settings, if supported.  
* Welcome message.  
* Links to relevant Star content.  
* Other approved community settings.

The system should prevent duplicate or invalid fandom creation according to backend rules.

Whether every Star receives one default fandom or can create multiple fandoms remains a product decision.

### **11.3 Membership Management**

Stars should be able to review relevant membership information and manage access where permitted.

Potential capabilities include:

* View members.  
* Search or filter members.  
* View a member's public fan profile.  
* Remove a member from a fandom when authorized.  
* Restrict or block access according to policy.  
* Review pending join requests if private fandoms are supported.  
* Review moderation flags.  
* View membership activity.

The interface should confirm high-impact actions and explain their consequences. Actions affecting a fan's membership must be recorded in an audit log.

### **11.4 Community Rules and Moderation**

The Star should be able to view and manage community rules within the permitted scope.

Potential moderation actions:

* Hide or remove a community post.  
* Restrict replies.  
* Remove a member.  
* Flag a member or piece of content for platform review.  
* Review reported activity.  
* Escalate serious cases to Clautverse moderation.

The Star's moderation powers must be defined by the permission model. Stars should not have access to platform-wide enforcement tools reserved for Super Admin.

### **11.5 Fan Reports and Hostile Behaviour**

The fan app's tier system includes a General-tier privilege to flag hostile fans, and the Star-side platform must provide an appropriate review or escalation pathway.

Requirements:

* Receive eligible reports or flags.  
* Show the reported subject and relevant context to authorized reviewers.  
* Display the report's status.  
* Prevent unauthorized users from accessing private report details.  
* Provide a way to escalate a serious issue to platform moderation.  
* Record the action taken and relevant audit details.  
* Avoid treating an unverified flag as proof of misconduct.

The exact review workflow, notifications, and Star authority over final outcomes must be agreed with the moderation system.

### **11.6 Fandom Activity Feed**

The Star should be able to review relevant community activity, including:

* New member activity.  
* Community posts.  
* Mission participation.  
* Upcoming events.  
* Fan comments and interactions.  
* Moderation alerts.  
* Other supported engagement events.

The feed should prioritize meaningful and recent activity rather than showing every system event in an unfiltered stream.

---

## **12\. Missions and Fan Engagement**

Missions are a core engagement feature. They give Stars structured ways to encourage fans to participate in the fandom and complete activities.

The fan app includes mission participation and a rule that **General-tier fans can create missions for the community, subject to approval by the fandom owner, the Rising Star**. The Star app therefore needs a mission management and approval workflow.

### **12.1 Mission Hub**

The mission hub should show:

* Active missions.  
* Scheduled missions, if supported.  
* Draft missions.  
* Completed missions.  
* Expired missions.  
* Missions awaiting approval.  
* Mission performance.  
* Mission creation action.  
* Mission settings or limits relevant to the Star.

Use filters or tabs where needed to prevent the screen from becoming overloaded.

### **12.2 Mission Types**

The mission system should support configurable activity types. Potential examples include:

* View or engage with selected content.  
* Participate in a community activity.  
* Attend a watch party or live session.  
* Submit a permitted contribution.  
* Complete an approved creative task.  
* Invite or refer other fans, if connected to the referral system.  
* Participate in a poll or challenge, if supported.

The final mission types must be based on actual backend-supported actions. A mission must not promise XP or rewards for an event the system cannot reliably validate.

### **12.3 Create Mission Flow**

The Star should be able to:

1. Select Create Mission.  
2. Enter a mission title.  
3. Add a description and instructions.  
4. Select a supported mission type.  
5. Select the eligible fandom or audience.  
6. Set a start and end date, if supported.  
7. Define completion requirements.  
8. Review the reward or XP configuration permitted for the Star.  
9. Preview the mission.  
10. Save as draft or submit/publish according to the applicable approval rules.

The interface must show which fields are required and explain any plan-based or permission-based limitations.

### **12.4 Mission Approval Workflow**

The approval model must distinguish between missions created by the Star and missions proposed by eligible fans.

**Star-created missions**

* May be published directly if the Star has the required permission.  
* May require platform review if the mission type or content triggers moderation rules.  
* Must follow any configured limits on mission count, duration, and reward values.

**Fan-proposed missions**

* Eligible General-tier fans can propose a mission within their fandom.  
* The proposal is routed to the fandom owner, the Rising Star, for approval.  
* The Star can review the proposal, approve it, or reject it.  
* The Star should be able to provide a reason where appropriate.  
* The fan should receive the relevant status update.  
* Approval must not bypass platform-wide safety or mission validation.

### **12.5 Mission Details**

Each mission should show:

* Title and description.  
* Mission status.  
* Eligible audience.  
* Start and end time.  
* Completion rules.  
* Reward or XP information, if applicable.  
* Participant count.  
* Completion count.  
* Relevant moderation or approval status.  
* Actions available to the Star.

### **12.6 Mission Analytics**

Track, where available:

* Mission impressions.  
* Mission starts.  
* Participants.  
* Completions.  
* Completion rate.  
* Drop-off.  
* Time to completion.  
* Audience or fandom breakdown.  
* Referral or downstream activity where reliably attributed.

### **12.7 Mission Edge Cases**

The system must handle:

* A mission being edited after participants have joined.  
* A mission ending while a fan is in progress.  
* A mission being paused or cancelled.  
* Duplicate completion events.  
* A fan losing access to a fandom.  
* A mission proposal being rejected.  
* A Star account becoming restricted.  
* An XP reward failing to process.  
* A mission being removed for safety reasons.

The backend must determine eligibility and completion. Client-side interaction alone must not award XP or mark a mission complete.

---

## **13\. Live Sessions and Real-Time Interaction**

Live sessions are part of the Rising Star product scope. The Star app should support preparing, scheduling, launching, managing, and ending a live session, subject to the selected live technology and plan entitlements.

### **13.1 Live Session Management**

The live-session area should show:

* Upcoming sessions.  
* Scheduled sessions.  
* Live now.  
* Completed sessions.  
* Cancelled sessions.  
* Session analytics where available.

### **13.2 Schedule a Live Session**

The creation form should support:

* Session title.  
* Description.  
* Cover image, if supported.  
* Date and time.  
* Timezone.  
* Audience or fandom.  
* Reminder settings.  
* Optional external or integrated stream configuration.  
* Any relevant access rules.

The interface should clearly indicate whether the Star will stream directly in Clautverse or use an approved external integration.

### **13.3 Pre-Live Checks**

Before going live, the app should confirm:

* The Star has permission to host.  
* The account is not restricted.  
* The session configuration is valid.  
* Required streaming permissions are available.  
* The connection or streaming service is ready.  
* The audience and privacy settings are correct.

If the platform supports an in-app stream, provide the necessary camera, microphone, network, and connection states. If it uses a third-party provider, show provider-specific status and errors.

### **13.4 Live Session Controls**

Depending on the selected implementation, controls may include:

* Start session.  
* End session.  
* Mute or unmute.  
* Camera control.  
* View attendees.  
* Manage chat.  
* Remove or report abusive participants.  
* Pin an announcement.  
* View connection status.  
* Review session duration.  
* Handle reconnects.

Only controls supported by the selected streaming implementation should appear. Live chat, if offered by the selected implementation, must be explicitly approved as a separate feature. It must not be treated as a general messaging or DM capability.

### **13.5 Ending a Session**

Before ending a live session, the app should confirm the action where accidental termination is likely. Once ended:

* Mark the session completed.  
* Show a summary where supported.  
* Display attendance and engagement metrics when available.  
* Offer replay access only if replay is supported.  
* Notify eligible participants of the completed session or replay where appropriate.

Replay availability, storage duration, downloads, and visibility are product decisions to confirm.

---

## **14\. Watch-Party Scheduling and Management**

Watch parties are a known Clautverse engagement feature. The Star-side experience should allow a Star to plan a shared viewing event and manage it from the app.

### **14.1 Watch-Party List**

Display:

* Upcoming watch parties.  
* Live watch parties.  
* Completed watch parties.  
* Cancelled watch parties.  
* Attendance summaries.  
* Scheduling and management actions.

### **14.2 Create Watch Party**

The form should support:

* Event title.  
* Description.  
* Cover image.  
* Date and start time.  
* Timezone.  
* Expected duration, if applicable.  
* Eligible audience or fandom.  
* Media source or supported content selection.  
* Access and visibility settings.  
* Reminder options.  
* Optional capacity settings if supported.

### **14.3 Scheduling Requirements**

* Prevent invalid dates and times.  
* Show the timezone.  
* Allow editing before the event begins.  
* Notify affected participants when important details change.  
* Allow cancellation with an appropriate notification.  
* Prevent duplicate events from retrying a creation request.  
* Display a clear state if a scheduled event cannot be created or launched.

### **14.4 During the Watch Party**

The Star should be able to access the relevant event room and, where supported:

* View participant count.  
* Interact with attendees through supported watch-party features.  
* Manage any supported event chat.  
* Pin announcements.  
* Moderate disruptive behaviour.  
* View event status.  
* End or close the event according to permissions.

The product must confirm whether Clautverse hosts media directly, synchronizes playback, or uses an external source. The app must not promise synchronized viewing unless that functionality exists.

### **14.5 Watch-Party Analytics**

Potential metrics include:

* RSVPs.  
* Attendees.  
* Peak concurrent attendance.  
* Attendance duration.  
* Interaction volume.  
* Repeat attendance.  
* Fandom or audience breakdown.

Only metrics supported by actual tracking should be displayed.

---

## **15\. Analytics and Audience Insights**

Analytics should help Stars understand what resonates with their fans and where to focus their effort. It should not be a wall of unexplained numbers.

### **15.1 Analytics Sections**

Recommended sections:

1. Overview.  
2. Audience growth.  
3. Content performance.  
4. Fandom activity.  
5. Missions.  
6. Live sessions and watch parties.  
7. Originals and Drops.  
8. Audience demographics, where permitted.  
9. Date and content filters.

Some sections may be available only on specific subscription plans. Their visibility and access should be controlled by the entitlement system.

### **15.2 Overview Metrics**

* Total followers.  
* New followers.  
* Follower growth.  
* Content views.  
* Reach.  
* Engagement.  
* Top-performing content.  
* Fandom membership changes.  
* Mission participation.  
* Live or watch-party attendance.

Each metric must have a tooltip, supporting label, or explanatory detail defining what it measures.

### **15.3 Audience Growth**

The audience growth view should show:

* Follower count over time.  
* New followers per selected period.  
* Unfollows, if tracked.  
* Net growth.  
* Growth rate.  
* Content or events associated with growth, where attribution is reliable.

### **15.4 Content Analytics**

For each content item, show the supported performance measures and provide comparisons over time.

Recommended functionality:

* Sort by views.  
* Sort by engagement.  
* Filter by content type.  
* Filter by publication date.  
* Compare selected items, if supported.  
* Open the content item from its analytics page.  
* Export analytics only if that capability is approved.

### **15.5 Audience Demographics**

If demographic analytics are supported, they should:

* Show only data that the platform lawfully collects and is permitted to disclose.  
* Use aggregation and minimum sample thresholds where appropriate.  
* Avoid exposing individual fans' private data.  
* Explain when information is unavailable or based on a limited sample.  
* Respect applicable privacy and consent requirements.

Do not infer age, gender, location, or other sensitive attributes from unrelated behaviour.

### **15.6 Proof Documents**

If the application or verification process requires supporting documents, the app should have a secure submission and status experience.

Requirements:

* Explain why the document is needed.  
* Show accepted file formats and size limits.  
* Upload securely.  
* Display upload and review status.  
* Allow resubmission if requested.  
* Prevent unauthorized access to uploaded files.  
* Show a clear message if a document is rejected or needs replacement.

Proof documents should not be exposed in the public Star profile or general analytics.

### **15.7 Analytics Quality**

The backend must define event sources, attribution windows, deduplication, metric definitions, timezone handling, and reporting latency. If data is delayed, the app should say so rather than presenting stale numbers as live.

---

## **16\. Notifications and Activity Centre**

Notifications should help Stars stay informed about their account, fans, content, and scheduled activities without overwhelming them.

### **16.1 Notification Categories**

| Category | Example events |
| ----- | ----- |
| Application | Application received, information requested, accepted, rejected |
| Account | Profile review, verification update, account restriction |
| Subscription | Payment confirmed, renewal, failed payment, plan change |
| Content | Publishing completed, upload failed, content under review, content removed |
| Audience | New followers and notable audience milestones |
| Community | New activity in a managed fandom |
| Missions | Mission approved, rejected, completed, or reaching a milestone |
| Live sessions | Upcoming session, session reminder, session issue |
| Watch parties | RSVP activity, event reminder, event changes |
| Originals and Drops | Publication status and supported performance milestones |
| Safety | Reports requiring attention or moderation decisions |
| Platform | Service notices, maintenance, policy changes |

### **16.2 Notification Centre**

The notification centre should include:

* Notification list.  
* Unread indicators.  
* Read and unread filters.  
* Relevant category filters, if needed.  
* Timestamps.  
* Deep links to the relevant screen.  
* Mark as read.  
* Mark all as read, if supported.  
* Empty state.  
* Loading and retry states.

Tapping a notification should open the relevant content or action screen. If the linked resource has been removed or is no longer accessible, show a useful explanation rather than an unhandled error.

### **16.3 Push and In-App Notifications**

The platform should distinguish between:

* In-app notifications.  
* Push notifications.  
* Email notifications, where supported.

Stars should be able to configure available notification categories. Critical account and security notifications may remain mandatory according to platform policy.

### **16.4 Notification Reliability**

* Prevent duplicate notifications from retried events.  
* Respect user preferences and device permissions.  
* Use server-side event generation.  
* Avoid sending notifications for actions that have not been confirmed.  
* Ensure notifications do not reveal private fan information unnecessarily.  
* Maintain a record of relevant notification delivery and interaction events.

---

## **17\. Star Profile, Settings, and Account Management**

### **17.1 Profile and Account Settings**

The settings area should include:

* Public profile management.  
* Account details.  
* Email and phone verification status.  
* Account type and status.  
* Verification information.  
* Subscription and billing.  
* Notification preferences.  
* Privacy settings.  
* Security settings.  
* Help and support.  
* Legal and policy information.  
* Sign out.  
* Account closure or deletion request.

### **17.2 Privacy Settings**

Where supported, allow Stars to manage:

* Available profile visibility controls.  
* Audience interaction preferences.  
* Notification preview preferences.  
* Other supported privacy controls.

The app must explain when a setting affects only the Star's personal experience versus when it changes what fans can see or do.

### **17.3 Security Settings**

Recommended capabilities:

* Change password, if password-based authentication is used.  
* Review active sessions.  
* Sign out of other sessions.  
* Review recent security events.  
* Reverify email or phone where required.  
* Secure recovery process.  
* Additional verification for sensitive changes.

Sensitive actions, including changes to account security or billing, may require reauthentication.

### **17.4 Account Suspension and Restrictions**

If a Star account is restricted:

* Display the current account status.  
* Explain the restriction at an appropriate level of detail.  
* Show which actions are unavailable.  
* Provide a support or appeal path where applicable.  
* Preserve access to permitted account information.  
* Enforce restrictions in backend services.

A restriction should not be represented as a generic technical error if the user is allowed to receive an explanation.

### **17.5 Account Deletion**

If account deletion is supported, the flow should:

1. Explain what deletion means.  
2. Identify the data and content affected, where known.  
3. Explain any applicable retention obligations.  
4. Ask for confirmation.  
5. Require reauthentication where appropriate.  
6. Submit the deletion request.  
7. Display its status.  
8. Notify the user of completion or any issue requiring action.

The platform must define how deletion affects published content, fandoms, subscriptions, active events, and related fan data. The app must not claim that data has been fully erased before the backend confirms the applicable process.

### **17.6 Help and Support**

The help area should provide:

* Frequently asked questions.  
* Account and application help.  
* Subscription and payment help.  
* Content publishing support.  
* Community and safety guidance.  
* Contact support.  
* Existing support request status, if available.

A support form should collect only information necessary to resolve the issue. File attachments should be restricted to safe file types and protected from unauthorized access.

---

## **18\. Rising Star and Established Star Differences**

Both account types should use the same general Star Hub where possible, but their experiences should reflect their different onboarding and access needs.

| Area | Rising Star | Established Star |
| ----- | ----- | ----- |
| Entry into Star Hub | Application, review, and acceptance | Authorized Established Star account access |
| Initial setup | Profile completion and subscription selection | Profile review or completion, depending on account readiness |
| Application status | Required until resolved | Not applicable to the Rising Star application flow |
| Public profile | Built or completed during onboarding | Existing or recognized profile, editable within permitted rules |
| Dashboard | Guided onboarding until setup is complete | Dashboard based on available account data and permissions |
| Feature access | Governed by plan, approval, and permissions | Governed by account status, verification, plan, and permissions |
| Content | Publishing available according to setup and entitlements | Publishing available according to permissions and entitlements |
| Fandoms | Create or manage within available permissions | Manage authorized fandoms and communities |
| Analytics | Available when supported data exists and plan permits | Available when supported data exists and plan permits |
| Subscription | Selection required according to the approved onboarding rule | Display and manage the applicable plan or entitlement |
| Verification | Evidence collection or review where required | Existing status shown and updated through authorized verification processes |
| Support | Application and account support | Account and platform support |

These are product rules for a unified experience, not an assertion that Established Stars automatically receive every premium feature. Established Star entitlements still need to be configured.

---

## **19\. Global UI States and Error Handling**

All Star-side modules must use consistent states for loading, empty results, errors, access restrictions, and successful actions.

### **19.1 Required Global States**

* Initial loading.  
* Inline loading.  
* Skeleton loading.  
* Empty state.  
* Search with no results.  
* Offline state.  
* Slow connection.  
* Server error.  
* Request timeout.  
* Session expired.  
* Permission denied.  
* Feature not included in current plan.  
* Account restricted.  
* Payment pending.  
* Payment failed.  
* Upload failed.  
* Content processing.  
* Maintenance or service unavailable.  
* Success confirmation.

### **19.2 Error State Copy**

**No internet**

"You’re offline. Check your connection and try again."

Action: Try again.

**Server error**

"We couldn’t load this right now. Please try again."

Action: Retry.

**Session expired**

"Your session has expired. Sign in again to continue."

Action: Sign in.

**Feature unavailable on current plan**

"This feature isn’t included in your current plan."

Action: View plans, if plan upgrades are available.

**Empty content library**

"Your content will show up here once you publish your first post."

Action: Create a post.

### **19.3 Error Handling Requirements**

* Keep user-entered data when a recoverable error occurs.  
* Make retry actions safe for payments, posts, and mission creation.  
* Avoid duplicate records when a request is repeated.  
* Explain whether an action succeeded if the response was interrupted.  
* Provide a clear path back to a usable screen.  
* Use specific error messages when the backend provides a safe and actionable reason.  
* Do not reveal internal server errors, credentials, or sensitive system details.  
* Log diagnostic information securely for support and engineering.

---

## **20\. Super Admin Dependencies**

The Star app depends on the Clautverse Super Admin dashboard for platform-wide configuration, oversight, and enforcement. The Star app should consume those decisions through shared backend services rather than maintaining separate rules on the client.

### **20.1 Application Management**

Super Admin should be able to:

* View Rising Star applications.  
* Search and filter applications.  
* Open application details.  
* Review submitted information and supporting documents.  
* Request more information.  
* Accept or reject applications.  
* Record internal review notes.  
* View application history.  
* Configure supported categories and application requirements.  
* Manage permitted resubmission rules.  
* Suspend or close accounts within authorized permissions.

### **20.2 Star Account Management**

The administrative system should support:

* Viewing Rising Star and Established Star accounts.  
* Viewing account type, status, and verification status.  
* Managing profile review and account restrictions.  
* Reviewing relevant account activity.  
* Managing account-level entitlements.  
* Handling support escalations.  
* Recording account status changes in an audit log.

Established Star account access should follow the platform's authorized provisioning process. No separate Established Star claim flow is included in this PRD.

### **20.3 Subscription and Entitlement Configuration**

Super Admin or the designated billing administration system should manage:

* Freemium, Starter, Growth, and Pro plans.  
* Plan descriptions.  
* Feature entitlements.  
* Usage limits.  
* Billing intervals and prices.  
* Upgrade and downgrade rules.  
* Trial rules, if introduced.  
* Payment failure and grace-period policies.  
* Cancellation rules.  
* Feature availability by account type or region, where applicable.

Changes must be versioned or otherwise handled safely so that existing subscriptions are not unexpectedly corrupted.

### **20.4 Content and Community Oversight**

The platform administration system should support authorized review of:

* Reported content.  
* Reported Stars.  
* Community moderation cases.  
* Mission proposals or mission violations.  
* Live-session or watch-party incidents.  
* Original content and Drops.  
* Content removed or held for review.  
* Appeals and support escalations.

Star-side moderation actions should be distinguishable from platform-level enforcement actions.

### **20.5 Platform Configuration**

Super Admin dependencies also include:

* Supported content types.  
* Upload limits.  
* Mission rules and reward limits.  
* Supported live and watch-party configurations.  
* Notification templates and delivery rules.  
* Feature flags.  
* Verification requirements.  
* Analytics definitions and access.  
* Supported integrations.  
* Platform maintenance and service status.  
* Roles and permissions for administrative staff.

### **20.6 Shared-System Consistency**

If a Star publishes a post, schedules a watch party, approves a fan mission, or changes their profile, the change should appear correctly in the relevant fan app and Super Admin views.

The platform must avoid separate, conflicting records for the same Star, fandom, post, or event.

---

## **21\. Technical Architecture and Shared Services**

The following is a proposed logical architecture. It describes the responsibilities required for the product, not a mandated choice of technology stack.

### **21.1 Logical Architecture**

**Clautverse Star App**

Rising Star and Established Star experiences.

↓

**API Gateway and Authentication**

Identity, session validation, authorization, and rate limits.

↓

**Account Services**

Profiles, applications, verification, and plans.

**Content Services**

Posts, media, Drops, and Originals.

**Community Services**

Fandoms, missions, members, and moderation.

**Engagement Services**

Live sessions, watch parties, and notifications.

↓

**Shared Data and Platform Infrastructure**

Database, media storage, event processing, analytics, payments, audit logs, and integrations.

The services are shared with the fan app and Super Admin dashboard through authorized services.

### **21.2 Core Services**

**Identity and access service**

* Authentication and sessions.  
* Account types and statuses.  
* Role and permission enforcement.  
* Account recovery and security events.

**Star application service**

* Application creation and submission.  
* Review status.  
* Supporting document references.  
* Decisions and status history.

**Profile service**

* Public Star profile.  
* Profile media.  
* Links and categories.  
* Verification status.  
* Profile visibility.

**Subscription and entitlement service**

* Plans and entitlements.  
* Billing state.  
* Transaction verification.  
* Usage limits.  
* Access decisions.

**Content service**

* Drafts.  
* Upload processing.  
* Publishing.  
* Scheduling.  
* Audience enforcement.  
* Content moderation state.

**Community service**

* Fandoms.  
* Memberships.  
* Mission creation and approval.  
* Community activity.  
* Moderation and access restrictions.

**Live and event service**

* Live sessions.  
* Watch parties.  
* Event scheduling.  
* Attendance and participation.  
* Session state.

**Analytics service**

* Event ingestion.  
* Deduplication.  
* Aggregation.  
* Metric calculation.  
* Reporting access.

**Notification service**

* Notification creation.  
* User preferences.  
* Push, in-app, and email delivery where supported.  
* Deep links.  
* Delivery tracking.

**Safety and audit service**

* Reports and cases.  
* Account restrictions.  
* Administrative actions.  
* Sensitive access logs.  
* Appeals, where supported.

### **21.3 Shared-Data Requirements**

The fan app, Star app, and Super Admin dashboard should use consistent identifiers and business rules for:

* Users.  
* Star accounts.  
* Profiles.  
* Fandoms.  
* Posts and media.  
* Missions and mission participation.  
* Live sessions and watch parties.  
* Subscription entitlements.  
* Moderation records.  
* Notifications.  
* Analytics events.

A Star should not have to recreate a fandom or profile because a different app has a separate record of the same entity.

---

## **22\. Proposed Data Model**

The following entities are recommended for engineering design. They are logical entities and may be represented by tables, documents, or service-owned records depending on the chosen architecture.

| Entity | Purpose | Important fields |
| ----- | ----- | ----- |
| User | Shared Clautverse identity | ID, contact details, status, created date |
| StarAccount | Star-specific account | ID, user ID, type, status, verification state |
| StarApplication | Rising Star application | ID, applicant ID, fields, status, submitted date |
| ApplicationReview | Review history | Application ID, decision, reviewer ID, timestamp |
| StarProfile | Public identity | Star ID, name, handle, bio, media, links, category |
| VerificationRecord | Verification history | Star ID, status, evidence reference, reviewer, timestamp |
| Subscription | Current or historical plan | Star ID, plan ID, status, billing period |
| Plan | Plan definition | ID, name, price, billing interval, status |
| FeatureEntitlement | Access configuration | Plan ID, feature ID, limits, effective period |
| PaymentTransaction | Payment record | ID, account ID, amount, currency, status, provider reference |
| ContentItem | Post or published item | ID, Star ID, type, caption, audience, status |
| MediaAsset | Uploaded media | ID, owner ID, storage reference, type, processing status |
| ContentSchedule | Scheduled publication | Content ID, publish time, timezone, status |
| Drop | Drop-specific details | Content ID, access model, availability, expiry if supported |
| Original | Original content details | Content ID, metadata, audience, status |
| Fandom | Community record | ID, owner Star ID, name, rules, status |
| FandomMembership | Member access | Fandom ID, fan ID, status, join date |
| Mission | Mission configuration | ID, creator ID, fandom ID, rules, dates, status |
| MissionProposal | Fan-submitted mission | ID, fan ID, mission data, review status, reviewer |
| MissionParticipation | Participation record | Mission ID, fan ID, progress, completion status |
| LiveSession | Live event | ID, Star ID, title, schedule, status, provider reference |
| WatchParty | Watch-party event | ID, Star ID, schedule, audience, status |
| EventAttendance | Attendance record | Event ID, fan ID, join/leave timestamps, validated status |
| Notification | Notification record | ID, recipient ID, category, payload reference, read status |
| Report | Safety report | ID, reporter ID, target reference, category, status |
| AccountRestriction | Restriction record | ID, target account, reason code, effective period, status |
| AnalyticsEvent | Raw event record | Event name, actor, target, timestamp, source |
| AuditLog | Sensitive action history | Actor ID, action, resource, timestamp, result |

### **22.1 Data Integrity Rules**

* Every protected record must have an identifiable owner or authorization context.  
* Payment and entitlement changes must be traceable.  
* Publishing, mission approval, and event creation must be safe to retry.  
* A deleted or restricted entity must not remain accessible through stale cached content.  
* Application review history must be preserved according to the platform's retention policy.  
* Verification documents and moderation records must have stricter access controls than public content.  
* Audit logs must not be editable by ordinary Star users.  
* Analytics events must be deduplicated where repeated delivery is possible.

---

## **23\. API and Integration Requirements**

The exact API paths depend on the backend architecture. The following are logical endpoint groups and operations that engineering should cover.

### **23.1 Account and Application Operations**

* Create and retrieve Rising Star application.  
* Update draft application.  
* Submit application.  
* Retrieve application status and permitted feedback.  
* Upload supporting evidence.  
* Resubmit requested information.  
* Retrieve current Star account and profile.  
* Update profile.  
* Retrieve verification status.

### **23.2 Subscription Operations**

* Retrieve available plans.  
* Retrieve current subscription.  
* Start checkout.  
* Verify payment.  
* Retrieve billing history.  
* Request cancellation.  
* Request plan change.  
* Retrieve feature entitlements and usage limits.

### **23.3 Content Operations**

* Create and update draft.  
* Upload media.  
* Retrieve upload status.  
* Publish content.  
* Schedule publication.  
* Retrieve content list.  
* Update allowed content fields.  
* Archive or delete content.  
* Retrieve content analytics.

### **23.4 Community and Mission Operations**

* Retrieve fandoms.  
* Retrieve fandom details and members within permission.  
* Update authorized fandom settings.  
* Create and manage missions.  
* Retrieve fan mission proposals.  
* Approve or reject proposals.  
* Retrieve participation and completion metrics.  
* Perform authorized moderation actions.

### **23.5 Live and Event Operations**

* Create and schedule live sessions.  
* Retrieve live-session status.  
* Update or cancel events.  
* Create and schedule watch parties.  
* Retrieve event status and attendance.

### **23.6 Notifications and Analytics**

* Retrieve notifications.  
* Mark notification read.  
* Update notification preferences.  
* Retrieve analytics summaries.  
* Retrieve content performance.  
* Retrieve event performance.

### **23.7 Integration Safeguards**

* Authenticate all protected requests.  
* Enforce permissions on the server.  
* Validate input and file uploads.  
* Apply rate limits to sensitive or high-volume actions.  
* Use idempotency controls for payments, publishing, mission rewards, and event creation.  
* Return consistent error codes and safe user-facing messages.  
* Use pagination for large lists.  
* Apply versioning and backward compatibility where required.  
* Never rely on a hidden button as the sole access-control mechanism.

---

## **24\. Security, Privacy, and Compliance**

Security requirements apply across the Star app, shared backend, and administrative tools.

### **24.1 Authentication and Authorization**

* Secure account authentication and session handling.  
* Server-side access checks on every protected operation.  
* Session revocation and recovery.  
* Rate limiting for sign-in and sensitive actions.  
* Reauthentication for high-impact account changes where appropriate.  
* No shared account credentials as a substitute for team permissions.

### **24.2 Data Protection**

* Encrypt sensitive data in transit and at rest according to the platform's security standards.  
* Restrict access to verification documents.  
* Avoid placing secrets or sensitive data in client logs.  
* Minimize collection of personal information.  
* Define retention and deletion rules.  
* Keep internal moderation notes separate from public profile data.  
* Prevent direct access to private media without valid authorization.

### **24.3 Payments**

* Use approved payment providers.  
* Verify transactions server-side.  
* Avoid storing raw payment credentials in the application backend unless a compliant, explicitly approved architecture requires it.  
* Keep transaction references and entitlement history.  
* Handle duplicate callbacks safely.  
* Define cancellation, refund, chargeback, and failed-payment rules.  
* Do not unlock paid features based only on client-side confirmation.

### **24.4 Content and Community Safety**

* Provide report and escalation pathways.  
* Enforce content and account restrictions across the ecosystem.  
* Keep moderation decisions auditable.  
* Protect users from spam and abusive behaviour.  
* Restrict access to sensitive safety records.  
* Ensure community actions do not override platform-wide safety enforcement.

### **24.5 Compliance Decisions**

Before launch, product and legal teams should confirm:

* Applicable age requirements.  
* Privacy notices and consent requirements.  
* Data retention and deletion obligations.  
* Rules for media storage.  
* Payment, subscription, and cancellation disclosures.  
* Rights and licensing requirements for published media.  
* Requirements for live-streaming and user-generated content.  
* Region-specific availability and compliance.

This PRD does not establish a particular legal age threshold, payment provider, or regulatory status.

---

## **25\. Performance, Accessibility, and Reliability**

### **25.1 Performance Targets**

The following are proposed targets for engineering validation, not existing Clautverse service guarantees.

| Area | Proposed target |
| ----- | ----- |
| Common API response | p95 under 500 ms under agreed test conditions |
| Initial dashboard | Useful content rendered within 3 seconds on a representative device and connection |
| Screen navigation | No unnecessary full-screen blocking during ordinary navigation |
| Media upload | Visible progress, retry, and recoverable failure states |
| Large lists | Pagination or incremental loading |
| Analytics | Clearly defined freshness and refresh behaviour |
| Payment confirmation | Backend-verified status |
| Scheduled content | Reliable execution with retry and duplicate protection |
| Crash-free sessions | Target of at least 99.5%, subject to agreed measurement |

Performance targets should be validated against the selected infrastructure, media processing requirements, and expected launch traffic.

### **25.2 Accessibility**

* Readable text sizes and sufficient contrast.  
* Clear labels for interactive controls.  
* Screen-reader support for essential flows.  
* Meaningful error messages.  
* Keyboard and focus support where relevant.  
* Touch targets appropriate for mobile interaction.  
* Avoid colour as the only indicator of status.  
* Support system text scaling where feasible.  
* Respect reduced-motion preferences for supported animations.  
* Ensure loading and success states are communicated accessibly.

### **25.3 Reliability**

The app should handle:

* Intermittent network connections.  
* Interrupted uploads.  
* Expired sessions.  
* Delayed backend responses.  
* Duplicate event delivery.  
* Payment provider delays.  
* Scheduled job failures.  
* Streaming disconnections.  
* Stale cached content.  
* Partial service outages.

Critical actions should provide a clear outcome or an actionable retry path. If the client does not know whether a request succeeded, it should retrieve the current server state before repeating an action that could create duplicates.

---

## **26\. Analytics and Product Measurement**

The Star app should track events that help the team understand activation, engagement, conversion, reliability, and feature adoption.

### **26.1 Suggested Event Names**

**Application and onboarding**

* `star_application_started`  
* `star_application_saved`  
* `star_application_submitted`  
* `star_application_status_viewed`  
* `star_application_information_requested`  
* `star_application_resubmitted`  
* `star_application_accepted`  
* `star_application_rejected`  
* `star_profile_setup_started`  
* `star_profile_setup_completed`

**Subscription**

* `star_plan_viewed`  
* `star_plan_selected`  
* `star_checkout_started`  
* `star_payment_completed`  
* `star_payment_failed`  
* `star_subscription_activated`  
* `star_subscription_cancelled`  
* `star_plan_changed`  
* `star_entitlement_denied`

**Content**

* `star_content_creation_started`  
* `star_content_draft_saved`  
* `star_content_published`  
* `star_content_scheduled`  
* `star_content_publish_failed`  
* `star_drop_created`  
* `star_original_created`  
* `star_content_analytics_viewed`

**Community**

* `star_fandom_viewed`  
* `star_fandom_updated`  
* `star_mission_created`  
* `star_mission_published`  
* `star_mission_proposal_reviewed`  
* `star_mission_proposal_approved`  
* `star_mission_proposal_rejected`  
* `star_moderation_action_taken`

**Live and events**

* `star_live_session_scheduled`  
* `star_live_session_started`  
* `star_live_session_ended`  
* `star_watch_party_scheduled`  
* `star_watch_party_started`  
* `star_watch_party_ended`

**Notifications and settings**

* `star_notification_opened`  
* `star_notification_preferences_updated`  
* `star_profile_updated`  
* `star_security_setting_changed`  
* `star_support_request_created`

### **26.2 Event Properties**

Where relevant and permitted, events should include:

* Timestamp.  
* Account ID.  
* Account type.  
* Account status.  
* Feature or resource ID.  
* Subscription plan identifier.  
* Result or outcome.  
* Error category.  
* App version.  
* Relevant source or entry point.

Do not include passwords, payment credentials, or unnecessary personal data in analytics events.

### **26.3 Success Metrics**

| Metric | What it measures |
| ----- | ----- |
| Application completion | Percentage of applicants who complete submission |
| Application conversion | Percentage of eligible applicants accepted |
| Time to decision | Time between submission and review outcome |
| Onboarding completion | Percentage of accepted Rising Stars completing setup |
| Time to first post | Time between access activation and first publication |
| Star activation | Percentage of newly active Stars completing a defined meaningful action |
| Weekly active Stars | Stars active within a seven-day period |
| Content publishing frequency | Published content per active Star |
| Content engagement | Defined audience interactions relative to reach or views |
| Fandom growth | Change in fandom membership over time |
| Mission participation | Eligible fans participating in Star-created or approved missions |
| Live attendance | Validated attendance at live sessions |
| Watch-party attendance | Validated attendance at watch parties |
| Subscription conversion | Eligible Stars who activate a paid plan |
| Subscription retention | Subscribers remaining active over a defined period |
| Feature adoption | Use of Drops, Originals, analytics, and other supported features |
| Technical reliability | Crash rate, failed requests, upload failures, and payment errors |
| Safety performance | Reports, resolution times, repeat incidents, and moderation outcomes |

### **26.4 Defining Activation**

A recommended initial activation definition for a Rising Star is: **the Star completes profile setup and publishes a first post or completes another approved core action within seven days of gaining access.**

This should be validated with product analytics before being treated as the final business KPI.

Established Star activation should be measured separately, since an established account may already have a complete profile or imported content.

---

## **27\. MVP Scope and Phased Rollout**

The exact release boundary must be approved by product and engineering. The following is a proposed rollout based on the known requirements.

### **Phase 1: Core Star Hub**

* Authentication and account access.  
* Rising Star application and review status.  
* Profile setup and editing.  
* Established Star authorized access.  
* Subscription selection and plan display.  
* Dashboard and onboarding checklist.  
* Basic content creation and publishing.  
* Drafts and published content management.  
* Basic fandom overview and management.  
* Notification centre.  
* Account settings and support.  
* Global loading, empty, offline, and error states.  
* Super Admin application and account dependencies.  
* Core analytics events and access control.

### **Phase 2: Community and Engagement**

* Drops and Originals management.  
* Mission creation and management.  
* Fan-proposed mission review.  
* Live-session scheduling and management.  
* Watch-party scheduling and management.  
* Expanded content and audience analytics.  
* Community moderation workflows.  
* More detailed notification preferences.  
* Additional security and account-management capabilities.

### **Phase 3: Advanced Capabilities**

Subject to product validation and integration readiness:

* Advanced analytics and comparisons.  
* Additional audience segmentation.  
* More sophisticated content scheduling.  
* Expanded team permissions for Star accounts.  
* Advanced live and watch-party controls.  
* Additional monetization features.  
* Additional plan-based tools.  
* Analytics exports and integrations.  
* Additional creator growth and engagement tools.

The phased approach is a recommendation. Features should not be treated as committed launch scope until the team approves the MVP.

---

## **28\. QA Plan and Acceptance Criteria**

Every feature should be tested across Rising Star and Established Star accounts, including relevant account statuses, plan entitlements, network conditions, and backend permissions.

### **28.1 Application and Onboarding**

* Applicant can create, save, and submit a Rising Star application.  
* Required fields and uploads are validated.  
* Duplicate submissions are handled correctly.  
* Application status reflects the backend's latest decision.  
* Information requests show the required changes.  
* Resubmission preserves existing information.  
* Accepted applicants can proceed to profile setup.  
* Rejected applicants see the configured next steps.  
* Application decisions and changes are auditable.  
* Established Star access follows the authorized account-provisioning process without a separate claim flow.

### **28.2 Profile and Dashboard**

* Star can complete and edit permitted profile fields.  
* Profile preview reflects the correct fan-facing information.  
* Profile changes synchronize across the ecosystem.  
* Dashboard metrics use the correct account and date range.  
* New accounts see useful zero states.  
* Unavailable metrics do not display fabricated data.  
* Restricted accounts cannot access prohibited actions.

### **28.3 Subscription and Billing**

* Plans and entitlements match the configured backend.  
* Successful payments activate the correct subscription.  
* Failed or pending payments do not unlock paid features prematurely.  
* Duplicate payment callbacks do not create duplicate transactions.  
* Plan changes update entitlements correctly.  
* Expiry, cancellation, refunds, and failed renewals follow approved rules.  
* Billing history shows the correct transaction status.

### **28.4 Content, Drops, and Originals**

* Star can create, save, preview, and publish permitted content.  
* Media uploads show progress and recoverable errors.  
* Scheduled content publishes at the configured time.  
* Retried publication jobs do not create duplicate posts.  
* Audience restrictions are enforced by the backend.  
* Content moderation status is visible to the Star where appropriate.  
* Drafts survive recoverable failures.  
* Content analytics correspond to the correct item.

### **28.5 Fandoms and Missions**

* Authorized Stars can manage their fandom settings.  
* Membership and moderation actions enforce permissions.  
* Fan-proposed missions reach the correct Rising Star for review.  
* Approved missions become available according to the configured rules.  
* Rejected proposals receive the appropriate status.  
* Mission completion and rewards cannot be duplicated.  
* Removed or restricted users cannot continue actions that require membership.  
* Community reports and moderation actions are recorded.

### **28.6 Live Sessions and Watch Parties**

* Live sessions can be scheduled and managed by authorized Stars.  
* Streaming errors and disconnections have appropriate states.  
* Watch parties can be scheduled, edited, and cancelled according to policy.  
* Event changes trigger the correct notifications.  
* Attendance and event metrics are based on validated events.

### **28.7 Notifications and Settings**

* Notifications link to the correct destination.  
* Read and unread states remain consistent.  
* User preferences are respected.  
* Duplicate events do not produce repeated notifications.  
* Privacy and security settings persist correctly.  
* Account closure and deletion follow the approved process.

### **28.8 Non-Functional QA**

* Authorization is enforced on the server.  
* Private media and sensitive records are protected.  
* Core flows work on supported devices and operating systems.  
* Performance targets are measured under agreed test conditions.  
* Accessibility checks cover primary workflows.  
* Offline and interrupted-request states are recoverable.  
* No critical or high-severity defects remain at release.  
* Analytics events are validated against their definitions.

---

## **29\. Definition of Done**

A feature is complete when:

1. The relevant user flow and business rules are implemented.  
2. The design follows the approved Clautverse mobile design system.  
3. Loading, empty, error, success, and restricted states are covered.  
4. Backend validation and permissions are implemented.  
5. Relevant analytics events are instrumented and tested.  
6. Notifications and cross-app updates work where required.  
7. Accessibility and security requirements are addressed.  
8. QA has validated the acceptance criteria.  
9. Technical and product documentation is updated.  
10. There are no unresolved critical or high-severity defects affecting the feature.

For high-impact actions, such as payments, publishing, account restrictions, mission approvals, and event creation, the implementation must also support safe retries, consistent state, and an auditable history.

---

## **30\. Product Decisions That Still Need Confirmation**

The following tracker separates known requirements from decisions that need formal approval before implementation.

### **Account Access and Onboarding**

* Eligibility requirements for Rising Star applicants.  
* Application review turnaround targets.  
* Reapplication rules after rejection.  
* Exact Established Star provisioning and verification rules.  
* Whether any additional verification is required for account changes.

### **Plans and Monetization**

* Prices and billing intervals for Freemium, Starter, Growth, and Pro.  
* Feature and usage limits for each plan.  
* Which features require a paid plan.  
* Payment provider and supported currencies.  
* Upgrade, downgrade, cancellation, refund, and grace-period rules.  
* What happens to content after plan expiry or downgrade.

### **Content and Originals**

* Supported media formats and upload limits.  
* Exact Drops access and monetization model.  
* Meaning and rules of the first 100 Originals.  
* Content scheduling limits.  
* Content moderation and appeal rules.  
* Content retention and deletion rules.

### **Fandoms and Missions**

* Whether a Star can own multiple fandoms.  
* Default fandom creation rules.  
* Public and private fandom options.  
* Fan access policies for community features.  
* Mission types, limits, rewards, and approval requirements.  
* Star and Super Admin moderation responsibilities.

### **Live Sessions and Events**

* Live-streaming technology and replay policy.  
* Watch-party media source and playback model.  
* Event capacity and access rules.  
* Event attendance validation rules.  
* Which real-time audience interaction features are supported.

### **Analytics and Privacy**

* Final definitions for reach, views, and engagement.  
* Available demographic analytics and privacy thresholds.  
* Proof-document requirements and retention.  
* Analytics availability by plan.  
* Data retention, deletion, and regional compliance rules.

### **Launch and Operations**

* Approved MVP feature list.  
* Supported operating systems and minimum versions.  
* Performance targets and test conditions.  
* Star team roles and permissions.  
* Support and appeal processes.  
* Feature rollout and migration strategy.

---

## **31\. Final Product Vision**

The Clautverse Star app should give Rising and Established Stars a reliable place to manage their presence, publish content, grow their communities, and interact with fans through structured activities.

The most important product distinction is that **Rising Stars need a guided path from application to an active Star presence, while Established Stars need a streamlined account experience that supports their existing public presence.** Both should benefit from a unified Star Hub, consistent permissions, clear subscription entitlements, and shared services connecting the Star app, fan app, and Super Admin dashboard.

The product should prioritize the following outcomes:

* Stars can get set up without confusion.  
* Publishing and community management are straightforward.  
* Fans can participate through fandoms, missions, live sessions, and watch parties.  
* Stars can understand audience growth and engagement.  
* Account access, subscriptions, payments, and moderation remain trustworthy.  
* The experience feels like a dedicated Clautverse creator workspace rather than a generic social media dashboard.

**Implementation note:** Use the uploaded Clautverse mobile screens as the only design-system reference for the Figma work. Treat this PRD as the functional source of truth, and do not invent a new visual language or assume that an unconfirmed feature or entitlement already exists.

**Platform constraint:** Clautverse does not support messaging or direct messages. No inbox, conversation list, message requests, private chat, or DM functionality should be designed or implemented in the Star-side application.

