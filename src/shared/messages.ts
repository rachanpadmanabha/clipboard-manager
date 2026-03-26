import type { EnrichedData } from './types'

export type Message =
  | { readonly type: 'CLIP_COPIED'; readonly payload: { readonly raw: string; readonly sourceUrl: string } }
  | { readonly type: 'CLIP_ENRICHED'; readonly payload: { readonly id: string; readonly enriched: EnrichedData } }
  | { readonly type: 'COPY_TO_CLIPBOARD'; readonly payload: { readonly text: string } }
  | { readonly type: 'CLIPBOARD_WRITTEN'; readonly payload: { readonly success: boolean } }

export function sendMessage(message: Message): Promise<unknown> {
  return chrome.runtime.sendMessage(message)
}

export function onMessage(
  handler: (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) => void | boolean
): void {
  chrome.runtime.onMessage.addListener(handler)
}
