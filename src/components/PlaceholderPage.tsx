import { ShimmerLink } from "@/components/ui/shimmer-button";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  body: string;
};

/**
 * Shared shell for pages whose copy has not been finalised yet.
 * Keeps every nav/footer link resolving to a real, on-brand page
 * instead of a 404 while content is pending — swap in the real
 * page build once copy lands.
 */
export function PlaceholderPage({ eyebrow, title, body }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 pt-32 pb-24 lg:px-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight text-navy lg:text-5xl">
        {title}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-mist">{body}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ShimmerLink
          href="/request-access"
          background="color-mix(in oklab, var(--color-navy) 25%, transparent)"
          shimmerColor="var(--color-gold-deep)"
          className="text-sm tracking-wide text-navy"
        >
          Request access
        </ShimmerLink>
        <ShimmerLink
          href="/"
          background="color-mix(in oklab, var(--color-navy) 25%, transparent)"
          shimmerColor="var(--color-gold-deep)"
          className="text-sm tracking-wide text-navy"
        >
          Back to home
        </ShimmerLink>
      </div>
    </main>
  );
}
