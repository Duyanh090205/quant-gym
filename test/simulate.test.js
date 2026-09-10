/**
 * Answers checked by simulation, not by algebra.
 *
 * The other test file re-derives each answer from a formula written separately
 * from the generator. That catches typing slips but not a misunderstanding: if I
 * misread a question, I will misread it the same way twice and both formulas
 * will agree.
 *
 * So this file plays the games instead. It rolls the dice, draws the balls, runs
 * the walks, and compares what actually happens against what the engine claims.
 * A simulation shares nothing with the formula except the question, which is the
 * point.
 *
 * Everything is seeded, so a failure here is reproducible rather than a flake.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSet, makeRng } from "../src/engine/index.js";

const N = 120000;               // trials per question
const TOL_P = 0.012;            // absolute, on a probability
const TOL_E = 0.03;             // relative, on an expectation

const rng = makeRng("simulation");
const die = () => rng.int(1, 6);
const coin = () => rng.chance(0.5);

/** Run `trial` N times; it returns 1/0 for a probability or a number for a mean. */
function mean(trial, n = N) {
  let total = 0;
  for (let i = 0; i < n; i++) total += trial();
  return total / n;
}

/** Rejection sampling: keep only the runs where the condition held. */
function conditional(trial, n = N) {
  let hits = 0, kept = 0;
  for (let i = 0; i < n * 3 && kept < n; i++) {
    const r = trial();
    if (r === null) continue;
    kept++;
    hits += r;
  }
  assert.ok(kept > 2000, "not enough accepted samples to judge");
  return hits / kept;
}

const check = (label, got, want, tol) =>
  assert.ok(Math.abs(got - want) <= tol,
    `${label}: engine says ${want.toFixed(4)}, simulation says ${got.toFixed(4)}`);

const checkP = (label, got, want) => check(label, got, want, TOL_P);
const checkE = (label, got, want) => check(label, got, want, Math.max(TOL_E * Math.abs(want), 0.05));

/**
 * Simulators, keyed by the shape of the prompt. Each returns null when it does
 * not recognise the question, so unknown shapes are counted rather than
 * silently skipped.
 */
