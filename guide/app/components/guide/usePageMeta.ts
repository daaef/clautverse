import type { PageMeta } from '~/composables/useSectionContext'

/** Frontmatter of the current guide page, fetched only when an action is clicked. */
export async function loadPageMeta(path: string): Promise<PageMeta> {
  // Docus registers the 'docs' collection at runtime; its generated types resolve to never during typecheck.
  const page = await (queryCollection as (c: string) => any)('docs').path(path).first() as Record<string, any> | null
  const pick = (k: string) => page?.[k] ?? page?.meta?.[k]
  return {
    title: pick('title'),
    stack: pick('stack'),
    frameworkVersion: pick('frameworkVersion'),
    prerequisites: pick('prerequisites'),
    lastVerified: pick('lastVerified') ? String(pick('lastVerified')) : undefined,
  }
}
