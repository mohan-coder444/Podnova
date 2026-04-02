'use client'
/**
 * components/ScriptViewer.jsx
 * Displays the generated podcast script in a structured, readable format.
 * Shows segments by type with speaker labels.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEGMENT_COLORS = {
  intro:  'text-nova-indigo border-nova-indigo/30 bg-nova-indigo/5',
  main:   'text-nova-text border-nova-border/30 bg-transparent',
  outro:  'text-nova-orange border-nova-orange/30 bg-nova-orange/5',
}

export default function ScriptViewer({ podcast }) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)

  if (!podcast?.script) return null

  let segments = null
  try {
    const parsed = JSON.parse(podcast.script_json || '{}')
    segments = parsed.segments
  } catch { /* use raw script */ }

  const copyScript = async () => {
    await navigator.clipboard.writeText(podcast.script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card-glass w-full max-w-3xl mx-auto overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer
                   hover:bg-nova-surface/30 transition-colors duration-200"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-surface flex items-center justify-center">
            <FileText size={15} className="text-nova-muted" />
          </div>
          <div>
            <p className="font-medium text-nova-text text-sm">Podcast Script</p>
            <p className="text-xs text-nova-dim">{segments?.length || '—'} segments</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); copyScript() }}
            className="flex items-center gap-1.5 text-xs text-nova-muted hover:text-nova-text
                       px-3 py-1.5 rounded-lg bg-nova-surface hover:bg-nova-card
                       transition-all duration-200 cursor-pointer"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <ChevronDown
            size={16}
            className={cn('text-nova-dim transition-transform duration-200', open && 'rotate-180')}
          />
        </div>
      </button>

      {/* Script content */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="script"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-nova-border/30"
          >
            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {segments ? (
                segments.map((seg, i) => (
                  <motion.div
                    key={seg.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'border rounded-xl p-4',
                      SEGMENT_COLORS[seg.type] || SEGMENT_COLORS.main
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                        {seg.type}
                      </span>
                      {seg.speaker && (
                        <span className="text-xs opacity-50">• {seg.speaker}</span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-nova-text/90">{seg.text}</p>
                  </motion.div>
                ))
              ) : (
                <pre className="text-sm text-nova-muted leading-relaxed whitespace-pre-wrap font-mono">
                  {podcast.script}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
