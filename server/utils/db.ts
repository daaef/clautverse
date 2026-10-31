import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function useDb() {
  if (!_db) {
    const url = useRuntimeConfig().databaseUrl
    if (!url) throw new Error('NUXT_DATABASE_URL is not set')
    // prepare:false keeps us compatible with Neon's pooled (PgBouncer) endpoint.
    _db = drizzle(postgres(url, { prepare: false, max: 5 }), { schema })
  }
  return _db
}

export { schema }
