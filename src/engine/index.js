/**
 * Quant Gym engine, public API.
 *
 * No DOM, no framework, no dependencies. Give it a skill, a level and a seed;
 * it gives you questions as plain objects. Render them however you like, or use
 * the React module in `src/ui`.
 *
 *   import { generateSet, gradeSet } from "quant-gym/engine";
 *
 *   const paper = generateSet({ skill: "prob.bayes", level: 2, count: 8, seed: "QG-7A3F" });
 *   const marked = gradeSet(paper.questions, ["1/2", "0.6", ...]);
 */

import { makeRng, makeCode, hashSeed } from "./rng.js";
import { ARITHMETIC } from "./arithmetic.js";
import { SEQUENCES } from "./sequences.js";
import { PROBABILITY } from "./probability.js";
import { CURRICULUM, EXAMS, ALL_SKILLS, getSkill, nextSkill, skillName, SKILL_ORDER } from "./curriculum.js";
import { TIPS, getTip, tipsForSkill } from "./tips.js";
import { grade, gradeSet, displayAnswer } from "./grade.js";
import { frac, fmt, parseAnswer } from "./format.js";

/* Weights inside the two "mixed" pseudo-skills, tuned to the real Maven paper:
   arithmetic is dominated by add/subtract and multiplication, and probability
   spreads evenly across the seven ideas. */
const MIXED = {
  "arith.mixed": [
    ["arith.add-subtract", 22], ["arith.multiply", 18], ["arith.divide", 10],
    ["arith.percent", 12], ["arith.fractions", 9], ["arith.squares", 8],
    ["arith.roots", 7], ["arith.puzzles", 9], ["arith.estimate", 5],
  ],
  "prob.mixed": [
    ["prob.counting", 16], ["prob.expected-value", 16], ["prob.conditional", 14],
    ["prob.bayes", 14], ["prob.waiting-time", 14], ["prob.symmetry", 13],
    ["prob.classics", 13],
  ],
  "seq.mixed": [["seq.find-rule", 50], ["seq.odd-one-out", 50]],
};

const GENERATORS = { ...ARITHMETIC, ...SEQUENCES, ...PROBABILITY };

function pickWeighted(rng, pairs) {
  const total = pairs.reduce((a, p) => a + p[1], 0);
  let r = rng.float() * total;
  for (const [id, w] of pairs) {
    r -= w;
    if (r <= 0) return id;
  }
  return pairs[0][0];
}

function resolve(skillId, rng) {
  if (MIXED[skillId]) return pickWeighted(rng, MIXED[skillId]);
  return skillId;
}

/** Every id `generate` accepts, including the mixed pseudo-skills. */
export const GENERATOR_IDS = [...Object.keys(GENERATORS), ...Object.keys(MIXED)];

/**
 * One question.
 *
 * @param {string} skillId  e.g. "prob.bayes", or "arith.mixed"
 * @param {1|2|3} level
 * @param {string|number} seed  same seed, same question
 */
export function generate(skillId, level = 1, seed = Math.random()) {
  const rng = makeRng(`${skillId}|${level}|${seed}`);
  return build(skillId, level, rng, 0);
}

function build(skillId, level, rng, index) {
  const resolved = resolve(skillId, rng);
  const gen = GENERATORS[resolved];
  if (!gen) throw new Error(`Unknown skill: ${skillId}`);
  const lv = Math.min(3, Math.max(1, level | 0));
  const raw = gen(rng, lv);
  const topic = resolved.split(".")[0];
  const qn = {
    id: `${resolved}.L${lv}#${index}`,
    skill: resolved,
    requested: skillId,
    topic: topic === "arith" ? "arithmetic" : topic === "seq" ? "sequences" : "probability",
    level: lv,
    format: "number",
    traps: [],
    solution: null,
    ...raw,
  };
  qn.traps = cleanTraps(qn);
  return qn;
}

/**
 * Drop any trap that marking could not tell apart from the right answer, and
 * any duplicate. Generators build traps from formulas, so for small parameters
 * a "wrong route" sometimes lands exactly on the answer: 2 × 2 = 4 and
 * "added instead of multiplied" is also 4. Left in, that trap would either mark
 * a correct answer wrong or explain a right answer as a mistake.
 */
function cleanTraps(qn) {
  if (!qn.traps?.length || typeof qn.answer !== "number") return qn.traps || [];
  const tol = qn.approx ? 0.05 * Math.abs(qn.answer) : 0.0051;
  const seen = new Set();
  return qn.traps.filter((t) => {
    if (t == null || !isFinite(t.value)) return false;
    if (Math.abs(t.value - qn.answer) <= tol) return false;
    const key = Math.round(t.value * 10000);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * A whole paper, with no repeated prompt and a cap of `Math.ceil(count/6)`
 * questions from any one skill, so a mixed paper is never nine divisions.
 *
 * @returns {{seed:string, code:string, skill:string, level:number,
 *            seconds:number|null, questions:object[]}}
 */
export function generateSet({ skill, level = 1, count = 10, seed, seconds = null }) {
  const useSeed = seed ?? makeCode();
  const rng = makeRng(`${skill}|${level}|${useSeed}`);
  const cap = Math.max(2, Math.ceil(count / 6));

  const questions = [];
  const seen = new Set();
  const perSkill = {};

  for (let guard = 0; questions.length < count && guard < count * 120; guard++) {
    const qn = build(skill, level, rng, questions.length);
    if (seen.has(qn.prompt)) continue;
    if (MIXED[skill] && (perSkill[qn.skill] || 0) >= cap) continue;
    seen.add(qn.prompt);
    perSkill[qn.skill] = (perSkill[qn.skill] || 0) + 1;
    questions.push(qn);
  }
  // If the pool ran dry, lift the per-skill cap before giving up on variety.
  for (let guard = 0; questions.length < count && guard < count * 200; guard++) {
    const qn = build(skill, level, rng, questions.length);
    if (seen.has(qn.prompt)) continue;
    seen.add(qn.prompt);
    questions.push(qn);
  }
  const distinct = questions.length;
  // Last resort: a narrow skill at level 1 may simply not have `count` distinct
  // questions in it. Repeating one is better than handing back a short paper,
  // because a short paper silently changes what the class was scored out of.
  while (questions.length < count) {
    const qn = build(skill, level, rng, questions.length);
    questions.push(qn);
  }

  return { seed: String(useSeed), code: makeCode(useSeed), skill, level, seconds, questions, distinct };
}

/** Build an exam from `EXAMS`, one generated part per entry. */
export function generateExam(examId, seed = makeCode()) {
  const exam = EXAMS.find((e) => e.id === examId);
  if (!exam) throw new Error(`Unknown exam: ${examId}`);
  return {
    id: exam.id,
    name: exam.name,
    note: exam.note,
    seed: String(seed),
    code: makeCode(seed),
    parts: exam.parts.map((p, i) =>
      generateSet({ ...p, seed: `${seed}|part${i}`, seconds: p.seconds })
    ),
  };
}

export {
  CURRICULUM, EXAMS, ALL_SKILLS, SKILL_ORDER, getSkill, nextSkill, skillName,
  TIPS, getTip, tipsForSkill,
  grade, gradeSet, displayAnswer,
  makeRng, makeCode, hashSeed,
  frac, fmt, parseAnswer,
};
