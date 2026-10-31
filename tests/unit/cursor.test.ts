import { describe, expect, it } from 'vitest'
import { decodeCursor, encodeCursor } from '../../server/utils/cursor'

describe('signed cursor', () => {
  const secret = 'test-secret'
  it('round-trips', () => {
    const c = encodeCursor({ createdAt: '2026-10-31T00:00:00Z', id: 'abc' }, secret)
    expect(decodeCursor(c, secret)).toEqual({ createdAt: '2026-10-31T00:00:00Z', id: 'abc' })
  })
  it('rejects tampering', () => {
    const c = encodeCursor({ id: 'abc' }, secret)
    const forged = `${Buffer.from(JSON.stringify({ id: 'zzz' })).toString('base64url')}.${c.split('.')[1]}`
    expect(decodeCursor(forged, secret)).toBeNull()
  })
  it('rejects a different secret and garbage', () => {
    expect(decodeCursor(encodeCursor({ id: 1 }, secret), 'other')).toBeNull()
    expect(decodeCursor('not-a-cursor', secret)).toBeNull()
  })
})
