/**
 * The two languages must be the same questions.
 *
 * A translation is the easiest place in the whole engine to break something
 * quietly: change a number, drop a negation, leave half a sentence in English,
 * or produce a Vietnamese prompt whose answer no longer matches the English one.
 * None of that shows up in an ordinary run, because the tests read English.
 *
 * So these check the pair directly. Same seed, same question, both languages:
 * every number the same, every answer the same, every trap the same, and no
 * English words left in the Vietnamese.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSet, generateExam, generateReview, ALL_SKILLS, TEXT, grade, displayAnswer } from "../src/engine/index.js";

const SKILLS = ALL_SKILLS.map((s) => s.id);
const LEVELS = [1, 2, 3];

/** Every number a string prints, read with that language's decimal mark. */
function numbers(text, lang) {
  const decimal = lang === "vi" ? /,(?=\d)/g : /\.(?=\d)/g;
  return (String(text).replace(decimal, ".").match(/\d+(?:\.\d+)?/g) || []).map(Number);
}

test("the phrasebook says the same things in both languages", () => {
  const leaves = (o, prefix = "") =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === "object" && !Array.isArray(v) ? leaves(v, `${prefix}${k}.`) : [`${prefix}${k}`]);
  const en = leaves(TEXT.en).sort();
  const vi = leaves(TEXT.vi).sort();
  assert.deepEqual(vi, en, "the two halves of the phrasebook have drifted apart");

  // And an entry that takes arguments in one language must take them in the other,
  // or a call site will silently print "[object Object]" or a bare function.
  const mismatched = [];
  const walk = (a, b, prefix = "") => {
    for (const [k, v] of Object.entries(a)) {
      const w = b[k];
      if (typeof v !== typeof w) mismatched.push(`${prefix}${k}: ${typeof v} vs ${typeof w}`);
      else if (typeof v === "function" && v.length !== w.length) mismatched.push(`${prefix}${k}: takes ${v.length} vs ${w.length} arguments`);
      else if (v && typeof v === "object" && !Array.isArray(v)) walk(v, w, `${prefix}${k}.`);
    }
  };
  walk(TEXT.en, TEXT.vi);
  assert.deepEqual(mismatched, [], "phrasebook entries disagree about their shape");
});

test("changing language never changes the answer", () => {
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      const en = generateSet({ skill, level, count: 25, seed: `bi|${skill}|${level}`, lang: "en" });
      const vi = generateSet({ skill, level, count: 25, seed: `bi|${skill}|${level}`, lang: "vi" });
      assert.equal(vi.questions.length, en.questions.length);
      en.questions.forEach((q, i) => {
        const w = vi.questions[i];
        assert.equal(w.skill, q.skill, `${skill}: different skill at ${i}`);
        assert.deepEqual(w.answer, q.answer, `${skill} L${level} #${i}: answers differ — ${q.prompt} / ${w.prompt}`);
        assert.equal(w.tip, q.tip, `${skill}: different tip at ${i}`);
        assert.equal(w.format, q.format, `${skill}: different format at ${i}`);
        assert.deepEqual(
          (w.traps || []).map((x) => x.value),
          (q.traps || []).map((x) => x.value),
          `${skill} L${level} #${i}: traps differ`
        );
      });
    }
  }
});

