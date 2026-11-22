import { randomUUID } from 'node:crypto'

export default defineEventHandler((event) => {
  const id = `req_${randomUUID().replaceAll('-', '')}`
  event.context.requestId = id
  setResponseHeader(event, 'X-Request-Id', id)
})
