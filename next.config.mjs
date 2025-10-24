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
};

export default nextConfig;
