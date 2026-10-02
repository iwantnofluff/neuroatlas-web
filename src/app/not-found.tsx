import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found - NeuroAtlas",
  robots: { index: false },
};

/** Shown for any address that doesn't exist (and for journal slugs that
 *  aren't published). Rendered inside the root layout, so the header and
 *  footer stay in place; the breathing reset is in NotFoundBreath. */
export default function NotFound() {
  return (
    <main className="dark-glow relative flex min-h-[100svh] items-center bg-navy-soft px-6 pt-28 pb-20 text-cream lg:px-10">
      <NotFoundContent />
    </main>
  );
}
