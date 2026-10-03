function initFlowingLines(canvas, overrides) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const CONFIG = Object.assign({
    lineCount: 30,
    pinch: { x: 0.66, y: 0.46 },       // fraction of canvas size
    entryAngles: [208, 249],           // degrees, where lines enter from (down-left)
    exitAngles: [8, 58],               // degrees, where lines exit toward (up-right)
    bunch: 22,                         // px perpendicular spread at the pinch, at rest
    curveAmount: 22,                   // px each control point is nudged sideways, for one gentle overall bow
    breathAmp: 14,                     // px the pinch drifts by
    breathPeriod: 9,                   // seconds per line's own breathing cycle (base)
    waveSamples: 72,                   // points sampled along each line to draw its ripple
    waveAmp: 34,                       // px, ripple size (shared by every line)
    waveFreq: 2.6,                     // cycles along the line's length (shared by every line)
    waveSpeed: 0.55,                   // rad/sec the ripple's phase advances (shared by every line)
    travelMin: 1,                      // every line samples the same oscillator from a
    travelMax: 10,                     // different spot in this range, travelStep apart —
    travelStep: 0.3,                   // that's the only thing that differs between lines
    drawWidth: 0.9,
    glowWidth: 2.2,
    highlightCount: 3,                 // lines that carry a travelling band of light
    highlightWidth: [60, 100],         // px of a line's length one band covers
    highlightPeriod: 5,                // seconds for a band to cross one whole line
    highlightOffsets: [0, 0.37, 0.68], // fraction of that period each band starts into,
                                       // so the bands enter and leave at different moments
    highlightGlow: 8,                  // px, the band's soft halo
    highlightCore: 1.8,                // px, the band's bright center
    highlightColor: [246, 173, 20],    // gold — deliberately outside the palette, so the
                                       // light reads as its own thing passing through
    accentEvery: 21,                   // 1 line in this many gets recolored as a spark
    palette: [
      [134, 224, 96],   // yellow-green
      [74, 222, 128],   // green
      [45, 212, 191],   // teal
      [34, 211, 238],   // cyan
      [59, 130, 246],   // blue
    ],
    accentColor: [217, 130, 245],       // magenta spark
  }, overrides);

  function lerp(a, b, u) { return a + (b - a) * u; }
  function degToRad(d) { return (d / 180) * Math.PI; }

  function paletteColor(u) {
    u = Math.max(0, Math.min(1, u));
    const palette = CONFIG.palette;
    const scaled = u * (palette.length - 1);
    const i0 = Math.floor(scaled);
    const i1 = Math.min(palette.length - 1, i0 + 1);
    const f = scaled - i0;
    const a = palette[i0], b = palette[i1];
    return [
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f,
    ];
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
        fanPos: fanPos,
        entryAngle: degToRad(lerp(CONFIG.entryAngles[0], CONFIG.entryAngles[1], fanPos)),
        exitAngle: degToRad(lerp(CONFIG.exitAngles[0], CONFIG.exitAngles[1], fanPos)),
        perp: (fanPos - 0.5) * CONFIG.bunch + (Math.random() - 0.5) * 4,
        widthJitter: 0.75 + Math.random() * 0.6,
        alpha: 0.45 + Math.random() * 0.4,
        wavePhase: wavePhase,
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
    const breathX = Math.sin(t * (Math.PI * 2 / CONFIG.breathPeriod));
    const breathY = Math.cos(t * (Math.PI * 2 / (CONFIG.breathPeriod * 1.3)));
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
    const offX = pinch.x, offY = pinch.y + line.perp;
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

  function colorGradientFor(ctx, line, p0, p3) {
    const baseColor = paletteColor(line.fanPos);
    const nextColor = paletteColor(Math.min(1, line.fanPos + 0.22));
    const grad = ctx.createLinearGradient(p0.x, p0.y, p3.x, p3.y);
    grad.addColorStop(0, "rgba(" + baseColor.join(",") + "," + line.alpha + ")");
    if (line.accent) grad.addColorStop(0.5, "rgba(" + CONFIG.accentColor.join(",") + "," + line.alpha + ")");
    grad.addColorStop(1, "rgba(" + nextColor.join(",") + "," + line.alpha + ")");
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

  function tracePoints(ctx, points) {
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
  }

  function pathLength(points) {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return total;
  }

  // Cuts out the stretch of an already-sampled path between two arc lengths,
  // interpolating at both ends — so a band stays the same number of px long
  // wherever it currently sits, even where the samples are unevenly spaced.
  function sliceByLength(points, from, to) {
    const slice = [];
    let walked = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (seg > 0 && walked + seg >= from && walked <= to) {
        const u0 = Math.max(0, (from - walked) / seg);
        const u1 = Math.min(1, (to - walked) / seg);
        if (!slice.length) slice.push({ x: lerp(a.x, b.x, u0), y: lerp(a.y, b.y, u0) });
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
    let walked = 0, start = -1, end = 0;
    for (let i = 0; i < points.length; i++) {
      if (i > 0) walked += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      const p = points[i];
      if (p.x >= -pad && p.x <= w + pad && p.y >= -pad && p.y <= h + pad) {
        if (start < 0) start = walked;
        end = walked;
      }
    }
    return start < 0 ? null : { start: start, end: end };
  }

  // One short band of light slides across the line's on-screen stretch, once
  // per highlightPeriod: the band is just a highlightWidth-long slice of the
  // very same wavy path, restroked brighter and thicker with its alpha falling
  // off to 0 at both ends so it reads as light rather than a solid dash.
  function drawHighlight(ctx, line, points, t, w, h) {
    const range = visibleRange(points, w, h);
    if (!range || range.end - range.start < 1) return;

    const span = line.highlight.width;
    const progress = (((t / CONFIG.highlightPeriod + line.highlight.offset) % 1) + 1) % 1;
    // Starts fully off one end and finishes fully off the other, so the band
    // slides in and out of frame instead of popping in mid-line.
    const head = range.start - span + progress * (range.end - range.start + span * 2);
    const from = Math.max(range.start, head), to = Math.min(range.end, head + span);
    if (to - from < 1) return;

    const slice = sliceByLength(points, from, to);
    if (slice.length < 2) return;

    const bandStart = slice[0], bandEnd = slice[slice.length - 1];
    const color = "rgba(" + CONFIG.highlightColor.join(",");
    const grad = ctx.createLinearGradient(bandStart.x, bandStart.y, bandEnd.x, bandEnd.y);
    grad.addColorStop(0, color + ",0)");
    grad.addColorStop(0.5, color + ",1)");
    grad.addColorStop(1, color + ",0)");

    ctx.beginPath();
    tracePoints(ctx, slice);
    ctx.strokeStyle = grad;
    ctx.lineCap = "round";

    ctx.globalAlpha = 0.3;
    ctx.lineWidth = CONFIG.highlightGlow;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.lineWidth = CONFIG.highlightCore;
    ctx.stroke();

    ctx.lineCap = "butt";
  }

  function drawLine(ctx, line, pinch, t, w, h) {
    const reach = Math.max(w, h) * 1.55;
    const bezier = baseBezierFor(line, pinch, reach);
    const points = samplePath(bezier, line.wavePhase, t);

    ctx.beginPath();
    tracePoints(ctx, points);
    ctx.strokeStyle = colorGradientFor(ctx, line, bezier.p0, bezier.p3);

    ctx.globalAlpha = 0.18;
    ctx.lineWidth = CONFIG.glowWidth * line.widthJitter;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.lineWidth = CONFIG.drawWidth * line.widthJitter;
    ctx.stroke();

    if (line.highlight) drawHighlight(ctx, line, points, t, w, h);
  }

  const lines = buildLines();

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }
  window.addEventListener("resize", resize);
  resize();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let animStart = null;
  let rafId = null;

  function draw(ts) {
    if (animStart === null) animStart = ts;
    const t = reduceMotion ? 0 : (ts - animStart) / 1000;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const pinch = pinchAt(t, w, h);
    for (let i = 0; i < lines.length; i++) drawLine(ctx, lines[i], pinch, t, w, h);

    if (!reduceMotion) rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);

  return {
    stop: function () {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    },
  };
}

// Usage — canvas must sit inside a positioned container with a real size,
// since the canvas resizes to match canvas.parentElement's box:
// <div style="position:relative;width:100%;height:340px;">
//   <canvas id="lines"></canvas>
// </div>
initFlowingLines(document.getElementById("lines"));
