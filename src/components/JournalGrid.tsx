"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, type Article, type ArticleCategory } from "@/lib/journal-types";
import { urlForImage } from "@/lib/sanity/image";

type Filter = "All" | ArticleCategory;

const FILTERS: Filter[] = ["All", ...CATEGORIES];

export function JournalGrid({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<Filter>("All");
  const reduceMotion = useSafeReducedMotion();
  const filtered = active === "All" ? articles : articles.filter((a) => a.category === active);

  return (
    <div>
      <div
        className="flex gap-2 overflow-x-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden lg:justify-center lg:overflow-visible lg:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-colors duration-300",
              active === filter ? "text-navy" : "text-mist hover:text-navy"
            )}
          >
            {filter}
            {active === filter && (
              <motion.span
                layoutId="journal-filter-pill"
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 -z-10 rounded-full border border-gold/30 bg-gradient-to-b from-cream to-gold/40"
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article, i) => (
          <Reveal key={article.slug} delay={(i % 3) * 0.08} y={20}>
            <a href={`/journal/${article.slug}`} className="group block">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-navy/10 bg-navy/5">
                <Image
                  src={urlForImage(article.image).width(800).height(450).fit("crop").url()}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-xs tracking-[0.15em] text-gold-deep uppercase">
                {article.category}
              </p>
              <h3 className="mt-2 text-balance font-serif font-normal uppercase tracking-normal text-xl text-navy transition-transform duration-300 group-hover:-translate-y-0.5">
                {article.title}
              </h3>
              <p className="mt-2 text-pretty text-sm text-mist">{article.standfirst}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
