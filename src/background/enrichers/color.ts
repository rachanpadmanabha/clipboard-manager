import type { EnrichedData } from '../../shared/types'

export async function enrichColor(raw: string): Promise<EnrichedData | null> {
  const trimmed = raw.trim()
  let r: number, g: number, b: number

  const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(trimmed)
  if (hexMatch) {
    const hex = hexMatch[1]
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    }
  } else {
    const rgbMatch = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(trimmed)
    if (rgbMatch) {
      r = parseInt(rgbMatch[1])
      g = parseInt(rgbMatch[2])
      b = parseInt(rgbMatch[3])
    } else {
      const hslMatch = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/.exec(trimmed)
      if (hslMatch) {
        const [rr, gg, bb] = hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]))
        r = rr; g = gg; b = bb
      } else {
        return null
      }
    }
  }

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  const rgb = `rgb(${r}, ${g}, ${b})`
  const [h, s, l] = rgbToHsl(r, g, b)
  const hsl = `hsl(${h}, ${s}%, ${l}%)`

  return { type: 'color', data: { hex, rgb, hsl } }
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100

  if (s === 0) {
    const val = Math.round(l * 255)
    return [val, val, val]
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ]
}
