import { contactEmail, siteUrl, socialLinks } from "@/lib/nav";

export const ORGANIZATION_ID = `${siteUrl}/#organization`;
const WEBSITE_ID = `${siteUrl}/#website`;

/** Google wants a raster logo of at least 112 px on a plain background. */
const LOGO = {
  "@type": "ImageObject",
  url: `${siteUrl}/brand/logo-512.png`,
  width: 512,
  height: 512,
};

/** Every fact here is one the site itself states (description, London
 *  headquarters, founder, contact address). `sameAs` lists the official
 *  social profiles, the same links as the footer, so search engines tie
 *  them to this organisation. */
const organization = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "NeuroAtlas",
  url: siteUrl,
  logo: LOGO,
  image: LOGO,
  description: "Know when pressure is building, and reset before it takes over.",
  email: contactEmail,
  founder: { "@type": "Person", name: "Vanshika Dhoot" },
  address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" },
  sameAs: socialLinks.map((link) => link.href),
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "NeuroAtlas",
  url: siteUrl,
  inLanguage: "en-GB",
  publisher: { "@id": ORGANIZATION_ID },
};

/** The Organization and WebSite entities, rendered once in the root layout. */
export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [organization, website],
};

/** Reference to the organisation for other schema (e.g. an article's publisher). */
export const organizationReference = { "@type": "Organization", "@id": ORGANIZATION_ID, name: "NeuroAtlas", logo: LOGO };
