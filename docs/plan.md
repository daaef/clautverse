# Clautverse backend plan

**In one line:** a single Nuxt project that serves the Clautverse API, built to the designer's Ecosystem PRD.

Updated 2026-11-21. The old 25-file plan set is in git history at commit `6aec313` (`docs/mvp/`).

## Sources, in order of authority

1. `docs/specs/ecosystem-prd.md` is the designer's PRD. **It wins every conflict.**
2. `docs/specs/meeting-backend-prd.md` is derived from the meeting notes. Use it for launch context only (for example, Reality TV first).
3. `docs/specs/devin-guide-prompt.md` is history. It explains why the code had a TV catalog and claims.

## Decisions (2026-11-21, owner)

| # | Topic | Decision |
|---|---|---|
| 1 | Categories | Keep. Reality TV is the only active category at launch. This is a data setting, not code. |
| 2 | Shows and seasons | **Remove.** The PRD doesn't mention them. Launch Stars sit under the Reality TV category. |
| 3 | Country | Keep the table, for the Star application only. Remove it from fan onboarding. |
| 4 | Identity claims | **Remove.** The PRD says "no separate claim flow." |
| 5 | Established Star type | Later. Not needed for the pilot. |
| 6 | Originals | Keep as built: the first 100 members get a number, retired forever when they leave. Ask the designer what "Originals" means on the Star side. |
| 7 | Lanes | 6 lanes. A second lane unlocks at Supporter tier. Lane changes stay an open question. |
| 8 | XP and tiers | XP per fandom. Tiers at 0 / 100 / 500 / 2,000 / 5,000. Leaving a fandom clears its XP. |
| 9 | Follow Rising Stars | Build it. |
| 10 | Star subscription plans | Deferred for the pilot. Confirm with the designer. |
| 11 | XP Boost and badge skins | Phase 3, not now. |
| 12 | Watch parties | Keep as built: an external link plus RSVP. |
| 13 | Analytics | A small event log for the pilot (PRD §13.7). |

Earlier rulings still stand. Lane codes: `rider`, `fandom_builder`, `builder`, `analyst`, `creator`, `mutual`. Rejoining needs a fresh lane. A duplicate join ignores the lane. Reinstating clears the block but keeps the removal count. Request bodies are capped at 64 KB (`PAYLOAD_TOO_LARGE`).

## What the repo keeps

- `server/` is the API, and `tests/` holds the unit and end-to-end tests.
- `openapi/clautverse.yaml` is the API contract.
- The API Explorer page is the only web page. It's interactive and reads the contract.

## Task list (in order)

| # | Task | Status |
|---|---|---|
| 1 | Safety baseline: lane join, blocks, removal rules, reinstate | Done, `6aec313` (e2e 71/71) |
| 2 | Remove the guide app and the guide pages. Keep the API Explorer. | Done |
| 2b | API Explorer shows sample data for every parameter, header and body field | Done |
| 3 | Remove identity claims (decision 4) | To do |
| 4 | Remove shows and seasons. Onboarding becomes categories plus favourite Stars. Stars get a category. (Decisions 2, 3) | To do |
| 5 | Seed fictional pilot data (no real people or brands) | To do |
| 6 | 64 KB request-body cap | To do, security review |
| 7 | Follow Rising Stars | To do |
| 8 | XP per fandom, plus tiers | To do, security review |
| 9 | Second lane at Supporter | To do |
| 10 | Pilot analytics event log | To do |

## How we work

- **Main session (Opus 5.5)** builds, runs the checks, commits, and explains each change.
- **Reviewer (fresh Opus 5.5)** checks security work (auth, XP, admin, input limits) and big changes.
- **Explorer (Sonnet 5.5)** handles searches across many files. **Haiku 5.5** handles renames and doc upkeep.
- Every change: the tests pass before it's committed, and this file's task table is updated in the same commit.
