import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  outputFileTracingIncludes: {
    "/demos": [
      "./app/demos/entries/_data/**/*",
      "./app/demos/entries/entries-pagination/Component.tsx",
      "./app/demos/entries/entries-load-more/Component.tsx",
      "./app/demos/entries/entries-infinite-scroll/Component.tsx",
      "./app/demos/entries/entries-virtualization/Component.tsx",
      "./app/demos/entries/entries-pagination-grid/Component.tsx",
      "./app/demos/entries/entries-load-more-grid/Component.tsx",
      "./app/demos/entries/entries-infinite-scroll-grid/Component.tsx",
      "./app/demos/entries/entries-virtualization-grid/Component.tsx",
    ],
  },
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
        hostname: 'images.unsplash.com',
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
