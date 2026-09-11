/**
 * Mental arithmetic generators.
 *
 * Every generator takes `(rng, level, t)` and returns a question. `t` is the
 * phrasebook resolved to the reader's language, so the same generator produces
 * English or Vietnamese without knowing which.
 *
 * Levels run 1 to 3 and mean the same thing everywhere: 1 is where a beginner
 * starts and should mostly succeed, 2 is the working level, 3 is where the trick
 * in the tip card stops being optional.
 *
 * Two kinds of feedback ride along with each question. `solution` is the worked
 * line for these exact numbers and is shown whenever the student is wrong, no
 * matter how. `traps` are specific wrong routes, each with the sentence naming
 * the mistake, and only fire when the typed answer matches one.
 */

import { round4 } from "./format.js";

const q = (o) => ({ traps: [], ...o });
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** "17 × 54 = 17 × 50 + 17 × 4 = 850 + 68 = 918" — the split every tip card teaches. */
function splitMul(a, b, t) {
  const tens = Math.floor(b / 10) * 10;
  const units = b % 10;
  if (units === 0 && b >= 10) return t.aTimesDropZero(a, b / 10, (a * b) / 10, a * b);
  if (b < 10) return t.aPlainMul(a, b);
  return t.aSplitMul(a, b, tens, units);
}

/** Left to right, saying each intermediate number: the method that stops dropped hundreds. */
function runningSteps(a, b, sign, t) {
  const parts = [];
  let running = a;
  const digits = String(b).split("").map(Number);
  digits.forEach((d, i) => {
    const place = d * 10 ** (digits.length - 1 - i);
    if (!place) return;
    const from = running;
    running = sign === "+" ? running + place : running - place;
    parts.push(t.aStep(from, sign, place, running));
  });
  return parts.join(", ");
}

/* ── 1. Times tables ─────────────────────────────────────────────────────── */

/**
 * A route to the answer that is worth more than the answer.
 *
 * "7 × 10 = 70" teaches nothing. Reaching a fact from a neighbouring one you
 * already know does, and it is what a student actually does under time when a
 * single entry in the table slips.
 */
function timesTableRoute(a, b, t) {
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  if (big % 10 === 0) return t.aTimesDropZero(big / 10, small, (big / 10) * small, a * b);
  if (big === 11) return t.aTimesEleven(small, a * b);
  if (big === 12) return t.aTimesTwelve(small, a * b);
  if (big > 12) return splitMul(small, big, t);
  return t.aTimesFromTen(small, big, a * b);
}

export function timesTables(rng, level, t) {
  if (level === 3) {
    // Teens times teens. The old level 3 kept one factor at 12 or under, which
    // is level 2 with a bigger partner; 17 × 19 is the table a trader has.
    const a = rng.int(11, 19);
    const b = rng.int(11, 19);
    const ua = a - 10, ub = b - 10;
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: t.aTeens(a, b, ub, a + ub, (a + ub) * 10, ua, ua * ub, a * b),
      traps: [
        { value: (a + ub) * 10, why: t.ttTeensNoUnits(ua, ub, ua * ub) },
        { value: a * (b - 1), why: t.ttRowEarly(a, b - 1) },
        { value: a + b, why: t.ttAddedNotMultiplied() },
      ],
      tip: "split-and-add",
    });
  }
  const hi = level === 1 ? 9 : 12;
  const a = rng.int(2, hi);
  const b = rng.int(2, hi);
  return q({
    prompt: `${a} × ${b}`,
    answer: a * b,
    solution: timesTableRoute(a, b, t),
    traps: [
      { value: a * (b - 1), why: t.ttRowEarly(a, b - 1) },
      { value: a * (b + 1), why: t.ttRowLate(a, b + 1) },
      { value: a + b, why: t.ttAddedNotMultiplied() },
    ],
    tip: "split-and-add",
  });
}

