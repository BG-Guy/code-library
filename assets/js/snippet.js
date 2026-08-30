/* Code Library — snippet detail page: render code, copy-to-clipboard, explanation. */

document.addEventListener("DOMContentLoaded", () => {
  LAYOUT.mount("snippet");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const snippet = SNIPPETS.find((s) => s.id === id);

  const root = document.getElementById("snippetRoot");

  if (!snippet) {
    root.innerHTML = `
      <a class="back-link" href="index.html">${backArrow()} Back to library</a>
      <div class="explanation">
        <h2>Snippet not found</h2>
        <div class="explanation-body">
          <p>We couldn't find a snippet with the id "<code>${escapeHTML(id || "")}</code>". It may have been renamed or removed.</p>
        </div>
      </div>
    `;
    return;
  }

  document.title = `${snippet.title} — Code Library`;

  root.innerHTML = `
    <a class="back-link" href="index.html">${backArrow()} Back to library</a>

    <header class="snippet-header">
      <div class="snippet-meta">
        <span class="lang-badge">${snippet.language}</span>
        <span class="difficulty">${snippet.difficulty}</span>
      </div>
      <h1>${escapeHTML(snippet.title)}</h1>
      <p class="lead">${escapeHTML(snippet.description)}</p>
      <div class="snippet-tags">
        ${snippet.tags.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("")}
      </div>
    </header>

    <div class="code-panel">
      <div class="code-panel-bar">
        <span class="code-dots"><span></span><span></span><span></span></span>
        <button class="copy-btn" id="copyBtn">
          ${copyIcon()}
          <span id="copyLabel">Copy code</span>
        </button>
      </div>
      <pre><code class="language-${langAlias(snippet.language)}" id="codeBlock"></code></pre>
    </div>

    <section class="explanation">
      <h2>🧠 How it works</h2>
      <div class="explanation-body">${renderMarkdownLite(snippet.explanation)}</div>
    </section>

    <section class="related-section">
      <h2>More snippets</h2>
      <div class="related-grid" id="relatedGrid"></div>
    </section>
  `;

  const codeBlock = document.getElementById("codeBlock");
  codeBlock.textContent = snippet.code;
  if (window.hljs) window.hljs.highlightElement(codeBlock);

  const copyBtn = document.getElementById("copyBtn");
  const copyLabel = document.getElementById("copyLabel");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      copyBtn.classList.add("is-copied");
      copyLabel.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        copyLabel.textContent = "Copy code";
      }, 1800);
    } catch (err) {
      copyLabel.textContent = "Press ⌘/Ctrl+C";
    }
  });

  renderRelated(snippet);
});

function backArrow() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>`;
}

function copyIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}

function langAlias(language) {
  return { javascript: "javascript", python: "python", css: "css" }[language] || "plaintext";
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatInline(text) {
  return escapeHTML(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

/* Minimal markdown-ish renderer for our own authored explanation strings
   (bold, inline code, blank-line paragraphs, simple "1. " numbered lists). */
function renderMarkdownLite(text) {
  const blocks = text.trim().split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      const isList = lines.every((l) => /^\d+\.\s/.test(l));

      if (isList) {
        const items = lines.map((l) => `<li>${formatInline(l.replace(/^\d+\.\s/, ""))}</li>`).join("");
        return `<ol>${items}</ol>`;
      }

      return `<p>${formatInline(lines.join(" "))}</p>`;
    })
    .join("");
}

function renderRelated(current) {
  const relatedGrid = document.getElementById("relatedGrid");
  const related = SNIPPETS.filter(
    (s) => s.id !== current.id && (s.language === current.language || s.tags.some((t) => current.tags.includes(t)))
  ).slice(0, 3);

  const pool = related.length > 0 ? related : SNIPPETS.filter((s) => s.id !== current.id).slice(0, 3);

  relatedGrid.innerHTML = pool
    .map(
      (s) => `
      <article class="card" data-lang="${s.language}" data-id="${s.id}" tabindex="0" role="link" aria-label="Open snippet: ${s.title}">
        <div class="card-top">
          <span class="lang-badge">${s.language}</span>
          <span class="difficulty">${s.difficulty}</span>
        </div>
        <h3>${escapeHTML(s.title)}</h3>
        <p class="card-desc">${escapeHTML(s.description)}</p>
      </article>
    `
    )
    .join("");

  relatedGrid.querySelectorAll(".card").forEach((card) => {
    const go = () => (window.location.href = `snippet.html?id=${card.dataset.id}`);
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
}
