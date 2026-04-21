import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/speech-writer',
  turbopack: {},
  // react-pdf uses browser-only canvas APIs — exclude from server bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), 'canvas'];
    }
    return config;
  },
};

export default nextConfig;
