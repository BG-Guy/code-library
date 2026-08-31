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

    ${renderPreviewSection(snippet)}

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
  initPreview(snippet);
});

function backArrow() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>`;
}

function copyIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}

function langAlias(language) {
  return { javascript: "javascript", node: "javascript", tailwind: "xml" }[language] || "plaintext";
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

function refreshIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>`;
}

function renderPreviewSection(snippet) {
  const preview = snippet.preview;
  if (!preview) return "";

  const badgeLabel = { js: "Live", html: "Live", text: "Example output" };
  const badgeClass = preview.type === "text" ? "static" : "live";

  let toolbarRight = "";
  if (preview.type === "js") {
    toolbarRight = `<button class="rerun-btn" id="previewRerun">${refreshIcon()} Run again</button>`;
  } else if (preview.type === "html" && preview.resizable) {
    toolbarRight = `
      <div class="width-slider">
        <span>Width</span>
        <input type="range" id="previewWidth" min="200" max="700" value="700" />
      </div>
    `;
  }

  let body = "";
  if (preview.type === "js") {
    body = `<div class="preview-console" id="previewConsole"><span class="log-empty">Running…</span></div>`;
  } else if (preview.type === "html") {
    body = `
      <div class="preview-stage">
        <div class="preview-frame-wrap" id="previewFrameWrap" style="max-width:${preview.resizable ? "700px" : "100%"}">
          <iframe class="preview-frame" id="previewFrame" sandbox="allow-scripts" title="Live preview of ${escapeHTML(snippet.title)}" height="${preview.height || 200}"></iframe>
        </div>
      </div>
    `;
  } else if (preview.type === "text") {
    body = `
      <div class="preview-text-block">
        <pre>${escapeHTML(preview.output)}</pre>
        ${preview.note ? `<p class="preview-note">💡 ${escapeHTML(preview.note)}</p>` : ""}
      </div>
    `;
  }

  return `
    <section class="preview-section">
      <h2>👀 Preview <span class="preview-badge ${badgeClass}">${badgeLabel[preview.type]}</span></h2>
      <div class="preview-panel">
        <div class="preview-toolbar">
          <span class="preview-note" style="margin:0;">${previewToolbarLabel(preview.type)}</span>
          ${toolbarRight}
        </div>
        ${body}
      </div>
    </section>
  `;
}

function previewToolbarLabel(type) {
  if (type === "js") return "Executed in a sandboxed frame — nothing here can touch this page.";
  if (type === "html") return "Rendered with Tailwind and the exact markup from the snippet above.";
  return "Not executed in-browser — shown for reference.";
}

function buildJsSrcdoc(runCode) {
  return `<!doctype html>
<html><head><meta charset="utf-8"></head><body>
<script>
function __send(level, args) {
  try {
    var text = args.map(function (a) {
      if (a instanceof Error) return a.message;
      return typeof a === "object" && a !== null ? JSON.stringify(a) : String(a);
    }).join(" ");
    parent.postMessage({ __clPreview: true, level: level, text: text }, "*");
  } catch (e) {}
}
console.log = function () { __send("log", Array.prototype.slice.call(arguments)); };
console.error = function () { __send("error", Array.prototype.slice.call(arguments)); };
window.addEventListener("error", function (e) { __send("error", [e.message]); });
try {
${runCode}
} catch (err) {
  __send("error", [err.message]);
}
<\/script>
</body></html>`;
}

function buildHtmlSrcdoc(markup, tailwindConfig) {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.tailwindcss.com"><\/script>
${tailwindConfig ? `<script>tailwind.config = ${tailwindConfig};<\/script>` : ""}
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { font-family: -apple-system, "Inter", sans-serif; overflow: hidden; }
</style>
</head><body>
${markup}
<script>
  function __postHeight() {
    parent.postMessage({ __clPreviewHeight: true, height: document.documentElement.scrollHeight }, "*");
  }
  window.addEventListener("load", __postHeight);
  if (window.ResizeObserver) {
    new ResizeObserver(__postHeight).observe(document.body);
  } else {
    window.addEventListener("resize", __postHeight);
  }
  setTimeout(__postHeight, 50);
  setTimeout(__postHeight, 300);
<\/script>
</body></html>`;
}

function initPreview(snippet) {
  const preview = snippet.preview;
  if (!preview) return;

  if (preview.type === "js") {
    const consoleEl = document.getElementById("previewConsole");
    const rerunBtn = document.getElementById("previewRerun");
    let frame = null;

    const messageHandler = (event) => {
      if (!frame || event.source !== frame.contentWindow || !event.data || !event.data.__clPreview) return;
      if (consoleEl.querySelector(".log-empty")) consoleEl.innerHTML = "";
      const line = document.createElement("div");
      line.className = "log-line" + (event.data.level === "error" ? " is-error" : "");
      line.textContent = event.data.text;
      consoleEl.appendChild(line);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    };
    window.addEventListener("message", messageHandler);

    function run() {
      consoleEl.innerHTML = `<span class="log-empty">Running…</span>`;
      frame = document.createElement("iframe");
      frame.setAttribute("sandbox", "allow-scripts");
      frame.style.display = "none";
      frame.srcdoc = buildJsSrcdoc(preview.run);
      document.body.appendChild(frame);
      setTimeout(() => frame && frame.remove(), 4000);
    }

    rerunBtn?.addEventListener("click", () => {
      if (frame) frame.remove();
      rerunBtn.classList.add("is-spinning");
      run();
      setTimeout(() => rerunBtn.classList.remove("is-spinning"), 400);
    });

    run();
  }

  if (preview.type === "html") {
    const iframe = document.getElementById("previewFrame");
    const frameWrap = document.getElementById("previewFrameWrap");
    const widthSlider = document.getElementById("previewWidth");

    iframe.srcdoc = buildHtmlSrcdoc(preview.markup, preview.tailwindConfig);

    window.addEventListener("message", (event) => {
      if (event.source !== iframe.contentWindow || !event.data || !event.data.__clPreviewHeight) return;
      const h = Math.max(preview.height || 200, Math.min(event.data.height, 480));
      iframe.style.height = h + "px";
    });

    widthSlider?.addEventListener("input", (e) => {
      frameWrap.style.width = e.target.value + "px";
    });
  }
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
    CardTap.wire(card, go);
  });
}
