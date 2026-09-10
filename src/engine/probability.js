/**
 * Probability and expected value.
 *
 * These are the questions a trading firm actually asks, reduced to the seven
 * ideas that generate almost all of them. Every distractor here is a route a
 * real student really takes, and carries the sentence explaining where it went
 * wrong. That is the point of the module: a wrong answer should name the
 * misconception, not just fail.
 *
 * Sources for the classics: Zhou's *A Practical Guide to Quantitative Finance
 * Interviews*, and questions repeatedly reported from Optiver, SIG, IMC and
 * Jane Street first rounds.
 */

import { fact, choose, frac } from "./format.js";

const q = (o) => ({ format: "probability", traps: [], ...o });

/* ── 1. Counting ─────────────────────────────────────────────────────────── */
export function counting(rng, level) {
  if (level === 1) {
    const v = rng.pick([
      ["a 6 when rolling a fair die", 1 / 6, [[1 / 3, "There are six faces, not three."], [1 / 2, "A die is not a coin."]]],
      ["heads when flipping a fair coin", 1 / 2, [[1 / 4, "That is two heads in a row."]]],
      ["a number greater than 4 when rolling a die", 1 / 3, [[1 / 6, "Two faces qualify, 5 and 6, not one."], [1 / 2, "Greater than 4 is not the same as greater than 3."]]],
      ["a heart when drawing one card from a full deck", 1 / 4, [[1 / 13, "That is one particular rank, not one suit."], [1 / 52, "That is one specific card."]]],
      ["an even number when rolling a die", 1 / 2, [[1 / 3, "Three faces out of six are even."]]],
    ]);
    return q({
      prompt: `Probability of getting ${v[0]}?`,
      answer: v[1],
      traps: v[2].map(([value, why]) => ({ value, why })),
      tip: "equally-likely",
    });
  }

  if (level === 2) {
    const s = rng.int(2, 12);
    const ways = 6 - Math.abs(s - 7);
    return q({
      prompt: `Roll two fair dice. Probability the sum is ${s}?`,
      answer: ways / 36,
      traps: [
        { value: 1 / 11, why: "There are 11 possible sums but they are not equally likely. Count the 36 ordered pairs instead." },
        { value: ways / 21, why: "Unordered pairs were counted. (2,5) and (5,2) are two different outcomes." },
        { value: 1 / 36, why: "That is one specific pair, not every pair with this sum." },
      ],
      tip: "equally-likely",
    });
  }

  const ev = rng.pick([
    ["at least one 6", 1 / 6, "Roll a fair die"],
    ["at least one head", 1 / 2, "Flip a fair coin"],
    ["at least one heart", 1 / 4, "Draw a card with replacement"],
    ["at least one ace", 1 / 13, "Draw a card with replacement"],
    ["at least one 1 or 2", 1 / 3, "Roll a fair die"],
  ]);
  const n = rng.int(2, 6);
  const p = ev[1];
  const ans = 1 - (1 - p) ** n;
  return q({
    prompt: `${ev[2]} ${n} times. Probability of ${ev[0]}?`,
    answer: ans,
    traps: [
      { value: (1 - p) ** n, why: "That is the probability of none. The question asks for at least one, so subtract it from 1." },
      { value: Math.min(1, n * p), why: "Probabilities of overlapping events cannot simply be added; you double-count the cases where it happens twice." },
      { value: p, why: "That is a single trial. The question asks across all of them." },
    ],
    tip: "at-least-one-complement",
  });
}

