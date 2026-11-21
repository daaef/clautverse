export interface OutgoingEmail { to: string, subject: string, text: string }

/**
 * Sends via Mailtrap (REST API, no SDK).
 * - NUXT_MAILTRAP_API_TOKEN set → live sending endpoint.
 * - NUXT_MAILTRAP_INBOX_ID also set → Mailtrap Email Testing sandbox instead.
 * - No token → local dev/tests: logs the email instead of sending.
 */
export async function sendEmail(email: OutgoingEmail) {
  const { mailtrapApiToken, mailtrapInboxId, emailFrom } = useRuntimeConfig()
  if (!mailtrapApiToken) {
    if (process.env.NODE_ENV === 'production') throw new Error('NUXT_MAILTRAP_API_TOKEN is not set')
    console.info(`[email] to=${email.to} subject="${email.subject}"\n${email.text}`)
    return
  }
  const url = mailtrapInboxId
    ? `https://sandbox.api.mailtrap.io/api/send/${mailtrapInboxId}`
    : 'https://send.api.mailtrap.io/api/send'
  try {
    await $fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${mailtrapApiToken}` },
      body: { from: { email: emailFrom }, to: [{ email: email.to }], subject: email.subject, text: email.text },
    })
  }
  catch (e) {
    throw new Error(`Email send failed: ${e instanceof Error ? e.message : 'Mailtrap error'}`)
  }
}
