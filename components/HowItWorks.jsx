'use client'
/**
 * components/HowItWorks.jsx
 * 4-step visual explanation of the AI pipeline.
 */
import { motion } from 'framer-motion'
import { PenLine, Sparkles, Mic2, Download } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: PenLine,
    title: 'Describe Your Topic',
    desc: 'Enter any podcast idea in plain English. Choose your style — conversational, educational, storytelling, and more.',
    color: 'from-blue-500 to-nova-indigo',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'AI Writes the Script',
    desc: 'Mistral AI generates a structured podcast script. HuggingFace enhances it for natural speech flow.',
    color: 'from-nova-indigo to-nova-purple',
  },
  {
    num: '03',
    icon: Mic2,
    title: 'Voice Synthesis',
    desc: 'ElevenLabs converts every script segment into professional-quality audio using neural voice cloning.',
    color: 'from-nova-purple to-nova-orange',
  },
  {
    num: '04',
    icon: Download,
    title: 'Download & Share',
    desc: 'Your podcast is merged, stored, and ready to play instantly — or download as an MP3 to publish anywhere.',
    color: 'from-nova-orange to-nova-amber',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-4" aria-labelledby="how-heading">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 id="how-heading" className="text-3xl sm:text-4xl font-bold text-nova-text mb-4">
            How Podnova Works
          </h2>
          <p className="text-nova-muted max-w-xl mx-auto">
            A 4-step AI pipeline that transforms your idea into a broadcast-quality podcast.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-glass p-5 relative overflow-hidden group"
              >
                {/* Number watermark */}
                <span className="absolute top-3 right-4 text-5xl font-black text-white/4 select-none pointer-events-none">
                  {step.num}
                </span>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-nova`}>
                  <Icon size={18} className="text-white" />
                </div>

                <h3 className="font-semibold text-nova-text mb-2 text-sm leading-snug">{step.title}</h3>
                <p className="text-xs text-nova-muted leading-relaxed">{step.desc}</p>

                {/* Connector arrow (hide on last) */}
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M1 7h12M7 1l6 6-6 6" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
