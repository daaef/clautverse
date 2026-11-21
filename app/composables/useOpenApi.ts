// Fetches the OpenAPI spec once and derives a flat, ordered operation list
// plus tag-grouped views for the API Explorer.

export interface ApiSchema {
  type?: string, format?: string, enum?: string[], example?: unknown, description?: string
  minLength?: number, maxLength?: number, minimum?: number, maximum?: number
  items?: ApiSchema, properties?: Record<string, ApiSchema>, required?: string[]
}
export interface ApiParameter { name: string, in: 'path' | 'query' | 'header' | 'cookie', required?: boolean, schema?: ApiSchema, description?: string }
export interface ApiBody { required?: boolean, schema?: ApiSchema, example?: unknown }
export interface ApiOperation {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
  path: string
  operationId?: string
  routeId?: string
  status?: string
  tag: string
  summary?: string
  description?: string
  parameters: ApiParameter[]
  body?: ApiBody
  services: string[]
}
interface OpenApiSpec {
  info?: { title?: string, version?: string, description?: string }
  paths?: Record<string, Record<string, Record<string, unknown>>>
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const

export function specOperations(spec: OpenApiSpec | null | undefined): ApiOperation[] {
  const ops: ApiOperation[] = []
  for (const [path, item] of Object.entries(spec?.paths ?? {})) {
    for (const method of METHODS) {
      const op = item?.[method]
      if (!op) continue
      const o = op as Record<string, unknown>
      ops.push({
        method,
        path,
        operationId: o.operationId as string | undefined,
        routeId: (o['x-route-id'] ?? o.operationId) as string | undefined,
        status: o['x-status'] as string | undefined,
        tag: ((o.tags as string[] | undefined)?.[0]) ?? 'MISC',
        summary: o.summary as string | undefined,
        description: o.description as string | undefined,
        parameters: (o.parameters as ApiParameter[] | undefined) ?? [],
        body: bodyOf(o.requestBody),
        services: (o['x-services'] as string[] | undefined) ?? [],
      })
    }
  }
  return ops
}

function bodyOf(rb: unknown): ApiBody | undefined {
  const r = rb as { required?: boolean, content?: Record<string, { schema?: ApiSchema, example?: unknown }> } | undefined
  const json = r?.content?.['application/json']
  return json ? { required: r?.required, schema: json.schema, example: json.example } : undefined
}

/** Short human rule text for a schema, e.g. "string · uuid" or "one of: a, b". */
export function describeSchema(s?: ApiSchema): string {
  if (!s) return ''
  if (s.enum) return `one of: ${s.enum.join(', ')}`
  const parts = [s.type === 'array' ? `array of ${s.items?.type ?? 'value'}` : s.type, s.format]
  if (s.minLength != null || s.maxLength != null) parts.push(`${s.minLength ?? 0}–${s.maxLength ?? '∞'} chars`)
  if (s.minimum != null || s.maximum != null) parts.push(`${s.minimum ?? '−∞'} to ${s.maximum ?? '∞'}`)
  return parts.filter(Boolean).join(' · ')
}

/** Flattens body fields (one level of nesting) into rows for a table. */
export function bodyFields(s?: ApiSchema): { name: string, required: boolean, rule: string, example: string, note?: string }[] {
  const rows: { name: string, required: boolean, rule: string, example: string, note?: string }[] = []
  const walk = (sch: ApiSchema | undefined, prefix: string) => {
    for (const [k, v] of Object.entries(sch?.properties ?? {})) {
      const name = prefix + k
      if (v.type === 'object' && v.properties) { walk(v, `${name}.`); continue }
      rows.push({ name, required: !!sch?.required?.includes(k), rule: describeSchema(v), example: JSON.stringify(v.example), note: v.description })
    }
  }
  walk(s, '')
  return rows
}

export function groupByTag(ops: ApiOperation[]) {
  const groups = new Map<string, ApiOperation[]>()
  for (const op of ops) {
    if (!groups.has(op.tag)) groups.set(op.tag, [])
    groups.get(op.tag)!.push(op)
  }
  return [...groups.entries()].map(([tag, items]) => ({ tag, items }))
}

export function useOpenApi() {
  return useAsyncData('openapi-spec', () => $fetch<OpenApiSpec>('/api/_docs/openapi'))
}
