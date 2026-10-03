function initButterflySwarm(canvas, overrides) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const CONFIG = Object.assign({
    particleCount: 650,
    hold: 2.4,              // seconds each formation is held
    morph: 3.0,             // seconds each transition takes
    staggerSpread: 0.55,    // fraction of the morph spent staggering particle starts
    // Distance per second, as a fraction of formationRadius — NOT laps per second.
    // The butterfly curve is ~92 units long and the triangle spiral ~40, so a shared
    // laps/sec rate ran particles 2.3x faster on the butterfly than on the triangle.
    flowSpeed: 0.2,
    bowRange: [0.05, 0.13], // fraction of formationRadius, perpendicular bow at mid-flight
    wanderAmp: 0.035,       // fraction of formationRadius
    wanderFreq: 2.1,        // rad/sec, shared by every particle
    dotSize: 1.5,           // px — one size for all, so mirror twins match exactly
    // A single triangle outline is only ~1/20th the length of the butterfly curve, so
    // the same particle count crammed onto it sits ~2px apart and reads as a solid
    // line. The triangle is drawn as a spiral instead: triLaps passes shrinking to
    // triInner and back out again (so the path closes), giving ~8x more track.
    triLaps: 11,
    triInner: 0.4,
    // Butterfly silhouette: a radius profile swept monotonically around the centre.
    // bfHalfTurns must be ODD so the half-path ends on the mirror axis and closes.
    bfHalfTurns: 7,
    bfInner: 0.4,
    bfBase: 0.20,
    bfUpperAmp: 0.95, bfUpperPos: 0.70, bfUpperWidth: 0.32,
    bfLowerAmp: 0.52, bfLowerPos: -0.74, bfLowerWidth: 0.26,
    formationRadius: 0.36,  // fraction of min(w, h)
    palette: [
      [20, 14, 10],    // near-black, monarch wing edge
      [217, 92, 15],   // deep orange
      [245, 158, 11],  // amber
      [250, 204, 90],  // pale gold
    ],
  }, overrides);

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

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  // The butterfly is a radius profile swept monotonically around the centre, not
  // the Temple Fay curve. Fay's curve is prettier standing still, but it's built
  // from near-degenerate petals: travelling along it means running out to a petal
  // tip and back down almost the same line, which reads as particles jittering back
  // and forth however slowly they move. Here the angle only ever decreases, so a
  // particle orbits the centre in one direction, always.
  //
  // The radius is a function of sin(phi), never of phi directly — that forces
  // dR/dphi = 0 at phi = +/-90deg (on the mirror axis), so the half-path meets its
  // own mirror smoothly instead of forming a kink there.
  function wingRadius(s) {
    return CONFIG.bfBase
      + CONFIG.bfUpperAmp * Math.exp(-Math.pow((s - CONFIG.bfUpperPos) / CONFIG.bfUpperWidth, 2))
      + CONFIG.bfLowerAmp * Math.exp(-Math.pow((s - CONFIG.bfLowerPos) / CONFIG.bfLowerWidth, 2));
  }

  // Half the butterfly: sweeps the angle down from the top of the axis through
  // bfHalfTurns half-turns while the scale spirals inward, so nested wing outlines
  // give the shape its density.
  function butterflyHalf(w) {
    const phi = Math.PI / 2 - w * Math.PI * CONFIG.bfHalfTurns;
    const scale = CONFIG.bfInner + (1 - CONFIG.bfInner) * (1 - w);
    const r = wingRadius(Math.sin(phi)) * scale;
    return { x: Math.cos(phi) * r, y: Math.sin(phi) * r };
  }

  // The full path is that half followed by its own mirror, reversed — so
  // raw(1 - v) is EXACTLY mirror(raw(v)). That identity is what lets the particles
  // be sampled uniformly and still come out perfectly symmetric.
  function butterflyRaw(v) {
    if (v < 0.5) return butterflyHalf(2 * v);
    const p = butterflyHalf(2 - 2 * v);
    return { x: -p.x, y: p.y };
  }

  const TRIANGLE_VERTS = [{ x: 0, y: 1 }, { x: -0.866, y: -0.5 }, { x: 0.866, y: -0.5 }];
  function triangleRaw(v) {
    const phase = (v * CONFIG.triLaps) % 1;
    // Spirals inward over the first half and back out over the second, so v=1 lands
    // exactly where v=0 started and the path closes. Without this, particles would
    // pop from the inner end back to the outer start once per lap.
    const radius = CONFIG.triInner + (1 - CONFIG.triInner) * Math.abs(1 - 2 * v);
    const edge = Math.floor(phase * 3);
    const f = phase * 3 - edge;
    const a = TRIANGLE_VERTS[edge], b = TRIANGLE_VERTS[(edge + 1) % 3];
    return { x: (a.x + (b.x - a.x) * f) * radius, y: (a.y + (b.y - a.y) * f) * radius };
  }

  // Wraps a raw curve into a pointAt(u) that is centered, scaled to unit radius, and
  // parametrized by ARC LENGTH. Constant du/dt through a raw parameter is not constant
  // on-screen speed — both curves have stretches where a small step covers a lot of
  // ground and stretches where it covers almost none, so particles would visibly speed
  // up and slow down. The cumulative-distance table fixes that.
  function buildShape(rawPointAt, samples) {
    const raw = [];
    for (let i = 0; i <= samples; i++) raw.push(rawPointAt(i / samples));

    let cy = 0;
    for (let i = 0; i < samples; i++) cy += raw[i].y;
    cy /= samples;
    // cx is pinned to 0 rather than averaged: both curves are mirror-symmetric about
    // x=0 by construction, and a sampled average introduces a tiny offset that tilts
    // that symmetry off-axis.
    const cx = 0;

    let maxR = 0;
    for (let i = 0; i < samples; i++) maxR = Math.max(maxR, Math.hypot(raw[i].x - cx, raw[i].y - cy));

    const cumulative = [0];
    for (let i = 1; i <= samples; i++) {
      cumulative.push(cumulative[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y));
    }
    const total = cumulative[samples];
    const s = cumulative.map(function (value) { return value / total; }); // 0..1, monotonic

    function pointAt(u) {
      let lo = 0, hi = s.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (s[mid] <= u) lo = mid; else hi = mid;
      }
      const span = s[hi] - s[lo] || 1e-9;
      const v = (lo + (u - s[lo]) / span) / samples;
      const p = rawPointAt(v);
      return { x: (p.x - cx) / maxR, y: (p.y - cy) / maxR };
    }
    // Total path length in normalized units, so the flow can be advanced by
    // distance rather than by laps.
    pointAt.arcLength = total / maxR;
    return pointAt;
  }

  // 8000 rather than 4000: the arc-length table is piecewise-linear, so coarser
  // sampling lets particles in sharp-curvature stretches drift off the shared
  // speed. 8000 cuts that spread from ~1.16x to ~1.04x for a negligible load cost.
  const SHAPES = {
    butterfly: buildShape(butterflyRaw, 8000),
    triangle: buildShape(triangleRaw, 8000),
  };

  // Both shapes satisfy raw(1 - v) === mirror(raw(v)), and arc length is symmetric
  // too, so sampling uniformly at u = i/count makes particle i and particle
  // count-i exact mirrors. Symmetry comes free from the parametrisation. An earlier
  // version drew each particle twice at +/-x to force it, which worked but left the
  // mirrored copies landing at arbitrary spots along the path, where they clumped
  // against their neighbours and fused into visible doublets.
  const particles = (function () {
    const count = CONFIG.particleCount;
    const result = [];
    for (let i = 0; i < count; i++) {
      const u0 = i / count; // fixed identity: this particle's slot in the flow, and its stagger delay
      const bowSign = i % 2 === 0 ? 1 : -1;
      result.push({
        u0: u0,
        delay: u0 * CONFIG.staggerSpread,
        bowMag: (CONFIG.bowRange[0] + Math.random() * (CONFIG.bowRange[1] - CONFIG.bowRange[0])) * bowSign,
        wanderPhase: Math.random() * Math.PI * 2,
      });
    }
    return result;
  })();

  // One shared clock: which two formations are active, and how far the morph between
  // them has gotten. When from === to the swarm is holding, and every particle just
  // reads its own flowing point straight off that one shape.
  const PERIOD = 2 * (CONFIG.hold + CONFIG.morph);
  function transitionAt(t) {
    let tc = t % PERIOD;
    if (tc < CONFIG.hold) return { from: "butterfly", to: "butterfly", progress: 0 };
    tc -= CONFIG.hold;
    if (tc < CONFIG.morph) return { from: "butterfly", to: "triangle", progress: tc / CONFIG.morph };
    tc -= CONFIG.morph;
    if (tc < CONFIG.hold) return { from: "triangle", to: "triangle", progress: 0 };
    tc -= CONFIG.hold;
    return { from: "triangle", to: "butterfly", progress: tc / CONFIG.morph };
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }
  window.addEventListener("resize", resize);
  resize();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let start = null;
  let lastTs = null;
  let flowPhase = 0;
  let rafId = null;

  function draw(ts) {
    if (start === null) { start = ts; lastTs = ts; }
    const t = reduceMotion ? 0 : (ts - start) / 1000;
    // Clamped so a backgrounded tab doesn't jump the swarm forward on return.
    const dt = reduceMotion ? 0 : Math.min((ts - lastTs) / 1000, 0.1);
    lastTs = ts;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const formationRadius = Math.min(w, h) * CONFIG.formationRadius;
    const trans = transitionAt(t);

    // Advance the shared flow by distance. The rate depends on which shape is active,
    // so it must be integrated incrementally — recomputing from absolute t would
    // retroactively rescale all elapsed time and jump the swarm whenever the rate
    // changed. Blended on trans.progress (shared) rather than each particle's
    // staggered progress, so every particle advances at exactly one rate.
    const fromLen = SHAPES[trans.from].arcLength;
    const toLen = SHAPES[trans.to].arcLength;
    flowPhase += dt * CONFIG.flowSpeed / (fromLen + (toLen - fromLen) * trans.progress);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Advances every frame regardless of hold/morph, so particles are always
      // traveling along the active shape rather than parked on it.
      let flowU = (p.u0 + flowPhase) % 1;
      if (flowU < 0) flowU += 1;

      const fromPt = SHAPES[trans.from](flowU);
      const toPt = SHAPES[trans.to](flowU);

      const local = Math.max(0, Math.min(1, (trans.progress - p.delay) / (1 - CONFIG.staggerSpread)));
      const eased = easeInOutCubic(local);

      const bx = fromPt.x + (toPt.x - fromPt.x) * eased;
      const by = fromPt.y + (toPt.y - fromPt.y) * eased;

      const dirX = toPt.x - fromPt.x, dirY = toPt.y - fromPt.y;
      const dirLen = Math.hypot(dirX, dirY) || 1;

      // Both scaled by sin(PI * eased), so they vanish exactly at rest and peak
      // mid-flight — that's the bee-like buzz while the swarm is in transit.
      const envelope = Math.sin(Math.PI * eased);
      const bow = p.bowMag * envelope;
      const wander = CONFIG.wanderAmp * envelope;

      const nx = bx + (-dirY / dirLen) * bow + Math.sin(t * CONFIG.wanderFreq + p.wanderPhase) * wander;
      const ny = by + (dirX / dirLen) * bow + Math.cos(t * CONFIG.wanderFreq * 1.3 + p.wanderPhase) * wander;

      // Color from distance out from the center, not from particle index: distance is
      // mirror-invariant, so a particle and its twin always match. An index-based
      // sweep would color the two halves of a symmetric shape differently.
      const rgb = paletteColor(1 - Math.min(1, Math.hypot(nx, ny)));
      ctx.fillStyle = "rgba(" + rgb.join(",") + ",0.92)";

      ctx.beginPath();
      ctx.arc(cx + nx * formationRadius, cy + ny * formationRadius, CONFIG.dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

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

// Usage — the canvas sizes itself to its parent, so give the parent a real size:
// <div style="position:relative;width:100%;height:420px;background:#0a0d16;">
//   <canvas id="swarm"></canvas>
// </div>
initButterflySwarm(document.getElementById("swarm"));
