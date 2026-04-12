import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/roast-machine',
  transpilePackages: ['@bsai/ui'],
};

export default nextConfig;
