import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";
import { cn } from "@/lib/utils";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

// Real app UI font is "Google Sans Flex" (Google's internal typeface, not
// publicly self-hostable). Plus Jakarta Sans is used elsewhere in the same
// Figma file and is the closest free, metrically-similar substitute.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroAtlas — The First Stress Management Band",
  description:
    "Know when pressure is building, and reset before it takes over.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", fraunces.variable, jakarta.variable)}
    >
      <body className="min-h-full flex flex-col bg-cream font-sans text-ink">
        <SmoothScroll />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
