/**
 * Sequence families, and the two things you can ask about a sequence.
 *
 * A family returns `{ terms, next, family, rule }`. The `rule` is a plain-words
 * description of the pattern with this sequence's own numbers in it, and it is
 * what turns a wrong answer into a lesson: without it, "the answer was 47" tells
 * a student nothing about how they were supposed to see it.
 *
 * From one family object we build both question types: "what comes next" and
 * "which term breaks the rule". The second is what Maven actually asks, and it is
 * the harder skill, because you have to hold a candidate rule in mind while
 * testing it against every term.
 */

import { ALPHA } from "./format.js";

const signed = (d) => (d >= 0 ? `add ${d}` : `subtract ${-d}`);
const gapsOf = (s) => s.slice(1).map((v, i) => v - s[i]);

/* ── the families, easiest first ─────────────────────────────────────────── */

const arithmetic = (rng) => {
  const a = rng.int(-20, 60);
  const d = rng.pick([-9, -7, -6, -4, -3, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15, 17]);
  const s = [...Array(6)].map((_, i) => a + d * i);
  return { terms: s.slice(0, 5), next: s[5], family: "arithmetic", rule: `${signed(d)} each time` };
};

const geometric = (rng) => {
  if (rng.chance(0.5)) {
    const a = rng.pick([1, 2, 3, 4, 5, 6, 7]);
    const r = rng.pick([2, 3, 4, -2, -3]);
    const s = [...Array(6)].map((_, i) => a * r ** i);
    return {
      terms: s.slice(0, 5), next: s[5], family: "geometric",
      rule: r < 0 ? `multiply by ${r} each time, so the sign flips every step` : `multiply by ${r} each time`,
    };
  }
  const r = rng.pick([2, 3]);
  const a = r ** 5 * rng.pick([1, 2, 3]);
  const s = [...Array(6)].map((_, i) => a / r ** i);
  return { terms: s.slice(0, 5), next: s[5], family: "geometric", rule: `divide by ${r} each time` };
};

const quadratic = (rng) => {
  const a = rng.pick([1, 1, 2, 3, -1]);
  const b = rng.int(-5, 6);
  const c = rng.int(-10, 15);
  const s = [...Array(6)].map((_, i) => a * i * i + b * i + c);
  const g = gapsOf(s.slice(0, 5));
  return {
    terms: s.slice(0, 5), next: s[5], family: "quadratic",
    rule: `the gaps are ${g.join(", ")}, and they themselves ${signed(2 * a)} each time`,
  };
};

const fibonacci = (rng) => {
  const s = [rng.int(1, 9), rng.int(1, 12)];
  while (s.length < 6) s.push(s[s.length - 1] + s[s.length - 2]);
  return { terms: s.slice(0, 5), next: s[5], family: "Fibonacci", rule: "each term is the two before it added together" };
};

const affine = (rng) => {
  const a = rng.pick([2, 2, 3, 3, -2]);
  const b = rng.pick([-3, -1, 1, 2, 3, 5, -5]);
  const s = [rng.int(1, 8)];
  while (s.length < 6) s.push(s[s.length - 1] * a + b);
  return { terms: s.slice(0, 5), next: s[5], family: "affine", rule: `multiply by ${a}, then ${signed(b)}` };
};

const interleaved = (rng) => {
  const a1 = rng.int(1, 30);
  const d1 = rng.pick([2, 3, 4, 5, 7, -3, -2]);
  const a2 = rng.int(1, 60);
  const d2 = rng.pick([-5, -4, -3, 3, 5, 6, 10]);
  const s = [];
  for (let i = 0; i < 4; i++) s.push(a1 + d1 * i, a2 + d2 * i);
  const n = rng.pick([6, 7]);
  return {
    terms: s.slice(0, n), next: s[n], family: "interleaved",
    rule: `two sequences taking turns: the 1st, 3rd, 5th terms ${signed(d1)}, and the 2nd, 4th, 6th ${signed(d2)}`,
  };
};

const alternatingOps = (rng) => {
  const add = rng.int(1, 5);
  const mul = rng.pick([2, 3]);
  const s = [rng.int(1, 9)];
  while (s.length < 7) {
    const last = s[s.length - 1];
    s.push(s.length % 2 ? last * mul : last + add);
  }
  return {
    terms: s.slice(0, 6), next: s[6], family: "alternating ops",
    rule: `two operations taking turns: multiply by ${mul}, then add ${add}, then multiply by ${mul} again`,
  };
};

