/* Language labels and badge markup — hand-written, shared by layout.js (sidebar
   filters), main.js (home grid) and snippet.js (detail header + related grid),
   so a multi-language snippet renders the same badges everywhere instead of
   drifting per call site.

   Lives here rather than in data.js because data.js is generated from snippets/
   and would clobber it. Must load before layout/main/snippet. */

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  react: "React / Next.js",
};

function langBadgesMarkup(languages) {
  if (languages.length > 1) {
    return `<span class="lang-badge-group">${languages.map((l) => `<span class="lang-badge lang-badge-${l}">${l}</span>`).join("")}</span>`;
  }
  return `<span class="lang-badge">${languages[0]}</span>`;
}
