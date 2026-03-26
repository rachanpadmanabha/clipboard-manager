import type { EnrichedData } from '../../shared/types'

export async function enrichUrl(raw: string): Promise<EnrichedData | null> {
  try {
    const response = await fetch(raw, {
      method: 'GET',
      headers: { 'Accept': 'text/html' },
    })

    if (!response.ok) return fallback(raw)

    const html = await response.text()

    const title = extractMeta(html, 'og:title') ?? extractTag(html, 'title') ?? ''
    const description = extractMeta(html, 'og:description') ?? extractMeta(html, 'description') ?? ''
    const ogImage = extractMeta(html, 'og:image') ?? ''

    const url = new URL(raw)
    const favicon = `${url.origin}/favicon.ico`

    return {
      type: 'url',
      data: { title, description, favicon, ogImage },
    }
  } catch {
    return fallback(raw)
  }
}

function fallback(raw: string): EnrichedData {
  try {
    const url = new URL(raw)
    return {
      type: 'url',
      data: {
        title: url.hostname,
        description: '',
        favicon: `${url.origin}/favicon.ico`,
        ogImage: '',
      },
    }
  } catch {
    return { type: 'url', data: { title: raw, description: '', favicon: '', ogImage: '' } }
  }
}

function extractMeta(html: string, property: string): string | null {
  const ogPattern = new RegExp(
    `<meta[^>]*(?:property|name)=["'](?:og:)?${property}["'][^>]*content=["']([^"']*)["']`,
    'i'
  )
  const match = ogPattern.exec(html)
  if (match) return match[1]

  const reversePattern = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["'](?:og:)?${property}["']`,
    'i'
  )
  const reverseMatch = reversePattern.exec(html)
  return reverseMatch?.[1] ?? null
}

function extractTag(html: string, tag: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
  const match = pattern.exec(html)
  return match?.[1]?.trim() ?? null
}