/* ── 2. Addition and subtraction ─────────────────────────────────────────── */
export function addSubtract(rng, level, t) {
  const range = [[23, 99], [100, 999], [1000, 9999]][level - 1];
  const isAdd = rng.chance(0.5);
  const a = rng.int(range[0], range[1]);

  if (isAdd) {
    const b = rng.int(range[0], range[1]);
    return q({
      prompt: `${a} + ${b}`,
      answer: a + b,
      solution: t.aRunningAdd(a, runningSteps(a, b, "+", t)),
      traps: [
        { value: a + b - 10, why: t.ttTenDropped() },
        { value: a + b - 100, why: t.ttHundredDropped() },
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
    solution: t.aRunningSub(a, runningSteps(a, b, "−", t)),
    traps: [
      { value: a - b + 100, why: t.ttHundredLeftIn() },
      { value: a - b - 100, why: t.ttHundredTwice() },
      { value: a - b + 10, why: t.ttBorrowMissed() },
    ],
    tip: "subtract-hundreds-first",
  });
}

/* ── 3. Multiplication ───────────────────────────────────────────────────── */
export function multiply(rng, level, t) {
  if (level === 1) {
    const a = rng.int(12, 99);
    const b = rng.int(3, 9);
    const tens = Math.floor(a / 10) * 10;
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: t.aSplitBigger(a, b, tens, a % 10),
      traps: [
        { value: tens * b, why: t.ttOnlyTensOfA(tens, b, a % 10, (a % 10) * b) },
        { value: (a % 10) * b + Math.floor(a / 10) * b, why: t.ttNoPlaceValue() },
      ],
      tip: "split-and-add",
    });
  }

  if (level === 2) {
    const a = rng.int(12, 49);
    const b = rng.pick([5, 11, 15, 20, 25, 50, 12, 9, 99]);
    const shortcut =
      b === 5 ? t.aHalveTen(a, a * 10, a * 5)
      : b === 50 ? t.aHalveHundred(a, a * 100, a * 50)
      : b === 11 && a < 100 ? t.aElevenDigits(Math.floor(a / 10), a % 10, Math.floor(a / 10) + (a % 10), a * 11)
      : b === 9 ? t.aTakeOneOff(a, 10, a * 9)
      : b === 99 ? t.aTakeOneOff(a, 100, a * 99)
      : b === 25 ? t.aQuarter(a, a * 100, a * 25)
      : splitMul(a, b, t);
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: shortcut,
      traps: [
        { value: a * b - a, why: t.ttOneCopyShort(a) },
        { value: a * b + a, why: t.ttOneCopyOver(a) },
      ],
      tip: "times-five-and-eleven",
    });
  }

  // A quarter of these are built to straddle a round number, because that is
  // exactly the shape the difference-of-squares trick is for, and a trick the
  // drill never presents is a trick nobody learns.
  // Level 3 is what the paper has: two-digit by two-digit is the floor, and
  // three-digit by one- and two-digit is the ceiling. Weighted the way the
  // sitting felt: 3×2 most often.
  const shape = rng.pick(["straddle", "2x2", "2x2", "3x1", "3x2", "3x2"]);

  if (shape === "3x1") {
    const a = rng.int(102, 999);
    const b = rng.int(3, 9);
    const h = Math.floor(a / 100) * 100, tn = Math.floor((a % 100) / 10) * 10, u = a % 10;
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: t.aSplitThree(a, b, h, tn, u, h * b, tn * b, u * b, a * b),
      traps: [
        { value: (tn + u) * b + h, why: t.ttForgotHundreds(h, b, h * b) },
        { value: a * b + 100, why: t.ttCarryHundred(h * b + tn * b, u * b) },
        { value: a * b - 100, why: t.ttHundredDropped() },
      ],
      tip: "split-and-add",
    });
  }

  if (shape === "3x2") {
    const a = rng.int(102, 999);
    const b = rng.int(12, 99);
    const tens = Math.floor(b / 10) * 10;
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: splitMul(a, b, t),
      traps: [
        { value: a * tens, why: t.ttOnlyTens(a, tens, b % 10, a * (b % 10)) },
        { value: a * (b % 10), why: t.ttOnlyUnits(a, b % 10, tens, a * tens) },
        { value: a * b + 100, why: t.ttCarryHundred(a * tens, a * (b % 10)) },
        { value: a * b - 100, why: t.ttHundredDropped() },
      ],
      tip: "split-and-add",
    });
  }

  if (shape === "straddle") {
    const centre = rng.int(3, 9) * 10;
    const d = rng.int(1, 4);
    const lo = centre - d, hi = centre + d;
    return q({
      prompt: `${lo} × ${hi}`,
      answer: lo * hi,
      solution: t.aStraddle(lo, hi, centre, d, centre * centre, d * d, lo * hi),
      traps: [
        { value: centre * centre, why: t.ttCentreOnly(centre, d, d * d) },
        { value: centre * centre + d * d, why: t.ttCentreAdded() },
      ],
      tip: "difference-of-squares",
    });
  }

  const a = rng.int(23, 99);
  const b = rng.int(23, 99);
  const tens = Math.floor(b / 10) * 10;
  return q({
    prompt: `${a} × ${b}`,
    answer: a * b,
    solution: splitMul(a, b, t),
    traps: [
      { value: a * tens, why: t.ttOnlyTens(a, tens, b % 10, a * (b % 10)) },
      { value: a * (b % 10), why: t.ttOnlyUnits(a, b % 10, tens, a * tens) },
      // Recorded misses on this exact question type were 3315 typed as 3355,
      // 6348 as 6388, 4539 as 4549, 3432 as 3462, 555 as 655, 7722 as 7822:
      // every one a carry slipping while the two partial products were added.
      { value: a * b + 10, why: t.ttCarryOver(a * tens, a * (b % 10)) },
      { value: a * b - 10, why: t.ttCarryUnder(a * tens, a * (b % 10)) },
      { value: a * b + 100, why: t.ttCarryHundred(a * tens, a * (b % 10)) },
    ],
    tip: "split-and-add",
  });
}

