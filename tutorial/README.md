# Build Clautverse from scratch (the tutorial)

**In one line:** a multi-page HTML guide that takes a beginner from an empty Nuxt 4 project to this whole repository.

## Read it

Open `tutorial/site/index.html` in a browser (double-click works; no server needed). Start at the home page and go in order.

## What is in here

| Path | What it is |
|---|---|
| `site/` | The finished guide (generated; commit it so people can read without building). |
| `src/` | The chapters, written by hand as HTML. `home.html` is the start page. |
| `assets/` | The stylesheet and the small script (search, dark mode, copy buttons). |
| `build.mjs` | The generator. Needs only Node, no packages. |

## Rebuild after the code changes

```bash
node tutorial/build.mjs
```

The build copies code into the pages straight from the repo (`<!--@file path-->` and `<!--@block path 'text'-->` in a chapter). It stops with an error if a file or block no longer exists, and prints how many repo files appear in the guide. The reference pages and the endpoint table are generated from the real files, so they cannot drift. The sentences around the code are hand-written, so re-read a chapter when its code changes.

## Chapter source directives

- `<!--@file path-->`, `<!--@file path 10-30-->`: show a repo file, or only some lines.
- `<!--@block path 'text'-->`: show the indented block that starts at the line beginning with `text`.
- `<!--@code lang | title-->...<!--@/code-->`: show hand-written code (commands, small snippets).
- `<!--@pkg name-->`: the version of a package from `package.json`.
- `<!--@ref path-->`: a link to a file on the reference pages. `<!--@tables-->`: the table count.
- `<plain>`, `<tech>`, `<tip>`, `<warn>`, `<check>`: the coloured side notes.
