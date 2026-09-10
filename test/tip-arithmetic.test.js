/**
 * Check the arithmetic inside the tip cards.
 *
 * The generated questions are verified twice over, by formula and by simulation.
 * The tip cards were not verified at all: their examples are prose I typed, in
 * two languages, and a wrong digit in "34 × 40 = 1360" would sit there teaching
 * the mistake with nothing to catch it.
 *
 * So this file reads the cards, finds every equation in them, and evaluates both
 * sides. It parses the notation the cards actually use — ×, ÷, ², ³, !, %, ≈,
 * fractions — and it knows that 5,832 means five thousand in English while 5.832
 * means five thousand in Vietnamese and 0,545 means a half.
 *
 * Anything it cannot parse is counted, not skipped quietly, and the test fails if
 * the share it could not read grows large enough to make the check hollow.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { TIPS, getTip } from "../src/engine/index.js";

/* ── a small evaluator for the notation the cards use ────────────────────── */

const isDigit = (c) => c >= "0" && c <= "9";

/**
 * Turn text into tokens. `lang` decides which separator groups thousands:
 * English writes 5,832 and 0.5; Vietnamese writes 5.832 and 0,5.
 */
function tokenize(src, lang) {
  const thousands = lang === "vi" ? "." : ",";
  const decimal = lang === "vi" ? "," : ".";
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === " ") { i++; continue; }
    if (isDigit(c)) {
      let text = "";
      while (i < src.length) {
        const d = src[i];
        if (isDigit(d)) { text += d; i++; continue; }
        // A thousands separator must sit between digits and be followed by three.
        if (d === thousands && /^\d{3}(?!\d)/.test(src.slice(i + 1))) { i++; continue; }
        if (d === decimal && isDigit(src[i + 1])) { text += "."; i++; continue; }
        break;
      }
      out.push({ t: "num", v: parseFloat(text) });
      continue;
    }
    if ("+-−*×·/÷^()²³!%".includes(c)) { out.push({ t: c }); i++; continue; }
    return null;                       // a letter or anything else: not an expression
  }
  return out;
}

/** expr := term (('+' | '-') term)* */
function parseExpr(ts, pos) {
  let r = parseTerm(ts, pos);
  if (!r) return null;
  let { value, next } = r;
  while (next < ts.length && (ts[next].t === "+" || ts[next].t === "-" || ts[next].t === "−")) {
    const op = ts[next].t;
    const rhs = parseTerm(ts, next + 1);
    if (!rhs) return null;
    value = op === "+" ? value + rhs.value : value - rhs.value;
    next = rhs.next;
  }
  return { value, next };
}

/** term := power (('×' | '/' | '÷') power)* */
function parseTerm(ts, pos) {
  let r = parsePower(ts, pos);
  if (!r) return null;
  let { value, next } = r;
  while (next < ts.length && ["*", "×", "·", "/", "÷"].includes(ts[next].t)) {
    const op = ts[next].t;
    const rhs = parsePower(ts, next + 1);
    if (!rhs) return null;
    if (op === "/" || op === "÷") {
      if (rhs.value === 0) return null;
      value /= rhs.value;
    } else {
      value *= rhs.value;
    }
    next = rhs.next;
  }
  return { value, next };
}

/** power := unary ('^' power)? */
function parsePower(ts, pos) {
  const base = parseUnary(ts, pos);
  if (!base) return null;
  if (base.next < ts.length && ts[base.next].t === "^") {
    const exp = parsePower(ts, base.next + 1);
    if (!exp) return null;
    return { value: base.value ** exp.value, next: exp.next };
  }
  return base;
}

