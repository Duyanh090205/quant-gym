/**
 * Bundle the demo into one self-contained HTML file.
 *
 * Browsers refuse to load ES modules over `file://`, so a demo that only works
 * behind a web server is a demo most people never open. This script inlines the
 * engine and the demo app into `demo/standalone.html`, which anyone can
 * double-click.
 *
 * It is a 40-line bundler, not a general one. It works because every module here
 * uses plain named imports and exports and nothing else.
 *
 *   node scripts/build-demo.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Dependency order: a module may only import ones listed before it.
const MODULES = [
  "src/engine/format.js",
  "src/engine/rng.js",
  "src/engine/text.js",
  "src/engine/tips.js",
  "src/engine/curriculum.js",
  "src/engine/arithmetic.js",
  "src/engine/sequences.js",
  "src/engine/probability.js",
  "src/engine/estimation.js",
  "src/engine/grade.js",
  "src/engine/index.js",
];

// This list has been forgotten twice, and both times the demo shipped looking
// fine and threw the moment a student opened the new topic. A missing module is
// invisible here and obvious to the directory, so ask the directory.
{
  const onDisk = readdirSync(join(root, "src/engine")).filter((f) => f.endsWith(".js"));
  const listed = new Set(MODULES.map((m) => m.split("/").pop()));
  const missing = onDisk.filter((f) => !listed.has(f));
  if (missing.length) {
    console.error(`build-demo: src/engine has ${missing.join(", ")}, which MODULES does not list.`);
    console.error("Add it in dependency order - a module may only import ones listed before it.");
    process.exit(1);
  }
}

/** Collect the names a module exports, then strip the ESM syntax. */
function toCommonJs(src) {
  const names = new Set();
  for (const m of src.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)) names.add(m[1]);
  for (const m of src.matchAll(/^export\s+(?:const|let|var)\s+(\w+)/gm)) names.add(m[1]);
  for (const m of src.matchAll(/^export\s*\{([^}]*)\}\s*;/gms)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    }
  }

  const body = src
    .replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']+["']\s*;?/gms, (_, inner) => `const {${inner}} = __shared;`)
    .replace(/^export\s*\{[^}]*\}\s*;?/gms, "")
    .replace(/^export\s+/gm, "");

  return `${body}\nObject.assign(__shared, { ${[...names].join(", ")} });\n`;
}

const engine = MODULES.map((rel) => {
  const src = readFileSync(join(root, rel), "utf8");
  return `/* ── ${rel} ─────────────────────────────────── */\n(() => {\n${toCommonJs(src)}})();`;
}).join("\n\n");

const app = readFileSync(join(root, "demo/app.js"), "utf8")
  .replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']+["']\s*;?/gms, (_, inner) => `const {${inner}} = __shared;`);

const html = readFileSync(join(root, "demo/index.html"), "utf8").replace(
  /<script type="module" src="\.\/app\.js"><\/script>/,
  `<script>\n"use strict";\nconst __shared = {};\n${engine}\n\n/* ── demo/app.js ─────────────────────────────────── */\n${app}\n</script>`
);

const out = join(root, "demo/standalone.html");
writeFileSync(out, html, "utf8");
console.log(`built ${out}  (${(html.length / 1024).toFixed(0)} KB)`);