/* ── 4. Division ─────────────────────────────────────────────────────────── */
function divisionSteps(total, b, ans, t) {
  const chunk = Math.floor(ans / 10) * 10;
  if (!chunk) return t.aDivideDirect(b, ans, total);
  return t.aDivideSteps(total, b, chunk, ans - chunk, ans);
}

export function divide(rng, level, t) {
  if (level === 1) {
    const b = rng.int(2, 9);
    const ans = rng.int(4, 20);
    return q({
      prompt: `${b * ans} ÷ ${b}`,
      answer: ans,
      solution: t.aDivideAsk(b, b * ans, ans),
      traps: [{ value: ans * b, why: t.ttMultipliedNotDivided() }],
      tip: "reduce-before-dividing",
    });
  }

  if (level === 2) {
    const b = rng.int(3, 19);
    const ans = rng.int(11, 60);
    return q({
      prompt: `${b * ans} ÷ ${b}`,
      answer: ans,
      solution: divisionSteps(b * ans, b, ans, t),
      traps: [
        { value: ans + 1, why: t.ttQuotientHigh(b) },
        { value: ans - 1, why: t.ttQuotientLow(b) },
      ],
      tip: "reduce-before-dividing",
    });
  }

  if (rng.chance(0.4)) {
    // The paper does not always divide evenly. Divisors whose fractions stop
    // within two decimal places, so the answer is typed and not rounded.
    const b = rng.pick([4, 5, 20, 25, 50]);
    const whole = rng.int(11, 99);
    const r = rng.int(1, b - 1);
    const total = b * whole + r;
    const frac = round4(r / b);
    return q({
      prompt: `${total} ÷ ${b}`,
      answer: round4(whole + frac),
      solution: t.aDivideRemainder(b, whole, b * whole, total, r, t.n(frac), t.n(round4(whole + frac))),
      traps: [
        { value: whole, why: t.ttDroppedRemainder(r) },
        { value: whole + 1, why: t.ttRoundedUp(r, b) },
        { value: round4(whole + r / 10), why: t.ttRemainderAsTenths(r, b) },
      ],
      tip: "reduce-before-dividing",
    });
  }

  // Divisors up to 79, as the drill that matched the sitting had them.
  const b = rng.int(12, 79);
  const ans = rng.int(11, 99);
  return q({
    prompt: `${b * ans} ÷ ${b}`,
    answer: ans,
    solution: divisionSteps(b * ans, b, ans, t),
    traps: [
      { value: ans + 10, why: t.ttQuotientTen() },
      { value: ans - 10, why: t.ttQuotientTenLow() },
      // Recorded misses: 49 typed as 44, 86 as 82, 99 as 94. Every one an
      // opening estimate pitched low and then never corrected upward.
      { value: ans - 5, why: t.ttQuotientFive(b) },
      { value: ans - 4, why: t.ttQuotientFour(b) },
    ],
    tip: "reduce-before-dividing",
  });
}

/* ── 5. Squares ──────────────────────────────────────────────────────────── */
export function squares(rng, level, t) {
  const range = [[11, 25], [21, 40], [26, 99]][level - 1];
  const n = rng.int(range[0], range[1]);
  const d = n % 10 <= 5 ? n % 10 : n % 10 - 10;
  const slid = (n - d) * (n + d); // the rule-of-one product, before adding d²
  const front = Math.floor(n / 10);
  return q({
    prompt: `${n}²`,
    answer: n * n,
    solution: n % 10 === 5
      ? t.aSquareEndsFive(front, front + 1, front * (front + 1), n * n)
      : d === 0
      ? t.aSquareRound(n, n / 10, n * n)
      : t.aSquareSlide(Math.abs(d), d > 0 ? t.aSlideDown : t.aSlideUp, n,
                       Math.min(n - d, n + d), Math.max(n - d, n + d), slid, d * d, n * n),
    traps: [
      { value: slid, why: t.ttNoCorrection(Math.min(n - d, n + d), Math.max(n - d, n + d), slid, Math.abs(d), d * d) },
      { value: n * n - 2 * n + 1, why: t.ttOffByOneSquare(n - 1) },
      { value: n * 2, why: t.ttDoubled() },
    ],
    tip: n % 10 === 5 ? "ends-in-five" : "squares-rule-of-one",
  });
}

