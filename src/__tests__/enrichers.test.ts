import { describe, it, expect, vi, beforeEach } from 'vitest'
import { enrichCode } from '../background/enrichers/code'
import { enrichColor } from '../background/enrichers/color'
import { enrichPhone } from '../background/enrichers/phone'
import { enrichDate } from '../background/enrichers/date'
import { enrichAddress } from '../background/enrichers/address'
import { enrichName } from '../background/enrichers/name'
import { enrichText } from '../background/enrichers/text'
import { enrichNumber } from '../background/enrichers/number'

describe('enrichCode', () => {
  it('detects JavaScript language', async () => {
    const result = await enrichCode('const x = 5;\nfunction hello() { return x; }')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('code')
    if (result!.type === 'code') {
      expect(result!.data.language).toBe('javascript')
      expect(result!.data.lineCount).toBe(2)
    }
  })

  it('extracts first function symbol', async () => {
    const result = await enrichCode('function myFunc() {\n  return 42;\n}')
    expect(result).not.toBeNull()
    if (result!.type === 'code') {
      expect(result!.data.firstSymbol).toBe('myFunc')
    }
  })

  it('detects Python', async () => {
    const result = await enrichCode('def hello():\n  return "world"\nimport os')
    expect(result).not.toBeNull()
    if (result!.type === 'code') {
      expect(result!.data.language).toBe('python')
    }
  })
})

describe('enrichColor', () => {
  it('converts hex to all formats', async () => {
    const result = await enrichColor('#ff0000')
    expect(result).not.toBeNull()
    if (result!.type === 'color') {
      expect(result!.data.hex).toBe('#ff0000')
      expect(result!.data.rgb).toBe('rgb(255, 0, 0)')
      expect(result!.data.hsl).toBe('hsl(0, 100%, 50%)')
    }
  })

  it('handles short hex', async () => {
    const result = await enrichColor('#fff')
    expect(result).not.toBeNull()
    if (result!.type === 'color') {
      expect(result!.data.hex).toBe('#ffffff')
      expect(result!.data.rgb).toBe('rgb(255, 255, 255)')
    }
  })

  it('handles rgb input', async () => {
    const result = await enrichColor('rgb(0, 128, 255)')
    expect(result).not.toBeNull()
    if (result!.type === 'color') {
      expect(result!.data.hex).toBe('#0080ff')
    }
  })
})

describe('enrichPhone', () => {
  it('formats US numbers', async () => {
    const result = await enrichPhone('5551234567')
    expect(result).not.toBeNull()
    if (result!.type === 'phone') {
      expect(result!.data.local).toBe('(555) 123-4567')
      expect(result!.data.country).toBe('US/CA')
    }
  })

  it('handles international prefix', async () => {
    const result = await enrichPhone('+44 20 7946 0958')
    expect(result).not.toBeNull()
    if (result!.type === 'phone') {
      expect(result!.data.country).toBe('GB')
    }
  })
})

describe('enrichDate', () => {
  it('parses ISO dates', async () => {
    const result = await enrichDate('2024-06-15')
    expect(result).not.toBeNull()
    if (result!.type === 'date') {
      expect(result!.data.iso).toContain('2024-06-15')
      expect(result!.data.relative).toBeTruthy()
    }
  })

  it('returns null for invalid dates', async () => {
    const result = await enrichDate('not a date')
    expect(result).toBeNull()
  })
})

describe('enrichAddress', () => {
  it('generates maps URL', async () => {
    const result = await enrichAddress('123 Main Street, Springfield, IL 62701')
    expect(result).not.toBeNull()
    if (result!.type === 'address') {
      expect(result!.data.mapsUrl).toContain('google.com/maps')
      expect(result!.data.mapsUrl).toContain(encodeURIComponent('123 Main Street'))
    }
  })
})

describe('enrichName', () => {
  it('generates LinkedIn URL', async () => {
    const result = await enrichName('John Smith')
    expect(result).not.toBeNull()
    if (result!.type === 'name') {
      expect(result!.data.linkedInUrl).toContain('linkedin.com')
      expect(result!.data.linkedInUrl).toContain('John')
    }
  })
})

describe('enrichText', () => {
  it('counts words and estimates reading time', async () => {
    const text = Array(400).fill('word').join(' ')
    const result = await enrichText(text)
    expect(result).not.toBeNull()
    if (result!.type === 'text') {
      expect(result!.data.wordCount).toBe(400)
      expect(result!.data.readingTime).toBe('2 min read')
      expect(result!.data.detectedLanguage).toBe('English')
    }
  })

  it('detects CJK text', async () => {
    const result = await enrichText('こんにちは世界')
    expect(result).not.toBeNull()
    if (result!.type === 'text') {
      expect(result!.data.detectedLanguage).toBe('Japanese')
    }
  })
})

describe('enrichNumber', () => {
  it('formats large numbers', async () => {
    const result = await enrichNumber('1000000')
    expect(result).not.toBeNull()
    if (result!.type === 'number') {
      expect(result!.data.formatted).toBe('1,000,000')
    }
  })

  it('handles decimals', async () => {
    const result = await enrichNumber('3.14159')
    expect(result).not.toBeNull()
    if (result!.type === 'number') {
      expect(result!.data.formatted).toBe('3.142')
    }
  })

  it('returns null for non-numbers', async () => {
    const result = await enrichNumber('abc')
    expect(result).toBeNull()
  })
})
