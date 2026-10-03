"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Usage:
 *
 * <StepShowcase
 *   steps={[
 *     {
 *       badge: "01",
 *       heading: "One Tap Books It",
 *       desc: "Send a link, they pick a time — no phone tag.",
 *       color: "#FF6B35",
 *       bg: "linear-gradient(160deg,#160f40 0%,#050311 100%)",
 *       content: <PhoneMockup>Booked</PhoneMockup>,
 *     },
 *     // ...more steps
 *   ]}
 * />
 */
export default function StepShowcase({ steps }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const step = steps[index];

  function goTo(i) {
    if (i === index || i < 0 || i >= steps.length) return;
    setDir(i > index ? 1 : -1);
    setIndex(i);
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-3xl text-white">
      <AnimatePresence>
        <motion.div
          key={step.bg}
          className="absolute inset-0"
          style={{ background: step.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-8 py-14 md:min-h-[480px] md:flex-row md:gap-14">
        <div className="flex flex-col items-center gap-4 md:flex-[0_0_42%] md:items-start">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold transition-colors duration-500"
            style={{ background: step.color }}
          >
            {step.badge}
          </span>

          <div className="overflow-hidden text-center md:text-left">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ y: dir > 0 ? "110%" : "-110%" }}
                animate={{ y: 0 }}
                exit={{ y: dir > 0 ? "-110%" : "110%" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="text-3xl font-extrabold leading-tight md:text-4xl">
                  {step.heading}
                </h3>
                <p className="mt-3 max-w-sm text-white/70">{step.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative flex min-h-[380px] flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {step.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-4">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous step"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 disabled:opacity-25"
        >
          ‹
        </button>
        <div className="flex items-center gap-2" role="tablist">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={"Step " + (i + 1)}
              className={
                i === index
                  ? "h-1.5 w-6 rounded-full bg-white transition-all duration-300"
                  : "h-1.5 w-1.5 rounded-full bg-white/25 transition-all duration-300"
              }
            />
          ))}
        </div>
        <button
          onClick={() => goTo(index + 1)}
          disabled={index === steps.length - 1}
          aria-label="Next step"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 disabled:opacity-25"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function PhoneMockup({ children }) {
  return (
    <div className="relative h-[420px] w-[210px] rounded-[40px] bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[0_0_0_1.5px_rgba(255,255,255,0.12),0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-[32px]">
        {children}
      </div>
    </div>
  );
}
