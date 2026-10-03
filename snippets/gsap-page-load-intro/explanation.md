A page-load intro where the hero's heading, subheading, and call-to-action button all slide up and fade in one after another — a couple of GSAP calls replace what would otherwise be a handful of separately-timed CSS animations.

**How it works**

1. `playIntro()` starts with `gsap.set(".reveal", { opacity: 0, y: 40 })`, which applies instantly with no animation — it snaps every element marked `.reveal` to hidden and nudged down 40px before anything else happens. Folding this into `playIntro` itself (rather than running it once, separately, at the top of the file) is what makes the function safe to call more than once: every call starts from the same known "hidden" state instead of assuming it's still there from a previous run.
2. The very next line, `gsap.to(".reveal", { y: 0, opacity: 1, ... })`, animates those *same* elements back to their natural resting state — because `.set()` just applied inline styles a moment earlier, GSAP already knows exactly what to animate back to without separate "from" values written out anywhere.
3. `stagger: 0.15` is what turns one `gsap.to()` call into a cascading sequence: instead of every `.reveal` element starting at the same instant, each one begins 0.15 seconds after the previous one in DOM order — a single line of config replaces writing four separate, hand-timed `delay` values.
4. `ease: "power3.out"` gives each element a fast start that gently decelerates into its resting position rather than moving at a constant speed — this easing curve is what makes the motion read as natural instead of mechanical.
5. Running `playIntro` on `DOMContentLoaded` — rather than as soon as the script tag runs — guarantees every `.reveal` element already exists in the DOM before the function ever tries to touch it.

Swap the plain `stagger: 0.15` for a config object like `{ each: 0.15, from: "center" }` if you need the cascade to start from the middle of the group instead of the top — GSAP's `stagger` option accepts either a number or an object for exactly this kind of finer control.
