#!/usr/bin/env node
// Builds assets/js/data.js and snippets-index.json from the snippets/ tree.
//
// snippets/<id>/ is the source of truth — meta.json plus real explanation.md /
// snippet.js / preview.html files, so each snippet can be opened, read, copied
// and diffed on its own instead of living as a template literal inside one
// enormous dataset file.
//
// The generated data.js stays a plain browser script (a `const SNIPPETS = [...]`
// literal, no module.exports) so the site still works opened via file://.
// Snippet bodies are emitted with JSON.stringify, which means backticks,
// ${...} and </script> inside a snippet need no escaping at all.
//
// Run after adding/editing/removing a snippet: npm run build

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const snippetsDir = path.join(repoRoot, "snippets");
const dataJsPath = path.join(repoRoot, "assets/js/data.js");
const indexPath = path.join(repoRoot, "snippets-index.json");

const readIfExists = p => (fs.existsSync(p) ? fs.readFileSync(p, "utf8").replace(/\n$/, "") : undefined);

// Snippet order is display order, so it can't come from a directory listing —
// it's declared explicitly in snippets/order.json.
const order = JSON.parse(fs.readFileSync(path.join(snippetsDir, "order.json"), "utf8"));
const onDisk = fs
  .readdirSync(snippetsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

const missing = order.filter(id => !onDisk.includes(id));
const unlisted = onDisk.filter(id => !order.includes(id));
if (missing.length) throw new Error("order.json lists snippets with no directory: " + missing.join(", "));
if (unlisted.length) throw new Error("snippet directories missing from order.json: " + unlisted.join(", "));

// Finds snippet.<ext> without caring which extension the language implied.
function findCode(dir) {
  const hit = fs.readdirSync(dir).find(f => /^snippet\./.test(f));
  return hit ? readIfExists(path.join(dir, hit)) : undefined;
}

function loadBody(dir, meta) {
  const out = {};
  const explanation = readIfExists(path.join(dir, "explanation.md"));
  if (explanation !== undefined) out.explanation = explanation;
  const code = findCode(dir);
  if (code !== undefined) out.code = code;
  if (meta.preview) {
    const preview = Object.assign({}, meta.preview);
    const markup = readIfExists(path.join(dir, "preview.html"));
    if (markup !== undefined) preview.markup = markup;
    out.preview = preview;
  }
  return out;
}

const snippets = order.map(id => {
  const dir = path.join(snippetsDir, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));

  // Rebuilt key by key rather than spread, so the generated array keeps a
  // stable field order that diffs cleanly between runs.
  const s = {
    id: meta.id,
    title: meta.title,
    language: meta.language,
  };
  if (meta.languages) s.languages = meta.languages;
  if (meta.tags) s.tags = meta.tags;
  if (meta.difficulty) s.difficulty = meta.difficulty;
  if (meta.description) s.description = meta.description;

  const body = loadBody(dir, meta);
  if (body.explanation !== undefined) s.explanation = body.explanation;
  if (body.code !== undefined) s.code = body.code;
  if (body.preview !== undefined) s.preview = body.preview;

  if (meta.variants) {
    s.variants = meta.variants.map(v => {
      const vdir = path.join(dir, "variants", v.key);
      if (!fs.existsSync(vdir)) throw new Error(id + ": variant directory missing: variants/" + v.key);
      const vb = loadBody(vdir, v);
      const out = { key: v.key, label: v.label, language: v.language };
      if (vb.explanation !== undefined) out.explanation = vb.explanation;
      if (vb.code !== undefined) out.code = vb.code;
      if (vb.preview !== undefined) out.preview = vb.preview;
      return out;
    });
  }
  return s;
});

const banner = `/* GENERATED FILE — do not edit by hand.
   Source of truth: snippets/<id>/ (meta.json, explanation.md, snippet.*, preview.html)
   Regenerate with: npm run build

   Kept as a plain browser script rather than a fetched JSON file so the site
   also works when opened via file://. */

`;
fs.writeFileSync(dataJsPath, banner + "const SNIPPETS = " + JSON.stringify(snippets, null, 2) + ";\n");

fs.writeFileSync(
  indexPath,
  JSON.stringify(
    {
      generatedFrom: "snippets/",
      generatedBy: "scripts/build-data.js",
      count: snippets.length,
      snippets: snippets.map(s => ({
        id: s.id,
        title: s.title,
        language: s.language,
        tags: s.tags,
        difficulty: s.difficulty,
        description: s.description,
      })),
    },
    null,
    2
  ) + "\n"
);

console.log(`Built ${snippets.length} snippets -> assets/js/data.js + snippets-index.json`);
