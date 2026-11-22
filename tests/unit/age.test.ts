import { describe, expect, it } from 'vitest'
import { ageOn, isValidIsoDate } from '../../server/utils/age'

describe('ageOn', () => {
  const today = new Date('2026-10-31T12:00:00Z')
  it('counts a birthday today as a full year', () => expect(ageOn('2008-10-31', today)).toBe(18))
  it('is one less the day before the birthday', () => expect(ageOn('2008-11-01', today)).toBe(17))
})

describe('isValidIsoDate', () => {
  it('accepts real dates', () => expect(isValidIsoDate('2000-02-29')).toBe(true))
  it('rejects impossible dates', () => expect(isValidIsoDate('2001-02-29')).toBe(false))
  it('rejects other formats', () => expect(isValidIsoDate('31/10/2000')).toBe(false))
})
