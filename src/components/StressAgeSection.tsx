import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

type StressAgeState = {
  age: number;
  title: string;
  body: string;
  trend: string;
  TrendIcon: LucideIcon;
  trendColor: string;
  matchesAge?: boolean;
};

const STATES: StressAgeState[] = [
  {
    age: 20,
    title: "Recovery trending above your usual pattern",
    body: "Your recent autonomic recovery is mapping younger on the Stress Age reference scale.",
    trend: "Improving",
    TrendIcon: ArrowDown,
    trendColor: "#2e6f50",
  },
  {
    age: 24,
    title: "Close to your usual pattern",
    body: "Your recent recovery is broadly aligned with your established baseline.",
    trend: "Stable",
    TrendIcon: ArrowRight,
    trendColor: "var(--color-bronze)",
    matchesAge: true,
  },
  {
    age: 31,
    title: "Recovery trending below your usual pattern",
    body: "Your recent autonomic recovery is mapping older on the Stress Age reference scale.",
    trend: "Increasing",
    TrendIcon: ArrowUp,
    trendColor: "#9a3f4f",
  },
];

export function StressAgeSection() {
  return (
    <section id="stress-age" data-visual-section="stress-age">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-14">
          <Reveal y={20} className="lg:col-span-7">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
              Your Age Tells One Story. Your Stress Age Tells Another.
            </h2>
          </Reveal>
          <Reveal y={20} delay={0.1} className="lg:col-span-5">
            <p className="text-pretty text-lg text-mist">
              We all know how old we are. What&rsquo;s harder to see is how well
              our system is keeping up.
            </p>
            <p className="mt-4 text-pretty text-base text-mist">
              Stress Age gives you a simple, age-like view of your recent
              recovery — helping you see when your system is recovering well,
              holding steady, or showing signs of greater strain.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 lg:mt-24">
          <Reveal y={20}>
            <h3 className="mx-auto max-w-2xl text-balance text-center font-serif font-normal uppercase tracking-normal text-xl leading-snug text-navy lg:text-2xl">
              24 Years Old. But What State Is Your System In?
            </h3>
          </Reveal>
          <ul className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
            {STATES.map(({ age, title, body, trend, TrendIcon, trendColor, matchesAge }, i) => (
              <Reveal
                key={age}
                as="li"
                delay={i * 0.1}
                className={cn(
                  "card-glass-light flex flex-col p-6 transition-colors duration-300 hover:border-gold-deep/60 lg:p-8",
                  matchesAge && "border-gold-deep/60"
                )}
              >
                <p className="eyebrow text-gold-muted">Stress Age</p>
                <p className="mt-3 font-serif text-6xl leading-none font-normal text-navy tabular-nums">
                  {age}
                </p>
                <p className="mt-6 text-pretty text-base font-medium text-ink">{title}</p>
                <p className="mt-2 text-pretty text-sm text-mist">{body}</p>
                <p className="mt-auto pt-6">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs tracking-wide"
                    style={{
                      color: trendColor,
                      borderColor: `color-mix(in oklab, ${trendColor} 35%, transparent)`,
                    }}
                  >
                    <TrendIcon aria-hidden="true" className="size-3.5" />
                    {trend}
                  </span>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="mt-16 grid gap-8 border-t border-line pt-12 lg:mt-24 lg:grid-cols-12 lg:gap-14 lg:pt-16">
          <Reveal y={20} className="lg:col-span-5">
            <h3 className="text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight text-navy lg:text-3xl">
              It&rsquo;s Not Your Biological Age.
            </h3>
          </Reveal>
          <Reveal y={20} delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <p className="text-pretty text-lg text-mist">
              Stress Age is a wellness estimate, not a diagnosis and not a
              measure of how many years stress has added to your life.
            </p>
            <p className="mt-4 text-pretty text-base text-mist">
              It is designed to help make changes in your recovery pattern
              easier to see and understand over time.
            </p>
            <p className="mt-4 text-pretty text-base italic text-mist/80">
              Think of it as a trend, not a verdict.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
