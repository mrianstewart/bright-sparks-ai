import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/magic-todo',
  transpilePackages: ['@bsai/ui'],
};

export default nextConfig;
