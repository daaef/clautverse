type Notification = typeof schema.notification.$inferSelect

const SUMMARY: Record<string, string> = {
  'drop.published': 'New drop in a community you joined',
  'reply.replied': 'Someone replied to your reply',
  'talent_application.accepted': 'Your talent application was accepted',
  'talent_application.declined': 'Your talent application was declined',
  'identity_claim.verified': 'Your identity claim was verified',
  'identity_claim.rejected': 'Your identity claim was rejected',
  'watch_party.created': 'New watch party in your community',
  'watch_party.reminder': 'A watch party you\'re going to starts soon',
  'watch_party.cancelled': 'A watch party you\'re going to was cancelled',
  'mission.completion_approved': 'Your mission proof was approved',
  'mission.completion_rejected': 'Your mission proof was rejected',
  'badge.awarded': 'You earned a badge',
}

// First matching id in `data` becomes the tap target.
const TARGETS: [string, string][] = [['dropId', 'drop'], ['replyId', 'reply'], ['partyId', 'watch_party'], ['missionId', 'mission'],
  ['applicationId', 'talent_application'], ['claimId', 'identity_claim'], ['badgeId', 'badge'], ['communityId', 'community']]

export function notificationView(n: Notification) {
  const t = TARGETS.find(([k]) => typeof n.data[k] === 'string')
  return {
    id: n.id, type: n.type, readAt: n.readAt?.toISOString() ?? null,
    target: t ? { type: t[1], id: n.data[t[0]] as string } : null,
    summary: SUMMARY[n.type] ?? 'Update', data: n.data, createdAt: n.createdAt.toISOString(),
  }
}
