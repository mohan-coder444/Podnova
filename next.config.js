/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tailwind + CSS optimizations
  // Allow external images (storage buckets)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.insforge.app',
      },
    ],
  },

  // Allow CORS for API routes from same origin
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY'    },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
