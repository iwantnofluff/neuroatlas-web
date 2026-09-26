import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/**
 * True only when a real Sanity project is configured for THIS
 * deployment/environment. Callers (sanityFetch, getAllArticleSlugs)
 * check this before making a real request, so an environment missing
 * NEXT_PUBLIC_SANITY_PROJECT_ID degrades to "no CMS content" instead
 * of throwing or hanging on a request to a fake project.
 */
export const isSanityConfigured = Boolean(projectId);

// A real, confirmed bug this "placeholder" fallback avoids: next-sanity's
// createClient() validates `projectId` and throws SYNCHRONOUSLY, at
// module-evaluation time, if it's missing — and this module is a
// top-level `export const`, imported by
// /api/draft-mode/enable/route.ts, which Next.js evaluates while
// "Collecting page data" during `next build`, not just at request
// time. One Vercel environment (Preview) missing this env var crashed
// the ENTIRE production build — every route, not just the Journal —
// since Next.js can't finish collecting page data for ANY route once
// one throws during that phase. Falling back to a syntactically valid
// placeholder id keeps construction itself safe regardless of
// environment config; `isSanityConfigured` (not this client's own
// validity) is what actually gates whether it's ever used for a real
// fetch.
export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
});
