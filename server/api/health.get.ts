import { sql } from 'drizzle-orm'

// OPS-01
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const version = useRuntimeConfig().appVersion
  try {
    await useDb().execute(sql`select 1`)
    return { status: 'ok', db: 'ok', version }
  }
  catch {
    setResponseStatus(event, 503)
    return { status: 'error', db: 'error', version }
  }
})
