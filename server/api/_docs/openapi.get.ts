import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'

// Serves openapi/clautverse.yaml as JSON for the /docs API Explorer, enriched
// with `xServices` per operation — derived by scanning the real route files
// and server/utils exports, so it stays accurate as the code changes.
let cached: { spec: Record<string, unknown>, mtime: number } | null = null

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options'])

// Human labels for server/utils/* files (keyed by util filename).
const UTIL_LABELS: Record<string, string> = {
  'db.ts': 'PostgreSQL · Drizzle',
  'auth.ts': 'Session guard',
  'admin.ts': 'Admin guard',
  'rate-limit.ts': 'Rate limiting',
  'validate.ts': 'Zod validation',
  'cursor.ts': 'Cursor pagination',
  'paginate.ts': 'Cursor pagination',
  'email.ts': 'Resend email',
  'notifications.ts': 'Notifications',
  'api-error.ts': 'Error envelope',
  'cron.ts': 'Cron auth',
  'age.ts': 'Age rules',
  'catalog.ts': 'Catalog domain',
  'community.ts': 'Community domain',
  'drops.ts': 'Drops domain',
  'missions.ts': 'Missions domain',
  'onboarding.ts': 'Onboarding domain',
  'reports.ts': 'Reports domain',
  'talent-applications.ts': 'Applications domain',
  'talentProfile.ts': 'Talent profile domain',
  'watchParties.ts': 'Watch parties domain',
}

async function listFiles(dir: string): Promise<string[]> {
  try {
    const out: string[] = []
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) out.push(...await listFiles(p))
      else out.push(p)
    }
    return out
  }
  catch { return [] }
}

// util filename → exported function names → label, so auto-imported helpers
// (requireUser, rateLimit, useDb…) can be detected inside route source.
async function utilExports(utilsDir: string) {
  const fnToLabel = new Map<string, string>()
  for (const file of await listFiles(utilsDir)) {
    if (!file.endsWith('.ts')) continue
    const name = file.split('/').pop()!
    const label = UTIL_LABELS[name] ?? `${name.replace(/\.ts$/, '')} domain`
    const src = await readFile(file, 'utf8')
    for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|let)\s+(\w+)/g)) {
      fnToLabel.set(m[1]!, label)
    }
  }
  return fnToLabel
}

// route filename → OpenAPI path + method. [id] → {id}, index.x → dir, catch-all → prefix.
function routeKey(file: string, apiDir: string) {
  const rel = file.slice(apiDir.length).replace(/\.ts$/, '')
  const segs = rel.split('/').filter(Boolean)
  let method: string | null = null
  const last = segs[segs.length - 1]!
  const dot = last.lastIndexOf('.')
  if (dot > 0 && METHODS.has(last.slice(dot + 1))) {
    method = last.slice(dot + 1)
    segs[segs.length - 1] = last.slice(0, dot)
  }
  const parts = segs
    .map(s => s === 'index' ? '' : s.replace(/^\[\.\.\.(.+)\]$/, '*').replace(/^\[(.+)\]$/, '{$1}'))
    .filter(Boolean)
  return { path: '/api/' + parts.join('/'), method, catchAll: rel.includes('[...') }
}

async function servicesPerRoute(apiDir: string, utilsDir: string) {
  const fnToLabel = await utilExports(utilsDir)
  const byOp = new Map<string, Set<string>>() // `${method} ${path}` → labels
  const catchAll: { prefix: string, labels: Set<string> }[] = []

  for (const file of await listFiles(apiDir)) {
    if (!file.endsWith('.ts')) continue
    const src = await readFile(file, 'utf8')
    const labels = new Set<string>()
    for (const [fn, label] of fnToLabel) {
      if (new RegExp(`\\b${fn}\\b`).test(src)) labels.add(label)
    }
    if (/from\s+['"]drizzle-orm['"]/.test(src)) labels.add('PostgreSQL · Drizzle')
    if (/from\s+['"]zod['"]/.test(src)) labels.add('Zod validation')
    if (/\bmailtrap\b|sendEmail/i.test(src)) labels.add('Mailtrap email')
    if (/\bauth\.api\b|\[\.{3}all\]/.test(src)) labels.add('Better Auth')
    if (/idempotency|Idempotency-Key/i.test(src)) labels.add('Idempotency')

    const { path, method, catchAll: isCatchAll } = routeKey(file, apiDir)
    if (isCatchAll) catchAll.push({ prefix: path.replace(/\/\*$/, '').replace(/\/$/, ''), labels })
    else if (method) {
      const key = `${method} ${path}`
      byOp.set(key, new Set([...(byOp.get(key) ?? []), ...labels]))
    }
  }
  return { byOp, catchAll }
}

async function buildSpec() {
  const file = join(process.cwd(), 'openapi', 'clautverse.yaml')
  const spec = parse(await readFile(file, 'utf8')) as Record<string, unknown>
  const apiDir = join(process.cwd(), 'server', 'api')
  const { byOp, catchAll } = await servicesPerRoute(apiDir, join(process.cwd(), 'server', 'utils'))

  const paths = (spec.paths ?? {}) as Record<string, Record<string, Record<string, unknown>>>
  for (const [path, item] of Object.entries(paths)) {
    for (const method of Object.keys(item)) {
      const labels = new Set(byOp.get(`${method} ${path}`) ?? [])
      for (const c of catchAll) {
        if (path.startsWith(c.prefix + '/')) c.labels.forEach(l => labels.add(l))
      }
      const op = item[method]
      if (op && labels.size) op['x-services'] = [...labels].sort()
    }
  }
  return spec
}

export default defineEventHandler(async () => {
  const file = join(process.cwd(), 'openapi', 'clautverse.yaml')
  try {
    const s = await stat(file)
    if (!cached || cached.mtime !== s.mtimeMs) cached = { spec: await buildSpec(), mtime: s.mtimeMs }
    return cached.spec
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'OpenAPI spec unavailable' })
  }
})