/* ── 2. Expected value ───────────────────────────────────────────────────── */
export function expectedValue(rng, level) {
  if (level === 1) {
    const v = rng.pick([
      ["the value shown on one fair die", 3.5, [[3, "The average of 1 to 6 is 3.5, not 3. There is no middle face."], [6, "That is the maximum, not the average."]]],
      ["the sum of two fair dice", 7, [[3.5, "That is one die. Expectations add, so double it."], [6, "The most likely single face is not the expected sum."]]],
      ["the number of heads in 4 flips of a fair coin", 2, [[4, "That is the number of flips."], [0.5, "That is the chance per flip, not the count."]]],
    ]);
    return q({ prompt: `Expected value of ${v[0]}?`, answer: v[1], format: "number", traps: v[2].map(([value, why]) => ({ value, why })), tip: "expectation-is-a-weighted-average" });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const v = rng.pick([
        ["the product of two fair dice", 12.25, [[7, "That is the expected sum."], [21, "That is 3.5 × 6."], [12, "Close, but E[XY] = 3.5 × 3.5 = 12.25 exactly."]]],
        ["the larger of two fair dice", 161 / 36, [[3.5, "That is one die on its own; taking a maximum pulls the average up."], [6, "That is the largest possible value, not the average."]]],
        ["the smaller of two fair dice", 91 / 36, [[3.5, "Taking a minimum pulls the average down."], [1, "That is the smallest possible value."]]],
      ]);
      return q({ prompt: `Expected value of ${v[0]}?`, answer: v[1], format: "number", traps: v[2].map(([value, why]) => ({ value, why })), tip: "expectation-is-a-weighted-average" });
    }
    const S = rng.pick([100, 200, 50]);
    const x = rng.pick([0.1, 0.2, 0.05]);
    const n = rng.pick([2, 2, 3]);
    const pct = Math.round(x * 100);
    return q({
      prompt: `A stock is at ${S}. Each day it goes up ${pct}% or down ${pct}%, equally likely. Expected price after ${n} days?`,
      answer: S,
      format: "number",
      traps: [
        { value: S * (1 - x * x) ** Math.floor(n / 2), why: "Up then down gives back less than you started with, but that is one path out of many. The average over all paths is unchanged." },
        { value: S * (1 + x) ** n, why: "That is the best case, every day up." },
        { value: S * (1 - x) ** n, why: "That is the worst case, every day down." },
      ],
      tip: "expectation-not-one-path",
    });
  }

  const k = rng.pick([1, 1, 2]);
  return q({
    prompt: `Roll a die and you are paid its face value. You may re-roll up to ${k === 1 ? "once" : k + " times"}, discarding the previous roll. Playing optimally, what is the expected payoff?`,
    answer: k === 1 ? 4.25 : 14 / 3,
    format: "number",
    traps: [
      { value: 3.5, why: "That is a single roll with no re-roll. The option to re-roll is worth something, so the answer must exceed 3.5." },
      { value: k === 1 ? 14 / 3 : 4.25, why: "That is the answer for a different number of re-rolls." },
      { value: 5, why: "Re-rolling only helps when the first roll is below the value of rolling again; you keep a 4, 5 or 6." },
    ],
    tip: "expectation-is-a-weighted-average",
  });
}

