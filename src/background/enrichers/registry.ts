import type { EnrichedData } from '../../shared/types'
import { enrichUrl } from './url'
import { enrichCode } from './code'
import { enrichColor } from './color'
import { enrichPhone } from './phone'
import { enrichEmail } from './email'
import { enrichDate } from './date'
import { enrichAddress } from './address'
import { enrichName } from './name'
import { enrichText } from './text'
import { enrichNumber } from './number'

type Enricher = (raw: string) => Promise<EnrichedData | null>

const enrichers: Record<string, Enricher> = {
  url: enrichUrl,
  code: enrichCode,
  color: enrichColor,
  phone: enrichPhone,
  email: enrichEmail,
  date: enrichDate,
  address: enrichAddress,
  name: enrichName,
  number: enrichNumber,
  text: enrichText,
}

export async function enrichByType(type: string, raw: string): Promise<EnrichedData | null> {
  const enricher = enrichers[type]
  if (!enricher) return null

  try {
    return await enricher(raw)
  } catch {
    return null
  }
}
