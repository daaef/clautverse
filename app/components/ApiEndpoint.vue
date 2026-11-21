<script setup lang="ts">
// Interactive endpoint card — usable in markdown (::api-endpoint{method="GET"
// path="/api/communities"}) and directly on the API Explorer page. Looks the
// operation up in the OpenAPI spec, renders inputs, and sends a real
// same-origin request (session cookie included).
const props = defineProps<{ method: string, path: string }>()

const { data: spec } = useOpenApi()
const op = computed(() =>
  specOperations(spec.value).find(
    o => o.method === props.method.toLowerCase() && o.path === props.path,
  ),
)

const pathParams = computed(() => op.value?.parameters.filter(p => p.in === 'path') ?? [])
const queryParams = computed(() => op.value?.parameters.filter(p => p.in === 'query') ?? [])
const hasBody = computed(() => ['post', 'put', 'patch'].includes(props.method.toLowerCase()))

const pathValues = reactive<Record<string, string>>({})
const queryValues = reactive<Record<string, string>>({})
const bodyText = ref('')
const idemKey = ref('')
const open = ref(false)

interface Result { status: number, ms: number, body: string, error?: string }
const result = ref<Result | null>(null)
const sending = ref(false)

function generateIdemKey() {
  idemKey.value = globalThis.crypto.randomUUID()
}

function resolvedPath() {
  let p = props.path
  for (const [k, v] of Object.entries(pathValues)) p = p.replaceAll(`{${k}}`, encodeURIComponent(v || `{${k}}`))
  const qs = Object.entries(queryValues).filter(([, v]) => v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  return qs.length ? `${p}?${qs.join('&')}` : p
}

async function send() {
  sending.value = true
  result.value = null
  const headers: Record<string, string> = {}
  if (idemKey.value) headers['Idempotency-Key'] = idemKey.value
  let body: string | undefined
  if (hasBody.value && bodyText.value.trim()) {
    headers['Content-Type'] = 'application/json'
    body = bodyText.value
  }
  const started = performance.now()
  try {
    const res = await fetch(resolvedPath(), {
      method: props.method.toUpperCase(),
      headers,
      body,
      credentials: 'same-origin',
    })
    const text = await res.text()
    let pretty = text
    try { pretty = JSON.stringify(JSON.parse(text), null, 2) } catch {}
    result.value = { status: res.status, ms: Math.round(performance.now() - started), body: pretty }
  }
  catch (e) {
    result.value = { status: 0, ms: Math.round(performance.now() - started), body: '', error: e instanceof Error ? e.message : 'Request failed' }
  }
  finally { sending.value = false }
}

const statusClass = computed(() => {
  const s = result.value?.status ?? 0
  if (s >= 200 && s < 300) return 'ok'
  if (s >= 400 && s < 500) return 'client-err'
  if (s >= 500 || s === 0) return 'server-err'
  return ''
})
</script>

<template>
  <div class="docs-endpoint" :class="{ open }">
    <button type="button" class="docs-endpoint-head" @click="open = !open">
      <span class="docs-method" :class="method.toLowerCase()">{{ method.toUpperCase() }}</span>
      <code class="docs-endpoint-path">{{ path }}</code>
      <span v-if="op?.status" class="docs-badge" :class="{ warn: op.status !== 'implemented' }">{{ op.status }}</span>
      <span v-if="op?.routeId" class="docs-route-id">{{ op.routeId }}</span>
      <svg class="docs-chevron" :class="{ open }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <div v-if="open" class="docs-endpoint-body">
      <p v-if="op?.summary" class="docs-endpoint-summary">{{ op.summary }}</p>
      <p v-if="!op" class="docs-endpoint-summary">Not found in openapi/clautverse.yaml.</p>

      <div v-if="op?.services.length" class="docs-services">
        <span v-for="s in op.services" :key="s" class="docs-service-chip">{{ s }}</span>
      </div>

      <div v-if="pathParams.length || queryParams.length" class="docs-params">
        <p class="docs-params-title">Parameters</p>
        <label v-for="p in pathParams" :key="`p-${p.name}`" class="docs-param-row">
          <span class="docs-param-name">{{ p.name }} <em>path{{ p.required ? ' · required' : '' }}</em></span>
          <input v-model="pathValues[p.name]" class="docs-param-input" :placeholder="p.description || p.name">
        </label>
        <label v-for="p in queryParams" :key="`q-${p.name}`" class="docs-param-row">
          <span class="docs-param-name">{{ p.name }} <em>query{{ p.required ? ' · required' : '' }}</em></span>
          <input v-model="queryValues[p.name]" class="docs-param-input" :placeholder="p.description || p.name">
        </label>
      </div>

      <div v-if="hasBody">
        <p class="docs-params-title">Body <span class="docs-hint">(JSON — not described by the contract; write it yourself)</span></p>
        <textarea v-model="bodyText" class="docs-body-editor" rows="5" spellcheck="false" placeholder="{}" />
      </div>

      <div class="docs-idem-row">
        <span class="docs-param-name">Idempotency-Key <em>header · optional</em></span>
        <div style="display: flex; gap: 0.5rem; flex: 1">
          <input v-model="idemKey" class="docs-param-input" style="flex: 1" placeholder="—">
          <button type="button" class="docs-mini-btn" @click="generateIdemKey">Generate</button>
        </div>
      </div>

      <div class="docs-send-row">
        <code class="docs-resolved">{{ method.toUpperCase() }} {{ resolvedPath() }}</code>
        <button type="button" class="docs-send-btn" :disabled="sending" @click="send">
          {{ sending ? 'Sending…' : 'Send request' }}
        </button>
      </div>

      <div v-if="result" class="docs-response">
        <p class="docs-response-meta">
          <span class="docs-status" :class="statusClass">{{ result.status || 'ERR' }}</span>
          <span class="docs-response-ms">{{ result.ms }} ms</span>
        </p>
        <pre v-if="result.body" class="docs-response-body"><code>{{ result.body }}</code></pre>
        <p v-if="result.error" class="docs-response-err">{{ result.error }}</p>
      </div>
    </div>
  </div>
</template>
