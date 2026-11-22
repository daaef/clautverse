// AUTH-01..04b: Better Auth endpoints (sign-up/email, sign-in/email, sign-out, password reset, verify-email, ...)
export default defineEventHandler(event => useAuth().handler(toWebRequest(event)))
