/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
    unoptimized: true, // Desactiva optimización globalmente
  },
    eslint: {
    ignoreDuringBuilds: true,
  },
};


export default nextConfig;
