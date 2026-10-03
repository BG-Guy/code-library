"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Usage:
 *
 * <TextParallax
 *   rows={[
 *     { text: "Front End Developer", direction: "left", image: "/1.jpg" },
 *     { text: "Creative Coder", direction: "right", image: "/2.jpg" },
 *     { text: "Open To Work", direction: "left", image: "/3.jpg" },
 *   ]}
 * />
 *
 * Render it between two full-height spacer sections — the effect is driven
 * by how far the component has scrolled through the viewport, not a timer.
 */
export default function TextParallax({ rows, speed = 150 }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={container} className="overflow-hidden">
      {rows.map((row, i) => (
        <ParallaxRow key={i} {...row} speed={speed} progress={scrollYProgress} />
      ))}
    </div>
  );
}

function ParallaxRow({ text, direction = "left", image, speed, progress }) {
  const dir = direction === "right" ? 1 : -1;
  const x = useTransform(progress, [0, 1], [speed * dir, -speed * dir]);

  return (
    <motion.div style={{ x }} className="relative flex whitespace-nowrap">
      {[0, 1, 2].map((i) => (
        <Phrase key={i} text={text} image={image} />
      ))}
    </motion.div>
  );
}

function Phrase({ text, image }) {
  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-[7.5vw] font-bold leading-none">{text}</p>
      {image && (
        <span className="relative aspect-[4/2] h-[7.5vw] overflow-hidden rounded-full">
          <Image src={image} alt="" fill style={{ objectFit: "cover" }} />
        </span>
      )}
    </div>
  );
}
