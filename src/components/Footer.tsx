"use client";

import Link from "next/link";
import { useState } from "react";
import { contactEmail, footerNav, legalNav, socialLinks } from "@/lib/nav";
import { LogoMark } from "@/components/LogoMark";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function Footer() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="border-t border-cream/10 bg-navy text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="flex items-center gap-2.5 font-serif text-lg tracking-wide">
              <LogoMark className="h-7 w-7" />
              NeuroAtlas
            </span>
            <nav className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-cream/70 transition-colors hover:text-cream"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:justify-self-end lg:text-right">
            <p className="eyebrow">Stay Ahead Of Stress</p>
            <p className="mt-3 max-w-sm text-sm text-cream/70 lg:ml-auto">
              One email a month. No noise, just what&rsquo;s useful.
            </p>
            {submitted ? (
              <p className="mt-4 text-sm text-gold-soft">
                You are on the list. We will be in touch.
              </p>
            ) : (
              <form
                className="mt-4 flex max-w-sm gap-2 lg:ml-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="w-full rounded-full border border-cream/25 bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
                />
                <ShimmerButton
                  type="submit"
                  background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
                  shimmerColor="var(--color-cream)"
                  className="shrink-0 py-2.5 text-sm tracking-wide text-cream"
                >
                  Join
                </ShimmerButton>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-cream/10 pt-8 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-cream">
                {item.label}
              </Link>
            ))}
            <a href={`mailto:${contactEmail}`} className="hover:text-cream">
              {contactEmail}
            </a>
          </div>
          <div className="flex items-center gap-6">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-cream/40">
          © {new Date().getFullYear()} NeuroAtlas. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