/* ── 6. Roots and powers ─────────────────────────────────────────────────── */
export function roots(rng, level, t) {
  if (level === 1) {
    const n = rng.int(11, 30);
    return q({
      prompt: `√${n * n}`,
      answer: n,
      solution: t.aSqrtAsk(n * n, n),
      traps: [{ value: (n * n) / 2, why: t.ttHalvedNotRooted() }],
      tip: "squares-rule-of-one",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const n = rng.int(2, 12);
      return q({
        prompt: `${n}³`,
        answer: n ** 3,
        solution: t.aCubeSteps(n, n * n, n ** 3),
        traps: [
          { value: n * n, why: t.ttSquaredNotCubed(n) },
          { value: n * 3, why: t.ttTimesThree() },
        ],
        tip: "cube-root-last-digit",
      });
    }
    const [b, e] = rng.pick([[2, rng.int(5, 11)], [3, rng.int(3, 6)], [5, rng.int(3, 5)]]);
    return q({
      prompt: `${b}^${e}`,
      answer: b ** e,
      solution: t.aPowerSteps(b, e, Array(e).fill(b).join(" × "), b ** e),
      traps: [
        { value: b ** (e - 1), why: t.ttOneFactorShort(b, e - 1, e) },
        { value: b * e, why: t.ttBaseTimesExp() },
      ],
      tip: "cube-root-last-digit",
    });
  }

  const n = rng.int(11, 25);
  const cube = n ** 3;
  const tens = Math.floor(n / 10);
  const lastDigitTrap = { 2: 2, 3: 3, 7: 7, 8: 8 }[n % 10];
  const traps = [{ value: Math.round(cube / 3), why: t.ttDividedByThree() }];
  if (lastDigitTrap != null) {
    traps.unshift({ value: n - (n % 10) + lastDigitTrap, why: t.ttCubeLastDigit(cube % 10, n % 10) });
  }
  return q({
    prompt: t.aCubeRoot(cube),
    answer: n,
    solution: t.aCubeRootSol(cube, tens, (tens * 10) ** 3, ((tens + 1) * 10) ** 3, cube % 10, n % 10, n),
    traps,
    tip: "cube-root-last-digit",
  });
}

/* ── 7. Fractions ────────────────────────────────────────────────────────── */
const DENOMS = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50];

