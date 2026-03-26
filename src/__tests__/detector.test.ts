import { describe, it, expect } from 'vitest'
import {
  detect,
  isUrl,
  isEmail,
  isPhone,
  isColor,
  isCode,
  isDate,
  isAddress,
  isName,
  isNumber,
} from '../shared/detector'

describe('isUrl', () => {
  it('detects http URLs', () => {
    expect(isUrl('http://example.com')).toBe(true)
  })

  it('detects https URLs', () => {
    expect(isUrl('https://example.com/path?q=1')).toBe(true)
  })

  it('rejects plain text', () => {
    expect(isUrl('not a url')).toBe(false)
  })

  it('rejects partial URLs', () => {
    expect(isUrl('example.com')).toBe(false)
  })
})

describe('isEmail', () => {
  it('detects standard emails', () => {
    expect(isEmail('user@example.com')).toBe(true)
  })

  it('detects emails with dots and plus', () => {
    expect(isEmail('first.last+tag@domain.co.uk')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isEmail('not-an-email')).toBe(false)
    expect(isEmail('@missing.com')).toBe(false)
  })
})

describe('isPhone', () => {
  it('detects US phone numbers', () => {
    expect(isPhone('(555) 123-4567')).toBe(true)
  })

  it('detects international format', () => {
    expect(isPhone('+1-555-123-4567')).toBe(true)
  })

  it('detects simple digit sequences', () => {
    expect(isPhone('5551234567')).toBe(true)
  })

  it('rejects short numbers', () => {
    expect(isPhone('123')).toBe(false)
  })

  it('rejects text', () => {
    expect(isPhone('hello world')).toBe(false)
  })
})

describe('isColor', () => {
  it('detects hex colors', () => {
    expect(isColor('#ff0000')).toBe(true)
    expect(isColor('#fff')).toBe(true)
    expect(isColor('#FF00FF')).toBe(true)
  })

  it('detects rgb colors', () => {
    expect(isColor('rgb(255, 0, 0)')).toBe(true)
    expect(isColor('rgba(255, 0, 0, 0.5)')).toBe(true)
  })

  it('detects hsl colors', () => {
    expect(isColor('hsl(0, 100%, 50%)')).toBe(true)
  })

  it('rejects non-colors', () => {
    expect(isColor('#xyz')).toBe(false)
    expect(isColor('red')).toBe(false)
  })
})

describe('isCode', () => {
  it('detects JavaScript', () => {
    const code = `const x = 5;
function hello() {
  return x;
}`
    expect(isCode(code)).toBe(true)
  })

  it('detects Python', () => {
    const code = `def hello():
  return "world"
import os`
    expect(isCode(code)).toBe(true)
  })

  it('rejects plain text', () => {
    expect(isCode('Hello, how are you today?')).toBe(false)
  })

  it('rejects very short strings', () => {
    expect(isCode('x = 5')).toBe(false)
  })
})

describe('isDate', () => {
  it('detects ISO dates', () => {
    expect(isDate('2024-03-15')).toBe(true)
  })

  it('detects ISO datetime', () => {
    expect(isDate('2024-03-15T10:30:00')).toBe(true)
  })

  it('detects US date format', () => {
    expect(isDate('03/15/2024')).toBe(true)
  })

  it('detects written dates', () => {
    expect(isDate('Jan 15, 2024')).toBe(true)
  })

  it('rejects non-dates', () => {
    expect(isDate('not a date')).toBe(false)
  })
})

describe('isAddress', () => {
  it('detects US addresses', () => {
    expect(isAddress('123 Main Street, Springfield, IL 62701')).toBe(true)
  })

  it('detects addresses with abbreviations', () => {
    expect(isAddress('456 Oak Ave, Portland, OR 97201')).toBe(true)
  })

  it('rejects non-addresses', () => {
    expect(isAddress('just some text')).toBe(false)
  })
})

describe('isName', () => {
  it('detects person names', () => {
    expect(isName('John Smith')).toBe(true)
    expect(isName('Jane Mary Doe')).toBe(true)
  })

  it('rejects names with numbers', () => {
    expect(isName('John Smith 3rd')).toBe(false)
  })

  it('rejects single words', () => {
    expect(isName('John')).toBe(false)
  })

  it('rejects lowercase words', () => {
    expect(isName('john smith')).toBe(false)
  })
})

describe('isNumber', () => {
  it('detects integers', () => {
    expect(isNumber('42')).toBe(true)
    expect(isNumber('-100')).toBe(true)
  })

  it('detects decimals', () => {
    expect(isNumber('3.14')).toBe(true)
  })

  it('detects formatted numbers', () => {
    expect(isNumber('1,000,000')).toBe(true)
  })

  it('rejects non-numbers', () => {
    expect(isNumber('abc')).toBe(false)
  })
})

describe('detect (integration)', () => {
  it('prioritizes URL over text', () => {
    expect(detect('https://example.com')).toBe('url')
  })

  it('prioritizes email over name', () => {
    expect(detect('john@example.com')).toBe('email')
  })

  it('detects colors', () => {
    expect(detect('#3B82F6')).toBe('color')
  })

  it('detects code blocks', () => {
    const code = `function add(a, b) {
  return a + b;
}
export default add;`
    expect(detect(code)).toBe('code')
  })

  it('falls back to text', () => {
    expect(detect('Hello, how are you doing today?')).toBe('text')
  })

  it('detects phone numbers', () => {
    expect(detect('+1 (555) 123-4567')).toBe('phone')
  })

  it('returns text for empty-ish input', () => {
    expect(detect('')).toBe('text')
    expect(detect('   ')).toBe('text')
  })
})
