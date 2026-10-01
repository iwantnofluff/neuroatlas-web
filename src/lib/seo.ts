import type { Metadata } from "next";
import { siteUrl } from "@/lib/nav";

/**
 * Page metadata with matching search and share tags. Each page's
 * description is its own hero line, verbatim. A page that sets its own
 * openGraph drops the file-based image, so the default share image
 * (app/opengraph-image.tsx) is listed explicitly; journal articles use
 * their cover image instead.
 */
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "NeuroAtlas - The First Stress Management Band",
};

export function pageMetadata(title: string, description: string | undefined, path: string): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "NeuroAtlas", type: "website", locale: "en_GB", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
  };
}
