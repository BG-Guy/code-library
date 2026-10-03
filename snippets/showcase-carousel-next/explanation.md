The React/Next.js version of the phone-mockup step showcase, swapping the vanilla version's manual dual-layer crossfade for Framer Motion's `AnimatePresence`. Pass a `steps` array of `{ badge, heading, desc, color, bg, content }` — `content` is any React node, and the exported `PhoneMockup` component is just one way to wrap it in a phone bezel; pass a plain `<div>` instead for a non-phone visual.

Every crossfade is keyed on `index`, so `AnimatePresence` handles animating the outgoing element out and the incoming one in whenever the key changes:

1. The **background** is a single `motion.div` re-keyed on `step.bg`, so Framer Motion fades between gradients the same way the vanilla version's two stacked layers do, without needing to manage two elements by hand.
2. The **heading and description** are wrapped together and keyed on `index`, sliding up when moving forward and down when moving backward — the direction comes from a `dir` flag `goTo()` sets based on whether the new index is greater or less than the current one.
3. The **visual** column crossfades `step.content` the same way, just with a plain opacity fade instead of a directional slide.

`goTo(i)` guards against re-entering the current index or stepping out of bounds, and the prev/next buttons disable themselves at either end exactly like the vanilla version.
