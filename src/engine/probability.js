/**
 * Probability and expected value.
 *
 * These are the questions a trading firm actually asks, reduced to the seven
 * ideas that generate almost all of them.
 *
 * Every question carries two different kinds of feedback, and they do different
 * jobs:
 *
 *   solution — always available. The worked line for this exact question, built
 *              from the same numbers that built the question. Shown whenever the
 *              student is wrong, however they were wrong.
 *   traps    — a specific wrong route with the sentence naming it. Only fires
 *              when the typed answer matches. This is the diagnosis; the
 *              solution is the treatment.
 *
 * House style for both: no term a fifteen-year-old has not met, unless the
 * sentence defines it on the spot. No "martingale", no bare "likelihood", and
 * C(n,k) always arrives with "ways to choose k from n" beside it.
 *
 * Sources for the classics: Zhou's *A Practical Guide to Quantitative Finance
 * Interviews*, and questions repeatedly reported from Optiver, SIG, IMC and
 * Jane Street first rounds.
 */

import { fact, choose, frac } from "./format.js";

const q = (o) => ({ format: "probability", traps: [], ...o });
const mapTraps = (list) => list.map(([value, why]) => ({ value, why }));

/* ── 1. Counting ─────────────────────────────────────────────────────────── */
export function counting(rng, level) {
  if (level === 1) {
    const v = rng.pick([
      ["a 6 when rolling a fair die", 1 / 6, "A die has 6 equally likely faces and 1 of them is a 6, so 1 out of 6.",
        [[1 / 3, "There are six faces, not three."], [1 / 2, "A die is not a coin."]]],
      ["heads when flipping a fair coin", 1 / 2, "Two faces, both equally likely, one of them is heads: 1 out of 2.",
        [[1 / 4, "That is two heads in a row."]]],
      ["a number greater than 4 when rolling a die", 1 / 3, "Two faces beat 4, namely 5 and 6, so 2 out of 6, which is 1/3.",
        [[1 / 6, "Two faces qualify, 5 and 6, not one."], [1 / 2, "Greater than 4 is not the same as greater than 3."]]],
      ["a heart when drawing one card from a full deck", 1 / 4, "A deck has 13 hearts among 52 cards: 13 out of 52, which is 1/4.",
        [[1 / 13, "That is one particular rank, not one suit."], [1 / 52, "That is one specific card."]]],
      ["an even number when rolling a die", 1 / 2, "The even faces are 2, 4 and 6: 3 out of 6, which is 1/2.",
        [[1 / 3, "Three faces out of six are even."]]],
    ]);
    return q({
      prompt: `Probability of getting ${v[0]}?`,
      answer: v[1],
      solution: v[2],
      traps: mapTraps(v[3]),
      tip: "equally-likely",
    });
  }

  if (level === 2) {
    const s = rng.int(2, 12);
    const ways = 6 - Math.abs(s - 7);
    const pairs = [];
    for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) pairs.push(`(${a},${s - a})`);
    return q({
      prompt: `Roll two fair dice. Probability the sum is ${s}?`,
      answer: ways / 36,
      solution:
        `Two dice give 6 × 6 = 36 equally likely results, counting the dice as different. ` +
        `The ones that add to ${s} are ${pairs.join(" ")} — that is ${ways} of them. So ${ways}/36` +
        (frac(ways / 36) === `${ways}/36` ? "." : `, which is ${frac(ways / 36)}.`),
      traps: mapTraps([
        [1 / 11, "There are 11 possible sums but they are not equally likely: 7 happens far more often than 2. Count the 36 pairs instead."],
        [ways / 21, "Each pair was counted once, but (2,5) and (5,2) really are two different results, so there are 36 of them, not 21."],
        [1 / 36, "That is one single pair. Several different pairs give this sum."],
      ]),
      tip: "equally-likely",
    });
  }

  const ev = rng.pick([
    ["at least one 6", 1 / 6, "Roll a fair die", "5/6", "a 6"],
    ["at least one head", 1 / 2, "Flip a fair coin", "1/2", "a head"],
    ["at least one heart", 1 / 4, "Draw a card with replacement", "3/4", "a heart"],
    ["at least one ace", 1 / 13, "Draw a card with replacement", "12/13", "an ace"],
    ["at least one 1 or 2", 1 / 3, "Roll a fair die", "2/3", "a 1 or 2"],
  ]);
  const n = rng.int(2, 6);
  const p = ev[1];
  const none = (1 - p) ** n;
  const ans = 1 - none;
  return q({
    prompt: `${ev[2]} ${n} times. Probability of ${ev[0]}?`,
    answer: ans,
    solution:
      `Go the other way round and work out the chance of missing every time. ` +
      `One try misses with chance ${ev[3]}, so ${n} tries all miss with chance (${ev[3]})^${n} = ${frac(Math.round(none * 1e6) / 1e6)}. ` +
      `Everything else is "at least one", so 1 − ${frac(Math.round(none * 1e6) / 1e6)} = ${frac(Math.round(ans * 1e6) / 1e6)}.`,
    traps: mapTraps([
      [none, `That is the chance of never getting ${ev[4]}. You are one subtraction away: take it from 1.`],
      [Math.min(1, n * p), "Chances cannot just be added up like that. Adding counts the times it happens twice over and over, and with enough tries it would pass 1, which is impossible."],
      [p, "That is one single try. The question asks across all of them."],
    ]),
    tip: "at-least-one-complement",
  });
}

