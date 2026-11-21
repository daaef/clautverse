// Fetches the OpenAPI spec once and derives a flat, ordered operation list
// plus tag-grouped views for the API Explorer.

export interface ApiParameter { name: string, in: 'path' | 'query' | 'header' | 'cookie', required?: boolean, schema?: Record<string, unknown>, description?: string }
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
        services: (o['x-services'] as string[] | undefined) ?? [],
      })
    }
  }
  return ops
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
