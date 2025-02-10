import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ai-terminal",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
