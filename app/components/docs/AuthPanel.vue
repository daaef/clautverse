<script setup lang="ts">
// Session strip for the API Explorer — signs in/out and signs up through the
// real Better Auth routes so every Try-it request runs as a real user.
const session = ref<{ user?: { email?: string, name?: string } } | null>(null)
const mode = ref<'in' | 'up'>('in')
const email = ref('')
const password = ref('')
const name = ref('')
const username = ref('')
const dob = ref('')
const terms = ref(false)
const error = ref('')
const notice = ref('')
const busy = ref(false)

async function refresh() {
  try { session.value = await $fetch<typeof session.value, string>('/api/auth/get-session', { credentials: 'same-origin' }) }
  catch { session.value = null }
}
onMounted(refresh)

async function signIn() {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/sign-in/email', {
      method: 'POST',
      body: { email: email.value, password: password.value },
      credentials: 'same-origin',
    })
    password.value = ''
    await refresh()
  }
  catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Sign-in failed'
  }
  finally { busy.value = false }
}

async function signUp() {
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch('/api/auth/sign-up/email', {
      method: 'POST',
      body: {
        email: email.value, password: password.value, name: name.value,
        username: username.value, dateOfBirth: dob.value, acceptTerms: terms.value,
      },
      credentials: 'same-origin',
    })
    notice.value = 'Account created — verify the email (dev: click the link in the dev console, or set email_verified=true in the DB), then sign in.'
    mode.value = 'in'
  }
  catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Sign-up failed'
  }
  finally { busy.value = false }
}

async function signOut() {
  await $fetch('/api/auth/sign-out', { method: 'POST', credentials: 'same-origin' }).catch(() => {})
  await refresh()
}
</script>

<template>
  <div class="docs-authbar">
    <template v-if="session?.user">
      <span class="docs-authbar-dot on" />
      <span class="docs-authbar-text">Signed in as <strong>{{ session.user.email ?? session.user.name }}</strong></span>
      <button type="button" class="docs-mini-btn" @click="signOut">Sign out</button>
    </template>
    <template v-else>
      <span class="docs-authbar-dot" />
      <span class="docs-authbar-text">Signed out — requests run unauthenticated</span>
      <div class="docs-authbar-tabs">
        <button type="button" class="docs-mini-btn" :class="{ on: mode === 'in' }" @click="mode = 'in'">Sign in</button>
        <button type="button" class="docs-mini-btn" :class="{ on: mode === 'up' }" @click="mode = 'up'">Sign up</button>
      </div>
      <template v-if="mode === 'in'">
        <input v-model="email" class="docs-param-input" type="email" placeholder="email" autocomplete="email" style="width: 11rem">
        <input v-model="password" class="docs-param-input" type="password" placeholder="password" autocomplete="current-password" style="width: 9rem" @keyup.enter="signIn">
        <button type="button" class="docs-send-btn" :disabled="busy || !email || !password" @click="signIn">{{ busy ? '…' : 'Sign in' }}</button>
      </template>
      <template v-else>
        <input v-model="email" class="docs-param-input" type="email" placeholder="email" style="width: 10rem">
        <input v-model="password" class="docs-param-input" type="password" placeholder="password (8+)" autocomplete="new-password" style="width: 7rem">
        <input v-model="name" class="docs-param-input" placeholder="name" style="width: 7rem">
        <input v-model="username" class="docs-param-input" placeholder="username (a-z0-9_)" style="width: 9rem">
        <input v-model="dob" class="docs-param-input" type="date" title="date of birth" style="width: 8.5rem">
        <label class="docs-authbar-terms"><input v-model="terms" type="checkbox"> 18+</label>
        <button type="button" class="docs-send-btn" :disabled="busy || !email || !password || !name || !username || !dob || !terms" @click="signUp">{{ busy ? '…' : 'Sign up' }}</button>
      </template>
      <span v-if="error" class="docs-response-err">{{ error }}</span>
      <span v-if="notice" class="docs-authbar-note">{{ notice }}</span>
    </template>
  </div>
</template>
