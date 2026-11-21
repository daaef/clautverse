<script setup lang="ts">
// One input that matches a field's rule: dropdown for fixed choices and real
// records, number box with limits, date picker, or plain text.
import type { ApiSchema } from '~/composables/useOpenApi'

const props = defineProps<{ name: string, schema?: ApiSchema, required?: boolean, path?: string }>()
const model = defineModel<unknown>()

const s = computed(() => props.schema ?? {})
const isArray = computed(() => s.value.type === 'array')
const options = useLookup(lookupUrl(props.name, props.path))
const choices = computed(() => s.value.enum ?? (s.value.type === 'boolean' ? ['true', 'false'] : null))

// Enum / boolean: keep the real type (boolean stays boolean).
const choiceValue = computed({
  get: () => (model.value === undefined || model.value === null ? '' : String(model.value)),
  set: (v: string) => { model.value = v === '' ? undefined : s.value.type === 'boolean' ? v === 'true' : v },
})
// Numbers: clamp to the allowed range so 500 can't slip past a max of 100.
const numValue = computed({
  get: () => (model.value ?? '') as number | '',
  set: (v: number | '') => {
    if (v === '' || Number.isNaN(Number(v))) { model.value = undefined; return }
    let n = Math.trunc(Number(v))
    if (s.value.minimum != null) n = Math.max(s.value.minimum, n)
    if (s.value.maximum != null) n = Math.min(s.value.maximum, n)
    model.value = n
  },
})
// Dates: the picker gives local time; the API wants ISO 8601 with an offset.
const dateValue = computed({
  get: () => {
    if (!model.value) return ''
    const d = new Date(String(model.value))
    if (Number.isNaN(d.getTime())) return ''
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  },
  set: (v: string) => { model.value = v ? new Date(v).toISOString() : undefined },
})
// Arrays of ids: multi-select from real records.
const multiValue = computed({
  get: () => (Array.isArray(model.value) ? model.value.map(String) : []),
  set: (v: string[]) => { model.value = v.length ? v : undefined },
})
const textValue = computed({
  get: () => (model.value === undefined || model.value === null ? '' : String(model.value)),
  set: (v: string) => { model.value = v === '' ? undefined : v },
})
</script>

<template>
  <select v-if="choices" v-model="choiceValue" class="docs-param-input">
    <option value="">{{ required ? '— choose —' : '— not set —' }}</option>
    <option v-for="c in choices" :key="c" :value="c">{{ c }}</option>
  </select>
  <select v-else-if="isArray && options.length" v-model="multiValue" class="docs-param-input docs-multi" multiple>
    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
  </select>
  <select v-else-if="options.length" v-model="textValue" class="docs-param-input">
    <option value="">{{ required ? '— choose —' : '— not set —' }}</option>
    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
  </select>
  <input
    v-else-if="s.type === 'integer' || s.type === 'number'" v-model.lazy="numValue" class="docs-param-input" type="number"
    :min="s.minimum" :max="s.maximum" :placeholder="String(s.example ?? '')"
  >
  <input v-else-if="s.format === 'date-time'" v-model="dateValue" class="docs-param-input" type="datetime-local">
  <input v-else-if="!isArray" v-model="textValue" class="docs-param-input" :maxlength="s.maxLength" :placeholder="String(s.example ?? '')">
  <span v-else class="docs-param-hint">edit in the JSON box below</span>
</template>
