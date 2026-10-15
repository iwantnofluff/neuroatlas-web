import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A link inside running copy. It keeps the surrounding text colour and
 *  shows a faint underline that warms to gold on hover or focus, so it
 *  reads as part of the sentence rather than a button. Used to link an
 *  existing phrase to the page that covers it, without changing the words. */
export function InlineLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "underline decoration-current/35 decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] duration-300 hover:decoration-gold focus-visible:decoration-gold",
        className
      )}
    >
      {children}
    </Link>
  );
}
