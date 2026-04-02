import './globals.css'

export const metadata = {
  title: 'PODNOVA | The Future of Intelligent Infrastructure',
  description: 'Scale your decentralized pod clusters with ease. Built on InsForge.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
