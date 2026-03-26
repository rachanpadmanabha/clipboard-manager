import type { EnrichedData } from '../../shared/types'

export async function enrichEmail(raw: string): Promise<EnrichedData | null> {
  const trimmed = raw.trim().toLowerCase()
  const atIndex = trimmed.indexOf('@')
  if (atIndex === -1) return null

  const namePart = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)

  const encoder = new TextEncoder()
  const data = encoder.encode(trimmed)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const gravatarHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return {
    type: 'email',
    data: { namePart, domain, gravatarHash: gravatarHash.slice(0, 32) },
  }
}
