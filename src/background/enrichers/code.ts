import type { EnrichedData } from '../../shared/types'

const LANGUAGE_PATTERNS: ReadonlyArray<readonly [string, RegExp]> = [
  ['typescript', /\b(interface|type|enum|readonly|as\s+\w+|<\w+>)\b/],
  ['javascript', /\b(const|let|var|function|=>|require|module\.exports)\b/],
  ['python', /\b(def|class|import|from|self|elif|__\w+__)\b/],
  ['rust', /\b(fn|let\s+mut|impl|pub|use|mod|struct|enum|trait)\b/],
  ['go', /\b(func|package|import|var|:=|go\s|chan\s)\b/],
  ['java', /\b(public|private|protected|class|void|static|final|throws)\b/],
  ['cpp', /\b(#include|std::|cout|cin|nullptr|template|class)\b/],
  ['html', /<(!DOCTYPE|html|head|body|div|span|p|a\s)/i],
  ['css', /[{]\s*[\w-]+\s*:\s*[^}]+[}]/],
  ['sql', /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|CREATE\s+TABLE)\b/i],
  ['shell', /^(#!\/bin\/(ba)?sh|^\$\s|^>\s|&&|\|\||echo\s)/m],
  ['json', /^\s*[{\[]\s*"[^"]*"\s*:/],
  ['yaml', /^[\w-]+:\s+\S/m],
]

export async function enrichCode(raw: string): Promise<EnrichedData | null> {
  const language = detectLanguage(raw)
  const lines = raw.split('\n')
  const lineCount = lines.length
  const firstSymbol = extractFirstSymbol(raw)

  return {
    type: 'code',
    data: { language, lineCount, firstSymbol },
  }
}

function detectLanguage(code: string): string {
  const scores: Record<string, number> = {}

  for (const [lang, pattern] of LANGUAGE_PATTERNS) {
    const matches = code.match(new RegExp(pattern.source, pattern.flags + 'g'))
    if (matches) {
      scores[lang] = (scores[lang] ?? 0) + matches.length
    }
  }

  let best = 'plaintext'
  let bestScore = 0
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      best = lang
      bestScore = score
    }
  }

  return best
}

function extractFirstSymbol(code: string): string {
  const functionMatch = /(?:function|def|fn|func)\s+(\w+)/.exec(code)
  if (functionMatch) return functionMatch[1]

  const classMatch = /(?:class|struct|interface|type)\s+(\w+)/.exec(code)
  if (classMatch) return classMatch[1]

  const constMatch = /(?:const|let|var)\s+(\w+)/.exec(code)
  if (constMatch) return constMatch[1]

  return ''
}
