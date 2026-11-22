# Devin Prompt — Cloudverse Backend API Review and Docus Implementation Guide

You are Devin, acting as a product-minded backend architect and documentation engineer. I am building Cloudverse myself with your assistance. I will attach these two documents:

1. `Cloudverse-MVP-Backend-PRD.md` — backend product requirements and current working stack.
2. `Cloudverse-Implementation-Guide-PRD.md` — requirements for the implementation-guide website.

Read both documents fully. Treat them as the primary source of truth. This prompt adds two explicit requirements: **first, produce and review a complete proposed Cloudverse API route contract and wait for my approval before building; second, build the implementation guide in Docus and include the API reference as part of the Docus guide.**

## Critical approval gate: API design first, no building yet

Your first response must be an API design review only. Do not edit files, install packages, scaffold Docus, implement backend routes, change schemas, or build UI before I confirm the proposed API design.

You may inspect repository files in read-only mode if available to understand the existing project, but do not make changes during this first phase.

### API route review deliverable

Flesh out the API route design in `Cloudverse-MVP-Backend-PRD.md` so it is sufficiently precise to review before implementation. Do not merely repeat the example route names. For each proposed route, document:

- HTTP method and canonical path.
- Purpose and calling user journey.
- Caller/authentication and authorization rules.
- Path parameters, query parameters, and request body shape, where applicable.
- Success response shape and important fields.
- Expected validation, authentication, authorization, not-found, conflict, and state-transition errors.
- Pagination, sorting, and filtering behavior for list endpoints.
- Idempotency or duplicate-submission behavior for joins, mission completions, XP grants, and other state-changing actions.
- Relevant entities and side effects, including audit, notifications, or XP ledger entries when applicable.
- Acceptance tests that prove the route works and enforces permissions.
- Status: confirmed requirement, proposed route, deferred, or blocked by an open product decision.

Organize the inventory by domain: account/auth; onboarding/catalog; talent profiles/applications/claims; communities/memberships/Originals; feed/drops/reactions/replies; missions/completions/XP/badges; watch parties; notifications; discover; plans/subscriptions; admin/moderation/audit; analytics if in launch scope.

### How to handle unresolved requirements

- Compare every route against the backend PRD and identify missing, duplicate, overlapping, or unnecessary routes.
- Do not invent decisions for open topics such as Originals access, XP thresholds, mission proof/review, public-vs-member content, watch-party hosting, signup/age data, billing, or admin scope.
- Where a route depends on an unresolved decision, propose a safe route shape if useful, mark the behavior as `OPEN`, explain what decision is needed, and do not present it as final.
- Separate the Cloudverse product API from Docus website routes. The Docus site is a documentation website; it does not need a Cloudverse API or database just to render guides.
- Recommend a consistent API convention and error format, but mark it as a proposal if it is not already decided.

### End the first response by stopping

Present the route contract and the small set of decisions I need to make. Clearly ask me to confirm or request changes. Then stop and wait. **Do not begin implementation until I explicitly approve the API design.**

## Work after I approve the API contract

After I explicitly confirm the route design, continue with the approved scope. If I approve only part of it, implement only that part. The route approval is not permission to silently decide unresolved business rules or to deploy a commercial service.

### Build the guide site in Docus

Use **Docus as the documentation website from the beginning to the end**; do not replace it with a generic custom blog or a different docs theme without asking. Docus is the preferred site foundation because the guide is primarily structured documentation and should use Docus’s Nuxt/Markdown workflow.

Use the official Docus setup and concepts documentation as needed:
- https://docus.dev/en/getting-started/installation
- https://docus.dev/en/concepts/nuxt

Keep the Docus guide site separate from the fan-facing Cloudverse product and its API. Inspect the existing repository first and avoid overwriting Cloudverse code. If Docus’s Nuxt version differs from Cloudverse’s app, keep the guide app independent rather than upgrading or destabilizing the Cloudverse app.

The Docus website should be a version-controlled documentation site, with guide content in Markdown/MDC and custom components only where needed for the interactive Question and Report actions. Keep v1 simple: no database, accounts, CMS, model API, analytics, or automatic Devin integration unless I separately approve them.

## Guide content to author

Organize the documentation by Cloudverse implementation feature, not by blog publication date. Start with a clear architecture overview and build guides in dependency order, using the approved API contract and the backend PRD. Potential guide areas include:

