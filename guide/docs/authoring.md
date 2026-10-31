# Authoring guide pages

Pages are Markdown files in `content/`. Folder and file number prefixes set the order (`2.onboarding/1.complete-onboarding.md` → `/onboarding/complete-onboarding`).

## Frontmatter (required on every guide page outside `99.api-reference/` and `index.md`)

```yaml
---
title: string
slug: string              # file path without number prefixes or extension
summary: string           # one sentence, shown on the index
feature: string           # e.g. onboarding, feed, missions
tags: [string]
status: confirmed | proposed | open
stack: string             # e.g. "Nuxt/Nitro, PostgreSQL"
frameworkVersion: string  # e.g. "Nuxt 4.6 / Nitro 2"
prerequisites: [string]   # guide slugs or short descriptions
lastVerified: string      # ISO date or commit SHA
provenance: string        # contract route / decision it comes from
---
```

`tests/unit/content-schema.test.ts` fails if a field is missing or `status` is invalid.

## Page skeleton

Use these `##` headings where they apply: Outcome, Concept map, Prerequisites, Implementation steps, Code explanation, Expected result, Verification, Documentation references, Troubleshooting, Status and provenance.

## Sections with Question / Report

```md
::guide-section{id="onboarding-complete-handler" title="Onboarding complete handler" type="code" file-path="server/api/onboarding/complete.post.ts" expected-result="…" verification="…" references="Label https://…|Label https://…"}
```ts [server/api/onboarding/complete.post.ts]
// code
```
::
```

- `id` must be unique on the page and stable (it is part of the prompt).
- `type` is one of `concept | prerequisite | code | explanation | expected-result | verification | reference | open-decision`.
- Only `code`, `explanation`, `expected-result` and `verification` show the buttons by default. Add `:actions="true"` or `:actions="false"` to override.
- `open-decision` sections are drawn with a warning and must never contain code presented as final.

## Prompt rules

The prompt builders (`app/composables/usePromptBuilder.ts`) are pure functions. They only use the clicked section's text and code, the page frontmatter and what the reader types. Never put secrets or real environment values in guide content.

## API Reference

`content/99.api-reference/` must agree with `../openapi/clautverse.yaml`. `tests/unit/openapi-sync.test.ts` compares route IDs, methods, paths and status badges. Mark a route `implemented` only when the backend route exists and its tests pass.
