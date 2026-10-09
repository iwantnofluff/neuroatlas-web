import { defineArrayMember, defineField, defineType } from "sanity";

const CATEGORIES = [
  "Focus",
  "Pressure",
  "Recovery",
  "Founder Viewpoints",
  "Pilot Stories",
];

const SLUG_MAX_LENGTH = 80;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Turns a title into a URL slug: lowercase letters, digits and single
 *  hyphens only. Accents are dropped, "&" becomes "and", apostrophes vanish
 *  (isn't -> isnt), and it is cut at a word boundary under the max length. */
function slugifyTitle(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['\u2018\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= SLUG_MAX_LENGTH) return slug;
  return slug.slice(0, SLUG_MAX_LENGTH).replace(/-[^-]*$/, "");
}

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "The article's address: neuroatlas.in/journal/your-slug. Lowercase words joined by hyphens, no dates. Changing it after publishing breaks existing links.",
      options: { source: "title", maxLength: SLUG_MAX_LENGTH, slugify: slugifyTitle },
      group: "content",
      validation: (Rule) =>
        Rule.required().custom((value: { current?: string } | undefined) => {
          const slug = value?.current ?? "";
          if (!slug) return true;
          if (!SLUG_PATTERN.test(slug)) return "Use lowercase letters, numbers and single hyphens only, e.g. what-is-neuroatlas";
          if (/\b(19|20)\d{2}\b/.test(slug.replace(/-/g, " "))) return "Leave dates out of the address so it stays valid over time";
          if (slug.length > SLUG_MAX_LENGTH) return `Keep it under ${SLUG_MAX_LENGTH} characters`;
          return true;
        }),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: CATEGORIES },
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      group: "media",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
      ],
      group: "content",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "mainImage" },
  },
});
