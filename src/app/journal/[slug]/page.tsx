import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/journal";
import { urlForImage } from "@/lib/sanity/image";
import { siteUrl } from "@/lib/nav";

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found — NeuroAtlas" };
  }

  const title = article.seo?.metaTitle ?? `${article.title} — NeuroAtlas Journal`;
  const description = article.seo?.metaDescription ?? article.standfirst;
  const ogImage =
    article.seo?.ogImage ??
    urlForImage(article.image).width(1200).height(630).fit("crop").url();
  const url = `${siteUrl}/journal/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const url = `${siteUrl}/journal/${article.slug}`;
  const ogImage =
    article.seo?.ogImage ??
    urlForImage(article.image).width(1200).height(630).fit("crop").url();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    image: [ogImage],
    author: { "@type": "Person", name: article.author },
    datePublished: article.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "NeuroAtlas",
      logo: { "@type": "ImageObject", url: `${siteUrl}/brand/logo-mark.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <main className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-2xl px-6 pt-32 pb-20 md:pt-40 lg:pt-48">
        <Reveal y={20}>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-navy"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Journal
          </Link>
          <p className="mt-8 text-xs tracking-[0.15em] text-gold-deep uppercase">
            {article.category}
          </p>
          <h1 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-4xl leading-tight text-navy lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-6 text-pretty text-lg text-mist">
            {article.standfirst}
          </p>
          <p className="mt-6 text-sm text-mist/70">
            {article.author} &middot;{" "}
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          y={20}
          className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-navy/10 bg-navy/5"
        >
          <Image
            src={urlForImage(article.image).width(1200).height(675).fit("crop").url()}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 672px) 672px, 100vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal delay={0.15} y={20} className="mt-12 grid gap-6">
          {article.body.map((paragraph, i) => (
            <p key={i} className="text-pretty text-lg leading-relaxed text-ink/80">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </main>
  );
}
