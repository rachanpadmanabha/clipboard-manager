import { useClipStore } from '../../stores/clipStore'
import type { ClipType } from '../../shared/types'
import { CLIP_TYPE_LABELS, CLIP_TYPE_COLORS } from '../../shared/types'
import { cn } from '../../lib/utils'

const ALL_TYPES: ClipType[] = ['url', 'email', 'phone', 'color', 'code', 'date', 'address', 'name', 'number', 'text']

export function TypeFilter() {
  const activeFilters = useClipStore(s => s.activeFilters)
  const toggleFilter = useClipStore(s => s.toggleFilter)

  return (
    <div className="px-3 pb-2">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
        {ALL_TYPES.map(type => {
          const isActive = activeFilters.includes(type)
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={cn(
                'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border',
                isActive
                  ? 'border-transparent text-white'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
              )}
              style={isActive ? {
                backgroundColor: CLIP_TYPE_COLORS[type],
                opacity: 0.9,
              } : undefined}
            >
              {CLIP_TYPE_LABELS[type]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
