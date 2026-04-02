/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        nova: {
          bg:       '#0F0F23',
          surface:  '#16163A',
          card:     '#1C1C44',
          border:   '#2A2A60',
          primary:  '#1E1B4B',
          secondary:'#312E81',
          indigo:   '#6366F1',
          purple:   '#8B5CF6',
          orange:   '#F97316',
          amber:    '#F59E0B',
          text:     '#F8FAFC',
          muted:    '#94A3B8',
          dim:      '#64748B',
        },
      },
      backgroundImage: {
        'nova-gradient': 'linear-gradient(135deg, #0F0F23 0%, #1E1B4B 50%, #0F0F23 100%)',
        'glow-indigo': 'radial-gradient(circle at center, rgba(99,102,241,0.20) 0%, transparent 70%)',
        'glow-orange': 'radial-gradient(circle at center, rgba(249,115,22,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(28,28,68,0.8), rgba(22,22,58,0.4))',
        'cta-gradient': 'linear-gradient(135deg, #F97316, #F59E0B)',
        'ai-gradient': 'linear-gradient(135deg, #6366F1, #8B5CF6, #F97316)',
      },
      boxShadow: {
        'nova-sm': '0 2px 8px rgba(99,102,241,0.12)',
        'nova':    '0 4px 24px rgba(99,102,241,0.20)',
        'nova-lg': '0 8px 40px rgba(99,102,241,0.30)',
        'glow-orange': '0 0 30px rgba(249,115,22,0.30)',
        'glow-indigo': '0 0 30px rgba(99,102,241,0.40)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'waveform':   'waveform 1.2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
