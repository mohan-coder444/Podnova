'use client'
/**
 * app/page.js
 * Root page — orchestrates the full Podnova experience.
 * State: topic input → pipeline status → result (player + script).
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar         from '@/components/Navbar'
import HeroSection    from '@/components/HeroSection'
import PromptInput    from '@/components/PromptInput'
import PipelineStatus from '@/components/PipelineStatus'
import AudioPlayer    from '@/components/AudioPlayer'
import ScriptViewer   from '@/components/ScriptViewer'
import PodcastCard    from '@/components/PodcastCard'
import HowItWorks     from '@/components/HowItWorks'
import Footer         from '@/components/Footer'
import { AlertCircle, Library, RefreshCw, Zap } from 'lucide-react'

// Simple in-memory user ID for demo (replace with real auth later)
const DEMO_USER = 'demo-user-001'

export default function HomePage() {
  const [status,  setStatus]  = useState('idle')  // idle | generating_script | enhancing | synthesizing | processing_audio | uploading | done | error
  const [step,    setStep]    = useState('')
  const [podcast, setPodcast] = useState(null)
  const [error,   setError]   = useState(null)
  const [history, setHistory] = useState([])
  const [selectedPodcast, setSelectedPodcast] = useState(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  // ── Generate pipeline ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(async ({ topic, duration, style }) => {
    setStatus('generating_script')
    setStep('Connecting to AI pipeline…')
    setError(null)
    setPodcast(null)
    setSelectedPodcast(null)

    // Status polling via SSE-like simulation (real status comes from the API response)
    const statusSequence = [
      { status: 'generating_script', step: 'Script generation',  delay: 100   },
      { status: 'enhancing',         step: 'Enhancing script',   delay: 5000  },
      { status: 'synthesizing',      step: 'Voice synthesis',     delay: 12000 },
      { status: 'processing_audio',  step: 'Audio processing',   delay: 20000 },
      { status: 'uploading',         step: 'Uploading audio',     delay: 25000 },
    ]
    const timers = statusSequence.map(({ status, step, delay }) =>
      setTimeout(() => { setStatus(status); setStep(step) }, delay)
    )

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration, style, userId: DEMO_USER }),
      })

      timers.forEach(clearTimeout) // Cancel simulated steps
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Generation failed')
      }

      setStatus('done')
      setStep('Complete')
      setPodcast(data.podcast)
      setHistory(prev => [data.podcast, ...prev])
    } catch (err) {
      timers.forEach(clearTimeout)
      setStatus('error')
      setError(err.message)
    }
  }, [])

  // ── Load history ───────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    try {
      const res  = await fetch(`/api/podcasts?userId=${DEMO_USER}`)
      const data = await res.json()
      if (data.success) setHistory(data.podcasts || [])
      setHistoryLoaded(true)
    } catch { /* non-fatal */ }
  }, [historyLoaded])

  // ── Delete podcast ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    setHistory(prev => prev.filter(p => p.id !== id))
    if (selectedPodcast?.id === id) setSelectedPodcast(null)
    await fetch(`/api/podcasts?id=${id}`, { method: 'DELETE' })
  }, [selectedPodcast])

  const isLoading = !['idle', 'done', 'error'].includes(status)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* ── Generate Section ── */}
      <section id="generate" className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-nova-orange/20 flex items-center justify-center">
              <Zap size={13} className="text-nova-orange" />
            </div>
            <h2 className="text-lg font-semibold text-nova-text">Generate a Podcast</h2>
          </div>

          {/* Input */}
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />

          {/* Pipeline status */}
          <AnimatePresence mode="wait">
            {(isLoading || status === 'done') && !error && (
              <PipelineStatus key={`pipeline-${status}`} status={status} step={step} />
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card-glass p-5 border-red-500/30 bg-red-500/5"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-300 text-sm">Generation Failed</p>
                    <p className="text-xs text-red-400/80 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => { setStatus('idle'); setError(null) }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/15
                               text-red-300 hover:bg-red-500/25 transition-colors duration-200 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    Retry
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results (Audio + Script) */}
          <AnimatePresence>
            {status === 'done' && podcast && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <AudioPlayer  podcast={podcast} />
                <ScriptViewer podcast={podcast} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected from history */}
          <AnimatePresence>
            {selectedPodcast && !podcast && (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setSelectedPodcast(null)}
                  className="text-xs text-nova-dim hover:text-nova-text transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <AudioPlayer  podcast={selectedPodcast} />
                <ScriptViewer podcast={selectedPodcast} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Library Section ── */}
      <section id="library" className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-nova-purple/20 flex items-center justify-center">
                <Library size={13} className="text-nova-purple" />
              </div>
              <h2 className="text-lg font-semibold text-nova-text">Your Library</h2>
              {history.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-nova-surface text-nova-dim">
                  {history.length}
                </span>
              )}
            </div>
            <button
              onClick={loadHistory}
              className="text-xs text-nova-muted hover:text-nova-text transition-colors duration-200 cursor-pointer
                         flex items-center gap-1.5"
            >
              <RefreshCw size={11} />
              Load from DB
            </button>
          </div>

          {history.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-nova-surface flex items-center justify-center mx-auto mb-4">
                <Library size={24} className="text-nova-dim" />
              </div>
              <p className="text-nova-muted font-medium">No podcasts yet</p>
              <p className="text-nova-dim text-sm mt-1">
                Generate your first podcast to see it here.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((p, i) => (
                <PodcastCard
                  key={p.id}
                  podcast={p}
                  index={i}
                  onPlay={setSelectedPodcast}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      <Footer />
    </div>
  )
}
