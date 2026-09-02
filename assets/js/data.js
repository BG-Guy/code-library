/* Code Library — snippet dataset.
   Plain JS array (not fetched) so the site also works when opened via file://.
   Scope: web development only — vanilla JavaScript (frontend), and React/Next.js. */

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  react: "React / Next.js",
};

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
    tags: ["animation", "navigation", "hover-effects", "dom"],
    difficulty: "Intermediate",
    description: "Turn any nav link into a two-line 'carousel' that rolls a duplicate label in on hover, with a dot-to-bar underline animating underneath — wire up an entire nav bar with one function call per link.",
    explanation: `A common portfolio-site nav effect: hovering a link makes its label appear to scroll away while an identical copy scrolls in from the opposite edge, with a thin underline growing in from a centered dot. Building this by hand normally means duplicating markup per link — this version does it for you from a single function call.

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
];
