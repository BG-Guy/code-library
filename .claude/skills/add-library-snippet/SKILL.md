---
name: add-library-snippet
description: >-
  How to turn a code source the user shares (a GitHub repo URL, a CodePen, a blog post
  with a demo, etc.) into a new entry in this repo's snippet library: a dependency-free
  vanilla JS version and a shadcn/ui-style React/Next.js component, both added under
  snippets/ and verified with a real headless-browser test before committing.
  Use this whenever the user pastes a GitHub link or other code source and asks to add,
  port, recreate, or "do this too" as a snippet/component for the library — even if they
  don't name this workflow explicitly or just paste a bare URL with a short instruction.
---

# Add Library Snippet

This repo (`bg-guy/code-library`) is a static card-based snippet library. Every entry is
a **directory** under `snippets/`, holding real files rather than strings embedded in a
dataset:

```
snippets/<id>/
  meta.json        id, title, language, languages?, tags, difficulty, description,
                   preview config ({ type, height, reactRuntime? }) — but NOT the markup
  explanation.md   the prose walkthrough
  snippet.js       the actual code (.jsx for a react snippet)
  preview.html     the live preview markup
  variants/<key>/  same explanation.md / snippet.* / preview.html, for multi-language
                   entries (see snippets/hover-carousel-nav-link)
snippets/order.json   display order, by id — the build fails if it and the directories disagree
```

`npm run build` (`scripts/build-data.js`) compiles that tree into the two generated
artifacts: `assets/js/data.js` (a plain `const SNIPPETS = [...]` browser script, so the
site still works opened via `file://`) and `snippets-index.json`. **Both are generated —
never hand-edit them.** They're rendered by `assets/js/main.js` (home grid) and
`assets/js/snippet.js` (detail page).

**Before doing anything else, check `snippets-index.json`** (repo root) to see what's
already in the library — it's a small, metadata-only mirror (id, title, language, tags,
difficulty, description) kept specifically so you don't have to walk the whole tree just
to check whether something similar already exists or to find an id.

Follow the steps below in order. They encode mistakes that were made and caught the hard
way while building the first pair of these (the text-parallax snippet) — skipping the
verification step in particular will let a broken preview slip through looking fine in a
screenshot.

## 1. Fetch and actually read the source

If it's a GitHub URL: call `add_repo` (owner/repo split from the URL), then
`GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 <url> <scratch-path>` per its instructions.
Read the real source files the effect lives in — not just the README. You're looking for
the actual mechanism (what math drives an animation, what a library call is doing under
the hood, what markup structure it depends on), because the vanilla version has to
reimplement that mechanism without the library, and the React version has to reproduce it
idiomatically with the library it's actually built on (framer-motion, GSAP, etc.).

Clean up the clone once you've extracted what you need — don't leave it lying around.

## 2. The snippet schema

Copy an existing snippet directory and edit it — conventions drift, and the tree is the
source of truth, not this doc. `meta.json`:

```json
{
  "id": "kebab-case-id",
  "title": "Human Title",
  "language": "javascript",
  "tags": ["a-few", "lowercase", "tags"],
  "difficulty": "Beginner | Intermediate | Advanced",
  "description": "One plain sentence, no markdown.",
  "preview": { "type": "html", "height": 320 }
}
```

Then `explanation.md`, `snippet.js` and `preview.html` as plain files beside it, and the
new id appended to `snippets/order.json`.

**Snippet code needs no escaping.** `snippet.js` and `preview.html` are real files, and
the build emits them with `JSON.stringify`, so backticks, `${...}` and `</script>` all
pass through literally. This used to be the single biggest source of silent breakage when
entries lived as nested template literals — don't reintroduce the habit of escaping them.

One real constraint remains, in `explanation.md`: it only supports the *markdown-lite*
subset that `renderMarkdownLite` in `assets/js/snippet.js` implements — `**bold**`,
`` `inline code` ``, blank-line-separated paragraphs, and `"1. "`-prefixed numbered
lists. There is no fenced-code-block support; a multi-line code block pasted in gets its
newlines collapsed into one line by the paragraph renderer. Keep code out of
`explanation.md` and put it in `snippet.js`.

After editing, run `npm run build`, then `node --check assets/js/data.js` to confirm the
generated script still parses.

## 3. Preview conventions

`preview` is optional but strongly preferred for the vanilla entry. Two types matter here:

**`type: "html"`** renders `preview.markup` (HTML+CSS+JS, `preview.height` in px) inside a
sandboxed iframe (`sandbox="allow-scripts"`, deliberately no `allow-same-origin`) via
`buildHtmlSrcdoc` in `assets/js/snippet.js`. Tailwind is always injected via CDN into that
iframe regardless of the snippet's declared language, so feel free to use Tailwind
classes in `preview.markup` even for a "javascript" snippet's demo. Any inline
`<script>` inside the markup must close as `<\/script>`, not `</script>`, to avoid
prematurely closing the outer template literal.

