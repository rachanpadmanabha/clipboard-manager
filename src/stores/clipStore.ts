import { create } from 'zustand'
import type { ClipItem, ClipType } from '../shared/types'
import { getClips, removeClip as storageRemoveClip, pinClip as storagePinClip } from '../shared/storage'

interface ClipStore {
  clips: ClipItem[]
  searchQuery: string
  activeFilters: ClipType[]
  selectedClipId: string | null

  loadClips: () => Promise<void>
  setClips: (clips: ClipItem[]) => void
  removeClip: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  setSearch: (query: string) => void
  toggleFilter: (type: ClipType) => void
  selectClip: (id: string | null) => void

  filteredClips: () => ClipItem[]
}

export const useClipStore = create<ClipStore>((set, get) => ({
  clips: [],
  searchQuery: '',
  activeFilters: [],
  selectedClipId: null,

  loadClips: async () => {
    const clips = await getClips()
    set({ clips })
  },

  setClips: (clips: ClipItem[]) => {
    set({ clips })
  },

  removeClip: async (id: string) => {
    await storageRemoveClip(id)
    set(state => ({ clips: state.clips.filter(c => c.id !== id) }))
  },

  togglePin: async (id: string) => {
    const clip = get().clips.find(c => c.id === id)
    if (!clip) return
    await storagePinClip(id, !clip.pinned)
    set(state => ({
      clips: state.clips.map(c =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      ),
    }))
  },

  setSearch: (query: string) => {
    set({ searchQuery: query })
  },

  toggleFilter: (type: ClipType) => {
    set(state => ({
      activeFilters: state.activeFilters.includes(type)
        ? state.activeFilters.filter(f => f !== type)
        : [...state.activeFilters, type],
    }))
  },

  selectClip: (id: string | null) => {
    set({ selectedClipId: id })
  },

  filteredClips: () => {
    const { clips, searchQuery, activeFilters } = get()

    return clips.filter(clip => {
      if (activeFilters.length > 0 && !activeFilters.includes(clip.type)) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return clip.raw.toLowerCase().includes(q)
      }

      return true
    })
  },
}))
