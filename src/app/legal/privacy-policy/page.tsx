import { PlaceholderPage } from "@/components/PlaceholderPage";
import { NOT_YET_INDEXABLE, pageMetadata } from "@/lib/seo";

// Placeholder until the counsel-drafted text arrives. Kept out of search
// results (and the sitemap) until then; remove robots when it is replaced.
export const metadata = {
  ...pageMetadata("Privacy policy - NeuroAtlas", undefined, "/legal/privacy-policy"),
  robots: NOT_YET_INDEXABLE,
};

export default function PrivacyPolicyPage() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Privacy policy"
      body="The full privacy policy is being drafted with legal counsel and will be published here ahead of launch."
    />
  );
}
