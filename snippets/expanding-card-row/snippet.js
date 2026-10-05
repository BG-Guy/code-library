// Expanding Card Row - the "What we do" section from pinevalleydigital.com.
//
// Two JS parts in one file, in dependency order: the canvas line animation,
// then the component. The stylesheet is the third piece and sits beside this
// file as expandingCardRow.css - load it once; the component does not inject
// it. The verbatim TypeScript originals are in this folder too if you want
// the types: expandingCardRow.ts, flowingLines.ts, example.ts.
//
// Mount it into an empty section element:
//
//   mountExpandingCardRow(document.querySelector("#services"), {
//     heading: "What we <em>do</em>",
//     items: [{ title: "Web Design", copy: "...", points: ["..."], href: "/x" }],
//   })
//
// Match your site by setting these on the section: --ecr-ink, --ecr-bg (must
// equal the section background), --ecr-light, --ecr-accent, --ecr-accent-2,
// --ecr-font-display, and --ecr-nav-h if the page has a fixed header.
// It assumes the page scrolls on the window, not inside a scrolling element.

// ------------------------------------------------------------------------
// 1. flowingLines - the open card's animated canvas lines
// ------------------------------------------------------------------------

// Flowing lines: a bundle of thin, rippling lines that pinch together at one
// point and fan out at both ends, a few of them carrying a travelling band of
// light — redrawn on a <canvas> every frame. Used by expandingCardRow.ts for
// the open card's background; works on its own too. It hands back start /
// stop (pause it while nothing is showing it), configure (swap in a
// different look on the same canvas) and destroy. The canvas sizes itself
// to its parent, which must be positioned and have a real size. No
// dependencies.
// The snippet's own defaults, unchanged.
const DEFAULTS = {
    lineCount: 30,
    pinch: { x: 0.66, y: 0.46 },
    entryAngles: [208, 249],
    exitAngles: [8, 58],
    bunch: 22,
    curveAmount: 22,
    breathAmp: 14,
    breathPeriod: 9,
    waveSamples: 72,
    waveAmp: 34,
    waveFreq: 2.6,
    waveSpeed: 0.55,
    travelMin: 1,
    travelMax: 10,
    travelStep: 0.3,
    drawWidth: 0.9,
    glowWidth: 2.2,
    highlightCount: 3,
    highlightWidth: [60, 100],
    highlightPeriod: 5,
    highlightOffsets: [0, 0.37, 0.68],
    highlightGlow: 8,
    highlightCore: 1.8,
    highlightColor: [246, 173, 20],
    accentEvery: 21,
    palette: [
        [134, 224, 96],
        [74, 222, 128],
        [45, 212, 191],
        [34, 211, 238],
        [59, 130, 246],
    ],
    accentColor: [217, 130, 245],
};
function createFlowingLines(canvas, overrides = {}) {
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    if (!ctx || !parent)
        return { start() { }, stop() { }, configure() { }, destroy() { } };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const CONFIG = { ...DEFAULTS, ...overrides };
    const lerp = (a, b, u) => a + (b - a) * u;
    const degToRad = (d) => (d / 180) * Math.PI;
    function paletteColor(u) {
        u = Math.max(0, Math.min(1, u));
        const palette = CONFIG.palette;
        const scaled = u * (palette.length - 1);
        const i0 = Math.floor(scaled);
        const i1 = Math.min(palette.length - 1, i0 + 1);
        const f = scaled - i0;
        const a = palette[i0];
        const b = palette[i1];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }
    // Point and tangent on a cubic bezier at parameter u, so a ripple can be
    // added perpendicular to the curve's own direction rather than a fixed axis.
    function bezierPoint(p0, c1, c2, p3, u) {
        const mu = 1 - u;
        return {
            x: mu * mu * mu * p0.x + 3 * mu * mu * u * c1.x + 3 * mu * u * u * c2.x + u * u * u * p3.x,
            y: mu * mu * mu * p0.y + 3 * mu * mu * u * c1.y + 3 * mu * u * u * c2.y + u * u * u * p3.y,
        };
    }
    function bezierTangent(p0, c1, c2, p3, u) {
        const mu = 1 - u;
        const x = 3 * mu * mu * (c1.x - p0.x) + 6 * mu * u * (c2.x - c1.x) + 3 * u * u * (p3.x - c2.x);
        const y = 3 * mu * mu * (c1.y - p0.y) + 6 * mu * u * (c2.y - c1.y) + 3 * u * u * (p3.y - c2.y);
        const len = Math.sqrt(x * x + y * y) || 1;
        return { x: x / len, y: y / len };
    }
    function buildLines() {
        const travelSpan = CONFIG.travelMax - CONFIG.travelMin;
        const result = [];
        for (let i = 0; i < CONFIG.lineCount; i++) {
            const fanPos = CONFIG.lineCount === 1 ? 0.5 : i / (CONFIG.lineCount - 1);
            const travelStart = CONFIG.travelMin + i * CONFIG.travelStep;
            // Where this line sits in the shared oscillator's cycle, expressed as
            // a phase: travelMin maps to phase 0, travelMax maps to a full 2*PI turn.
            const wavePhase = ((travelStart - CONFIG.travelMin) / travelSpan) * Math.PI * 2;
            result.push({
                fanPos,
                entryAngle: degToRad(lerp(CONFIG.entryAngles[0], CONFIG.entryAngles[1], fanPos)),
                exitAngle: degToRad(lerp(CONFIG.exitAngles[0], CONFIG.exitAngles[1], fanPos)),
                perp: (fanPos - 0.5) * CONFIG.bunch + (Math.random() - 0.5) * 4,
                widthJitter: 0.75 + Math.random() * 0.6,
                alpha: 0.45 + Math.random() * 0.4,
                wavePhase,
                accent: i % CONFIG.accentEvery === Math.floor(CONFIG.accentEvery / 2),
            });
        }
        // A few lines, spread evenly across the fan, each carry one travelling
        // band of light. They all share highlightPeriod — only the offset differs,
        // so no two bands slide off the end at the same moment.
        for (let k = 0; k < CONFIG.highlightCount && k < result.length; k++) {
            const spread = CONFIG.highlightCount === 1 ? 0.5 : k / (CONFIG.highlightCount - 1);
            result[Math.round(((k + 0.5) / CONFIG.highlightCount) * (result.length - 1))].highlight = {
                width: lerp(CONFIG.highlightWidth[0], CONFIG.highlightWidth[1], spread),
                offset: CONFIG.highlightOffsets[k % CONFIG.highlightOffsets.length],
            };
        }
        return result;
    }
    // One shared oscillator for every line, computed once per frame — so the
    // whole bundle's base shape moves at exactly one speed. Only wavePhase
    // (baked into each line above) should ever differ between lines.
    function pinchAt(t, w, h) {
        const breathX = Math.sin(t * ((Math.PI * 2) / CONFIG.breathPeriod));
        const breathY = Math.cos(t * ((Math.PI * 2) / (CONFIG.breathPeriod * 1.3)));
        return {
            x: w * CONFIG.pinch.x + breathX * CONFIG.breathAmp,
            y: h * CONFIG.pinch.y + breathY * CONFIG.breathAmp * 0.6,
        };
    }
    // The line's base bezier (before the ripple is added): both ends sit far
    // out along the line's entry/exit angle from the pinch, and both control
    // points are pulled back in close to the pinch, bowed sideways by a fixed
    // amount so the curve arcs smoothly instead of kinking at the pinch.
    function baseBezierFor(line, pinch, reach) {
        const offX = pinch.x;
        const offY = pinch.y + line.perp;
        const bow = CONFIG.curveAmount;
        return {
            p0: { x: pinch.x + Math.cos(line.entryAngle) * reach, y: pinch.y + Math.sin(line.entryAngle) * reach },
            p3: { x: pinch.x + Math.cos(line.exitAngle) * reach, y: pinch.y + Math.sin(line.exitAngle) * reach },
            c1: {
                x: offX + Math.cos(line.entryAngle) * reach * 0.32 - Math.sin(line.entryAngle) * bow,
                y: offY + Math.sin(line.entryAngle) * reach * 0.32 + Math.cos(line.entryAngle) * bow,
            },
            c2: {
                x: offX + Math.cos(line.exitAngle) * reach * 0.32 - Math.sin(line.exitAngle) * bow,
                y: offY + Math.sin(line.exitAngle) * reach * 0.32 + Math.cos(line.exitAngle) * bow,
            },
        };
    }
    function colorGradientFor(c, line, p0, p3) {
        const baseColor = paletteColor(line.fanPos);
        const nextColor = paletteColor(Math.min(1, line.fanPos + 0.22));
        const grad = c.createLinearGradient(p0.x, p0.y, p3.x, p3.y);
        grad.addColorStop(0, `rgba(${baseColor.join(',')},${line.alpha})`);
        if (line.accent)
            grad.addColorStop(0.5, `rgba(${CONFIG.accentColor.join(',')},${line.alpha})`);
        grad.addColorStop(1, `rgba(${nextColor.join(',')},${line.alpha})`);
        return grad;
    }
    // Samples the line's wavy path into a point list: walks the base bezier and
    // pushes each sample sideways by a sine riding along its own length.
    // Identical waveform for every line — the only difference between lines is
    // wavePhase, i.e. which spot in the shared travel range this one was
    // sampled from. Returning the points (rather than stroking straight into
    // the canvas path) is what lets the highlight reuse the exact same curve.
    function samplePath(bezier, wavePhase, t) {
        const edge = 0.06; // fraction of the length, at each end, where the ripple fades to 0
        const points = [];
        for (let s = 0; s <= CONFIG.waveSamples; s++) {
            const u = s / CONFIG.waveSamples;
            const point = bezierPoint(bezier.p0, bezier.c1, bezier.c2, bezier.p3, u);
            const tangent = bezierTangent(bezier.p0, bezier.c1, bezier.c2, bezier.p3, u);
            const normal = { x: -tangent.y, y: tangent.x };
            const taper = Math.max(0, Math.min(1, Math.min(u / edge, (1 - u) / edge)));
            const ripple = CONFIG.waveAmp * taper * Math.sin(CONFIG.waveFreq * u * Math.PI * 2 + wavePhase + t * CONFIG.waveSpeed);
            points.push({ x: point.x + normal.x * ripple, y: point.y + normal.y * ripple });
        }
        return points;
    }
    function tracePoints(c, points) {
        for (let i = 0; i < points.length; i++) {
            if (i === 0)
                c.moveTo(points[i].x, points[i].y);
            else
                c.lineTo(points[i].x, points[i].y);
        }
    }
    // Cuts out the stretch of an already-sampled path between two arc lengths,
    // interpolating at both ends — so a band stays the same number of px long
    // wherever it currently sits, even where the samples are unevenly spaced.
    function sliceByLength(points, from, to) {
        const slice = [];
        let walked = 0;
        for (let i = 1; i < points.length; i++) {
            const a = points[i - 1];
            const b = points[i];
            const seg = Math.hypot(b.x - a.x, b.y - a.y);
            if (seg > 0 && walked + seg >= from && walked <= to) {
                const u0 = Math.max(0, (from - walked) / seg);
                const u1 = Math.min(1, (to - walked) / seg);
                if (!slice.length)
                    slice.push({ x: lerp(a.x, b.x, u0), y: lerp(a.y, b.y, u0) });
                slice.push({ x: lerp(a.x, b.x, u1), y: lerp(a.y, b.y, u1) });
            }
            walked += seg;
        }
        return slice;
    }
    // The arc-length stretch of the path that actually falls inside the canvas.
    // Every line runs far past both edges of the frame, so a band that crossed
    // the whole path would spend most of its cycle off-screen — it travels this
    // stretch instead, entering at one frame edge and leaving at the other.
    function visibleRange(points, w, h) {
        const pad = 40;
        let walked = 0;
        let start = -1;
        let end = 0;
        for (let i = 0; i < points.length; i++) {
            if (i > 0)
                walked += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
            const p = points[i];
            if (p.x >= -pad && p.x <= w + pad && p.y >= -pad && p.y <= h + pad) {
                if (start < 0)
                    start = walked;
                end = walked;
            }
        }
        return start < 0 ? null : { start, end };
    }
    // One short band of light slides across the line's on-screen stretch, once
    // per highlightPeriod: the band is just a highlightWidth-long slice of the
    // very same wavy path, restroked brighter and thicker with its alpha falling
    // off to 0 at both ends so it reads as light rather than a solid dash.
    function drawHighlight(c, line, points, t, w, h) {
        if (!line.highlight)
            return;
        const range = visibleRange(points, w, h);
        if (!range || range.end - range.start < 1)
            return;
        const span = line.highlight.width;
        const progress = (((t / CONFIG.highlightPeriod + line.highlight.offset) % 1) + 1) % 1;
        // Starts fully off one end and finishes fully off the other, so the band
        // slides in and out of frame instead of popping in mid-line.
        const head = range.start - span + progress * (range.end - range.start + span * 2);
        const from = Math.max(range.start, head);
        const to = Math.min(range.end, head + span);
        if (to - from < 1)
            return;
        const slice = sliceByLength(points, from, to);
        if (slice.length < 2)
            return;
        const bandStart = slice[0];
        const bandEnd = slice[slice.length - 1];
        const color = `rgba(${CONFIG.highlightColor.join(',')}`;
        const grad = c.createLinearGradient(bandStart.x, bandStart.y, bandEnd.x, bandEnd.y);
        grad.addColorStop(0, `${color},0)`);
        grad.addColorStop(0.5, `${color},1)`);
        grad.addColorStop(1, `${color},0)`);
        c.beginPath();
        tracePoints(c, slice);
        c.strokeStyle = grad;
        c.lineCap = 'round';
        c.globalAlpha = 0.3;
        c.lineWidth = CONFIG.highlightGlow;
        c.stroke();
        c.globalAlpha = 1;
        c.lineWidth = CONFIG.highlightCore;
        c.stroke();
        c.lineCap = 'butt';
    }
    function drawLine(c, line, pinch, t, w, h) {
        const reach = Math.max(w, h) * 1.55;
        const bezier = baseBezierFor(line, pinch, reach);
        const points = samplePath(bezier, line.wavePhase, t);
        c.beginPath();
        tracePoints(c, points);
        c.strokeStyle = colorGradientFor(c, line, bezier.p0, bezier.p3);
        c.globalAlpha = 0.18;
        c.lineWidth = CONFIG.glowWidth * line.widthJitter;
        c.stroke();
        c.globalAlpha = 1;
        c.lineWidth = CONFIG.drawWidth * line.widthJitter;
        c.stroke();
        if (line.highlight)
            drawHighlight(c, line, points, t, w, h);
    }
    let lines = buildLines();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animStart = null;
    let rafId = 0;
    let running = false;
    function draw(ts) {
        if (!running)
            return;
        if (animStart === null)
            animStart = ts;
        const t = reduceMotion ? 0 : (ts - animStart) / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);
        const pinch = pinchAt(t, w, h);
        for (let i = 0; i < lines.length; i++)
            drawLine(ctx, lines[i], pinch, t, w, h);
        // With reduced motion, one still frame and no loop.
        rafId = reduceMotion ? 0 : requestAnimationFrame(draw);
    }
    // Match the canvas's backing store to its parent's box. Resizing clears it,
    // so redraw straight away if it's meant to be showing.
    function resize() {
        const rect = parent.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        if (running) {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(draw);
        }
    }
    const sizer = new ResizeObserver(resize);
    sizer.observe(parent);
    resize();
    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
        rafId = 0;
    }
    return {
        start() {
            if (running)
                return;
            running = true;
            rafId = requestAnimationFrame(draw);
        },
        stop,
        configure(next) {
            Object.assign(CONFIG, DEFAULTS, next);
            lines = buildLines();
            // Redraw straight away (with reduced motion there's no loop to pick
            // the change up).
            if (running) {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(draw);
            }
        },
        destroy() {
            stop();
            sizer.disconnect();
        },
    };
}