test("a prompt prints the same numbers in both languages", () => {
  const bad = [];
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      const en = generateSet({ skill, level, count: 25, seed: `nums|${skill}|${level}`, lang: "en" });
      const vi = generateSet({ skill, level, count: 25, seed: `nums|${skill}|${level}`, lang: "vi" });
      en.questions.forEach((q, i) => {
        const w = vi.questions[i];
        const a = numbers(q.prompt, "en").sort((x, y) => x - y);
        const b = numbers(w.prompt, "vi").sort((x, y) => x - y);
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          bad.push(`${skill} L${level}: "${q.prompt}" vs "${w.prompt}"`);
        }
      });
    }
  }
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} prompts print different numbers in the two languages`);
});

test("a Vietnamese answer is accepted by a Vietnamese question", () => {
  // Grading is language-neutral, but a Vietnamese student types 0,5 rather than
  // 0.5, and the question they read shows it that way.
  for (const skill of SKILLS) {
    const { questions } = generateSet({ skill, level: 2, count: 20, seed: `mark|${skill}`, lang: "vi" });
    for (const q of questions) {
      if (typeof q.answer !== "number") continue;
      const asVi = String(q.answer).replace(".", ",");
      assert.ok(grade(q, asVi).correct, `${skill}: Vietnamese decimal ${asVi} rejected for "${q.prompt}"`);
      assert.ok(grade(q, String(q.answer)).correct, `${skill}: plain decimal rejected for "${q.prompt}"`);
    }
  }
});

test("the answer is shown in the question's own language", () => {
  // A Vietnamese question whose working says 0,51 must not answer itself 0.51.
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 25, seed: `show|${skill}|${level}`, lang: "vi" });
      for (const q of questions) {
        if (typeof q.answer !== "number" || Number.isInteger(q.answer)) continue;
        const shown = displayAnswer(q);
        assert.ok(!/\d\.\d/.test(shown),
          `${skill}: Vietnamese answer shown with an English decimal point — ${shown}`);
      }
    }
  }
});

test("no English is left in a Vietnamese question", () => {
  // Words that would only appear if a string was never translated. Kept narrow
  // on purpose: the sequence families print English month and day names by
  // design, because the real paper is in English and recognising them is the
  // skill being tested.
  const ENGLISH = /\b(the|and|with|from|chance|probability|expected|each|every|which|answer|number|times|roll|flip|draw|card|coin|dice|die)\b/i;
  const ALLOWED = /January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth/g;
  const bad = [];
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 30, seed: `eng|${skill}|${level}`, lang: "vi" });
      for (const q of questions) {
        for (const field of ["prompt", "solution", "note"]) {
          const text = String(q[field] || "").replace(ALLOWED, "");
          if (ENGLISH.test(text)) bad.push(`${skill}.${field}: ${text.slice(0, 90)}`);
        }
        for (const tr of q.traps || []) {
          if (ENGLISH.test(String(tr.why))) bad.push(`${skill}.trap: ${String(tr.why).slice(0, 90)}`);
        }
      }
    }
  }
  assert.deepEqual(bad.slice(0, 6), [], `${bad.length} Vietnamese strings still contain English`);
});

test("Vietnamese never writes a coordinate pair with a comma", () => {
  // (1,4) reads as one-point-four to a Vietnamese student, so pairs use a
  // semicolon. This is the bug that a bilingual test exists to catch.
  const bad = [];
  for (const skill of SKILLS.filter((s) => s.startsWith("prob."))) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `pair|${skill}|${level}`, lang: "vi" });
      for (const q of questions) {
        const text = `${q.prompt} ${q.solution}`;
        if (/\(\d+,\s*\d+\)/.test(text)) bad.push(`${skill}: ${text.match(/\(\d+,\s*\d+\)/)[0]} in "${q.prompt.slice(0, 50)}"`);
      }
    }
  }
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} Vietnamese strings write a pair with a comma`);
});

test("exams and reviews carry the language through", () => {
  const exam = generateExam("maven-round-1", "lang", "vi");
  for (const part of exam.parts) {
    assert.equal(part.lang, "vi");
    for (const q of part.questions) assert.equal(q.lang, "vi");
  }
  const stats = { "arith.multiply|3": { seen: 20, correct: 8 }, "prob.bayes|2": { seen: 20, correct: 7 } };
  const review = generateReview({ stats, count: 8, seed: "lang", lang: "vi" });
  assert.equal(review.lang, "vi");
  for (const q of review.questions) assert.equal(q.lang, "vi");
});
