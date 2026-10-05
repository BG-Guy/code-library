// Flowing lines: a bundle of thin, rippling lines that pinch together at one
// point and fan out at both ends, a few of them carrying a travelling band of
// light — redrawn on a <canvas> every frame. Used by expandingCardRow.ts for
// the open card's background; works on its own too. It hands back start /
// stop (pause it while nothing is showing it), configure (swap in a
// different look on the same canvas) and destroy. The canvas sizes itself
// to its parent, which must be positioned and have a real size. No
// dependencies.

type RGB = [number, number, number]

export interface FlowingLinesConfig {
  lineCount: number
  pinch: { x: number; y: number } // fraction of canvas size
  entryAngles: [number, number] // degrees, where lines enter from
  exitAngles: [number, number] // degrees, where lines exit toward
  bunch: number // px perpendicular spread at the pinch, at rest
  curveAmount: number // px each control point is nudged sideways, for one gentle overall bow
  breathAmp: number // px the pinch drifts by
  breathPeriod: number // seconds per line's own breathing cycle (base)
  waveSamples: number // points sampled along each line to draw its ripple
  waveAmp: number // px, ripple size (shared by every line)
  waveFreq: number // cycles along the line's length (shared by every line)
  waveSpeed: number // rad/sec the ripple's phase advances (shared by every line)
  travelMin: number // every line samples the same oscillator from a
  travelMax: number // different spot in this range, travelStep apart —
  travelStep: number // that's the only thing that differs between lines
  drawWidth: number
  glowWidth: number
  highlightCount: number // lines that carry a travelling band of light
  highlightWidth: [number, number] // px of a line's length one band covers
  highlightPeriod: number // seconds for a band to cross one whole line
  highlightOffsets: number[] // fraction of that period each band starts into
  highlightGlow: number // px, the band's soft halo
  highlightCore: number // px, the band's bright center
  highlightColor: RGB
  accentEvery: number // 1 line in this many gets recolored as a spark
  palette: RGB[]
  accentColor: RGB
}

// The snippet's own defaults, unchanged.
const DEFAULTS: FlowingLinesConfig = {
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
}

interface Point {
  x: number
  y: number
}

interface Bezier {
  p0: Point
  c1: Point
  c2: Point
  p3: Point
}

interface Line {
  fanPos: number
  entryAngle: number
  exitAngle: number
  perp: number
  widthJitter: number
  alpha: number
  wavePhase: number
  accent: boolean
  highlight?: { width: number; offset: number }
}

export interface FlowingLines {
  start(): void
  stop(): void
  // Replaces the settings (overrides on top of the defaults) and rebuilds
  // the lines; the animation carries on with the new look.
  configure(overrides: Partial<FlowingLinesConfig>): void
  // Stops for good and stops watching the canvas's size.
  destroy(): void
}

