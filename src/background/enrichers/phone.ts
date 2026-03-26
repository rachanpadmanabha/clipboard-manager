import type { EnrichedData } from '../../shared/types'

const COUNTRY_PREFIXES: ReadonlyArray<readonly [string, string]> = [
  ['1', 'US/CA'],
  ['44', 'GB'],
  ['91', 'IN'],
  ['86', 'CN'],
  ['81', 'JP'],
  ['49', 'DE'],
  ['33', 'FR'],
  ['39', 'IT'],
  ['61', 'AU'],
  ['55', 'BR'],
  ['7', 'RU'],
  ['82', 'KR'],
  ['34', 'ES'],
  ['52', 'MX'],
  ['31', 'NL'],
  ['46', 'SE'],
  ['47', 'NO'],
  ['45', 'DK'],
  ['41', 'CH'],
  ['43', 'AT'],
  ['48', 'PL'],
  ['90', 'TR'],
]

export async function enrichPhone(raw: string): Promise<EnrichedData | null> {
  const digits = raw.replace(/[^0-9+]/g, '')
  const hasPlus = digits.startsWith('+')

  let e164 = digits
  if (!hasPlus) {
    e164 = `+1${digits}`
  } else if (!e164.startsWith('+')) {
    e164 = `+${e164}`
  }

  const country = detectCountry(e164)
  const local = formatLocal(raw.trim())

  return {
    type: 'phone',
    data: { e164, local, country },
  }
}

function detectCountry(e164: string): string {
  const digits = e164.replace('+', '')
  for (const [prefix, country] of COUNTRY_PREFIXES) {
    if (digits.startsWith(prefix)) return country
  }
  return 'Unknown'
}

function formatLocal(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}