function simulate(q) {
  const p = q.prompt;
  let m;

  /* ── counting ── */
  if ((m = p.match(/two fair dice\. Probability the sum is (\d+)/))) {
    const s = +m[1];
    return mean(() => (die() + die() === s ? 1 : 0));
  }
  if ((m = p.match(/^(Roll a fair die|Flip a fair coin|Draw a card with replacement) (\d+) times\. Probability of at least one (6|head|heart|ace|1 or 2)/))) {
    const n = +m[2];
    const hit = { "6": () => die() === 6, head: () => coin(), heart: () => rng.int(1, 4) === 1,
                  ace: () => rng.int(1, 13) === 1, "1 or 2": () => die() <= 2 }[m[3]];
    return mean(() => { for (let i = 0; i < n; i++) if (hit()) return 1; return 0; });
  }
  if (/Probability of getting a 6 when rolling a fair die/.test(p)) return mean(() => (die() === 6 ? 1 : 0));
  if (/Probability of getting heads when flipping a fair coin/.test(p)) return mean(() => (coin() ? 1 : 0));
  if (/Probability of getting a heart when drawing one card from a full deck/.test(p)) return mean(() => (rng.int(1, 52) <= 13 ? 1 : 0));
  if (/Probability of getting a number greater than 4/.test(p)) return mean(() => (die() > 4 ? 1 : 0));
  if (/Probability of getting an even number when rolling a die/.test(p)) return mean(() => (die() % 2 === 0 ? 1 : 0));

  /* ── expected value ── */
  if (/Expected value of the sum of two fair dice/.test(p)) return mean(() => die() + die());
  if (/Expected value of the value shown on one fair die/.test(p)) return mean(die);
  if (/Expected value of the product of two fair dice/.test(p)) return mean(() => die() * die());
  if (/Expected value of the larger of two fair dice/.test(p)) return mean(() => Math.max(die(), die()));
  if (/Expected value of the smaller of two fair dice/.test(p)) return mean(() => Math.min(die(), die()));
  if (/Expected value of the number of heads in 4 flips/.test(p)) {
    return mean(() => { let c = 0; for (let i = 0; i < 4; i++) if (coin()) c++; return c; });
  }
  if (/Expected value of the number of 6s in 12 rolls/.test(p)) {
    return mean(() => { let c = 0; for (let i = 0; i < 12; i++) if (die() === 6) c++; return c; });
  }
  if ((m = p.match(/A stock is at (\d+)\. Each day it goes up (\d+)% or down \2%, equally likely\. Expected price after (\d+) days/))) {
    const [S, pct, days] = [+m[1], +m[2], +m[3]];
    return mean(() => {
      let v = S;
      for (let d = 0; d < days; d++) v *= coin() ? 1 + pct / 100 : 1 - pct / 100;
      return v;
    });
  }
  if ((m = p.match(/You may re-roll up to (once|2 times)/))) {
    const rerolls = m[1] === "once" ? 1 : 2;
    // Play it the way the card says: keep a roll worth more than a fresh game.
    const value = (left) => {
      if (left === 0) return 3.5;
      const v = value(left - 1);
      let e = 0;
      for (let f = 1; f <= 6; f++) e += Math.max(f, v) / 6;
      return e;
    };
    return mean(() => {
      let left = rerolls;
      let roll = die();
      while (left > 0 && roll < value(left - 1)) { roll = die(); left--; }
      return roll;
    });
  }

  /* ── conditional ── */
  if (/at least one is a boy\. Probability both are boys/i.test(p)) {
    return conditional(() => { const a = coin(), b = coin(); return a || b ? (a && b ? 1 : 0) : null; });
  }
  if (/at least one is a girl\. Probability both are girls/i.test(p)) {
    return conditional(() => { const a = coin(), b = coin(); return !a || !b ? (!a && !b ? 1 : 0) : null; });
  }
  if (/The older child is a boy\. Probability both are boys/.test(p)) {
    return conditional(() => { const older = coin(), younger = coin(); return older ? (younger ? 1 : 0) : null; });
  }
  if ((m = p.match(/the sum is (\d+)\. Probability at least one die shows a 6/))) {
    const s = +m[1];
    return conditional(() => { const a = die(), b = die(); return a + b === s ? (a === 6 || b === 6 ? 1 : 0) : null; });
  }
  if ((m = p.match(/urn holds (\d+) red and (\d+) blue balls\. You draw 2 without replacement\. Probability both are red/))) {
    const [r, b] = [+m[1], +m[2]];
    return mean(() => {
      const balls = [...Array(r).fill(1), ...Array(b).fill(0)];
      const i = rng.int(0, balls.length - 1);
      const first = balls.splice(i, 1)[0];
      const second = balls[rng.int(0, balls.length - 1)];
      return first && second ? 1 : 0;
    });
  }

  /* ── Bayes ── */
  if ((m = p.match(/Urn A holds (\d+) blue and (\d+) red\. Urn B holds (\d+) blue and (\d+) red[\s\S]*draw a red ball\. Probability it was urn B/))) {
    const A = [+m[1], +m[2]], B = [+m[3], +m[4]];
    return conditional(() => {
      const isB = coin();
      const [blue, red] = isB ? B : A;
      const drewRed = rng.int(1, blue + red) <= red;
      return drewRed ? (isB ? 1 : 0) : null;
    });
  }
  if ((m = p.match(/Three coins have P\(heads\) = ([^.]+)\. You pick one at random and flip heads\. Probability it was the coin with P\(heads\) = ([^?]+)\?/))) {
    const parse = (t) => { const [a, b] = t.trim().split("/"); return b ? +a / +b : +a; };
    const set = m[1].split(",").map(parse);
    const target = parse(m[2]);
    return conditional(() => {
      const i = rng.int(0, 2);
      return rng.float() < set[i] ? (Math.abs(set[i] - target) < 1e-9 ? 1 : 0) : null;
    });
  }
  if ((m = p.match(/one fair, one two-headed, one two-tailed\. You pick one at random and flip it (?:once: heads|(\d+) times: all heads)/))) {
    const n = m[1] ? +m[1] : 1;
    return conditional(() => {
      const which = rng.int(0, 2);            // 0 fair, 1 two-headed, 2 two-tailed
      for (let i = 0; i < n; i++) {
        const heads = which === 0 ? coin() : which === 1;
        if (!heads) return null;
      }
      return which === 0 ? 1 : 0;
    });
  }

  /* ── waiting times ── */
  if ((m = p.match(/Expected number of trials until you first get (a 6|heads|a 5 or 6|a heart)/))) {
    const hit = { "a 6": () => die() === 6, heads: () => coin(), "a 5 or 6": () => die() >= 5,
                  "a heart": () => rng.int(1, 4) === 1 }[m[1]];
    return mean(() => { let n = 1; while (!hit()) n++; return n; }, 60000);
  }
  if ((m = p.match(/Expected number of trials until (a 6|heads|a 5 or 6) has come up (?:(twice)|(\d+) times)/))) {
    const hit = { "a 6": () => die() === 6, heads: () => coin(), "a 5 or 6": () => die() >= 5 }[m[1]];
    const k = m[2] ? 2 : +m[3];
    return mean(() => { let n = 0, got = 0; while (got < k) { n++; if (hit()) got++; } return n; }, 60000);
  }
  if ((m = p.match(/until you first see (heads then tails|tails then heads|two heads in a row|two tails in a row)/))) {
    const want = m[1];
    return mean(() => {
      let n = 0, prev = null;
      for (;;) {
        const f = coin(); n++;
        if (prev !== null) {
          if (want === "heads then tails" && prev && !f) return n;
          if (want === "tails then heads" && !prev && f) return n;
          if (want === "two heads in a row" && prev && f) return n;
          if (want === "two tails in a row" && !prev && !f) return n;
        }
        prev = f;
      }
    }, 60000);
  }
  if ((m = p.match(/Expected number of trials to see (all 6 faces of a die|all 4 suits, drawing cards with replacement|both faces of a coin)/))) {
    const k = { "all 6 faces of a die": 6, "all 4 suits, drawing cards with replacement": 4, "both faces of a coin": 2 }[m[1]];
    return mean(() => {
      const seen = new Set();
      let n = 0;
      while (seen.size < k) { seen.add(rng.int(1, k)); n++; }
      return n;
    }, 60000);
  }

  /* ── symmetry ── */
  if ((m = p.match(/(\d+) independent Uniform\[0,1\] values are drawn in order\. Probability the (\d)\w\w one is the largest/))) {
    const [n, j] = [+m[1], +m[2]];
    return mean(() => {
      const v = [...Array(n)].map(() => rng.float());
      return v.indexOf(Math.max(...v)) === j - 1 ? 1 : 0;
    });
  }
  if ((m = p.match(/(\d+) independent draws from a continuous distribution\. Probability they come out strictly (increasing|decreasing)/))) {
    const n = +m[1], up = m[2] === "increasing";
    return mean(() => {
      const v = [...Array(n)].map(() => rng.float());
      for (let i = 1; i < n; i++) if (up ? v[i] <= v[i - 1] : v[i] >= v[i - 1]) return 0;
      return 1;
    });
  }
  if ((m = p.match(/Pick (\d+) numbers from 1–(\d+), each pick independent so repeats are possible, in order\. Probability they are strictly increasing/))) {
    const [k, N2] = [+m[1], +m[2]];
    return mean(() => {
      const v = [...Array(k)].map(() => rng.int(1, N2));
      for (let i = 1; i < k; i++) if (v[i] <= v[i - 1]) return 0;
      return 1;
    });
  }
  if ((m = p.match(/Pick (\d+) distinct numbers from 1–(\d+), revealed in random order\. Probability they come out strictly increasing/))) {
    const k = +m[1];
    return mean(() => {
      const v = [...Array(k)].map(() => rng.float());   // distinct with probability 1
      for (let i = 1; i < k; i++) if (v[i] <= v[i - 1]) return 0;
      return 1;
    });
  }

  /* ── classics ── */
  if ((m = p.match(/Probability you win the car if you (switch to the remaining door|stay with your first door)/))) {
    const switching = m[1].startsWith("switch");
    return mean(() => {
      const car = rng.int(0, 2), pick = rng.int(0, 2);
      if (!switching) return car === pick ? 1 : 0;
      // The host opens a goat door that is not your pick; switching wins exactly
      // when the first pick was wrong.
      return car === pick ? 0 : 1;
    });
  }
  if ((m = p.match(/A holds (\d+) coins and B holds (\d+)[\s\S]*Probability A ends up with everything/))) {
    let [i0, j0] = [+m[1], +m[2]];
    const total = i0 + j0;
    return mean(() => {
      let a = i0;
      while (a > 0 && a < total) a += coin() ? 1 : -1;
      return a === total ? 1 : 0;
    }, 60000);
  }
  if ((m = p.match(/whoever (rolls a 6|flips heads|rolls a 5 or 6) first wins\. A goes first\. Probability A wins/))) {
    const hit = { "rolls a 6": () => die() === 6, "flips heads": () => coin(), "rolls a 5 or 6": () => die() >= 5 }[m[1]];
    return mean(() => { for (let turn = 0; ; turn++) if (hit()) return turn % 2 === 0 ? 1 : 0; });
  }
  if ((m = p.match(/(\d+) letters are placed at random into \d+ addressed envelopes\. Probability that (no letter|at least one letter)/))) {
    const n = +m[1], wantNone = m[2] === "no letter";
    return mean(() => {
      const perm = [...Array(n)].map((_, i) => i);
      rng.shuffle(perm);
      const anyFixed = perm.some((v, i) => v === i);
      return wantNone ? (anyFixed ? 0 : 1) : (anyFixed ? 1 : 0);
    });
  }
  if ((m = p.match(/Probability of standing back at the start after (\d+) steps/))) {
    const steps = +m[1];
    return mean(() => {
      let x = 0;
      for (let i = 0; i < steps; i++) x += coin() ? 1 : -1;
      return x === 0 ? 1 : 0;
    });
  }
  if ((m = p.match(/Draw 2 cards from a standard 52-card deck without replacement\. Probability they are (of the same suit|a pair, meaning the same rank|both red)/))) {
    const kind = m[1];
    return mean(() => {
      const a = rng.int(0, 51);
      let b = rng.int(0, 50);
      if (b >= a) b++;
      if (kind === "of the same suit") return Math.floor(a / 13) === Math.floor(b / 13) ? 1 : 0;
      if (kind === "both red") return a < 26 && b < 26 ? 1 : 0;   // suits 0 and 1 are the red ones
      return a % 13 === b % 13 ? 1 : 0;
    });
  }
  if ((m = p.match(/X and Y are independent Uniform\[0,1\]\. Probability that (.+)\?$/))) {
    const cond = m[1];
    const f = {
      "|X − Y| < ½": (x, y) => Math.abs(x - y) < 0.5,
      "X + Y < 1": (x, y) => x + y < 1,
      "X > 2Y": (x, y) => x > 2 * y,
    }[cond];
    if (!f) return null;
    return mean(() => (f(rng.float(), rng.float()) ? 1 : 0));
  }

  return null;
}

