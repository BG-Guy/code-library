A single SVG `<path>` is redrawn on every animation frame to sweep a colored panel across the screen, covering the page just long enough to swap its content, then sweeping away again to reveal it.

**How it works**

1. `buildPanelPath` computes a fresh `d` string every frame — a rectangle down to `height - bulge`, capped with one quadratic curve (`Q`) that bulges back up to the same height on the far side. That single curve is the panel's "wave" edge; when `bulge` is `0` it collapses into a flat, straight line.
2. `animate("in")` and `animate("out")` both drive the same `requestAnimationFrame` loop, just moving `travel` — how far down the panel currently reaches — in opposite directions: `0 → height` to cover the screen, `height → 0` to reveal it again.
3. `bulge` is driven by `Math.sin(eased * Math.PI)`, which starts at `0`, peaks exactly at the animation's midpoint, and returns to `0` by the end — so the curve appears while the panel is mid-motion and disappears the instant it settles, on both the way in and the way out.
4. `easeInOutCubic` shapes the raw linear progress (`0` to `1`) into a slow-fast-slow curve before it's used for anything, which is what keeps the sweep from feeling mechanical.
5. `curveTransition(...).run(swapContent)` chains the two phases around a real DOM mutation: cover completely, run `swapContent()` while nothing is visible, then reveal — the viewer never actually sees the underlying content change.

Because it's just path math driven by `requestAnimationFrame`, this works in any vanilla project with zero dependencies, and doesn't rely on any framework's mount/unmount lifecycle to know when to animate.
