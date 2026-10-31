import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const root = fileURLToPath(new URL('../../content', import.meta.url))
const walk = (d: string): string[] => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)])
const guides = walk(root).filter(f => f.endsWith('.md') && !f.includes('99.api-reference') && !f.endsWith(`${root}/index.md`))
const REQUIRED = ['title', 'slug', 'summary', 'feature', 'tags', 'status', 'stack', 'frameworkVersion', 'prerequisites', 'lastVerified', 'provenance']

describe('guide frontmatter', () => {
  it.each(guides.map(f => [relative(root, f), f]))('%s', (_, file) => {
    const fm = parse(readFileSync(file, 'utf8').split(/^---$/m)[1]!)
    for (const k of REQUIRED) expect(fm, k).toHaveProperty(k)
    expect(['confirmed', 'proposed', 'open']).toContain(fm.status)
    expect(fm.slug).toBe(relative(root, file).replace(/\.md$/, '').split('/').map(s => s.replace(/^\d+\./, '')).join('/'))
    expect(Array.isArray(fm.tags) && Array.isArray(fm.prerequisites)).toBe(true)
  })
})
