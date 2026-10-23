export type NavLink = {
  label: string;
  href: string;
};

// Primary header nav — Title Case per Copy V2. "The Science" sits right
// after "The Band" per the client's own explicit nav update — restored
// here (see footerNav's own comment on its earlier removal from the
// footer specifically). "Toolkits" removed (that page is gone — see
// /inside-the-app's own Train Categories section, which absorbed its
// content); "Inside The App" takes its old slot instead.
export const primaryNav: NavLink[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "The Band", href: "/band" },
  { label: "The Science", href: "/the-science" },
  { label: "Inside The App", href: "/inside-the-app" },
  { label: "Privacy", href: "/privacy" },
  { label: "About", href: "/about" },
];

// The business route sits apart from the consumer links: the header shows it
// as its own outlined button beside "Join The Waitlist", so HR and operations
// buyers reach the enterprise case without reading consumer pages first.
export const organisationsNav: NavLink = { label: "For Organisations", href: "/for-organisations" };

// Full footer site menu — Title Case per Copy V2. "The Science" was
// previously removed from this list specifically (the "Final Copy for
// Home Page" doc's own footer enumeration didn't include it, while the
// /the-science page itself stayed untouched) — the client has since
// explicitly asked for it back in the nav, in both places, so it's
// restored here too, in the same "after The Band" position as
// primaryNav above.
export const footerNav: NavLink[] = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "The Band", href: "/band" },
  { label: "The Science", href: "/the-science" },
  { label: "Inside The App", href: "/inside-the-app" },
  { label: "For Organisations", href: "/for-organisations" },
  { label: "Privacy And Your Data", href: "/privacy" },
  { label: "About Us", href: "/about" },
  { label: "Join The Waitlist", href: "/waitlist" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Journal", href: "/journal" },
];

export const legalNav: NavLink[] = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms Of Use", href: "/legal/terms-of-use" },
];

export const socialLinks: (NavLink & { ariaLabel: string })[] = [
  { label: "Instagram", href: "https://www.instagram.com/neuroatlas.co/", ariaLabel: "Instagram profile" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/neuroatlasgroup/", ariaLabel: "LinkedIn profile" },
];

export const contactEmail = "hello@neuroatlas.org.uk";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://neuroatlas.in";
