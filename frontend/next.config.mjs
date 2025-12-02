/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from backend (localhost:3000) and local images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/**',
      },
    ],
    // Allow unoptimized images for local development
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Strict mode for development
  reactStrictMode: true,
};

export default nextConfig;
