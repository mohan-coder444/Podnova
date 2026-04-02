'use client'
/**
 * components/Footer.jsx
 * Site footer with links and tech stack credits.
 */
import { Mic2, ExternalLink } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-nova-border/30 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nova-indigo to-nova-purple flex items-center justify-center">
              <Mic2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Pod<span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-indigo to-nova-purple">nova</span>
            </span>
          </div>

          {/* Stack badges */}
          <div className="flex flex-wrap justify-center gap-2 text-xs text-nova-dim">
            {['Next.js 15', 'InsForge', 'Mistral AI', 'ElevenLabs', 'HuggingFace'].map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-nova-surface border border-nova-border/40">
                {t}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-nova-dim">
            <a
              href="https://github.com/mohan-coder444/Podnova"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-nova-text transition-colors duration-200 cursor-pointer"
            >
              <ExternalLink size={13} />
              GitHub
            </a>
            <span className="opacity-40">|</span>
            <span>© {year} Podnova</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
