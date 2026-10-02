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
      {
        source: "/request-access",
        destination: "/waitlist",
        permanent: true,
      },
      // neuroatlas.org.uk (and www) send every path to the live .in domain.
      // Takes effect once that domain is added to the Vercel project.
      ...["neuroatlas.org.uk", "www.neuroatlas.org.uk"].map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://neuroatlas.in/:path*",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
