This is the same reveal-footer trick as a single-file, shadcn/ui-style component: pass it your page content as `children` and your footer's own content as the `footer` prop, and it renders the shell, a sized spacer, and a fixed footer in the right order.

**How it works**

1. The footer is rendered with `ref={footerRef}` and Tailwind's `fixed inset-x-0 bottom-0`, so — exactly like the vanilla version — it's pinned to the bottom of the browser viewport from the moment it mounts, regardless of scroll position.
2. `footerHeight` is plain React state, not a ref mutation: a `useEffect` measures `footerRef.current.offsetHeight` on mount, then keeps it current via a `resize` listener and a `ResizeObserver`, both cleaned up on unmount.
3. That state renders as a plain `<div style={{ height: footerHeight }} />` placed between the shell and the footer — this is the spacer, sized declaratively through React's render cycle instead of being created and updated by hand like the vanilla version's `document.createElement`.
4. The shell itself only needs `relative z-[1] bg-inherit` — no margin math, because the spacer (not a margin) is what reserves the scroll room the fixed footer no longer occupies.

Drop `components/ui/reveal-footer.jsx` into a Next.js (or any React) project, wrap your page's main content and footer markup in it once near the root layout, and the reveal works with zero other configuration.
