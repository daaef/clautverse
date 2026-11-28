// Builds the tutorial site: node tutorial/build.mjs
// Chapters live in tutorial/src/*.html. Code samples are copied from the repo's real files at build
// time, so they cannot drift. The build fails if an include points at a file or block that is gone.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const SRC = join(here, 'src')
const OUT = join(here, 'site')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim()
const problems = []
const used = new Map() // repo file -> chapter slug that first includes it

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const slugify = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const fileId = p => 'f-' + p.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()

// ---------- tiny syntax highlighter ----------
const KW = 'import|export|from|const|let|var|function|async|await|return|if|else|for|of|in|new|throw|try|catch|finally|default|type|interface|as|typeof|extends|class|null|undefined|true|false|void|defineProps|defineEmits|defineModel'
const SQLKW = 'create|table|index|unique|primary|key|not|null|default|references|constraint|alter|add|insert|into|values|select|from|where|on|conflict|do|nothing|update|set|delete|and|or|join|with|returning|as|true|false'
function highlight(lang, code) {
  const hash = ['bash', 'sh', 'yaml', 'env', 'text'].includes(lang)
  const dash = lang === 'sql'
  const kw = dash ? SQLKW : KW
  const comment = hash ? '#[^\\n]*' : dash ? '--[^\\n]*' : '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->'
  const re = new RegExp(`(${comment})|('(?:[^'\\\\\\n]|\\\\.)*'|"(?:[^"\\\\\\n]|\\\\.)*"|\`(?:[^\`\\\\]|\\\\.)*\`)|\\b(${kw})\\b|(\\b\\d[\\d_.]*\\b)`, dash ? 'gi' : 'g')
  let out = ''
  let last = 0
  for (const m of code.matchAll(re)) {
    out += esc(code.slice(last, m.index))
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : 'n'
    out += `<span class="t-${cls}">${esc(m[0])}</span>`
    last = m.index + m[0].length
  }
  return out + esc(code.slice(last))
}
const langOf = p => ({ ts: 'ts', mjs: 'ts', js: 'ts', vue: 'ts', css: 'ts', json: 'json', sql: 'sql', yaml: 'yaml', yml: 'yaml', md: 'text' })[p.split('.').pop()] ?? (p.startsWith('.env') ? 'env' : 'text')

function figure({ lang, title, caption, code, file }) {
  const head = `<div class="code-head"><span class="code-file">${esc(title ?? file ?? lang)}</span>${caption ? `<span class="code-cap">${esc(caption)}</span>` : ''}<button type="button" class="copy" aria-label="Copy code">Copy</button></div>`
  return `<figure class="code" data-lang="${lang}">${head}<pre><code>${highlight(lang, code.replace(/\n$/, ''))}</code></pre></figure>`
}

// ---------- repo reads ----------
const repoFile = p => readFileSync(join(root, p), 'utf8')
function blockOf(lines, needle) {
  const i = lines.findIndex(l => l.trimStart().startsWith(needle))
  if (i < 0) return null
  const indent = lines[i].match(/^ */)[0].length
  let j = i + 1
  while (j < lines.length && (lines[j].trim() === '' || lines[j].match(/^ */)[0].length > indent)) j++
  while (lines[j - 1]?.trim() === '') j--
  if (lines[j] && /^\s*[}\])]/.test(lines[j])) j++
  return lines.slice(i, j)
}

