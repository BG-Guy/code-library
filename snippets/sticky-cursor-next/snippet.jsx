"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, animate, transform } from "framer-motion";

/**
 * const btnRef = useRef(null);
 * <button ref={btnRef}>Hover me</button>
 * <StickyCursor targets={[btnRef]} />
 *
 * targets is an array of refs to the elements the cursor should stick to.
 * On coarse-pointer (touch) devices a draggable handle also renders, so
 * the effect can be demoed without a mouse.
 */
export default function StickyCursor({ targets, size = 15, stickySize = 60, pull = 0.1 }) {
  const cursorRef = useRef(null);
  const activeRef = useRef(null);
  const [cursorSize, setCursorSize] = useState(size);

  const mouse = { x: useMotionValue(0), y: useMotionValue(0) };
  const scale = { x: useMotionValue(1), y: useMotionValue(1) };
  const smooth = {
    x: useSpring(mouse.x, { damping: 20, stiffness: 300, mass: 0.5 }),
    y: useSpring(mouse.y, { damping: 20, stiffness: 300, mass: 0.5 }),
  };

  function update(clientX, clientY) {
    const hit = targets
      .map((r) => r.current)
      .find((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      });

    if ((hit || null) !== activeRef.current) {
      activeRef.current = hit || null;
      setCursorSize(hit ? stickySize : size);
      if (!hit) animate(cursorRef.current, { scaleX: 1, scaleY: 1 }, { duration: 0.15 });
    }

    if (hit) {
      const rect = hit.getBoundingClientRect();
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const dist = { x: clientX - center.x, y: clientY - center.y };
      animate(cursorRef.current, { rotate: Math.atan2(dist.y, dist.x) + "rad" }, { duration: 0 });

      const abs = Math.max(Math.abs(dist.x), Math.abs(dist.y));
      scale.x.set(transform(abs, [0, rect.height / 2], [1, 1.3]));
      scale.y.set(transform(abs, [0, rect.width / 2], [1, 0.8]));

      mouse.x.set(center.x - stickySize / 2 + dist.x * pull);
      mouse.y.set(center.y - stickySize / 2 + dist.y * pull);
    } else {
      mouse.x.set(clientX - size / 2);
      mouse.y.set(clientY - size / 2);
    }
  }

  useEffect(() => {
    const onMove = (e) => update(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ---- Touch/mobile: a draggable handle stands in for a real mouse ----
  const handleRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);
  const HANDLE_OFFSET_Y = 56;

  useEffect(() => {
    setIsTouch(matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    handle.style.left = innerWidth / 2 - 22 + "px";
    handle.style.top = innerHeight / 2 + HANDLE_OFFSET_Y - 22 + "px";

    let dragging = false;
    const onStart = (e) => {
      dragging = true;
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      const t = e.touches[0];
      handle.style.left = t.clientX - 22 + "px";
      handle.style.top = t.clientY - 22 + "px";
      update(t.clientX, t.clientY - HANDLE_OFFSET_Y);
    };
    const onEnd = () => {
      dragging = false;
    };

    handle.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      handle.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isTouch]);

  return (
    <>
      <motion.div
        ref={cursorRef}
        style={{ left: smooth.x, top: smooth.y, scaleX: scale.x, scaleY: scale.y }}
        animate={{ width: cursorSize, height: cursorSize }}
        transition={{ type: "spring", stiffness: 400, damping: 17, mass: 0.6 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-black"
      />
      {isTouch && (
        <div
          ref={handleRef}
          className="fixed z-[10000] h-11 w-11 rounded-full border-2 border-black/70 bg-white/60 backdrop-blur-sm"
          style={{ touchAction: "none" }}
        />
      )}
    </>
  );
}