1. Backend architecture and request lifecycle.
2. Nuxt/Nitro project and environment setup.
3. Authentication and server-side authorization, once the provider is selected.
4. PostgreSQL/Neon connection, migrations, and data access layer, once the ORM/driver is selected.
5. Core domain model and data integrity.
6. Onboarding/catalog routes.
7. Communities, memberships, and the approved Originals rules.
8. Feed and drops, with approved content-access behavior.
9. Missions, completions, XP, and badges, after their business rules are approved.
10. Talent/admin flows, watch parties, notifications, and other approved MVP work.
11. Testing, Vercel/Neon deployment, and future Contabo/Docker portability.
12. **API Reference**, near the end of the guide, using the approved API contract.

For each guide, explain the goal, prerequisites, exact files to create/change, code, line/block explanations, expected result, verification steps, troubleshooting, and links to official documentation with an explanation of why each source matters. Make Nuxt/Nitro the canonical Cloudverse implementation. Include concise React/Vue and Next.js/Nuxt concept mapping where useful, but do not create four full implementations for every feature. Explain that React and Vue are UI technologies and Next.js and Nuxt are frameworks built around them.

Never invent Cloudverse business rules. Mark information as confirmed, proposed, or open. If a guide depends on a decision that is still open, document the dependency and do not present example code as final production behavior.

## API documentation inside Docus

Create a clear Docus **API Reference** section near the end of the guide. Use the approved route contract as the source of truth. Group endpoints by domain and document each route with method/path, purpose, authentication/authorization, parameters, request example, response example, errors, pagination/idempotency behavior, and links to the implementation guide/test where relevant.

Prefer Docus pages as the human-facing API documentation; I prefer this over a separate Swagger UI. To reduce drift, propose or maintain a machine-readable OpenAPI YAML file in the repository if it fits the approved contract. The Docus pages must agree with that file and the approved route contract. Do not add Swagger UI or an API explorer unless I explicitly request it. Do not document an endpoint as implemented until it actually exists and its behavior has been tested; label planned routes clearly.

## Question and Report actions on guide sections

Add **Question** and **Report** actions to meaningful content sections, especially code, explanations, expected results, and verification steps. Each action must use the selected section’s context rather than unrelated sections or the whole guide by default.

### Question

- Open a concise form where the reader enters a question.
- Prepare a model-agnostic prompt containing guide title, section ID/title, relevant section text/code, file path, stack/framework/version, prerequisites, expected result, verification guidance, and relevant source links.
- Include the reader’s question and ask the model to state assumptions and request missing information rather than inventing it.
- Preview before copying; include copy confirmation and a manual-copy fallback.
- Do not call an AI model, send the prompt, or save the question.

### Report

- Open a concise form for what happened, with optional actual result, error text, steps taken, and environment/version.
- Generate a copyable troubleshooting prompt with section context, expected versus actual behavior, and the reader’s observations.
- Ask the AI to identify likely causes, name files to inspect, suggest the smallest safe fix, and give verification steps. Do not claim tests were run unless they were.
- Preview before copying; include copy confirmation and a manual-copy fallback.
- Do not connect to Devin, create issues, alter code, or store the report automatically.

Clearly warn readers that the prompt may contain selected guide text/code and that they decide whether to copy and share it. Never include secrets, tokens, credentials, or environment-variable values. Delimit quoted guide content and user-provided observations so they are clearly context, not instructions.

## Quality and implementation requirements

- Use the Docus conventions and existing repository tooling; check current Docus documentation rather than guessing component names or configuration.
- Keep code samples aligned with actual repository code and approved API behavior.
- Make the site responsive, keyboard-accessible, and readable on mobile.
- Test prompt generation for correct section context, user input, exclusion of unrelated content, and omission of secrets.
- Test the site build and relevant links. Report exact checks run and results; do not claim a check passed unless it was run.
- Keep Vercel deployment configuration ready, but do not deploy without my approval. Confirm that the intended Vercel plan is appropriate before any commercial publication.
- Do not add features, providers, or dependencies beyond the approved scope without explaining why and asking first.

## Final handoff after implementation is authorized

When the approved implementation is complete, report:

- What was built and how the Docus documentation is organized.
- Files created or changed.
- Which API routes are implemented versus planned/deferred.
- Tests/build checks run and their results.
- Product decisions or content still needed from me.
- Any deployment, Vercel plan, Neon, or future Contabo/Docker considerations.