/* ── 3. Conditional probability ──────────────────────────────────────────── */
export function conditional(rng, level) {
  if (level === 1) {
    const v = rng.pick(["least", "least", "elder", "leastG"]);
    const stem = "A family has two children, boys and girls equally likely. ";
    if (v === "elder") {
      return q({
        prompt: stem + "The older child is a boy. Probability both are boys?",
        answer: 1 / 2,
        traps: [{ value: 1 / 3, why: "That is the answer to 'at least one is a boy'. Naming the older child fixes one slot, which leaves only two cases." }],
        tip: "condition-shrinks-the-space",
      });
    }
    if (v === "leastG") {
      return q({
        prompt: stem + "At least one is a girl. Probability both are girls?",
        answer: 1 / 3,
        traps: [{ value: 1 / 2, why: "GB and BG are two different outcomes. The condition leaves GG, GB, BG, and only one of those is two girls." }],
        tip: "condition-shrinks-the-space",
      });
    }
    return q({
      prompt: stem + "At least one is a boy. Probability both are boys?",
      answer: 1 / 3,
      traps: [
        { value: 1 / 2, why: "BG and GB are two different outcomes. The condition leaves BB, BG, GB, and only one of those is two boys." },
        { value: 1 / 4, why: "That is the unconditional chance of two boys, before you were told anything." },
      ],
      tip: "condition-shrinks-the-space",
    });
  }

  if (level === 2) {
    const s = rng.pick([7, 8, 9, 10]);
    const total = 13 - s;
    return q({
      prompt: `Two fair dice are rolled and the sum is ${s}. Probability at least one die shows a 6?`,
      answer: 2 / total,
      traps: [
        { value: 1 / 6, why: "That is the unconditional chance for one die. Knowing the sum changes it." },
        { value: 11 / 36, why: "That is the unconditional chance of at least one 6 in two rolls." },
        { value: 1 / total, why: "There are two ordered pairs containing a 6, not one, because the 6 can be on either die." },
      ],
      tip: "condition-shrinks-the-space",
    });
  }

  const r = rng.int(2, 6);
  const b = rng.int(2, 6);
  const N = r + b;
  return q({
    prompt: `An urn holds ${r} red and ${b} blue balls. You draw 2 without replacement. Probability both are red?`,
    answer: (r * (r - 1)) / (N * (N - 1)),
    traps: [
      { value: (r / N) ** 2, why: "That assumes replacement. After the first red is taken out, both the reds and the total are one smaller." },
      { value: r / N, why: "That is the first draw only." },
      { value: (r - 1) / (N - 1), why: "That is the second draw given the first was red; you still have to multiply by the first." },
    ],
    tip: "condition-shrinks-the-space",
  });
}

/* ── 4. Bayes ────────────────────────────────────────────────────────────── */
export function bayes(rng, level) {
  if (level === 1) {
    const set = rng.pick([[1 / 4, 1 / 2, 3 / 4], [1 / 10, 1 / 2, 9 / 10], [1 / 3, 1 / 2, 2 / 3], [1 / 5, 2 / 5, 4 / 5]]);
    const k = rng.int(0, 2);
    const total = set[0] + set[1] + set[2];
    return q({
      prompt: `Three coins have P(heads) = ${set.map((x) => frac(x)).join(", ")}. You pick one at random and flip heads. Probability it was the coin with P(heads) = ${frac(set[k])}?`,
      answer: set[k] / total,
      traps: [
        { value: set[k], why: "That is the likelihood on its own. Bayes divides it by the sum of all three likelihoods." },
        { value: 1 / 3, why: "That is the prior, before you saw the flip. The heads result is evidence and must move it." },
        { value: set[k] / 3, why: "The 1/3 priors cancel between numerator and denominator; do not divide by 3 as well." },
      ],
      tip: "bayes-likelihood-share",
    });
  }

  if (level === 2) {
    const pool = [[3, 1], [1, 3], [2, 2], [1, 1], [4, 1], [1, 4], [2, 1], [1, 2], [3, 2], [2, 3], [5, 1], [1, 5]];
    for (let t = 0; t < 50; t++) {
      const A = rng.pick(pool);
      const B = rng.pick(pool);
      const rA = A[1] / (A[0] + A[1]);
      const rB = B[1] / (B[0] + B[1]);
      if (rA === rB) continue;
      return q({
        prompt: `Urn A holds ${A[0]} blue and ${A[1]} red. Urn B holds ${B[0]} blue and ${B[1]} red. You pick an urn at random and draw a red ball. Probability it was urn B?`,
        answer: rB / (rA + rB),
        traps: [
          { value: rB, why: "That is urn B's own share of red. Bayes compares it against urn A's share as well." },
          { value: 1 / 2, why: "That is the prior. Drawing red is evidence, and it favours whichever urn has more red." },
          { value: B[1] / (A[1] + B[1]), why: "Red counts were compared directly, but the urns hold different totals, so compare proportions." },
        ],
        tip: "bayes-likelihood-share",
      });
    }
  }

  const n = rng.int(1, 3);
  return q({
    prompt: `A box holds 3 coins: one fair, one two-headed, one two-tailed. You pick one at random and flip it ${n === 1 ? "once: heads" : n + " times: all heads"}. Probability it is the fair coin?`,
    answer: 1 / 2 ** n / (1 / 2 ** n + 1),
    traps: [
      { value: 1 / 3, why: "That is the prior. Seeing only heads is evidence against the fair coin." },
      { value: 1 / 2, why: "Two coins can produce heads, but not equally readily: the two-headed coin does it every time." },
      { value: 1 / 2 ** n, why: "That is the fair coin's likelihood alone, not its share of the total." },
    ],
    tip: "bayes-likelihood-share",
  });
}

