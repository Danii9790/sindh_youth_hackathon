/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Development origins
      allowedOrigins: [
        "localhost:3000", "127.0.0.1:3000",
        "localhost:3001", "127.0.0.1:3001",
        "localhost:3002", "127.0.0.1:3002",
        "localhost:3003", "127.0.0.1:3003",
        // Production Vercel domain (will be automatically replaced)
        ...(process.env.NODE_ENV === 'production' ? [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null].filter(Boolean) : [])
      ].filter(Boolean),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.accounts.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.accounts.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  // Enable static optimization where possible
  swcMinify: true,
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;