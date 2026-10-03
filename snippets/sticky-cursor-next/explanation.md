This is the "real" version of the vanilla sticky-cursor component: instead of hand-rolling the follow-easing with a per-frame lerp, it uses Framer Motion's `useSpring` on motion values, and `animate()` for the one-off rotate/scale resets.

**How it works**

1. `targets` is a plain array of refs — `update()` checks each target's `getBoundingClientRect()` against the pointer on every move, exactly like the vanilla version's `hitTest`, so there's nothing framework-specific about which element is "sticky."
2. `mouse.x`/`mouse.y` are `useMotionValue`s; wrapping them in `useSpring` gives the cursor its follow-lag for free, with the spring's `damping`/`stiffness`/`mass` controlling exactly how loose or snappy it feels — no manual easing math needed. The size change is sprung the same way: the `animate` prop's own `transition` is set to `{ type: "spring", ... }` explicitly, so growing from a dot into the sticky blob overshoots slightly and settles instead of snapping straight to 60px.
3. `scale.x`/`scale.y` are set from `transform(abs, [0, range], [1, max])`, Framer Motion's clamped linear interpolation helper — the same mapping the vanilla version does by hand with `Math.min`.
4. The touch handle is wired up with a plain `useEffect` and native `addEventListener(..., { passive: false })` rather than React's `onTouchMove` prop — React marks touch listeners passive by default, which silently breaks `preventDefault()`, so the handle needs a real DOM listener to reliably stop the page from scrolling while it's being dragged.

Install `framer-motion` as the one dependency. Render `<StickyCursor targets={[...refs]} />` once, anywhere in the tree — it's fixed-positioned, so it doesn't need to live near the elements it sticks to.
