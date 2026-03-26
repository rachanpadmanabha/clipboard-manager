import { useState, useCallback } from 'react'
import { ArrowLeft, Copy, Check, ExternalLink, MapPin, User } from 'lucide-react'
import { useClipStore } from '../../stores/clipStore'
import type { ClipItem } from '../../shared/types'
import { CLIP_TYPE_LABELS, CLIP_TYPE_COLORS } from '../../shared/types'
import { cn } from '../../lib/utils'

interface ClipItemDetailProps {
  readonly clip: ClipItem
}

export function ClipItemDetail({ clip }: ClipItemDetailProps) {
  const [copied, setCopied] = useState(false)
  const selectClip = useClipStore(s => s.selectClip)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(clip.raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // handled by offscreen
    }
  }, [clip.raw])

  return (
    <div className="flex flex-col h-[560px] w-[380px] bg-background overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <button
          onClick={() => selectClip(null)}
          className="p-1 -ml-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90"
          style={{ backgroundColor: CLIP_TYPE_COLORS[clip.type] }}
        >
          {CLIP_TYPE_LABELS[clip.type]}
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto">
          {new Date(clip.timestamp).toLocaleString()}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Raw Content
          </h3>
          <div className="glass-panel rounded-lg p-3">
            <pre className={cn(
              'text-xs whitespace-pre-wrap break-all leading-relaxed',
              clip.type === 'code' ? 'font-mono text-emerald-300/80' : 'text-foreground/80'
            )}>
              {clip.raw}
            </pre>
          </div>
        </section>

        {clip.type === 'color' && clip.raw.startsWith('#') && (
          <section>
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Preview
            </h3>
            <div
              className="w-full h-16 rounded-lg border border-white/10"
              style={{ backgroundColor: clip.raw }}
            />
          </section>
        )}

        {clip.enriched && (
          <section>
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Enriched Data
            </h3>
            <div className="glass-panel rounded-lg p-3 space-y-2">
              <EnrichedView clip={clip} />
            </div>
          </section>
        )}

        {clip.sourceUrl && (
          <section>
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Source
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {clip.sourceUrl}
            </p>
          </section>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border/50">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
    </div>
  )
}

function EnrichedView({ clip }: { readonly clip: ClipItem }) {
  const enriched = clip.enriched
  if (!enriched) return null

  switch (enriched.type) {
    case 'url':
      return (
        <div className="space-y-1.5">
          <DataRow label="Title" value={enriched.data.title} />
          <DataRow label="Description" value={enriched.data.description} />
          {enriched.data.favicon && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-20 shrink-0">Favicon</span>
              <img src={enriched.data.favicon} alt="" className="w-4 h-4 rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
          <a href={clip.raw} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1">
            Open link <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )
    case 'code':
      return (
        <div className="space-y-1.5">
          <DataRow label="Language" value={enriched.data.language} />
          <DataRow label="Lines" value={String(enriched.data.lineCount)} />
          {enriched.data.firstSymbol && <DataRow label="Symbol" value={enriched.data.firstSymbol} />}
        </div>
      )
    case 'color':
      return (
        <div className="space-y-1.5">
          <DataRow label="HEX" value={enriched.data.hex} />
          <DataRow label="RGB" value={enriched.data.rgb} />
          <DataRow label="HSL" value={enriched.data.hsl} />
        </div>
      )
    case 'phone':
      return (
        <div className="space-y-1.5">
          <DataRow label="E.164" value={enriched.data.e164} />
          <DataRow label="Local" value={enriched.data.local} />
          <DataRow label="Country" value={enriched.data.country} />
        </div>
      )
    case 'email':
      return (
        <div className="space-y-1.5">
          <DataRow label="Name" value={enriched.data.namePart} />
          <DataRow label="Domain" value={enriched.data.domain} />
        </div>
      )
    case 'date':
      return (
        <div className="space-y-1.5">
          <DataRow label="ISO" value={enriched.data.iso} />
          <DataRow label="Relative" value={enriched.data.relative} />
        </div>
      )
    case 'address':
      return (
        <div className="space-y-1.5">
          {enriched.data.city && <DataRow label="City" value={enriched.data.city} />}
          {enriched.data.country && <DataRow label="Country" value={enriched.data.country} />}
          <a href={enriched.data.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1">
            Open in Maps <MapPin className="w-3 h-3" />
          </a>
        </div>
      )
    case 'name':
      return (
        <a href={enriched.data.linkedInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
          Search on LinkedIn <User className="w-3 h-3" />
        </a>
      )
    case 'number':
      return <DataRow label="Formatted" value={enriched.data.formatted} />
    case 'text':
      return (
        <div className="space-y-1.5">
          <DataRow label="Words" value={String(enriched.data.wordCount)} />
          <DataRow label="Reading" value={enriched.data.readingTime} />
          <DataRow label="Language" value={enriched.data.detectedLanguage} />
        </div>
      )
    default:
      return null
  }
}

function DataRow({ label, value }: { readonly label: string; readonly value: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-[10px] text-foreground/80 font-mono break-all">{value}</span>
    </div>
  )
}
