"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Usage:
 *
 * <RevealFooter footer={<SiteFooter />}>
 *   <Hero />
 *   <Pets />
 * </RevealFooter>
 *
 * Renders `children` above a footer that stays hidden until the page
 * finishes scrolling past it, then gets uncovered like a curtain.
 */
export default function RevealFooter({ children, footer, className = "" }) {
  const footerRef = useRef(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const syncHeight = () => setFooterHeight(footerEl.offsetHeight);

    syncHeight();
    window.addEventListener("resize", syncHeight);

    const observer = new ResizeObserver(syncHeight);
    observer.observe(footerEl);

    return () => {
      window.removeEventListener("resize", syncHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className={`relative z-[1] bg-inherit ${className}`}>{children}</div>
      <div style={{ height: footerHeight }} />
      <footer ref={footerRef} className="fixed inset-x-0 bottom-0 z-0">
        {footer}
      </footer>
    </>
  );
}
