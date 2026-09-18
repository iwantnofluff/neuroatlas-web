"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type View = "individual" | "organisation";

const INDIVIDUAL_FAQS = [
  {
    question: "How is this different from a wellness or meditation app?",
    answer:
      "Wellness and meditation apps offer general exercises. NeuroAtlas reads your actual physiological signals through the NA·01 band, so what you're offered is based on what's happening in your system right now, and you can see whether it worked.",
  },
  {
    question: "How does it compare to other fitness or health trackers?",
    answer:
      "Most trackers show you raw numbers, like heart rate or sleep score, and leave you to interpret them. NeuroAtlas turns those signals into specific measures, like Stress Age, Recovery Capacity and Cognitive Load, and pairs them with tools to act on what it finds.",
  },
  {
    question: "Does the app work without the band?",
    answer:
      "The NA·01 band is required for the full NeuroAtlas experience. It's what reads the physiological signals the app relies on, so the app is built to work alongside it rather than as a standalone tool.",
  },
  {
    question:
      "How long does a session take, and how much time does it need each day?",
    answer:
      "Session length depends on which tool you're using; most are built to fit into a few minutes, not a lengthy routine. Exact timings for each toolkit are still being finalised.",
  },
  {
    question: "Do I have to wear the band all the time?",
    answer:
      "NeuroAtlas is designed to build a picture of your system over time, so it works best worn consistently through the day. There's no requirement to wear it while charging or whenever it doesn't make sense to.",
  },
  {
    question:
      "When will it be available, what will it cost, and how does the waiting list work?",
    answer:
      "Pricing and the exact launch timeline are still being finalised. Request access and we'll be in touch as soon as we're ready to bring you in.",
  },
];

const ORGANISATION_FAQS = [
  {
    question: "Can an employer see an individual employee's results?",
    answer:
      "No. Individuals own their own NeuroAtlas data. Organisations only ever see anonymous, group-level trends, never an individual's own results.",
  },
  {
    question: "What exactly does the leadership dashboard show?",
    answer:
      "It shows how pressure is moving through the organisation at a group level: composure trends over time, teams showing signs of elevated pressure, platform engagement, and how those numbers are shifting quarter over quarter. Individual results are never part of it.",
  },
  {
    question: "How does a pilot programme work, and how long does it run?",
    answer:
      "A pilot moves through four stages: agreeing the scope and timeline together, onboarding your team, measuring through the pilot period with a baseline reading at the start, and a review that shows the shift. Exact pilot length is agreed with each organisation individually.",
  },
  {
    question:
      "Who owns the data, and what happens to it if we end the contract?",
    answer:
      "Individuals own their own personal data at all times. What happens to organisational data on contract exit is covered in our security overview, available to download on the For Organisations page.",
  },
  {
    question: "How is the data kept secure and compliant?",
    answer:
      "Security and compliance details, including encryption standards and data residency, are covered in our downloadable security overview on the For Organisations page.",
  },
  {
    question: "How do we get started?",
    answer:
      "Book a presentation with our team, or download the overview to share internally first. From there, we agree a pilot scope together.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  reduceMotion,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="card-glass overflow-hidden bg-transparent">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-pretty font-serif text-lg text-cream">
          {question}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 text-cream/50 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-pretty text-base text-cream/70">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export function FaqAccordion() {
  const [view, setView] = useState<View>("individual");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useSafeReducedMotion();
  const faqs = view === "individual" ? INDIVIDUAL_FAQS : ORGANISATION_FAQS;

  function selectView(next: View) {
    setView(next);
    setOpenIndex(0);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div
        role="tablist"
        aria-label="View FAQs for"
        className="relative mx-auto flex w-full max-w-sm rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md"
      >
        {(["individual", "organisation"] as const).map((option) => (
          <motion.button
            key={option}
            role="tab"
            type="button"
            aria-selected={view === option}
            onClick={() => selectView(option)}
            whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
            className={cn(
              "relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
              view === option ? "text-navy" : "text-cream/60"
            )}
          >
            {option === "individual" ? "For Individuals" : "For Organisations"}
            {view === option && (
              <motion.span
                layoutId="faq-toggle-thumb"
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-cream to-gold/50"
              />
            )}
          </motion.button>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-md text-pretty text-center text-base text-cream/60">
        Choose your side and find the answers that matter to you.
      </p>

      <div className="mt-10 grid gap-4">
        {faqs.map((faq, i) => (
          <FaqItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}
