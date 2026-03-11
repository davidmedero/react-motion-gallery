import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
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
      }
    ],
  },
};

export default nextConfig;
