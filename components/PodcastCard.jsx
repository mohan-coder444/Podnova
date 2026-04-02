'use client'
/**
 * components/PodcastCard.jsx
 * Library card for a past podcast item with play / delete actions.
 */
import { motion } from 'framer-motion'
import { Play, Trash2, Clock, Tag } from 'lucide-react'
import { timeAgo, truncate, stringToColor, cn } from '@/lib/utils'

export default function PodcastCard({ podcast, onPlay, onDelete, index = 0 }) {
  const accentColor = stringToColor(podcast.title || podcast.topic)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="card-glass p-4 group cursor-pointer hover:border-nova-indigo/30 transition-all duration-200"
      onClick={() => onPlay?.(podcast)}
    >
      {/* Avatar + meta */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)` }}
          aria-hidden="true"
        >
          {(podcast.title || podcast.topic)?.[0]?.toUpperCase() || 'P'}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-nova-text leading-snug line-clamp-1 group-hover:text-nova-indigo transition-colors duration-200">
            {podcast.title || podcast.topic}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'status-pill text-xs',
              podcast.status === 'done'  && 'status-done',
              podcast.status === 'error' && 'status-error',
              (podcast.status === 'processing' || podcast.status?.includes('ing')) && 'status-processing',
            )}>
              {podcast.status === 'done' ? 'Ready' : podcast.status}
            </span>
            <div className="flex items-center gap-1 text-xs text-nova-dim">
              <Clock size={9} />
              {podcast.duration_minutes ? `${podcast.duration_minutes} min` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {podcast.topic && (
        <p className="mt-3 text-xs text-nova-dim leading-relaxed line-clamp-2">
          {truncate(podcast.topic, 100)}
        </p>
      )}

      {/* Keywords */}
      {podcast.keywords && (
        <div className="mt-2 flex flex-wrap gap-1">
          {podcast.keywords.split(',').slice(0, 3).map(k => (
            <span key={k} className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-nova-surface text-nova-dim">
              <Tag size={8} />
              {k.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-nova-border/20">
        <span className="text-xs text-nova-dim">{timeAgo(podcast.created_at)}</span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {podcast.status === 'done' && (
            <button
              onClick={e => { e.stopPropagation(); onPlay?.(podcast) }}
              className="w-7 h-7 rounded-lg bg-nova-indigo/20 flex items-center justify-center
                         hover:bg-nova-indigo/40 transition-colors duration-150 cursor-pointer"
              title="Play"
            >
              <Play size={12} className="text-nova-indigo ml-0.5" />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete?.(podcast.id) }}
            className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center
                       hover:bg-red-500/25 transition-colors duration-150 cursor-pointer"
            title="Delete"
          >
            <Trash2 size={12} className="text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
