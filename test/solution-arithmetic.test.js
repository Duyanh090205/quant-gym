/**
 * Check the arithmetic inside every generated worked solution.
 *
 * The tip cards were verified this way already, but they are twenty-four hand
 * written cards. The generated solutions are the far bigger surface: thousands
 * of worked lines, assembled from templates at run time, in two languages, and
 * nothing was reading them. A template that adds a step wrongly would print a
 * false equation on every question it touches, and the only test looking at
 * solutions checked that the final answer appears somewhere in the text.
 *
 * So this evaluates both sides of every equation the engine prints, in both
 * languages, across every skill and level.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSet, ALL_SKILLS } from "../src/engine/index.js";
import { checkEquations } from "./helpers/mathtext.js";

const SKILLS = ALL_SKILLS.map((s) => s.id);
const LEVELS = [1, 2, 3];

test("every equation a worked solution prints is true", () => {
  let checked = 0, unreadable = 0;
  const bad = [];

  for (const lang of ["en", "vi"]) {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        const { questions } = generateSet({ skill, level, count: 40, seed: `sol|${skill}|${level}`, lang });
        for (const q of questions) {
          const r = checkEquations(q.solution, lang, `${skill} L${level} (${lang}) "${q.prompt}"`);
          checked += r.checked;
          unreadable += r.unreadable;
          bad.push(...r.bad);
        }
      }
    }
  }

  console.log(`    checked ${checked} equations inside generated solutions, both languages` +
              `; ${unreadable} runs were not expressions`);
  assert.deepEqual(bad.slice(0, 6), [], `${bad.length} false equations printed by solutions`);
  assert.ok(checked > 3000, `only ${checked} equations checked`);
  assert.ok(unreadable / (checked + unreadable) < 0.25,
    `${unreadable} of ${checked + unreadable} runs could not be read`);
});

test("every equation a trap explanation prints is true", () => {
  // Traps quote the student's own numbers back at them. A wrong figure here is
  // worse than no explanation: it teaches the mistake it is supposed to correct.
  let checked = 0;
  const bad = [];

  for (const lang of ["en", "vi"]) {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        const { questions } = generateSet({ skill, level, count: 30, seed: `trapmath|${skill}|${level}`, lang });
        for (const q of questions) {
          for (const tr of q.traps || []) {
            const r = checkEquations(tr.why, lang, `${skill} (${lang}) trap ${tr.value}`);
            checked += r.checked;
            bad.push(...r.bad);
          }
          if (q.note) {
            const r = checkEquations(q.note, lang, `${skill} (${lang}) note`);
            checked += r.checked;
            bad.push(...r.bad);
          }
        }
      }
    }
  }

  console.log(`    checked ${checked} equations inside trap explanations`);
  assert.deepEqual(bad.slice(0, 6), [], `${bad.length} false equations printed by traps`);
  assert.ok(checked > 300, `only ${checked} equations checked`);
});

test("a solution never contradicts the answer it is explaining", () => {
  // The last figure a solution states should be the answer. Catches a template
  // whose steps are each valid but which ends somewhere else entirely.
  const bad = [];
  let checked = 0;

  for (const lang of ["en", "vi"]) {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        const { questions } = generateSet({ skill, level, count: 30, seed: `last|${skill}|${level}`, lang });
        for (const q of questions) {
          if (typeof q.answer !== "number" || q.approx) continue;
          const decimal = lang === "vi" ? /,(?=\d)/g : /\.(?=\d)/g;
          const figures = (String(q.solution).replace(decimal, ".").match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
          if (!figures.length) continue;
          // One of the last few figures has to be the answer — a solution that
          // reaches it halfway and then wanders off ends on the wrong number.
          // A probability solution often finishes as a ratio rather than a
          // decimal ("1 out of 6", "12/51"), so a pair counts too.
          const tail = figures.slice(-4);
          const near = (v) => Math.abs(v - q.answer) <= Math.max(0.005, Math.abs(q.answer) * 1e-9);
          const asRatio = tail.some((v, i) =>
            i + 1 < tail.length && tail[i + 1] !== 0 && near(v / tail[i + 1]));
          if (!tail.some(near) && !asRatio) {
            bad.push(`${skill} L${level} (${lang}): "${q.prompt}" answers ${q.answer}, solution ends ${tail.join(", ")}`);
          }
          checked++;
        }
      }
    }
  }

  assert.deepEqual(bad.slice(0, 6), [], `${bad.length} solutions do not end on their own answer`);
  assert.ok(checked > 1500, `only ${checked} checked`);
});