/** unary := ('-')? primary ('²' | '³' | '!' | '%')* */
function parseUnary(ts, pos) {
  let sign = 1;
  let i = pos;
  while (i < ts.length && (ts[i].t === "-" || ts[i].t === "−")) { sign = -sign; i++; }
  let r;
  if (i < ts.length && ts[i].t === "num") {
    r = { value: ts[i].v, next: i + 1 };
  } else if (i < ts.length && ts[i].t === "(") {
    const inner = parseExpr(ts, i + 1);
    if (!inner || inner.next >= ts.length || ts[inner.next].t !== ")") return null;
    r = { value: inner.value, next: inner.next + 1 };
  } else {
    return null;
  }
  while (r.next < ts.length && ["²", "³", "!", "%"].includes(ts[r.next].t)) {
    const op = ts[r.next].t;
    if (op === "²") r.value = r.value ** 2;
    else if (op === "³") r.value = r.value ** 3;
    else if (op === "%") r.value = r.value / 100;
    else {
      if (!Number.isInteger(r.value) || r.value < 0 || r.value > 20) return null;
      let f = 1;
      for (let k = 2; k <= r.value; k++) f *= k;
      r.value = f;
    }
    r.next++;
  }
  if (sign === -1) r.value = -r.value;
  return r;
}

/** Evaluate a whole expression, or null if it is not one. */
function evaluate(text, lang) {
  const ts = tokenize(text, lang);
  if (!ts || !ts.length) return null;
  const r = parseExpr(ts, 0);
  if (!r || r.next !== ts.length) return null;
  return Number.isFinite(r.value) ? r.value : null;
}

/* ── pull the equations out of prose ─────────────────────────────────────── */

// A run of characters that could be maths, holding at least one = or ≈.
const RUN = /[0-9(][0-9()\s+\-−*×·/÷^²³!%.,≈=]*[0-9)²³!%]/g;

function equations(text) {
  // "8 × 240 = 24 × ?" is a puzzle for the reader, not a claim. The ? never
  // survives into the run, which would leave "8 × 240 = 24" looking false.
  if (/[=×÷*+\-−/]\s*\?/.test(text)) return [];
  const found = [];
  for (const wholeRun of text.match(RUN) || []) {
    // A step may list several facts in one breath: "1/2 = 50%, 1/3 = 33.3%".
    // A comma followed by a space separates them; a comma inside a number never
    // is, because Vietnamese writes 33,3% with no space and English writes 5,832.
    for (const run of wholeRun.split(/,\s+/)) {
      if (!/[=≈]/.test(run)) continue;
      const approx = run.includes("≈");
      const parts = run.split(/[=≈]/).map((s) => s.replace(/^[\s,.]+|[\s,.]+$/g, "")).filter(Boolean);
      if (parts.length >= 2) found.push({ parts, approx, run: run.trim() });
    }
  }
  return found;
}

/* ── the tests ───────────────────────────────────────────────────────────── */

test("every equation printed on a tip card is true", () => {
  let checked = 0, unreadable = 0;
  const bad = [], skipped = [];

  for (const t of TIPS) {
    for (const lang of ["en", "vi"]) {
      const card = getTip(t.id, lang);
      const texts = [
        ...card.examples.flatMap((e) => [e.ask, e.work]),
        ...card.steps,
        card.why,
        card.when,
      ].filter(Boolean);

      for (const text of texts) {
        for (const eq of equations(text)) {
          const values = eq.parts.map((p) => evaluate(p, lang));
          if (values.some((v) => v === null)) {
            unreadable++;
            if (skipped.length < 8) skipped.push(`${t.id}/${lang}: ${eq.run}`);
            continue;
          }
          const tol = eq.approx ? Math.max(Math.abs(values[0]) * 0.01, 1e-9) : Math.max(Math.abs(values[0]) * 1e-9, 1e-9);
          for (let i = 1; i < values.length; i++) {
            if (Math.abs(values[i] - values[0]) > tol) {
              bad.push(`${t.id} (${lang}): ${eq.run}  →  ${values.join(" vs ")}`);
            }
          }
          checked++;
        }
      }
    }
  }

  console.log(`    checked ${checked} equations across ${TIPS.length} cards in two languages` +
              `; ${unreadable} runs were not expressions`);
  if (skipped.length) console.log("    not expressions:", skipped.join(" | "));
  assert.deepEqual(bad, [], `${bad.length} false equations on the cards`);
  assert.ok(checked > 70, `only ${checked} equations were checked, too few to mean anything`);
  assert.ok(unreadable / (checked + unreadable) < 0.35,
    `${unreadable} of ${checked + unreadable} runs could not be read as expressions`);
});

