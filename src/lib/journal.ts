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
  body: string[];
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

export const articles: Article[] = [
  {
    slug: "the-cost-of-constant-availability",
    title: "The Cost Of Constant Availability",
    standfirst:
      "Why always-on culture is quietly eroding the focus it claims to protect, and what the data actually shows about attention under pressure.",
    category: "Focus",
    author: "Vanshika Dhoot",
    publishedAt: "2026-08-04",
    featured: true,
    body: [
      "Always-on culture promises that more availability means more control over your work. In practice, the opposite tends to happen: constant interruption fragments the exact attention that deep work requires.",
      "The body registers this fragmentation before the mind names it. Every switch between tasks carries a real physiological cost, one that accumulates quietly across a working day rather than announcing itself in any single moment.",
      "What the signal actually shows is not a dramatic spike but a slow erosion of baseline. By the time focus feels visibly gone, the underlying pattern has usually been building for hours.",
      "NeuroAtlas exists to make that pattern visible earlier, while there is still something useful to do about it.",
    ],
    seo: {
      ogImage: "/photos/band-color-wrist.png",
    },
  },
  {
    slug: "reading-pressure-before-it-reads-you",
    title: "Reading Pressure Before It Reads You",
    standfirst:
      "Most people notice stress only once it has already shaped a decision. Here is what the early signal actually looks like.",
    category: "Pressure",
    author: "Vanshika Dhoot",
    publishedAt: "2026-07-22",
    body: [
      "Pressure rarely announces itself. It shows up as a slightly shorter reply, a decision made a little faster than usual, a meeting that felt harder to sit through than it should have.",
      "By the time any of that is consciously noticed, the underlying physiological shift has usually been present for some time. The gap between the signal and the feeling is exactly where NeuroAtlas is designed to sit.",
    ],
  },
  {
    slug: "why-recovery-is-a-skill-not-a-rest-day",
    title: "Why Recovery Is A Skill, Not A Rest Day",
    standfirst:
      "Recovery capacity is trainable in the same way focus is. Treating it as a passive state is where most people get it wrong.",
    category: "Recovery",
    author: "Vanshika Dhoot",
    publishedAt: "2026-07-08",
    body: [
      "Recovery is often treated as something that simply happens once the pressure stops. The evidence points to something more active: recovery capacity itself behaves like a trainable skill, not a passive default state.",
      "That reframing matters. It means the right intervention at the right moment can meaningfully shift how quickly a system returns to baseline, rather than just waiting it out.",
    ],
  },
  {
    slug: "building-neuroatlas-the-first-year",
    title: "Building NeuroAtlas: The First Year",
    standfirst:
      "A founder's notes on why stress needed its own category of tool, not another wellness feature bolted onto a fitness tracker.",
    category: "Founder Viewpoints",
    author: "Vanshika Dhoot",
    publishedAt: "2026-06-19",
    body: [
      "NeuroAtlas started from a simple observation: the tools available for managing stress were either too generic to act on, or too clinical to use day to day.",
      "Building something in between meant starting from the signal itself, not from a feature list. The first year was mostly spent making sure that signal was trustworthy before building anything on top of it.",
    ],
  },
  {
    slug: "inside-our-first-corporate-pilot",
    title: "Inside Our First Corporate Pilot",
    standfirst:
      "What a six-week pilot with an early partner organisation actually revealed about pressure at a team level.",
    category: "Pilot Stories",
    author: "Vanshika Dhoot",
    publishedAt: "2026-05-27",
    body: [
      "Running a pilot inside a real organisation surfaces things a lab setting never will. Pressure at a team level does not move uniformly, and the group-level view made that visible almost immediately.",
      "The most useful outcome was not a single dramatic result, but a clearer sense of where the platform's own assumptions needed to flex to match how a real team actually works.",
    ],
  },
  {
    slug: "attention-is-a-finite-resource",
    title: "Attention Is A Finite Resource",
    standfirst:
      "The neuroscience behind why focus degrades predictably over a working day, and what actually restores it.",
    category: "Focus",
    author: "Vanshika Dhoot",
    publishedAt: "2026-05-11",
    body: [
      "Focus does not fail randomly. It degrades along a fairly predictable curve across a working day, shaped by cumulative cognitive load rather than any single demanding task.",
      "Understanding that curve is what makes it possible to intervene before the decline is over, rather than after.",
    ],
  },
  {
    slug: "the-difference-between-stress-and-strain",
    title: "The Difference Between Stress And Strain",
    standfirst:
      "Two words often used interchangeably describe very different states in the body. The distinction changes how you respond.",
    category: "Pressure",
    author: "Vanshika Dhoot",
    publishedAt: "2026-04-30",
    body: [
      "Stress is the demand placed on a system. Strain is what that system shows in response to the demand. Conflating the two leads to responses aimed at the wrong target.",
      "NeuroAtlas is built around reading strain directly, rather than inferring it from external demand alone.",
    ],
  },
  {
    slug: "what-we-got-wrong-about-boardroom-mode",
    title: "What We Got Wrong About Boardroom Mode",
    standfirst:
      "An honest look at our own early assumptions about high-stakes composure, and what pilot feedback corrected.",
    category: "Founder Viewpoints",
    author: "Vanshika Dhoot",
    publishedAt: "2026-04-14",
    body: [
      "Our first version of Boardroom Mode assumed people wanted a longer, more thorough priming protocol before a high-stakes moment. Pilot feedback corrected that quickly: the value was in speed, not depth.",
      "That single correction shaped almost everything that came after it.",
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
