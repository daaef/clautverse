// AUTH-06: works before email verification so the app can show "check your inbox".
export default defineEventHandler(async event => toMe(await requireUser(event, { verified: false })))
