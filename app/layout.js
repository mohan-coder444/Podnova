import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata = {
  title: 'Podnova — AI Podcast Generator',
  description: 'Turn any idea into a professional podcast in minutes. AI-powered script generation, voice synthesis, and audio production.',
  keywords: ['AI podcast', 'podcast generator', 'text to speech', 'script generator', 'Podnova'],
  openGraph: {
    title: 'Podnova — AI Podcast Generator',
    description: 'Turn any idea into a professional podcast in minutes.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} dark`} suppressHydrationWarning>
      <body className="font-sans bg-nova-bg text-nova-text" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
