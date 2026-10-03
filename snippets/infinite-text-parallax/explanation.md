A "text parallax" section repeats one short phrase across a full-width row — enough times that it always fills edge-to-edge — then nudges that row sideways as the section scrolls through the viewport. Stack a few rows with alternating directions and you get the layered, cinematic drift you see on a lot of agency and portfolio homepages.

**How it works**

1. `progress()` reads the wrapping `.tp-viewport` element's position with `getBoundingClientRect()` on every scroll tick and maps it to a 0–1 value: `0` the moment the section's top edge touches the bottom of the screen, `1` the moment its bottom edge touches the top of the screen — the same "how far has this scrolled through the viewport" curve Framer Motion's `useScroll` gives you for free, built here from scratch.
2. Each `.tp-row` reads its own `data-direction` attribute and gets a `translateX` that starts on one side at progress `0` and ends on the opposite side at progress `1`. Rows marked `"left"` and `"right"` drift in opposite directions, which is what actually sells the parallax depth.
3. The scroll handler is wrapped in a `requestAnimationFrame` throttle (the `ticking` flag) so the relatively expensive `getBoundingClientRect()` call only runs once per frame no matter how many `scroll` events fire.
4. The factory returns `update()` and `destroy()` so you can force a recompute after a layout change, or tear down the listeners when the section leaves the page in a single-page app.

Adapted from Olivier Larose's Next.js + Framer Motion text-parallax demo, rebuilt here with zero dependencies so it runs in any plain HTML page. There's a matching React/Next.js component under the React / Next.js filter, built the "real" way with `useScroll`/`useTransform`, for anyone already in that ecosystem.
