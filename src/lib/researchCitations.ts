// Shared between EditorialIndexSection.tsx (renders "Backed by" +
// the short citation on each card) and /the-science's page.tsx (renders
// the full bibliography as a "References" list) — a plain data module
// with no "use client", so a Server Component (page.tsx) can import it
// directly. EditorialIndexSection.tsx itself IS "use client" (it needs
// scroll-linked motion values), and a Server Component can't import a
// plain value out of a "use client" module — only component references
// cross that boundary — confirmed live: importing RESEARCH_CARDS
// straight from that file threw "RESEARCH_CARDS.map is not a function"
// at build time, since the client boundary turns every export of that
// module into an opaque client reference, not the real array.
export const RESEARCH_CARDS = [
  {
    index: "01",
    field: "Autonomic Regulation",
    note: "Slow, paced breathing can support parasympathetic activity and increase vagally mediated HRV — helping the body move towards a more regulated state.",
    backedBy: "Laborde et al., 2022 · Systematic Review & Meta-Analysis",
    citation:
      "Laborde S. et al. (2022). Effects of voluntary slow breathing on heart rate and heart rate variability: A systematic review and meta-analysis. Neuroscience & Biobehavioral Reviews, 138, 104711.",
  },
  {
    index: "02",
    field: "Prefrontal-Limbic Control",
    note: "Helps support the brain systems that let you pause before reacting, regulate emotional intensity and make more deliberate decisions under pressure.",
    backedBy: "Buhle et al. (2014) · Meta-Analysis",
    citation:
      "Buhle, J. T., Silvers, J. A., Wager, T. D., Lopez, R., Onyemekwu, C., Kober, H., Weber, J., & Ochsner, K. N. (2014). Cognitive reappraisal of emotion: A meta-analysis of human neuroimaging studies. Cerebral Cortex, 24(11), 2981–2990.",
  },
  {
    index: "03",
    field: "Neuroplastic Conditioning",
    note: "Repeated practice helps the brain become more efficient at the responses you train. Over time, regulation and recovery can become more familiar, more automatic and easier to access.",
    backedBy: "Gotink et al. (2016) · Systematic Review",
    citation:
      "Gotink, R. A., Meijboom, R., Vernooij, M. W., Smits, M., & Hunink, M. G. M. (2016). 8-week Mindfulness Based Stress Reduction induces brain changes similar to traditional long-term meditation practice: A systematic review. Brain and Cognition, 108, 32–41.",
  },
] as const;
