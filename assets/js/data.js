/* Code Library — snippet dataset.
   Plain JS array (not fetched) so the site also works when opened via file://.
   Scope: web development only — vanilla JavaScript (frontend), and React/Next.js. */

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  react: "React / Next.js",
};

// Shared badge markup for a snippet's language(s) — used by the home grid,
// the related-snippets grid, and the detail page header, so a multi-language
// snippet (e.g. a vanilla + React card) always renders the same badges
// everywhere instead of drifting per call site.
function langBadgesMarkup(languages) {
  if (languages.length > 1) {
    return `<span class="lang-badge-group">${languages.map((l) => `<span class="lang-badge lang-badge-${l}">${l}</span>`).join("")}</span>`;
  }
  return `<span class="lang-badge">${languages[0]}</span>`;
}

const SNIPPETS = [
  {
    id: "curve-page-transition",
    title: "Curve Page Transition",
    language: "javascript",
    tags: ["animation", "svg", "transitions", "requestanimationframe"],
    difficulty: "Advanced",
    description: "A colored SVG panel with a curved leading edge sweeps over the page, swaps the content while it's fully hidden, then sweeps away again — a framework-free take on the 'wipe' route transitions popular on portfolio sites.",
    explanation: `A single SVG \`<path>\` is redrawn on every animation frame to sweep a colored panel across the screen, covering the page just long enough to swap its content, then sweeping away again to reveal it.

**How it works**

1. \`buildPanelPath\` computes a fresh \`d\` string every frame — a rectangle down to \`height - bulge\`, capped with one quadratic curve (\`Q\`) that bulges back up to the same height on the far side. That single curve is the panel's "wave" edge; when \`bulge\` is \`0\` it collapses into a flat, straight line.
2. \`animate("in")\` and \`animate("out")\` both drive the same \`requestAnimationFrame\` loop, just moving \`travel\` — how far down the panel currently reaches — in opposite directions: \`0 → height\` to cover the screen, \`height → 0\` to reveal it again.
3. \`bulge\` is driven by \`Math.sin(eased * Math.PI)\`, which starts at \`0\`, peaks exactly at the animation's midpoint, and returns to \`0\` by the end — so the curve appears while the panel is mid-motion and disappears the instant it settles, on both the way in and the way out.
4. \`easeInOutCubic\` shapes the raw linear progress (\`0\` to \`1\`) into a slow-fast-slow curve before it's used for anything, which is what keeps the sweep from feeling mechanical.
5. \`curveTransition(...).run(swapContent)\` chains the two phases around a real DOM mutation: cover completely, run \`swapContent()\` while nothing is visible, then reveal — the viewer never actually sees the underlying content change.

Because it's just path math driven by \`requestAnimationFrame\`, this works in any vanilla project with zero dependencies, and doesn't rely on any framework's mount/unmount lifecycle to know when to animate.`,
    code: `function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function buildPanelPath(width, height, bulge) {
  // The bottom edge bulges downward by \`bulge\` px at the midpoint,
  // and flattens into a straight line as \`bulge\` approaches 0.
  return \`M0,0 L\${width},0 L\${width},\${height - bulge} Q\${width / 2},\${height + bulge} 0,\${height - bulge} Z\`;
}

function curveTransition({ container, color = "#4f46e5", duration = 650 } = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", color);
  svg.appendChild(path);
  container.appendChild(svg);

  function animate(direction) {
    // "in"  -> panel grows to cover the container (0 -> full height)
    // "out" -> panel shrinks away, revealing new content (full -> 0)
    return new Promise((resolve) => {
      const start = performance.now();
      const { width, height } = container.getBoundingClientRect();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeInOutCubic(t);
        const travel = direction === "in" ? eased * height : (1 - eased) * height;
        const bulge = Math.sin(eased * Math.PI) * (height * 0.08);

        path.setAttribute("d", buildPanelPath(width, travel, bulge));
        t < 1 ? requestAnimationFrame(frame) : resolve();
      }

      requestAnimationFrame(frame);
    });
  }

  return {
    async run(swapContent) {
      await animate("in");  // cover the container
      swapContent();         // swap the DOM while it's fully hidden
      await animate("out"); // reveal the new content
      svg.remove();
    },
  };
}

// Usage
const transition = curveTransition({ container: document.getElementById("app") });

link.addEventListener("click", (e) => {
  e.preventDefault();
  transition.run(() => {
    document.getElementById("app").innerHTML = renderNextPage();
  });
});`,
    preview: {
      type: "html",
      height: 340,
      markup: `<div class="relative mx-auto h-64 w-full max-w-sm overflow-hidden rounded-xl bg-slate-100" id="stage">
  <div class="absolute inset-0 flex items-center justify-center bg-indigo-50 text-indigo-900" id="pageA">
    <p class="text-lg font-semibold">Page A</p>
  </div>
  <div class="absolute inset-0 hidden items-center justify-center bg-amber-50 text-amber-900" id="pageB">
    <p class="text-lg font-semibold">Page B</p>
  </div>
</div>
<div class="mt-4 flex justify-center">
  <button id="go" class="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Go to Page B</button>
</div>
<script>
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; }

  function buildPanelPath(width, height, bulge) {
    return "M0,0 L" + width + ",0 L" + width + "," + (height - bulge) +
      " Q" + (width / 2) + "," + (height + bulge) + " 0," + (height - bulge) + " Z";
  }

  const stage = document.getElementById("stage");
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "pointer-events-none absolute inset-0 h-full w-full");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("fill", "#4f46e5");
  svg.appendChild(path);
  stage.appendChild(svg);

  function animate(direction) {
    return new Promise((resolve) => {
      const start = performance.now();
      const duration = 550;
      const rect = stage.getBoundingClientRect();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeInOutCubic(t);
        const travel = direction === "in" ? eased * rect.height : (1 - eased) * rect.height;
        const bulge = Math.sin(eased * Math.PI) * (rect.height * 0.08);
        path.setAttribute("d", buildPanelPath(rect.width, travel, bulge));
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }

      requestAnimationFrame(frame);
    });
  }

  let showingB = false;
  document.getElementById("go").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    await animate("in");
    showingB = !showingB;
    document.getElementById("pageA").classList.toggle("hidden", showingB);
    document.getElementById("pageA").classList.toggle("flex", !showingB);
    document.getElementById("pageB").classList.toggle("hidden", !showingB);
    document.getElementById("pageB").classList.toggle("flex", showingB);
    btn.textContent = showingB ? "Back to Page A" : "Go to Page B";
    await animate("out");
    btn.disabled = false;
  });
<\/script>`,
    },
  },
  {
    id: "inner-page-transition",
    title: "Slide-Cover Page Transition",
    language: "javascript",
    tags: ["animation", "css-transitions", "transitions"],
    difficulty: "Intermediate",
    description: "Slide a panel up to cover the outgoing page while it shrinks back in perspective, swap the content underneath, then slide the panel away to reveal it — pure CSS transitions orchestrated by a few lines of JS.",
    explanation: `Two CSS classes describe the two visual states this transition moves between, and a small JS function toggles them with the right timing — no animation library required.

**How it works**

1. \`ensureStyles\` injects one \`<style>\` tag with the CSS this transition needs, only once — the same trick a small vanilla-JS library would use to ship its own styles without a separate stylesheet.
2. Adding \`is-leaving\` to the content triggers its own CSS transition: it scales down slightly and moves up a bit, reading as the page being pushed back in space. Adding \`is-covering\` to the panel slides it from fully below the viewport (\`translateY(100%)\`) up to its resting position, covering everything.
3. Both transitions share the same \`duration\` and easing curve, so a plain \`setTimeout(fn, duration)\` is a reliable enough stand-in for "wait until both animations finish" without wiring up two separate \`transitionend\` listeners.
4. The moment that timeout fires, the panel is fully covering the screen — that's exactly when \`swapContent()\` runs and \`is-leaving\` is removed, so the *next* page is sitting there, already back at its resting scale and position, just hidden behind the panel.
5. Removing \`is-covering\` on the following frame — via \`requestAnimationFrame\`, so the browser gets a chance to paint the reset content first — starts the panel's exit transition, sliding it back down and revealing the new page underneath.

This is a reusable template for any "cover, swap, reveal" transition: two CSS classes for the visual states, and one small function that toggles them with the right timing in between.`,
    code: `const STYLE_ID = "inner-transition-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .page-content {
      transition: transform 0.6s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.6s ease;
    }
    .page-content.is-leaving {
      transform: translateY(-40px) scale(0.94);
      opacity: 0.6;
    }
    .cover-panel {
      position: absolute;
      inset: 0;
      transform: translateY(100%);
      transition: transform 0.6s cubic-bezier(0.76, 0, 0.24, 1);
    }
    .cover-panel.is-covering {
      transform: translateY(0);
    }
  \`;
  document.head.appendChild(style);
}

function innerTransition({ panel, content, swapContent, duration = 600 }) {
  ensureStyles();

  return new Promise((resolve) => {
    // 1. push the outgoing content back and slide the cover panel up
    content.classList.add("is-leaving");
    panel.classList.add("is-covering");

    setTimeout(() => {
      // 2. content is now fully hidden behind the panel — swap it instantly
      swapContent();
      content.classList.remove("is-leaving");

      // 3. slide the panel back down, revealing the new content underneath
      requestAnimationFrame(() => panel.classList.remove("is-covering"));
      setTimeout(resolve, duration);
    }, duration);
  });
}

// Usage
const panel = document.querySelector(".cover-panel");
const content = document.querySelector(".page-content");

link.addEventListener("click", (e) => {
  e.preventDefault();
  innerTransition({
    panel,
    content,
    swapContent: () => {
      content.innerHTML = renderNextPage();
    },
  });
});`,
    preview: {
      type: "html",
      height: 340,
      markup: `<div class="relative mx-auto h-64 w-full max-w-sm overflow-hidden rounded-xl bg-slate-100">
  <div class="page-content flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-900" id="content">
    <p class="text-lg font-semibold" id="label">Page A</p>
  </div>
  <div class="cover-panel bg-slate-900"></div>
</div>
<div class="mt-4 flex justify-center">
  <button id="go" class="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Go to Page B</button>
</div>
<style>
  .page-content { transition: transform .6s cubic-bezier(.76,0,.24,1), opacity .6s ease; }
  .page-content.is-leaving { transform: translateY(-24px) scale(.94); opacity: .6; }
  .cover-panel { position: absolute; inset: 0; transform: translateY(100%); transition: transform .6s cubic-bezier(.76,0,.24,1); }
  .cover-panel.is-covering { transform: translateY(0); }
</style>
<script>
  let showingB = false;
  const content = document.getElementById("content");
  const label = document.getElementById("label");
  const panel = document.querySelector(".cover-panel");
  const btn = document.getElementById("go");

  function innerTransition(swapContent, duration) {
    return new Promise((resolve) => {
      content.classList.add("is-leaving");
      panel.classList.add("is-covering");
      setTimeout(() => {
        swapContent();
        content.classList.remove("is-leaving");
        requestAnimationFrame(() => panel.classList.remove("is-covering"));
        setTimeout(resolve, duration);
      }, duration);
    });
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    await innerTransition(() => {
      showingB = !showingB;
      label.textContent = showingB ? "Page B" : "Page A";
      content.classList.toggle("bg-indigo-50", !showingB);
      content.classList.toggle("text-indigo-900", !showingB);
      content.classList.toggle("bg-amber-50", showingB);
      content.classList.toggle("text-amber-900", showingB);
      btn.textContent = showingB ? "Back to Page A" : "Go to Page B";
    }, 550);
    btn.disabled = false;
  });
<\/script>`,
    },
  },
  {
    id: "hover-carousel-nav-link",
    title: "Hover Carousel Nav Link",
    language: "javascript",
    languages: ["javascript", "react"],
    tags: ["animation", "navigation", "hover-effects", "dom", "framer-motion", "next.js"],
    difficulty: "Intermediate",
    description: "Turn any nav link into a two-line 'carousel' that rolls a duplicate label in on hover, with a dot-to-bar underline animating underneath — as dependency-free vanilla JS, or a Framer Motion React/Next.js component. Wire up a whole nav bar with one call per link either way.",
    variants: [
      {
        key: "vanilla",
        label: "Vanilla JS",
        language: "javascript",
        explanation: `A common portfolio-site nav effect: hovering a link makes its label appear to scroll away while an identical copy scrolls in from the opposite edge, with a thin underline growing in from a centered dot. Building this by hand normally means duplicating markup per link — this version does it for you from a single function call. (Flip to the React/Next.js tab above for the same effect built on Framer Motion.)

**How it works**

1. \`initHoverCarouselLink\` takes a plain link element, remembers its existing content, then rebuilds the link's \`innerHTML\` around a small internal structure: a clipped \`.hc-viewport\`, a \`.hc-track\` holding two identical copies of that content stacked along the chosen \`direction\`, and an \`.hc-underline\` span.
2. Stacking two copies inside a track that's twice the viewport's size, then clipping the viewport with \`overflow: hidden\`, is what makes the "carousel" illusion possible — only one copy is ever visible at a time, and sliding the track by exactly half its own size swaps which copy shows.
3. On \`pointerenter\`, the track's \`transform\` moves to \`translateY(-50%)\` (or \`translateX(-50%)\` for direction \`"x"\`) — a CSS \`transition\` on \`transform\` animates that shift smoothly, sliding the first copy out one edge exactly as the second, identical copy slides in from the other.
4. \`pointerleave\` simply clears the inline transform, snapping back to the resting position — because both copies are identical, that instant reset is invisible to the eye, so the *next* hover always starts clean.
5. The underline is a separate span whose \`is-active\` class toggles several properties at once — \`width\`, \`height\`, \`border-radius\`, \`left\`, and \`opacity\` — each with its own CSS transition, so a small centered dot smoothly grows into a full-width bar and fades in on hover, then reverses back to a dot on hover-out.
6. Touch devices have no \`pointerenter\`/\`pointerleave\` to speak of, so \`initHoverCarouselLink\` doesn't guess from the device type — it checks the \`pointerType\` of whatever triggered *this* interaction, recorded on \`pointerdown\`. A \`"mouse"\` click fires \`activate\` immediately, since real hover is already showing by the time a mouse click lands; a \`"touch"\` tap is intercepted instead: the *first* one calls \`preventDefault()\` and just plays the hover animation, "priming" the link, and a *second* tap on that same link lets the click go through as a real navigation. Checking per-interaction rather than once via \`matchMedia\` keeps this correct even on hybrid devices — a touchscreen laptop with a trackpad, say — where the device supports both.

Because everything is scoped through a handful of \`hc-*\` classes and one initializer function, wiring this into a whole nav bar is a one-liner per link — no markup duplication required at the call site.`,
        code: `const STYLE_ID = "hover-carousel-link-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .hc-link { position: relative; display: inline-flex; cursor: pointer; }
    .hc-viewport { overflow: hidden; display: inline-block; height: 1.25em; line-height: 1.25em; }
    .hc-track {
      display: flex;
      height: 200%;
      transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .hc-track--y { flex-direction: column; }
    .hc-track--x { flex-direction: row; width: 200%; height: 100%; }
    .hc-copy { display: flex; flex: 1 0 50%; align-items: center; justify-content: center; }

    .hc-underline {
      position: absolute;
      left: 50%;
      bottom: -6px;
      width: 4px;
      height: 4px;
      border-radius: 999px;
      opacity: 0;
      transform: translateX(-50%);
      transition:
        width 0.25s cubic-bezier(0.6, 0.05, 0.15, 0.95),
        height 0.25s ease,
        border-radius 0.25s ease,
        left 0.25s ease,
        opacity 0.25s ease;
    }
    .hc-underline.is-active {
      left: 0;
      width: 100%;
      height: 2px;
      border-radius: 0;
      opacity: 1;
      transform: translateX(0);
    }
  \`;
  document.head.appendChild(style);
}

function initHoverCarouselLink(link, { direction = "y", color = "currentColor" } = {}) {
  ensureStyles();

  const original = link.innerHTML;
  link.classList.add("hc-link");
  link.innerHTML = \`
    <span class="hc-viewport">
      <span class="hc-track hc-track--\${direction}">
        <span class="hc-copy">\${original}</span>
        <span class="hc-copy">\${original}</span>
      </span>
    </span>
    <span class="hc-underline" style="background:\${color}"></span>
  \`;

  const track = link.querySelector(".hc-track");
  const underline = link.querySelector(".hc-underline");
  const shift = direction === "y" ? "translateY(-50%)" : "translateX(-50%)";

  const enter = () => {
    track.style.transform = shift;
    underline.classList.add("is-active");
  };
  const leave = () => {
    track.style.transform = "";
    underline.classList.remove("is-active");
  };

  // Detect per-interaction, not per-device: a mouse click already had a real
  // hover before it, so it can activate immediately. A touch tap gets primed
  // first and only activates on a second tap of the same link.
  let lastPointerType = "mouse";
  let isPrimed = false;

  link.addEventListener("pointerdown", (e) => {
    lastPointerType = e.pointerType;
  });

  link.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") enter();
  });
  link.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") leave();
  });

  link.addEventListener("click", (e) => {
    if (lastPointerType !== "touch") return;

    if (!isPrimed) {
      e.preventDefault();
      enter();
      isPrimed = true;
    } else {
      leave();
      isPrimed = false;
    }
  });

  document.addEventListener("click", (e) => {
    if (isPrimed && !link.contains(e.target)) {
      leave();
      isPrimed = false;
    }
  });
}

// Usage — wire up every link in a nav bar in one line
document.querySelectorAll("nav a").forEach((link) => {
  initHoverCarouselLink(link, { direction: "y", color: "#4f46e5" });
});`,
        preview: {
          type: "html",
          height: 150,
          markup: `<nav class="flex items-center justify-center gap-8 p-10" id="demoNav">
  <a href="#" class="text-sm font-semibold text-slate-800">Home</a>
  <a href="#" class="text-sm font-semibold text-slate-800">Work</a>
  <a href="#" class="text-sm font-semibold text-slate-800">Contact</a>
</nav>
<script>
  function ensureStyles() {
    if (document.getElementById("hc-styles")) return;
    var style = document.createElement("style");
    style.id = "hc-styles";
    style.textContent =
      ".hc-link { position: relative; display: inline-flex; cursor: pointer; }" +
      ".hc-viewport { overflow: hidden; display: inline-block; height: 1.25em; line-height: 1.25em; }" +
      ".hc-track { display: flex; flex-direction: column; height: 200%; transition: transform 0.4s cubic-bezier(0.65,0,0.35,1); }" +
      ".hc-copy { display: flex; flex: 1 0 50%; align-items: center; justify-content: center; }" +
      ".hc-underline { position: absolute; left: 50%; bottom: -6px; width: 4px; height: 4px; border-radius: 999px; opacity: 0; transform: translateX(-50%); transition: width .25s cubic-bezier(.6,.05,.15,.95), height .25s ease, border-radius .25s ease, left .25s ease, opacity .25s ease; }" +
      ".hc-underline.is-active { left: 0; width: 100%; height: 2px; border-radius: 0; opacity: 1; transform: translateX(0); }";
    document.head.appendChild(style);
  }

  function initHoverCarouselLink(link, color) {
    ensureStyles();
    var original = link.innerHTML;
    link.classList.add("hc-link");
    link.innerHTML =
      '<span class="hc-viewport"><span class="hc-track">' +
      '<span class="hc-copy">' + original + '</span>' +
      '<span class="hc-copy">' + original + '</span>' +
      '</span></span>' +
      '<span class="hc-underline" style="background:' + color + '"></span>';

    var track = link.querySelector(".hc-track");
    var underline = link.querySelector(".hc-underline");

    function enter() {
      track.style.transform = "translateY(-50%)";
      underline.classList.add("is-active");
    }
    function leave() {
      track.style.transform = "";
      underline.classList.remove("is-active");
    }

    var lastPointerType = "mouse";
    var isPrimed = false;

    link.addEventListener("pointerdown", function (e) {
      lastPointerType = e.pointerType;
    });
    link.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") enter();
    });
    link.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") leave();
    });

    link.addEventListener("click", function (e) {
      // This demo's links have nowhere real to go, so every tap is
      // intercepted — a real project would drop this preventDefault on
      // the second tap and let the click become a real navigation.
      e.preventDefault();
      if (lastPointerType !== "touch") return;

      if (!isPrimed) {
        enter();
        isPrimed = true;
      } else {
        leave();
        isPrimed = false;
      }
    });

    document.addEventListener("click", function (e) {
      if (isPrimed && !link.contains(e.target)) {
        leave();
        isPrimed = false;
      }
    });
  }

  document.querySelectorAll("#demoNav a").forEach(function (link) {
    initHoverCarouselLink(link, "#4f46e5");
  });
<\/script>`,
        },
      },
      {
        key: "react",
        label: "React / Next.js",
        language: "react",
        explanation: `This is the Framer Motion version of the vanilla hover-carousel link on the other tab — same illusion (two stacked copies of the label, one slides out as an identical one slides in), but the slide is now a declarative \`animate\` prop and the underline is driven imperatively through \`useAnimate\`.

**How it works**

1. \`secondCopyStyle\` positions a duplicate of \`children\` a full \`100%\` along whichever axis \`direction\` is — \`translateY(100%)\` for \`"y"\`, \`translateX(100%)\` for \`"x"\` — the same two-copies-in-a-track trick as the vanilla version's stacked \`.hc-copy\` spans, just expressed as inline style instead of a CSS class.
2. The outer \`motion.div\` animates the whole track between \`{[direction]: "-100%"}\` and \`{[direction]: "0%"}\` based on \`isHover\` — spreading a computed property (\`[direction]\`) is what lets one component drive either a vertical or horizontal carousel off a single \`direction\` prop, instead of writing separate x/y variants.
3. \`useAnimate()\` returns a \`scope\` ref and an imperative, awaitable \`animate()\` — attaching \`scope\` to the underline \`motion.span\` lets the \`useEffect\` step it through the same choreography as the vanilla version's underline transition, just written as two explicit \`await\`ed stages instead of one CSS \`transition\` on several properties: grow a hidden dot into a full-width bar on hover (\`animateIn\`), or shrink it back into a dot and fade it out on hover-out (\`animateOut\`). Awaiting each stage keeps the sequence from overlapping itself if \`isHover\` flips again mid-animation.
4. \`left: "calc(50% - 2px)"\` centers the resting 4px dot without reaching for a \`transform\` — since \`width\`, \`height\`, and \`left\` are already plain values Framer Motion is animating directly, keeping the centering math in \`calc()\` avoids fighting a separate transform over the same element.
5. \`color\` sets the underline's \`backgroundColor\` straight through inline \`style\`, exactly like the vanilla version passes \`color\` into its own inline \`background\` — swapping the accent per link needs no extra CSS either way.

Install \`framer-motion\` as the one dependency, then wrap any label in \`<HoverCarouselWrapper direction="y" isLink color="#4f46e5">\` — pass \`isLink\` for the underline, or leave it off for a carousel with no indicator at all.`,
        code: `"use client";

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
}`,
        preview: {
          type: "html",
          height: 150,
          reactRuntime: true,
          markup: `<nav class="flex items-center justify-center gap-8 p-10" id="demoNavReact"></nav>
<script>
  var e = React.createElement;
  var Motion = window.Motion;

  function cn() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
  }

  function HoverCarouselWrapper(props) {
    var hoverState = React.useState(false);
    var isHover = hoverState[0];
    var setIsHover = hoverState[1];
    var scopeAnimate = Motion.useAnimate();
    var scope = scopeAnimate[0];
    var animate = scopeAnimate[1];

    var secondCopyStyle =
      props.direction === "y" ? { transform: "translateY(100%)" } : { transform: "translateX(100%)" };

    React.useEffect(function () {
      if (!props.isLink) return;

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
    }, [isHover, animate, scope, props.isLink]);

    var animateProp = {};
    animateProp[props.direction] = isHover ? "0%" : "-100%";
    var initialProp = {};
    initialProp[props.direction] = "-100%";

    return e(
      "div",
      { className: "relative" },
      e(
        Motion.motion.div,
        {
          onPointerEnter: function () { setIsHover(true); },
          onPointerLeave: function () { setIsHover(false); },
          className: cn("relative flex h-full w-full cursor-pointer flex-col justify-start overflow-hidden", props.className),
        },
        e(
          Motion.motion.div,
          {
            initial: initialProp,
            animate: animateProp,
            transition: { duration: 0.3, ease: "easeOut" },
            className: "flex h-full w-full items-center justify-center",
          },
          e("div", { className: "flex h-full w-full items-center justify-center" }, props.children),
          e(
            Motion.motion.div,
            { style: secondCopyStyle, className: "absolute flex h-full w-full items-center justify-center" },
            props.children
          )
        )
      ),
      props.isLink &&
        e(Motion.motion.span, {
          ref: scope,
          initial: { width: 4, height: 4, left: "calc(50% - 2px)", opacity: 0, borderRadius: "100%" },
          style: { backgroundColor: props.color },
          className: "absolute h-1",
        })
    );
  }

  function DemoNav() {
    var links = ["Home", "Work", "Contact"];
    return e(
      "nav",
      { className: "flex items-center justify-center gap-8" },
      links.map(function (label, i) {
        return e(
          HoverCarouselWrapper,
          { key: i, direction: "y", isLink: true, color: "#4f46e5", className: "h-6" },
          e(
            "a",
            { href: "#", onClick: function (ev) { ev.preventDefault(); }, className: "text-sm font-semibold text-slate-800" },
            label
          )
        );
      })
    );
  }

  ReactDOM.createRoot(document.getElementById("demoNavReact")).render(e(DemoNav));
<\/script>`,
        },
      },
    ],
  },
  {
    id: "hover-teaser-side-menu",
    title: "Side Menu with Hover Image Teasers",
    language: "javascript",
    tags: ["animation", "navigation", "hover-effects", "menu"],
    difficulty: "Advanced",
    description: "A side-menu nav where hovering a link slides a full-size themed panel out from behind the menu — a preview of where that link leads before you click it.",
    explanation: `A side-menu list where hovering a link slides a differently colored (or photographed) panel out from behind the menu — a subtle way to preview what each link leads to before you click it.

**How it works**

1. \`initHoverTeaserMenu\` builds the whole menu from a \`links\` array in one pass: a stack of \`.htm-teaser\` panels — one per link, each exactly as wide as the nav itself and resting fully *behind* it at \`translateX(0%)\` — plus a \`<nav>\` of \`.htm-link\` anchors rendered on top.
2. Giving \`.htm-nav\` and \`.htm-teaser\` the same \`width: 50%\` is what makes the trick reliable: every teaser is perfectly hidden behind the nav at rest (same footprint, nav painted in front), and sliding one out by exactly \`translateX(100%)\` — its own full width — lands it precisely in the empty half of the container beside the nav, with no gap and no overlap.
3. Each teaser panel and its matching link share the same id via \`data-teaser\`/\`data-link\`, so a hover handler can look up the *one* panel that belongs to the link being hovered — \`container.querySelector('[data-teaser="\${id}"]')\` — instead of tracking "which link is active" as separate state the way a framework component normally would.
4. The small \`.htm-dot\` next to the hovered link fades in and nudges sideways using the exact same transition timing as the teaser panel, so both movements read as one connected animation rather than two separate effects.
5. \`pointerleave\` removes \`is-active\` from both — because the transition lives on the base \`.htm-teaser\`/\`.htm-dot\` classes rather than only the \`.is-active\` variant, the panel slides back behind the nav with the same eased motion it came out with.
6. Each link also tracks the \`pointerType\` of its own \`pointerdown\` rather than asking the device once via \`matchMedia\`: a \`"mouse"\` click fires normally (real hover already showed the teaser by then), but a \`"touch"\` tap is intercepted — the first one calls \`preventDefault()\` and just reveals that link's teaser, "priming" it, and a second tap on the same (already-primed) link lets the click through as a real navigation. A single \`primed\` variable shared across the whole menu makes sure tapping a different link — or tapping anywhere outside the menu — resets whichever one was previously primed first. Checking per-interaction like this keeps the behavior correct even on hybrid devices that report both touch and mouse capability.

Everything the component needs — layout included — lives in the one injected stylesheet, so it has no dependency on Tailwind or any other framework being present. Swap the \`color\` field for a \`backgroundImage\` per link (and use \`background-image: url(...)\` instead of the inline \`background:\`) to reveal real photos instead of solid color panels — the mechanism doesn't change at all.`,
    code: `const STYLE_ID = "hover-teaser-menu-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .htm-menu { position: relative; overflow: hidden; }
    .htm-teaser-layer { position: absolute; inset: 0; z-index: 0; overflow: hidden; }

    .htm-teaser {
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      transform: translateX(0%);
      transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .htm-teaser.is-active { transform: translateX(100%); }

    .htm-nav {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
      width: 50%;
      height: 100%;
    }
    .htm-link { position: relative; display: flex; align-items: center; gap: 0.5rem; }
    .htm-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: currentColor;
      opacity: 0;
      transform: translateX(0);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .htm-link.is-active .htm-dot { opacity: 0.6; transform: translateX(10px); }
  \`;
  document.head.appendChild(style);
}

function initHoverTeaserMenu(container, links) {
  ensureStyles();
  container.classList.add("htm-menu");

  container.innerHTML = \`
    <div class="htm-teaser-layer">
      \${links.map((l) => \`<div class="htm-teaser" data-teaser="\${l.id}" style="background:\${l.color}"></div>\`).join("")}
    </div>
    <nav class="htm-nav">
      \${links
        .map(
          (l) => \`
        <a href="\${l.href}" class="htm-link" data-link="\${l.id}">
          <span>\${l.label}</span>
          <span class="htm-dot"></span>
        </a>\`
        )
        .join("")}
    </nav>
  \`;

  let primed = null; // { link, leave } of whichever link is currently tap-primed

  container.querySelectorAll("[data-link]").forEach((link) => {
    const id = link.dataset.link;
    const teaser = container.querySelector(\`[data-teaser="\${id}"]\`);

    const enter = () => {
      link.classList.add("is-active");
      teaser.classList.add("is-active");
    };
    const leave = () => {
      link.classList.remove("is-active");
      teaser.classList.remove("is-active");
    };

    // Detect per-interaction, not per-device: a mouse click already had a
    // real hover before it, so it can activate immediately. A touch tap
    // gets primed first and only activates on a second tap of that link.
    let lastPointerType = "mouse";

    link.addEventListener("pointerdown", (e) => {
      lastPointerType = e.pointerType;
    });

    link.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") enter();
    });
    link.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") leave();
    });

    link.addEventListener("click", (e) => {
      if (lastPointerType !== "touch") return;

      if (primed && primed.link !== link) {
        primed.leave();
        primed = null;
      }

      if (!primed) {
        e.preventDefault();
        enter();
        primed = { link, leave };
      } else {
        leave();
        primed = null;
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (primed && !container.contains(e.target)) {
      primed.leave();
      primed = null;
    }
  });
}

// Usage — swap \`color\` for a \`backgroundImage\` to use real photos
initHoverTeaserMenu(document.getElementById("menu"), [
  { id: "beaches", label: "Beaches", href: "/beaches", color: "#0ea5e9" },
  { id: "mountains", label: "Mountains", href: "/mountains", color: "#16a34a" },
  { id: "cities", label: "Cities", href: "/cities", color: "#f59e0b" },
]);`,
    preview: {
      type: "html",
      height: 320,
      markup: `<div class="relative mx-auto h-72 w-full max-w-md overflow-hidden rounded-xl bg-slate-900 text-white" id="menuDemo"></div>
<script>
  function ensureStyles() {
    if (document.getElementById("htm-styles")) return;
    var style = document.createElement("style");
    style.id = "htm-styles";
    style.textContent =
      ".htm-teaser-layer { position: absolute; inset: 0; z-index: 0; overflow: hidden; }" +
      ".htm-teaser { position: absolute; top: 0; left: 0; width: 50%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 600; transform: translateX(0%); transition: transform .5s cubic-bezier(.65,0,.35,1); }" +
      ".htm-teaser.is-active { transform: translateX(100%); }" +
      ".htm-nav { position: relative; z-index: 10; display: flex; flex-direction: column; justify-content: center; gap: 1.25rem; width: 50%; height: 100%; padding: 0 2rem; background: rgba(15,23,42,0.95); }" +
      ".htm-link { position: relative; display: flex; align-items: center; gap: .5rem; color: #fff; }" +
      ".htm-dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; opacity: 0; transform: translateX(0); transition: opacity .3s ease, transform .3s ease; }" +
      ".htm-link.is-active .htm-dot { opacity: .6; transform: translateX(10px); }";
    document.head.appendChild(style);
  }

  function initHoverTeaserMenu(container, links) {
    ensureStyles();

    var teasersHTML = links.map(function (l) {
      return '<div class="htm-teaser" data-teaser="' + l.id + '" style="background:' + l.color + '">' + l.label + '</div>';
    }).join("");

    var linksHTML = links.map(function (l) {
      return '<a href="#" class="htm-link" data-link="' + l.id + '">' +
        '<span>' + l.label + '</span><span class="htm-dot"></span></a>';
    }).join("");

    container.innerHTML =
      '<div class="htm-teaser-layer">' + teasersHTML + '</div>' +
      '<nav class="htm-nav">' + linksHTML + '</nav>';

    var primed = null;

    container.querySelectorAll("[data-link]").forEach(function (link) {
      var id = link.dataset.link;
      var teaser = container.querySelector('[data-teaser="' + id + '"]');
      var lastPointerType = "mouse";

      function enter() {
        link.classList.add("is-active");
        teaser.classList.add("is-active");
      }
      function leave() {
        link.classList.remove("is-active");
        teaser.classList.remove("is-active");
      }

      link.addEventListener("pointerdown", function (e) {
        lastPointerType = e.pointerType;
      });
      link.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "mouse") enter();
      });
      link.addEventListener("pointerleave", function (e) {
        if (e.pointerType === "mouse") leave();
      });

      link.addEventListener("click", function (e) {
        // This demo's links have nowhere real to go, so every tap is
        // intercepted — a real project would drop this preventDefault on
        // the second tap and let the click become a real navigation.
        e.preventDefault();
        if (lastPointerType !== "touch") return;

        if (primed && primed.link !== link) {
          primed.leave();
          primed = null;
        }
        if (!primed) {
          enter();
          primed = { link: link, leave: leave };
        } else {
          leave();
          primed = null;
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (primed && !container.contains(e.target)) {
        primed.leave();
        primed = null;
      }
    });
  }

  initHoverTeaserMenu(document.getElementById("menuDemo"), [
    { id: "beaches", label: "Beaches", color: "linear-gradient(135deg,#0ea5e9,#0369a1)" },
    { id: "mountains", label: "Mountains", color: "linear-gradient(135deg,#22c55e,#15803d)" },
    { id: "cities", label: "Cities", color: "linear-gradient(135deg,#f59e0b,#b45309)" }
  ]);
<\/script>`,
    },
  },
  {
    id: "dot-to-underline-link",
    title: "Dot-to-Underline Hover Link",
    language: "javascript",
    tags: ["animation", "navigation", "hover-effects", "web-animations-api"],
    difficulty: "Intermediate",
    description: "A small dot beneath a nav link fades in, then stretches into a full underline bar on hover — and mirrors the whole thing in reverse on the way out.",
    explanation: `A tiny dot appears below the link, then stretches out into a flat underline bar — two distinct beats rather than one blended transition, which is what gives this effect its snap.

**How it works**

1. \`ensureStyles\` injects one \`<style>\` tag defining the \`.du-dot\` span's resting state — a tiny 6px circle centered beneath the link, already nudged down 6px and fully transparent (\`opacity: 0\`) — so the element has a sensible starting point before any animation has ever run on it.
2. \`initDotUnderline\` then appends one \`.du-dot\` span to the link and drives its geometry through the Web Animations API (\`element.animate()\`) rather than a CSS transition from that point on, because the effect genuinely has two sequential phases rather than several properties changing together.
3. \`grow()\` first rises the dot up from just beneath the link while fading it in (\`translateY(6px) → translateY(0)\` alongside \`opacity 0 → 1\`) and, only once that animation's \`.finished\` promise resolves, *then* stretches it from a small centered circle into a full-width, flat bar. That sequencing — rise-and-fade first, stretch second — is what gives the effect its two-beat feel instead of everything happening in one blur.
4. \`shrink()\` runs the same two phases in reverse: the bar contracts back down into a dot first, and only once *that* finishes does it sink back down and fade away — so hovering off always undoes the animation as a mirror image of hovering on.
5. Calling \`.cancel()\` on whatever animation is still running before starting a new one means rapidly hovering on and off doesn't queue up a stack of animations — each new \`grow()\`/\`shrink()\` call cleanly takes over from wherever the dot currently is, instead of waiting for a stale one to finish first.
6. Touch handling matches the same pattern used elsewhere in this library: the \`pointerType\` recorded on \`pointerdown\` decides whether a click activates immediately (mouse — real hover already showed the effect) or needs a first "priming" tap (touch) before a second tap lets the navigation through.

Because the whole thing is one small span and one initializer function, wiring it into a nav bar — with or without another hover effect layered on top — is a single \`querySelectorAll\` + \`forEach\` away.`,
    code: `const STYLE_ID = "dot-underline-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
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
  \`;
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
});`,
    preview: {
      type: "html",
      height: 150,
      markup: `<nav class="flex items-center justify-center gap-10 p-10" id="demoNav">
  <a href="#" class="text-sm font-semibold text-slate-800">Home</a>
  <a href="#" class="text-sm font-semibold text-slate-800">Work</a>
  <a href="#" class="text-sm font-semibold text-slate-800">Contact</a>
</nav>
<style>
  #demoNav a { position: relative; }
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
    background: #4f46e5;
  }
</style>
<script>
  function initDotUnderline(link) {
    var dot = document.createElement("span");
    dot.className = "du-dot";
    link.appendChild(dot);

    var currentAnimation = null;

    function grow() {
      if (currentAnimation) currentAnimation.cancel();
      currentAnimation = dot.animate(
        [
          { opacity: 0, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0px)" }
        ],
        { duration: 150, easing: "ease-out", fill: "forwards" }
      );
      currentAnimation.finished.then(function () {
        currentAnimation = dot.animate(
          [
            { width: "6px", height: "6px", left: "calc(50% - 3px)", borderRadius: "999px" },
            { width: "100%", height: "2px", left: "0%", borderRadius: "0px" }
          ],
          { duration: 200, easing: "ease-in-out", fill: "forwards" }
        );
      }).catch(function () {});
    }

    function shrink() {
      if (currentAnimation) currentAnimation.cancel();
      currentAnimation = dot.animate(
        [
          { width: "100%", height: "2px", left: "0%", borderRadius: "0px" },
          { width: "6px", height: "6px", left: "calc(50% - 3px)", borderRadius: "999px" }
        ],
        { duration: 200, easing: "ease-in-out", fill: "forwards" }
      );
      currentAnimation.finished.then(function () {
        currentAnimation = dot.animate(
          [
            { opacity: 1, transform: "translateY(0px)" },
            { opacity: 0, transform: "translateY(6px)" }
          ],
          { duration: 150, easing: "ease-out", fill: "forwards" }
        );
      }).catch(function () {});
    }

    var lastPointerType = "mouse";
    var isPrimed = false;

    link.addEventListener("pointerdown", function (e) {
      lastPointerType = e.pointerType;
    });
    link.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") grow();
    });
    link.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") shrink();
    });

    link.addEventListener("click", function (e) {
      // This demo's links have nowhere real to go, so every tap is
      // intercepted — a real project would drop this preventDefault on
      // the second tap and let the click become a real navigation.
      e.preventDefault();
      if (lastPointerType !== "touch") return;

      if (!isPrimed) {
        grow();
        isPrimed = true;
      } else {
        shrink();
        isPrimed = false;
      }
    });

    document.addEventListener("click", function (e) {
      if (isPrimed && !link.contains(e.target)) {
        shrink();
        isPrimed = false;
      }
    });
  }

  document.querySelectorAll("#demoNav a").forEach(function (link) {
    initDotUnderline(link);
  });
<\/script>`,
    },
  },
  {
    id: "infinite-text-parallax",
    title: "Infinite Text Parallax",
    language: "javascript",
    tags: ["scroll", "animation", "parallax", "marquee"],
    difficulty: "Advanced",
    description: "Repeating rows of text drift sideways at different rates as the page scrolls past them — the marquee-style parallax popular on agency and portfolio hero sections, in about 30 dependency-free lines.",
    explanation: `A "text parallax" section repeats one short phrase across a full-width row — enough times that it always fills edge-to-edge — then nudges that row sideways as the section scrolls through the viewport. Stack a few rows with alternating directions and you get the layered, cinematic drift you see on a lot of agency and portfolio homepages.

**How it works**

1. \`progress()\` reads the wrapping \`.tp-viewport\` element's position with \`getBoundingClientRect()\` on every scroll tick and maps it to a 0–1 value: \`0\` the moment the section's top edge touches the bottom of the screen, \`1\` the moment its bottom edge touches the top of the screen — the same "how far has this scrolled through the viewport" curve Framer Motion's \`useScroll\` gives you for free, built here from scratch.
2. Each \`.tp-row\` reads its own \`data-direction\` attribute and gets a \`translateX\` that starts on one side at progress \`0\` and ends on the opposite side at progress \`1\`. Rows marked \`"left"\` and \`"right"\` drift in opposite directions, which is what actually sells the parallax depth.
3. The scroll handler is wrapped in a \`requestAnimationFrame\` throttle (the \`ticking\` flag) so the relatively expensive \`getBoundingClientRect()\` call only runs once per frame no matter how many \`scroll\` events fire.
4. The factory returns \`update()\` and \`destroy()\` so you can force a recompute after a layout change, or tear down the listeners when the section leaves the page in a single-page app.

Adapted from Olivier Larose's Next.js + Framer Motion text-parallax demo, rebuilt here with zero dependencies so it runs in any plain HTML page. There's a matching React/Next.js component under the React / Next.js filter, built the "real" way with \`useScroll\`/\`useTransform\`, for anyone already in that ecosystem.`,
    code: `/* ---- CSS (add once to your stylesheet) ----
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
      row.style.transform = \`translateX(\${speed * dir * (2 * p - 1)}px)\`;
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
createTextParallax(document.querySelector(".tp-viewport"), { speed: 180 });`,
    preview: {
      type: "html",
      height: 320,
      markup: `<div style="max-width:640px;margin:0 auto;border-radius:14px;overflow:hidden;background:#0f172a;padding:36px 0;">
  <div id="tpViewport" class="tp-viewport">
    <div class="tp-row" data-direction="left">
      <span class="tp-item">Front End Developer</span>
      <span class="tp-item">Front End Developer</span>
      <span class="tp-item">Front End Developer</span>
    </div>
    <div class="tp-row" data-direction="right">
      <span class="tp-item">Creative Coder</span>
      <span class="tp-item">Creative Coder</span>
      <span class="tp-item">Creative Coder</span>
    </div>
    <div class="tp-row" data-direction="left">
      <span class="tp-item">Open To Work</span>
      <span class="tp-item">Open To Work</span>
      <span class="tp-item">Open To Work</span>
    </div>
  </div>
</div>
<div style="max-width:640px;margin:16px auto 0;display:flex;align-items:center;gap:10px;font:600 12px -apple-system,sans-serif;color:#475569;">
  <span>Scroll progress</span>
  <input id="tpRange" type="range" min="0" max="100" value="24" style="flex:1;accent-color:#4f46e5;" />
</div>
<style>
  body { margin:0; background:#f8fafc; }
  .tp-viewport { overflow:hidden; }
  .tp-row { display:flex; white-space:nowrap; will-change:transform; }
  .tp-item { padding:0 1rem; font-size:7vw; font-weight:800; letter-spacing:-0.02em; color:#fff; }
</style>
<script>
  var viewport = document.getElementById("tpViewport");
  var rows = Array.prototype.slice.call(viewport.querySelectorAll("[data-direction]"));
  var speed = 140;

  function apply(progressPercent) {
    var p = progressPercent / 100;
    rows.forEach(function (row) {
      var dir = row.dataset.direction === "right" ? 1 : -1;
      row.style.transform = "translateX(" + (speed * dir * (2 * p - 1)) + "px)";
    });
  }

  var range = document.getElementById("tpRange");
  range.addEventListener("input", function () { apply(range.value); });
  apply(range.value);
<\/script>`,
    },
  },
  {
    id: "infinite-text-parallax-next",
    title: "Infinite Text Parallax (Next.js)",
    language: "react",
    tags: ["scroll", "animation", "parallax", "marquee", "framer-motion", "next.js"],
    difficulty: "Advanced",
    description: "The same scroll-linked marquee as a copy-paste React/Next.js component — drop it in components/ui, pass it a list of rows, and Framer Motion drives the transform off real scroll progress.",
    explanation: `This is the "real" version of the vanilla text-parallax component: instead of hand-rolling scroll progress with \`getBoundingClientRect\`, it uses Framer Motion's \`useScroll\`/\`useTransform\`, which do the same job with less code and a built-in spring-free interpolation curve.

**How it works**

1. \`useScroll({ target: container, offset: ["start end", "end start"] })\` tracks \`container\`'s position against the viewport and exposes a motion value, \`scrollYProgress\`, that runs from \`0\` (container's top just entering the bottom of the screen) to \`1\` (container's bottom just leaving the top).
2. Each row's \`useTransform(progress, [0, 1], [speed * dir, -speed * dir])\` maps that same \`0–1\` progress straight to a pixel offset — no manual scroll listeners, throttling, or cleanup to write, Framer Motion subscribes to the motion value directly.
3. \`rows\` is a plain array of \`{ text, direction, image }\` objects, so the component itself never hardcodes copy — add, remove, or reorder rows from wherever you render \`<TextParallax />\`.
4. Because it's a single default-exported component with no context or provider required, it drops straight into \`components/ui/text-parallax.jsx\` the way a shadcn/ui component would: copy the file, import it, done.

Install \`framer-motion\` as the one required dependency. Pair it with \`lenis\` (\`npm i lenis\`) for buttery-smooth inertial scrolling — that's what the original demo this is adapted from uses — but it's entirely optional, the parallax math works fine against native scroll.`,
    code: `"use client";

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
}`,
    preview: {
      type: "html",
      height: 360,
      reactRuntime: true,
      markup: `<div id="root"></div>
<div style="max-width:640px;margin:16px auto 0;display:flex;align-items:center;gap:10px;font:600 12px -apple-system,sans-serif;color:#475569;">
  <span>Scroll progress</span>
  <input id="tpRange" type="range" min="0" max="100" value="24" style="flex:1;accent-color:#4f46e5;" />
</div>
<p style="max-width:640px;margin:8px auto 0;font:500 11px -apple-system,sans-serif;color:#94a3b8;">The real component drives this off Framer Motion's \`useScroll\` — the slider stands in for actual page scroll here, but \`useTransform\` below is the genuine Framer Motion hook.</p>
<style>
  body { margin: 0; background: #f8fafc; }
</style>
<script>
  var e = React.createElement;
  var Motion = window.Motion;

  var rowsData = [
    { text: "Front End Developer", direction: "left" },
    { text: "Creative Coder", direction: "right" },
    { text: "Open To Work", direction: "left" }
  ];

  function ParallaxRow(props) {
    var dir = props.direction === "right" ? 1 : -1;
    var x = Motion.useTransform(props.progress, [0, 1], [props.speed * dir, -props.speed * dir]);
    return e(
      Motion.motion.div,
      { style: { x: x, display: "flex", whiteSpace: "nowrap", willChange: "transform" } },
      [0, 1, 2].map(function (i) {
        return e(
          "span",
          { key: i, style: { padding: "0 1rem", fontSize: "7vw", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" } },
          props.text
        );
      })
    );
  }

  function TextParallaxDemo() {
    var progress = Motion.useMotionValue(0.24);
    var speed = 140;

    React.useEffect(function () {
      var range = document.getElementById("tpRange");
      function onInput() {
        progress.set(range.value / 100);
      }
      range.addEventListener("input", onInput);
      return function () {
        range.removeEventListener("input", onInput);
      };
    }, []);

    return e(
      "div",
      { style: { maxWidth: 640, margin: "0 auto", borderRadius: 14, overflow: "hidden", background: "#0f172a", padding: "36px 0" } },
      rowsData.map(function (row, i) {
        return e(ParallaxRow, { key: i, text: row.text, direction: row.direction, speed: speed, progress: progress });
      })
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(e(TextParallaxDemo));
<\/script>`,
    },
  },
  {
    id: "sticky-cursor",
    title: "Sticky Cursor",
    language: "javascript",
    tags: ["cursor", "hover", "interaction", "touch"],
    difficulty: "Advanced",
    description: "A custom round cursor that snaps to the center of any hoverable element and stretches toward the pointer like a magnet — includes a draggable touch handle so the effect works without a mouse.",
    explanation: `Instead of following the raw pointer position, this cursor checks on every move whether the pointer is over one of your "sticky" targets. If it is, the cursor snaps to that element's center and only leans 10% of the way toward the actual pointer — with a rotation and a stretch/squash proportional to how far off-center the pointer has wandered. Let go, and it eases back to a plain dot.

**How it works**

1. \`hitTest(x, y)\` walks the target list and returns whichever one's \`getBoundingClientRect()\` currently contains the point — this replaces relying on native \`mouseenter\`/\`mouseleave\`, which only fires for a real OS pointer. Doing the hit test manually on every position update is what lets the exact same code path drive both a real mouse and the simulated touch pointer below.
2. When a target is active, \`dist\` is the vector from that target's center to the pointer. \`Math.atan2(dist.y, dist.x)\` becomes the cursor's rotation, and the larger \`abs(dist)\` gets, the more the cursor stretches along one axis and squashes along the other — capped at 1.3x/0.8x so it never overshoots into something rubbery-looking.
3. The cursor doesn't jump straight to the target's center — \`targetX\`/\`targetY\` blend 90% center, 10% actual pointer position, so it visibly "pulls" toward wherever you are inside the element rather than looking dead-center-locked.
4. \`springStep\` is a tiny mass-free spring: each frame it nudges a velocity toward the target (\`stiffness\`) and bleeds some of that velocity off (\`friction\`), then moves the position by whatever's left. Driving \`smooth.x\`/\`smooth.y\` *and* the cursor's size through it — instead of jumping straight to 60px and the target position the instant a target becomes active — is what gives the "stick" its overshoot-and-settle bounce rather than a sudden snap.
5. On a coarse-pointer device (checked once via \`matchMedia("(pointer: coarse)")\`), a small ring — the "handle" — appears near the middle of the screen. Dragging it feeds the handle's touch position (offset up by \`HANDLE_OFFSET_Y\` px so your thumb doesn't cover the effect) into the exact same \`setPointer\` function real \`mousemove\` events use. \`touchmove\` only calls \`preventDefault()\` while the handle itself is actively being dragged, so normal page scrolling elsewhere is untouched.

Adapted from Olivier Larose's Next.js + Framer Motion sticky-cursor demo. The touch drag handle isn't in the original — a hover-driven cursor effect is otherwise invisible and untestable on a phone or tablet, so it's a necessary addition here, not just a preview trick. There's a matching React/Next.js component under the React / Next.js filter, built the "real" way with Framer Motion's spring and motion values.`,
    code: `/**
 * Mark any element you want the cursor to "stick" to with [data-sticky]:
 *   <button data-sticky>Hover me</button>
 *
 * createStickyCursor(document.querySelectorAll("[data-sticky]"));
 *
 * On coarse-pointer (touch) devices a small drag handle appears near the
 * middle of the screen — drag it anywhere to move the cursor's virtual
 * position and trigger the same stick/morph effect without a real mouse.
 */
function createStickyCursor(targets, options = {}) {
  // stiffness pulls the cursor toward its target each frame; friction is how much
  // velocity survives each frame — closer to 1 means more overshoot/bounce before it settles.
  const opts = { size: 15, stickySize: 60, pull: 0.1, stiffness: 0.15, friction: 0.65, color: "#111", ...options };
  const list = targets instanceof Element ? [targets] : Array.from(targets);

  const cursor = document.createElement("div");
  cursor.className = "sticky-cursor";
  Object.assign(cursor.style, {
    position: "fixed",
    top: "0",
    left: "0",
    borderRadius: "50%",
    background: opts.color,
    pointerEvents: "none",
    zIndex: 9999,
    willChange: "transform",
  });
  document.body.appendChild(cursor);

  let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  let smooth = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 };
  let size = { value: opts.size, v: 0 };
  let active = null;

  function hitTest(x, y) {
    return (
      list.find((el) => {
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      }) || null
    );
  }

  function setPointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    active = hitTest(x, y);
  }

  // A tiny spring integrator: nudge velocity toward the target every frame, then
  // bleed some of it off. This is what gives the cursor its overshoot-and-settle
  // "elastic" feel instead of just easing straight in.
  function springStep(pos, vel, target) {
    vel += (target - pos) * opts.stiffness;
    vel *= opts.friction;
    return [pos + vel, vel];
  }

  function frame() {
    let targetX = pointer.x;
    let targetY = pointer.y;
    let targetSize = opts.size;
    let suffix = "";

    if (active) {
      const r = active.getBoundingClientRect();
      const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const dist = { x: pointer.x - center.x, y: pointer.y - center.y };
      const abs = Math.max(Math.abs(dist.x), Math.abs(dist.y));
      const scaleX = 1 + Math.min(abs / (r.height / 2), 1) * 0.3;
      const scaleY = 1 - Math.min(abs / (r.width / 2), 1) * 0.2;
      const angle = Math.atan2(dist.y, dist.x);

      targetX = center.x + dist.x * opts.pull;
      targetY = center.y + dist.y * opts.pull;
      targetSize = opts.stickySize;
      suffix = " rotate(" + angle + "rad) scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }

    [smooth.x, smooth.vx] = springStep(smooth.x, smooth.vx, targetX);
    [smooth.y, smooth.vy] = springStep(smooth.y, smooth.vy, targetY);
    [size.value, size.v] = springStep(size.value, size.v, targetSize);
    const s = Math.max(0, size.value);

    cursor.style.width = s + "px";
    cursor.style.height = s + "px";
    cursor.style.transform = "translate(" + (smooth.x - s / 2) + "px, " + (smooth.y - s / 2) + "px)" + suffix;

    raf = requestAnimationFrame(frame);
  }
  let raf = requestAnimationFrame(frame);

  function onMouseMove(e) {
    setPointer(e.clientX, e.clientY);
  }
  window.addEventListener("mousemove", onMouseMove);

  // ---- Touch/mobile: a draggable handle stands in for a real mouse ----
  const HANDLE_OFFSET_Y = 56; // keeps the effect visible above your thumb
  let handle = null;
  let dragging = false;

  function createHandle() {
    handle = document.createElement("div");
    handle.className = "sticky-cursor-handle";
    Object.assign(handle.style, {
      position: "fixed",
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      border: "2px solid " + opts.color,
      background: "rgba(255,255,255,.6)",
      touchAction: "none",
      zIndex: 10000,
      left: pointer.x - 22 + "px",
      top: pointer.y + HANDLE_OFFSET_Y - 22 + "px",
    });
    document.body.appendChild(handle);

    handle.addEventListener(
      "touchstart",
      (e) => {
        dragging = true;
        e.preventDefault();
      },
      { passive: false }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging) return;
        e.preventDefault();
        const t = e.touches[0];
        handle.style.left = t.clientX - 22 + "px";
        handle.style.top = t.clientY - 22 + "px";
        setPointer(t.clientX, t.clientY - HANDLE_OFFSET_Y);
      },
      { passive: false }
    );
    window.addEventListener("touchend", () => {
      dragging = false;
    });
  }

  if (matchMedia("(pointer: coarse)").matches) createHandle();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      cursor.remove();
      handle && handle.remove();
    },
  };
}

// Usage
createStickyCursor(document.querySelectorAll("[data-sticky]"));`,
    preview: {
      type: "html",
      height: 400,
      markup: `<div id="stage" style="height:260px;border-radius:14px;background:#f8fafc;display:flex;align-items:center;justify-content:center;gap:20px;">
  <button data-sticky style="padding:14px 26px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:600 14px -apple-system,sans-serif;cursor:pointer;">Hover me</button>
  <button data-sticky style="padding:14px 26px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:600 14px -apple-system,sans-serif;cursor:pointer;">...and me</button>
</div>
<p style="text-align:center;margin:12px 0 0;font:600 12px -apple-system,sans-serif;color:#64748b;">Hover the buttons with a mouse — or on touch, drag the ring below them.</p>
<style>
  body { margin:0; background:#f8fafc; }
</style>
<script>
  function createStickyCursor(targets, options) {
    var opts = Object.assign({ size: 15, stickySize: 60, pull: 0.1, stiffness: 0.15, friction: 0.65, color: "#111" }, options);
    var list = targets instanceof Element ? [targets] : Array.prototype.slice.call(targets);

    var cursor = document.createElement("div");
    cursor.className = "sticky-cursor";
    Object.assign(cursor.style, {
      position: "fixed", top: "0", left: "0", borderRadius: "50%",
      background: opts.color, pointerEvents: "none", zIndex: 9999, willChange: "transform",
    });
    document.body.appendChild(cursor);

    var pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    var smooth = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 };
    var size = { value: opts.size, v: 0 };
    var active = null;

    function hitTest(x, y) {
      var found = null;
      list.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) found = el;
      });
      return found;
    }

    function setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      active = hitTest(x, y);
    }

    function springStep(pos, vel, target) {
      vel += (target - pos) * opts.stiffness;
      vel *= opts.friction;
      return [pos + vel, vel];
    }

    function frame() {
      var targetX = pointer.x;
      var targetY = pointer.y;
      var targetSize = opts.size;
      var suffix = "";

      if (active) {
        var r = active.getBoundingClientRect();
        var center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        var dist = { x: pointer.x - center.x, y: pointer.y - center.y };
        var abs = Math.max(Math.abs(dist.x), Math.abs(dist.y));
        var scaleX = 1 + Math.min(abs / (r.height / 2), 1) * 0.3;
        var scaleY = 1 - Math.min(abs / (r.width / 2), 1) * 0.2;
        var angle = Math.atan2(dist.y, dist.x);

        targetX = center.x + dist.x * opts.pull;
        targetY = center.y + dist.y * opts.pull;
        targetSize = opts.stickySize;
        suffix = " rotate(" + angle + "rad) scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
      }

      var stepX = springStep(smooth.x, smooth.vx, targetX);
      smooth.x = stepX[0]; smooth.vx = stepX[1];
      var stepY = springStep(smooth.y, smooth.vy, targetY);
      smooth.y = stepY[0]; smooth.vy = stepY[1];
      var stepS = springStep(size.value, size.v, targetSize);
      size.value = stepS[0]; size.v = stepS[1];
      var s = Math.max(0, size.value);

      cursor.style.width = s + "px";
      cursor.style.height = s + "px";
      cursor.style.transform = "translate(" + (smooth.x - s / 2) + "px, " + (smooth.y - s / 2) + "px)" + suffix;
    }
    setInterval(frame, 16);

    window.addEventListener("mousemove", function (e) { setPointer(e.clientX, e.clientY); });

    if (matchMedia("(pointer: coarse)").matches) {
      var handle = document.createElement("div");
      handle.className = "sticky-cursor-handle";
      var HANDLE_OFFSET_Y = 56;
      Object.assign(handle.style, {
        position: "fixed", width: "44px", height: "44px", borderRadius: "50%",
        border: "2px solid " + opts.color, background: "rgba(255,255,255,.6)",
        touchAction: "none", zIndex: 10000,
        left: (pointer.x - 22) + "px", top: (pointer.y + HANDLE_OFFSET_Y - 22) + "px",
      });
      document.body.appendChild(handle);

      var dragging = false;
      handle.addEventListener("touchstart", function (e) { dragging = true; e.preventDefault(); }, { passive: false });
      window.addEventListener("touchmove", function (e) {
        if (!dragging) return;
        e.preventDefault();
        var t = e.touches[0];
        handle.style.left = (t.clientX - 22) + "px";
        handle.style.top = (t.clientY - 22) + "px";
        setPointer(t.clientX, t.clientY - HANDLE_OFFSET_Y);
      }, { passive: false });
      window.addEventListener("touchend", function () { dragging = false; });
    }
  }

  createStickyCursor(document.querySelectorAll("[data-sticky]"));
<\/script>`,
    },
  },
  {
    id: "sticky-cursor-next",
    title: "Sticky Cursor (Next.js)",
    language: "react",
    tags: ["cursor", "hover", "interaction", "touch", "framer-motion", "next.js"],
    difficulty: "Advanced",
    description: "The same magnetic sticky cursor as a copy-paste React/Next.js component — pass it a list of target refs and Framer Motion's spring drives the follow, rotate, and stretch.",
    explanation: `This is the "real" version of the vanilla sticky-cursor component: instead of hand-rolling the follow-easing with a per-frame lerp, it uses Framer Motion's \`useSpring\` on motion values, and \`animate()\` for the one-off rotate/scale resets.

**How it works**

1. \`targets\` is a plain array of refs — \`update()\` checks each target's \`getBoundingClientRect()\` against the pointer on every move, exactly like the vanilla version's \`hitTest\`, so there's nothing framework-specific about which element is "sticky."
2. \`mouse.x\`/\`mouse.y\` are \`useMotionValue\`s; wrapping them in \`useSpring\` gives the cursor its follow-lag for free, with the spring's \`damping\`/\`stiffness\`/\`mass\` controlling exactly how loose or snappy it feels — no manual easing math needed. The size change is sprung the same way: the \`animate\` prop's own \`transition\` is set to \`{ type: "spring", ... }\` explicitly, so growing from a dot into the sticky blob overshoots slightly and settles instead of snapping straight to 60px.
3. \`scale.x\`/\`scale.y\` are set from \`transform(abs, [0, range], [1, max])\`, Framer Motion's clamped linear interpolation helper — the same mapping the vanilla version does by hand with \`Math.min\`.
4. The touch handle is wired up with a plain \`useEffect\` and native \`addEventListener(..., { passive: false })\` rather than React's \`onTouchMove\` prop — React marks touch listeners passive by default, which silently breaks \`preventDefault()\`, so the handle needs a real DOM listener to reliably stop the page from scrolling while it's being dragged.

Install \`framer-motion\` as the one dependency. Render \`<StickyCursor targets={[...refs]} />\` once, anywhere in the tree — it's fixed-positioned, so it doesn't need to live near the elements it sticks to.`,
    code: `"use client";

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
}`,
    preview: {
      type: "html",
      height: 320,
      reactRuntime: true,
      markup: `<div id="root"></div>
<script>
  var e = React.createElement;
  var Motion = window.Motion;

  var buttonStyle = {
    padding: "14px 26px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    background: "#fff",
    font: "600 14px -apple-system,sans-serif",
    cursor: "pointer"
  };

  function StickyCursorDemo() {
    var btn1 = React.useRef(null);
    var btn2 = React.useRef(null);
    var cursorRef = React.useRef(null);
    var activeRef = React.useRef(null);
    var sizeState = React.useState(15);
    var cursorSize = sizeState[0];
    var setCursorSize = sizeState[1];

    var size = 15;
    var stickySize = 60;
    var pull = 0.1;

    var mouseX = Motion.useMotionValue(0);
    var mouseY = Motion.useMotionValue(0);
    var scaleX = Motion.useMotionValue(1);
    var scaleY = Motion.useMotionValue(1);
    var smoothX = Motion.useSpring(mouseX, { damping: 20, stiffness: 300, mass: 0.5 });
    var smoothY = Motion.useSpring(mouseY, { damping: 20, stiffness: 300, mass: 0.5 });

    function update(clientX, clientY) {
      var targets = [btn1.current, btn2.current];
      var hit = null;
      for (var i = 0; i < targets.length; i++) {
        var el = targets[i];
        if (!el) continue;
        var rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          hit = el;
          break;
        }
      }

      if ((hit || null) !== activeRef.current) {
        activeRef.current = hit || null;
        setCursorSize(hit ? stickySize : size);
        if (!hit) Motion.animate(cursorRef.current, { scaleX: 1, scaleY: 1 }, { duration: 0.15 });
      }

      if (hit) {
        var rect2 = hit.getBoundingClientRect();
        var center = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
        var dist = { x: clientX - center.x, y: clientY - center.y };
        Motion.animate(cursorRef.current, { rotate: Math.atan2(dist.y, dist.x) + "rad" }, { duration: 0 });

        var abs = Math.max(Math.abs(dist.x), Math.abs(dist.y));
        scaleX.set(Motion.transform(abs, [0, rect2.height / 2], [1, 1.3]));
        scaleY.set(Motion.transform(abs, [0, rect2.width / 2], [1, 0.8]));

        mouseX.set(center.x - stickySize / 2 + dist.x * pull);
        mouseY.set(center.y - stickySize / 2 + dist.y * pull);
      } else {
        mouseX.set(clientX - size / 2);
        mouseY.set(clientY - size / 2);
      }
    }

    React.useEffect(function () {
      function onMove(ev) {
        update(ev.clientX, ev.clientY);
      }
      window.addEventListener("mousemove", onMove);
      return function () {
        window.removeEventListener("mousemove", onMove);
      };
    }, []);

    return e(
      React.Fragment,
      null,
      e(
        "div",
        {
          id: "stage",
          style: {
            height: 220,
            borderRadius: 14,
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20
          }
        },
        e("button", { ref: btn1, style: buttonStyle }, "Hover me"),
        e("button", { ref: btn2, style: buttonStyle }, "...and me")
      ),
      e(
        "p",
        {
          style: {
            textAlign: "center",
            margin: "12px 0 0",
            font: "600 12px -apple-system,sans-serif",
            color: "#64748b"
          }
        },
        "Hover the buttons with a real mouse — this is genuinely running Framer Motion's spring, not a lookalike."
      ),
      e(Motion.motion.div, {
        ref: cursorRef,
        style: {
          position: "fixed",
          left: smoothX,
          top: smoothY,
          borderRadius: "50%",
          background: "#111",
          pointerEvents: "none",
          zIndex: 9999,
          scaleX: scaleX,
          scaleY: scaleY
        },
        animate: { width: cursorSize, height: cursorSize },
        transition: { type: "spring", stiffness: 400, damping: 17, mass: 0.6 }
      })
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(e(StickyCursorDemo));
<\/script>`,
    },
  },
  {
    id: "gsap-page-load-intro",
    title: "Page-Load Intro Animation (GSAP)",
    language: "javascript",
    tags: ["animation", "gsap", "page-load", "stagger"],
    difficulty: "Beginner",
    description: "A hero's heading, subheading, and CTA button slide up and fade in one after another the moment the page loads — a single staggered GSAP tween instead of several hand-timed CSS animations.",
    explanation: `A page-load intro where the hero's heading, subheading, and call-to-action button all slide up and fade in one after another — a couple of GSAP calls replace what would otherwise be a handful of separately-timed CSS animations.

**How it works**

1. \`playIntro()\` starts with \`gsap.set(".reveal", { opacity: 0, y: 40 })\`, which applies instantly with no animation — it snaps every element marked \`.reveal\` to hidden and nudged down 40px before anything else happens. Folding this into \`playIntro\` itself (rather than running it once, separately, at the top of the file) is what makes the function safe to call more than once: every call starts from the same known "hidden" state instead of assuming it's still there from a previous run.
2. The very next line, \`gsap.to(".reveal", { y: 0, opacity: 1, ... })\`, animates those *same* elements back to their natural resting state — because \`.set()\` just applied inline styles a moment earlier, GSAP already knows exactly what to animate back to without separate "from" values written out anywhere.
3. \`stagger: 0.15\` is what turns one \`gsap.to()\` call into a cascading sequence: instead of every \`.reveal\` element starting at the same instant, each one begins 0.15 seconds after the previous one in DOM order — a single line of config replaces writing four separate, hand-timed \`delay\` values.
4. \`ease: "power3.out"\` gives each element a fast start that gently decelerates into its resting position rather than moving at a constant speed — this easing curve is what makes the motion read as natural instead of mechanical.
5. Running \`playIntro\` on \`DOMContentLoaded\` — rather than as soon as the script tag runs — guarantees every \`.reveal\` element already exists in the DOM before the function ever tries to touch it.

Swap the plain \`stagger: 0.15\` for a config object like \`{ each: 0.15, from: "center" }\` if you need the cascade to start from the middle of the group instead of the top — GSAP's \`stagger\` option accepts either a number or an object for exactly this kind of finer control.`,
    code: `<!-- <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script> -->
<!-- Give every element you want in the intro a shared class, e.g. "reveal" -->
<!--
  <p class="reveal">Welcome to</p>
  <h1 class="reveal">Build Something Extraordinary</h1>
  <p class="reveal">A short subheading that explains the product in one line.</p>
  <button class="reveal">Get Started</button>
-->

function playIntro() {
  gsap.set(".reveal", { opacity: 0, y: 40 });

  gsap.to(".reveal", {
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.15,
  });
}

document.addEventListener("DOMContentLoaded", playIntro);`,
    preview: {
      type: "html",
      height: 380,
      markup: `<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<div class="mx-auto max-w-sm rounded-2xl bg-slate-900 px-8 py-10 text-center text-white" id="stage">
  <p class="reveal text-xs font-semibold uppercase tracking-widest text-indigo-300">Welcome to</p>
  <h1 class="reveal mt-2 text-2xl font-bold leading-tight">Build Something<br />Extraordinary</h1>
  <p class="reveal mt-3 text-sm text-slate-300">A short subheading that explains the product in one line.</p>
  <button class="reveal mt-6 rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white">Get Started</button>
</div>
<div class="mt-4 flex justify-center">
  <button id="replay" class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Replay intro</button>
</div>
<script>
  function playIntro() {
    gsap.set(".reveal", { opacity: 0, y: 40 });

    gsap.to(".reveal", {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.15
    });
  }

  playIntro();
  document.getElementById("replay").addEventListener("click", playIntro);
<\/script>`,
    },
  },
  {
    id: "reveal-footer",
    title: "Reveal Footer",
    language: "javascript",
    tags: ["layout", "scroll", "footer", "css-tricks"],
    difficulty: "Beginner",
    description: "A footer that's completely invisible until visitors scroll all the way through the page, then gets uncovered like a curtain lifting away — a fixed footer, an opaque content wrapper on top of it, and one spacer element kept in sync with the footer's real height.",
    explanation: `A footer that's invisible until the visitor scrolls all the way through the page, then gets uncovered like a curtain being pulled back — no scroll listener computes the reveal itself, only the footer's height needs to be tracked in JS.

**How it works**

1. The footer is \`position: fixed; bottom: 0\`, so it renders in the same spot on screen — the bottom of the browser viewport — from the very first frame, completely independent of how far the page has scrolled.
2. The "shell" — everything above the footer — is \`position: relative\` with a higher \`z-index\` and an opaque background, so it visually covers the fixed footer for as long as the shell itself hasn't finished scrolling past.
3. A separate, empty spacer element is inserted right after the shell, sized to exactly the footer's height. Because the spacer has no background of its own and isn't a positioned element, it's what actually creates the illusion: it reserves the scroll room the removed-from-flow footer needs, without painting anything over it — the fixed footer, being a positioned element, already paints above a plain unpositioned spacer under normal CSS stacking rules.
4. As the page scrolls, the shell moves normally and eventually scrolls out from under the viewport; the spacer, having no paint of its own, is what lets the footer — which never moved — show through, for exactly the last stretch of scrolling equal to its own height.
5. \`initRevealFooter\` measures the footer's real, responsive height with \`offsetHeight\` and writes it onto the spacer — once up front, again on window \`resize\`, and again via a \`ResizeObserver\` on the footer itself, so the reveal keeps lining up if the footer's content ever wraps onto a different number of lines.

A tempting shortcut is making the footer \`position: sticky\` instead and skipping the spacer, giving the shell a matching negative \`margin-bottom\`. It looks reasonable but never actually reveals anything: since the footer is the very last thing on the page, the scroll position where it would "unstick" and the page's absolute scroll end are mathematically the same point, so it never gets a chance to become unstuck-and-visible before scrolling simply stops. \`position: fixed\` plus a real spacer element sidesteps that trap entirely.`,
    code: `const STYLE_ID = "reveal-footer-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .rf-shell {
      position: relative;
      z-index: 1;
      background: inherit;
    }
    .rf-footer {
      position: fixed;
      inset: auto 0 0 0;
      z-index: 0;
    }
  \`;
  document.head.appendChild(style);
}

function initRevealFooter(shell, footer) {
  ensureStyles();
  shell.classList.add("rf-shell");
  footer.classList.add("rf-footer");

  const spacer = document.createElement("div");
  shell.insertAdjacentElement("afterend", spacer);

  const syncHeight = () => {
    spacer.style.height = \`\${footer.offsetHeight}px\`;
  };

  syncHeight();
  window.addEventListener("resize", syncHeight);

  if ("ResizeObserver" in window) {
    new ResizeObserver(syncHeight).observe(footer);
  }
}

// Usage — everything above the footer goes inside \`shell\`; \`footer\`
// can live anywhere in the DOM, since position: fixed takes it out
// of normal flow regardless of where it's declared.
initRevealFooter(
  document.getElementById("page-shell"),
  document.getElementById("site-footer")
);`,
    preview: {
      type: "html",
      height: 420,
      markup: `<div style="max-width:360px;margin:0 auto;">
  <div id="demo" style="position:relative;overflow:hidden;height:240px;border-radius:14px;border:1px solid #e2e8f0;">
    <div id="shell" style="position:absolute;top:0;left:0;right:0;z-index:1;background:#fff;">
      <div style="height:160px;display:flex;align-items:center;justify-content:center;background:#eef2ff;color:#3730a3;font:600 13px -apple-system,sans-serif;">Page content</div>
      <div style="height:160px;display:flex;align-items:center;justify-content:center;background:#fff7ed;color:#9a3412;font:600 13px -apple-system,sans-serif;">Keep scrolling…</div>
    </div>
    <div id="footer" style="position:absolute;left:0;right:0;bottom:0;height:110px;z-index:0;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font:600 13px -apple-system,sans-serif;">👋 Footer revealed!</div>
  </div>
  <div style="margin-top:12px;display:flex;align-items:center;gap:10px;font:600 12px -apple-system,sans-serif;color:#475569;">
    <span>Scroll progress</span>
    <input id="rfRange" type="range" min="0" max="100" value="0" style="flex:1;accent-color:#4f46e5;" />
  </div>
  <p style="margin-top:8px;font:500 11px -apple-system,sans-serif;color:#94a3b8;">The real component is driven by actual page scroll — the slider stands in for that here so the demo works inside this preview frame.</p>
</div>
<script>
  var shell = document.getElementById("shell");
  var demo = document.getElementById("demo");
  var footerH = document.getElementById("footer").offsetHeight;

  function update(progress) {
    var shellH = shell.offsetHeight;
    var maxTravel = Math.max(0, shellH - (demo.offsetHeight - footerH));
    shell.style.transform = "translateY(-" + (progress / 100 * maxTravel) + "px)";
  }

  document.getElementById("rfRange").addEventListener("input", function (e) {
    update(Number(e.target.value));
  });

  update(0);
<\/script>`,
    },
  },
  {
    id: "reveal-footer-next",
    title: "Reveal Footer (Next.js)",
    language: "react",
    tags: ["layout", "scroll", "footer", "css-tricks", "next.js"],
    difficulty: "Beginner",
    description: "The same curtain-style footer reveal as a copy-paste React/Next.js component — wrap your page content and footer content as props and a small `useEffect` keeps a spacer in sync with the footer's real height.",
    explanation: `This is the same reveal-footer trick as a single-file, shadcn/ui-style component: pass it your page content as \`children\` and your footer's own content as the \`footer\` prop, and it renders the shell, a sized spacer, and a fixed footer in the right order.

**How it works**

1. The footer is rendered with \`ref={footerRef}\` and Tailwind's \`fixed inset-x-0 bottom-0\`, so — exactly like the vanilla version — it's pinned to the bottom of the browser viewport from the moment it mounts, regardless of scroll position.
2. \`footerHeight\` is plain React state, not a ref mutation: a \`useEffect\` measures \`footerRef.current.offsetHeight\` on mount, then keeps it current via a \`resize\` listener and a \`ResizeObserver\`, both cleaned up on unmount.
3. That state renders as a plain \`<div style={{ height: footerHeight }} />\` placed between the shell and the footer — this is the spacer, sized declaratively through React's render cycle instead of being created and updated by hand like the vanilla version's \`document.createElement\`.
4. The shell itself only needs \`relative z-[1] bg-inherit\` — no margin math, because the spacer (not a margin) is what reserves the scroll room the fixed footer no longer occupies.

Drop \`components/ui/reveal-footer.jsx\` into a Next.js (or any React) project, wrap your page's main content and footer markup in it once near the root layout, and the reveal works with zero other configuration.`,
    code: `"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Usage:
 *
 * <RevealFooter footer={<SiteFooter />}>
 *   <Hero />
 *   <Pets />
 * </RevealFooter>
 *
 * Renders \`children\` above a footer that stays hidden until the page
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
      <div className={\`relative z-[1] bg-inherit \${className}\`}>{children}</div>
      <div style={{ height: footerHeight }} />
      <footer ref={footerRef} className="fixed inset-x-0 bottom-0 z-0">
        {footer}
      </footer>
    </>
  );
}`,
    preview: {
      type: "html",
      height: 420,
      reactRuntime: true,
      markup: `<div id="root" style="max-width:360px;margin:0 auto;"></div>
<style>
  body { margin: 0; background: #f8fafc; }
</style>
<script>
  var e = React.createElement;

  function RevealFooterDemo() {
    var progress = React.useState(0);
    var setProgress = progress[1];
    progress = progress[0];

    var shellRef = React.useRef(null);
    var demoRef = React.useRef(null);
    var footerH = 110;

    var maxTravel = 0;
    if (shellRef.current && demoRef.current) {
      maxTravel = Math.max(0, shellRef.current.offsetHeight - (demoRef.current.offsetHeight - footerH));
    }
    var translateY = -(progress / 100) * maxTravel;

    return e(
      "div",
      null,
      e(
        "div",
        { ref: demoRef, style: { position: "relative", overflow: "hidden", height: 240, borderRadius: 14, border: "1px solid #e2e8f0" } },
        e(
          "div",
          { ref: shellRef, style: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, background: "#fff", transform: "translateY(" + translateY + "px)" } },
          e("div", { style: { height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef2ff", color: "#3730a3", font: "600 13px -apple-system,sans-serif" } }, "Page content"),
          e("div", { style: { height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff7ed", color: "#9a3412", font: "600 13px -apple-system,sans-serif" } }, "Keep scrolling…")
        ),
        e(
          "div",
          { style: { position: "absolute", left: 0, right: 0, bottom: 0, height: footerH, zIndex: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#fff", font: "600 13px -apple-system,sans-serif" } },
          "👋 Footer revealed!"
        )
      ),
      e(
        "div",
        { style: { marginTop: 12, display: "flex", alignItems: "center", gap: 10, font: "600 12px -apple-system,sans-serif", color: "#475569" } },
        e("span", null, "Scroll progress"),
        e("input", {
          type: "range", min: 0, max: 100, value: progress,
          onChange: function (ev) { setProgress(Number(ev.target.value)); },
          style: { flex: 1, accentColor: "#4f46e5" }
        })
      ),
      e(
        "p",
        { style: { marginTop: 8, font: "500 11px -apple-system,sans-serif", color: "#94a3b8" } },
        "The real component is driven by actual page scroll — the slider stands in for that here so the demo works inside this preview frame."
      )
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(e(RevealFooterDemo));
<\/script>`,
    },
  },
  {
    id: "magnetic-button",
    title: "Magnetic Buttons (GSAP)",
    language: "javascript",
    tags: ["animation", "gsap", "hover-effects", "interaction"],
    difficulty: "Intermediate",
    description: "Circular buttons that lean toward the cursor whenever it comes within a radius — the button itself moves more than its label for a layered depth effect — then spring back with an elastic GSAP ease the instant the pointer moves away.",
    explanation: `A "magnetic" hover effect popular on agency sites: buttons subtly pull toward the cursor as it approaches, with the label inside drifting a smaller distance than the button itself so the two visibly separate — then everything snaps back with a bouncy elastic ease once the cursor leaves.

**How it works**

1. \`initMagneticButtons\` builds one small record per button up front — \`{ button, text, wasInRadius }\` — caching each button's own \`<span>\` label alongside it. The original version this is adapted from re-ran \`querySelectorAll\` for the whole button list *and* \`querySelector("span")\` per button inside the shared \`mousemove\` handler itself, on every single move; building the list once up front removes both repeated lookups entirely.
2. On every move, each button's \`getBoundingClientRect()\` gives its live center, and \`Math.hypot(dx, dy)\` is the straight-line distance from the cursor to that center. Once the cursor is within \`radius\`, \`gsap.to()\` moves the button by \`offset * 0.5\` but its label by only \`offset * 0.2\` — the label always trailing behind the button's own motion is what sells the depth, rather than the whole button and its text moving as one rigid block.
3. \`overwrite: "auto"\` on every tween is what keeps rapid pointer movement smooth: without it, a fresh \`gsap.to()\` fired on almost every \`mousemove\` would queue up behind whichever tween is already running on that same button instead of redirecting it, producing a laggy backlog of queued motion instead of the button tracking the cursor directly.
4. \`resetMagnet\` fires exactly once, on the one move where a button's \`wasInRadius\` flips from \`true\` to \`false\` — not repeatedly for as long as the cursor stays away. The original version instead deferred the reset behind a 200ms \`setTimeout\`, guarded by extra per-button flags to stop it re-firing every 200ms and to cancel a pending one if the cursor came back mid-wait; tracking the one-bit radius transition directly removes the timer, the magic 200ms constant, and both flags at once — \`overwrite: "auto"\` already redirects a quick re-entry cleanly, the same way it handles any other interrupted tween.
5. \`resetMagnet\`'s \`ease: "elastic.out(1.2, 0.2)"\` is what gives the release its bounce — the button overshoots \`(0, 0)\` slightly and settles with a couple of small oscillations, versus the plain \`power3.out\` ease used while actively tracking the cursor, which has no overshoot at all.

Load GSAP once, drop \`class="magnetic-button"\` on any button with a single \`<span>\` inside for the label, and call \`initMagneticButtons\` with the resulting NodeList.`,
    code: `<!-- <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script> -->
<!--
  <button class="magnetic-button"><span>Button 1</span></button>
  <button class="magnetic-button"><span>Button 2</span></button>
  <button class="magnetic-button"><span>Button 3</span></button>
-->

const STYLE_ID = "magnetic-button-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .magnetic-button {
      position: relative;
      width: 150px;
      height: 150px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid currentColor;
      border-radius: 50%;
      background: none;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .magnetic-button span {
      position: relative;
      display: inline-block;
    }
  \`;
  document.head.appendChild(style);
}

function initMagneticButtons(buttons, { radius = 150 } = {}) {
  ensureStyles();
  const list = buttons instanceof Element ? [buttons] : Array.from(buttons);
  const items = list.map((button) => ({
    button,
    text: button.querySelector("span"),
    wasInRadius: false,
  }));

  function resetMagnet(button, text) {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 2.5,
      ease: "elastic.out(1.2, 0.2)",
      overwrite: "auto",
    });

    if (text) {
      gsap.to(text, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }

  document.addEventListener("mousemove", (e) => {
    items.forEach((item) => {
      const rect = item.button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const isInRadius = distance < radius;

      if (isInRadius) {
        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        gsap.to(item.button, {
          x: offsetX * 0.5,
          y: offsetY * 0.5,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });

        if (item.text) {
          gsap.to(item.text, {
            x: offsetX * 0.2,
            y: offsetY * 0.2,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      } else if (item.wasInRadius) {
        // Fires exactly once, on the move where the cursor crosses from
        // inside the radius to outside it — not repeatedly for as long as
        // it stays away.
        resetMagnet(item.button, item.text);
      }

      item.wasInRadius = isInRadius;
    });
  });
}

// Usage
initMagneticButtons(document.querySelectorAll(".magnetic-button"));`,
    preview: {
      type: "html",
      height: 300,
      markup: `<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<div style="max-width:480px;margin:0 auto;padding:30px 16px 8px;display:flex;justify-content:space-around;align-items:center;" id="stage">
  <button class="magnetic-button"><span>Home</span></button>
  <button class="magnetic-button"><span>Work</span></button>
  <button class="magnetic-button"><span>Contact</span></button>
</div>
<p style="max-width:480px;margin:4px auto 0;text-align:center;font:500 11px -apple-system,sans-serif;color:#94a3b8;">Move your cursor near a button — it pulls in, then springs back elastically once you move away.</p>
<style>
  body { margin: 0; background: #f0f0f0; font-family: -apple-system, sans-serif; }
  .magnetic-button {
    position: relative;
    width: 96px;
    height: 96px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #1e293b;
    border-radius: 50%;
    background: #fff;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    cursor: pointer;
  }
  .magnetic-button span {
    position: relative;
    display: inline-block;
  }
</style>
<script>
  var radius = 90;
  var items = Array.prototype.map.call(document.querySelectorAll(".magnetic-button"), function (button) {
    return { button: button, text: button.querySelector("span"), wasInRadius: false };
  });

  function resetMagnet(button, text) {
    gsap.to(button, { x: 0, y: 0, duration: 2.5, ease: "elastic.out(1.2, 0.2)", overwrite: "auto" });
    if (text) gsap.to(text, { x: 0, y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
  }

  document.addEventListener("mousemove", function (e) {
    items.forEach(function (item) {
      var rect = item.button.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      var isInRadius = distance < radius;

      if (isInRadius) {
        var offsetX = e.clientX - centerX;
        var offsetY = e.clientY - centerY;

        gsap.to(item.button, { x: offsetX * 0.5, y: offsetY * 0.5, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        if (item.text) gsap.to(item.text, { x: offsetX * 0.2, y: offsetY * 0.2, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      } else if (item.wasInRadius) {
        resetMagnet(item.button, item.text);
      }

      item.wasInRadius = isInRadius;
    });
  });
<\/script>`,
    },
  },
  {
    id: "phone-mockup-step-showcase",
    title: "Phone Mockup Step Showcase",
    language: "javascript",
    tags: ["animation", "carousel", "steps", "dom", "onboarding"],
    difficulty: "Advanced",
    description: "A multi-step \"how it works\" showcase where the background gradient, heading copy, and a phone-mockup visual all crossfade together on every step — dot and arrow navigation, dependency-free.",
    explanation: `Adapted from The Fix Wizard's homepage "How It Works" section — a step-by-step process walkthrough where every step crossfades three things together: the background gradient behind the section, the heading/description text, and a phone-mockup visual showing what that step looks like on a customer's phone.

One \`goTo(index)\` function keeps three independent crossfades in lockstep:

1. **Background** — two full-bleed layers (\`data-layer="a"\`/\`"b"\`) are stacked on top of each other and only one is ever visible. Moving to a new step paints the *hidden* layer with the next gradient, fades it in, fades the old one out, then flips which layer is hidden for next time — this sidesteps trying to transition a \`background\` property directly, which doesn't animate smoothly between arbitrary gradients.
2. **Text** — the heading and description each sit inside an \`overflow: hidden\` mask. A \`visible\`/\`exiting\` class pair slides the text up and out, swaps its \`textContent\` while it's off-screen, resets the transform with \`transition: none\` so the reset itself is invisible, then re-adds \`visible\` on the next frame so it slides back in from below instead of just popping into place.
3. **Visual** — every step's phone content is pre-rendered as a \`.ssw-slide\`, stacked absolutely inside \`.ssw-visual-col\`. Only the one with \`.active\` has \`opacity: 1\` and receives pointer events, so switching steps is just moving that class.

Call \`createStepShowcase(rootEl, steps)\` with an array of \`{ badge, heading, desc, color, bg, screenHTML }\` objects. \`screenHTML\` is any HTML string — a message bubble, an invoice card, a settings screen, or nothing but an icon — so wrap it in \`.ssw-phone\` / \`.ssw-screen\` for the bezel-and-notch device frame, or skip that markup entirely for a plain crossfading illustration instead of a phone.

Navigation works three ways: the prev/next buttons, clicking a dot directly, and the left/right arrow keys once the component has focus.`,
    code: `/* ---- CSS (add once to your stylesheet) ----
.ssw { position: relative; overflow: hidden; border-radius: 24px; min-height: 560px; color: #fff; font-family: Inter, system-ui, sans-serif; }
.ssw-bg { position: absolute; inset: 0; transition: opacity 0.6s ease; }
.ssw-bg[data-layer="b"] { opacity: 0; }
.ssw-inner { position: relative; z-index: 1; height: 100%; }
.ssw-layout { display: flex; align-items: center; gap: 56px; max-width: 1000px; margin: 0 auto; padding: 56px 32px 96px; min-height: 480px; }
.ssw-text-col { flex: 0 0 42%; display: flex; flex-direction: column; gap: 18px; }
.ssw-badge { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; transition: background-color 0.5s ease; }
.ssw-heading-mask, .ssw-desc-mask { overflow: hidden; }
.ssw-heading { margin: 0; font-size: clamp(26px, 3vw, 40px); line-height: 1.15; font-weight: 800; transform: translateY(110%); transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
.ssw-heading.visible { transform: translateY(0); }
.ssw-heading.exiting { transform: translateY(-110%); }
.ssw-desc { margin: 0; max-width: 380px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.7); transform: translateY(110%); transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.06s; }
.ssw-desc.visible { transform: translateY(0); }
.ssw-desc.exiting { transform: translateY(-110%); }
.ssw-visual-col { flex: 1; position: relative; min-height: 420px; }
.ssw-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.45s ease; pointer-events: none; }
.ssw-slide.active { opacity: 1; pointer-events: auto; }
.ssw-phone { width: 220px; height: 440px; border-radius: 40px; background: linear-gradient(160deg,#2c2c2e,#1c1c1e); box-shadow: 0 0 0 1.5px rgba(255,255,255,0.12), 0 0 0 8px #1c1c1e, 0 30px 60px rgba(0,0,0,0.6); position: relative; }
.ssw-phone::before { content: ""; position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 90px; height: 24px; background: #000; border-radius: 12px; z-index: 2; }
.ssw-screen { position: absolute; inset: 8px; border-radius: 32px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.ssw-nav { display: flex; align-items: center; justify-content: center; gap: 16px; position: absolute; left: 0; right: 0; bottom: 24px; z-index: 2; }
.ssw-nav-btn { width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); font-size: 20px; line-height: 1; cursor: pointer; }
.ssw-nav-btn:disabled { opacity: 0.25; cursor: default; }
.ssw-dots { display: flex; gap: 8px; }
.ssw-dot { width: 6px; height: 6px; border-radius: 3px; border: none; background: rgba(255,255,255,0.25); cursor: pointer; transition: all 0.3s; padding: 0; }
.ssw-dot.active { width: 22px; background: #fff; }
@media (max-width: 720px) {
  .ssw-layout { flex-direction: column; text-align: center; padding: 40px 20px 88px; gap: 28px; }
  .ssw-text-col { align-items: center; }
  .ssw-desc { max-width: 100%; }
}
------------------------------------------------ */

/**
 * Markup contract — steps is an array of:
 *   { badge: "01", heading: "...", desc: "...", color: "#FF6B35", bg: "linear-gradient(...)", screenHTML: "<div>...</div>" }
 * screenHTML is optional and can be any HTML string — wrap it in
 * <div class="ssw-phone"><div class="ssw-screen">...</div></div> for the
 * phone-bezel look, or leave it out entirely for a plain crossfading visual.
 */
function createStepShowcase(root, steps) {
  root.classList.add("ssw");
  root.setAttribute("tabindex", "0");
  root.innerHTML =
    '<div class="ssw-bg" data-layer="a"></div>' +
    '<div class="ssw-bg" data-layer="b"></div>' +
    '<div class="ssw-inner">' +
      '<div class="ssw-layout">' +
        '<div class="ssw-text-col">' +
          '<span class="ssw-badge"></span>' +
          '<div class="ssw-heading-mask"><h3 class="ssw-heading"></h3></div>' +
          '<div class="ssw-desc-mask"><p class="ssw-desc"></p></div>' +
        "</div>" +
        '<div class="ssw-visual-col"></div>' +
      "</div>" +
      '<div class="ssw-nav">' +
        '<button class="ssw-nav-btn" data-dir="prev" aria-label="Previous step">&#8249;</button>' +
        '<div class="ssw-dots" role="tablist"></div>' +
        '<button class="ssw-nav-btn" data-dir="next" aria-label="Next step">&#8250;</button>' +
      "</div>" +
    "</div>";

  var bgA = root.querySelector('[data-layer="a"]');
  var bgB = root.querySelector('[data-layer="b"]');
  var badgeEl = root.querySelector(".ssw-badge");
  var headingEl = root.querySelector(".ssw-heading");
  var descEl = root.querySelector(".ssw-desc");
  var visualCol = root.querySelector(".ssw-visual-col");
  var dotsWrap = root.querySelector(".ssw-dots");
  var prevBtn = root.querySelector('[data-dir="prev"]');
  var nextBtn = root.querySelector('[data-dir="next"]');

  var current = 0;
  var bgActive = "a";
  var busy = false;
  var slides = [];
  var dots = [];

  steps.forEach(function (step, i) {
    var slide = document.createElement("div");
    slide.className = "ssw-slide" + (i === 0 ? " active" : "");
    slide.innerHTML = step.screenHTML || "";
    visualCol.appendChild(slide);
    slides.push(slide);

    var dot = document.createElement("button");
    dot.className = "ssw-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Step " + (i + 1));
    dot.addEventListener("click", function () {
      goTo(i);
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  bgA.style.background = steps[0].bg;
  bgB.style.background = steps[0].bg;
  bgA.style.opacity = "1";

  function paint(step) {
    badgeEl.textContent = step.badge;
    badgeEl.style.background = step.color;
    headingEl.textContent = step.heading;
    descEl.textContent = step.desc;
  }

  paint(steps[0]);
  requestAnimationFrame(function () {
    headingEl.classList.add("visible");
    descEl.classList.add("visible");
  });
  sync();

  function goTo(idx) {
    if (idx === current || busy || idx < 0 || idx >= steps.length) return;
    busy = true;
    var next = steps[idx];

    headingEl.classList.remove("visible");
    headingEl.classList.add("exiting");
    descEl.classList.remove("visible");
    descEl.classList.add("exiting");

    var incoming = bgActive === "a" ? bgB : bgA;
    var outgoing = bgActive === "a" ? bgA : bgB;
    incoming.style.background = next.bg;
    incoming.style.opacity = "1";
    outgoing.style.opacity = "0";
    bgActive = bgActive === "a" ? "b" : "a";

    slides[current].classList.remove("active");

    setTimeout(function () {
      headingEl.classList.remove("exiting");
      descEl.classList.remove("exiting");
      headingEl.style.transition = "none";
      descEl.style.transition = "none";
      headingEl.style.transform = "translateY(110%)";
      descEl.style.transform = "translateY(110%)";

      paint(next);
      slides[idx].classList.add("active");
      current = idx;
      sync();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          headingEl.style.transition = "";
          descEl.style.transition = "";
          headingEl.style.transform = "";
          descEl.style.transform = "";
          headingEl.classList.add("visible");
          descEl.classList.add("visible");
          busy = false;
        });
      });
    }, 320);
  }

  function sync() {
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === steps.length - 1;
  }

  prevBtn.addEventListener("click", function () {
    goTo(current - 1);
  });
  nextBtn.addEventListener("click", function () {
    goTo(current + 1);
  });
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  return { goTo: goTo };
}

// Usage
createStepShowcase(document.getElementById("showcase"), [
  {
    badge: "01",
    heading: "One Tap Books It",
    desc: "Send a link, they pick a time — no phone tag.",
    color: "#FF6B35",
    bg: "linear-gradient(160deg,#160f40 0%,#050311 100%)",
    screenHTML: '<div class="ssw-phone"><div class="ssw-screen" style="background:#111827;color:#fff;font:700 13px system-ui;">Booked</div></div>',
  },
  // ...more steps
]);`,
    preview: {
      type: "html",
      height: 340,
      markup: `<div id="demo" style="max-width:640px;margin:0 auto;"></div>
<style>
  body { margin:0; background:#0b0b12; }
  .ssw { position: relative; overflow: hidden; border-radius: 20px; min-height: 300px; color: #fff; font-family: Inter, system-ui, sans-serif; }
  .ssw-bg { position: absolute; inset: 0; transition: opacity 0.6s ease; }
  .ssw-bg[data-layer="b"] { opacity: 0; }
  .ssw-inner { position: relative; z-index: 1; }
  .ssw-layout { display: flex; align-items: center; gap: 28px; padding: 32px 28px 76px; }
  .ssw-text-col { flex: 0 0 48%; display: flex; flex-direction: column; gap: 10px; }
  .ssw-badge { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; transition: background-color 0.5s ease; }
  .ssw-heading-mask, .ssw-desc-mask { overflow: hidden; }
  .ssw-heading { margin: 0; font-size: 20px; line-height: 1.2; font-weight: 800; transform: translateY(110%); transition: transform 0.55s cubic-bezier(0.22,1,0.36,1); }
  .ssw-heading.visible { transform: translateY(0); }
  .ssw-heading.exiting { transform: translateY(-110%); }
  .ssw-desc { margin: 0; font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.7); transform: translateY(110%); transition: transform 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s; }
  .ssw-desc.visible { transform: translateY(0); }
  .ssw-desc.exiting { transform: translateY(-110%); }
  .ssw-visual-col { flex: 1; position: relative; min-height: 170px; display: flex; align-items: center; justify-content: center; }
  .ssw-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s ease; pointer-events: none; }
  .ssw-slide.active { opacity: 1; pointer-events: auto; }
  .ssw-phone { width: 108px; height: 170px; border-radius: 20px; background: linear-gradient(160deg,#2c2c2e,#1c1c1e); box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 14px 30px rgba(0,0,0,0.55); position: relative; }
  .ssw-screen { position: absolute; inset: 5px; border-radius: 15px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .ssw-nav { display: flex; align-items: center; justify-content: center; gap: 12px; position: absolute; left: 0; right: 0; bottom: 16px; }
  .ssw-nav-btn { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); font-size: 15px; cursor: pointer; }
  .ssw-nav-btn:disabled { opacity: 0.25; cursor: default; }
  .ssw-dots { display: flex; gap: 6px; }
  .ssw-dot { width: 5px; height: 5px; border-radius: 3px; border: none; background: rgba(255,255,255,0.25); cursor: pointer; transition: all 0.3s; padding: 0; }
  .ssw-dot.active { width: 16px; background: #fff; }
</style>
<script>
  function createStepShowcase(root, steps) {
    root.classList.add('ssw');
    root.innerHTML =
      '<div class="ssw-bg" data-layer="a"></div>' +
      '<div class="ssw-bg" data-layer="b"></div>' +
      '<div class="ssw-inner">' +
        '<div class="ssw-layout">' +
          '<div class="ssw-text-col">' +
            '<span class="ssw-badge"></span>' +
            '<div class="ssw-heading-mask"><h3 class="ssw-heading"></h3></div>' +
            '<div class="ssw-desc-mask"><p class="ssw-desc"></p></div>' +
          '</div>' +
          '<div class="ssw-visual-col"></div>' +
        '</div>' +
        '<div class="ssw-nav">' +
          '<button class="ssw-nav-btn" data-dir="prev" aria-label="Previous step">&#8249;</button>' +
          '<div class="ssw-dots" role="tablist"></div>' +
          '<button class="ssw-nav-btn" data-dir="next" aria-label="Next step">&#8250;</button>' +
        '</div>' +
      '</div>';

    var bgA = root.querySelector('[data-layer="a"]');
    var bgB = root.querySelector('[data-layer="b"]');
    var badgeEl = root.querySelector('.ssw-badge');
    var headingEl = root.querySelector('.ssw-heading');
    var descEl = root.querySelector('.ssw-desc');
    var visualCol = root.querySelector('.ssw-visual-col');
    var dotsWrap = root.querySelector('.ssw-dots');
    var prevBtn = root.querySelector('[data-dir="prev"]');
    var nextBtn = root.querySelector('[data-dir="next"]');

    var current = 0, bgActive = 'a', busy = false;
    var slides = [], dots = [];

    steps.forEach(function (step, i) {
      var slide = document.createElement('div');
      slide.className = 'ssw-slide' + (i === 0 ? ' active' : '');
      slide.innerHTML = step.screenHTML || '';
      visualCol.appendChild(slide);
      slides.push(slide);

      var dot = document.createElement('button');
      dot.className = 'ssw-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Step ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    bgA.style.background = steps[0].bg;
    bgB.style.background = steps[0].bg;
    bgA.style.opacity = '1';

    function paint(step) {
      badgeEl.textContent = step.badge;
      badgeEl.style.background = step.color;
      headingEl.textContent = step.heading;
      descEl.textContent = step.desc;
    }

    paint(steps[0]);
    requestAnimationFrame(function () {
      headingEl.classList.add('visible');
      descEl.classList.add('visible');
    });
    sync();

    function goTo(idx) {
      if (idx === current || busy || idx < 0 || idx >= steps.length) return;
      busy = true;
      var next = steps[idx];

      headingEl.classList.remove('visible');
      headingEl.classList.add('exiting');
      descEl.classList.remove('visible');
      descEl.classList.add('exiting');

      var incoming = bgActive === 'a' ? bgB : bgA;
      var outgoing = bgActive === 'a' ? bgA : bgB;
      incoming.style.background = next.bg;
      incoming.style.opacity = '1';
      outgoing.style.opacity = '0';
      bgActive = bgActive === 'a' ? 'b' : 'a';

      slides[current].classList.remove('active');

      setTimeout(function () {
        headingEl.classList.remove('exiting');
        descEl.classList.remove('exiting');
        headingEl.style.transition = 'none';
        descEl.style.transition = 'none';
        headingEl.style.transform = 'translateY(110%)';
        descEl.style.transform = 'translateY(110%)';

        paint(next);
        slides[idx].classList.add('active');
        current = idx;
        sync();

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            headingEl.style.transition = '';
            descEl.style.transition = '';
            headingEl.style.transform = '';
            descEl.style.transform = '';
            headingEl.classList.add('visible');
            descEl.classList.add('visible');
            busy = false;
          });
        });
      }, 320);
    }

    function sync() {
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === steps.length - 1;
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    return { goTo: goTo };
  }

  createStepShowcase(document.getElementById('demo'), [
    {
      badge: '01', color: '#FF6B35',
      bg: 'linear-gradient(160deg,#2a1204 0%,#0d0500 100%)',
      heading: 'One Tap Books It',
      desc: 'Send a link, they pick a time. No phone tag.',
      screenHTML: '<div class="ssw-phone"><div class="ssw-screen" style="background:#111827;color:#fff;font:700 13px system-ui;">Booked</div></div>'
    },
    {
      badge: '02', color: '#38bdf8',
      bg: 'linear-gradient(160deg,#072030 0%,#020c12 100%)',
      heading: 'We\\'re On Our Way',
      desc: 'A live arrival alert lands 30 minutes out.',
      screenHTML: '<div class="ssw-phone"><div class="ssw-screen" style="background:#111827;color:#93c5fd;font:700 12px system-ui;">On the way</div></div>'
    },
    {
      badge: '03', color: '#4ade80',
      bg: 'linear-gradient(160deg,#0a1a08 0%,#030804 100%)',
      heading: 'Paid In One Tap',
      desc: 'A secure payment link, done before you leave.',
      screenHTML: '<div class="ssw-phone"><div class="ssw-screen" style="background:#f0efe9;color:#241a12;font:700 13px system-ui;">$185.00</div></div>'
    }
  ]);
<\/script>`,
    },
  },
  {
    id: "phone-mockup-step-showcase-next",
    title: "Phone Mockup Step Showcase (Next.js)",
    language: "react",
    tags: ["animation", "carousel", "steps", "framer-motion", "next.js", "onboarding"],
    difficulty: "Advanced",
    description: "The same phone-mockup step showcase as a copy-paste React/Next.js component — Framer Motion crossfades the background, heading, and phone visual on every step change.",
    explanation: `The React/Next.js version of the phone-mockup step showcase, swapping the vanilla version's manual dual-layer crossfade for Framer Motion's \`AnimatePresence\`. Pass a \`steps\` array of \`{ badge, heading, desc, color, bg, content }\` — \`content\` is any React node, and the exported \`PhoneMockup\` component is just one way to wrap it in a phone bezel; pass a plain \`<div>\` instead for a non-phone visual.

Every crossfade is keyed on \`index\`, so \`AnimatePresence\` handles animating the outgoing element out and the incoming one in whenever the key changes:

1. The **background** is a single \`motion.div\` re-keyed on \`step.bg\`, so Framer Motion fades between gradients the same way the vanilla version's two stacked layers do, without needing to manage two elements by hand.
2. The **heading and description** are wrapped together and keyed on \`index\`, sliding up when moving forward and down when moving backward — the direction comes from a \`dir\` flag \`goTo()\` sets based on whether the new index is greater or less than the current one.
3. The **visual** column crossfades \`step.content\` the same way, just with a plain opacity fade instead of a directional slide.

\`goTo(i)\` guards against re-entering the current index or stepping out of bounds, and the prev/next buttons disable themselves at either end exactly like the vanilla version.`,
    code: `"use client";

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
}`,
    preview: {
      type: "html",
      height: 360,
      reactRuntime: true,
      markup: `<div id="root" style="max-width:640px;margin:0 auto;"></div>
<style>
  body { margin:0; background:#0b0b12; }
</style>
<script>
  var e = React.createElement;
  var Motion = window.Motion;

  var steps = [
    { badge: '01', color: '#FF6B35', bg: 'linear-gradient(160deg,#2a1204 0%,#0d0500 100%)', heading: 'One Tap Books It', desc: 'Send a link, they pick a time.', screen: 'Booked' },
    { badge: '02', color: '#38bdf8', bg: 'linear-gradient(160deg,#072030 0%,#020c12 100%)', heading: 'We\\'re On Our Way', desc: 'A live arrival alert lands 30 minutes out.', screen: 'On the way' },
    { badge: '03', color: '#4ade80', bg: 'linear-gradient(160deg,#0a1a08 0%,#030804 100%)', heading: 'Paid In One Tap', desc: 'A secure payment link, done in seconds.', screen: '$185.00' }
  ];

  function PhoneScreen(props) {
    return e('div', {
      style: {
        width: 108, height: 170, borderRadius: 20,
        background: 'linear-gradient(160deg,#2c2c2e,#1c1c1e)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 14px 30px rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 12, fontWeight: 700
      }
    }, props.children);
  }

  function StepShowcaseDemo() {
    var state = React.useState(0);
    var index = state[0], setIndex = state[1];
    var step = steps[index];

    function goTo(i) {
      if (i < 0 || i >= steps.length) return;
      setIndex(i);
    }

    return e('div', {
      style: { position: 'relative', minHeight: 300, borderRadius: 20, overflow: 'hidden', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }
    },
      e(Motion.motion.div, {
        key: 'bg-' + index,
        style: { position: 'absolute', inset: 0, background: step.bg },
        initial: { opacity: 0.4 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 }
      }),
      e('div', { style: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, padding: '28px 24px 64px' } },
        e('div', { style: { flex: '0 0 50%', display: 'flex', flexDirection: 'column', gap: 8 } },
          e('span', {
            style: { width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: step.color }
          }, step.badge),
          e(Motion.motion.div, {
            key: 'text-' + index,
            initial: { y: 14, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { duration: 0.4 }
          },
            e('h3', { style: { margin: '6px 0 4px', fontSize: 17, fontWeight: 800 } }, step.heading),
            e('p', { style: { margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' } }, step.desc)
          )
        ),
        e('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 } },
          e(Motion.motion.div, { key: 'phone-' + index, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.35 } },
            e(PhoneScreen, null, step.screen)
          )
        )
      ),
      e('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 } },
        e('button', {
          onClick: function () { goTo(index - 1); },
          disabled: index === 0,
          style: { width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', opacity: index === 0 ? 0.25 : 1 }
        }, '‹'),
        steps.map(function (_, i) {
          return e('button', {
            key: i,
            onClick: function () { goTo(i); },
            style: { width: i === index ? 16 : 5, height: 5, borderRadius: 3, border: 'none', background: i === index ? '#fff' : 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'all .3s' }
          });
        }),
        e('button', {
          onClick: function () { goTo(index + 1); },
          disabled: index === steps.length - 1,
          style: { width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', opacity: index === steps.length - 1 ? 0.25 : 1 }
        }, '›')
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(e(StepShowcaseDemo));
<\/script>`,
    },
  },
];
