"use client";

import { useEffect, useState } from "react";
import { motion, useAnimate } from "framer-motion";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * <HoverCarouselWrapper direction="y" isLink color="#4f46e5">
 *   <span>Work</span>
 * </HoverCarouselWrapper>
 *
 * direction: "y" rolls the duplicate label in from below, "x" from the side.
 * isLink: when true, an underline grows from a centered dot into a full bar
 * while hovered, then shrinks back to a dot on hover-out (color drives both).
 */
export function HoverCarouselWrapper({ className, children, direction = "y", isLink = false, color = "currentColor" }) {
  const [isHover, setIsHover] = useState(false);
  const [scope, animate] = useAnimate();

  const secondCopyStyle =
    direction === "y" ? { transform: "translateY(100%)" } : { transform: "translateX(100%)" };

  useEffect(() => {
    if (!isLink) return;

    async function animateIn() {
      await animate(scope.current, { opacity: 1, top: "120%" }, { duration: 0.2, ease: "circInOut" });
      await animate(scope.current, { width: "100%", height: 2, left: 0, borderRadius: 0 }, { duration: 0.2, ease: "circInOut" });
    }

    async function animateOut() {
      await animate(scope.current, { width: 4, height: 4, left: "calc(50% - 2px)", borderRadius: "100%" }, { duration: 0.2, ease: "circInOut" });
      await animate(scope.current, { opacity: 0, top: "180%" }, { duration: 0.2, ease: "circInOut" });
    }

    if (isHover) animateIn();
    else animateOut();
  }, [isHover, animate, scope, isLink]);

  return (
    <div className="relative">
      <motion.div
        onPointerEnter={() => setIsHover(true)}
        onPointerLeave={() => setIsHover(false)}
        className={cn("relative flex h-full w-full cursor-pointer flex-col justify-start overflow-hidden", className)}
      >
        <motion.div
          initial={{ [direction]: "-100%" }}
          animate={{ [direction]: isHover ? "0%" : "-100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex h-full w-full items-center justify-center"
        >
          <div className="flex h-full w-full items-center justify-center">{children}</div>
          <motion.div style={secondCopyStyle} className="absolute flex h-full w-full items-center justify-center">
            {children}
          </motion.div>
        </motion.div>
      </motion.div>

      {isLink && (
        <motion.span
          ref={scope}
          initial={{ width: 4, height: 4, left: "calc(50% - 2px)", opacity: 0, borderRadius: "100%" }}
          style={{ backgroundColor: color }}
          className="absolute"
        />
      )}
    </div>
  );
}
