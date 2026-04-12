import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@bsai/ui'],
  async redirects() {
    return [
      { source: '/privacy.html', destination: '/privacy', permanent: true },
      { source: '/terms.html', destination: '/terms', permanent: true },
    ];
  },
};

export default nextConfig;
