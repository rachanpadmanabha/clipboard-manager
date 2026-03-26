import { useClipStore } from '../../stores/clipStore'
import { ClipItemCard } from './ClipItem'
import { motion } from 'framer-motion'
import { Pin } from 'lucide-react'

export function Pinned() {
  const filteredClips = useClipStore(s => s.filteredClips)
  const pinnedClips = filteredClips().filter(c => c.pinned)

  if (pinnedClips.length === 0) return null

  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Pin className="w-3 h-3 text-amber-400" />
        <span className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider">
          Pinned
        </span>
      </div>
      <div className="space-y-1.5">
        {pinnedClips.map(clip => (
          <motion.div
            key={clip.id}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(245, 158, 11, 0)',
                '0 0 8px 2px rgba(245, 158, 11, 0.1)',
                '0 0 0 0 rgba(245, 158, 11, 0)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="rounded-lg"
          >
            <ClipItemCard clip={clip} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
