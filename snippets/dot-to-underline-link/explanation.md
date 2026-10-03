A tiny dot appears below the link, then stretches out into a flat underline bar — two distinct beats rather than one blended transition, which is what gives this effect its snap.

**How it works**

1. `ensureStyles` injects one `<style>` tag defining the `.du-dot` span's resting state — a tiny 6px circle centered beneath the link, already nudged down 6px and fully transparent (`opacity: 0`) — so the element has a sensible starting point before any animation has ever run on it.
2. `initDotUnderline` then appends one `.du-dot` span to the link and drives its geometry through the Web Animations API (`element.animate()`) rather than a CSS transition from that point on, because the effect genuinely has two sequential phases rather than several properties changing together.
3. `grow()` first rises the dot up from just beneath the link while fading it in (`translateY(6px) → translateY(0)` alongside `opacity 0 → 1`) and, only once that animation's `.finished` promise resolves, *then* stretches it from a small centered circle into a full-width, flat bar. That sequencing — rise-and-fade first, stretch second — is what gives the effect its two-beat feel instead of everything happening in one blur.
4. `shrink()` runs the same two phases in reverse: the bar contracts back down into a dot first, and only once *that* finishes does it sink back down and fade away — so hovering off always undoes the animation as a mirror image of hovering on.
5. Calling `.cancel()` on whatever animation is still running before starting a new one means rapidly hovering on and off doesn't queue up a stack of animations — each new `grow()`/`shrink()` call cleanly takes over from wherever the dot currently is, instead of waiting for a stale one to finish first.
6. Touch handling matches the same pattern used elsewhere in this library: the `pointerType` recorded on `pointerdown` decides whether a click activates immediately (mouse — real hover already showed the effect) or needs a first "priming" tap (touch) before a second tap lets the navigation through.

Because the whole thing is one small span and one initializer function, wiring it into a nav bar — with or without another hover effect layered on top — is a single `querySelectorAll` + `forEach` away.
