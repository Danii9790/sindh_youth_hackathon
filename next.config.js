/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Allow server actions from all origins for development
      // In production, this should be restricted to your actual domain
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "localhost:3001", "127.0.0.1:3001", "localhost:3002", "127.0.0.1:3002", "localhost:3003", "127.0.0.1:3003"],
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
};

export default nextConfig;