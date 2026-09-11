/**
 * Estimation answers, re-derived from the question rather than from the code.
 *
 * The probability questions get two independent checks: a formula written
 * separately, and a simulation that plays the game. Neither transfers here.
 * There is nothing to simulate — an estimation question is a chain of factors,
 * not a random experiment — so the check that matters is the other one: read
 * the numbers back out of the sentence the student sees, multiply them the way
 * the sentence says, and insist the engine agrees.
 *
 * The conversions below are written from scratch. Sixty seconds in a minute is
 * not something the engine gets to define.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSet } from "../src/engine/index.js";

const MIN = 60;
const HOUR = 60 * MIN;          // 3600 seconds
const DAY = 24 * HOUR;          // 86400 seconds
const YEAR_DAYS = 365;
const YEAR_MIN = YEAR_DAYS * 24 * MIN;   // 525600 minutes

/** How many of the small unit sit inside one of the big one. */
const PER = {
  "seconds|minutes": 60,
  "minutes|hours": 60,
  "hours|days": 24,
  "days|weeks": 7,
  "months|years": 12,
  "grams|kilograms": 1000,
  "metres|kilometres": 1000,
  "millilitres|litres": 1000,
  "centimetres|metres": 100,
  "millimetres|centimetres": 10,
};

/** The answer this sentence asks for, or null if the sentence is unknown. */
function derive(p) {
  let m;

  /* scale — one conversion */
  if ((m = p.match(/^How many (\w+) in (\d+) (\w+)\?$/))) {
    const per = PER[`${m[1]}|${m[3]}`];
    return per === undefined ? null : per * +m[2];
  }

  /* scale — a rate over a stretch of time */
  if ((m = p.match(/^A heart beats (\d+) times a minute\. About how many beats in an hour/))) return +m[1] * MIN;
  if ((m = p.match(/^A heart beats (\d+) times a minute\. About how many beats in a year/))) return +m[1] * YEAR_MIN;
  if ((m = p.match(/^You breathe (\d+) times a minute\. About how many breaths in a year/))) return +m[1] * YEAR_MIN;
  if ((m = p.match(/^A tap runs at (\d+) litres a minute\. How many litres in (\d+) hours/))) return +m[1] * MIN * +m[2];
  if ((m = p.match(/^You read (\d+) words a minute\. About how many words in (\d+) hours/))) return +m[1] * MIN * +m[2];
  if ((m = p.match(/^A car travels at (\d+) kilometres an hour\. How far does it go in (\d+) hours/))) return +m[1] * +m[2];
  if ((m = p.match(/^A machine makes (\d+) parts an hour\. How many does it make in a (\d+)-hour shift/))) return +m[1] * +m[2];
  if ((m = p.match(/^A tap drips (\d+) times a second\. About how many drips in an hour/))) return +m[1] * HOUR;
  if ((m = p.match(/^You sleep (\d+) hours a night\. About how many hours of sleep is that in a year/))) return +m[1] * YEAR_DAYS;
  if ((m = p.match(/^Light travels 300 thousand kilometres a second\. About how far does it go in (\d+) minutes/))) {
    return +m[1] * MIN * 300;     // answer is in thousands of kilometres
  }
  if ((m = p.match(/^A river carries (\d+) cubic metres .*every second\. About how much passes in a day/))) {
    return +m[1] * DAY;
  }

  /* fermi — two factors */
  if ((m = p.match(/^A school has (\d+) students and each drinks (\d+) cups/))) return +m[1] * +m[2];
  if ((m = p.match(/^A street has (\d+) houses, each with about (\d+) windows/))) return +m[1] * +m[2];
  if ((m = p.match(/^In a group of (\d+) people, each person sends about (\d+) messages/))) return +m[1] * +m[2];
  if ((m = p.match(/^A depot keeps (\d+) buses with (\d+) seats each/))) return +m[1] * +m[2];
  if ((m = p.match(/^A library has (\d+) shelves holding about (\d+) books each/))) return +m[1] * +m[2];

  /* fermi - a chain, sometimes through a division. Several of these hand over a
     number that is not needed, and withhold one that is; the arithmetic below
     supplies the missing one and ignores the spare, exactly as a student must. */
  if ((m = p.match(/^One piano tuner looks after (\d+) pianos a year\. A city of (\d+) thousand people has (\d+) music shops, and about 1 person in (\d+) owns a piano/))) {
    const [S, P2, A] = [+m[1], +m[2], +m[4]];      // m[3], the shops, is spare
    return (P2 * 1000) / A / S;
  }
  if ((m = p.match(/^A town of (\d+) thousand people owns (\d+) cars\. A car burns (\d+) litres of fuel every 100 kilometres, and covers about (\d+) kilometres a month/))) {
    const [N, L, K] = [+m[2], +m[3], +m[4]];       // m[1], the population, is spare
    return (N * K * 12 * L) / 100;                 // 12 months is not in the question
  }
  if ((m = p.match(/^A coffee shop has (\d+) tables\. It sells about (\d+) cups an hour, opens (\d+) hours a day and trades (\d+) days a week/))) {
    return +m[2] * +m[3] * +m[4];                  // m[1], the tables, is spare
  }
  if ((m = p.match(/^A room is (\d+) metres by (\d+) metres and (\d+) metres high, and (\d+) tiles cover a square metre/))) {
    return +m[1] * +m[2] * +m[4];                  // m[3], the ceiling, is spare
  }
  if ((m = p.match(/^A shipping container measures (\d+) metres by (\d+) metres by (\d+) metres\. A box measures (\d+) centimetres by (\d+) centimetres by (\d+) centimetres/))) {
    const holdCm = +m[1] * +m[2] * +m[3] * 100 * 100 * 100;
    return holdCm / (+m[4] * +m[5] * +m[6]);
  }
  if ((m = p.match(/^A country of (\d+) million people has (\d+) thousand egg farms, and each person eats about (\d+) eggs a week/))) {
    return +m[1] * +m[3] * 52;                     // m[2], the farms, is spare
  }
  if ((m = p.match(/^A city of (\d+) thousand people draws from (\d+) reservoirs, and each person uses about (\d+) litres/))) {
    return (+m[1] * 1000 * +m[3]) / 1000;          // m[2], the reservoirs, is spare
  }
  if ((m = p.match(/^An airline runs (\d+) flights a day and employs (\d+) thousand people\. Each aircraft seats (\d+) passengers and flies about (\d+)% full/))) {
    const [F, seats, pct] = [+m[1], +m[3], +m[4]]; // m[2], the staff, is spare
    return ((F * seats * pct) / 100) * 7;          // 7 days is not in the question
  }
  if ((m = p.match(/^A barber cuts (\d+) heads a day and works (\d+) days a week\. A town of (\d+) thousand people has (\d+) barbershops, and each person needs a cut every (\d+) weeks/))) {
    const [c, d, P2, w] = [+m[1], +m[2], +m[3], +m[5]];  // m[4], the shops, is spare
    return (P2 * 1000) / w / (c * d);
  }

  return null;
}

