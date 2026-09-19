"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

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
