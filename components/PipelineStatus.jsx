'use client'
/**
 * components/PipelineStatus.jsx
 * Animated step-by-step pipeline progress display.
 * Shows real-time stages: Script → Enhance → TTS → Merge → Upload
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, FileText, Zap, Mic2, Music2, CloudUpload } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'generating_script',   icon: FileText,    label: 'Generating Script',    desc: 'Mistral AI crafting your podcast' },
  { key: 'enhancing',           icon: Zap,         label: 'Enhancing Script',     desc: 'HuggingFace refining the flow' },
  { key: 'synthesizing',        icon: Mic2,        label: 'Voice Synthesis',      desc: 'ElevenLabs narrating segments' },
  { key: 'processing_audio',    icon: Music2,      label: 'Audio Processing',     desc: 'Merging audio segments' },
  { key: 'uploading',           icon: CloudUpload, label: 'Uploading',            desc: 'Saving to InsForge Storage' },
]

function Waveform() {
  return (
    <div className="flex items-end gap-0.5 h-6" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="wave-bar bg-nova-indigo"
          style={{
            height: `${Math.random() * 60 + 20}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function PipelineStatus({ status, step }) {
  if (!status || status === 'idle') return null

  const currentStepIdx = STEPS.findIndex(s => s.key === status)
  const isDone  = status === 'done'
  const isError = status === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="card-glass p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-nova-text">
              {isDone ? 'Podcast Ready!' : isError ? 'Pipeline Error' : 'Generating Your Podcast'}
            </h3>
            <p className="text-sm text-nova-muted mt-0.5">
              {isDone ? 'Your AI podcast has been created' : step || 'Processing...'}
            </p>
          </div>
          {!isDone && !isError && <Waveform />}
          {isDone && (
            <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/30">
              <Check size={18} className="text-green-400" />
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            let state = 'idle'
            if (isDone || idx < currentStepIdx) state = 'done'
            else if (idx === currentStepIdx && !isDone) state = 'active'

            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-xl border transition-all duration-300',
                  state === 'active' && 'bg-nova-indigo/10 border-nova-indigo/30',
                  state === 'done'   && 'bg-nova-surface/50 border-nova-border/30',
                  state === 'idle'   && 'border-transparent opacity-40',
                )}
              >
                {/* Icon slot */}
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  state === 'active' && 'bg-nova-indigo/20',
                  state === 'done'   && 'bg-green-400/15',
                  state === 'idle'   && 'bg-nova-surface',
                )}>
                  {state === 'active' && <Loader2 size={16} className="text-nova-indigo animate-spin" />}
                  {state === 'done'   && <Check size={16} className="text-green-400" />}
                  {state === 'idle'   && <Icon size={16} className="text-nova-dim" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    state === 'active' && 'text-nova-indigo',
                    state === 'done'   && 'text-nova-text',
                    state === 'idle'   && 'text-nova-dim',
                  )}>
                    {s.label}
                  </p>
                  <p className="text-xs text-nova-dim truncate">{s.desc}</p>
                </div>

                {/* Progress pulse for active */}
                {state === 'active' && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-nova-indigo animate-pulse-slow"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
                {state === 'done' && (
                  <span className="text-xs text-green-400 font-medium">Done</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Overall progress bar */}
        {!isDone && !isError && (
          <div className="mt-5">
            <div className="h-1 bg-nova-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-nova-indigo to-nova-purple rounded-full"
                animate={{ width: `${Math.max(5, ((currentStepIdx + 1) / STEPS.length) * 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
