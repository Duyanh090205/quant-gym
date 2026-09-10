/**
 * Mental arithmetic generators.
 *
 * Every generator takes `(rng, level)` and returns a question. Levels run 1 to 3
 * and mean the same thing everywhere: 1 is where a beginner starts and should
 * mostly succeed, 2 is the working level, 3 is where the trick in the tip card
 * stops being optional.
 *
 * Traps are not decoration. Each one is a specific wrong route with a sentence
 * saying what went wrong, so a miss tells the student which mistake they made
 * rather than only that they made one.
 */

import { round4, fact } from "./format.js";

const q = (o) => ({ traps: [], ...o });

/* ── 1. Times tables ─────────────────────────────────────────────────────── */
export function timesTables(rng, level) {
  const hi = level === 1 ? 9 : level === 2 ? 12 : 19;
  const lo = level === 3 ? 11 : 2;
  const a = rng.int(lo, hi);
  const b = rng.int(2, level === 1 ? 9 : 12);
  return q({
    prompt: `${a} × ${b}`,
    answer: a * b,
    traps: [
      { value: a * (b - 1), why: "One row too early in the table." },
      { value: a * (b + 1), why: "One row too far down the table." },
      { value: a + b, why: "Added instead of multiplied." },
    ],
    tip: "split-and-add",
  });
}

/* ── 2. Addition and subtraction ─────────────────────────────────────────── */
export function addSubtract(rng, level) {
  const range = [[23, 99], [100, 999], [1000, 9999]][level - 1];
  const isAdd = rng.chance(0.5);
  const a = rng.int(range[0], range[1]);

  if (isAdd) {
    const b = rng.int(range[0], range[1]);
    return q({
      prompt: `${a} + ${b}`,
      answer: a + b,
      traps: [
        { value: a + b - 10, why: "A ten was dropped while carrying." },
        { value: a + b - 100, why: "A hundred was dropped while carrying." },
      ],
      tip: "subtract-hundreds-first",
    });
  }

  // Always positive: the real papers never ask for a negative result, and the
  // sign costs time without testing the technique.
  const b = rng.int(range[0], Math.max(range[0] + 1, a - Math.floor(range[1] / 10)));
  return q({
    prompt: `${a} − ${b}`,
    answer: a - b,
    traps: [
      { value: a - b + 100, why: "A hundred was left in. This is what rounding up and adding back tends to do under time." },
      { value: a - b - 100, why: "A hundred was taken twice." },
      { value: a - b + 10, why: "A borrow was missed in the tens." },
    ],
    tip: "subtract-hundreds-first",
  });
}

/* ── 3. Multiplication ───────────────────────────────────────────────────── */
export function multiply(rng, level) {
  if (level === 1) {
    const a = rng.int(12, 99);
    const b = rng.int(3, 9);
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      traps: [
        { value: Math.floor(a / 10) * 10 * b, why: "Only the tens were multiplied; the units were left behind." },
        { value: (a % 10) * b + Math.floor(a / 10) * b, why: "The partial products were added without their place value." },
      ],
      tip: "split-and-add",
    });
  }

  if (level === 2) {
    const a = rng.int(12, 49);
    const b = rng.pick([5, 11, 15, 20, 25, 50, 12, 9, 99]);
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      traps: [
        { value: a * b - a, why: "One copy of the first number is missing. Check the last step of the split." },
        { value: a * b + a, why: `One copy of ${a} too many. Count the parts of the split again.` },
      ],
      tip: "times-five-and-eleven",
    });
  }

  const a = rng.int(23, 99);
  const b = rng.int(23, 99);
  const tens = Math.floor(b / 10) * 10;
  return q({
    prompt: `${a} × ${b}`,
    answer: a * b,
    traps: [
      { value: a * tens, why: "The units part of the second factor was never added." },
      { value: a * (b % 10), why: "Only the units part was used." },
      { value: a * b - a * 10, why: "A ten went missing between the two partial products." },
    ],
    tip: "split-and-add",
  });
}

