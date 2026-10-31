export const MINIMUM_AGE = 18

/** Age in whole years on `today` for an ISO date (YYYY-MM-DD). */
export function ageOn(dateOfBirth: string, today: Date = new Date()): number {
  const [y, m, d] = dateOfBirth.split('-').map(Number) as [number, number, number]
  let age = today.getUTCFullYear() - y
  const month = today.getUTCMonth() + 1
  if (month < m || (month === m && today.getUTCDate() < d)) age--
  return age
}

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}
