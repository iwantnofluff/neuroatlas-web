import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["sanity", "@sanity/vision"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Media in /public (photos, hero video, band model, icons) is served by
  // Vercel's CDN, which drops its copy on every deploy. Browsers otherwise
  // get max-age=0 and re-check every file on every visit. These names are
  // not content-hashed, so the browser cache is 7 days rather than a year,
  // then a further 30 days of serving the stored copy while it refreshes.
  // Optimised images (/_next/image) inherit this max-age from their source.
  async headers() {
    const mediaCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }];
    return ["/photos/:path*", "/video/:path*", "/wheel/:path*", "/composure/:path*", "/figma/:path*", "/textures/:path*", "/brand/:path*", "/band.glb"].map(
      (source) => ({ source, headers: mediaCache })
    );
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
