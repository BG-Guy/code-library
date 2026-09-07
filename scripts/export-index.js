#!/usr/bin/env node
// Regenerates snippets-index.json from assets/js/data.js.
//
// data.js is a plain browser script (no module.exports, works via file://),
// so this loads it in an isolated vm context to pull out the real SNIPPETS
// array rather than parsing the source with regex, which would break the
// moment a title or tag contains something regex-shaped.
//
// Run after adding/editing/removing a snippet: node scripts/export-index.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.join(__dirname, "..");
const dataJsPath = path.join(repoRoot, "assets/js/data.js");
const indexPath = path.join(repoRoot, "snippets-index.json");

const source = fs.readFileSync(dataJsPath, "utf8");
const context = vm.createContext({});
// data.js declares SNIPPETS with `const`, which binds in the vm context's
// lexical scope rather than as a property of the sandbox object — so pull
// it out with a second script run in that same context, instead of reading
// it off the sandbox object directly.
vm.runInContext(source, context, { filename: "data.js" });
const snippets = vm.runInContext("SNIPPETS", context);

if (!Array.isArray(snippets)) {
  throw new Error("data.js did not define a SNIPPETS array — check it still evaluates cleanly.");
}

const index = snippets.map((s) => ({
  id: s.id,
  title: s.title,
  language: s.language,
  tags: s.tags,
  difficulty: s.difficulty,
  description: s.description,
}));

const output = {
  generatedFrom: "assets/js/data.js",
  generatedBy: "scripts/export-index.js",
  count: index.length,
  snippets: index,
};

fs.writeFileSync(indexPath, JSON.stringify(output, null, 2) + "\n");
console.log(`Wrote ${index.length} snippets to ${path.relative(repoRoot, indexPath)}`);
