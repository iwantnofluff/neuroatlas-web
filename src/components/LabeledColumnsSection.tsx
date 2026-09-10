import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

type Column = {
  label: string;
  items: string[];
};

type LabeledColumnsSectionProps = {
  heading: string;
  body: string;
  columns: Column[];
  closingLine?: string;
  background: "cream" | "navy-soft";
};

/**
 * Shared "labelled bullet columns" layout — a heading + intro line, then
 * a row of side-by-side labelled lists. One component covers three
 * different sections across two pages that are all genuinely the same
 * shape once you strip the copy away:
 *  - /for-organisations' "Your Data Stays Yours" (individual vs
 *    organisation, 2 columns)
 *  - /privacy's "Nothing Hidden, Nothing Assumed" (collect/store/never
 *    share, 3 columns)
 *  - /privacy's "The Line We Do Not Cross" (you vs your employer, 2
 *    columns)
 * `columns.length` drives the grid breakpoint rather than a fixed
 * 2-column assumption, so the 3-column case doesn't need its own file.
 */
export function LabeledColumnsSection({
  heading,
  body,
  columns,
  closingLine,
  background,
}: LabeledColumnsSectionProps) {
  const dark = background === "navy-soft";

  return (
    <section className={cn(dark && "dark-glow bg-navy-soft text-cream")}>
      <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
        <Reveal y={20}>
          <h2
            className={cn(
              "text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl",
              !dark && "text-navy"
            )}
          >
            {heading}
          </h2>
          <p
            className={cn(
              "mx-auto mt-6 max-w-xl text-pretty text-lg",
              dark ? "text-cream/75" : "text-mist"
            )}
          >
            {body}
          </p>
        </Reveal>

        <div
          className={cn(
            "mt-12 grid gap-6",
            columns.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
          )}
        >
          {columns.map((column, i) => (
            <Reveal
              key={column.label}
              delay={i * 0.1}
              className={cn(
                "rounded-2xl p-8 text-left",
                dark ? "card-glass bg-transparent" : "card-glass-light"
              )}
            >
              <p className="eyebrow">{column.label}</p>
              <ul
                className={cn(
                  "mt-4 space-y-2 text-pretty text-base",
                  dark ? "text-cream/80" : "text-navy/80"
                )}
              >
                {column.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-2.5 size-1 shrink-0 rounded-full",
                        dark ? "bg-gold/70" : "bg-gold-deep"
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {closingLine && (
          <Reveal delay={0.2} className="mt-10">
            <p
              className={cn(
                "text-pretty text-base font-medium",
                dark ? "text-cream/90" : "text-navy/80"
              )}
            >
              {closingLine}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