/* ── 4. Division ─────────────────────────────────────────────────────────── */
export function divide(rng, level) {
  if (level === 1) {
    const b = rng.int(2, 9);
    const ans = rng.int(4, 20);
    return q({
      prompt: `${b * ans} ÷ ${b}`,
      answer: ans,
      traps: [{ value: ans * b, why: "Multiplied instead of divided." }],
      tip: "reduce-before-dividing",
    });
  }

  if (level === 2) {
    const b = rng.int(3, 19);
    const ans = rng.int(11, 60);
    return q({
      prompt: `${b * ans} ÷ ${b}`,
      answer: ans,
      traps: [
        { value: ans + 1, why: `One too high. Multiply back to check: ${b} times your answer should return the number you started with.` },
        { value: ans - 1, why: `One too low. Multiply back to check: ${b} times your answer should return the number you started with.` },
      ],
      tip: "reduce-before-dividing",
    });
  }

  const b = rng.int(12, 29);
  const ans = rng.int(21, 99);
  return q({
    prompt: `${b * ans} ÷ ${b}`,
    answer: ans,
    traps: [
      { value: ans + 10, why: "A ten too many in the quotient; the place value slipped." },
      { value: ans - 10, why: "A ten short in the quotient." },
    ],
    tip: "reduce-before-dividing",
  });
}

/* ── 5. Squares ──────────────────────────────────────────────────────────── */
export function squares(rng, level) {
  const range = [[11, 25], [21, 40], [26, 59]][level - 1];
  const n = rng.int(range[0], range[1]);
  const d = n % 10 <= 5 ? n % 10 : n % 10 - 10;
  const slid = (n - d) * (n + d); // the rule-of-one product, before adding d²
  return q({
    prompt: `${n}²`,
    answer: n * n,
    traps: [
      { value: slid, why: `The correction was never added. (n−d)(n+d) = ${slid}, and you still owe d² = ${d * d}.` },
      { value: n * n - 2 * n + 1, why: `That is ${n - 1}². Off by one before squaring.` },
      { value: n * 2, why: "Doubled instead of squared." },
    ],
    tip: "squares-rule-of-one",
  });
}

/* ── 6. Roots and powers ─────────────────────────────────────────────────── */
export function roots(rng, level) {
  if (level === 1) {
    const n = rng.int(11, 30);
    return q({
      prompt: `√${n * n}`,
      answer: n,
      traps: [{ value: (n * n) / 2, why: "Halved instead of taking a square root." }],
      tip: "squares-rule-of-one",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const n = rng.int(2, 12);
      return q({
        prompt: `${n}³`,
        answer: n ** 3,
        traps: [
          { value: n * n, why: "Squared instead of cubed." },
          { value: n * 3, why: "Multiplied by 3 instead of raising to the third power." },
        ],
        tip: "cube-root-last-digit",
      });
    }
    const [b, e] = rng.pick([[2, rng.int(5, 11)], [3, rng.int(3, 6)], [5, rng.int(3, 5)]]);
    return q({
      prompt: `${b}^${e}`,
      answer: b ** e,
      traps: [
        { value: b ** (e - 1), why: `That is ${b}^${e - 1}. One factor short; the exponent counts the factors, so there are ${e} of them.` },
        { value: b * e, why: "Multiplied the base by the exponent." },
      ],
      tip: "cube-root-last-digit",
    });
  }

  const n = rng.int(11, 25);
  const cube = n ** 3;
  const lastDigitTrap = { 2: 2, 3: 3, 7: 7, 8: 8 }[n % 10];
  const traps = [{ value: Math.round(cube / 3), why: "Divided by 3 instead of taking a cube root." }];
  if (lastDigitTrap != null) {
    traps.unshift({
      value: n - (n % 10) + lastDigitTrap,
      why: "The last digit of a cube swaps 2 with 8 and 3 with 7. It does not stay put.",
    });
  }
  return q({
    prompt: `∛${cube.toLocaleString("en-US")}`,
    answer: n,
    traps,
    tip: "cube-root-last-digit",
  });
}

/* ── 7. Fractions ────────────────────────────────────────────────────────── */
const DENOMS = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50];

