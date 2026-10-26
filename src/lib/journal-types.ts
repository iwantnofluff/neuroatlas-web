import type { SanityImageSource } from "@sanity/image-url";

export type ArticleCategory =
  | "Focus"
  | "Pressure"
  | "Recovery"
  | "Founder Viewpoints"
  | "Pilot Stories";

export type ArticleSeo = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
};

export type Article = {
  slug: string;
  title: string;
  standfirst: string;
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  /** When the article was last edited in Sanity. */
  updatedAt?: string;
  faqs: { question: string; answer: string }[];
  body: string[];
  image: SanityImageSource;
  featured?: boolean;
  seo?: ArticleSeo;
};

export const CATEGORIES: ArticleCategory[] = [
  "Focus",
  "Pressure",
  "Recovery",
  "Founder Viewpoints",
  "Pilot Stories",
];
