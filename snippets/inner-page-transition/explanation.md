Two CSS classes describe the two visual states this transition moves between, and a small JS function toggles them with the right timing — no animation library required.

**How it works**

1. `ensureStyles` injects one `<style>` tag with the CSS this transition needs, only once — the same trick a small vanilla-JS library would use to ship its own styles without a separate stylesheet.
2. Adding `is-leaving` to the content triggers its own CSS transition: it scales down slightly and moves up a bit, reading as the page being pushed back in space. Adding `is-covering` to the panel slides it from fully below the viewport (`translateY(100%)`) up to its resting position, covering everything.
3. Both transitions share the same `duration` and easing curve, so a plain `setTimeout(fn, duration)` is a reliable enough stand-in for "wait until both animations finish" without wiring up two separate `transitionend` listeners.
4. The moment that timeout fires, the panel is fully covering the screen — that's exactly when `swapContent()` runs and `is-leaving` is removed, so the *next* page is sitting there, already back at its resting scale and position, just hidden behind the panel.
5. Removing `is-covering` on the following frame — via `requestAnimationFrame`, so the browser gets a chance to paint the reset content first — starts the panel's exit transition, sliding it back down and revealing the new page underneath.

This is a reusable template for any "cover, swap, reveal" transition: two CSS classes for the visual states, and one small function that toggles them with the right timing in between.