export function fractions(rng, level) {
  if (level === 1) {
    const d = rng.pick([2, 4, 5, 8, 10]);
    const n = rng.int(1, d - 1);
    return q({
      prompt: `${n}/${d} as a decimal`,
      answer: round4(n / d),
      traps: [{ value: round4(d / n), why: "The fraction was read upside down." }],
      tip: "fraction-anchors",
    });
  }

  const d1 = rng.pick(DENOMS);
  const d2 = rng.pick(DENOMS);
  const n1 = rng.int(1, d1 - 1);
  const n2 = rng.int(1, d2 - 1);

  if (level === 2) {
    return q({
      prompt: `${n1}/${d1} × ${n2}/${d2}`,
      answer: round4((n1 * n2) / (d1 * d2)),
      traps: [
        { value: round4(n1 / d1 + n2 / d2), why: "Added instead of multiplied." },
        { value: round4((n1 * n2) / (d1 + d2)), why: "Denominators were added, not multiplied." },
      ],
      tip: "fraction-anchors",
    });
  }

  return q({
    prompt: `${n1}/${d1} + ${n2}/${d2}`,
    answer: round4(n1 / d1 + n2 / d2),
    traps: [
      { value: round4((n1 + n2) / (d1 + d2)), why: "Tops added and bottoms added. Fractions do not work that way; you need a common denominator." },
      { value: round4((n1 * n2) / (d1 * d2)), why: "Multiplied instead of added." },
    ],
    tip: "fraction-anchors",
  });
}

/* ── 8. Percentages ──────────────────────────────────────────────────────── */
export function percent(rng, level) {
  if (level === 1) {
    const p = rng.pick([10, 20, 25, 50, 5]);
    const y = rng.pick([40, 60, 80, 120, 200, 240, 400, 500]);
    return q({
      prompt: `${p}% of ${y}`,
      answer: round4((p * y) / 100),
      traps: [
        { value: round4((p * y) / 10), why: "Out by a factor of ten. Per cent means per hundred." },
        { value: round4(y / p), why: "Divided by the percentage instead of taking that share of it." },
      ],
      tip: "percent-flip",
    });
  }

  if (level === 2) {
    const p = rng.pick([12.5, 15, 30, 35, 40, 45, 60, 75, 80, 90, 2.5, 7.5, 17.5]);
    const y = rng.pick([64, 96, 150, 160, 250, 320, 360, 480, 640, 800, 1200]);
    return q({
      prompt: `${p}% of ${y}`,
      answer: round4((p * y) / 100),
      traps: [{ value: round4((p * y) / 1000), why: "Out by a factor of ten." }],
      tip: "percent-flip",
    });
  }

  const y = rng.pick([40, 50, 80, 120, 160, 200, 250, 400, 500, 800]);
  let x = rng.pick([2, 4, 5, 8, 10, 16, 20, 25, 32, 40, 50, 60, 75, 100, 120, 150, 200]);
  x = Math.min(x, y);
  return q({
    prompt: `${x} is what % of ${y}`,
    answer: round4((100 * x) / y),
    traps: [
      { value: round4((100 * y) / x), why: "The two numbers were swapped. The number after 'of' is the whole." },
      { value: round4(x / y), why: "The share is right but it was never turned into a percentage." },
    ],
    tip: "percent-flip",
  });
}

/* ── 9. Estimation ───────────────────────────────────────────────────────── */
export function estimate(rng, level) {
  const kind = level === 1 ? rng.pick(["div", "div", "sqrt"]) : rng.pick(["div", "mul", "sqrt"]);
  if (kind === "div") {
    const a = rng.int(1000, 9999);
    const b = rng.int(11, 97);
    return q({ prompt: `≈ ${a} ÷ ${b}`, answer: a / b, approx: true, tip: "reduce-before-dividing" });
  }
  if (kind === "mul") {
    const a = rng.int(101, 999);
    const b = rng.int(11, 99) / 100;
    return q({ prompt: `≈ ${a} × ${b}`, answer: a * b, approx: true, tip: "percent-flip" });
  }
  const a = rng.int(150, 9000);
  return q({ prompt: `≈ √${a}`, answer: Math.sqrt(a), approx: true, tip: "squares-rule-of-one" });
}

/* ── 10. Puzzles: missing digit, balance, two quantities ─────────────────── */
function maskDigit(rng, n) {
  const s = String(n);
  const i = s.length > 1 ? rng.int(1, s.length - 1) : 0; // never mask the leading digit
  return [s.slice(0, i) + "□" + s.slice(i + 1), +s[i]];
}

