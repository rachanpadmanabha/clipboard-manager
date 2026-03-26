export type ClipType =
  | 'url'
  | 'email'
  | 'phone'
  | 'color'
  | 'code'
  | 'date'
  | 'address'
  | 'name'
  | 'number'
  | 'text'

export interface EnrichedUrlData {
  readonly title: string
  readonly description: string
  readonly favicon: string
  readonly ogImage: string
}

export interface EnrichedCodeData {
  readonly language: string
  readonly lineCount: number
  readonly firstSymbol: string
}

export interface EnrichedColorData {
  readonly hex: string
  readonly rgb: string
  readonly hsl: string
}

export interface EnrichedPhoneData {
  readonly e164: string
  readonly local: string
  readonly country: string
}

export interface EnrichedEmailData {
  readonly namePart: string
  readonly domain: string
  readonly gravatarHash: string
}

export interface EnrichedDateData {
  readonly iso: string
  readonly relative: string
}

export interface EnrichedAddressData {
  readonly mapsUrl: string
  readonly city: string
  readonly country: string
}

export interface EnrichedNameData {
  readonly linkedInUrl: string
}

export interface EnrichedNumberData {
  readonly formatted: string
}

export interface EnrichedTextData {
  readonly wordCount: number
  readonly readingTime: string
  readonly detectedLanguage: string
}

export type EnrichedData =
  | { readonly type: 'url'; readonly data: EnrichedUrlData }
  | { readonly type: 'code'; readonly data: EnrichedCodeData }
  | { readonly type: 'color'; readonly data: EnrichedColorData }
  | { readonly type: 'phone'; readonly data: EnrichedPhoneData }
  | { readonly type: 'email'; readonly data: EnrichedEmailData }
  | { readonly type: 'date'; readonly data: EnrichedDateData }
  | { readonly type: 'address'; readonly data: EnrichedAddressData }
  | { readonly type: 'name'; readonly data: EnrichedNameData }
  | { readonly type: 'number'; readonly data: EnrichedNumberData }
  | { readonly type: 'text'; readonly data: EnrichedTextData }

export interface ClipItem {
  readonly id: string
  readonly raw: string
  readonly type: ClipType
  readonly enriched: EnrichedData | null
  readonly timestamp: number
  readonly pinned: boolean
  readonly tags: readonly string[]
  readonly sourceUrl: string
}

export const CLIP_TYPE_LABELS: Record<ClipType, string> = {
  url: 'URL',
  email: 'Email',
  phone: 'Phone',
  color: 'Color',
  code: 'Code',
  date: 'Date',
  address: 'Address',
  name: 'Name',
  number: 'Number',
  text: 'Text',
}

export const CLIP_TYPE_COLORS: Record<ClipType, string> = {
  url: 'var(--clip-url)',
  email: 'var(--clip-email)',
  phone: 'var(--clip-phone)',
  color: 'var(--clip-color)',
  code: 'var(--clip-code)',
  date: 'var(--clip-date)',
  address: 'var(--clip-address)',
  name: 'var(--clip-name)',
  number: 'var(--clip-number)',
  text: 'var(--clip-text)',
}

export const MAX_HISTORY_FREE = 25
export const MAX_HISTORY_PRO = 200
export const ENRICHMENT_TIMEOUT_MS = 3000