export function fractions(rng, level, t) {
  if (level === 1) {
    const d = rng.pick([2, 4, 5, 8, 10]);
    const n = rng.int(1, d - 1);
    return q({
      prompt: t.aFracToDec(n, d),
      answer: round4(n / d),
      solution: t.aOneOverD(d, t.n(round4(1 / d)), n, t.n(round4(n / d))),
      traps: [{ value: round4(d / n), why: t.ttUpsideDown() }],
      tip: "fraction-anchors",
    });
  }

  const d1 = rng.pick(DENOMS);
  const d2 = rng.pick(DENOMS);
  const n1 = rng.int(1, d1 - 1);
  const n2 = rng.int(1, d2 - 1);

  if (level === 2) {
    const top = n1 * n2;
    const bot = d1 * d2;
    const g = gcd(top, bot);
    return q({
      prompt: `${n1}/${d1} × ${n2}/${d2}`,
      answer: round4(top / bot),
      solution: t.aFracMul(n1, n2, top, d1, d2, bot,
                           g > 1 ? `${top / g}/${bot / g}` : null, t.n(round4(top / bot))),
      traps: [
        { value: round4(n1 / d1 + n2 / d2), why: t.ttAddedNotMultipliedFrac() },
        { value: round4(top / (d1 + d2)), why: t.ttBottomsAdded() },
      ],
      tip: "fraction-anchors",
    });
  }

  const op = rng.pick(["add", "sub", "div", "div"]);
  const lcm = (d1 * d2) / gcd(d1, d2);

  if (op === "div") {
    // Flip the second and multiply. The most-reported trap is multiplying
    // straight across without flipping, so it is the first one listed.
    const top = n1 * d2, bot = d1 * n2;
    const g = gcd(top, bot);
    return q({
      prompt: `${n1}/${d1} ÷ ${n2}/${d2}`,
      answer: round4(top / bot),
      solution: t.aFracDiv(n1, d1, n2, d2, d2, n2, top, bot,
                           g > 1 ? `${top / g}/${bot / g}` : null, t.n(round4(top / bot))),
      traps: [
        { value: round4((n1 * n2) / (d1 * d2)), why: t.ttNotFlipped() },
        { value: round4((d1 * n2) / (n1 * d2)), why: t.ttFlippedWrongOne() },
      ],
      tip: "fraction-anchors",
    });
  }

  if (op === "sub") {
    // Keep it positive: the paper never asks for a negative fraction.
    const [big, small] = n1 / d1 >= n2 / d2 ? [[n1, d1], [n2, d2]] : [[n2, d2], [n1, d1]];
    if (big[0] * small[1] === small[0] * big[1]) return fractions(rng, level, t);   // equal: redraw
    const a1 = (big[0] * lcm) / big[1], a2 = (small[0] * lcm) / small[1];
    return q({
      prompt: `${big[0]}/${big[1]} − ${small[0]}/${small[1]}`,
      answer: round4(big[0] / big[1] - small[0] / small[1]),
      solution: t.aFracSub(big[0], big[1], a1, small[0], small[1], a2, lcm, a1 - a2,
                           t.n(round4(big[0] / big[1] - small[0] / small[1]))),
      traps: [
        { value: round4((big[0] - small[0]) / (big[1] - small[1] || 1)), why: t.ttTopsAndBottoms() },
        { value: round4(big[0] / big[1] + small[0] / small[1]), why: t.ttAddedNotSubtracted() },
      ],
      tip: "fraction-anchors",
    });
  }

  return q({
    prompt: `${n1}/${d1} + ${n2}/${d2}`,
    answer: round4(n1 / d1 + n2 / d2),
    solution: t.aFracAdd(n1, d1, (n1 * lcm) / d1, n2, d2, (n2 * lcm) / d2, lcm,
                         (n1 * lcm) / d1 + (n2 * lcm) / d2, t.n(round4(n1 / d1 + n2 / d2))),
    traps: [
      { value: round4((n1 + n2) / (d1 + d2)), why: t.ttTopsAndBottoms() },
      { value: round4((n1 * n2) / (d1 * d2)), why: t.ttMultipliedNotAdded() },
    ],
    tip: "fraction-anchors",
  });
}

