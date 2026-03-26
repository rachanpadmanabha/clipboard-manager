import type { EnrichedData } from '../../shared/types'

export async function enrichAddress(raw: string): Promise<EnrichedData | null> {
  const trimmed = raw.trim()
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(trimmed)}`

  const parts = trimmed.split(',').map(p => p.trim())
  let city = ''
  let country = ''

  if (parts.length >= 3) {
    city = parts[parts.length - 3] || parts[parts.length - 2]
    country = parts[parts.length - 1]
  } else if (parts.length === 2) {
    city = parts[0]
    country = parts[1]
  }

  const stateZip = city.match(/^([A-Za-z\s]+)\s+(\d{5})/)
  if (stateZip) {
    city = stateZip[1].trim()
  }

  return {
    type: 'address',
    data: { mapsUrl, city, country },
  }
}
