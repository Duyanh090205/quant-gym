/**
 * A paper must not ask the same question twice.
 *
 * `generateSet` deliberately repeats rather than hand back a short paper, on the
 * grounds that a short paper silently changes what the class was scored out of.
 * That is the right call, but it makes a thin skill fail quietly: the curriculum
 * asks for eight questions, the generator can only build two, and nobody notices
 * because every question is individually correct.
 *
 * What it costs the student is not boredom. A level whose paper is one question
 * repeated eight times can only be scored 8/8 or 0/8, so the pass mark stops
 * measuring anything: understand it and you sail through, miss it and you fail
 * with no partial credit, on a single idea.
 *
 * So this compares what each skill can actually build against what the
 * curriculum asks it for. Skills still short of their own target are listed
 * below with the number they currently reach, which keeps the gap visible and
 * makes it fail if it ever gets worse — or if it gets fixed and the entry is
 * left behind.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSet, ALL_SKILLS, getSkill } from "../src/engine/index.js";

/**
 * Empty, and meant to stay that way. It is here so that a skill added later can
 * be landed honestly while its pool is still being filled out: put it here with
 * the number it reaches, and the gap is recorded rather than hidden. The second
 * test below then refuses to let the entry rot — it fails if the pool shrinks
 * further, and it fails once the pool is big enough and the entry is still
 * listed. An empty object means every skill currently fills its own paper.
 *
 *   "prob.example|2": 4,   // why it is thin, and what would open it up
 */
const KNOWN_THIN = {
};

/** How many questions the app will ask of this skill at this level. */
const asked = (skill, level) => {
  const sk = getSkill(skill);
  return Math.max(sk.drill, sk.levels[level - 1].count);
};

test("every skill can fill its own paper without repeating a question", () => {
  const short = [];
  let checked = 0;

  for (const s of ALL_SKILLS) {
    for (const level of [1, 2, 3]) {
      const need = asked(s.id, level);
      const { distinct } = generateSet({ skill: s.id, level, count: need, seed: `pool|${s.id}|${level}` });
      const key = `${s.id}|${level}`;
      if (key in KNOWN_THIN) continue;
      checked++;
      if (distinct < need) short.push(`${key}: ${distinct} distinct questions for a paper of ${need}`);
    }
  }

  assert.deepEqual(short.slice(0, 8), [],
    `${short.length} skill-levels repeat a question inside one sitting`);
  console.log(`    ${checked} skill-levels can fill their own paper; ${Object.keys(KNOWN_THIN).length} known thin`);
});

test("the list of thin skills is neither out of date nor getting worse", () => {
  for (const [key, was] of Object.entries(KNOWN_THIN)) {
    const [skill, level] = [key.split("|")[0], Number(key.split("|")[1])];
    const need = asked(skill, level);
    const { distinct } = generateSet({ skill, level, count: need, seed: `pool|${skill}|${level}` });

    assert.ok(distinct >= was,
      `${key} has shrunk: ${distinct} distinct questions, was ${was}`);
    assert.ok(distinct < need,
      `${key} now builds ${distinct} of the ${need} it needs — remove it from KNOWN_THIN`);
    assert.equal(distinct, was,
      `${key} builds ${distinct} now, not ${was} — update the number if this was deliberate`);
  }
});

test("a paper says how much of it is really different", () => {
  // `distinct` is what makes the check above possible, so a host integrating the
  // engine can run the same check. It has to be present and honest.
  const { questions, distinct } = generateSet({ skill: "prob.classics", level: 1, count: 8, seed: "distinct" });
  const actual = new Set(questions.map((q) => q.prompt)).size;
  assert.equal(distinct, actual, `the paper reports ${distinct} distinct questions but holds ${actual}`);
});