export function puzzles(rng, level) {
  const kinds = level === 1 ? ["balance"] : level === 2 ? ["balance", "missing"] : ["missing", "relation", "largest"];
  const kind = rng.pick(kinds);

  if (kind === "balance") {
    for (let t = 0; t < 60; t++) {
      const a = rng.pick([2, 3, 4, 5, 6, 8]);
      const c = rng.pick([8, 12, 15, 16, 20, 24, 25, 32, 40, 45]);
      const ans = rng.int(11, 99);
      if ((c * ans) % a) continue;
      const b = (c * ans) / a;
      if (b < 20 || b > 999) continue;
      return q({
        prompt: `${a} × ${b} = ${c} × ?`,
        answer: ans,
        traps: [
          { value: round4((a * b) / c + 1), why: "Off by one in the final division." },
          { value: a * b, why: "The left side was computed but never divided by the right factor." },
        ],
        tip: "reduce-before-dividing",
      });
    }
    return q({ prompt: "2 × 232 = 16 × ?", answer: 29, tip: "reduce-before-dividing" });
  }

  if (kind === "missing") {
    if (rng.chance(0.4)) {
      const a = rng.pick([20, 25, 30, 40, 50, 60, 70, 80, 120, 150]);
      const b = rng.int(105, 989);
      const [masked, digit] = maskDigit(rng, b);
      return q({
        prompt: `${a} × ${masked} = ${a * b}`,
        answer: digit,
        hint: "digit",
        tip: "split-and-add",
      });
    }
    const a = rng.int(1000, 9999);
    const b = rng.int(100, 989);
    const [masked, digit] = maskDigit(rng, a);
    const plus = rng.chance(0.5);
    return q({
      prompt: plus ? `${masked} + ${b} = ${a + b}` : `${masked} − ${b} = ${a - b}`,
      answer: digit,
      hint: "digit",
      tip: "subtract-hundreds-first",
    });
  }

  if (kind === "relation") {
    for (let t = 0; t < 80; t++) {
      const b1 = rng.pick([160, 200, 240, 320, 400, 480]);
      const fr = rng.pick([[1, 4], [3, 8], [1, 2], [5, 8], [3, 4], [2, 5], [1, 5]]);
      const b2 = rng.pick([120, 160, 200, 240, 260, 300, 400]);
      const p = rng.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]);
      const A = (b1 * fr[0]) / fr[1];
      const B = (b2 * p) / 100;
      if (A - B < 1) continue;
      return q({
        prompt: `A = ${fr[0]}/${fr[1]} of ${b1},  B = ${p}% of ${b2}.  A − B`,
        answer: round4(A - B),
        traps: [
          { value: round4(B - A), why: "Subtracted the wrong way round." },
          { value: round4(A + B), why: "Added instead of subtracted." },
        ],
        tip: "fraction-anchors",
      });
    }
    return q({ prompt: "A = 3/4 of 200,  B = 35% of 260.  A − B", answer: 59, tip: "fraction-anchors" });
  }

  // largest: comparing powers, answered by letter
  const lo = rng.int(3, 5);
  const items = [];
  for (let b = lo; b < lo + 4; b++) items.push([`${b}^${lo + 7 - b}`, Math.pow(b, lo + 7 - b)]);
  const plain = rng.int(150, 900);
  items.push([String(plain), plain]);
  rng.shuffle(items);
  let best = 0;
  for (let i = 1; i < items.length; i++) if (items[i][1] > items[best][1]) best = i;
  return q({
    prompt: "Which is largest?",
    options: items.map((it) => it[0]),
    answer: "abcde"[best],
    format: "letter",
    tip: null,
    traps: [],
    note: "Comparing only the bases is not enough: 4^7 beats 3^7 and also beats 6^5. Work each one out.",
  });
}

export const ARITHMETIC = {
  "arith.times-tables": timesTables,
  "arith.add-subtract": addSubtract,
  "arith.multiply": multiply,
  "arith.divide": divide,
  "arith.squares": squares,
  "arith.roots": roots,
  "arith.fractions": fractions,
  "arith.percent": percent,
  "arith.estimate": estimate,
  "arith.puzzles": puzzles,
};
