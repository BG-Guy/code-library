const STYLE_ID = "dot-underline-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .du-dot {
      position: absolute;
      bottom: -6px;
      left: calc(50% - 3px);
      width: 6px;
      height: 6px;
      border-radius: 999px;
      opacity: 0;
      transform: translateY(6px);
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

function initDotUnderline(link, { color = "currentColor" } = {}) {
  ensureStyles();
  link.style.position = "relative";

  const dot = document.createElement("span");
  dot.className = "du-dot";
  dot.style.background = color;
  link.appendChild(dot);

  let currentAnimation = null;

  async function grow() {
    currentAnimation?.cancel();
    // Phase 1: rise up from just beneath the link, fading in as a small dot
    currentAnimation = dot.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      { duration: 150, easing: "ease-out", fill: "forwards" }
    );
    await currentAnimation.finished;

    // Phase 2: stretch the dot into a full-width underline
    currentAnimation = dot.animate(
      [
        { width: "6px", height: "6px", left: "calc(50% - 3px)", borderRadius: "999px" },
        { width: "100%", height: "2px", left: "0%", borderRadius: "0px" },
      ],
      { duration: 200, easing: "ease-in-out", fill: "forwards" }
    );
  }

  async function shrink() {
    currentAnimation?.cancel();
    // Phase 1: contract the bar back down into a dot
    currentAnimation = dot.animate(
      [
        { width: "100%", height: "2px", left: "0%", borderRadius: "0px" },
        { width: "6px", height: "6px", left: "calc(50% - 3px)", borderRadius: "999px" },
      ],
      { duration: 200, easing: "ease-in-out", fill: "forwards" }
    );
    await currentAnimation.finished;

    // Phase 2: sink back down beneath the link, fading out
    currentAnimation = dot.animate(
      [
        { opacity: 1, transform: "translateY(0px)" },
        { opacity: 0, transform: "translateY(6px)" },
      ],
      { duration: 150, easing: "ease-out", fill: "forwards" }
    );
  }

  // Detect per-interaction, not per-device: a mouse click already had a real
  // hover before it, so it can activate immediately. A touch tap gets primed
  // first and only activates on a second tap of the same link.
  let lastPointerType = "mouse";
  let isPrimed = false;

  link.addEventListener("pointerdown", (e) => {
    lastPointerType = e.pointerType;
  });
  link.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") grow();
  });
  link.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") shrink();
  });

  link.addEventListener("click", (e) => {
    if (lastPointerType !== "touch") return;

    if (!isPrimed) {
      e.preventDefault();
      grow();
      isPrimed = true;
    } else {
      shrink();
      isPrimed = false;
    }
  });

  document.addEventListener("click", (e) => {
    if (isPrimed && !link.contains(e.target)) {
      shrink();
      isPrimed = false;
    }
  });
}

// Usage — wire up every link in a nav bar in one line
document.querySelectorAll("nav a").forEach((link) => {
  initDotUnderline(link, { color: "#4f46e5" });
});
