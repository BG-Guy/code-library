/* ---- CSS (add once to your stylesheet) ----
.tp-viewport { overflow: hidden; }
.tp-row { display: flex; white-space: nowrap; will-change: transform; }
.tp-item { padding: 0 1.5rem; font-weight: 800; }
------------------------------------------------ */

/**
 * Markup contract — one .tp-row per line of text, repeated .tp-item spans
 * inside each row until it comfortably overflows edge-to-edge:
 *
 * <div class="tp-viewport">
 *   <div class="tp-row" data-direction="left">
 *     <span class="tp-item">Front End Developer</span>
 *     <span class="tp-item">Front End Developer</span>
 *     <span class="tp-item">Front End Developer</span>
 *   </div>
 *   <div class="tp-row" data-direction="right"> ... </div>
 * </div>
 */
function createTextParallax(viewport, { speed = 150 } = {}) {
  const rows = [...viewport.querySelectorAll("[data-direction]")];

  function progress() {
    const rect = viewport.getBoundingClientRect();
    const start = window.innerHeight; // viewport's top hits the bottom of the screen -> 0
    const end = -rect.height;         // viewport's bottom hits the top of the screen -> 1
    return Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
  }

  function update() {
    const p = progress();
    for (const row of rows) {
      const dir = row.dataset.direction === "right" ? 1 : -1;
      row.style.transform = `translateX(${speed * dir * (2 * p - 1)}px)`;
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  return {
    update,
    destroy() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    },
  };
}

// Usage
createTextParallax(document.querySelector(".tp-viewport"), { speed: 180 });
