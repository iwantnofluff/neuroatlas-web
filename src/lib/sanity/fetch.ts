import { draftMode } from "next/headers";
import { sanityClient } from "@/lib/sanity/client";

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T> {
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
