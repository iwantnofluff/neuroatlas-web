import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "@/lib/sanity/client";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