test("probability answers survive playing the game a hundred thousand times", () => {
  const skills = ["prob.counting", "prob.expected-value", "prob.conditional", "prob.bayes",
                  "prob.waiting-time", "prob.symmetry", "prob.classics"];
  const seen = new Set();
  let checked = 0, unknown = 0;
  const unknownExamples = [];

  for (const skill of skills) {
    for (const level of [1, 2, 3]) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `sim|${skill}|${level}` });
      for (const q of questions) {
        if (seen.has(q.prompt)) continue;
        seen.add(q.prompt);
        const got = simulate(q);
        if (got === null) {
          unknown++;
          if (unknownExamples.length < 5) unknownExamples.push(q.prompt.slice(0, 70));
          continue;
        }
        if (q.format === "probability") checkP(q.prompt.slice(0, 60), got, q.answer);
        else checkE(q.prompt.slice(0, 60), got, q.answer);
        checked++;
      }
    }
  }

  console.log(`    simulated ${checked} distinct questions; ${unknown} shapes had no simulator`);
  if (unknownExamples.length) console.log("    not simulated:", unknownExamples.join(" | "));
  assert.ok(checked >= 120, `only ${checked} questions were simulated`);
  // Most shapes must be covered, or the test is quietly checking very little.
  assert.ok(unknown === 0,
    `${unknown} question shapes had no simulator: ${unknownExamples.join(" | ")}`);
});
