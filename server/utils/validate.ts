import type { H3Event } from 'h3'
import { z } from 'zod'

function toFields(error: z.ZodError) {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.reduce<string>((acc, p) => typeof p === 'number' ? `${acc}[${p}]` : acc ? `${acc}.${String(p)}` : String(p), '') || '_'
    fields[key] ??= issue.message
  }
  return fields
}

export function parseOrThrow<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input)
  if (!result.success) throw apiError('VALIDATION_FAILED', 'Some fields are invalid.', { fields: toFields(result.error) })
  return result.data
}

export async function readJsonBody<T extends z.ZodType>(event: H3Event, schema: T) {
  let body: unknown
  try {
    body = await readRawBody(event).then(raw => (raw ? JSON.parse(raw) : {}))
  }
  catch {
    throw apiError('VALIDATION_FAILED', 'Body must be valid JSON.')
  }
  return parseOrThrow(schema, body)
}

export function readQuery<T extends z.ZodType>(event: H3Event, schema: T) {
  return parseOrThrow(schema, getQuery(event))
}

export const idParam = z.object({ id: z.uuid() })

export function readIdParam(event: H3Event) {
  const result = idParam.safeParse(getRouterParams(event))
  if (!result.success) throw apiError('NOT_FOUND', 'Not found.')
  return result.data.id
}

/** Better Auth user ids are opaque strings, not UUIDs. */
export function readUserIdParam(event: H3Event) {
  const id = getRouterParam(event, 'id')
  if (!id || id.length > 100 || !/^[\w-]+$/.test(id)) throw apiError('NOT_FOUND', 'Not found.')
  return id
}