/* ── 8. Percentages ──────────────────────────────────────────────────────── */
export function percent(rng, level, t) {
  if (level === 1) {
    const p = rng.pick([10, 20, 25, 50, 5]);
    const y = rng.pick([40, 60, 80, 120, 200, 240, 400, 500]);
    const ten = y / 10;
    const solution =
      p === 50 ? t.aPctHalf(y, y / 2)
      : p === 25 ? t.aPctQuarter(y, y / 2, y / 4)
      : p === 10 ? t.aPctTenth(y, t.n(ten))
      : t.aPctFromTen(p, y, t.n(ten), t.n(round4((p * y) / 100)));
    return q({
      prompt: t.aPercentOf(p, y),
      answer: round4((p * y) / 100),
      solution,
      traps: [
        { value: round4((p * y) / 10), why: t.ttFactorOfTen() },
        { value: round4(y / p), why: t.ttDividedByPercent(p, y) },
      ],
      tip: "percent-flip",
    });
  }

  if (level === 2) {
    const p = rng.pick([12.5, 15, 30, 35, 40, 45, 60, 75, 80, 90, 2.5, 7.5, 17.5]);
    const y = rng.pick([64, 96, 150, 160, 250, 320, 360, 480, 640, 800, 1200]);
    const ten = y / 10;
    return q({
      prompt: t.aPercentOf(t.n(p), y),
      answer: round4((p * y) / 100),
      solution: t.aPctBuild(t.n(round4(ten)), t.n(round4(p / 10)), t.n(p), t.n(round4((p * y) / 100)), y),
      traps: [{ value: round4((p * y) / 1000), why: t.ttFactorOfTenCheck() }],
      tip: "percent-flip",
    });
  }

  const kind = rng.pick(["what", "any", "any", "chain"]);

  if (kind === "any") {
    // 37% of 200. The drill that matched the sitting logged this as the gap:
    // percentages here only ever came in the pretty sizes. Base a multiple of
    // ten, so the answer has at most one decimal place.
    const p = rng.int(3, 97);
    const y = rng.pick([...Array(57).keys()].map((i) => (i + 4) * 10).filter((v) => v !== 100));  // 100 makes it trivial
    const one = y / 100;
    return q({
      prompt: t.aPercentOf(p, y),
      answer: round4(p * one),
      solution: t.aPctOnePercent(y, t.n(one), p, t.n(round4(p * one))),
      traps: [
        { value: round4(p * one * 10), why: t.ttFactorOfTen() },
        { value: round4(p * one / 10), why: t.ttFactorOfTenCheck() },
      ],
      tip: "percent-flip",
    });
  }

  if (kind === "chain") {
    const y = rng.pick([200, 400, 500, 800, 1000]);
    const up = rng.pick([10, 15, 20, 25, 30, 40, 50]);
    const down = rng.pick([10, 20, 25, 30, 40, 50]);
    const mid = round4(y * (1 + up / 100));
    const end = round4(mid * (1 - down / 100));
    return q({
      prompt: t.aAskPctChain(y, up, down),
      answer: end,
      solution: t.aPctChain(y, up, t.n(round4(1 + up / 100)), t.n(mid), down, t.n(round4(1 - down / 100)), t.n(end)),
      traps: [
        { value: round4(y * (1 + (up - down) / 100)), why: t.ttChainAdded(up, down) },
        { value: mid, why: t.ttChainHalfDone(down) },
      ],
      tip: "percent-flip",
    });
  }

  const y = rng.pick([40, 50, 80, 120, 160, 200, 250, 400, 500, 800]);
  // Clamping x to y used to turn one question in fourteen into "y is what % of
  // y", which answers 100 and teaches nothing. Draw from what actually fits.
  const below = [2, 4, 5, 8, 10, 16, 20, 25, 32, 40, 50, 60, 75, 100, 120, 150, 200].filter((v) => v < y);
  const x = rng.pick(below);
  return q({
    prompt: t.aWhatPercent(x, y),
    answer: round4((100 * x) / y),
    solution: t.aPctOfWhole(x, y, t.n(round4(x / y)), t.n(round4((100 * x) / y))),
    traps: [
      { value: round4((100 * y) / x), why: t.ttSwapped() },
      { value: round4(x / y), why: t.ttNotAPercent() },
    ],
    tip: "percent-flip",
  });
}

/* ── 9. Estimation ───────────────────────────────────────────────────────── */
export function estimate(rng, level, t) {
  const kind = level === 1 ? rng.pick(["div", "div", "sqrt"]) : rng.pick(["div", "mul", "sqrt"]);
  if (kind === "div") {
    const a = rng.int(1000, 9999);
    const b = rng.int(11, 97);
    const rb = Math.round(b / 10) * 10 || 10;
    // Rounding the divisor alone can miss by 10%, which the 5% tolerance rejects.
    // So state the correction as well, which is what a person does out loud.
    const first = a / rb;
    const pct = Math.round((Math.abs(rb - b) / b) * 100);
    const est = Math.round((a / b) * 10) / 10;
    return q({
      prompt: `≈ ${a} ÷ ${b}`,
      answer: a / b,
      approx: true,
      solution: t.aEstDiv(a, rb, t.n(Math.round(first * 10) / 10), b, pct,
                          b < rb ? t.aEstLess : t.aEstMore, t.n(est), t.n(est)),
      tip: "reduce-before-dividing",
    });
  }
  if (kind === "mul") {
    const a = rng.int(101, 999);
    const b = rng.int(11, 99) / 100;
    // Round the three-digit number, never the two-decimal one: rounding 0.23 to
    // 0.2 is a 13% move, while rounding 227 to 230 is a 1% move.
    const ra = Math.round(a / 10) * 10;
    return q({
      prompt: `≈ ${a} × ${t.n(b)}`,
      answer: a * b,
      approx: true,
      solution: t.aEstMul(a, ra, t.n(b), t.n(Math.round(ra * b * 10) / 10), t.n(Math.round(a * b * 10) / 10)),
      tip: "percent-flip",
    });
  }
  const a = rng.int(150, 9000);
  const lo = Math.floor(Math.sqrt(a));
  const nearer = a - lo * lo < (lo + 1) ** 2 - a;
  return q({
    prompt: `≈ √${a}`,
    answer: Math.sqrt(a),
    approx: true,
    solution: t.aEstSqrt(lo, lo * lo, lo + 1, (lo + 1) ** 2, a,
                         nearer ? t.aAbove : t.aBelow, nearer ? lo : lo + 1,
                         t.n(Math.round(Math.sqrt(a) * 10) / 10)),
    tip: "sqrt-anchors",
  });
}

