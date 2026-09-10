/**
 * Print a sample paper for every skill, with answers and traps.
 * Useful for reviewing question quality without opening a browser.
 *
 *   node scripts/sample.mjs                  every skill, level 2
 *   node scripts/sample.mjs prob.bayes 3 10  one skill, one level, ten questions
 */

import { generateSet, ALL_SKILLS, displayAnswer, skillName } from "../src/engine/index.js";

const [skillArg, levelArg, countArg] = process.argv.slice(2);
const skills = skillArg ? [skillArg] : ALL_SKILLS.map((s) => s.id);
const level = Number(levelArg) || 2;
const count = Number(countArg) || 6;

for (const skill of skills) {
  console.log("\n" + "=".repeat(78));
  console.log(`${skillName(skill)}  ·  ${skill}  ·  level ${level}`);
  console.log("=".repeat(78));
  const { questions } = generateSet({ skill, level, count, seed: "sample" });
  questions.forEach((q, i) => {
    const opts = q.options ? "   " + q.options.map((o, j) => `(${"abcde"[j]}) ${o}`).join("  ") : "";
    console.log(`\n${String(i + 1).padStart(2)}. ${q.prompt}${opts}`);
    console.log(`    answer: ${displayAnswer(q)}`);
    for (const t of q.traps || []) {
      console.log(`    trap ${String(t.value).padEnd(10)} ${t.why}`);
    }
  });
}
