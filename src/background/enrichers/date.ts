import type { EnrichedData } from '../../shared/types'

export async function enrichDate(raw: string): Promise<EnrichedData | null> {
  const parsed = new Date(raw.trim())
  if (isNaN(parsed.getTime())) return null

  const iso = parsed.toISOString()
  const relative = getRelativeTime(parsed)

  return {
    type: 'date',
    data: { iso, relative },
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const absDiffMs = Math.abs(diffMs)
  const isFuture = diffMs > 0

  const seconds = Math.floor(absDiffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  const suffix = isFuture ? 'from now' : 'ago'

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ${suffix}`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ${suffix}`
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ${suffix}`
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ${suffix}`
  return `${years} year${years > 1 ? 's' : ''} ${suffix}`
}