// ------------------------------------------------------------------------
// 2. expandingCardRow - the component
// ------------------------------------------------------------------------

// Expanding Card Row — the "What we do" section from pinevalleydigital.com,
// as a drop-in component. No dependencies: vanilla TypeScript + one CSS file
// (expandingCardRow.css) + flowingLines.ts.
//
// What it is: one horizontal row of cards. The open card is wide and shows
// its title, copy, a panel of points and a corner arrow link; the others are
// narrow pills with a vertical title. Opening a card widens it while the
// last one narrows and the row glides, all on one spring clock (iOS-style),
// so the cards grow and move into place together. Clicking the open card
// (or its close button, or Escape) closes it into a pill. The row is wider
// than the screen and scrolls sideways:
//   - Mouse wheel / trackpad: scrolling over the section moves the row
//     (2.5x), rubber-banding at the ends. Who handles a scroll is decided
//     per gesture: once the row has run into an end, the page only moves on
//     the NEXT scroll, never mid-gesture.
//   - fillScreen (default on): the section is exactly one screen tall; a
//     scroll toward it while it's partly on screen glides the page until it
//     fills the screen. On touch screens the page snaps to it instead.
//   - Touch: drag the row 1:1, fling, bounce at the ends.
//   - A themed scrollbar under the row: drag the thumb, or press the track.
//   - Page dots, a counter, prev/next buttons, and Arrow / Home / End /
//     Escape keys.
// The open card's background has moving canvas lines (flowingLines.ts), a
// little different on each card. Cards have a thick ink border and a hard
// drop shadow, and the open card's corner link sits in a notch cut into the
// card, with the border and shadow following the notch.
//
// Usage:
//   import { mountExpandingCardRow } from './expandingCardRow'
//   import './expandingCardRow.css'
//
//   const row = mountExpandingCardRow(document.querySelector('#services')!, {
//     heading: 'What we <em>do</em>',
//     items: [
//       { title: 'Web Design', copy: 'Interfaces built around…', points: ['…', '…', '…'], href: '/services/web-design' },
//       // …
//     ],
//   })
//   row.destroy() // when unmounting (React: return it from useEffect)
//
// The container is usually an empty <section>; the component fills it and
// styles it (background, padding, height). Colours, fonts and a fixed
// header's height are CSS custom properties — see the top of the CSS file.
// The page is assumed to scroll on the window (not inside a scrolling div).
const DEFAULT_THEMES = ['purple', 'green', 'gold', 'ink'];
const LAYOUT_SPRING = { response: 0.55, damping: 0.825 };
const SCROLL_SPRING = { response: 0.38, damping: 0.68 };
// How far (in raw scroll px) a wheel gesture can stretch the row past an
// end, and how quickly (ms) that stretch eases off between wheel events.
const MAX_OVERSCROLL = 140;
const STRETCH_RELAX = 120;
// A pause this long (ms) between wheel events ends a scroll gesture; the
// next wheel event starts a new one.
const GESTURE_GAP = 300;
// The moving lines' base look: light tints that read on all four themes,
// running from bottom-left up to the right, clear of the card's title.
const FLOW_LINES = {
    entryAngles: [152, 111],
    exitAngles: [352, 302],
    palette: [
        [254, 249, 231],
        [190, 236, 226],
        [120, 210, 196],
        [205, 170, 255],
        [255, 222, 150],
    ],
    accentColor: [196, 140, 255],
};
// Card `i`'s own version of the lines: tilt, spread, pinch point, ripple,
// pace, line count and lead colour nudged by a fixed amount per card, so no
// two cards' lines move alike and a card looks the same each time it opens.
function linesFor(i) {
    // A repeatable pseudo-random value between min and max, for this card and
    // the given setting.
    const pick = (setting, min, max) => {
        const x = Math.sin((i + 1) * 12.9898 + setting * 78.233) * 43758.5453;
        return min + (x - Math.floor(x)) * (max - min);
    };
    const tilt = pick(1, -14, 14);
    const spread = pick(2, 0.75, 1.3);
    const fan = ([from, to]) => {
        const mid = (from + to) / 2 + tilt;
        const half = ((to - from) / 2) * spread;
        return [mid - half, mid + half];
    };
    const lead = i % FLOW_LINES.palette.length;
    return {
        ...FLOW_LINES,
        entryAngles: fan(FLOW_LINES.entryAngles),
        exitAngles: fan(FLOW_LINES.exitAngles),
        pinch: { x: pick(3, 0.56, 0.76), y: pick(4, 0.36, 0.58) },
        lineCount: Math.round(pick(5, 22, 34)),
        bunch: pick(6, 14, 32),
        curveAmount: pick(7, 10, 34),
        waveAmp: pick(8, 22, 42),
        waveFreq: pick(9, 1.8, 3.2),
        waveSpeed: pick(10, 0.35, 0.8),
        breathPeriod: pick(11, 7, 12),
        highlightPeriod: pick(12, 4, 6.5),
        palette: [...FLOW_LINES.palette.slice(lead), ...FLOW_LINES.palette.slice(0, lead)],
    };
}
// Two-digit number ("01").
const pad = (n) => String(n).padStart(2, '0');
// Escapes text for use in HTML.
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
// Stroke arrow for the prev/next buttons and each card's corner link.
const arrow = (dir) => `
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="${dir === 'right' ? 'M5 12h14M13 6l6 6-6 6' : 'M19 12H5M11 6l-6 6 6 6'}" />
  </svg>`;
