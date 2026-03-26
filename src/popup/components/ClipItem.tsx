import { useCallback, useState } from 'react'
import { Pin, Trash2, Copy, Check } from 'lucide-react'
import { useClipStore } from '../../stores/clipStore'
import type { ClipItem } from '../../shared/types'
import { CLIP_TYPE_LABELS, CLIP_TYPE_COLORS } from '../../shared/types'
import { cn } from '../../lib/utils'

interface ClipItemCardProps {
  readonly clip: ClipItem
}

const GLOW_CLASSES: Record<string, string> = {
  url: 'clip-glow-url',
  code: 'clip-glow-code',
  phone: 'clip-glow-phone',
  email: 'clip-glow-email',
  date: 'clip-glow-date',
  address: 'clip-glow-address',
  name: 'clip-glow-name',
  color: 'clip-glow-color',
  number: 'clip-glow-number',
}

export function ClipItemCard({ clip }: ClipItemCardProps) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const removeClip = useClipStore(s => s.removeClip)
  const togglePin = useClipStore(s => s.togglePin)
  const selectClip = useClipStore(s => s.selectClip)

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(clip.raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback handled by offscreen
    }
  }, [clip.raw])

  const handlePin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    togglePin(clip.id)
  }, [clip.id, togglePin])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    removeClip(clip.id)
  }, [clip.id, removeClip])

  const timeAgo = getTimeAgo(clip.timestamp)
  const isCode = clip.type === 'code'
  const glowClass = GLOW_CLASSES[clip.type] ?? ''

  return (
    <div
      className={cn(
        'group relative rounded-lg glass-panel glass-panel-hover cursor-pointer transition-all duration-150 p-2.5',
        glowClass
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectClip(clip.id)}
    >
      <div className="flex items-start gap-2">
        <span
          className="shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90"
          style={{ backgroundColor: CLIP_TYPE_COLORS[clip.type] }}
        >
          {CLIP_TYPE_LABELS[clip.type]}
        </span>

        <div className="flex-1 min-w-0">
          {clip.type === 'color' && clip.raw.startsWith('#') && (
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-4 h-4 rounded-sm border border-white/10"
                style={{ backgroundColor: clip.raw }}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{clip.raw}</span>
            </div>
          )}

          {clip.type !== 'color' && (
            <p className={cn(
              'text-[11px] leading-relaxed line-clamp-2 break-all',
              isCode ? 'font-mono text-emerald-300/80' : 'text-foreground/80'
            )}>
              {clip.raw}
            </p>
          )}
        </div>

        <div className={cn(
          'flex items-center gap-0.5 shrink-0 transition-opacity duration-100',
          hovered ? 'opacity-100' : 'opacity-0'
        )}>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={handlePin}
            className={cn(
              'p-1 rounded hover:bg-white/10 transition-colors',
              clip.pinned ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
            )}
            title={clip.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-muted-foreground/60 font-mono">{timeAgo}</span>
        {clip.enriched && (
          <span className="text-[9px] text-primary/60">enriched</span>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