const specials = (rng) => {
  const kind = rng.pick(["sq", "cb", "pr", "tri", "fac"]);
  const off = rng.pick([0, 0, 1, -1, 2, 3]);
  // "fac" only has seven entries, so it cannot start as late as the others.
  const st = kind === "fac" ? rng.int(1, 2) : rng.int(1, 4);
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
  const f = {
    sq: (n) => n * n,
    cb: (n) => n ** 3,
    pr: (n) => PRIMES[n - 1],
    tri: (n) => (n * (n + 1)) / 2,
    fac: (n) => [1, 2, 6, 24, 120, 720, 5040][n - 1],
  }[kind];
  const name = { sq: "square numbers", cb: "cube numbers", pr: "prime numbers", tri: "triangular numbers", fac: "factorials 1, 2, 6, 24, 120" }[kind];
  const s = [...Array(6)].map((_, i) => f(st + i) + off);
  return {
    terms: s.slice(0, 5), next: s[5], family: "special numbers",
    rule: off === 0 ? `the ${name}, starting from the ${st}${st === 1 ? "st" : st === 2 ? "nd" : st === 3 ? "rd" : "th"}` : `the ${name} with ${off > 0 ? off + " added" : -off + " taken off"} each time`,
  };
};

const growingDiff = (rng) => {
  let x = rng.int(1, 15);
  let step = rng.int(1, 5);
  const first = step;
  const dd = rng.pick([1, 2, 3]);
  const s = [x];
  while (s.length < 6) {
    x += step;
    step += dd;
    s.push(x);
  }
  return {
    terms: s.slice(0, 5), next: s[5], family: "growing differences",
    rule: `the gaps start at ${first} and grow by ${dd} each time`,
  };
};

const letters = (rng) => {
  const kind = rng.pick(["step", "step", "grow", "pair", "mix"]);
  let s, rule;
  if (kind === "step") {
    const st = rng.int(0, 12);
    const d = rng.pick([2, 3, 4, 5, -2, -3]);
    s = [...Array(6)].map((_, i) => ALPHA[(((st + d * i) % 26) + 26) % 26]);
    rule = `move ${Math.abs(d)} letter${Math.abs(d) > 1 ? "s" : ""} ${d > 0 ? "forward" : "back"} through the alphabet each time`;
  } else if (kind === "grow") {
    let p = rng.int(0, 6);
    let d = rng.int(1, 3);
    const first = d;
    s = [ALPHA[p]];
    while (s.length < 6) {
      p += d;
      d++;
      s.push(ALPHA[p % 26]);
    }
    rule = `the jump through the alphabet starts at ${first} and grows by 1 each time`;
  } else if (kind === "pair") {
    const st = rng.int(0, 10);
    s = [...Array(6)].map((_, i) => ALPHA[(st + i) % 26] + ALPHA[(25 - st - i + 26) % 26]);
    rule = "the first letter moves forward one at a time and the second moves back one at a time";
  } else {
    const st = rng.int(0, 12);
    const d = rng.pick([2, 3, 4]);
    s = [...Array(6)].map((_, i) => ALPHA[(st + d * i) % 26] + String(i + 1));
    rule = `the letter moves ${d} forward each time and the number counts up 1, 2, 3`;
  }
  return { terms: s.slice(0, 5), next: s[5], family: "letters", rule };
};

const cubic = (rng) => {
  const a = rng.pick([1, 1, 2, -1]);
  const b = rng.int(-4, 5);
  const c = rng.int(-6, 8);
  const s = [...Array(6)].map((_, i) => a * i ** 3 + b * i + c);
  const g = gapsOf(s.slice(0, 5));
  return {
    terms: s.slice(0, 5), next: s[5], family: "cubic",
    rule: `the gaps are ${g.join(", ")}; take gaps of those and they grow steadily, which means a cubic pattern`,
  };
};

