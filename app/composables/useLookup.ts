// Picks real ids from the live API so you choose an existing record instead of
// pasting a made-up uuid. Fields are matched by name (communityId, talentId…)
// or, for a path `{id}`, by the route it belongs to.

const BY_FIELD: Record<string, string> = {
  communityId: '/api/communities',
  categoryId: '/api/categories',
  talentId: '/api/talents',
  talentIds: '/api/talents',
  countryId: '/api/countries',

  
}

const BY_PATH: [prefix: string, list: string][] = [
  ['/api/communities/{id}', '/api/communities'],
  ['/api/admin/communities/{id}', '/api/admin/communities'],
  ['/api/talents/{id}', '/api/talents'],
  ['/api/missions/{id}', '/api/missions'],
  ['/api/watch-parties/{id}', '/api/watch-parties'],
  ['/api/notifications/{id}', '/api/notifications'],
  ['/api/badges/{id}', '/api/badges'],
  ['/api/admin/badges/{id}', '/api/admin/badges'],
  ['/api/admin/applications/{id}', '/api/admin/applications'],
  ['/api/admin/reports/{id}', '/api/admin/reports'],
  ['/api/admin/users/{id}', '/api/admin/users'],
]

export function lookupUrl(field: string, path?: string): string | undefined {
  if (field === 'id' && path) return BY_PATH.find(([p]) => path.startsWith(p))?.[1]
  return BY_FIELD[field]
}

export interface LookupOption { value: string, label: string }

// One request per list, shared by every card. Errors (e.g. not signed in) give [].
const cache = new Map<string, Ref<LookupOption[]>>()
function load(url: string, opts: Ref<LookupOption[]>) {
  if (!import.meta.client) return
  $fetch<{ items?: Record<string, unknown>[] }>(url, { query: { limit: 100 }, credentials: 'same-origin' })
    .then((r) => {
      opts.value = (r.items ?? []).filter(i => i.id).map((i) => {
        const name = String(i.name ?? i.title ?? i.displayName ?? i.username ?? i.body ?? i.status ?? '')
        return { value: String(i.id), label: name ? `${name.slice(0, 40)} · ${String(i.id).slice(0, 8)}` : String(i.id) }
      })
    })
    .catch(() => { opts.value = [] })
}
export function useLookup(url: string | undefined) {
  if (!url) return ref<LookupOption[]>([])
  if (!cache.has(url)) {
    const opts = ref<LookupOption[]>([])
    cache.set(url, opts)
    load(url, opts)
  }
  return cache.get(url)!
}

/** Reloads every list, e.g. after signing in or out (private lists change). */
export function reloadLookups() { for (const [url, opts] of cache) load(url, opts) }
