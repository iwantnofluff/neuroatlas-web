import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small arrow that nudges right on hover — used on inline text links
 *  throughout the marketing pages (originally homepage-only, now shared
 *  since /band needs the same pattern for its "Learn More" link).
 *  `tone="dark"` for the now-navy sections — the gold underline stays the
 *  same either way, only the text color flips. */
export function TextLink({
  href,
  tone = "light",
  children,
}: {
  href: string;
  tone?: "light" | "dark";
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group mt-6 inline-flex items-center gap-1.5 text-sm underline decoration-gold decoration-2 underline-offset-4",
        tone === "dark" ? "text-cream" : "text-navy"
      )}
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
