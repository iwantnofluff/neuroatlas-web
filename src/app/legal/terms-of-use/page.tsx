import { PlaceholderPage } from "@/components/PlaceholderPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Terms of use - NeuroAtlas",
  undefined,
  "/legal/terms-of-use"
);

export default function TermsOfUsePage() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Terms of use"
      body="The full terms of use are being drafted with legal counsel and will be published here ahead of launch."
    />
  );
}
