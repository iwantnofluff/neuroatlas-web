import type { ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";
import { cn } from "@/lib/utils";

type FeatureSplitSectionProps = {
  id?: string;
  eyebrow?: string;
  heading: string;
  body: ReactNode;
  /** Which side the media panel sits on at the lg breakpoint. On mobile
   *  the media always shows first regardless — see the order-utility
   *  note below, matching every other image+text section on this site. */
  imageSide: "left" | "right";
  background: "cream" | "navy" | "navy-soft";
  /** Real content to use as the media half instead of the default
   *  placeholder panel — e.g. an existing proof/stat card that already
   *  serves as this section's visual, rather than burying it behind a
   *  generic box. */
  media?: ReactNode;
};

/**
 * Reusable 50/50 two-column section for /how-it-works: heading + body copy
 * on one side, a focal visual (a placeholder for now, real media later) on
 * the other.
 *
 * DOM order is ALWAYS [text, media] — desktop left/right is controlled
 * purely with `order` utilities, not by swapping the JSX, which is what
 * keeps "media shows first on mobile" uniform regardless of which side it
 * ends up on at desktop: the text block carries a base `order-2` (so the
 * media panel, left at its default `order-0`, is always first once the
 * grid stacks to one column on mobile); `imageSide="right"` then adds
 * `lg:order-1` to flip text back in front at the two-column breakpoint,
 * with the media panel picking up the matching `lg:order-2`. `imageSide=
 * "left"` needs nothing extra — the media panel already defaults to first
 * at every breakpoint, mobile and desktop alike.
 */
export function FeatureSplitSection({
  id,
  eyebrow,
  heading,
  body,
  imageSide,
  background,
  media,
}: FeatureSplitSectionProps) {
  const dark = background !== "cream";
  const sectionClassName =
    background === "navy"
      ? "dark-glow bg-navy text-cream"
      : background === "navy-soft"
        ? "dark-glow bg-navy-soft text-cream"
        : undefined;

  return (
    <section id={id} className={sectionClassName}>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal
            y={20}
            className={cn(
              "order-2 text-center lg:text-left",
              imageSide === "right" && "lg:order-1"
            )}
          >
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2
              className={cn(
                "font-serif text-3xl leading-tight lg:text-4xl",
                eyebrow && "mt-4",
                !dark && "text-navy"
              )}
            >
              {heading}
            </h2>
            <div
              className={cn(
                "mx-auto mt-6 max-w-xl text-lg lg:mx-0",
                dark ? "text-cream/75" : "text-mist"
              )}
            >
              {body}
            </div>
          </Reveal>

          <Reveal
            delay={0.1}
            y={20}
            className={cn(imageSide === "right" && "lg:order-2")}
          >
            <Parallax
              offset={24}
              className="relative aspect-square overflow-hidden rounded-3xl"
            >
              {media ?? (
                <div
                  className={cn(
                    "flex size-full items-center justify-center",
                    dark ? "card-glass" : "card-glass-light"
                  )}
                >
                  <ImageIcon
                    aria-hidden="true"
                    strokeWidth={1.25}
                    className={cn("size-12", dark ? "text-cream/20" : "text-navy/15")}
                  />
                </div>
              )}
            </Parallax>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
