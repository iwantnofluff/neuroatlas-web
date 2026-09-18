import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/toolkits",
        destination: "/inside-the-app",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