const productOfPrev = (rng) => {
  const s = [rng.int(2, 4), rng.int(2, 4)];
  while (s.length < 6) {
    const v = s[s.length - 1] * s[s.length - 2];
    if (v > 2e6) break;
    s.push(v);
  }
  if (s.length < 6) return fibonacci(rng);
  return { terms: s.slice(0, 5), next: s[5], family: "product of previous two", rule: "each term is the two before it multiplied together" };
};

const digitSum = (rng) => {
  const dsum = (n) => String(Math.abs(n)).split("").reduce((a, d) => a + +d, 0);
  const s = [rng.int(10, 60)];
  while (s.length < 6) s.push(s[s.length - 1] + dsum(s[s.length - 1]));
  const a = s[0];
  return {
    terms: s.slice(0, 5), next: s[5], family: "add digit sum",
    rule: `add the term's own digits to itself: ${a} + ${String(a).split("").join(" + ")} = ${s[1]}, and so on`,
  };
};

const threeInterleaved = (rng) => {
  const starts = [rng.int(1, 20), rng.int(20, 60), rng.int(60, 99)];
  const ds = [rng.pick([3, 5, 7]), rng.pick([-4, -6, 8]), rng.pick([2, -3, 6])];
  const s = [];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) s.push(starts[k] + ds[k] * i);
  return {
    terms: s.slice(0, 9), next: s[9], family: "three interleaved",
    rule: `three sequences taking turns: every 3rd term from the 1st ${signed(ds[0])}, from the 2nd ${signed(ds[1])}, from the 3rd ${signed(ds[2])}`,
  };
};

const letterSquare = (rng) => {
  const st = rng.int(0, 8);
  const d = rng.pick([2, 3]);
  const s = [...Array(6)].map((_, i) => ALPHA[(st + d * i) % 26] + String((i + 1) ** 2));
  return {
    terms: s.slice(0, 5), next: s[5], family: "letter + square",
    rule: `the letter moves ${d} forward each time and the number runs through the squares 1, 4, 9, 16, 25`,
  };
};

const geometricDiff = (rng) => {
  const a = rng.int(2, 12);
  const d0 = rng.pick([2, 3, 4, 5]);
  const r = rng.pick([2, 3, -2, -3]);
  const s = [a];
  let d = d0;
  const gaps = [];
  while (s.length < 7) {
    gaps.push(d);
    s.push(s[s.length - 1] + d);
    d *= r;
  }
  return {
    terms: s.slice(0, 6), next: s[6], family: "geometric differences",
    rule: `the gaps are ${gaps.slice(0, 5).join(", ")} — each gap is the one before it multiplied by ${r}`,
  };
};

const affineBig = (rng) => {
  for (let t = 0; t < 40; t++) {
    const a = rng.pick([2, 3]);
    const b = rng.pick([7, 9, 11, 13, 17, 19, 23]);
    const s = [rng.int(4, 19)];
    while (s.length < 5) s.push(s[s.length - 1] * a + b);
    if (s.every((v) => v > 0 && v < 6000)) {
      return { terms: s.slice(0, 4), next: s[4], family: "affine, large coefficients", rule: `multiply by ${a}, then add ${b}` };
    }
  }
  return { terms: [19, 28, 55, 136], next: 379, family: "affine, large coefficients", rule: "multiply by 3, then subtract 29" };
};

const skipList = (rng) => {
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];
  const kind = rng.pick(["prime", "square", "tri", "cube"]);
  const list =
    kind === "prime" ? PRIMES
    : kind === "square" ? [...Array(20)].map((_, i) => (i + 1) ** 2)
    : kind === "tri" ? [...Array(20)].map((_, i) => ((i + 1) * (i + 2)) / 2)
    : [...Array(14)].map((_, i) => (i + 1) ** 3);
  const skip = rng.pick([2, 2, 3]);
  const st = rng.int(0, Math.max(0, list.length - 1 - skip * 5));
  const s = [...Array(6)].map((_, i) => list[st + i * skip]).filter((v) => v != null);
  if (s.length < 6) return { terms: [37, 43, 53, 61, 71], next: 79, family: "skip · primes", rule: "prime numbers, taking every other one" };
  const label = { prime: "primes", square: "squares", tri: "triangular", cube: "cubes" }[kind];
  const word = { prime: "prime numbers", square: "square numbers", tri: "triangular numbers", cube: "cube numbers" }[kind];
  return {
    terms: s.slice(0, 5), next: s[5], family: "skip · " + label,
    rule: `${word}, taking every ${skip === 2 ? "other one" : skip + "rd one"}`,
  };
};

