import type { EnrichedData } from '../../shared/types'

export async function enrichNumber(raw: string): Promise<EnrichedData | null> {
  const trimmed = raw.trim().replace(/,/g, '')
  const num = parseFloat(trimmed)
  if (isNaN(num)) return null

  const formatted = new Intl.NumberFormat('en-US').format(num)

  return {
    type: 'number',
    data: { formatted },
  }
}
