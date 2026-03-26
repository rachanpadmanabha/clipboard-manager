import { useEffect } from 'react'
import { useClipStore } from '../stores/clipStore'
import { SearchBar } from './components/SearchBar'
import { TypeFilter } from './components/TypeFilter'
import { Pinned } from './components/Pinned'
import { ClipPanel } from './components/ClipPanel'
import { ClipItemDetail } from './components/ClipItemDetail'
import { Clipboard } from 'lucide-react'

export function App() {
  const loadClips = useClipStore(s => s.loadClips)
  const setClips = useClipStore(s => s.setClips)
  const selectedClipId = useClipStore(s => s.selectedClipId)
  const clips = useClipStore(s => s.clips)
  const selectedClip = clips.find(c => c.id === selectedClipId) ?? null

  useEffect(() => {
    loadClips()

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes['clipmind_clips']) {
        const newClips = changes['clipmind_clips'].newValue
        if (Array.isArray(newClips)) {
          setClips(newClips)
        }
      }
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') handleStorageChange(changes)
    })
  }, [loadClips, setClips])

  if (selectedClip) {
    return <ClipItemDetail clip={selectedClip} />
  }

  return (
    <div className="flex flex-col h-[560px] w-[380px] bg-background overflow-hidden">
      <header className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Clipboard className="w-3.5 h-3.5 text-primary" />
          </div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            ClipMind
          </h1>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
          {clips.length} items
        </span>
      </header>

      <SearchBar />
      <TypeFilter />
      <Pinned />
      <ClipPanel />
    </div>
  )
}
