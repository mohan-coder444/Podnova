'use client'
/**
 * components/PromptInput.jsx
 * The main podcast generation input form.
 * Options: topic, duration, style, voice.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Mic2, Clock, Sliders } from 'lucide-react'
import { cn } from '@/lib/utils'

const STYLE_OPTIONS = [
  { value: 'conversational', label: 'Conversational', desc: 'Natural, friendly talk' },
  { value: 'educational',    label: 'Educational',    desc: 'Structured & informative' },
  { value: 'storytelling',   label: 'Storytelling',   desc: 'Narrative, captivating' },
  { value: 'interview',      label: 'Interview',      desc: 'Q&A format' },
  { value: 'documentary',    label: 'Documentary',    desc: 'Deep-dive reporting' },
]

const DURATION_OPTIONS = [3, 5, 10, 15, 20]

const EXAMPLE_PROMPTS = [
  'The future of AI in healthcare',
  'Why sleep is the ultimate productivity hack',
  'How blockchain is changing supply chains',
  'The psychology of habit formation',
  'Electric vehicles: myths vs reality',
]

export default function PromptInput({ onGenerate, isLoading }) {
  const [topic, setTopic]     = useState('')
  const [duration, setDuration] = useState(5)
  const [style, setStyle]     = useState('conversational')
  const [showOptions, setShowOptions] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!topic.trim() || isLoading) return
    onGenerate({ topic: topic.trim(), duration, style })
  }

  const charCount = topic.length
  const maxChars  = 500

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main textarea */}
        <div className="card-glass p-1.5">
          <div className="relative">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value.slice(0, maxChars))}
              placeholder="What should your podcast be about? Describe your topic, angle, or idea..."
              disabled={isLoading}
              rows={4}
              className="input-nova resize-none min-h-[120px] text-base leading-relaxed
                         rounded-xl border-0 focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Podcast topic"
            />
            <div className="absolute bottom-3 right-3 text-xs text-nova-dim">
              {charCount}/{maxChars}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-2 py-2 gap-3">
            {/* Options toggle */}
            <button
              type="button"
              onClick={() => setShowOptions(v => !v)}
              className="flex items-center gap-1.5 text-sm text-nova-muted hover:text-nova-text
                         transition-colors duration-200 cursor-pointer"
              aria-expanded={showOptions}
            >
              <Sliders size={14} />
              Options
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', showOptions && 'rotate-180')}
              />
            </button>

            {/* Quick info badges */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="status-pill bg-nova-surface text-nova-muted">
                <Clock size={10} />
                {duration} min
              </span>
              <span className="status-pill bg-nova-surface text-nova-muted">
                <Mic2 size={10} />
                {style}
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="btn-primary py-2.5 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generate Podcast
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              key="options"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="card-glass p-5 grid sm:grid-cols-2 gap-5">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-nova-muted uppercase tracking-wider mb-3">
                    Duration
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                          duration === d
                            ? 'bg-nova-indigo text-white shadow-glow-indigo'
                            : 'bg-nova-surface text-nova-muted hover:text-nova-text hover:bg-nova-card'
                        )}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-xs font-semibold text-nova-muted uppercase tracking-wider mb-3">
                    Style
                  </label>
                  <div className="space-y-2">
                    {STYLE_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStyle(s.value)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left',
                          style === s.value
                            ? 'bg-nova-indigo/20 text-nova-indigo border border-nova-indigo/30'
                            : 'bg-nova-surface text-nova-muted hover:text-nova-text hover:bg-nova-card'
                        )}
                      >
                        <span className="font-medium">{s.label}</span>
                        <span className="text-xs opacity-70">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example prompts */}
        {!topic && (
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-nova-dim">Try:</span>
            {EXAMPLE_PROMPTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setTopic(p)}
                className="text-xs px-3 py-1 rounded-full border border-nova-border text-nova-muted
                           hover:border-nova-indigo/50 hover:text-nova-text transition-all duration-200 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
