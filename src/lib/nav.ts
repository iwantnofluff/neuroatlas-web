export type NavLink = {
  label: string;
  href: string;
};

// Primary header nav — Title Case per Copy V2.
export const primaryNav: NavLink[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "The Band", href: "/band" },
  { label: "Toolkits", href: "/toolkits" },
  { label: "For Organisations", href: "/for-organisations" },
  { label: "Privacy", href: "/privacy" },
  { label: "About", href: "/about" },
];

// Full footer site menu — Title Case per Copy V2. This list is the
// client's own final, complete enumeration (see the "Final Copy for
// Home Page" doc's own footer section) — "The Science" used to be
// listed here too, but the final copy's own list doesn't include it,
// so it's gone from the footer nav specifically (the /the-science page
// itself is untouched — this only removes the footer LINK to it, which
// wasn't asked for).
export const footerNav: NavLink[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "The Band", href: "/band" },
  { label: "Inside The App", href: "/inside-the-app" },
  { label: "Toolkits", href: "/toolkits" },
  { label: "For Organisations", href: "/for-organisations" },
  { label: "Privacy And Your Data", href: "/privacy" },
  { label: "About Us", href: "/about" },
  { label: "Request Access", href: "/request-access" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Journal", href: "/journal" },
];

export const legalNav: NavLink[] = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms Of Use", href: "/legal/terms-of-use" },
];

export const socialLinks: NavLink[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export const contactEmail = "hello@neuroatlas.org.uk";