**The scroll gotcha:** the iframe's own base stylesheet sets `body { overflow: hidden }`,
and — verified with Playwright against the real headless Chromium here, both
programmatically (`window.scrollTo`) and via real mouse-wheel input — the iframe's
`scroll` event does not reliably fire inside this sandboxed context even when `scrollY`
visibly changes. **Never build a live preview whose interactivity depends on the iframe's
own document actually scrolling.** For any effect that's driven by scroll or intersection
in the real component, fake the progress in the preview with a control the user can
directly manipulate instead — an `<input type="range">` "Scroll progress" slider whose
`input` event drives the exact same math the real component derives from scroll is the
pattern used for the text-parallax preview; reuse it for the next scroll-driven effect
rather than re-discovering this the hard way.

**The `requestAnimationFrame` gotcha:** in this same sandboxed iframe, `requestAnimationFrame`
does not fire at all — confirmed with Playwright by scheduling a 5-tick rAF loop and getting
zero ticks after 2 full seconds, in an iframe that was definitely visible and correctly
sized. `setInterval` (e.g. `setInterval(tick, 16)`) fires reliably in the same context and
is a fine substitute for a preview's animation loop. This only applies to the *preview*
markup — the snippet's real `code` field should still use `requestAnimationFrame`, since
that's correct, standard practice for an actual page and the sandboxing quirk doesn't apply
there. This was found while building the sticky-cursor preview (its cursor never grew or
moved despite mousemove correctly identifying the hover target — the rAF loop driving the
visual update was simply never running); it's worth specifically testing that a preview's
animation loop is actually ticking (e.g. read a style property before and after a wait),
not just that events are being received, since those are two independently-verified things.

**React/Next.js entries can have a real live preview** — this corrects an earlier version
of this doc, which assumed they couldn't. Set `preview.reactRuntime: true` alongside
`type: "html"`: `buildHtmlSrcdoc` (in `assets/js/snippet.js`) then loads React 18 UMD,
ReactDOM 18 UMD, and Framer Motion's UMD build (`unpkg.com/framer-motion@<version>/dist/framer-motion.js`,
which genuinely exposes a `window.Motion` global — verified by inspecting the file, not
assumed) before Tailwind, in that order — Framer Motion's UMD factory reads `window.React`
at load time, so React must load first. Write the demo script with plain
`React.createElement` calls (aliased to `e`) against `window.Motion.motion`/`useMotionValue`/
`useSpring`/`useTransform`/`animate`/`transform` — skip JSX/Babel entirely, it's unnecessary
weight and one more thing to debug. `ReactDOM.createRoot(document.getElementById("root")).render(...)`
mounts it. This was verified two ways before trusting it: a minimal standalone rAF-counter +
spring test (confirming `requestAnimationFrame` really does tick and a spring genuinely
interpolates over several frames, not snap instantly) and, more importantly, the exact
same check run back through the *real* `buildHtmlSrcdoc`/`initPreview` path via Playwright
against the live site — trust the second one over the first if they ever disagree, since
it's what actually ships. (An earlier attempt at this apparently hit a real rAF stall and
worked around it with `setInterval` for a vanilla, non-React preview — that specific
gotcha may be environment-dependent; it did not reproduce for the React+Framer Motion path
here, but re-verify with the interaction-and-assert method below rather than assuming
either finding generalizes.)

If the real component drives its effect off `useScroll` (scroll-linked, not hover-linked),
the scroll gotcha above still applies even with a real Framer Motion runtime loaded —
`useScroll` won't get real scroll events in this sandbox. Don't reach for `useScroll` in
the preview; instead create a plain `useMotionValue` for progress, wire the same
`<input type="range">` slider pattern to call `.set(value)` on it, and feed that motion
value into the *real* `useTransform` — this way the interpolation math the reader is
actually being shown is still genuine Framer Motion, only the progress input is faked.

**`type: "text"`** is still the right fallback for anything that genuinely can't run in
this sandbox even with a loaded runtime (e.g. a component that hard-depends on Next.js
routing, `next/image`, server components, or a CMS/API call with no mock worth building).
Give it `preview.output` (a short usage example, e.g. how the component gets imported and
rendered) and `preview.note` explaining it's shown for reference. Plain text only —
`explanation` and `note` don't render markdown links, so reference a companion snippet by
name, not a link.

## 4. Adding a new language category

Only needed the first time a snippet needs a language/framework not already in
`LANGUAGE_LABELS`. It touches five places — grep for the existing language keys (e.g.
`"javascript"` or `"react"`) across `assets/` and `index.html` before you start, don't
rely on this list from memory, conventions may have shifted:

