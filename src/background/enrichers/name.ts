import type { EnrichedData } from '../../shared/types'

export async function enrichName(raw: string): Promise<EnrichedData | null> {
  const trimmed = raw.trim()
  const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(trimmed)}`

  return {
    type: 'name',
    data: { linkedInUrl },
  }
}
