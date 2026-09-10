import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";
import { cn } from "@/lib/utils";

// The real brand typefaces, replacing the Fraunces/Plus Jakarta Sans
// Google Fonts stand-ins this site launched with (see this file's own
// prior history for why those were chosen as substitutes). Both files
// live in public/fonts/ — see that directory's own note on what's
// actually present.
//
// BOOWIE ships as a single static weight — there is no bold/medium/light
// cut to select between, which is also why the brand pass on this
// site's headings (see globals.css's own font-serif-adjacent comments,
// and every h1/h2 className across the app) forces font-normal rather
// than leaving weight unset.
const boowie = localFont({
  src: "../../public/fonts/BOOWIE.ttf",
  variable: "--font-boowie",
  weight: "400",
  display: "swap",
});

// Only Mont-Book (weight 400, "Book") was present in the asset drop this
// was built from — Light, Medium, and Semibold were named in the brand
// brief but no corresponding files exist yet. font-light/font-medium/
// font-semibold utilities are still used deliberately throughout this
// codebase per that brief (see .eyebrow and ShimmerButton's own
// comments), but until those files are added below as additional `src`
// entries, the browser can only synthesize them (faux bold/thin) from
// this one real cut rather than rendering an actual distinct Mont
// weight. Add each missing weight here the same way, e.g.:
//   { path: "../../public/fonts/Mont-Medium.ttf", weight: "500", style: "normal" }
const mont = localFont({
  src: [{ path: "../../public/fonts/Mont-Book.ttf", weight: "400", style: "normal" }],
  variable: "--font-mont",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuroAtlas — The First Stress Management Band",
  description:
    "Know when pressure is building, and reset before it takes over.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", boowie.variable, mont.variable)}
    >
      {/* overscroll-x-none — a diagonal/horizontal trackpad scroll
         gesture (easy to trigger by accident on this site's own
         scroll-jacked pinned sections, e.g. MethodScrollCards' fan,
         BandScrollShowcase) was reaching past the page's own edge and
         triggering the browser's native swipe-to-go-back/forward
         history navigation instead of just stopping. overscroll-x-none
         (not the broader overscroll-none) scopes this to the X axis
         only, matching the actual reported gesture — Y-axis
         overscroll (pull-to-refresh, rubber-banding) is untouched. */}
      <body className="min-h-full flex flex-col overscroll-x-none bg-cream font-sans text-ink">
        <SmoothScroll />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
