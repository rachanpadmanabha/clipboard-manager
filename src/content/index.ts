import { detect } from '../shared/detector'
import { CLIP_TYPE_LABELS } from '../shared/types'

function getCopiedText(): string {
  const active = document.activeElement

  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement
  ) {
    const start = active.selectionStart ?? 0
    const end = active.selectionEnd ?? 0
    if (start !== end) {
      return active.value.slice(start, end)
    }
  }

  return window.getSelection()?.toString() ?? ''
}

const TYPE_COLORS: Record<string, string> = {
  url: '#3b82f6',
  email: '#8b5cf6',
  phone: '#f59e0b',
  color: '#ec4899',
  code: '#10b981',
  date: '#6366f1',
  address: '#f97316',
  name: '#06b6d4',
  number: '#ef4444',
  text: '#6b7280',
}

let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(text: string, clipType: string) {
  const existing = document.getElementById('clipmind-toast')
  if (existing) existing.remove()
  if (toastTimeout) clearTimeout(toastTimeout)

  const toast = document.createElement('div')
  toast.id = 'clipmind-toast'

  const preview = text.length > 60 ? text.slice(0, 57) + '...' : text
  const label = CLIP_TYPE_LABELS[clipType as keyof typeof CLIP_TYPE_LABELS] ?? 'Text'
  const color = TYPE_COLORS[clipType] ?? '#6b7280'

  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;min-width:0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span style="color:#94a3b8;font-size:12px;font-weight:500;flex-shrink:0;">Copied</span>
      <span style="
        background:${color};
        color:#fff;
        font-size:9px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:0.05em;
        padding:2px 6px;
        border-radius:4px;
        flex-shrink:0;
      ">${label}</span>
      <span style="
        color:#e2e8f0;
        font-size:12px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        min-width:0;
      ">${preview.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
    </div>
  `

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '2147483647',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: `1px solid ${color}33`,
    borderRadius: '10px',
    padding: '10px 14px',
    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px ${color}15`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '340px',
    opacity: '0',
    transform: 'translateY(12px) scale(0.96)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    pointerEvents: 'none',
  } as CSSStyleDeclaration)

  document.body.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0) scale(1)'
  })

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(8px) scale(0.98)'
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

document.addEventListener('copy', () => {
  const text = getCopiedText()
  if (!text || text.trim().length === 0) return

  const clipType = detect(text.trim())
  showToast(text.trim(), clipType)

  chrome.runtime.sendMessage({
    type: 'CLIP_COPIED',
    payload: {
      raw: text,
      sourceUrl: location.href,
    },
  }).catch(() => {
    // Extension context may be invalidated
  })
})
