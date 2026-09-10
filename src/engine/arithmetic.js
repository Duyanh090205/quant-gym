/**
 * Mental arithmetic generators.
 *
 * Every generator takes `(rng, level)` and returns a question. Levels run 1 to 3
 * and mean the same thing everywhere: 1 is where a beginner starts and should
 * mostly succeed, 2 is the working level, 3 is where the trick in the tip card
 * stops being optional.
 *
 * Two kinds of feedback ride along with each question. `solution` is the worked
 * line for these exact numbers and is shown whenever the student is wrong, no
 * matter how. `traps` are specific wrong routes, each with the sentence naming
 * the mistake, and only fire when the typed answer matches one.
 */

import { round4 } from "./format.js";

const q = (o) => ({ traps: [], ...o });

/** "17 × 54 = 17 × 50 + 17 × 4 = 850 + 68 = 918" — the split every tip card teaches. */
function splitMul(a, b) {
  const tens = Math.floor(b / 10) * 10;
  const units = b % 10;
  if (units === 0 && b >= 10) return `Drop the zero: ${a} × ${b / 10} = ${(a * b) / 10}, then put it back: ${a * b}`;
  if (b < 10) return `${a} × ${b} = ${a * b}`;
  return `${a} × ${b} = ${a} × ${tens} + ${a} × ${units} = ${a * tens} + ${a * units} = ${a * b}`;
}

/** Left to right, saying each intermediate number: the method that stops dropped hundreds. */
function runningSteps(a, b, sign) {
  const parts = [];
  let running = a;
  const digits = String(b).split("").map(Number);
  digits.forEach((d, i) => {
    const place = d * 10 ** (digits.length - 1 - i);
    if (!place) return;
    running = sign === "+" ? running + place : running - place;
    parts.push(`${sign} ${place} = ${running}`);
  });
  return `${a} ${parts.join(", ")}`;
}

/**
 * A route to the answer that is worth more than the answer.
 *
 * "7 × 10 = 70" teaches nothing. Reaching a fact from a neighbouring one you
 * already know does, and it is what a student actually does under time when a
 * single entry in the table slips.
 */
function timesTableRoute(a, b) {
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  if (big % 10 === 0) return `Drop the zero: ${big / 10} × ${small} = ${(big / 10) * small}, then put it back: ${a * b}`;
  if (big === 11) return `11 × ${small} = ${small} × 10 + ${small} = ${small * 10} + ${small} = ${a * b}`;
  if (big === 12) return `12 × ${small} = ${small} × 10 + ${small} × 2 = ${small * 10} + ${small * 2} = ${a * b}`;
  if (big > 12) return splitMul(small, big);
  // Both single digits: reach it from the ten-times fact, which nobody forgets.
  return `${small} × ${big} = ${a * b}. If it slips, come at it from ${small} × 10 = ${small * 10}, then take off ${small} × ${10 - big} = ${small * (10 - big)}: ${small * 10} − ${small * (10 - big)} = ${a * b}`;
}

