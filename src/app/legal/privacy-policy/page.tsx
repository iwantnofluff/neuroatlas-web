import { PlaceholderPage } from "@/components/PlaceholderPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Privacy policy - NeuroAtlas",
  undefined,
  "/legal/privacy-policy"
);

export default function PrivacyPolicyPage() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Privacy policy"
      body="The full privacy policy is being drafted with legal counsel and will be published here ahead of launch."
    />
  );
}
