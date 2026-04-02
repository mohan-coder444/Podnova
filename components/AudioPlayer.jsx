'use client'
/**
 * components/AudioPlayer.jsx
 * Custom audio player for generated podcast output.
 * Features: play/pause, progress bar, time display, download button.
 */
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Download, Volume2, SkipBack, SkipForward } from 'lucide-react'
import { formatDuration, cn } from '@/lib/utils'

function WaveformDisplay({ isPlaying }) {
  return (
    <div className="flex items-center gap-0.5 h-8" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => {
        const h = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 20
        return (
          <span
            key={i}
            className={cn(
              'w-0.5 rounded-full transition-all duration-300',
              isPlaying ? 'bg-nova-indigo animate-waveform' : 'bg-nova-border',
            )}
            style={{
              height: `${h}%`,
              animationDelay: isPlaying ? `${(i % 12) * 0.1}s` : '0s',
            }}
          />
        )
      })}
    </div>
  )
}

export default function AudioPlayer({ podcast }) {
  const audioRef    = useRef(null)
  const [playing, setPlaying]       = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]     = useState(0)
  const [volume, setVolume]         = useState(1)
  const [loaded, setLoaded]         = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate  = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => { setDuration(audio.duration); setLoaded(true) }
    const onEnded       = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onDurationChange)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  const seek = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = ratio * duration
  }

  const skip = (sec) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + sec))
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!podcast?.audio_url) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-glass p-6 w-full max-w-3xl mx-auto"
    >
      <audio ref={audioRef} src={podcast.audio_url} preload="metadata" />

      {/* Episode info */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="status-done mb-2">Ready to play</div>
            <h3 className="font-semibold text-nova-text text-lg leading-snug line-clamp-2">{podcast.title}</h3>
            {podcast.description && (
              <p className="text-sm text-nova-muted mt-1 line-clamp-2">{podcast.description}</p>
            )}
          </div>
          {/* Album art avatar */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-nova-indigo to-nova-purple flex-shrink-0 flex items-center justify-center shadow-glow-indigo">
            <Volume2 size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-4">
        <WaveformDisplay isPlaying={playing} />
      </div>

      {/* Progress bar */}
      <div
        role="slider"
        aria-label="Audio progress"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        tabIndex={0}
        className="relative h-2 bg-nova-surface rounded-full cursor-pointer mb-3 group"
        onClick={seek}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') skip(5)
          if (e.key === 'ArrowLeft')  skip(-5)
        }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-nova-indigo to-nova-purple rounded-full"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </motion.div>
      </div>

      {/* Time */}
      <div className="flex justify-between text-xs text-nova-dim mb-5">
        <span>{formatDuration(currentTime)}</span>
        <span>{loaded ? formatDuration(duration) : `~${podcast.duration_minutes} min`}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Skip back */}
          <button
            onClick={() => skip(-15)}
            className="w-9 h-9 rounded-lg bg-nova-surface flex items-center justify-center
                       hover:bg-nova-card transition-colors duration-200 cursor-pointer"
            title="Skip back 15s"
          >
            <SkipBack size={16} className="text-nova-muted" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-nova-orange to-nova-amber
                       flex items-center justify-center shadow-glow-orange
                       hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing
              ? <Pause size={20} className="text-white" />
              : <Play size={20} className="text-white ml-0.5" />
            }
          </button>

          {/* Skip forward */}
          <button
            onClick={() => skip(30)}
            className="w-9 h-9 rounded-lg bg-nova-surface flex items-center justify-center
                       hover:bg-nova-card transition-colors duration-200 cursor-pointer"
            title="Skip forward 30s"
          >
            <SkipForward size={16} className="text-nova-muted" />
          </button>
        </div>

        {/* Volume + Download */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Volume2 size={14} className="text-nova-muted flex-shrink-0" />
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={volume}
              onChange={e => {
                const v = Number(e.target.value)
                setVolume(v)
                if (audioRef.current) audioRef.current.volume = v
              }}
              className="w-20 accent-nova-indigo cursor-pointer"
              aria-label="Volume"
            />
          </div>
          <a
            href={podcast.audio_url}
            download={`${podcast.title || 'podcast'}.mp3`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-nova-surface
                       text-nova-muted hover:text-nova-text hover:bg-nova-card
                       transition-colors duration-200 cursor-pointer text-sm"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
