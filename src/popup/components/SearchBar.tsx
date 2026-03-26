import { Search } from 'lucide-react'
import { useClipStore } from '../../stores/clipStore'

export function SearchBar() {
  const searchQuery = useClipStore(s => s.searchQuery)
  const setSearch = useClipStore(s => s.setSearch)

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel focus-within:ring-1 focus-within:ring-primary/40 transition-all">
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search clipboard history..."
          value={searchQuery}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearch('')}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