export function createFlowingLines(canvas: HTMLCanvasElement, overrides: Partial<FlowingLinesConfig> = {}): FlowingLines {
  const ctx = canvas.getContext('2d')
  const parent = canvas.parentElement
  if (!ctx || !parent) return { start() {}, stop() {}, configure() {}, destroy() {} }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const CONFIG: FlowingLinesConfig = { ...DEFAULTS, ...overrides }

  const lerp = (a: number, b: number, u: number) => a + (b - a) * u
  const degToRad = (d: number) => (d / 180) * Math.PI

  function paletteColor(u: number): RGB {
    u = Math.max(0, Math.min(1, u))
    const palette = CONFIG.palette
    const scaled = u * (palette.length - 1)
    const i0 = Math.floor(scaled)
    const i1 = Math.min(palette.length - 1, i0 + 1)
    const f = scaled - i0
    const a = palette[i0]
    const b = palette[i1]
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
  }

  // Point and tangent on a cubic bezier at parameter u, so a ripple can be
  // added perpendicular to the curve's own direction rather than a fixed axis.
  function bezierPoint(p0: Point, c1: Point, c2: Point, p3: Point, u: number): Point {
    const mu = 1 - u
    return {
      x: mu * mu * mu * p0.x + 3 * mu * mu * u * c1.x + 3 * mu * u * u * c2.x + u * u * u * p3.x,
      y: mu * mu * mu * p0.y + 3 * mu * mu * u * c1.y + 3 * mu * u * u * c2.y + u * u * u * p3.y,
    }
  }
  function bezierTangent(p0: Point, c1: Point, c2: Point, p3: Point, u: number): Point {
    const mu = 1 - u
    const x = 3 * mu * mu * (c1.x - p0.x) + 6 * mu * u * (c2.x - c1.x) + 3 * u * u * (p3.x - c2.x)
    const y = 3 * mu * mu * (c1.y - p0.y) + 6 * mu * u * (c2.y - c1.y) + 3 * u * u * (p3.y - c2.y)
    const len = Math.sqrt(x * x + y * y) || 1
    return { x: x / len, y: y / len }
  }

  function buildLines(): Line[] {
    const travelSpan = CONFIG.travelMax - CONFIG.travelMin
    const result: Line[] = []

    for (let i = 0; i < CONFIG.lineCount; i++) {
      const fanPos = CONFIG.lineCount === 1 ? 0.5 : i / (CONFIG.lineCount - 1)
      const travelStart = CONFIG.travelMin + i * CONFIG.travelStep
      // Where this line sits in the shared oscillator's cycle, expressed as
      // a phase: travelMin maps to phase 0, travelMax maps to a full 2*PI turn.
      const wavePhase = ((travelStart - CONFIG.travelMin) / travelSpan) * Math.PI * 2

      result.push({
        fanPos,
        entryAngle: degToRad(lerp(CONFIG.entryAngles[0], CONFIG.entryAngles[1], fanPos)),
        exitAngle: degToRad(lerp(CONFIG.exitAngles[0], CONFIG.exitAngles[1], fanPos)),
        perp: (fanPos - 0.5) * CONFIG.bunch + (Math.random() - 0.5) * 4,
        widthJitter: 0.75 + Math.random() * 0.6,
        alpha: 0.45 + Math.random() * 0.4,
        wavePhase,
        accent: i % CONFIG.accentEvery === Math.floor(CONFIG.accentEvery / 2),
      })
    }

    // A few lines, spread evenly across the fan, each carry one travelling
    // band of light. They all share highlightPeriod — only the offset differs,
    // so no two bands slide off the end at the same moment.
    for (let k = 0; k < CONFIG.highlightCount && k < result.length; k++) {
      const spread = CONFIG.highlightCount === 1 ? 0.5 : k / (CONFIG.highlightCount - 1)
      result[Math.round(((k + 0.5) / CONFIG.highlightCount) * (result.length - 1))].highlight = {
        width: lerp(CONFIG.highlightWidth[0], CONFIG.highlightWidth[1], spread),
        offset: CONFIG.highlightOffsets[k % CONFIG.highlightOffsets.length],
      }
    }
    return result
  }

  // One shared oscillator for every line, computed once per frame — so the
  // whole bundle's base shape moves at exactly one speed. Only wavePhase
  // (baked into each line above) should ever differ between lines.
  function pinchAt(t: number, w: number, h: number): Point {
    const breathX = Math.sin(t * ((Math.PI * 2) / CONFIG.breathPeriod))
    const breathY = Math.cos(t * ((Math.PI * 2) / (CONFIG.breathPeriod * 1.3)))
    return {
      x: w * CONFIG.pinch.x + breathX * CONFIG.breathAmp,
      y: h * CONFIG.pinch.y + breathY * CONFIG.breathAmp * 0.6,
    }
  }

  // The line's base bezier (before the ripple is added): both ends sit far
  // out along the line's entry/exit angle from the pinch, and both control
  // points are pulled back in close to the pinch, bowed sideways by a fixed
  // amount so the curve arcs smoothly instead of kinking at the pinch.
  function baseBezierFor(line: Line, pinch: Point, reach: number): Bezier {
    const offX = pinch.x
    const offY = pinch.y + line.perp
    const bow = CONFIG.curveAmount
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
    }
  }

  function colorGradientFor(c: CanvasRenderingContext2D, line: Line, p0: Point, p3: Point) {
    const baseColor = paletteColor(line.fanPos)
    const nextColor = paletteColor(Math.min(1, line.fanPos + 0.22))
    const grad = c.createLinearGradient(p0.x, p0.y, p3.x, p3.y)
    grad.addColorStop(0, `rgba(${baseColor.join(',')},${line.alpha})`)
    if (line.accent) grad.addColorStop(0.5, `rgba(${CONFIG.accentColor.join(',')},${line.alpha})`)
    grad.addColorStop(1, `rgba(${nextColor.join(',')},${line.alpha})`)
    return grad
  }

  // Samples the line's wavy path into a point list: walks the base bezier and
  // pushes each sample sideways by a sine riding along its own length.
  // Identical waveform for every line — the only difference between lines is
  // wavePhase, i.e. which spot in the shared travel range this one was
  // sampled from. Returning the points (rather than stroking straight into
  // the canvas path) is what lets the highlight reuse the exact same curve.
  function samplePath(bezier: Bezier, wavePhase: number, t: number): Point[] {
    const edge = 0.06 // fraction of the length, at each end, where the ripple fades to 0
    const points: Point[] = []
    for (let s = 0; s <= CONFIG.waveSamples; s++) {
      const u = s / CONFIG.waveSamples
      const point = bezierPoint(bezier.p0, bezier.c1, bezier.c2, bezier.p3, u)
      const tangent = bezierTangent(bezier.p0, bezier.c1, bezier.c2, bezier.p3, u)
      const normal = { x: -tangent.y, y: tangent.x }

      const taper = Math.max(0, Math.min(1, Math.min(u / edge, (1 - u) / edge)))
      const ripple = CONFIG.waveAmp * taper * Math.sin(CONFIG.waveFreq * u * Math.PI * 2 + wavePhase + t * CONFIG.waveSpeed)

      points.push({ x: point.x + normal.x * ripple, y: point.y + normal.y * ripple })
    }
    return points
  }

  function tracePoints(c: CanvasRenderingContext2D, points: Point[]) {
    for (let i = 0; i < points.length; i++) {
      if (i === 0) c.moveTo(points[i].x, points[i].y)
      else c.lineTo(points[i].x, points[i].y)
    }
  }

  // Cuts out the stretch of an already-sampled path between two arc lengths,
  // interpolating at both ends — so a band stays the same number of px long
  // wherever it currently sits, even where the samples are unevenly spaced.
  function sliceByLength(points: Point[], from: number, to: number): Point[] {
    const slice: Point[] = []
    let walked = 0
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]
      const b = points[i]
      const seg = Math.hypot(b.x - a.x, b.y - a.y)
      if (seg > 0 && walked + seg >= from && walked <= to) {
        const u0 = Math.max(0, (from - walked) / seg)
        const u1 = Math.min(1, (to - walked) / seg)
        if (!slice.length) slice.push({ x: lerp(a.x, b.x, u0), y: lerp(a.y, b.y, u0) })
        slice.push({ x: lerp(a.x, b.x, u1), y: lerp(a.y, b.y, u1) })
      }
      walked += seg
    }
    return slice
  }

  // The arc-length stretch of the path that actually falls inside the canvas.
  // Every line runs far past both edges of the frame, so a band that crossed
  // the whole path would spend most of its cycle off-screen — it travels this
  // stretch instead, entering at one frame edge and leaving at the other.
  function visibleRange(points: Point[], w: number, h: number) {
    const pad = 40
    let walked = 0
    let start = -1
    let end = 0
    for (let i = 0; i < points.length; i++) {
      if (i > 0) walked += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
      const p = points[i]
      if (p.x >= -pad && p.x <= w + pad && p.y >= -pad && p.y <= h + pad) {
        if (start < 0) start = walked
        end = walked
      }
    }
    return start < 0 ? null : { start, end }
  }

  // One short band of light slides across the line's on-screen stretch, once
  // per highlightPeriod: the band is just a highlightWidth-long slice of the
  // very same wavy path, restroked brighter and thicker with its alpha falling
  // off to 0 at both ends so it reads as light rather than a solid dash.
  function drawHighlight(c: CanvasRenderingContext2D, line: Line, points: Point[], t: number, w: number, h: number) {
    if (!line.highlight) return
    const range = visibleRange(points, w, h)
    if (!range || range.end - range.start < 1) return

    const span = line.highlight.width
    const progress = (((t / CONFIG.highlightPeriod + line.highlight.offset) % 1) + 1) % 1
    // Starts fully off one end and finishes fully off the other, so the band
    // slides in and out of frame instead of popping in mid-line.
    const head = range.start - span + progress * (range.end - range.start + span * 2)
    const from = Math.max(range.start, head)
    const to = Math.min(range.end, head + span)
    if (to - from < 1) return

    const slice = sliceByLength(points, from, to)
    if (slice.length < 2) return

    const bandStart = slice[0]
    const bandEnd = slice[slice.length - 1]
    const color = `rgba(${CONFIG.highlightColor.join(',')}`
    const grad = c.createLinearGradient(bandStart.x, bandStart.y, bandEnd.x, bandEnd.y)
    grad.addColorStop(0, `${color},0)`)
    grad.addColorStop(0.5, `${color},1)`)
    grad.addColorStop(1, `${color},0)`)

    c.beginPath()
    tracePoints(c, slice)
    c.strokeStyle = grad
    c.lineCap = 'round'

    c.globalAlpha = 0.3
    c.lineWidth = CONFIG.highlightGlow
    c.stroke()

    c.globalAlpha = 1
    c.lineWidth = CONFIG.highlightCore
    c.stroke()

    c.lineCap = 'butt'
  }

  function drawLine(c: CanvasRenderingContext2D, line: Line, pinch: Point, t: number, w: number, h: number) {
    const reach = Math.max(w, h) * 1.55
    const bezier = baseBezierFor(line, pinch, reach)
    const points = samplePath(bezier, line.wavePhase, t)

    c.beginPath()
    tracePoints(c, points)
    c.strokeStyle = colorGradientFor(c, line, bezier.p0, bezier.p3)

    c.globalAlpha = 0.18
    c.lineWidth = CONFIG.glowWidth * line.widthJitter
    c.stroke()

    c.globalAlpha = 1
    c.lineWidth = CONFIG.drawWidth * line.widthJitter
    c.stroke()

    if (line.highlight) drawHighlight(c, line, points, t, w, h)
  }

  let lines = buildLines()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let animStart: number | null = null
  let rafId = 0
  let running = false

  function draw(ts: number) {
    if (!running) return
    if (animStart === null) animStart = ts
    const t = reduceMotion ? 0 : (ts - animStart) / 1000

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    ctx!.clearRect(0, 0, w, h)

    const pinch = pinchAt(t, w, h)
    for (let i = 0; i < lines.length; i++) drawLine(ctx!, lines[i], pinch, t, w, h)

    // With reduced motion, one still frame and no loop.
    rafId = reduceMotion ? 0 : requestAnimationFrame(draw)
  }

  // Match the canvas's backing store to its parent's box. Resizing clears it,
  // so redraw straight away if it's meant to be showing.
  function resize() {
    const rect = parent!.getBoundingClientRect()
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    if (running) {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(draw)
    }
  }
  const sizer = new ResizeObserver(resize)
  sizer.observe(parent)
  resize()

  function stop() {
    running = false
    cancelAnimationFrame(rafId)
    rafId = 0
  }

  return {
    start() {
      if (running) return
      running = true
      rafId = requestAnimationFrame(draw)
    },
    stop,
    configure(next) {
      Object.assign(CONFIG, DEFAULTS, next)
      lines = buildLines()
      // Redraw straight away (with reduced motion there's no loop to pick
      // the change up).
      if (running) {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(draw)
      }
    },
    destroy() {
      stop()
      sizer.disconnect()
    },
  }
}
