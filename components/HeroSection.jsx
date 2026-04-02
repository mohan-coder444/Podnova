'use client'
/**
 * components/HeroSection.jsx
 * Landing hero with animated headline, stat counters, and feature chips.
 */
import { motion } from 'framer-motion'
import { Mic2, Zap, Globe, Headphones } from 'lucide-react'

const FEATURES = [
  { icon: Mic2,       label: 'Script Generation',  sub: 'Mistral AI'     },
  { icon: Zap,        label: 'Voice Synthesis',     sub: 'ElevenLabs'     },
  { icon: Globe,      label: 'Script Enhancement',  sub: 'HuggingFace'    },
  { icon: Headphones, label: 'Audio Processing',    sub: 'Pure WebAudio'  },
]

const STATS = [
  { value: '< 2 min', label: 'Avg. generation time' },
  { value: '5+ styles', label: 'Podcast styles' },
  { value: '99.9%', label: 'Pipeline uptime' },
]

export default function HeroSection() {
  return (
    <section className="relative pt-36 pb-20 px-4" aria-label="Hero">
      {/* Background glow orbs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-nova-indigo/8 blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full bg-nova-purple/8 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                     border border-nova-indigo/30 bg-nova-indigo/10 text-nova-indigo
                     text-sm font-medium mb-6"
        >
          <Zap size={13} className="animate-pulse-slow" />
          AI-Powered Podcast Generation
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
        >
          Turn Ideas Into
          <span className="block text-transparent bg-clip-text bg-ai-gradient">
            Podcasts Instantly
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-nova-muted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Describe your topic. Podnova writes the script, enhances it with AI,
          and narrates it with a professional voice — all in under 2 minutes.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-nova-text">{s.value}</div>
              <div className="text-xs text-nova-dim mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl card-glass text-sm"
            >
              <div className="w-6 h-6 rounded-md bg-nova-indigo/20 flex items-center justify-center">
                <Icon size={12} className="text-nova-indigo" />
              </div>
              <div className="text-left">
                <div className="text-nova-text font-medium text-xs">{label}</div>
                <div className="text-nova-dim text-xs">{sub}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
