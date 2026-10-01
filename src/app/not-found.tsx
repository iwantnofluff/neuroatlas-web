import type { Metadata } from "next";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata: Metadata = {
  title: "Page not found - NeuroAtlas",
  robots: { index: false },
};

/** Shown for any address that doesn't exist (and for journal slugs that
 *  aren't published). Rendered inside the root layout, so the header and
 *  footer stay in place. */
export default function NotFound() {
  return (
    <main className="dark-glow relative flex min-h-[100svh] items-center bg-navy-soft px-6 pt-24 pb-16 text-cream lg:px-10">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="font-serif text-7xl leading-none font-normal text-gold/80 tabular-nums sm:text-8xl">404</p>
        <h1 className="mt-8 text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-6 max-w-md text-pretty text-lg text-cream/75">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ShimmerLink
            href="/"
            background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
            shimmerColor="var(--color-cream)"
            className="text-sm tracking-wide text-cream"
          >
            Back To Home
          </ShimmerLink>
          <ShimmerLink
            href="/waitlist"
            background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
            shimmerColor="var(--color-gold-soft)"
            className="text-sm tracking-wide text-cream"
          >
            Join The Waitlist
          </ShimmerLink>
        </div>
      </div>
    </main>
  );
}
