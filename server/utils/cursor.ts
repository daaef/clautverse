import { createHmac, timingSafeEqual } from 'node:crypto'

// Opaque, signed keyset cursor: base64url(json).base64url(hmac)
export function encodeCursor(payload: Record<string, unknown>, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function decodeCursor<T = Record<string, unknown>>(cursor: string, secret: string): T | null {
  const [body, sig] = cursor.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret).update(body).digest()
  const given = Buffer.from(sig, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T
  }
  catch {
    return null
  }
}
