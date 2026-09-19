import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["sanity", "@sanity/vision"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
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