test("an arithmetic example works out the sum it asks about", () => {
  // "What is 48 × 5?" must be answered somewhere in the working. This catches a
  // worked example that drifts from its own question, which no equation check
  // would notice because each line can be internally consistent and still wrong.
  let checked = 0;
  const bad = [];

  for (const t of TIPS) {
    if (!t.skill.startsWith("arith.")) continue;
    for (const lang of ["en", "vi"]) {
      for (const ex of getTip(t.id, lang).examples) {
        // Take the maths out of the question: "What is 48 × 5?" → "48 × 5"
        // Only questions that actually compute something. "the cube root of 5,832"
        // and "18% of 50" both leave a bare number once the words are stripped,
        // and that number is the input, not the answer.
        const runs = (ex.ask.match(RUN) || [])
          .filter((r) => !/[=≈]/.test(r) && /[+\-−*×·/÷^]/.test(r));
        const value = runs.map((r) => evaluate(r.trim(), lang)).find((v) => v !== null);
        if (value === undefined) continue;

        // A fraction question may be answered as a percentage, so accept both.
        const forms = [value, value * 100];
        const asText = forms.flatMap((v) => {
          const dec = lang === "vi" ? "," : ".";
          if (Number.isInteger(v)) return [String(v), v.toLocaleString(lang === "vi" ? "de-DE" : "en-US")];
          return [String(v), String(Math.round(v * 1000) / 1000).replace(".", dec),
                  String(Math.round(v * 10) / 10).replace(".", dec)];
        });
        const stripped = ex.work.replace(/[.,](?=\d{3}\b)/g, "");
        if (!asText.some((s) => ex.work.includes(s) || stripped.includes(s.replace(/[.,]/g, "")))) {
          bad.push(`${t.id} (${lang}): "${ex.ask}" works out to ${value}, absent from — ${ex.work}`);
        }
        checked++;
      }
    }
  }

  console.log(`    confirmed ${checked} arithmetic examples answer their own question`);
  assert.deepEqual(bad, [], `${bad.length} examples never reach their answer`);
  assert.ok(checked > 10, `only ${checked} examples had a computable question`);
});

test("the two languages of a card agree on every number", () => {
  // A translated example is a place for a digit to change. Compare the numbers
  // each language prints, ignoring how they are punctuated.
  const bad = [];
  const numbers = (text, lang) => {
    const thousands = lang === "vi" ? /\.(?=\d{3}\b)/g : /,(?=\d{3}\b)/g;
    const decimal = lang === "vi" ? /,(?=\d)/g : /\.(?=\d)/g;
    return (text.replace(thousands, "").replace(decimal, ".").match(/\d+(?:\.\d+)?/g) || [])
      .map(Number).sort((a, b) => a - b);
  };

  for (const t of TIPS) {
    const en = getTip(t.id, "en");
    const vi = getTip(t.id, "vi");
    assert.equal(en.examples.length, vi.examples.length, `${t.id}: different number of examples`);
    en.examples.forEach((e, i) => {
      for (const field of ["ask", "work"]) {
        // Compare which numbers appear, not how often: a translation may repeat
        // one for clarity ("divide both sides by it" vs "chia cho 8").
        const a = [...new Set(numbers(e[field], "en"))];
        const b = [...new Set(numbers(vi.examples[i][field], "vi"))];
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          bad.push(`${t.id} example ${i + 1} ${field}: en ${a.join(",")} vs vi ${b.join(",")}`);
        }
      }
    });
  }
  assert.deepEqual(bad, [], `${bad.length} cards where the translation changed a number`);
});
