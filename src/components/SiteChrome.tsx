"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  // iOS Safari only applies :active (the touch press states in
  // globals.css) once the document has a touchstart listener.
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <div className="marketing-shell flex min-h-full flex-1 flex-col bg-cream font-sans text-ink">
      <SmoothScroll />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