function expand(body, slug) {
  return body
    .replace(/<!--@file (\S+?)(?: (\d+)-(\d+))?(?: \| (.*?))?-->/g, (_, p, a, b, cap) => {
      let text
      try { text = repoFile(p) } catch { problems.push(`${slug}: missing file ${p}`); return `<p class="broken">missing ${p}</p>` }
      if (!used.has(p)) used.set(p, slug)
      let caption = cap
      if (a) { text = text.split('\n').slice(+a - 1, +b).join('\n'); caption = `${cap ? cap + ' · ' : ''}lines ${a}–${b}` }
      return figure({ lang: langOf(p), file: p, title: p, caption, code: text })
    })
    .replace(/<!--@block (\S+?) (["'])(.+?)\2(?: \| (.*?))?-->/g, (_, p, _q, needle, cap) => {
      const lines = repoFile(p).split('\n')
      const blk = blockOf(lines, needle)
      if (!blk) { problems.push(`${slug}: no block "${needle}" in ${p}`); return '<p class="broken">missing block</p>' }
      if (!used.has(p)) used.set(p, slug)
      return figure({ lang: langOf(p), file: p, title: p, caption: cap ?? 'excerpt', code: blk.join('\n') })
    })
    .replace(/<!--@pkg ([\w@\/.-]+)-->/g, (_, n) => {
      const v = pkg.dependencies?.[n] ?? pkg.devDependencies?.[n] ?? pkg.engines?.[n]
      if (!v) { problems.push(`${slug}: package ${n} not in package.json`); return '?' }
      return v
    })
    .replace(/<!--@code (\w+)(?: \| (.*?))?-->\n?([\s\S]*?)<!--@\/code-->/g, (_, lang, title, code) => figure({ lang, title: title ?? lang, code }))
    .replace(/<!--@ref (\S+?)(?: \| (.*?))?-->/g, (_, p, label) => {
      const g = REF_GROUPS.find(x => x.test(p))
      if (!tracked.includes(p)) { problems.push(`${slug}: @ref to unknown file ${p}`); return '?' }
      if (!used.has(p)) used.set(p, slug)
      return `<a href="${g.slug}.html#${fileId(p)}"><code>${esc(label ?? p.replace(/^server\/api\//, ''))}</code></a>`
    })
    .replace(/<!--@tables-->/g, () => String(['auth', 'app'].reduce((n, f) => n + (repoFile(`server/db/schema/${f}.ts`).match(/pgTable\(/g) ?? []).length, 0)))
    .replace(/<(plain|tech|tip|warn|check|try)>/g, (_, k) => `<aside class="callout ${k}"><p class="callout-label">${({ plain: 'In plain words', tech: 'In programming terms', tip: 'Tip', warn: 'Watch out', check: 'Checkpoint', try: 'Try it' })[k]}</p>`)
    .replace(/<\/(plain|tech|tip|warn|check|try)>/g, '</aside>')
}

// ---------- chapters ----------
function loadChapters() {
  return readdirSync(SRC).filter(f => /^\d\d-.+\.html$/.test(f)).sort().map((f) => {
    const raw = readFileSync(join(SRC, f), 'utf8')
    const m = raw.match(/^<!--@meta\n([\s\S]*?)-->\n?/)
    if (!m) throw new Error(`${f}: missing @meta`)
    const meta = Object.fromEntries(m[1].trim().split('\n').map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]))
    const slug = f.replace(/\.html$/, '')
    return { slug, ...meta, raw: raw.slice(m[0].length) }
  })
}

