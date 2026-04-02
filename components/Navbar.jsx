'use client'
/**
 * components/Navbar.jsx
 * Floating glassmorphic top navigation bar.
 */
import { motion } from 'framer-motion'
import { Mic2, Radio, Sparkles } from 'lucide-react'

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav className="card-glass flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nova-indigo to-nova-purple flex items-center justify-center shadow-glow-indigo">
            <Mic2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Pod<span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-indigo to-nova-purple">nova</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-nova-muted">
          <a href="#generate" className="hover:text-nova-text transition-colors duration-200 cursor-pointer">Generate</a>
          <a href="#library" className="hover:text-nova-text transition-colors duration-200 cursor-pointer">Library</a>
          <a href="#how" className="hover:text-nova-text transition-colors duration-200 cursor-pointer">How it works</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
            <Radio size={10} className="animate-pulse-slow" />
            <span>AI Live</span>
          </div>
          <button className="btn-primary text-sm py-2 px-4">
            <Sparkles size={14} />
            Try Free
          </button>
        </div>
      </nav>
    </motion.header>
  )
}