/* ── 2. Expected value ───────────────────────────────────────────────────── */
export function expectedValue(rng, level) {
  if (level === 1) {
    const v = rng.pick([
      ["the value shown on one fair die", 3.5, "Add the faces and share them out evenly: (1+2+3+4+5+6)/6 = 21/6 = 3.5. No face shows 3.5, and that is fine — an average does not have to be a possible result.",
        [[3, "The middle of 1 to 6 sits between 3 and 4, so the average is 3.5. There is no middle face."], [6, "That is the biggest face, not the average one."]]],
      ["the sum of two fair dice", 7, "Each die averages 3.5 on its own, and averages simply add: 3.5 + 3.5 = 7.",
        [[3.5, "That is one die. The other die is still there, so add its average too."], [6, "The face that comes up most often is not the same as the average total."]]],
      ["the number of heads in 4 flips of a fair coin", 2, "Each flip contributes half a head on average, and averages add up: 4 × ½ = 2.",
        [[4, "That is how many flips you make, not how many come up heads."], [0.5, "That is one flip's share. There are four flips."]]],
      ["the number of 6s in 12 rolls of a fair die", 2, "Each roll contributes 1/6 of a six on average, and averages add up: 12 × 1/6 = 2.",
        [[12, "That is how many rolls you make, not how many are sixes."], [6, "That is a number on the die, not a count of anything."]]],
    ]);
    return q({
      prompt: `Expected value of ${v[0]}?`,
      answer: v[1],
      format: "number",
      solution: v[2],
      traps: mapTraps(v[3]),
      tip: "expectation-is-a-weighted-average",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const v = rng.pick([
        ["the product of two fair dice", 12.25, "The dice do not affect each other, so you may multiply the two averages: 3.5 × 3.5 = 12.25.",
          [[7, "That is the average total, not the average product."], [21, "That is 3.5 × 6. The second die averages 3.5 as well, not 6."], [12, "Very close: 3.5 × 3.5 is 12.25 exactly."]]],
        ["the larger of two fair dice", 161 / 36, "Go through each possible top face k and count how often it wins: k is the larger in 2k−1 of the 36 results. Adding those up gives 161/36, about 4.47.",
          [[3.5, "That is one die by itself. Always taking the bigger of two pulls the average up."], [6, "That is the biggest it can ever be, not what it is on average."]]],
        ["the smaller of two fair dice", 91 / 36, "The larger and the smaller always add to the total, so their averages do too: 7 − 161/36 = 91/36, about 2.53.",
          [[3.5, "That is one die by itself. Always taking the smaller of two pulls the average down."], [1, "That is the smallest it can ever be, not what it is on average."]]],
      ]);
      return q({
        prompt: `Expected value of ${v[0]}?`,
        answer: v[1],
        format: "number",
        solution: v[2],
        traps: mapTraps(v[3]),
        tip: "expectation-is-a-weighted-average",
      });
    }
    const S = rng.pick([100, 200, 50]);
    const x = rng.pick([0.1, 0.2, 0.05]);
    const n = rng.pick([2, 2, 3]);
    const pct = Math.round(x * 100);
    const up = (1 + x).toFixed(2);
    const down = (1 - x).toFixed(2);
    return q({
      prompt: `A stock is at ${S}. Each day it goes up ${pct}% or down ${pct}%, equally likely. Expected price after ${n} days?`,
      answer: S,
      format: "number",
      solution:
        `Each day multiplies the price by ${up} or by ${down}, equally often, so on average it multiplies by (${up} + ${down})/2 = 1. ` +
        `Multiplying by 1 changes nothing, and ${n} days of that still changes nothing: the answer stays ${S}.`,
      traps: mapTraps([
        [S * (1 - x * x) ** Math.floor(n / 2), `Up then down really does land below ${S}, but that is only one of the ways the ${n} days can go. Up then up lands above. Averaged over all of them, they cancel exactly.`],
        [S * (1 + x) ** n, "That is the luckiest case, up every single day."],
        [S * (1 - x) ** n, "That is the unluckiest case, down every single day."],
      ]),
      tip: "expectation-not-one-path",
    });
  }

  const k = rng.pick([1, 1, 2]);
  return q({
    prompt: `Roll a die and you are paid its face value. You may re-roll up to ${k === 1 ? "once" : k + " times"}, discarding the previous roll. Playing optimally, what is the expected payoff?`,
    answer: k === 1 ? 4.25 : 14 / 3,
    format: "number",
    solution: k === 1
      ? "If you re-roll, you get an ordinary die, worth 3.5 on average. So keep anything above 3.5, which means 4, 5 or 6, and re-roll 1, 2 and 3. That gives (4 + 5 + 6)/6 for the halves you keep, plus 3/6 × 3.5 for the halves you re-roll: 2.5 + 1.75 = 4.25."
      : "Work backwards. With one re-roll left the game is worth 4.25, from the case above. So on the first roll keep anything above 4.25, meaning 5 or 6, and re-roll the rest: (5 + 6)/6 + 4/6 × 4.25 = 11/6 + 17/6 = 14/3, about 4.67.",
    traps: mapTraps([
      [3.5, "That is a plain die with no re-roll. Being allowed to re-roll can only help, so the answer has to be above 3.5."],
      [k === 1 ? 14 / 3 : 4.25, "That is the answer for a different number of re-rolls. Check how many this question gives you."],
      [5, "You do not keep only 5 and 6 here. Re-roll whenever your roll is below what a fresh roll is worth, and keep it otherwise."],
    ]),
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
        solution:
          "List the families oldest first: BB, BG, GB, GG. Being told the older one is a boy rules out GB and GG and leaves BB and BG. " +
          "One of those two is two boys, so 1/2.",
        traps: mapTraps([[1 / 3, "That is the answer to the other version, 'at least one is a boy'. Naming the older child is stronger information: it pins down a particular child, which leaves only two families instead of three."]]),
        tip: "condition-shrinks-the-space",
      });
    }
    if (v === "leastG") {
      return q({
        prompt: stem + "At least one is a girl. Probability both are girls?",
        answer: 1 / 3,
        solution:
          "List the families oldest first: BB, BG, GB, GG. 'At least one girl' rules out BB and leaves BG, GB and GG. " +
          "One of those three is two girls, so 1/3.",
        traps: mapTraps([[1 / 2, "BG and GB are two different families: older boy with younger girl is not the same as older girl with younger boy. Counting them separately leaves three cases, not two."]]),
        tip: "condition-shrinks-the-space",
      });
    }
    return q({
      prompt: stem + "At least one is a boy. Probability both are boys?",
      answer: 1 / 3,
      solution:
        "List the families oldest first: BB, BG, GB, GG. 'At least one boy' rules out GG and leaves BB, BG and GB. " +
        "One of those three is two boys, so 1/3.",
      traps: mapTraps([
        [1 / 2, "BG and GB are two different families: older boy with younger girl is not the same as older girl with younger boy. Counting them separately leaves three cases, not two."],
        [1 / 4, "That is the chance of two boys before anyone told you anything. The information you were given rules GG out, so the answer has to be bigger."],
      ]),
      tip: "condition-shrinks-the-space",
    });
  }

  if (level === 2) {
    const s = rng.pick([7, 8, 9, 10]);
    const total = 13 - s;
    const pairs = [];
    for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) pairs.push(`(${a},${s - a})`);
    return q({
      prompt: `Two fair dice are rolled and the sum is ${s}. Probability at least one die shows a 6?`,
      answer: 2 / total,
      solution:
        `Knowing the sum throws away every result except these: ${pairs.join(" ")} — ${total} of them. ` +
        `A 6 appears in exactly 2, once on each die. So 2/${total} = ${frac(2 / total)}.`,
      traps: mapTraps([
        [1 / 6, "That is one die on its own, ignoring what you were told. The sum rules out most results and changes the answer."],
        [11 / 36, "That is the chance of a 6 in two rolls when you know nothing about the total."],
        [1 / total, `Two of the ${total} results contain a 6, not one, because the 6 can sit on either die.`],
      ]),
      tip: "condition-shrinks-the-space",
    });
  }

  const r = rng.int(2, 6);
  const b = rng.int(2, 6);
  const N = r + b;
  return q({
    prompt: `An urn holds ${r} red and ${b} blue balls. You draw 2 without replacement. Probability both are red?`,
    answer: (r * (r - 1)) / (N * (N - 1)),
    solution:
      `The first draw is red with chance ${r}/${N}. If it was, the urn now holds ${r - 1} red among ${N - 1} balls, ` +
      `so the second is red with chance ${r - 1}/${N - 1}. Multiply: ${r}/${N} × ${r - 1}/${N - 1} = ${frac((r * (r - 1)) / (N * (N - 1)))}.`,
    traps: mapTraps([
      [(r / N) ** 2, "That would be right if you put the first ball back. You do not, so the second draw sees one fewer red ball and one fewer ball in total."],
      [r / N, "That is only the first draw. The second one still has to be red as well."],
      [(r - 1) / (N - 1), "That is the second draw, assuming the first was red. You still have to multiply by the chance the first one was."],
    ]),
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
      solution:
        `Ask how eagerly each coin produces the heads you saw: ${set.map((x) => frac(x)).join(", ")}. ` +
        `All three were equally likely to be picked, so that part affects each of them the same way and drops out. ` +
        `What is left is this coin's share of the total: ${frac(set[k])} ÷ (${set.map((x) => frac(x)).join(" + ")}) = ${frac(set[k])} ÷ ${frac(total)} = ${frac(set[k] / total)}.`,
      traps: mapTraps([
        [set[k], "That is how often this coin alone shows heads. You still have to compare it against what the other two would have done."],
        [1 / 3, "That is the chance before you flipped. Seeing heads is evidence, and evidence has to move the answer."],
        [set[k] / 3, "The 1/3 chance of picking each coin appears on the top and the bottom of the fraction, so it cancels. Do not divide by 3 as well."],
      ]),
      tip: "bayes-likelihood-share",
    });
  }

  if (level === 2) {
    const pool = [[3, 1], [1, 3], [2, 2], [1, 1], [4, 1], [1, 4], [2, 1], [1, 2], [3, 2], [2, 3], [5, 1], [1, 5]];
    for (let attempt = 0; attempt < 50; attempt++) {
      const A = rng.pick(pool);
      const B = rng.pick(pool);
      const rA = A[1] / (A[0] + A[1]);
      const rB = B[1] / (B[0] + B[1]);
      if (rA === rB) continue;
      return q({
        prompt: `Urn A holds ${A[0]} blue and ${A[1]} red. Urn B holds ${B[0]} blue and ${B[1]} red. You pick an urn at random and draw a red ball. Probability it was urn B?`,
        answer: rB / (rA + rB),
        solution:
          `Ask how readily each urn gives up a red ball: A does it ${A[1]}/${A[0] + A[1]} of the time, B does it ${B[1]}/${B[0] + B[1]} of the time. ` +
          `Both urns were equally likely to be chosen, so that drops out and B's answer is its share of the two: ` +
          `${frac(rB)} ÷ (${frac(rA)} + ${frac(rB)}) = ${frac(rB / (rA + rB))}.`,
        traps: mapTraps([
          [rB, "That is how often urn B gives a red ball on its own. The question is which urn you are holding, so urn A's rate has to come into it too."],
          [1 / 2, "That is the chance before you drew anything. A red ball is evidence, and it points at whichever urn is redder."],
          [B[1] / (A[1] + B[1]), `Red balls were counted straight up, but the urns hold different numbers of balls, so compare the rates ${A[1]}/${A[0] + A[1]} and ${B[1]}/${B[0] + B[1]} instead of the counts.`],
        ]),
        tip: "bayes-likelihood-share",
      });
    }
  }

  const n = rng.int(1, 3);
  const fair = 1 / 2 ** n;
  const flips = n === 1 ? "one head" : `${n} heads in a row`;
  return q({
    prompt: `A box holds 3 coins: one fair, one two-headed, one two-tailed. You pick one at random and flip it ${n === 1 ? "once: heads" : n + " times: all heads"}. Probability it is the fair coin?`,
    answer: fair / (fair + 1),
    solution:
      `Ask how readily each coin gives ${flips}. The fair coin: ${frac(fair)}. The two-headed coin: 1, every time. The two-tailed coin: 0, never, so it is out. ` +
      `Take the fair coin's share of what is left: ${frac(fair)} ÷ (${frac(fair)} + 1) = ${frac(fair / (fair + 1))}.`,
    traps: mapTraps([
      [1 / 3, "That is the chance before you flipped. A run of heads is evidence, and it counts against the fair coin."],
      [1 / 2, "Two coins can show heads, but not equally readily: the two-headed one does it every single time, the fair one only sometimes."],
      [fair, `That is how often the fair coin gives ${flips} on its own. You still have to compare it against the two-headed coin.`],
    ]),
    tip: "bayes-likelihood-share",
  });
}

