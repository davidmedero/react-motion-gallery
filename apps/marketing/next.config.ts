import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["react-motion-gallery"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.react-motion-gallery.com',
        pathname: '/**'
      },
    ],
  },
};

export default nextConfig;
