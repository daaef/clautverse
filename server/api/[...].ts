// Unknown /api paths return the JSON error envelope instead of the Nuxt HTML 404 page.
export default defineEventHandler(() => {
  throw apiError('NOT_FOUND', 'Not found.')
})