/* ── 5. Waiting time ─────────────────────────────────────────────────────── */
export function waitingTime(rng, level) {
  if (level === 1) {
    const ev = rng.pick([
      ["a 6 when rolling a die", 6, "1/6"],
      ["heads when flipping a coin", 2, "1/2"],
      ["a 5 or 6 when rolling a die", 3, "1/3"],
      ["a heart when drawing cards with replacement", 4, "1/4"],
    ]);
    return q({
      prompt: `Expected number of trials until you first get ${ev[0]}?`,
      answer: ev[1],
      format: "number",
      solution: `It happens ${ev[2]} of the time, so on average you wait for it once every ${ev[1]} tries. Turn the chance upside down: 1 ÷ ${ev[2]} = ${ev[1]}.`,
      traps: mapTraps([
        [1 / ev[1], "That is the chance of it happening, not how long you wait. Flip the fraction over."],
        [ev[1] - 1, "The try that finally works counts as a try too."],
      ]),
      tip: "waiting-time-one-over-p",
    });
  }

  if (level === 2) {
    const ev = rng.pick([["a 6", 6, "rolling a die", "1/6"], ["heads", 2, "flipping a coin", "1/2"], ["a 5 or 6", 3, "rolling a die", "1/3"]]);
    const k = rng.int(2, 4);
    return q({
      prompt: `Expected number of trials until ${ev[0]} has come up ${k === 2 ? "twice" : k + " times"}, not necessarily in a row, when ${ev[2]}?`,
      answer: ev[1] * k,
      format: "number",
      solution:
        `Waiting for the first one costs ${ev[1]} tries on average. After it lands, nothing has changed and the wait for the next one costs ${ev[1]} again. ` +
        `Waits like this simply add: ${k} × ${ev[1]} = ${ev[1] * k}.`,
      traps: mapTraps([
        [ev[1], "That is the wait for the first one only. Each of the others costs the same again."],
        [ev[1] ** k, "Waits add, they do not multiply. Multiplying is for working out the chance of several things all happening."],
        [k, "That is how many successes you want, not how many tries it takes to get them."],
      ]),
      tip: "waiting-time-one-over-p",
    });
  }

  if (rng.chance(0.6)) {
    const pat = rng.pick([
      ["heads then tails", 4, "After a head, another head does not hurt you: you are still waiting for the tail, and the head you already have is still good.",
        "Wait 2 flips on average for the first head. Then wait 2 more for a tail. Any extra heads in between cost nothing, because the head you need is already banked. So 2 + 2 = 4."],
      ["tails then heads", 4, "After a tail, another tail does not hurt you: you are still waiting for the head, and the tail you already have is still good.",
        "Wait 2 flips on average for the first tail. Then wait 2 more for a head. Any extra tails in between cost nothing, because the tail you need is already banked. So 2 + 2 = 4."],
      ["two heads in a row", 6, "A tail lands after your first head half the time, and it wipes the run out so you start again. That restarting is why this costs 6 while heads-then-tails costs only 4.",
        "Wait 2 flips for the first head. Then half the time the next flip is a head and you are done, and half the time it is a tail and you are back to the very beginning. Writing that as E = 2 + 1 + ½·E and solving gives E = 6."],
      ["two tails in a row", 6, "A head lands after your first tail half the time, and it wipes the run out so you start again. That restarting is why this costs 6 while tails-then-heads costs only 4.",
        "Wait 2 flips for the first tail. Then half the time the next flip is a tail and you are done, and half the time it is a head and you are back to the very beginning. Writing that as E = 2 + 1 + ½·E and solving gives E = 6."],
    ]);
    return q({
      prompt: `Flip a fair coin repeatedly. Expected number of flips until you first see ${pat[0]}?`,
      answer: pat[1],
      format: "number",
      solution: pat[3],
      traps: mapTraps([
        [pat[1] === 4 ? 6 : 4, pat[2]],
        [2, "That is the wait for one particular face. This question wants a two-flip pattern."],
      ]),
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
  const terms = [];
  for (let i = 1; i <= n; i++) { h += 1 / i; terms.push(i === 1 ? "1" : `1/${i}`); }
  return q({
    prompt: `Expected number of trials to see ${v[0]} at least once each?`,
    answer: n * h,
    format: "number",
    solution:
      `The first one is free, it arrives immediately. Once you hold j of them, a new one turns up ${n - 0}−j times out of ${n}, ` +
      `so you wait ${n}/(${n}−j) tries for it. Adding those waits up gives ${n} × (${terms.join(" + ")}) = ${Math.round(n * h * 100) / 100}. ` +
      `The last one is the slow part: it alone costs ${n} tries.`,
    traps: mapTraps([
      [n, "That is the fastest it could possibly go, with no repeats at all. Repeats are common, so the real wait is longer."],
      [n * n, "Too long. Waiting gets slower as you go, but not that much slower: the total is a bit under twice the number of trials you would guess."],
    ]),
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
      solution:
        `The draws know nothing about each other, so no position is special. ` +
        `Exactly one of the ${n} has to be the biggest, and each is as likely as the next, so each gets 1/${n}.`,
      traps: mapTraps([
        [j / n, "The position number does not matter. Coming out later does not make a number bigger."],
        [1 / 2, "That would be the answer with only two draws."],
        [1 / fact(n), `That is the chance of one exact ordering of all ${n}. Here you only care which one is on top.`],
      ]),
      tip: "symmetry-orderings",
    });
  }

  if (level === 2) {
    const n = rng.int(3, 5);
    const dir = rng.pick(["strictly increasing", "strictly decreasing"]);
    return q({
      prompt: `${n} independent draws from a continuous distribution. Probability they come out ${dir} in the order drawn?`,
      answer: 1 / fact(n),
      solution:
        `Whatever ${n} numbers you end up with, they could have arrived in any order, and every order is as likely as any other. ` +
        `There are ${n}! = ${fact(n)} orders and exactly one of them is ${dir}, so 1/${fact(n)}.`,
      traps: mapTraps([
        [1 / n, "That is the chance of one particular number being the biggest. Here the whole order has to be right, which is much harder."],
        [2 / fact(n), "Increasing and decreasing are two separate orders. The question asks for one of them, not either."],
        [1 / 2 ** n, "Ordering is not a run of coin flips. Count the orders instead: there are n! of them."],
      ]),
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
      solution:
        `There are ${N}^${k} = ${N ** k} equally likely sequences in total. An increasing one needs ${k} different values, and each set of ${k} different values ` +
        `can be written in increasing order in exactly one way. The number of such sets is C(${N},${k}) = ${c}, meaning the ways to choose ${k} things from ${N}. ` +
        `So ${c}/${N ** k} = ${frac(c / N ** k)}.`,
      traps: mapTraps([
        [1 / fact(k), "That is the answer when the picks have to be different. Here repeats are allowed, and a repeat can never be increasing, so the answer must be smaller."],
        [1 / k, `Not a per-pick chance. Count the increasing sequences against all ${N ** k} of them.`],
      ]),
      tip: "symmetry-orderings",
    });
  }
  return q({
    prompt: `Pick ${k} distinct numbers from 1–${N}, revealed in random order. Probability they come out strictly increasing?`,
    answer: 1 / fact(k),
    solution:
      `Whichever ${k} numbers you get, they can appear in ${k}! = ${fact(k)} orders, all equally likely, and one of those is increasing. ` +
      `So 1/${fact(k)}. Notice the pool size ${N} never enters the answer.`,
    traps: mapTraps([
      [1 / N, `Once the ${k} numbers are different, the size of the pool stops mattering. Only the number of orders counts.`],
      [k / N, `The pool size cancels out. Any ${k} different values have ${fact(k)} equally likely orders and one is increasing.`],
    ]),
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
      solution: sw
        ? "Your first pick is right 1 time in 3. The other 2 times in 3 the car sits behind one of the two doors you did not pick, and the host has just shown you which of those two it is not. So switching hands you the car exactly when your first pick was wrong: 2/3."
        : "Staying wins exactly when your first pick was right. That was 1 in 3 before the host opened anything, and the host was always going to be able to show you a goat, so it is still 1 in 3 afterwards.",
      traps: mapTraps([
        [1 / 2, "Two doors are left, but they are not equally likely. The host is not choosing at random: he knows where the car is and never opens it, and that is information about the door he left shut."],
        [sw ? 1 / 3 : 2 / 3, "That is the answer for the other strategy. Check whether the question says switch or stay."],
      ]),
      tip: "host-knows-something",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const N = rng.pick([4, 5, 5, 6, 8, 10]);
      const i = rng.int(1, N - 1);
      return q({
        prompt: `A holds ${i} coins and B holds ${N - i}. They play a fair game; each round the loser hands the winner one coin, until someone has none. Probability A ends up with everything?`,
        answer: i / N,
        solution:
          `Neither player has an edge in a single round, so nobody gains or loses on average, and your chance of taking the lot is simply your share of the coins on the table: ` +
          `${i} out of ${N}, which is ${frac(i / N)}. Coins are the only advantage in this game.`,
        traps: mapTraps([
          [1 / 2, "Each round is fair, but the whole game is not. Whoever starts with fewer coins runs out first far more often."],
          [(N - i) / N, "That is B's chance of winning, not A's. The two have to add up to 1."],
          [1 / N, "The chance follows the whole starting pile, not a single coin."],
        ]),
        tip: "ruin-share-of-the-pot",
      });
    }
    const ev = rng.pick([["rolls a 6", 1 / 6], ["flips heads", 1 / 2], ["rolls a 5 or 6", 1 / 3]]);
    const p = ev[1];
    return q({
      prompt: `A and B take turns and whoever ${ev[0]} first wins. A goes first. Probability A wins?`,
      answer: 1 / (2 - p),
      solution:
        `Call A's chance P. Two things can happen. A succeeds straight away, chance ${frac(p)}. Or A misses and B misses, chance ${frac((1 - p) ** 2)}, ` +
        `and then it is A's turn again with nothing changed, so A's chance is P once more. That gives P = ${frac(p)} + ${frac((1 - p) ** 2)}·P, ` +
        `and solving it gives P = ${frac(1 / (2 - p))}. Going first is worth a little over half.`,
      traps: mapTraps([
        [1 / 2, "Going first is a genuine advantage: A gets a chance to win before B ever throws."],
        [p, "That is only A's very first turn. A can also win later, after both players miss."],
        [(1 + p) / 2, "Set it up as one equation instead: A wins now, or both miss and the game is back where it started."],
      ]),
      tip: "first-mover-one-equation",
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
      solution:
        `There are ${n}! = ${fact(n)} ways to fill the envelopes, all equally likely. Of those, ${D} have every letter in the wrong envelope. ` +
        `So the chance of no letter being right is ${D}/${fact(n)} = ${frac(none)}` +
        (asksNone ? "." : `, and at least one being right is everything else: 1 − ${frac(none)} = ${frac(1 - none)}.`),
      traps: mapTraps([
        [asksNone ? 1 - none : none, "That is the opposite of what was asked. Check whether the question says no letter or at least one."],
        [1 / n, "That is about one named letter. The question is about the whole arrangement at once."],
        [1 / fact(n), "That is the chance of the single perfect arrangement where every letter lands correctly."],
      ]),
      tip: "symmetry-orderings",
    });
  }

  if (kind === "walk") {
    const n = rng.pick([1, 2, 3]);
    const c = choose(2 * n, n);
    return q({
      prompt: `A walker on the integers takes each step +1 or −1 with probability ½. Probability of standing back at the start after ${2 * n} steps?`,
      answer: c / 4 ** n,
      solution:
        `Getting home after ${2 * n} steps means exactly ${n} steps forward and ${n} steps back, in any order. ` +
        `The number of orders is C(${2 * n},${n}) = ${c}, meaning the ways to choose which ${n} of the ${2 * n} steps go forward. ` +
        `Every one of the 2^${2 * n} = ${4 ** n} possible walks is equally likely, so ${c}/${4 ** n} = ${frac(c / 4 ** n)}.`,
      traps: mapTraps([
        [1 / 2, "Coming home is one particular outcome among many, not a coin flip between home and not home."],
        [1 / 2 ** n, `Count the walks: ${c} of the ${4 ** n} possible ones end where they started.`],
      ]),
      tip: "equally-likely",
    });
  }

  if (kind === "cards") {
    const v = rng.pick([
      ["of the same suit", 12 / 51, "The first card can be anything at all, so ignore it. Of the 51 cards left, 12 share its suit. So 12/51, which is 4/17.",
        [[1 / 4, "That would be right if the second card had to be a named suit. It only has to match the first, and one card of that suit has already left the deck."], [1 / 13, "That is about ranks like queens, not about suits."]]],
      ["a pair, meaning the same rank", 3 / 51, "The first card can be anything at all, so ignore it. Of the 51 cards left, 3 share its rank. So 3/51, which is 1/17.",
        [[1 / 13, "Three cards of that rank remain out of 51, not four out of 52: the first card is already in your hand."], [1 / 52, "That is one specific card."]]],
      ["both red", 25 / 102, "The first card is red 26 times in 52, which is 1/2. Then 25 reds remain among 51 cards. Multiply: 1/2 × 25/51 = 25/102, about 0.245.",
        [[1 / 4, "Very close, but the deck changes: after a red leaves, 25 reds remain among 51 cards, not 26 among 52."], [1 / 2, "That is only the first card. The second one has to be red as well."]]],
    ]);
    return q({
      prompt: `Draw 2 cards from a standard 52-card deck without replacement. Probability they are ${v[0]}?`,
      answer: v[1],
      solution: v[2],
      traps: mapTraps(v[3]),
      tip: "condition-shrinks-the-space",
    });
  }

  const v = rng.pick([
    ["|X − Y| < ½", 3 / 4, "Draw a 1 by 1 square with X across and Y up. The points where the two differ by less than ½ form a band down the middle. What it leaves out is two corner triangles, each with legs ½ and area 1/8. So 1 − 2 × 1/8 = 3/4.",
      [[1 / 2, "The band is wider than half the square. Draw it: the two corners it misses are triangles of area 1/8 each, so only 1/4 is left out."], [1 / 4, "That is the part left out, not the part asked for."]]],
    ["X + Y < 1", 1 / 2, "Draw a 1 by 1 square. The line X + Y = 1 runs corner to corner, and the region below it is a triangle covering exactly half the square. So 1/2.",
      [[1 / 4, "The line runs corner to corner and cuts the square cleanly in half, so the triangle below it is 1/2, not 1/4."]]],
    ["X > 2Y", 1 / 4, "Draw a 1 by 1 square. The line Y = X/2 passes through the corner and the midpoint of the right edge, and the region below it is a triangle with base 1 and height ½, so area 1/4.",
      [[1 / 2, "That would be the line Y = X. The line Y = X/2 is shallower and cuts off only a quarter."]]],
  ]);
  return q({
    prompt: `X and Y are independent Uniform[0,1]. Probability that ${v[0]}?`,
    answer: v[1],
    solution: v[2],
    traps: mapTraps(v[3]),
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
