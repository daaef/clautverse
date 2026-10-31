import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const dir = new URL('../../content/99.api-reference/', import.meta.url)
const spec = parse(readFileSync(new URL('../../../openapi/clautverse.yaml', import.meta.url), 'utf8'))
const METHODS = ['get', 'post', 'put', 'patch', 'delete']

type Op = { id: string, status: string }
const specOps = new Map<string, Op>()
for (const [path, item] of Object.entries<any>(spec.paths))
  for (const m of METHODS) if (item[m]) specOps.set(`${m.toUpperCase()} ${path}`, { id: item[m]['x-route-id'], status: item[m]['x-status'] })

const index = readFileSync(new URL('0.index.md', dir), 'utf8')
const rows = [...index.matchAll(/^\| ([A-Z]+-\d+[a-z]?) \| (.+?) \| (implemented|planned|deferred) \| \[[^\]]+\]\(([^)]+)\) \|$/gm)]
const docOps = new Map<string, Op>()
for (const [, id, endpoints, status] of rows)
  for (const [, m, p] of endpoints!.matchAll(/`(GET|POST|PUT|PATCH|DELETE) ([^`]+)`/g))
    docOps.set(`${m} ${p!.replace(/:(\w+)/g, '{$1}')}`, { id: id!, status: status! })

describe('API Reference ↔ openapi/clautverse.yaml', () => {
  it('has the same operations with the same route IDs and statuses', () => {
    expect(rows.length).toBeGreaterThan(50)
    expect(Object.fromEntries([...docOps].sort())).toEqual(Object.fromEntries([...specOps].sort()))
  })

  it('every index row has a heading and matching badge on its domain page', () => {
    const pages = Object.fromEntries(readdirSync(dir).filter(f => f.endsWith('.md') && f !== '0.index.md')
      .map(f => [`/api-reference/${f.replace(/^\d+\./, '').replace(/\.md$/, '')}`, readFileSync(new URL(f, dir), 'utf8')]))
    for (const [, id, , status, page] of rows) {
      const md = pages[page!]
      expect(md, `${id} → ${page}`).toBeDefined()
      const heading = md!.split('\n').findIndex(l => l.startsWith('#### ') && new RegExp(`(^#### |· |/ |, )${id} `).test(l))
      expect(heading, `${id} heading on ${page}`).toBeGreaterThanOrEqual(0)
      expect(md!.split('\n')[heading + 2]).toContain(`:badge[${status}]`)
    }
  })

  it('every documented route ID is in the index', () => {
    const indexed = new Set(rows.map(r => r[1]))
    for (const f of readdirSync(dir).filter(f => f.endsWith('.md') && f !== '0.index.md'))
      for (const line of readFileSync(new URL(f, dir), 'utf8').split('\n').filter(l => l.startsWith('#### ') && !l.startsWith('#### ~~')))
        for (const [, id] of line.split(' — ')[0]!.matchAll(/(?:^#### |· |\/ |, )([A-Z]+-\d+[a-z]?) /g))
          expect(indexed.has(id!), `${id} in ${f}`).toBe(true)
  })
})

describe('API Reference index completeness', () => {
  it('every non-deferred route lists its endpoint', () => {
    const index = readFileSync(new URL('../../content/99.api-reference/0.index.md', import.meta.url), 'utf8')
    const missing = [...index.matchAll(/^\| ([A-Z]+-\d+[a-z]?) \| — \| (\w+) \|/gm)].filter(m => m[2] !== 'deferred').map(m => m[1])
    expect(missing).toEqual([])
  })
})
