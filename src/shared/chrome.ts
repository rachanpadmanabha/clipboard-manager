let creatingOffscreen: Promise<void> | null = null

export async function ensureOffscreenDocument(url: string): Promise<void> {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT as chrome.runtime.ContextType],
    documentUrls: [url],
  })

  if (existingContexts.length > 0) return

  if (creatingOffscreen) {
    await creatingOffscreen
    return
  }

  creatingOffscreen = chrome.offscreen.createDocument({
    url,
    reasons: [chrome.offscreen.Reason.CLIPBOARD as chrome.offscreen.Reason],
    justification: 'Write to clipboard from service worker',
  })

  await creatingOffscreen
  creatingOffscreen = null
}

export function createContextMenuItem(options: chrome.contextMenus.CreateProperties): void {
  chrome.contextMenus.create(options)
}

export function onContextMenuClick(
  handler: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
): void {
  chrome.contextMenus.onClicked.addListener(handler)
}

export function onStorageChanged(
  handler: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') handler(changes)
  })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
