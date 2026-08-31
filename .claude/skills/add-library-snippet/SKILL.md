---
name: add-library-snippet
description: >-
  How to turn a code source the user shares (a GitHub repo URL, a CodePen, a blog post
  with a demo, etc.) into a new entry in this repo's snippet library: a dependency-free
  vanilla JS version and a shadcn/ui-style React/Next.js component, both wired into
  assets/js/data.js and verified with a real headless-browser test before committing.
  Use this whenever the user pastes a GitHub link or other code source and asks to add,
  port, recreate, or "do this too" as a snippet/component for the library — even if they
  don't name this workflow explicitly or just paste a bare URL with a short instruction.
---

# Add Library Snippet

This repo (`bg-guy/code-library`) is a static card-based snippet library. Every entry
lives in `assets/js/data.js` as one object in the `SNIPPETS` array, rendered by
`assets/js/main.js` (home grid) and `assets/js/snippet.js` (detail page). When the user
hands you a code source and wants it added to the library, they want **two** entries out
of it — a dependency-free vanilla JS version, and a copy-paste React/Next.js component
built shadcn/ui-style (single file, Tailwind classNames, no build step, sensible props).

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

Open `assets/js/data.js` and skim a couple of existing entries before writing a new one —
conventions drift, and the file is the source of truth, not this doc. Skeleton:

```js
{
  id: "kebab-case-id",
  title: "Human Title",
  language: "javascript", // or "react" — see LANGUAGE_LABELS at the top of the file
  tags: ["a-few", "lowercase", "tags"],
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  description: "One plain sentence, no markdown.",
  explanation: `Prose + **bold** + \`inline code\` + blank-line paragraphs + "1. " lists only.`,
  code: `/* the actual reusable snippet, escaped — see below */`,
  preview: { /* optional, see step 3 */ },
}
```

Two fields are template literals nested inside `data.js`'s own JS, which is easy to get
wrong silently:

- **`explanation`** only supports the *markdown-lite* subset that `renderMarkdownLite` in
  `assets/js/snippet.js` implements: `**bold**`, `` `inline code` ``, blank-line-separated
  paragraphs, and `"1. "`-prefixed numbered lists. There is no fenced-code-block support —
  a multi-line code block pasted into `explanation` gets its newlines collapsed into one
  line by the paragraph renderer. Keep code out of `explanation`; put it in `code` or
  `preview.output` instead.
- **`code`** (and `preview.markup`/`preview.run`, if used) live inside a JS template
  literal in `data.js`. Any literal backtick in the snippet's own code must be escaped as
  `` \` ``, and any `${...}` must be escaped as `\${...}` or it will be interpolated by
  the *outer* template literal instead of appearing as text. Grep an existing snippet
  (e.g. search `data.js` for `\\\`` ) to see the pattern before writing a new one with
  nested backticks.

After every edit to `data.js`, run `node --check assets/js/data.js` — a broken escape is
a silent syntax error otherwise, not something you'll notice by eye.

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

**`type: "text"`** is for anything that can't run in this sandbox at all — this is what
the React/Next.js entry should use, since the iframe has no React/Next/framer-motion
runtime. Give it `preview.output` (a short usage example, e.g. how the component gets
imported and rendered) and `preview.note` explaining it's shown for reference and pointing
the reader to the vanilla version's live preview to actually see the effect. Plain text
only — `explanation` and `note` don't render markdown links, so reference the companion
snippet by name, not a link.

## 4. Adding a new language category

Only needed the first time a snippet needs a language/framework not already in
`LANGUAGE_LABELS`. It touches five places — grep for the existing language keys (e.g.
`"javascript"` or `"react"`) across `assets/` and `index.html` before you start, don't
rely on this list from memory, conventions may have shifted:

1. `assets/js/data.js` — add to `LANGUAGE_LABELS`.
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

1. `node --check assets/js/data.js`.
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

## 7. Commit and push

GitHub Pages serves this site from `main`. Development happens on a `claude/...` feature
branch. Unless told otherwise, push to **both**: the current working branch, and a
fast-forward push to `main` (`git push origin HEAD:main`) so Pages actually picks up the
change — pushing only to the feature branch silently leaves the live site stale.

Match the existing commit message style: a plain descriptive summary line, and when a
snippet is adapted from a real external project, name and credit the source in the body.