const closeIcon = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>`;
// Converts a CSS length read from a custom property ("7rem", "44px") to px.
const toPx = (value) => {
    const v = value.trim();
    if (v.endsWith('rem'))
        return parseFloat(v) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    return parseFloat(v) || 0;
};
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
// iOS-style rubber band: the further past the end, the less it gives.
const rubber = (past, size) => Math.sign(past) * (1 - 1 / ((Math.abs(past) * 0.55) / size + 1)) * size;
// Advances one spring by dt seconds; returns whether it's still moving.
// Small fixed sub-steps keep the integration stable at any frame rate.
function advance(s, dt) {
    if (s.x === s.target && s.v === 0)
        return false;
    const omega = (2 * Math.PI) / s.how.response;
    const stiffness = omega * omega;
    const friction = 2 * s.how.damping * omega;
    for (let left = dt; left > 0; left -= 1 / 240) {
        const h = Math.min(left, 1 / 240);
        s.v += (-stiffness * (s.x - s.target) - friction * s.v) * h;
        s.x += s.v * h;
    }
    if (Math.abs(s.x - s.target) < 0.1 && Math.abs(s.v) < 1) {
        s.x = s.target;
        s.v = 0;
        return false;
    }
    return true;
}
let instances = 0;
function mountExpandingCardRow(container, options) {
    const { items, heading, showCount = true, label = 'Services', themes = DEFAULT_THEMES, fillScreen = true, wheelScroll = true, wheelSensitivity = 2.5, movingLines = true, } = options;
    const count = items.length;
    const uid = `ecr${++instances}`;
    // ── Markup ────────────────────────────────────────────────────────────
    // One card: a clipped, rounded layer (art, the pill's trigger with its
    // vertical title, the open card's body) plus the corner link, which sits
    // outside the clip (see .ecr-socket in the CSS). Only one half is live at
    // a time — the other is inert, so it's out of the tab order and the
    // accessibility tree.
    const card = (item, i) => {
        const isOpen = i === 0;
        const title = esc(item.title);
        return `
        <li class="ecr-card ecr-theme-${themes[i % themes.length]}${isOpen ? ' is-active' : ''}">
          <div class="ecr-clip">
            <div class="ecr-art" aria-hidden="true"></div>
            <button type="button" class="ecr-trigger" aria-expanded="${isOpen}" aria-controls="${uid}-body-${i}"${isOpen ? ' inert' : ''}>
              <span class="ecr-label-n" aria-hidden="true">${pad(i + 1)}</span>
              <span class="ecr-label-t">${title}</span>
            </button>
            <div class="ecr-body" id="${uid}-body-${i}" role="region" aria-labelledby="${uid}-title-${i}"${isOpen ? '' : ' inert'}>
              <div>
                <span class="ecr-body-n" aria-hidden="true">${pad(i + 1)}</span>
                <h3 class="ecr-body-title" id="${uid}-title-${i}" tabindex="-1">${title}</h3>
                <p class="ecr-body-copy">${esc(item.copy)}</p>
              </div>
              ${item.points?.length ? `<ul class="ecr-points">${item.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
              <button type="button" class="ecr-close" aria-label="Close ${title}">${closeIcon}</button>
            </div>
          </div>
          ${item.href
            ? `<div class="ecr-socket"${isOpen ? '' : ' inert'}><a class="ecr-go" href="${esc(item.href)}" aria-label="View ${title}">${arrow('right')}</a></div>`
            : ''}
        </li>`;
    };
    container.classList.add('ecr');
    container.classList.toggle('ecr-fill', fillScreen);
    container.classList.toggle('ecr-has-head', !!heading);
    container.innerHTML = `
    <div class="ecr-inner">
      ${heading
        ? `<div class="ecr-head"><h2 class="ecr-heading">${heading}</h2>${showCount ? `<span class="ecr-count">(${pad(count)})</span>` : ''}</div>`
        : ''}
      <div class="ecr-row">
        <div class="ecr-viewport">
          <ol class="ecr-track" id="${uid}-track" aria-label="${esc(label)}">${items.map(card).join('')}
          </ol>
        </div>
        <div class="ecr-scroll" role="scrollbar" aria-controls="${uid}-track" aria-orientation="horizontal"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="${esc(label)} row">
          <span class="ecr-scroll-track"></span>
          <span class="ecr-scroll-thumb"></span>
        </div>
        <div class="ecr-controls">
          <span class="ecr-counter">01 / ${pad(count)}</span>
          <div class="ecr-dots">${items
        .map((it, i) => `<button type="button" class="ecr-dot" tabindex="-1" aria-label="${esc(it.title)}" aria-current="${i === 0}"></button>`)
        .join('')}</div>
          <div class="ecr-arrows">
            <button type="button" class="ecr-arrow ecr-prev" aria-label="Previous">${arrow('left')}</button>
            <button type="button" class="ecr-arrow ecr-next" aria-label="Next">${arrow('right')}</button>
          </div>
        </div>
        <p class="ecr-sr-only" aria-live="polite"></p>
      </div>
    </div>`;
    const q = (sel) => container.querySelector(sel);
    const rowEl = q('.ecr-row');
    const viewport = q('.ecr-viewport');
    const track = q('.ecr-track');
    const bar = q('.ecr-scroll');
    const thumb = q('.ecr-scroll-thumb');
    const counter = q('.ecr-counter');
    const live = q('.ecr-sr-only');
    const cards = Array.from(track.querySelectorAll('.ecr-card'));
    const dots = Array.from(container.querySelectorAll('.ecr-dot'));
    const triggerOf = (i) => cards[i].querySelector('.ecr-trigger');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Everything to undo in destroy().
    const listeners = new AbortController();
    const on = { signal: listeners.signal };
    const timers = new Set();
    let active = 0; // the current card (open, or last open while closed)
    let open = true; // false = every card is a pill
    // ── Geometry ──────────────────────────────────────────────────────────
    // The row's final layout, worked out from the same custom properties the
    // CSS sizes it with.
    function metrics() {
        const css = getComputedStyle(viewport);
        const width = viewport.clientWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const pill = toPx(css.getPropertyValue('--ecr-wc'));
        const pills = parseInt(css.getPropertyValue('--ecr-p'), 10) || 1;
        const openWidth = width - pills * (pill + gap);
        return { width, gap, pill, pills, openWidth, step: pill + gap };
    }
    // How far the row can slide: x runs from 0 (first card flush left) down
    // to minX (last card flush right).
    function minX(m = metrics()) {
        const content = open ? (count - 1) * m.step + m.openWidth : count * m.pill + (count - 1) * m.gap;
        return Math.min(0, m.width - content);
    }
    // Where the row sits with card `index` open: one pill of context before
    // it (when more than one pill fits beside it), within the row's ends.
    function slotFor(index, m = metrics()) {
        const leadIn = m.pills > 1 ? 1 : 0;
        return clamp(-(index - leadIn) * m.step, minX(m), 0);
    }
    // ── Motion engine ─────────────────────────────────────────────────────
    // Everything that moves is a spring advanced in one loop on one clock:
    // the row's position (`row`, its translateX) and every card's width. So
    // when a card opens, its growth, the closing card's shrink and the row's
    // glide share a start frame and a curve, and stay in step even when
    // interrupted. Wheel input moves the row's target; drags move the row
    // directly.
    const row = { x: 0, v: 0, target: 0, how: LAYOUT_SPRING };
    const widths = cards.map(() => ({ x: 0, v: 0, target: 0, how: LAYOUT_SPRING }));
    let frame = 0;
    let lastTime = 0;
    // Sets every card's target width for the current open/closed state.
    function aimWidths(m = metrics()) {
        widths.forEach((w, i) => {
            w.target = open && i === active ? m.openWidth : m.pill;
        });
    }
    function renderRow() {
        track.style.transform = `translate3d(${row.x}px, 0, 0)`;
        renderBar();
    }
    function tick(now) {
        // The first frame after starting moves nothing (dt 0), and everything
        // that starts together is advanced together from then on.
        const dt = lastTime ? Math.min(0.064, (now - lastTime) / 1000) : 0;
        lastTime = now;
        let moving = advance(row, dt);
        widths.forEach((w, i) => {
            const before = w.x;
            if (advance(w, dt))
                moving = true;
            if (w.x !== before)
                cards[i].style.width = `${w.x}px`;
        });
        renderRow();
        frame = moving ? requestAnimationFrame(tick) : 0;
    }
    function kick() {
        if (frame)
            return;
        lastTime = 0;
        frame = requestAnimationFrame(tick);
    }
    // Jumps everything to its target with no motion (first paint, resizing,
    // reduced motion).
    function snap() {
        cancelAnimationFrame(frame);
        frame = 0;
        row.x = row.target;
        row.v = 0;
        widths.forEach((w, i) => {
            w.x = w.target;
            w.v = 0;
            cards[i].style.width = `${w.x}px`;
        });
        renderRow();
    }
    function moveRow(next, how) {
        row.target = next;
        row.how = how;
        if (reduceMotion)
            snap();
        else
            kick();
    }
    // Slides the row just far enough to show card `i` (keyboard focus).
    function ensureVisible(i) {
        const m = metrics();
        const left = i * m.step + (open && i > active ? m.openWidth - m.pill : 0);
        const right = left + (open && i === active ? m.openWidth : m.pill);
        let next = row.target;
        if (left + next < 0)
            next = -left;
        else if (right + next > m.width)
            next = m.width - right;
        moveRow(clamp(next, minX(m), 0), LAYOUT_SPRING);
    }
    // ── Scrollbar ─────────────────────────────────────────────────────────
    // The thumb's length is the share of the row on screen and its position
    // how far along the row is, both read from the springs every frame (so it
    // follows opening and closing too); while the row is stretched past an
    // end the thumb squashes, as iOS's does.
    let view = 0; // the viewport's width
    let gapPx = 0; // the gap between cards
    let barLength = 0; // the scrollbar's width
    let shownValue = -1;
    // How far the row can scroll right now, and the thumb's unsquashed length.
    function barGeometry() {
        const content = widths.reduce((sum, w) => sum + w.x, 0) + (count - 1) * gapPx;
        const range = Math.max(0, content - view);
        const length = Math.max(48, (barLength * view) / Math.max(content, view, 1));
        return { range, length };
    }
    function renderBar() {
        const { range, length } = barGeometry();
        const past = row.x > 0 ? row.x : Math.max(0, -range - row.x);
        const width = Math.max(24, length - (past * length) / Math.max(view, 1));
        const progress = range ? clamp(-row.x / range, 0, 1) : 0;
        thumb.style.width = `${width}px`;
        thumb.style.transform = `translateX(${progress * (barLength - width)}px)`;
        const value = Math.round(progress * 100);
        if (value !== shownValue) {
            shownValue = value;
            bar.setAttribute('aria-valuenow', String(value));
        }
    }
    // ── Moving lines ──────────────────────────────────────────────────────
    // One canvas, moved into whichever card is open and switched to that
    // card's version of the lines, drawing only while a card is open and the
    // row is on screen.
    let lines = null;
    let inView = false;
    const flow = document.createElement('div');
    if (movingLines && count) {
        flow.className = 'ecr-flow';
        flow.setAttribute('aria-hidden', 'true');
        flow.append(document.createElement('canvas'));
        cards[0].querySelector('.ecr-art').after(flow);
        lines = createFlowingLines(flow.firstElementChild, linesFor(0));
    }
    function updateLines() {
        if (open && inView)
            lines?.start();
        else
            lines?.stop();
    }
    // Moves the lines into card `index`, which is about to open, in its own
    // version. The card arrives closed (so the lines are faded out); reading
    // a layout value commits that, so the opening fades them in.
    function showLinesIn(index) {
        if (!lines)
            return;
        cards[index].querySelector('.ecr-art').after(flow);
        lines.configure(linesFor(index));
        void flow.offsetWidth;
    }
    const viewObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        updateLines();
    });
    viewObserver.observe(viewport);
    // ── Open / close ──────────────────────────────────────────────────────
    // Swaps which half of a card (pill trigger vs. body and corner link) is
    // inert.
    function setOpen(c, isOpen) {
        c.classList.toggle('is-active', isOpen);
        const trigger = c.querySelector('.ecr-trigger');
        trigger.toggleAttribute('inert', isOpen);
        trigger.setAttribute('aria-expanded', String(isOpen));
        c.querySelector('.ecr-body').toggleAttribute('inert', !isOpen);
        c.querySelector('.ecr-socket')?.toggleAttribute('inert', !isOpen);
    }
    // Gives a resizing card's art its own compositor layer for the length of
    // the spring, so it's moved rather than repainted every frame.
    const settleTimers = new WeakMap();
    function markAnimating(c) {
        c.classList.add('is-animating');
        clearTimeout(settleTimers.get(c));
        const t = window.setTimeout(() => {
            c.classList.remove('is-animating');
            timers.delete(t);
        }, 900);
        timers.add(t);
        settleTimers.set(c, t);
    }
    // Opens card `index` (wrapping at either end), from either state.
    function activate(index) {
        if (!count)
            return;
        const next = (index + count) % count;
        if (open && next === active)
            return;
        const focusWasInRow = track.contains(document.activeElement);
        if (open) {
            markAnimating(cards[active]);
            setOpen(cards[active], false);
        }
        showLinesIn(next);
        markAnimating(cards[next]);
        setOpen(cards[next], true);
        active = next;
        open = true;
        const m = metrics();
        aimWidths(m);
        moveRow(slotFor(next, m), LAYOUT_SPRING);
        updateLines();
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === next)));
        counter.textContent = `${pad(next + 1)} / ${pad(count)}`;
        live.textContent = `${items[next].title}, ${next + 1} of ${count}`;
        // Focus inside the row was on a card that just changed state — move it
        // to the open card's heading rather than leaving it on an inert element.
        if (focusWasInRow)
            cards[next].querySelector('.ecr-body-title').focus({ preventScroll: true });
    }
    // Closes the open card back into a pill. It shrinks toward its own left
    // edge (the row only slides if that would leave a gap at the end).
    function close() {
        if (!open || !count)
            return;
        const focusWasInRow = track.contains(document.activeElement);
        markAnimating(cards[active]);
        setOpen(cards[active], false);
        open = false;
        const m = metrics();
        aimWidths(m);
        moveRow(clamp(row.target, minX(m), 0), LAYOUT_SPRING);
        updateLines();
        live.textContent = `All ${count} ${label.toLowerCase()}`;
        // The close button (or heading) that had focus is now inert — hand
        // focus to the card's pill so Enter reopens it.
        if (focusWasInRow)
            triggerOf(active).focus({ preventScroll: true });
    }
    // ── Clicks and keys ───────────────────────────────────────────────────
    cards.forEach((c, i) => {
        triggerOf(i).addEventListener('click', () => activate(i), on);
        // Tabbing to a pill that's off-screen slides it into view (the row is
        // clipped, not natively scrollable, so it wouldn't otherwise appear).
        triggerOf(i).addEventListener('focus', () => ensureVisible(i), on);
        // Clicking anywhere on the open card closes it — unless the click was
        // the end of selecting some of its text.
        c.querySelector('.ecr-body').addEventListener('click', () => {
            if (window.getSelection()?.toString())
                return;
            close();
        }, on);
    });
    dots.forEach((dot, i) => dot.addEventListener('click', () => activate(i), on));
    q('.ecr-prev').addEventListener('click', () => activate(active - 1), on);
    q('.ecr-next').addEventListener('click', () => activate(active + 1), on);
    // Arrow keys step, Home/End jump to the ends, Escape closes the open
    // card — anywhere inside the row or its controls.
    rowEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight')
            activate(active + 1);
        else if (e.key === 'ArrowLeft')
            activate(active - 1);
        else if (e.key === 'Home')
            activate(0);
        else if (e.key === 'End')
            activate(count - 1);
        else if (e.key === 'Escape' && open)
            close();
        else
            return;
        e.preventDefault();
    }, on);
    let owner = 'page';
    let lastWheelTime = -Infinity;
    let trickle = false; // the last event barely moved: a swipe's momentum dying out
    let wheelRaw = 0; // where the wheel is steering the row, before the rubber band
    let lastSteerTime = 0;
    let wheelTimer = 0;
    // Smoothly scrolls the page until the section fills the screen.
    function glideIn(top) {
        if (Math.abs(top) < 1)
            return;
        window.scrollTo({ top: window.scrollY + top, behavior: reduceMotion ? 'instant' : 'smooth' });
    }
    // Who handles the gesture that `e` starts.
    function ownerFor(e) {
        if (e.ctrlKey || !count)
            return 'page';
        const over = container.contains(e.target);
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY))
            return over ? 'row' : 'page';
        if (!wheelScroll)
            return 'page';
        const down = e.deltaY > 0;
        const min = minX();
        const from = clamp(row.target, min, 0);
        const rowCanMove = down ? from > min + 0.5 : from < -0.5;
        const screen = window.innerHeight;
        if (!fillScreen) {
            // No full-screen stop: the row takes a scroll over the section while
            // it's wholly on screen and has room to move that way.
            const r = viewport.getBoundingClientRect();
            return over && rowCanMove && r.top >= 0 && r.bottom <= screen ? 'row' : 'page';
        }
        const { top, bottom } = container.getBoundingClientRect();
        // Too little of the section on screen to pull it in.
        if (top > screen * 0.8 || bottom < screen * 0.2)
            return 'page';
        if (Math.abs(top) < screen * 0.15 && rowCanMove) {
            glideIn(top); // tidies the section into place while the row moves
            return 'row';
        }
        if (down ? top > 1 : top < -1) {
            glideIn(top);
            return 'glide';
        }
        return 'page';
    }
    // Moves the row with one wheel event of a gesture it owns. In range the
    // row follows the wheel; past an end it stretches with diminishing
    // returns, and the stretch keeps easing off between events, so a
    // trackpad's fading momentum lets it settle back rather than holding it
    // out. Once the wheel stops, a stretched row springs back.
    function steer(e) {
        const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewport.clientWidth : 1;
        const delta = -(horizontal ? e.deltaX : e.deltaY) * unit * wheelSensitivity;
        const min = minX();
        const end = clamp(wheelRaw, min, 0);
        wheelRaw = end + (wheelRaw - end) * Math.exp(-(e.timeStamp - lastSteerTime) / STRETCH_RELAX);
        lastSteerTime = e.timeStamp;
        wheelRaw = clamp(wheelRaw + delta, min - MAX_OVERSCROLL, MAX_OVERSCROLL);
        const inRange = clamp(wheelRaw, min, 0);
        const past = wheelRaw - inRange;
        moveRow(past ? inRange + rubber(past, viewport.clientWidth) : wheelRaw, SCROLL_SPRING);
        clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
            const lowest = minX();
            wheelRaw = clamp(wheelRaw, lowest, 0);
            if (row.target > 0 || row.target < lowest)
                moveRow(clamp(row.target, lowest, 0), SCROLL_SPRING);
        }, 140);
    }
    // Listens page-wide: a gesture that starts anywhere can be the one that
    // brings the section in.
    window.addEventListener('wheel', (e) => {
        const size = Math.max(Math.abs(e.deltaX), Math.abs(e.deltaY));
        // A new gesture: the first scroll after a pause, or a fresh push after
        // a trackpad's momentum had died down to a trickle.
        const fresh = e.timeStamp - lastWheelTime > GESTURE_GAP || (trickle && size >= 6);
        trickle = size <= 2 || (trickle && !fresh);
        lastWheelTime = e.timeStamp;
        if (fresh) {
            // An event that can't be cancelled is already the page's.
            owner = e.cancelable ? ownerFor(e) : 'page';
            wheelRaw = clamp(row.target, minX(), 0);
            lastSteerTime = e.timeStamp;
        }
        if (owner === 'page')
            return;
        if (e.cancelable)
            e.preventDefault();
        if (owner === 'row')
            steer(e);
    }, { passive: false, signal: listeners.signal });
    // ── Touch drag ────────────────────────────────────────────────────────
    // A horizontal drag moves the row 1:1 with the finger (rubber-banding
    // past the ends); letting go flings it on with the finger's speed and the
    // spring settles it, bouncing if it hits an end. Vertical drags still
    // scroll the page, since the viewport has touch-action: pan-y.
    let drag = 'none';
    let dragStartX = 0;
    let dragStartY = 0;
    let dragFromX = 0;
    let dragged = false;
    let samples = [];
    viewport.addEventListener('pointerdown', (e) => {
        dragged = false;
        if (e.pointerType === 'mouse')
            return;
        drag = 'pending';
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        samples = [{ t: e.timeStamp, x: e.clientX }];
    }, on);
    viewport.addEventListener('pointermove', (e) => {
        if (drag === 'none')
            return;
        const dx = e.clientX - dragStartX;
        if (drag === 'pending') {
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - dragStartY))
                return;
            drag = 'active';
            dragged = true;
            dragFromX = row.x;
            viewport.setPointerCapture(e.pointerId);
        }
        const min = minX();
        const raw = dragFromX + dx;
        row.x = raw > 0 ? rubber(raw, viewport.clientWidth) : raw < min ? min + rubber(raw - min, viewport.clientWidth) : raw;
        row.target = row.x;
        row.v = 0;
        renderRow();
        samples.push({ t: e.timeStamp, x: e.clientX });
        while (samples.length > 2 && e.timeStamp - samples[0].t > 100)
            samples.shift();
    }, on);
    function endDrag() {
        if (drag !== 'active') {
            drag = 'none';
            return;
        }
        drag = 'none';
        const first = samples[0];
        const last = samples[samples.length - 1];
        const speed = last.t > first.t ? ((last.x - first.x) / (last.t - first.t)) * 1000 : 0;
        row.v = speed;
        moveRow(clamp(row.x + speed * 0.28, minX(), 0), SCROLL_SPRING);
    }
    viewport.addEventListener('pointerup', endDrag, on);
    viewport.addEventListener('pointercancel', endDrag, on);
    // Don't let the end of a drag also count as a tap on the card under it.
    viewport.addEventListener('click', (e) => {
        if (!dragged)
            return;
        dragged = false;
        e.preventDefault();
        e.stopPropagation();
    }, { capture: true, signal: listeners.signal });
    // ── Scrollbar dragging ────────────────────────────────────────────────
    // The whole strip is the hit area. Pressing the thumb grabs it; pressing
    // the track jumps the row so the thumb centres there, and holds on for a
    // drag from that point. While dragging, the row follows the thumb 1:1
    // (the thumb's travel spans the row's whole range).
    let grab = null;
    bar.addEventListener('pointerdown', (e) => {
        if (e.button !== 0)
            return;
        const { range, length } = barGeometry();
        if (!range)
            return;
        e.preventDefault();
        let progress = clamp(-row.x / range, 0, 1);
        if (e.target !== thumb) {
            const left = e.clientX - bar.getBoundingClientRect().left - length / 2;
            progress = clamp(left / (barLength - length), 0, 1);
            moveRow(-progress * range, LAYOUT_SPRING);
        }
        grab = { x: e.clientX, progress, moved: false };
        bar.setPointerCapture(e.pointerId);
        bar.classList.add('is-grabbed');
    }, on);
    bar.addEventListener('pointermove', (e) => {
        if (!grab)
            return;
        const dx = e.clientX - grab.x;
        // A press that hasn't really moved yet leaves a track jump to animate.
        if (!grab.moved && Math.abs(dx) < 3)
            return;
        grab.moved = true;
        const { range, length } = barGeometry();
        const progress = clamp(grab.progress + dx / Math.max(barLength - length, 1), 0, 1);
        row.x = row.target = -progress * range;
        row.v = 0;
        renderRow();
    }, on);
    function letGo() {
        grab = null;
        bar.classList.remove('is-grabbed');
    }
    bar.addEventListener('pointerup', letGo, on);
    bar.addEventListener('pointercancel', letGo, on);
    // ── First layout + resize ─────────────────────────────────────────────
    // Every width depends on the row's width, so on a resize (and at the
    // start) everything jumps straight to its place for the new size.
    const sizeObserver = new ResizeObserver(() => {
        const m = metrics();
        view = m.width;
        gapPx = m.gap;
        barLength = bar.clientWidth;
        aimWidths(m);
        row.target = open ? slotFor(active, m) : clamp(row.target, minX(m), 0);
        snap();
    });
    sizeObserver.observe(viewport);
    return {
        open: activate,
        close,
        destroy() {
            listeners.abort();
            sizeObserver.disconnect();
            viewObserver.disconnect();
            cancelAnimationFrame(frame);
            clearTimeout(wheelTimer);
            timers.forEach((t) => clearTimeout(t));
            lines?.destroy();
            container.classList.remove('ecr', 'ecr-fill', 'ecr-has-head');
            container.innerHTML = '';
        },
    };
}
