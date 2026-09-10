/**
 * A sequence question must have one defensible answer.
 *
 * This is the standard complaint about these tests, and it is usually fair:
 * `2, 4, 8, 16` continues as 32 if you read doubling and as 22 if you read a
 * quadratic through the same four points, and both readings are honest. A
 * student who finds the second one and is marked wrong has learned nothing
 * except that the test is unreliable.
 *
 * So these fit the rules a student would actually try, and fail if two of them
 * explain the terms on screen while disagreeing about the answer.
 *
 * Nothing here checks the engine against itself. The models are written from
 * scratch, and they do not know which family produced the question.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSet } from "../src/engine/index.js";

const eq = (a, b) => Math.abs(a - b) < 1e-9;

/** Read the numbers out of a prompt, dropping the trailing question mark. */
function termsOf(prompt) {
  return String(prompt)
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((v) => !Number.isNaN(v));
}

/**
 * Every simple rule that explains these terms, each with what it predicts next.
 * Deliberately the rules a fifteen-year-old reaches for, not every rule that
 * could be fitted: an eight-degree polynomial explains anything and teaches
 * nobody.
 */
function models(ts) {
  const out = [];
  const n = ts.length;

  const d = ts[1] - ts[0];
  if (ts.every((v, i) => i === 0 || eq(v - ts[i - 1], d))) out.push(["arithmetic", ts[n - 1] + d]);

  if (ts[0] !== 0 && ts.every((v, i) => i === 0 || ts[i - 1] !== 0)) {
    const r = ts[1] / ts[0];
    if (ts.every((v, i) => i === 0 || eq(v, ts[i - 1] * r))) out.push(["geometric", ts[n - 1] * r]);
  }

  if (n >= 4) {
    const gaps = ts.slice(1).map((v, i) => v - ts[i]);
    const dd = gaps[1] - gaps[0];
    if (gaps.every((v, i) => i === 0 || eq(v - gaps[i - 1], dd))) {
      out.push(["quadratic", ts[n - 1] + gaps[n - 2] + dd]);
    }
  }

  if (n >= 4 && ts.slice(2).every((v, i) => eq(v, ts[i] + ts[i + 1]))) {
    out.push(["Fibonacci", ts[n - 2] + ts[n - 1]]);
  }

  if (n >= 4 && ts[1] !== ts[0]) {
    const a = (ts[2] - ts[1]) / (ts[1] - ts[0]);
    const b = ts[1] - a * ts[0];
    if (isFinite(a) && ts.every((v, i) => i === 0 || eq(v, a * ts[i - 1] + b))) {
      out.push(["affine", a * ts[n - 1] + b]);
    }
  }

  return out;
}

test("no find-the-rule question admits two different next terms", () => {
  let examined = 0;
  const ambiguous = [];

  for (const level of [1, 2, 3]) {
    const { questions } = generateSet({ skill: "seq.find-rule", level, count: 400, seed: `amb|${level}` });
    for (const q of questions) {
      if (typeof q.answer !== "number") continue;   // letter sequences are checked below
      const ts = termsOf(q.prompt);
      if (ts.length < 4) continue;
      examined++;
      const fits = models(ts);
      const nexts = [...new Set(fits.map((m) => Math.round(m[1] * 1e9) / 1e9))];
      if (nexts.length > 1) {
        ambiguous.push(`L${level}: ${q.prompt} — ${fits.map((m) => `${m[0]} says ${m[1]}`).join(", ")}`);
      }
    }
  }

  console.log(`    examined ${examined} numeric sequences for competing rules`);
  assert.deepEqual(ambiguous.slice(0, 5), [], `${ambiguous.length} sequences have more than one defensible answer`);
  assert.ok(examined > 600, `only ${examined} examined`);
});

test("a fitted rule that explains the terms also gives the stated answer", () => {
  // Stronger than the above: when a simple rule does explain the sequence, the
  // engine's own answer has to agree with it. A mismatch means the intended
  // rule and the obvious one are different, which is the same unfairness by
  // another route.
  let agreed = 0;
  const disagreed = [];

  for (const level of [1, 2, 3]) {
    const { questions } = generateSet({ skill: "seq.find-rule", level, count: 400, seed: `agree|${level}` });
    for (const q of questions) {
      if (typeof q.answer !== "number") continue;
      const ts = termsOf(q.prompt);
      if (ts.length < 4) continue;
      for (const [name, next] of models(ts)) {
        if (!eq(next, q.answer)) {
          disagreed.push(`L${level}: ${q.prompt} answers ${q.answer}, but ${name} gives ${next}`);
        } else {
          agreed++;
        }
      }
    }
  }

  assert.deepEqual(disagreed.slice(0, 5), [], `${disagreed.length} sequences disagree with a rule that fits them`);
  console.log(`    ${agreed} sequences confirmed against an independently fitted rule`);
  assert.ok(agreed > 200, `only ${agreed} confirmed`);
});

test("an odd-one-out question has only one term that can be the odd one", () => {
  // For each position, ask whether the *other* terms lie on a simple rule. If
  // two positions both qualify, two students can defend different answers and
  // only one of them gets the mark.
  const fitsWithout = (ts, skip) => {
    const kept = ts.map((v, i) => [i, v]).filter(([i]) => i !== skip);
    const [i0, v0] = kept[0];
    const [i1, v1] = kept[1];

    // linear in index: v = v0 + slope * (i - i0)
    const slope = (v1 - v0) / (i1 - i0);
    if (kept.every(([i, v]) => eq(v, v0 + slope * (i - i0)))) return true;

    // geometric in index
    if (v0 !== 0) {
      const ratio = (v1 / v0) ** (1 / (i1 - i0));
      if (isFinite(ratio) && ratio !== 0 && kept.every(([i, v]) => eq(v, v0 * ratio ** (i - i0)))) return true;
    }

    // quadratic in index, solved from the first three kept points
    if (kept.length >= 4) {
      const [[x1, y1], [x2, y2], [x3, y3]] = kept;
      const den = (x1 - x2) * (x1 - x3) * (x2 - x3);
      if (den !== 0) {
        const a = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / den;
        const b = (x3 * x3 * (y1 - y2) + x2 * x2 * (y3 - y1) + x1 * x1 * (y2 - y3)) / den;
        const c = (x2 * x3 * (x2 - x3) * y1 + x3 * x1 * (x3 - x1) * y2 + x1 * x2 * (x1 - x2) * y3) / den;
        if (kept.every(([i, v]) => eq(v, a * i * i + b * i + c))) return true;
      }
    }
    return false;
  };

  let examined = 0;
  const ambiguous = [];

  for (const level of [1, 2, 3]) {
    const { questions } = generateSet({ skill: "seq.odd-one-out", level, count: 300, seed: `oddamb|${level}` });
    for (const q of questions) {
      const ts = q.terms.map(Number);
      if (ts.some(Number.isNaN) || ts.length < 6) continue;   // letter sequences
      examined++;
      const candidates = ts.map((_, i) => i).filter((i) => fitsWithout(ts, i));
      if (candidates.length > 1) {
        ambiguous.push(`L${level}: ${q.prompt} — positions ${candidates.map((i) => i + 1).join(" and ")} both work`);
      }
    }
  }

  console.log(`    examined ${examined} numeric odd-one-out questions`);
  assert.deepEqual(ambiguous.slice(0, 5), [], `${ambiguous.length} odd-one-out questions have two defensible answers`);
  assert.ok(examined > 400, `only ${examined} examined`);
});
