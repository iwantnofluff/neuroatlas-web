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

const BAND_ID = `${siteUrl}/band#product`;

/**
 * The NA·01 band as a Product. It is not on sale yet (pilot and waitlist
 * only), so there is deliberately no `offers`: no price is marked up until
 * one is confirmed. Without offers, reviews or ratings Google shows no
 * product rich result, but the entity and its brand are still understood.
 */
export const bandStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": BAND_ID,
  name: "NA·01",
  alternateName: "NA·01 Neural Band",
  description: "Lightweight, screenless, and made to disappear into your day. Charges quickly, when it needs it.",
  brand: { "@id": ORGANIZATION_ID },
  manufacturer: { "@id": ORGANIZATION_ID },
  url: `${siteUrl}/band`,
  image: [`${siteUrl}/photos/hero-band.jpg`, `${siteUrl}/photos/designed-to-blend-in.png`, `${siteUrl}/photos/band-color-wrist.png`],
};

/**
 * The companion app. It comes with the band rather than being sold on its
 * own, so it has no `offers` either; `softwareRequirements` names the band
 * it needs.
 */
export const appStructuredData = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "@id": `${siteUrl}/inside-the-app#app`,
  name: "NeuroAtlas",
  description: "NeuroAtlas brings together targeted tools for performance, stress and wellness, so you can choose what fits the moment.",
  applicationCategory: "HealthApplication",
  operatingSystem: "iOS, Android",
  url: `${siteUrl}/inside-the-app`,
  publisher: { "@id": ORGANIZATION_ID },
  softwareRequirements: "NA·01 band",
};

type ArticleForSchema = {
  title: string;
  standfirst: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  faqs: { question: string; answer: string }[];
};

/**
 * A journal post as a BlogPosting, plus an FAQPage when the post has an
 * FAQ block. FAQPage is only emitted when the questions are rendered on the
 * page too: search engines ignore FAQ markup for content readers can't see.
 */
export function articleStructuredData(article: ArticleForSchema, url: string, image: string) {
  const posting = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.standfirst,
    image: [image],
    author: { "@type": "Person", name: article.author },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    publisher: organizationReference,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-GB",
  };
  const faqPage = article.faqs.length
    ? {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;
  return { "@context": "https://schema.org", "@graph": faqPage ? [posting, faqPage] : [posting] };
}
