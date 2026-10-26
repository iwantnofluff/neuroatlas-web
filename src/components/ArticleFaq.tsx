import { Reveal } from "@/components/Reveal";

/** An article's FAQ block, always expanded: every question and answer is
 *  visible on the page, which FAQPage structured data requires. */
export function ArticleFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="article-faq" className="mt-16 border-t border-navy/10 pt-12">
      <Reveal y={20}>
        <h2 id="article-faq" className="text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight text-navy lg:text-3xl">
          Frequently Asked Questions
        </h2>
      </Reveal>
      <dl className="mt-8 divide-y divide-navy/10">
        {faqs.map((faq) => (
          <Reveal key={faq.question} y={16} className="py-6 first:pt-0">
            <dt className="text-pretty text-lg font-medium text-navy">{faq.question}</dt>
            <dd className="mt-3 text-pretty text-base leading-relaxed text-ink/80">{faq.answer}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
