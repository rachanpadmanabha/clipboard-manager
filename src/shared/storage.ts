import type { ClipItem } from './types'
import { MAX_HISTORY_PRO } from './types'

const STORAGE_KEY = 'clipmind_clips'
const SETTINGS_KEY = 'clipmind_settings'

export interface ClipMindSettings {
  readonly maxHistory: number
  readonly enabledEnrichers: Record<string, boolean>
  readonly formatBeforePaste: boolean
}

const DEFAULT_SETTINGS: ClipMindSettings = {
  maxHistory: MAX_HISTORY_PRO,
  enabledEnrichers: {
    url: true,
    code: true,
    color: true,
    phone: true,
    email: true,
    date: true,
    address: true,
    name: true,
    text: true,
  },
  formatBeforePaste: false,
}

export async function getClips(): Promise<ClipItem[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    return (result[STORAGE_KEY] as ClipItem[] | undefined) ?? []
  } catch {
    return []
  }
}

export async function addClip(clip: ClipItem): Promise<void> {
  const clips = await getClips()
  const settings = await getSettings()

  const existing = clips.findIndex(c => c.raw === clip.raw)
  if (existing !== -1) {
    clips.splice(existing, 1)
  }

  clips.unshift(clip)

  const pinned = clips.filter(c => c.pinned)
  const unpinned = clips.filter(c => !c.pinned)

  while (unpinned.length + pinned.length > settings.maxHistory && unpinned.length > 0) {
    unpinned.pop()
  }

  const merged = [...pinned, ...unpinned].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.timestamp - a.timestamp
  })

  await safeSet(STORAGE_KEY, merged)
}

export async function updateClip(id: string, updates: Partial<ClipItem>): Promise<void> {
  const clips = await getClips()
  const index = clips.findIndex(c => c.id === id)
  if (index === -1) return

  const updated = [...clips]
  updated[index] = { ...updated[index], ...updates } as ClipItem
  await safeSet(STORAGE_KEY, updated)
}

export async function removeClip(id: string): Promise<void> {
  const clips = await getClips()
  const filtered = clips.filter(c => c.id !== id)
  await safeSet(STORAGE_KEY, filtered)
}

export async function pinClip(id: string, pinned: boolean): Promise<void> {
  await updateClip(id, { pinned })
}

export async function clearAllClips(): Promise<void> {
  await safeSet(STORAGE_KEY, [])
}

export async function getSettings(): Promise<ClipMindSettings> {
  try {
    const result = await chrome.storage.local.get(SETTINGS_KEY)
    const stored = result[SETTINGS_KEY] as Partial<ClipMindSettings> | undefined
    return { ...DEFAULT_SETTINGS, ...stored }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function updateSettings(updates: Partial<ClipMindSettings>): Promise<void> {
  const current = await getSettings()
  await safeSet(SETTINGS_KEY, { ...current, ...updates })
}

export async function exportClips(): Promise<string> {
  const clips = await getClips()
  return JSON.stringify(clips, null, 2)
}

export async function importClips(json: string): Promise<number> {
  const parsed = JSON.parse(json) as ClipItem[]
  if (!Array.isArray(parsed)) throw new Error('Invalid clip data')
  await safeSet(STORAGE_KEY, parsed)
  return parsed.length
}

async function safeSet(key: string, value: unknown): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: value })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('QUOTA_BYTES') || msg.includes('quota')) {
      const clips = await getClips()
      if (clips.length > 10) {
        const trimmed = clips.slice(0, Math.floor(clips.length * 0.75))
        await chrome.storage.local.set({ [key]: trimmed })
      }
    } else {
      throw error
    }
  }
}
