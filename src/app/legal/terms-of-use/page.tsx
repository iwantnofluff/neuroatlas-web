import { PlaceholderPage } from "@/components/PlaceholderPage";
import { NOT_YET_INDEXABLE, pageMetadata } from "@/lib/seo";

// Placeholder until the counsel-drafted text arrives. Kept out of search
// results (and the sitemap) until then; remove robots when it is replaced.
export const metadata = {
  ...pageMetadata("Terms of use - NeuroAtlas", undefined, "/legal/terms-of-use"),
  robots: NOT_YET_INDEXABLE,
};

export default function TermsOfUsePage() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Terms of use"
      body="The full terms of use are being drafted with legal counsel and will be published here ahead of launch."
    />
  );
}
