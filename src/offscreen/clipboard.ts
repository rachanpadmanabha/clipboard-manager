chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'COPY_TO_CLIPBOARD') {
    const textarea = document.getElementById('clipboard-area') as HTMLTextAreaElement
    if (!textarea) {
      sendResponse({ type: 'CLIPBOARD_WRITTEN', payload: { success: false } })
      return
    }

    textarea.value = message.payload.text
    textarea.select()

    try {
      document.execCommand('copy')
      sendResponse({ type: 'CLIPBOARD_WRITTEN', payload: { success: true } })
    } catch {
      sendResponse({ type: 'CLIPBOARD_WRITTEN', payload: { success: false } })
    }
  }
})
