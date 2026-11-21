// Shared helpers for the /docs section: path normalization + nav building.
// guide/content files use numeric prefixes for ordering (e.g. `99.api-reference/1.auth.md`);
// the public URL strips them: `/docs/api-reference/auth`.

export interface DocsNavItem { title: string, url: string, stem: string }
export interface DocsNavGroup { title: string, items: DocsNavItem[] }
interface DocsPageLite { stem: string, title?: string, description?: string }

const GROUP_TITLES: Record<string, string> = {
  'getting-started': 'Getting started',
  onboarding: 'Onboarding',
  'api-reference': 'API Reference',
}

const stripNum = (seg: string) => seg.replace(/^\d+\./, '')

/** File stem (`99.api-reference/1.auth` or `index`) → public URL under /docs. */
export function docUrl(stem: string) {
  const clean = stem.replace(/^guide\/content\//, '').replace(/\.md$/, '')
  const segs = clean.split('/').map(stripNum)
  if (segs[segs.length - 1] === 'index') segs.pop()
  return '/docs' + (segs.length ? '/' + segs.join('/') : '')
}

/** Route param slug ([] → docs home) → canonical /docs URL. */
export function docsRouteUrl(slug: string | string[] | undefined) {
  const segs = (Array.isArray(slug) ? slug : slug ? [slug] : []).map(stripNum).filter(Boolean)
  if (segs[segs.length - 1] === 'index') segs.pop()
  return '/docs' + (segs.length ? '/' + segs.join('/') : '')
}

/** A section/anchor id from search sections → /docs URL. */
export function docsIdToUrl(id: string) {
  const [path, anchor] = id.split('#')
  return docUrl(path!.replace(/^\//, '')) + (anchor ? `#${anchor}` : '')
}

/** Numeric-aware stem ordering: 1.x < 2.x < 10.x < 99.x, then alpha. */
function stemCompare(a: string, b: string) {
  if (a === 'index') return -1 // docs landing page always first
  if (b === 'index') return 1
  const as = a.split('/'), bs = b.split('/')
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const x = as[i], y = bs[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const nx = parseInt(x, 10), ny = parseInt(y, 10)
    if (!Number.isNaN(nx) && !Number.isNaN(ny) && nx !== ny) return nx - ny
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

const titleize = (slug: string) => GROUP_TITLES[slug]
  ?? slug.split('-').map(w => w ? w[0]!.toUpperCase() + w.slice(1) : w).join(' ')

/** Build sidebar groups + flattened prev/next list from collection pages. */
export function buildDocsNav(pages: DocsPageLite[]) {
  const sorted = [...pages].sort((a, b) => stemCompare(a.stem, b.stem))
  const groups = new Map<string, DocsNavItem[]>()
  const flat: DocsNavItem[] = []
  for (const p of sorted) {
    const item: DocsNavItem = { title: p.title ?? titleize(stripNum(p.stem.split('/').pop()!)), url: docUrl(p.stem), stem: p.stem }
    flat.push(item)
    const top = stripNum(p.stem.split('/')[0]!)
    if (top === 'index') continue // root landing page is not a nav item
    if (!groups.has(top)) groups.set(top, [])
    groups.get(top)!.push(item)
  }
  const nav: DocsNavGroup[] = [...groups.entries()].map(([slug, items]) => ({ title: titleize(slug), items }))
  return { nav, flat }
}

/** Load all doc pages once; the consumer builds nav and looks the current page up by URL. */
export function useDocsPages() {
  return useAsyncData('docs-pages', () => queryCollection('docs').all(), { deep: false })
}
