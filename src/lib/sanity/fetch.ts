import { draftMode } from "next/headers";
import { sanityClient, isSanityConfigured } from "@/lib/sanity/client";

/**
 * `fallback` is required, not optional — every caller has to state
 * what "no CMS configured" should look like for its own query (an
 * empty array for a list, `null` for a single lookup), so an
 * unconfigured environment degrades to that instead of this function
 * either throwing or attempting a real request against the
 * `sanityClient`'s own placeholder project id (see client.ts's own
 * doc comment on why that id exists at all).
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T
): Promise<T> {
  if (!isSanityConfigured) return fallback;

  const { isEnabled: preview } = await draftMode();

  return sanityClient.fetch<T>(
    query,
    params,
    preview
      ? {
          perspective: "drafts",
          useCdn: false,
          token: process.env.SANITY_API_READ_TOKEN,
          next: { revalidate: 0 },
        }
      : { next: { revalidate: 60 } }
  );
}
