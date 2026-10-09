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
      // GoDaddy's parked page lived at /lander, and browsers that saw it
      // before the domain moved cached the redirect there.
      {
        source: "/lander",
        destination: "/",
        permanent: true,
      },
      // Every other hostname that reaches this project sends each path to the
      // one canonical address, https://neuroatlas.in. That covers the old
      // .org.uk domain and Vercel's built-in production alias, which would
      // otherwise serve a duplicate copy of the site. Preview deployments use
      // their own per-branch hostnames, so they are unaffected.
      ...["neuroatlas.org.uk", "www.neuroatlas.org.uk", "neuroatlas-web.vercel.app"].map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://neuroatlas.in/:path*",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