/* ── 10. Puzzles: missing digit, balance, two quantities ─────────────────── */
function maskDigit(rng, n) {
  const s = String(n);
  const i = s.length > 1 ? rng.int(1, s.length - 1) : 0; // never mask the leading digit
  return [s.slice(0, i) + "□" + s.slice(i + 1), +s[i], s.length - 1 - i];
}

export function puzzles(rng, level, t) {
  const kinds = level === 1 ? ["balance"] : level === 2 ? ["balance", "missing"] : ["missing", "relation", "largest", "balance"];
  const kind = rng.pick(kinds);

  if (kind === "balance") {
    for (let attempt = 0; attempt < 60; attempt++) {
      const a = rng.pick([2, 3, 4, 5, 6, 8]);
      const c = rng.pick([8, 12, 15, 16, 20, 24, 25, 32, 40, 45]);
      const ans = rng.int(11, 99);
      if ((c * ans) % a) continue;
      const b = (c * ans) / a;
      if (b < 20 || b > 999) continue;
      const g = gcd(a, c);
      return q({
        prompt: `${a} × ${b} = ${c} × ?`,
        answer: ans,
        solution: g > 1
          ? t.aBalanceCancel(g, a, c, `${(a / g) * b}`, c / g, ans)
          : t.aBalanceDirect(a, b, a * b, c, ans),
        traps: [
          { value: round4((a * b) / c + 1), why: t.ttOffByOneDiv() },
          { value: a * b, why: t.ttLeftSideOnly(a, b, c) },
        ],
        tip: "reduce-before-dividing",
      });
    }
    return q({
      prompt: "2 × 232 = 16 × ?",
      answer: 29,
      solution: t.aBalanceCancel(2, 2, 16, "232", 8, 29),
      tip: "reduce-before-dividing",
    });
  }

  if (kind === "missing") {
    if (rng.chance(0.4)) {
      const a = rng.pick([20, 25, 30, 40, 50, 60, 70, 80, 120, 150]);
      const b = rng.int(105, 989);
      const [masked, digit, place] = maskDigit(rng, b);
      return q({
        prompt: `${a} × ${masked} = ${a * b}`,
        answer: digit,
        hint: "digit",
        solution: t.aMissingMul(a * b, a, b, t.aPlaces[place], digit),
        tip: "split-and-add",
      });
    }
    const a = rng.int(1000, 9999);
    const b = rng.int(100, 989);
    const [masked, digit, place] = maskDigit(rng, a);
    const plus = rng.chance(0.5);
    return q({
      prompt: plus ? `${masked} + ${b} = ${a + b}` : `${masked} − ${b} = ${a - b}`,
      answer: digit,
      hint: "digit",
      solution: plus
        ? t.aMissingAdd(a + b, b, a, t.aPlaces[place], digit)
        : t.aMissingSub(a - b, b, a, t.aPlaces[place], digit),
      tip: "subtract-hundreds-first",
    });
  }

  if (kind === "relation") {
    for (let attempt = 0; attempt < 80; attempt++) {
      const b1 = rng.pick([160, 200, 240, 320, 400, 480]);
      const fr = rng.pick([[1, 4], [3, 8], [1, 2], [5, 8], [3, 4], [2, 5], [1, 5]]);
      const b2 = rng.pick([120, 160, 200, 240, 260, 300, 400]);
      const p = rng.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]);
      const A = (b1 * fr[0]) / fr[1];
      const B = (b2 * p) / 100;
      if (A - B < 1) continue;
      return q({
        prompt: t.aRelation(fr[0], fr[1], b1, p, b2),
        answer: round4(A - B),
        solution: t.aRelationSol(b1, fr[1], b1 / fr[1], fr[0], A, b2, t.n(b2 / 10), t.n(round4(B)), t.n(round4(A - B))),
        traps: [
          { value: round4(B - A), why: t.ttWrongWayRound() },
          { value: round4(A + B), why: t.ttAddedNotSubtracted() },
          { value: A, why: t.ttAOnly() },
        ],
        tip: "fraction-anchors",
      });
    }
    return q({
      prompt: t.aRelation(3, 4, 200, 35, 260),
      answer: 59,
      solution: t.aRelationSol(200, 4, 50, 3, 150, 260, "26", "91", "59"),
      tip: "fraction-anchors",
    });
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
    prompt: t.aWhichLargest(),
    options: items.map((it) => it[0]),
    answer: "abcde"[best],
    format: "letter",
    solution: t.aLargestSol(items.map(([lab, v]) => `${lab} = ${v}`).join(", "), items[best][0]),
    traps: [],
    note: t.ttLargestNote(),
    tip: null,
  });
}