test("every estimation answer follows from the sentence the student reads", () => {
  let checked = 0;
  const unknown = [];
  const wrong = [];

  for (const skill of ["est.scale", "est.fermi"]) {
    for (const level of [1, 2, 3]) {
      const { questions } = generateSet({ skill, level, count: 120, seed: `est|${skill}|${level}` });
      for (const q of questions) {
        const want = derive(q.prompt);
        if (want === null) {
          if (unknown.length < 5) unknown.push(`${skill} L${level}: ${q.prompt.slice(0, 70)}`);
          continue;
        }
        checked++;
        if (Math.abs(want - q.answer) > 1e-9) {
          wrong.push(`${skill} L${level}: "${q.prompt}" answers ${q.answer}, the sentence says ${want}`);
        }
      }
    }
  }

  assert.deepEqual(wrong.slice(0, 5), [], `${wrong.length} answers disagree with their own question`);
  assert.deepEqual(unknown, [], "some estimation sentences have no independent check");
  console.log(`    ${checked} estimation answers re-derived from the prompt alone`);
  assert.ok(checked > 600, `only ${checked} checked`);
});

test("an estimation answer is always a whole number a student can type", () => {
  // These questions are about decomposition, not about long division. An answer
  // of 4.333 turns a thinking exercise into a typing accident, and a chain that
  // does not divide evenly is a sign the numbers were picked carelessly.
  const bad = [];
  let checked = 0;

  for (const skill of ["est.scale", "est.fermi"]) {
    for (const level of [1, 2, 3]) {
      const { questions } = generateSet({ skill, level, count: 120, seed: `whole|${skill}|${level}` });
      for (const q of questions) {
        checked++;
        if (!Number.isInteger(q.answer) || q.answer <= 0) {
          bad.push(`${skill} L${level}: "${q.prompt}" answers ${q.answer}`);
        }
      }
    }
  }

  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} estimation answers are not whole numbers`);
  assert.ok(checked > 600, `only ${checked} checked`);
});

test("a Fermi question states every number it expects you to use", () => {
  // The limit this topic sets for itself: nothing has to be looked up or
  // guessed. If the working uses a figure the question never mentions, the
  // student is being marked on trivia rather than on reasoning.
  const bad = [];

  for (const level of [1, 2, 3]) {
    const { questions } = generateSet({ skill: "est.fermi", level, count: 60, seed: `stated|${level}` });
    for (const q of questions) {
      const given = new Set((q.prompt.match(/\d+/g) || []).map(Number));
      // Figures the working is allowed to introduce on its own: the unit
      // conversions and calendar facts everybody carries around.
      const common = new Set([1, 7, 10, 12, 24, 52, 60, 100, 365, 1000]);
      const used = (q.solution.match(/\d+/g) || []).map(Number);
      for (const v of used) {
        if (given.has(v) || common.has(v)) continue;
        // Anything else has to be something the working computed, not assumed.
        if (q.solution.indexOf(`= ${v}`) >= 0) continue;
        bad.push(`L${level}: "${q.prompt}" works with ${v}, which the question never gives`);
      }
    }
  }

  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} solutions reach for a number the question withheld`);
});