1. `assets/js/languages.js` — add to `LANGUAGE_LABELS`.
2. `index.html` — add a `<button class="pill" data-filter="...">` inside `#languagePills`.
3. `assets/js/layout.js` — add to the `categories` array (side hamburger menu) **and**
   the hardcoded footer language `<li>` list — these are two separate hand-written spots,
   not generated from one array.
4. `assets/css/style.css` — a `--<name>-color` variable, a `.dot-<name>` rule, and a
   `.card[data-lang="<name>"]` accent rule.
5. `assets/js/snippet.js` — an entry in the `langAlias()` map, which picks the
   highlight.js grammar for the code block. Check `snippet.html` for which hljs language
   packs are actually loaded via `<script>` tags before assuming a dedicated grammar
   exists — JSX has none loaded, so it reuses `"javascript"`.

Also bump the "N snippets and counting" hero text, and the meta description / hero lead
paragraph in `index.html` if the total or language mix changed enough to make the old
copy inaccurate.

## 5. Don't fight the related-snippets algorithm

`renderRelated` in `assets/js/snippet.js` is a simple `tags.some(...)` match in array
order, capped at 3, with no relevance ranking. Shared tags between your two new entries
don't guarantee they'll show as "related" to each other if an earlier, unrelated snippet
in the array shares a more common tag (e.g. "animation") first. That's fine — just
mention the companion snippet by name in `explanation` prose rather than trying to game
the algorithm or rewriting it (out of scope for adding a snippet).

## 6. Verify before committing — do not skip this

A preview can look completely correct in a static screenshot while being functionally
dead (this happened with the first scroll-based attempt here — it rendered fine and only
failed once actually scrolled). Treat this step as mandatory:

1. `npm run build`, then `node --check assets/js/data.js`.
2. Serve the repo root: `python3 -m http.server <port>` from the repo root, in the
   background.
3. Drive it with Playwright. The `playwright` npm package is installed globally, not
   locally in this repo — resolve it with `NODE_PATH=$(npm root -g) node script.js`. The
   pre-installed Chromium binary is at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`
   (glob for the exact build number); pass it as `executablePath` when launching.
4. At minimum, check:
   - Home page: card count matches the new total, the new/changed filter pill(s) actually
     filter the grid correctly.
   - Each new snippet's `snippet.html?id=<id>` page: title, code block, and explanation
     render; no `pageerror` console events.
   - Any `type: "html"` live preview: actually **interact** with its control (drag the
     slider, click the button — whatever it has) via Playwright and assert the resulting
     style/DOM actually changed. Don't just take a screenshot and eyeball it.
5. Take a screenshot of the rendered preview section as a final sanity check, and share it
   before pushing.
6. Delete scratch test scripts and any temporary clone once done — they don't belong in
   the repo or its history.

**Coordinate gotcha:** the explanation section above a preview can easily push it a couple
thousand pixels down the page (a real page in this session had it at `y ≈ 4300`). Playwright's
`elementHandle.boundingBox()` returns coordinates relative to the current viewport, so
`page.mouse.move()` to an unscrolled element's box silently aims at nothing and every
interaction test fails — not because the snippet is broken, but because the page was never
scrolled there. Always `await page.locator(".preview-section").scrollIntoViewIfNeeded()`
before measuring boxes or synthesizing input. Also remember an element handle obtained via
a *frame's* own `$()`/`locator()` still reports page-relative coordinates from Playwright,
but any coordinates you feed into a `TouchEvent`/`MouseEvent` you construct and dispatch
*inside* that frame (via `frame.evaluate`) need to be frame-relative — subtract the iframe's
own `boundingBox()` offset first, don't add it.

## 7. Rebuild the generated artifacts

Run `npm run build` (`scripts/build-data.js`) to regenerate **both** `assets/js/data.js`
and `snippets-index.json` from `snippets/`. Do this after *any* change under `snippets/`,
not just adds and renames — unlike the old setup, the snippet code and previews now live
in the tree too, so an edit to `snippet.js` or `preview.html` won't reach the site until
you rebuild.

Commit the regenerated files alongside your `snippets/` change. They're checked in
deliberately, so the site works for anyone who clones it without running a build — but
that also means a stale `data.js` silently serves old code, which is worse than no index
at all. If the build throws about `order.json`, you added a directory without listing it
(or vice versa) — that guard exists precisely to stop a snippet going live invisible.

## 8. Commit and push

GitHub Pages serves this site from `main`. Development happens on a `claude/...` feature
branch. Unless told otherwise, push to **both**: the current working branch, and a
fast-forward push to `main` (`git push origin HEAD:main`) so Pages actually picks up the
change — pushing only to the feature branch silently leaves the live site stale.

Match the existing commit message style: a plain descriptive summary line, and when a
snippet is adapted from a real external project, name and credit the source in the body.
