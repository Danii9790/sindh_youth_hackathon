/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Allow server actions from all origins for development
      // In production, this should be restricted to your actual domain
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  // Ensure environment variables are available on the server
  env: {
    NEON_POSTGRES_URL: process.env.NEON_POSTGRES_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;