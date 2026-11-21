import { fileURLToPath } from 'node:url'
import { defineCollection, defineContentConfig } from '@nuxt/content'

// The /docs pages in app/ read the same markdown the standalone Docus guide
// (guide/content) publishes. Single source of truth — edit files there only.
export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: { include: '**/*.md', cwd: fileURLToPath(new URL('./guide/content', import.meta.url)) },
    }),
  },
})
