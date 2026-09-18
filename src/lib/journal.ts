export type ArticleCategory =
  | "Focus"
  | "Pressure"
  | "Recovery"
  | "Founder Viewpoints"
  | "Pilot Stories";

export type Article = {
  slug: string;
  title: string;
  standfirst: string;
  category: ArticleCategory;
  featured?: boolean;
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
    featured: true,
  },
  {
    slug: "reading-pressure-before-it-reads-you",
    title: "Reading Pressure Before It Reads You",
    standfirst:
      "Most people notice stress only once it has already shaped a decision. Here is what the early signal actually looks like.",
    category: "Pressure",
  },
  {
    slug: "why-recovery-is-a-skill-not-a-rest-day",
    title: "Why Recovery Is A Skill, Not A Rest Day",
    standfirst:
      "Recovery capacity is trainable in the same way focus is. Treating it as a passive state is where most people get it wrong.",
    category: "Recovery",
  },
  {
    slug: "building-neuroatlas-the-first-year",
    title: "Building NeuroAtlas: The First Year",
    standfirst:
      "A founder's notes on why stress needed its own category of tool, not another wellness feature bolted onto a fitness tracker.",
    category: "Founder Viewpoints",
  },
  {
    slug: "inside-our-first-corporate-pilot",
    title: "Inside Our First Corporate Pilot",
    standfirst:
      "What a six-week pilot with an early partner organisation actually revealed about pressure at a team level.",
    category: "Pilot Stories",
  },
  {
    slug: "attention-is-a-finite-resource",
    title: "Attention Is A Finite Resource",
    standfirst:
      "The neuroscience behind why focus degrades predictably over a working day, and what actually restores it.",
    category: "Focus",
  },
  {
    slug: "the-difference-between-stress-and-strain",
    title: "The Difference Between Stress And Strain",
    standfirst:
      "Two words often used interchangeably describe very different states in the body. The distinction changes how you respond.",
    category: "Pressure",
  },
  {
    slug: "what-we-got-wrong-about-boardroom-mode",
    title: "What We Got Wrong About Boardroom Mode",
    standfirst:
      "An honest look at our own early assumptions about high-stakes composure, and what pilot feedback corrected.",
    category: "Founder Viewpoints",
  },
];
