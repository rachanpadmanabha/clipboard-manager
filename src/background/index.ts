import { detect } from '../shared/detector'
import { addClip, updateClip } from '../shared/storage'
import { generateId, ensureOffscreenDocument } from '../shared/chrome'
import type { Message } from '../shared/messages'
import type { ClipItem, EnrichedData } from '../shared/types'
import { ENRICHMENT_TIMEOUT_MS } from '../shared/types'
import { enrichByType } from './enrichers/registry'

console.log('[ClipMind] Background service worker started')

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  console.log('[ClipMind] Background received message:', message.type)

  if (message.type === 'CLIP_COPIED') {
    handleClipCopied(message.payload.raw, message.payload.sourceUrl)
      .then(() => {
        console.log('[ClipMind] Clip saved successfully')
        sendResponse({ success: true })
      })
      .catch((err) => {
        console.error('[ClipMind] Failed to save clip:', err)
        sendResponse({ success: false })
      })
    return true
  }

  if (message.type === 'COPY_TO_CLIPBOARD') {
    handleCopyToClipboard(message.payload.text)
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }))
    return true
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'clipmind-paste-as',
    title: 'ClipMind: Paste as...',
    contexts: ['editable'],
  })
})

async function handleClipCopied(raw: string, sourceUrl: string): Promise<void> {
  const trimmed = raw.trim()
  if (!trimmed) return

  const clipType = detect(trimmed)
  const id = generateId()

  const clip: ClipItem = {
    id,
    raw: trimmed,
    type: clipType,
    enriched: null,
    timestamp: Date.now(),
    pinned: false,
    tags: [],
    sourceUrl,
  }

  await addClip(clip)

  enrichInBackground(id, trimmed, clipType)
}

function enrichInBackground(id: string, raw: string, clipType: string): void {
  const enrichPromise = enrichByType(clipType, raw)
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), ENRICHMENT_TIMEOUT_MS)
  )

  Promise.race([enrichPromise, timeout])
    .then(async (enriched: EnrichedData | null) => {
      if (enriched) {
        await updateClip(id, { enriched })
      }
    })
    .catch(() => {
      // Enrichment failed — item stays with null enriched data
    })
}

async function handleCopyToClipboard(text: string): Promise<void> {
  const offscreenUrl = chrome.runtime.getURL('src/offscreen/offscreen.html')
  await ensureOffscreenDocument(offscreenUrl)

  await chrome.runtime.sendMessage({
    type: 'COPY_TO_CLIPBOARD',
    payload: { text },
  })
}