// route file -> API path + method (same rule the app's own openapi route uses)
function routeOf(file) {
  const segs = file.replace(/^server\/api\//, '').replace(/\.ts$/, '').split('/')
  const last = segs.at(-1)
  const dot = last.lastIndexOf('.')
  let method = 'ANY'
  if (dot > 0 && ['get', 'post', 'put', 'patch', 'delete'].includes(last.slice(dot + 1))) { method = last.slice(dot + 1).toUpperCase(); segs[segs.length - 1] = last.slice(0, dot) }
  const parts = segs.map(s => s === 'index' ? '' : s.replace(/^\[\.\.\.(.+)\]$/, '*').replace(/^\[(.+)\]$/, '{$1}')).filter(Boolean)
  return { method, path: '/api/' + parts.join('/') }
}

const tracked = execSync('git ls-files', { cwd: root }).toString().trim().split('\n').filter(p => !p.startsWith('tutorial/'))
const REF_GROUPS = [
  { slug: 'ref-config', title: 'Config and setup files', test: p => !p.includes('/') && !/^(README|pnpm-lock)/.test(p) || p.startsWith('scripts/') || p.startsWith('public/robots') },
  { slug: 'ref-database', title: 'Database files', test: p => p.startsWith('server/db/schema/') },
  { slug: 'ref-helpers', title: 'Server helpers', test: p => /^server\/(utils|middleware)\//.test(p) || p === 'server/error-handler.ts' },
  { slug: 'ref-routes', title: 'API routes', test: p => p.startsWith('server/api/') },
  { slug: 'ref-app', title: 'API Explorer (front end)', test: p => p.startsWith('app/') },
  { slug: 'ref-tests', title: 'Tests', test: p => p.startsWith('tests/') },
]
const SKIP = p => /pnpm-lock|\.(png|ico)$|^docs\/|^openapi\/|^server\/db\/migrations\//.test(p)

// ---------- page shell ----------
function shell({ chapters, page, title, summary, bodyHtml, toc, prev, next, isHome }) {
  const nav = []
  let part = null
  for (const c of chapters) {
    if (c.part !== part) { if (part !== null) nav.push('</ul></section>'); nav.push(`<section class="nav-part"><h2>${esc(c.part)}</h2><ul>`); part = c.part }
    nav.push(`<li><a href="${c.slug}.html" data-slug="${c.slug}"${page === c.slug ? ' aria-current="page"' : ''}>${esc(c.title)}</a></li>`)
  }
  nav.push('</ul></section>')
  nav.push(`<section class="nav-part"><h2>Reference</h2><ul>${REF_PAGES.map(r => `<li><a href="${r.slug}.html"${page === r.slug ? ' aria-current="page"' : ''}>${esc(r.title)}</a></li>`).join('')}</ul></section>`)
  const tocHtml = toc.length ? `<aside class="toc"><p>On this page</p><ul>${toc.map(t => `<li><a href="#${t.id}">${t.text}</a></li>`).join('')}</ul></aside>` : ''
  const pn = (prev || next) ? `<nav class="pn">${prev ? `<a class="prev" href="${prev.slug}.html"><small>Previous</small>${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="next" href="${next.slug}.html"><small>Next</small>${esc(next.title)}</a>` : '<span></span>'}</nav>` : ''
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}${isHome ? '' : ' · Build Clautverse'}</title>
<meta name="description" content="${esc(summary ?? '')}">
<script>try{var t=localStorage.getItem('bt-theme');if(t)document.documentElement.dataset.theme=t;var v=localStorage.getItem('bt-view');if(v)document.documentElement.dataset.view=v}catch(e){}</script>
<link rel="stylesheet" href="assets/style.css">
</head>
<body data-page="${page}">
<header class="top">
  <button class="icon" id="menu" aria-label="Open chapter list">&#9776;</button>
  <a class="brand" href="index.html">Build Clautverse</a>
  <div class="search"><input id="q" type="search" placeholder="Search the guide…" autocomplete="off" aria-label="Search the guide"><ul id="results" hidden></ul></div>
  <div class="view" role="group" aria-label="Which notes to show">
    <button data-view="both" title="Show plain-words and programming notes">Both</button>
    <button data-view="plain" title="Hide programming notes">Plain</button>
    <button data-view="tech" title="Hide plain-words notes">Technical</button>
  </div>
  <button class="icon" id="theme" aria-label="Toggle dark mode">&#9680;</button>
</header>
<div class="layout">
  <nav class="side" id="side" aria-label="Chapters">${nav.join('')}</nav>
  <main id="main">
    <article class="prose">
      ${bodyHtml}
      ${isHome || !chapters.some(c => c.slug === page) ? '' : `<label class="done"><input type="checkbox" id="done"> I finished this chapter</label>`}
      ${pn}
    </article>
    <footer class="foot">Code on these pages is copied from the repository at build time (commit <code>${commit}</code>). Rebuild with <code>node tutorial/build.mjs</code>.</footer>
  </main>
  ${tocHtml}
</div>
<script src="assets/search-index.js"></script>
<script src="assets/app.js"></script>
</body>
</html>`
}

function addIds(html) {
  const toc = []
  const seen = new Set()
  const out = html.replace(/<h2(?: [^>]*)?>([\s\S]*?)<\/h2>/g, (_, inner) => {
    let id = slugify(inner)
    while (seen.has(id)) id += '-2'
    seen.add(id)
    toc.push({ id, text: inner })
    return `<h2 id="${id}">${inner}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h2>`
  })
  return { html: out, toc }
}
const plainText = html => html.replace(/<figure[\s\S]*?<\/figure>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()

// ---------- run ----------
rmSync(OUT, { recursive: true, force: true })
mkdirSync(join(OUT, 'assets'), { recursive: true })
for (const f of readdirSync(join(here, 'assets'))) cpSync(join(here, 'assets', f), join(OUT, 'assets', f))

const chapters = loadChapters()
const REF_PAGES = REF_GROUPS
const search = []

// 1. expand chapters first so we know which file belongs to which chapter
for (const c of chapters) c.html = expand(c.raw, c.slug)

// 2. generated reference pages
const refBodies = {}
const routeRows = []
for (const g of REF_GROUPS) {
  const files = tracked.filter(p => !SKIP(p) && g.test(p) && !REF_GROUPS.slice(0, REF_GROUPS.indexOf(g)).some(o => o.test(p)))
  const parts = [`<h1>Reference: ${esc(g.title)}</h1><p class="lead">Every file in this group, exactly as it is in the repository (commit <code>${commit}</code>). Each file says which chapter explains it.</p>`]
  for (const p of files) {
    let text
    try { text = repoFile(p) } catch { continue }
    const ch = chapters.find(c => c.slug === used.get(p))
    const note = ch ? `explained in <a href="${ch.slug}.html">${esc(ch.title)}</a>` : 'listed here only'
    if (p.startsWith('server/api/')) {
      const r = routeOf(p)
      const id = text.match(/^\/\/ ((?:[A-Z]+-\d+[a-z]?)[^\s:.]*)/m)?.[1] ?? ''
      routeRows.push({ ...r, id, file: p, ch, group: g.slug })
    }
    parts.push(`<details class="ref" id="${fileId(p)}"><summary><code>${esc(p)}</code> <small>${note}</small></summary>${figure({ lang: langOf(p), title: p, code: text })}</details>`)
  }
  refBodies[g.slug] = parts.join('\n')
}
// endpoint index page
{
  routeRows.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
  const rows = routeRows.map(r => `<tr><td><span class="m m-${r.method.toLowerCase()}">${r.method}</span></td><td><code>${esc(r.path)}</code></td><td>${esc(r.id)}</td><td>${r.ch ? `<a href="${r.ch.slug}.html">${esc(r.ch.title)}</a>` : '<a href="ref-routes.html#' + fileId(r.file) + '">reference</a>'}</td></tr>`).join('')
  refBodies['ref-endpoints'] = `<h1>Reference: every API route</h1><p class="lead">${routeRows.length} route files. This table is generated from the files in <code>server/api</code>, so it always matches the code.</p><div class="tablewrap"><table><thead><tr><th>Method</th><th>Path</th><th>Route ID</th><th>Chapter</th></tr></thead><tbody>${rows}</tbody></table></div>`
  REF_PAGES.push({ slug: 'ref-endpoints', title: 'Every API route' })
}

// 3. write pages
const all = [...chapters.map(c => ({ ...c, kind: 'chapter' })), ...REF_PAGES.map(r => ({ slug: r.slug, title: r.title, kind: 'ref', html: refBodies[r.slug], part: 'Reference' }))]
const homeRaw = readFileSync(join(SRC, 'home.html'), 'utf8')
const parts = [...new Set(chapters.map(c => c.part))]
const chapterList = parts.map(p => `<section class="part"><h3>${esc(p)}</h3><ol>${chapters.filter(c => c.part === p).map(c => `<li><a href="${c.slug}.html"><strong>${esc(c.title)}</strong><span>${esc(c.summary ?? '')}</span></a></li>`).join('')}</ol></section>`).join('')
const home = expand(homeRaw, 'home').replace('<!--@chapters-->', chapterList).replace(/<!--@commit-->/g, commit).replace('<!--@counts-->', `${chapters.length} chapters · ${routeRows.length} API routes`)
writeFileSync(join(OUT, 'index.html'), shell({ chapters, page: 'home', title: 'Build Clautverse from scratch', summary: 'A step-by-step guide to building the Clautverse backend and API Explorer on Nuxt 4.', bodyHtml: home, toc: [], isHome: true }))
search.push({ t: 'Home', u: 'index.html', x: plainText(home).slice(0, 600) })

all.forEach((pg, i) => {
  const idx = chapters.findIndex(c => c.slug === pg.slug)
  const { html, toc } = addIds(pg.html)
  const words = plainText(html).split(' ').length
  let body = html
  if (pg.kind === 'chapter') body = `<p class="kicker">${esc(pg.part)}</p><h1>${esc(pg.title)}</h1><p class="meta">About ${Math.max(3, Math.round(words / 180))} min read</p>${html}`
  const prev = idx > 0 ? chapters[idx - 1] : (idx === 0 ? { slug: 'index', title: 'Start page' } : null)
  const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null
  writeFileSync(join(OUT, `${pg.slug}.html`), shell({ chapters, page: pg.slug, title: pg.title, summary: pg.summary, bodyHtml: body, toc, prev: pg.kind === 'chapter' ? prev : null, next: pg.kind === 'chapter' ? next : null }))
  if (pg.kind === 'chapter') search.push({ t: pg.title, u: `${pg.slug}.html`, x: plainText(html).slice(0, 4000) })
  else search.push({ t: pg.title, u: `${pg.slug}.html`, x: pg.slug === 'ref-endpoints' ? 'every api route endpoint list method path' : pg.title + ' source code reference' })
})
writeFileSync(join(OUT, 'assets', 'search-index.js'), `window.SEARCH=${JSON.stringify(search)}`)

// 4. checks
const wanted = tracked.filter(p => !SKIP(p) && /^(server|app|tests|scripts)\//.test(p))
const unexplained = wanted.filter(p => !used.has(p))
console.log(`built ${chapters.length} chapters + ${REF_PAGES.length} reference pages, ${routeRows.length} routes, commit ${commit}`)
console.log(`files shown in a chapter: ${wanted.length - unexplained.length}/${wanted.length}`)
if (process.argv.includes('--list-unexplained')) console.log(unexplained.join('\n'))
if (problems.length) { console.error('PROBLEMS:\n' + problems.join('\n')); process.exit(1) }
