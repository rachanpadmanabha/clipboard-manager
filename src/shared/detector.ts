import type { ClipType } from './types'

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const RGB_COLOR_REGEX = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$/
const HSL_COLOR_REGEX = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*(,\s*(0|1|0?\.\d+))?\s*\)$/
const NUMBER_REGEX = /^-?(\d{1,3}(,\d{3})*|\d+)(\.\d+)?$/

const CODE_INDICATORS = [
  /\bfunction\s+\w+/,
  /\bconst\s+\w+\s*=/,
  /\blet\s+\w+\s*=/,
  /\bvar\s+\w+\s*=/,
  /\bclass\s+\w+/,
  /\bimport\s+/,
  /\bexport\s+(default\s+)?/,
  /\bif\s*\(/,
  /\bfor\s*\(/,
  /\bwhile\s*\(/,
  /\breturn\s+/,
  /=>/,
  /\bdef\s+\w+/,
  /\bfn\s+\w+/,
  /\bpub\s+(fn|struct|enum)/,
  /^\s*<\w+[\s/>]/m,
  /[{}\[\]];?\s*$/m,
]

const DATE_FORMATS = [
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/,
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  /^\d{1,2}-\d{1,2}-\d{2,4}$/,
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i,
  /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i,
]

const STREET_SUFFIXES = /\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|court|ct|place|pl|way|circle|cir)\b/i
const ZIP_PATTERN = /\b\d{5}(-\d{4})?\b/
const STATE_ABBR = /\b[A-Z]{2}\b/

export function isUrl(text: string): boolean {
  return URL_REGEX.test(text.trim())
}

export function isEmail(text: string): boolean {
  return EMAIL_REGEX.test(text.trim())
}

export function isPhone(text: string): boolean {
  const trimmed = text.trim()
  if (isDate(trimmed)) return false

  const cleaned = trimmed.replace(/[\s\-().+]/g, '')
  if (cleaned.length < 7 || cleaned.length > 16) return false
  if (!/^\d+$/.test(cleaned)) return false

  return PHONE_REGEX.test(trimmed) || /^[+]?\d[\d\s\-().]{6,18}\d$/.test(trimmed)
}

export function isColor(text: string): boolean {
  const t = text.trim()
  return HEX_COLOR_REGEX.test(t) || RGB_COLOR_REGEX.test(t) || HSL_COLOR_REGEX.test(t)
}

export function isCode(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10) return false

  const lines = trimmed.split('\n')
  if (lines.length < 2) {
    let matchCount = 0
    for (const pattern of CODE_INDICATORS) {
      if (pattern.test(trimmed)) matchCount++
    }
    return matchCount >= 2
  }

  let matchCount = 0
  for (const pattern of CODE_INDICATORS) {
    if (pattern.test(trimmed)) matchCount++
  }

  const hasBraces = /[{}]/.test(trimmed)
  const hasSemicolons = /;\s*$/m.test(trimmed)
  const hasIndentation = lines.some(l => /^\s{2,}/.test(l))

  if (matchCount >= 2) return true
  if (matchCount >= 1 && (hasBraces || hasSemicolons) && hasIndentation) return true
  if (hasBraces && hasSemicolons && hasIndentation && lines.length >= 3) return true

  return false
}

export function isDate(text: string): boolean {
  const trimmed = text.trim()
  for (const pattern of DATE_FORMATS) {
    if (pattern.test(trimmed)) {
      const parsed = new Date(trimmed)
      if (!isNaN(parsed.getTime())) return true
    }
  }
  return false
}

export function isAddress(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10 || trimmed.length > 300) return false

  const hasStreetSuffix = STREET_SUFFIXES.test(trimmed)
  const hasZip = ZIP_PATTERN.test(trimmed)
  const hasState = STATE_ABBR.test(trimmed)
  const hasNumber = /^\d+\s/.test(trimmed)
  const hasComma = trimmed.includes(',')

  if (hasNumber && hasStreetSuffix && (hasZip || hasState || hasComma)) return true
  if (hasStreetSuffix && hasZip) return true
  if (hasNumber && hasComma && (hasZip || hasState)) return true

  return false
}

export function isName(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 3 || trimmed.length > 60) return false
  if (/\d/.test(trimmed)) return false
  if (/[^a-zA-Z\s'.\-]/.test(trimmed)) return false

  const words = trimmed.split(/\s+/)
  if (words.length < 2 || words.length > 4) return false

  return words.every(w => /^[A-Z]/.test(w))
}

export function isNumber(text: string): boolean {
  return NUMBER_REGEX.test(text.trim())
}

export function detect(raw: string): ClipType {
  const trimmed = raw.trim()
  if (!trimmed) return 'text'

  if (isUrl(trimmed)) return 'url'
  if (isEmail(trimmed)) return 'email'
  if (isColor(trimmed)) return 'color'
  if (isDate(trimmed)) return 'date'
  if (isPhone(trimmed)) return 'phone'
  if (isCode(trimmed)) return 'code'
  if (isAddress(trimmed)) return 'address'
  if (isName(trimmed)) return 'name'
  if (isNumber(trimmed)) return 'number'

  return 'text'
}
