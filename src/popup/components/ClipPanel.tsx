import { ScrollArea } from '../../components/ui/scroll-area'
import { useClipStore } from '../../stores/clipStore'
import { ClipItemCard } from './ClipItem'
import { AnimatePresence, motion } from 'framer-motion'
import { Clipboard } from 'lucide-react'

export function ClipPanel() {
  const filteredClips = useClipStore(s => s.filteredClips)
  const clips = filteredClips().filter(c => !c.pinned)

  if (clips.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 px-8">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Clipboard className="w-6 h-6 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium">No clips yet</p>
          <p className="text-[10px] mt-1 opacity-60">
            Copy something on any page and it will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-3 pb-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {clips.map((clip, index) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{
                duration: 0.2,
                delay: index * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ClipItemCard clip={clip} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  )
}