/* ── 1. Times tables ─────────────────────────────────────────────────────── */
export function timesTables(rng, level) {
  const hi = level === 1 ? 9 : level === 2 ? 12 : 19;
  const lo = level === 3 ? 11 : 2;
  const a = rng.int(lo, hi);
  const b = rng.int(2, level === 1 ? 9 : 12);
  return q({
    prompt: `${a} × ${b}`,
    answer: a * b,
    solution: timesTableRoute(a, b),
    traps: [
      { value: a * (b - 1), why: `That is ${a} × ${b - 1}. One row too early in the table.` },
      { value: a * (b + 1), why: `That is ${a} × ${b + 1}. One row too far down the table.` },
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
      solution: `Add the big part first and say each number out loud: ${runningSteps(a, b, "+")}`,
      traps: [
        { value: a + b - 10, why: "A ten went missing while carrying." },
        { value: a + b - 100, why: "A hundred went missing while carrying. Say the running total out loud at each step and it stops happening." },
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
    solution: `Take the big part away first and say each number out loud: ${runningSteps(a, b, "−")}`,
    traps: [
      { value: a - b + 100, why: "A hundred was left in. This is what rounding up and adding back tends to do when you are rushed; going left to right never does it." },
      { value: a - b - 100, why: "A hundred was taken away twice." },
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
    const tens = Math.floor(a / 10) * 10;
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: `Split the bigger number: ${a} × ${b} = ${tens} × ${b} + ${a % 10} × ${b} = ${tens * b} + ${(a % 10) * b} = ${a * b}`,
      traps: [
        { value: tens * b, why: `That is only ${tens} × ${b}. The units, ${a % 10} × ${b} = ${(a % 10) * b}, still have to be added.` },
        { value: (a % 10) * b + Math.floor(a / 10) * b, why: "The two halves were added without their place value: the tens part is worth ten times what it looks." },
      ],
      tip: "split-and-add",
    });
  }

  if (level === 2) {
    const a = rng.int(12, 49);
    const b = rng.pick([5, 11, 15, 20, 25, 50, 12, 9, 99]);
    const shortcut =
      b === 5 ? `${a} × 10 = ${a * 10}, then halve: ${a * 5}`
      : b === 50 ? `${a} × 100 = ${a * 100}, then halve: ${a * 50}`
      : b === 11 && a < 100 ? `Outer digits ${Math.floor(a / 10)} and ${a % 10}, their sum ${Math.floor(a / 10) + (a % 10)} goes in the middle: ${a * 11}`
      : b === 9 ? `${a} × 10 = ${a * 10}, then take one ${a} off: ${a * 9}`
      : b === 99 ? `${a} × 100 = ${a * 100}, then take one ${a} off: ${a * 99}`
      : b === 25 ? `${a} × 100 = ${a * 100}, then quarter it: ${a * 25}`
      : splitMul(a, b);
    return q({
      prompt: `${a} × ${b}`,
      answer: a * b,
      solution: shortcut,
      traps: [
        { value: a * b - a, why: `One copy of ${a} is missing. Check the last step of the split.` },
        { value: a * b + a, why: `One copy of ${a} too many. Count the parts of the split again.` },
      ],
      tip: "times-five-and-eleven",
    });
  }

  // A quarter of these are built to straddle a round number, because that is
  // exactly the shape the difference-of-squares trick is for, and a trick the
  // drill never presents is a trick nobody learns.
  if (rng.chance(0.25)) {
    const centre = rng.int(3, 9) * 10;
    const d = rng.int(1, 4);
    const lo = centre - d, hi = centre + d;
    return q({
      prompt: `${lo} × ${hi}`,
      answer: lo * hi,
      solution: `They sit either side of ${centre}, ${d} away each. So ${centre}² − ${d}² = ${centre * centre} − ${d * d} = ${lo * hi}`,
      traps: [
        { value: centre * centre, why: `That is ${centre}², the halfway point. You still have to take off the gap squared, ${d}² = ${d * d}.` },
        { value: centre * centre + d * d, why: "The correction was added instead of taken off. The product of two numbers either side of a centre is always below the centre squared." },
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
    solution: splitMul(a, b),
    traps: [
      { value: a * tens, why: `That is only ${a} × ${tens}. The units part, ${a} × ${b % 10} = ${a * (b % 10)}, still has to be added.` },
      { value: a * (b % 10), why: `That is only ${a} × ${b % 10}. The tens part, ${a} × ${tens} = ${a * tens}, is missing.` },
      // Recorded misses on this exact question type were 3315 typed as 3355,
      // 6348 as 6388, 4539 as 4549, 3432 as 3462, 555 as 655, 7722 as 7822:
      // every one a carry slipping while the two partial products were added.
      { value: a * b + 10, why: `A ten too many while adding ${a * tens} and ${a * (b % 10)}. This is the single most common way this question is lost.` },
      { value: a * b - 10, why: `A ten short while adding ${a * tens} and ${a * (b % 10)}.` },
      { value: a * b + 100, why: `A hundred too many while adding ${a * tens} and ${a * (b % 10)}. Say the running total out loud.` },
    ],
    tip: "split-and-add",
  });
}

/* ── 4. Division ─────────────────────────────────────────────────────────── */
function divisionSteps(total, b, ans) {
  const chunk = Math.floor(ans / 10) * 10;
  if (!chunk) return `${b} × ${ans} = ${total}, so the answer is ${ans}`;
  const rest = ans - chunk;
  return `${b} × ${chunk} = ${b * chunk}, leaving ${total} − ${b * chunk} = ${total - b * chunk}, and ${total - b * chunk} ÷ ${b} = ${rest}. So ${chunk} + ${rest} = ${ans}`;
}

export function divide(rng, level) {
  if (level === 1) {
    const b = rng.int(2, 9);
    const ans = rng.int(4, 20);
    return q({
      prompt: `${b * ans} ÷ ${b}`,
      answer: ans,
      solution: `Ask what times ${b} makes ${b * ans}: ${b} × ${ans} = ${b * ans}`,
      traps: [{ value: ans * b, why: "Multiplied instead of divided. Check by multiplying back: the answer times the divisor has to give the number you started with." }],
      tip: "reduce-before-dividing",
    });
  }

  if (level === 2) {
    const b = rng.int(3, 19);
    const ans = rng.int(11, 60);
    return q({
      prompt: `${b * ans} ÷ ${b}`,
      answer: ans,
      solution: divisionSteps(b * ans, b, ans),
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
    solution: divisionSteps(b * ans, b, ans),
    traps: [
      { value: ans + 10, why: "A ten too many in the answer; the place value slipped." },
      { value: ans - 10, why: "A ten short in the answer; the place value slipped." },
      // Recorded misses: 49 typed as 44, 86 as 82, 99 as 94. Every one an
      // opening estimate pitched low and then never corrected upward.
      { value: ans - 5, why: `Too low by 5. A first guess at the quotient is usually low; multiply it back by ${b} and you will see how much is left over.` },
      { value: ans - 4, why: `Too low by 4. Multiply your answer back by ${b}: whatever is left over is still to be divided.` },
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
    solution: n % 10 === 5
      ? `It ends in 5, so take the front, ${Math.floor(n / 10)}, times the next number up, ${Math.floor(n / 10) + 1}: ` +
        `${Math.floor(n / 10)} × ${Math.floor(n / 10) + 1} = ${Math.floor(n / 10) * (Math.floor(n / 10) + 1)}. Write 25 after it: ${n * n}`
      : d === 0
      ? `${n} ends in 0, so square the ${n / 10} and add two zeros: ${n * n}`
      : `Slide ${Math.abs(d)} ${d > 0 ? "down" : "up"} to reach a round number, then pay it back: ` +
        `${n}² = ${Math.min(n - d, n + d)} × ${Math.max(n - d, n + d)} + ${Math.abs(d)}² = ${slid} + ${d * d} = ${n * n}`,
    traps: [
      { value: slid, why: `The correction was never added. ${n - d} × ${n + d} = ${slid}, and you still owe ${d}² = ${d * d}.` },
      { value: n * n - 2 * n + 1, why: `That is ${n - 1}². Off by one before squaring.` },
      { value: n * 2, why: "Doubled instead of squared." },
    ],
    tip: n % 10 === 5 ? "ends-in-five" : "squares-rule-of-one",
  });
}

/* ── 6. Roots and powers ─────────────────────────────────────────────────── */
export function roots(rng, level) {
  if (level === 1) {
    const n = rng.int(11, 30);
    return q({
      prompt: `√${n * n}`,
      answer: n,
      solution: `Ask what squares to ${n * n}: ${n}² = ${n * n}, so the root is ${n}`,
      traps: [{ value: (n * n) / 2, why: "Halved instead of taking a square root. A square root asks what number times itself gives this." }],
      tip: "squares-rule-of-one",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const n = rng.int(2, 12);
      return q({
        prompt: `${n}³`,
        answer: n ** 3,
        solution: `Cubing means three copies multiplied together: ${n} × ${n} = ${n * n}, then ${n * n} × ${n} = ${n ** 3}`,
        traps: [
          { value: n * n, why: `That is ${n}², one multiplication short. Cubing means three copies multiplied together.` },
          { value: n * 3, why: "Multiplied by 3 instead of raising to the third power. The 3 counts the copies, it is not a factor." },
        ],
        tip: "cube-root-last-digit",
      });
    }
    const [b, e] = rng.pick([[2, rng.int(5, 11)], [3, rng.int(3, 6)], [5, rng.int(3, 5)]]);
    return q({
      prompt: `${b}^${e}`,
      answer: b ** e,
      solution: `${e} copies of ${b} multiplied together: ${Array(e).fill(b).join(" × ")} = ${b ** e}`,
      traps: [
        { value: b ** (e - 1), why: `That is ${b}^${e - 1}. One factor short; the exponent counts the copies, so there are ${e} of them.` },
        { value: b * e, why: "Multiplied the base by the exponent. The exponent counts how many copies to multiply, it is not one of them." },
      ],
      tip: "cube-root-last-digit",
    });
  }

  const n = rng.int(11, 25);
  const cube = n ** 3;
  const tens = Math.floor(n / 10);
  const lastDigitTrap = { 2: 2, 3: 3, 7: 7, 8: 8 }[n % 10];
  const traps = [{ value: Math.round(cube / 3), why: "Divided by 3 instead of taking a cube root. A cube root asks what number, multiplied by itself three times, gives this." }];
  if (lastDigitTrap != null) {
    traps.unshift({
      value: n - (n % 10) + lastDigitTrap,
      why: `The last digit of a cube does not stay put for 2, 3, 7 and 8: 2 and 8 swap, and 3 and 7 swap. A cube ending in ${cube % 10} has a root ending in ${n % 10}.`,
    });
  }
  return q({
    prompt: `∛${cube.toLocaleString("en-US")}`,
    answer: n,
    solution:
      `Two clues pin it down. The size: ${cube.toLocaleString("en-US")} sits between ${tens * 10}³ = ${(tens * 10) ** 3} and ${(tens + 1) * 10}³ = ${((tens + 1) * 10) ** 3}, ` +
      `so the answer starts with ${tens}. The last digit: a cube ending in ${cube % 10} can only come from a root ending in ${n % 10}. That gives ${n}.`,
    traps,
    tip: "cube-root-last-digit",
  });
}

/* ── 7. Fractions ────────────────────────────────────────────────────────── */
const DENOMS = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export function fractions(rng, level) {
  if (level === 1) {
    const d = rng.pick([2, 4, 5, 8, 10]);
    const n = rng.int(1, d - 1);
    return q({
      prompt: `${n}/${d} as a decimal`,
      answer: round4(n / d),
      solution: `1/${d} = ${round4(1 / d)}, so ${n}/${d} = ${n} × ${round4(1 / d)} = ${round4(n / d)}`,
      traps: [{ value: round4(d / n), why: "The fraction was read upside down. The top number is how many parts you have, the bottom is how many make a whole." }],
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
      solution: `Multiplying is straight across: tops ${n1} × ${n2} = ${top}, bottoms ${d1} × ${d2} = ${bot}` +
        (g > 1 ? `, which cancels to ${top / g}/${bot / g} = ${round4(top / bot)}` : ` = ${round4(top / bot)}`),
      traps: [
        { value: round4(n1 / d1 + n2 / d2), why: "Added instead of multiplied." },
        { value: round4(top / (d1 + d2)), why: "The bottoms were added. When multiplying, the bottoms multiply too." },
      ],
      tip: "fraction-anchors",
    });
  }

  const lcm = (d1 * d2) / gcd(d1, d2);
  return q({
    prompt: `${n1}/${d1} + ${n2}/${d2}`,
    answer: round4(n1 / d1 + n2 / d2),
    solution:
      `Adding needs the same bottom. Both fit into ${lcm}: ${n1}/${d1} = ${(n1 * lcm) / d1}/${lcm} and ${n2}/${d2} = ${(n2 * lcm) / d2}/${lcm}. ` +
      `Now add the tops: ${(n1 * lcm) / d1 + (n2 * lcm) / d2}/${lcm} = ${round4(n1 / d1 + n2 / d2)}`,
    traps: [
      { value: round4((n1 + n2) / (d1 + d2)), why: "Tops added and bottoms added. That is not how adding works: a half plus a half would come out as a half. Give them the same bottom first." },
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
    const ten = y / 10;
    const solution =
      p === 50 ? `Per cent means per hundred, and 50 per hundred is half. Halve ${y}: ${y / 2}`
      : p === 25 ? `25 per hundred is a quarter. Halve ${y} to get ${y / 2}, then halve again: ${y / 4}`
      : p === 10 ? `10 per hundred is one tenth, so shift the digits one place: ${y} becomes ${ten}`
      : p === 20 ? `Start from 10%, which is one tenth of ${y} = ${ten}. Then 20% is twice that: ${2 * ten}`
      : `Start from 10%, which is one tenth of ${y} = ${ten}. Then 5% is half of that: ${ten / 2}`;
    return q({
      prompt: `${p}% of ${y}`,
      answer: round4((p * y) / 100),
      solution,
      traps: [
        { value: round4((p * y) / 10), why: "Out by a factor of ten. Per cent means per hundred, so divide by 100." },
        { value: round4(y / p), why: `Divided by ${p} instead of taking ${p} hundredths of ${y}.` },
      ],
      tip: "percent-flip",
    });
  }

  if (level === 2) {
    const p = rng.pick([12.5, 15, 30, 35, 40, 45, 60, 75, 80, 90, 2.5, 7.5, 17.5]);
    const y = rng.pick([64, 96, 150, 160, 250, 320, 360, 480, 640, 800, 1200]);
    const ten = y / 10;
    return q({
      prompt: `${p}% of ${y}`,
      answer: round4((p * y) / 100),
      solution: `Build it from 10% = ${round4(ten)}: ${p}% is ${round4(p / 10)} of those, so ${round4(ten)} × ${round4(p / 10)} = ${round4((p * y) / 100)}`,
      traps: [{ value: round4((p * y) / 1000), why: "Out by a factor of ten. Check against 10%, which is easy to see." }],
      tip: "percent-flip",
    });
  }

  const y = rng.pick([40, 50, 80, 120, 160, 200, 250, 400, 500, 800]);
  let x = rng.pick([2, 4, 5, 8, 10, 16, 20, 25, 32, 40, 50, 60, 75, 100, 120, 150, 200]);
  x = Math.min(x, y);
  return q({
    prompt: `${x} is what % of ${y}`,
    answer: round4((100 * x) / y),
    solution: `Put it over the whole and turn it into hundredths: ${x}/${y} = ${round4(x / y)}, and ${round4(x / y)} × 100 = ${round4((100 * x) / y)}%`,
    traps: [
      { value: round4((100 * y) / x), why: "The two numbers were swapped. Whatever follows the word 'of' is the whole, and goes on the bottom." },
      { value: round4(x / y), why: "The share is right but it never became a percentage. Multiply by 100." },
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
    const rb = Math.round(b / 10) * 10 || 10;
    return q({
      prompt: `≈ ${a} ÷ ${b}`,
      answer: a / b,
      approx: true,
      solution: `Round the divisor to ${rb}: ${a} ÷ ${rb} ≈ ${Math.round((a / rb) * 10) / 10}. The true value is ${Math.round((a / b) * 10) / 10}, and anything within 5% counts.`,
      tip: "reduce-before-dividing",
    });
  }
  if (kind === "mul") {
    const a = rng.int(101, 999);
    const b = rng.int(11, 99) / 100;
    return q({
      prompt: `≈ ${a} × ${b}`,
      answer: a * b,
      approx: true,
      solution: `${b} is close to ${Math.round(b * 10) / 10}, and ${a} × ${Math.round(b * 10) / 10} = ${Math.round(a * Math.round(b * 10) / 10 * 10) / 10}. The true value is ${Math.round(a * b * 10) / 10}.`,
      tip: "percent-flip",
    });
  }
  const a = rng.int(150, 9000);
  const lo = Math.floor(Math.sqrt(a));
  return q({
    prompt: `≈ √${a}`,
    answer: Math.sqrt(a),
    approx: true,
    solution: `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}, and ${a} sits between them, so the root is a little ${a - lo * lo < (lo + 1) ** 2 - a ? "above" : "below"} ${a - lo * lo < (lo + 1) ** 2 - a ? lo : lo + 1}: about ${Math.round(Math.sqrt(a) * 10) / 10}`,
    tip: "sqrt-anchors",
  });
}

/* ── 10. Puzzles: missing digit, balance, two quantities ─────────────────── */
function maskDigit(rng, n) {
  const s = String(n);
  const i = s.length > 1 ? rng.int(1, s.length - 1) : 0; // never mask the leading digit
  return [s.slice(0, i) + "□" + s.slice(i + 1), +s[i], s.length - 1 - i];
}

const PLACE = ["units", "tens", "hundreds", "thousands"];

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
      const g = gcd(a, c);
      return q({
        prompt: `${a} × ${b} = ${c} × ?`,
        answer: ans,
        solution: g > 1
          ? `Cancel the ${g} shared by ${a} and ${c} first: ${a / g} × ${b} = ${c / g} × ?, so ? = ${(a / g) * b} ÷ ${c / g} = ${ans}`
          : `Work out the left side, ${a} × ${b} = ${a * b}, then divide by ${c}: ${a * b} ÷ ${c} = ${ans}`,
        traps: [
          { value: round4((a * b) / c + 1), why: "Off by one in the final division. Multiply back to check." },
          { value: a * b, why: `That is the left side, ${a} × ${b}. It still has to be divided by ${c}.` },
        ],
        tip: "reduce-before-dividing",
      });
    }
    return q({ prompt: "2 × 232 = 16 × ?", answer: 29, solution: "Cancel the 2: 232 = 8 × ?, so ? = 29", tip: "reduce-before-dividing" });
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
        solution: `Divide back: ${a * b} ÷ ${a} = ${b}, so the ${PLACE[place]} digit is ${digit}`,
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
        ? `Undo the addition: ${a + b} − ${b} = ${a}, so the ${PLACE[place]} digit is ${digit}`
        : `Undo the subtraction: ${a - b} + ${b} = ${a}, so the ${PLACE[place]} digit is ${digit}`,
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
        solution: `A: ${b1} ÷ ${fr[1]} = ${b1 / fr[1]}, times ${fr[0]} = ${A}. B: 10% of ${b2} is ${b2 / 10}, so ${p}% is ${round4(B)}. Then ${A} − ${round4(B)} = ${round4(A - B)}`,
        traps: [
          { value: round4(B - A), why: "Subtracted the wrong way round." },
          { value: round4(A + B), why: "Added instead of subtracted." },
          { value: A, why: "That is A on its own. B still has to come off." },
        ],
        tip: "fraction-anchors",
      });
    }
    return q({ prompt: "A = 3/4 of 200,  B = 35% of 260.  A − B", answer: 59, solution: "A = 150, B = 91, so A − B = 59", tip: "fraction-anchors" });
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
    solution: `Work each one out: ${items.map(([lab, v]) => `${lab} = ${v}`).join(", ")}. The largest is ${items[best][0]}.`,
    traps: [],
    note: "Comparing the bases alone does not work: a smaller base with a bigger exponent often wins, as 4^7 beats both 3^7 and 6^5. Work each one out.",
    tip: null,
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