const WORD_LISTS = [
  { name: "the numbers spelled out: One, Two, Three, Four…", items: ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"] },
  { name: "the positions spelled out: First, Second, Third…", items: ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"] },
  { name: "the months of the year", items: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
  { name: "the days of the week", items: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
];

const wordInitials = (rng) => {
  const list = rng.pick(WORD_LISTS);
  const st = rng.int(0, list.items.length - 6);
  const s = [...Array(6)].map((_, i) => list.items[st + i][0]);
  const shown = list.items.slice(st, st + 6).join(", ");
  return {
    terms: s.slice(0, 5), next: s[5], family: "word initials",
    rule: `these are not alphabet steps at all — they are the first letters of ${list.name}. Here: ${shown}`,
  };
};

/* ── family pools by level ───────────────────────────────────────────────── */

const EASY = [arithmetic, arithmetic, geometric, geometric, fibonacci, specials];
const MEDIUM = [quadratic, affine, interleaved, alternatingOps, growingDiff, letters, specials, fibonacci, cubic];
const HARD = [
  geometricDiff, affineBig, skipList, wordInitials, threeInterleaved,
  digitSum, letterSquare, productOfPrev, cubic, interleaved, letters,
];

const POOLS = { 1: EASY, 2: MEDIUM, 3: HARD };

export function drawFamily(rng, level) {
  return rng.pick(POOLS[level] || MEDIUM)(rng);
}

/* ── question type 1: what comes next ────────────────────────────────────── */
export function findRule(rng, level) {
  const s = drawFamily(rng, level);
  const isLetters = typeof s.next === "string";
  return {
    prompt: s.terms.join(",  ") + ",  ?",
    answer: s.next,
    format: isLetters ? "letter-term" : "number",
    family: s.family,
    solution: `The rule: ${s.rule}. Carrying it on from ${s.terms[s.terms.length - 1]} gives ${s.next}.`,
    traps: [],
    tip: "sequence-differences",
  };
}

/* ── question type 2: which term breaks the rule ─────────────────────────── */
export function oddOneOut(rng, level) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const s = drawFamily(rng, level);
    const full = [...s.terms, s.next].slice(0, 10);
    if (full.length < 6) continue;

    const i = rng.int(1, full.length - 1); // never break the first term
    let broken;
    if (typeof full[i] === "string") {
      broken = full[i].replace(/[A-Z]/, (ch) => ALPHA[(ALPHA.indexOf(ch) + rng.pick([1, -1, 2, -2]) + 26) % 26]);
    } else {
      const v = full[i];
      const mag = Math.abs(v) >= 60 ? Math.max(2, Math.round(Math.abs(v) * 0.08)) : rng.pick([1, 2, 3]);
      broken = v + rng.pick([mag, -mag]);
    }

    // The broken term must be unmistakable: not equal to what it replaced, and
    // not a duplicate of some other term, or the question has two valid answers.
    if (String(broken) === String(full[i])) continue;
    if (full.map(String).includes(String(broken))) continue;

    const shown = full.slice();
    shown[i] = broken;
    return {
      prompt: shown.join(",  "),
      answer: String(broken),
      format: "odd-term",
      terms: shown.map(String),
      position: i,
      shouldBe: String(full[i]),
      family: s.family,
      solution:
        `Find the rule most of them follow: ${s.rule}. ` +
        `Every term fits it except position ${i + 1}, which shows ${broken} where the rule needs ${full[i]}.`,
      traps: [],
      tip: "odd-one-out-majority",
    };
  }
  return {
    prompt: "3,  6,  10,  12,  15,  18",
    answer: "10",
    format: "odd-term",
    terms: ["3", "6", "10", "12", "15", "18"],
    position: 2,
    shouldBe: "9",
    family: "arithmetic",
    solution: "Find the rule most of them follow: add 3 each time. Every term fits it except position 3, which shows 10 where the rule needs 9.",
    traps: [],
    tip: "odd-one-out-majority",
  };
}

export const SEQUENCES = {
  "seq.find-rule": findRule,
  "seq.odd-one-out": oddOneOut,
};