/* ── 11. Decimals ────────────────────────────────────────────────────────── */

/** A decimal with exactly `dp` places, built from an integer so it carries no float noise. */
function decimalOf(rng, lo, hi, dp) {
  const scale = 10 ** dp;
  return rng.int(lo * scale, hi * scale) / scale;
}

/** The fractions that hide inside the decimals the paper likes to multiply by. */
const FRACTION_OF = {
  0.25: [1, 4], 0.5: [1, 2], 0.75: [3, 4], 1.5: [3, 2], 2.5: [5, 2],
  0.2: [1, 5], 0.4: [2, 5], 0.125: [1, 8], 1.25: [5, 4], 0.05: [1, 20],
};

/**
 * Three levels, one idea each: line the points up; multiply as whole numbers
 * and put the point back; make the divisor whole before dividing. The sitting
 * had all three, and the drill that matched it named decimal division as the
 * single biggest gap against the real paper.
 */
export function decimals(rng, level, t) {
  if (level === 1) {
    let a = decimalOf(rng, 1, 40, rng.pick([1, 2]));
    let b = decimalOf(rng, 1, 40, rng.pick([1, 2]));
    const plus = rng.chance(0.5);
    if (!plus && b > a) [a, b] = [b, a];
    // A whole number in a decimal question is a whole-number question; redraw.
    if (a % 1 === 0 || b % 1 === 0 || (!plus && a === b)) return decimals(rng, level, t);
    const ans = round4(plus ? a + b : a - b);
    const wa = Math.floor(a), wb = Math.floor(b);
    const fa = round4(a - wa), fb = round4(b - wb);
    return q({
      prompt: `${t.n(a)} ${plus ? "+" : "−"} ${t.n(b)}`,
      answer: ans,
      solution: plus
        ? t.dSolAdd(wa, wb, wa + wb, t.n(fa), t.n(fb), t.n(round4(fa + fb)), t.n(ans))
        : t.dSolSub(t.n(a), wb, t.n(round4(a - wb)), t.n(fb), t.n(ans)),
      traps: [
        { value: round4(plus ? a + wb : a - wb), why: t.dtForgotFraction(t.n(fb)) },
        { value: round4(ans * 10), why: t.dtPointRight() },
      ],
      tip: "line-up-the-point",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      // 4.5 × 7.2: whole numbers first, then count the places back in.
      const a = decimalOf(rng, 1, 10, 1), b = decimalOf(rng, 1, 10, 1);
      const ia = Math.round(a * 10), ib = Math.round(b * 10);
      const prod = ia * ib;
      const ans = round4(prod / 100);
      return q({
        prompt: `${t.n(a)} × ${t.n(b)}`,
        answer: ans,
        solution: t.dSolMul(t.n(a), t.n(b), ia, ib, prod, t.n(ans)),
        traps: [
          { value: round4(prod / 10), why: t.dtPlacesShort() },
          { value: round4(prod / 1000), why: t.dtPlacesOver() },
        ],
        tip: "point-last",
      });
    }
    const a = rng.pick(Object.keys(FRACTION_OF).map(Number));
    const b = rng.pick([8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120, 36, 72]);
    const [num, den] = FRACTION_OF[a];
    const ans = round4(a * b);
    return q({
      prompt: `${t.n(a)} × ${b}`,
      answer: ans,
      solution: t.dSolMulFrac(t.n(a), num, den, b, t.n(round4(b / den)), t.n(ans)),
      traps: [
        { value: round4(ans * 10), why: t.dtPointRight() },
        { value: round4(ans / 10), why: t.dtPointLeft() },
      ],
      tip: "point-last",
    });
  }

  const d = rng.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1.25, 2.5, 0.125]);
  const quotient = rng.pick([4, 6, 7, 8, 9, 12, 14, 16, 18, 24, 32, 36, 48]);
  const a = round4(d * quotient);
  const places = String(d).split(".")[1].length;
  const scale = 10 ** places;
  const d2 = Math.round(d * scale), a2 = round4(a * scale);
  return q({
    prompt: `${t.n(a)} ÷ ${t.n(d)}`,
    answer: quotient,
    solution: t.dSolDiv(t.n(a), t.n(d), scale, t.n(a2), d2, quotient),
    traps: [
      { value: round4(a / d2), why: t.dtDividendNotScaled(t.n(a), d2) },
      { value: round4(quotient / 10), why: t.dtPointLeft() },
      { value: round4(a * d), why: t.ttMultipliedNotDivided() },
    ],
    tip: "point-last",
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
  "arith.decimals": decimals,
};