/* ── 5. Waiting time ─────────────────────────────────────────────────────── */
export function waitingTime(rng, level) {
  if (level === 1) {
    const ev = rng.pick([
      ["a 6 when rolling a die", 6],
      ["heads when flipping a coin", 2],
      ["a 5 or 6 when rolling a die", 3],
      ["a heart when drawing cards with replacement", 4],
    ]);
    return q({
      prompt: `Expected number of trials until you first get ${ev[0]}?`,
      answer: ev[1],
      format: "number",
      traps: [
        { value: 1 / ev[1], why: "That is the probability. The expected wait is its reciprocal." },
        { value: ev[1] - 1, why: "The trial that succeeds counts too." },
      ],
      tip: "waiting-time-one-over-p",
    });
  }

  if (level === 2) {
    const ev = rng.pick([["a 6", 6, "rolling a die"], ["heads", 2, "flipping a coin"], ["a 5 or 6", 3, "rolling a die"]]);
    const k = rng.int(2, 4);
    return q({
      prompt: `Expected number of trials until ${ev[0]} has come up ${k === 2 ? "twice" : k + " times"}, not necessarily in a row, when ${ev[2]}?`,
      answer: ev[1] * k,
      format: "number",
      traps: [
        { value: ev[1], why: "That is the wait for the first one. Each further one costs the same again, because expectations add." },
        { value: ev[1] ** k, why: "Waits add, they do not multiply. Multiplying is for probabilities of joint events." },
        { value: k, why: "That is the number of successes wanted, not the number of trials needed." },
      ],
      tip: "waiting-time-one-over-p",
    });
  }

  if (rng.chance(0.6)) {
    const pat = rng.pick([
      ["heads then tails", 4, "After a head, another head does not hurt: you are still waiting for the tail."],
      ["tails then heads", 4, "After a tail, another tail does not hurt: you are still waiting for the head."],
      ["two heads in a row", 6, "A tail after a head destroys the run, so you start over. That is why this is 6 and HT is only 4."],
      ["two tails in a row", 6, "A head after a tail destroys the run, so you start over. That is why this is 6 and TH is only 4."],
    ]);
    return q({
      prompt: `Flip a fair coin repeatedly. Expected number of flips until you first see ${pat[0]}?`,
      answer: pat[1],
      format: "number",
      traps: [
        { value: pat[1] === 4 ? 6 : 4, why: pat[2] },
        { value: 2, why: "That is the wait for one particular face, not for a two-flip pattern." },
      ],
      tip: "waiting-time-one-over-p",
    });
  }

  const v = rng.pick([
    ["all 6 faces of a die", 6],
    ["all 4 suits, drawing cards with replacement", 4],
    ["both faces of a coin", 2],
  ]);
  const n = v[1];
  let h = 0;
  for (let i = 1; i <= n; i++) h += 1 / i;
  return q({
    prompt: `Expected number of trials to see ${v[0]} at least once each?`,
    answer: n * h,
    format: "number",
    traps: [
      { value: n, why: "That is the minimum possible, which assumes you never repeat one you already have." },
      { value: n * n, why: "Too big. The wait is n times the harmonic sum 1 + 1/2 + … + 1/n, which grows slowly." },
    ],
    tip: "waiting-time-one-over-p",
  });
}

