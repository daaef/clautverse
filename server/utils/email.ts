import { Resend } from 'resend'

export interface OutgoingEmail { to: string, subject: string, text: string }

/** Sends via Resend; without an API key (local dev/tests) it logs instead. */
export async function sendEmail(email: OutgoingEmail) {
  const { resendApiKey, emailFrom } = useRuntimeConfig()
  if (!resendApiKey) {
    if (process.env.NODE_ENV === 'production') throw new Error('NUXT_RESEND_API_KEY is not set')
    console.info(`[email] to=${email.to} subject="${email.subject}"\n${email.text}`)
    return
  }
  const { error } = await new Resend(resendApiKey).emails.send({ from: emailFrom, ...email })
  if (error) throw new Error(`Email send failed: ${error.message}`)
}
