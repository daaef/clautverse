// Checks every internal href/src in the generated site resolves to a file.
// Resolves clean URLs the way static hosts do: /a/b → a/b.html or a/b/index.html.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.argv[2] ?? '.output/public'
const walk = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)])
const pages = walk(root).filter(f => f.endsWith('.html'))
const resolves = (p) => {
  const clean = decodeURIComponent(p.split(/[?#]/)[0]).replace(/\/$/, '')
  if (!clean) return true
  const f = join(root, clean)
  return (existsSync(f) && statSync(f).isFile()) || existsSync(`${f}.html`) || existsSync(join(f, 'index.html'))
}
const broken = []
let checked = 0
for (const page of pages) {
  for (const [, url] of readFileSync(page, 'utf8').matchAll(/(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
    checked++
    if (!resolves(url)) broken.push(`${page.slice(root.length)} → ${url}`)
  }
}
console.log(`Checked ${checked} internal links across ${pages.length} pages.`)
if (broken.length) { console.error([...new Set(broken)].join('\n')); process.exit(1) }