/* ── 6. Symmetry ─────────────────────────────────────────────────────────── */
export function symmetry(rng, level) {
  if (level === 1) {
    const n = rng.int(3, 5);
    const j = rng.int(1, n);
    const ord = ["1st", "2nd", "3rd", "4th", "5th"][j - 1];
    return q({
      prompt: `${n} independent Uniform[0,1] values are drawn in order. Probability the ${ord} one is the largest?`,
      answer: 1 / n,
      traps: [
        { value: j / n, why: "The position carries no information. Being drawn later does not make a value bigger." },
        { value: 1 / 2, why: "That would be the answer for two draws only." },
        { value: 1 / fact(n), why: "That is the chance of one full ordering, not of one value being the maximum." },
      ],
      tip: "symmetry-orderings",
    });
  }

  if (level === 2) {
    const n = rng.int(3, 5);
    const dir = rng.pick(["strictly increasing", "strictly decreasing"]);
    return q({
      prompt: `${n} independent draws from a continuous distribution. Probability they come out ${dir} in the order drawn?`,
      answer: 1 / fact(n),
      traps: [
        { value: 1 / n, why: "That is the chance of one value being the largest. Here all n! orderings compete and exactly one qualifies." },
        { value: 2 / fact(n), why: "Increasing and decreasing are two different orderings; the question asks for one of them." },
        { value: 1 / 2 ** n, why: "Ordering is not a sequence of independent coin flips." },
      ],
      tip: "symmetry-orderings",
    });
  }

  const k = rng.pick([2, 3, 3, 4]);
  const N = rng.pick([6, 8, 10, 10, 12]);
  if (rng.chance(0.35)) {
    const c = choose(N, k);
    return q({
      prompt: `Pick ${k} numbers from 1–${N}, each pick independent so repeats are possible, in order. Probability they are strictly increasing?`,
      answer: c / N ** k,
      traps: [
        { value: 1 / fact(k), why: "That is the answer when the picks must be distinct. Here repeats are possible and a repeat is never increasing, so the answer is smaller." },
        { value: 1 / k, why: "Not a per-item chance; count the increasing selections against all N^k sequences." },
      ],
      tip: "symmetry-orderings",
    });
  }
  return q({
    prompt: `Pick ${k} distinct numbers from 1–${N}, revealed in random order. Probability they come out strictly increasing?`,
    answer: 1 / fact(k),
    traps: [
      { value: 1 / N, why: "The size of the pool does not matter once the numbers are distinct; only the number of orderings does." },
      { value: k / N, why: "The pool size cancels. Any k distinct values have k! equally likely orderings and one is increasing." },
    ],
    tip: "symmetry-orderings",
  });
}

