import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";

/**
 * "A Problem Nobody Was Solving" — /about's asymmetrical editorial split:
 * the founder portrait on one side (with Parallax's own subtle scroll
 * drift, the same wrapper the homepage already uses for its focal
 * panels), the narrative vertically centered on the other.
 *
 * The portrait is a 2:3 photo in a 3:4 card; object-[50%_28%] keeps
 * the face in the upper third of the frame as the crop trims height.
 *
 * `flex flex-col md:flex-row` — stacks on mobile and the whole foldable
 * tier, splits into the side-by-side editorial layout only at true
 * tablet width, the `md` breakpoint this codebase consistently uses for
 * exactly this kind of two-column split (see FeatureSplitSection's own
 * doc comment on why `md`, not `lg`).
 */
export function FounderStorySection() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:gap-14">
          <Parallax offset={20} className="md:w-1/2">
            <Reveal>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl card-glass-light">
                <Image
                  src="/photos/founder-vanshika-dhoot.jpg"
                  alt="Vanshika Dhoot, founder of NeuroAtlas"
                  fill
                  sizes="(min-width: 1152px) 551px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-[50%_28%]"
                />
              </div>
            </Reveal>
          </Parallax>

          <Reveal y={20} className="md:w-1/2">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl sm:text-4xl md:text-5xl leading-tight text-navy">
              A Problem Nobody Was Solving
            </h2>
            <p className="mt-6 text-pretty text-lg text-mist">
              Vanshika saw brilliant, high-performing people break under
              sustained pressure, not for lack of talent, but for lack of
              anything practical to reach for in the middle of a demanding
              day.
            </p>
            <p className="mt-4 text-pretty text-lg text-mist">
              That was what led her to study psychology at Durham
              University, in search of a real answer, not just another way
              to track the problem. NeuroAtlas is what she built to close
              that gap.
            </p>
            <p className="mt-6 border-l-2 border-gold-deep pl-4 text-pretty text-lg font-medium text-navy/90">
              What started as a question became NeuroAtlas.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
