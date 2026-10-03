This is the "real" version of the vanilla text-parallax component: instead of hand-rolling scroll progress with `getBoundingClientRect`, it uses Framer Motion's `useScroll`/`useTransform`, which do the same job with less code and a built-in spring-free interpolation curve.

**How it works**

1. `useScroll({ target: container, offset: ["start end", "end start"] })` tracks `container`'s position against the viewport and exposes a motion value, `scrollYProgress`, that runs from `0` (container's top just entering the bottom of the screen) to `1` (container's bottom just leaving the top).
2. Each row's `useTransform(progress, [0, 1], [speed * dir, -speed * dir])` maps that same `0–1` progress straight to a pixel offset — no manual scroll listeners, throttling, or cleanup to write, Framer Motion subscribes to the motion value directly.
3. `rows` is a plain array of `{ text, direction, image }` objects, so the component itself never hardcodes copy — add, remove, or reorder rows from wherever you render `<TextParallax />`.
4. Because it's a single default-exported component with no context or provider required, it drops straight into `components/ui/text-parallax.jsx` the way a shadcn/ui component would: copy the file, import it, done.

Install `framer-motion` as the one required dependency. Pair it with `lenis` (`npm i lenis`) for buttery-smooth inertial scrolling — that's what the original demo this is adapted from uses — but it's entirely optional, the parallax math works fine against native scroll.
