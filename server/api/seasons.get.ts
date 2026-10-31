import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

// CAT-04
const query = z.object({ showId: z.uuid() })

export default defineEventHandler(async (event) => {
  const { showId } = readQuery(event, query)
  const db = useDb()
  const [s] = await db.select().from(schema.show).where(and(eq(schema.show.id, showId), eq(schema.show.active, true)))
  if (!s) throw apiError('NOT_FOUND', 'Show not found.')
  const rows = await db.select().from(schema.season).where(eq(schema.season.showId, showId)).orderBy(desc(schema.season.number))
  return list(rows.map(r => ({ id: r.id, showId: r.showId, number: r.number, name: r.name, year: r.year })))
})
