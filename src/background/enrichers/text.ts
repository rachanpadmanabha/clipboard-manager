import type { EnrichedData } from '../../shared/types'

export async function enrichText(raw: string): Promise<EnrichedData | null> {
  const trimmed = raw.trim()
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const readingTime = readingMinutes === 1 ? '1 min read' : `${readingMinutes} min read`

  const detectedLanguage = detectTextLanguage(trimmed)

  return {
    type: 'text',
    data: { wordCount, readingTime, detectedLanguage },
  }
}

function detectTextLanguage(text: string): string {
  const cjk = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/
  if (cjk.test(text)) {
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'Japanese'
    if (/[\uac00-\ud7af]/.test(text)) return 'Korean'
    return 'Chinese'
  }

  if (/[\u0600-\u06ff]/.test(text)) return 'Arabic'
  if (/[\u0400-\u04ff]/.test(text)) return 'Russian'
  if (/[\u0900-\u097f]/.test(text)) return 'Hindi'

  return 'English'
}
