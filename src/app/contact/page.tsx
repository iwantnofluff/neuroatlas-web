import { contactEmail } from "@/lib/nav";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata = { title: "Contact — NeuroAtlas" };

export default function ContactPage() {
  return (
    <PlaceholderPage
      eyebrow="Contact"
      title="Get in touch"
      body={`Routed enquiries for general, corporate, press and support questions are being set up. In the meantime, reach us at ${contactEmail}.`}
    />
  );
}