/* ── 7. Classic puzzles ──────────────────────────────────────────────────── */
export function classics(rng, level) {
  if (level === 1) {
    const sw = rng.chance(0.66);
    return q({
      prompt: `Three doors hide one car and two goats. You pick a door. The host, who knows where the car is, opens a different door revealing a goat. Probability you win the car if you ${sw ? "switch to the remaining door" : "stay with your first door"}?`,
      answer: sw ? 2 / 3 : 1 / 3,
      traps: [
        { value: 1 / 2, why: "Two doors remain but they are not equally likely. The host never opens the car, so his choice carries information about the door he avoided." },
        { value: sw ? 1 / 3 : 2 / 3, why: "That is the chance for the other strategy. Read carefully which one the question asks about." },
      ],
      tip: "ruin-and-first-mover",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const N = rng.pick([4, 5, 5, 6, 8, 10]);
      const i = rng.int(1, N - 1);
      return q({
        prompt: `A holds ${i} coins and B holds ${N - i}. They play a fair game; each round the loser hands the winner one coin, until someone has none. Probability A ends up with everything?`,
        answer: i / N,
        traps: [
          { value: 1 / 2, why: "The game is fair per round, but the player with fewer coins runs out sooner. Starting stack decides it." },
          { value: (N - i) / N, why: "That is B's chance of winning, not A's. The two must add to 1." },
          { value: 1 / N, why: "The chance is proportional to the whole starting stack, not to a single coin." },
        ],
        tip: "ruin-and-first-mover",
      });
    }
    const ev = rng.pick([["rolls a 6", 1 / 6], ["flips heads", 1 / 2], ["rolls a 5 or 6", 1 / 3]]);
    const p = ev[1];
    return q({
      prompt: `A and B take turns and whoever ${ev[0]} first wins. A goes first. Probability A wins?`,
      answer: 1 / (2 - p),
      traps: [
        { value: 1 / 2, why: "Going first is a real advantage: A can win before B ever gets a turn." },
        { value: p, why: "That is only A's first turn. A also wins if both miss and the position repeats." },
        { value: (1 + p) / 2, why: "Set it up as one equation: A wins now with probability p, or both miss and the same position returns." },
      ],
      tip: "ruin-and-first-mover",
    });
  }

  const kind = rng.pick(["derange", "walk", "cards", "unit"]);
  if (kind === "derange") {
    const n = rng.pick([3, 3, 4, 5]);
    const D = { 3: 2, 4: 9, 5: 44 }[n];
    const none = D / fact(n);
    const asksNone = rng.chance(0.66);
    return q({
      prompt: `${n} letters are placed at random into ${n} addressed envelopes. Probability that ${asksNone ? "no letter" : "at least one letter"} reaches the right envelope?`,
      answer: asksNone ? none : 1 - none,
      traps: [
        { value: asksNone ? 1 - none : none, why: "That is the complement; read which way the question is asked." },
        { value: 1 / n, why: "That is the chance for one named letter, not for the whole arrangement." },
        { value: 1 / fact(n), why: "That is the chance of the one perfect arrangement where every letter is right." },
      ],
      tip: "symmetry-orderings",
    });
  }
  if (kind === "walk") {
    const n = rng.pick([1, 2, 3]);
    return q({
      prompt: `A walker on the integers takes each step +1 or −1 with probability ½. Probability of standing back at the start after ${2 * n} steps?`,
      answer: choose(2 * n, n) / 4 ** n,
      traps: [
        { value: 1 / 2, why: "Returning needs equal numbers of steps each way, which is one particular count out of many." },
        { value: 1 / 2 ** n, why: "Count the paths: C(2n, n) of the 2^(2n) equally likely paths come home." },
      ],
      tip: "equally-likely",
    });
  }
  if (kind === "cards") {
    const v = rng.pick([
      ["of the same suit", 12 / 51, [[1 / 4, "That is the chance the second card is a named suit; here it only has to match the first, and one card of that suit is already gone."], [1 / 13, "That is about ranks, not suits."]]],
      ["a pair, meaning the same rank", 3 / 51, [[1 / 13, "Three of the rank remain out of 51 cards, not four out of 52."], [1 / 52, "That is one specific card."]]],
      ["both red", 25 / 102, [[1 / 4, "Close, but drawing without replacement leaves 25 reds among 51 cards, not 26 among 52."], [1 / 2, "That is the chance the first card is red. Both cards have to be."]]],
    ]);
    return q({
      prompt: `Draw 2 cards from a standard 52-card deck without replacement. Probability they are ${v[0]}?`,
      answer: v[1],
      traps: v[2].map(([value, why]) => ({ value, why })),
      tip: "condition-shrinks-the-space",
    });
  }
  const v = rng.pick([
    ["|X − Y| < ½", 3 / 4, [[1 / 2, "Draw the unit square: the band around the diagonal is the region, and the two corner triangles it excludes are each 1/8."], [1 / 4, "That is the excluded part, both corners together."]]],
    ["X + Y < 1", 1 / 2, [[1 / 4, "The region is the triangle below the anti-diagonal, which is half the square."]]],
    ["X > 2Y", 1 / 4, [[1 / 2, "The line y = x/2 cuts off a triangle of area 1/4, not half the square."]]],
  ]);
  return q({
    prompt: `X and Y are independent Uniform[0,1]. Probability that ${v[0]}?`,
    answer: v[1],
    traps: v[2].map(([value, why]) => ({ value, why })),
    tip: "equally-likely",
  });
}

export const PROBABILITY = {
  "prob.counting": counting,
  "prob.expected-value": expectedValue,
  "prob.conditional": conditional,
  "prob.bayes": bayes,
  "prob.waiting-time": waitingTime,
  "prob.symmetry": symmetry,
  "prob.classics": classics,
};
