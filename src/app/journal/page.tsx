import { ImageIcon, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { JournalGrid } from "@/components/JournalGrid";
import { NewsletterForm } from "@/components/NewsletterForm";
import { articles } from "@/lib/journal";

export const metadata = { title: "Journal — NeuroAtlas" };

export default function JournalPage() {
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const rest = articles.filter((article) => article.slug !== featured.slug);

  return (
    <main>
      <section className="bg-navy px-6 pt-32 pb-20 text-cream md:pt-40 lg:px-10 lg:pt-48 lg:pb-24">
        <div className="mx-auto max-w-4xl">
          <Reveal y={20}>
            <p className="eyebrow">Journal</p>
            <h1 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Better Thinking Starts Here
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-cream/75">
              Explore ideas on focus, pressure and composure, and what
              we&rsquo;re learning as we build NeuroAtlas.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream px-6 pt-16 pb-4 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal y={20}>
            <a
              href={`/journal/${featured.slug}`}
              className="group relative block overflow-hidden rounded-3xl"
            >
              <div className="aspect-video sm:aspect-[21/9]">
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-navy/10 to-navy/5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                  <ImageIcon
                    aria-hidden="true"
                    strokeWidth={1}
                    className="size-16 text-navy/10"
                  />
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-12">
                <div className="max-w-xl rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
                  <p className="text-xs tracking-[0.15em] text-gold-soft uppercase">
                    {featured.category}
                  </p>
                  <h2 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight text-cream sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-pretty text-base text-cream/75">
                    {featured.standfirst}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm tracking-wide text-cream underline decoration-cream/30 underline-offset-4 transition-colors group-hover:decoration-cream">
                    Read Article
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal y={20} className="text-center">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
              From The Journal
            </h2>
          </Reveal>
          <div className="mt-10">
            <JournalGrid articles={rest} />
          </div>
        </div>
      </section>

      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
            Get The Next One
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            Get occasional ideas on focus, pressure and composure, sent
            straight to your inbox.
          </p>
          <NewsletterForm />
        </Reveal>
      </section>
    </main>
  );
}
