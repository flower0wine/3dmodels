import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*', // 匹配所有域名（不推荐）
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
