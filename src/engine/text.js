/**
 * Every sentence a question can print, in both languages.
 *
 * Prompts and worked solutions used to be English only. That is the wrong way
 * round for a Vietnamese cohort: a tip card is read once, calmly, but a solution
 * is read at the moment a student is stuck, and that is exactly when a second
 * language costs the most.
 *
 * Each entry is a function of the question's own numbers, so a translation can
 * reorder them freely rather than being trapped in English word order. Generators
 * receive the resolved half of this object as their third argument and never see
 * the other language.
 *
 * Numbers arrive through `num(x, lang)`, which writes 0,545 in Vietnamese and
 * 0.545 in English. Coordinate pairs use `pairSep`, a semicolon in Vietnamese,
 * because (1,4) reads as one-point-four to a Vietnamese student.
 */

import { num, pairSep, frac } from "./format.js";

/* ── English ─────────────────────────────────────────────────────────────── */
const en = {
  lang: "en",
  n: (x) => num(x, "en"),
  sep: pairSep("en"),
  f: (x) => frac(x),

  /* sequences */
  seqNext: (terms) => terms.join(",  ") + ",  ?",
  seqSolution: (rule, last, next) =>
    `The rule: ${rule}. Carrying it on from ${last} gives ${next}.`,
  oddSolution: (rule, pos, shown, wanted) =>
    `Find the rule most of them follow: ${rule}. Every term fits it except position ${pos}, ` +
    `which shows ${shown} where the rule needs ${wanted}.`,

  /* sequence rules, each carrying its own numbers */
  ruleAdd: (d) => (d >= 0 ? `add ${d} each time` : `subtract ${-d} each time`),
  ruleMul: (r) => `multiply by ${r} each time`,
  ruleMulNeg: (r) => `multiply by ${r} each time, so the sign flips every step`,
  ruleDiv: (r) => `divide by ${r} each time`,
  ruleQuad: (gaps, dd) =>
    `the gaps are ${gaps.join(", ")}, and they themselves ${en.ruleAdd(dd)}`,
  ruleFib: () => "each term is the two before it added together",
  ruleAffine: (a, b) => `multiply by ${a}, then ${en.ruleAdd(b)}`,
  ruleInter: (d1, d2) =>
    `two sequences taking turns: the 1st, 3rd, 5th terms ${en.ruleAdd(d1)}, and the 2nd, 4th, 6th ${en.ruleAdd(d2)}`,
  ruleAltOps: (mul, add) =>
    `two operations taking turns: multiply by ${mul}, then add ${add}, then multiply by ${mul} again`,
  ruleSpecial: (name, st) => `the ${name}, starting from the ${en.ordinal(st)}`,
  ruleSpecialOff: (name, off) =>
    `the ${name} with ${off > 0 ? off + " added" : -off + " taken off"} each time`,
  ruleGrowing: (first, dd) => `the gaps start at ${first} and grow by ${dd} each time`,
  ruleLetterStep: (d) => `move ${Math.abs(d)} letter${Math.abs(d) > 1 ? "s" : ""} ${d > 0 ? "forward" : "back"} through the alphabet each time`,
  ruleLetterGrow: (first) => `the jump through the alphabet starts at ${first} and grows by 1 each time`,
  ruleLetterPair: () => "the first letter moves forward one at a time and the second moves back one at a time",
  ruleLetterMix: (d) => `the letter moves ${d} forward each time and the number counts up 1, 2, 3`,
  ruleCubic: (gaps) =>
    `the gaps are ${gaps.join(", ")}; take gaps of those and they grow steadily, which means a cubic pattern`,
  ruleProduct: () => "each term is the two before it multiplied together",
  ruleDigitSum: (a, digits, next) =>
    `add the term's own digits to itself: ${a} + ${digits.join(" + ")} = ${next}, and so on`,
  ruleThree: (d0, d1, d2) =>
    `three sequences taking turns: every 3rd term from the 1st ${en.ruleAdd(d0)}, from the 2nd ${en.ruleAdd(d1)}, from the 3rd ${en.ruleAdd(d2)}`,
  ruleLetterSquare: (d) => `the letter moves ${d} forward each time and the number runs through the squares 1, 4, 9, 16, 25`,
  ruleGeomDiff: (gaps, r) => `the gaps are ${gaps.join(", ")} — each gap is the one before it multiplied by ${r}`,
  ruleSkip: (word, skip) => `${word}, taking every ${skip === 2 ? "other one" : skip + "rd one"}`,
  ruleWords: (name, shown) =>
    `these are not alphabet steps at all — they are the first letters of ${name}. Here: ${shown}`,

  specialNames: {
    sq: "square numbers", cb: "cube numbers", pr: "prime numbers",
    tri: "triangular numbers", fac: "factorials 1, 2, 6, 24, 120",
  },
  skipNames: { prime: "prime numbers", square: "square numbers", tri: "triangular numbers", cube: "cube numbers" },
  wordListNames: {
    numbers: "the numbers spelled out: One, Two, Three, Four…",
    ordinals: "the positions spelled out: First, Second, Third…",
    months: "the months of the year",
    days: "the days of the week",
  },
  /* arithmetic — prompts */
  aFracToDec: (n, d) => `${n}/${d} as a decimal`,
  aPercentOf: (p, y) => `${p}% of ${y}`,
  aWhatPercent: (x, y) => `${x} is what % of ${y}`,
  aWhichLarger: () => "Which is larger?",
  aWhichLargest: () => "Which is largest?",
  aRelation: (n, d, b1, p, b2) => `A = ${n}/${d} of ${b1},  B = ${p}% of ${b2}.  A − B`,
  aCubeRoot: (cube) => `∛${cube}`,

  /* arithmetic — worked solutions */
  aTimesDropZero: (big, small, prod, whole) =>
    `Drop the zero: ${big} × ${small} = ${prod}, then put it back: ${whole}`,
  aTimesEleven: (small, whole) => `11 × ${small} = ${small} × 10 + ${small} = ${small * 10} + ${small} = ${whole}`,
  aTimesTwelve: (small, whole) => `12 × ${small} = ${small} × 10 + ${small} × 2 = ${small * 10} + ${small * 2} = ${whole}`,
  aTimesFromTen: (small, big, whole) =>
    `${small} × ${big} = ${whole}. If it slips, come at it from ${small} × 10 = ${small * 10}, ` +
    `then take off ${small} × ${10 - big} = ${small * (10 - big)}: ${small * 10} − ${small * (10 - big)} = ${whole}`,
  aSplitMul: (a, b, tens, units) =>
    `${a} × ${b} = ${a} × ${tens} + ${a} × ${units} = ${a * tens} + ${a * units} = ${a * b}`,
  aPlainMul: (a, b) => `${a} × ${b} = ${a * b}`,
  aRunningAdd: (a, steps) => `Add the big part first and say each number out loud: ${steps}`,
  aRunningSub: (a, steps) => `Take the big part away first and say each number out loud: ${steps}`,
  aStep: (from, sign, place, running) => `${from} ${sign} ${place} = ${running}`,
  aSplitBigger: (a, b, tens, units) =>
    `Split the bigger number: ${a} × ${b} = ${tens} × ${b} + ${units} × ${b} = ${tens * b} + ${units * b} = ${a * b}`,
  aHalveTen: (a, ten, half) => `${a} × 10 = ${ten}, then halve: ${half}`,
  aHalveHundred: (a, hundred, half) => `${a} × 100 = ${hundred}, then halve: ${half}`,
  aElevenDigits: (hi, lo, sum, whole) => `Outer digits ${hi} and ${lo}, their sum ${sum} goes in the middle: ${whole}`,
  aTakeOneOff: (a, round, whole) => `${a} × ${round} = ${a * round}, then take one ${a} off: ${whole}`,
  aQuarter: (a, hundred, quarter) => `${a} × 100 = ${hundred}, then quarter it: ${quarter}`,
  aDivideAsk: (b, total, ans) => `Ask what times ${b} makes ${total}: ${b} × ${ans} = ${total}`,
  aDivideSteps: (total, b, chunk, rest, ans) =>
    `${b} × ${chunk} = ${b * chunk}, leaving ${total} − ${b * chunk} = ${total - b * chunk}, ` +
    `and ${total - b * chunk} ÷ ${b} = ${rest}. So ${chunk} + ${rest} = ${ans}`,
  aDivideDirect: (b, ans, total) => `${b} × ${ans} = ${total}, so the answer is ${ans}`,
  aSquareEndsFive: (front, next, prod, whole) =>
    `It ends in 5, so take the front, ${front}, times the next number up, ${next}: ` +
    `${front} × ${next} = ${prod}. Write 25 after it: ${whole}`,
  aSquareRound: (n, tens, whole) => `${n} ends in 0, so square the ${tens} and add two zeros: ${whole}`,
  aSquareSlide: (d, dir, n, lo, hi, prod, corr, whole) =>
    `Slide ${d} ${dir} to reach a round number, then pay it back: ` +
    `${n}² = ${lo} × ${hi} + ${d}² = ${prod} + ${corr} = ${whole}`,
  aSlideDown: "down", aSlideUp: "up",
  aSqrtAsk: (sq, n) => `Ask what squares to ${sq}: ${n}² = ${sq}, so the root is ${n}`,
  aCubeSteps: (n, sq, cube) => `Cubing means three copies multiplied together: ${n} × ${n} = ${sq}, then ${sq} × ${n} = ${cube}`,
  aPowerSteps: (base, e, chain, whole) => `${e} copies of ${base} multiplied together: ${chain} = ${whole}`,
  aCubeRootSol: (cube, tens, loCube, hiCube, lastCube, lastRoot, n) =>
    `Two clues pin it down. The size: ${cube} sits between ${tens * 10}³ = ${loCube} and ${(tens + 1) * 10}³ = ${hiCube}, ` +
    `so the answer starts with ${tens}. The last digit: a cube ending in ${lastCube} can only come from a root ending in ${lastRoot}. That gives ${n}.`,
  aOneOverD: (d, dec, n, whole) => `1/${d} = ${dec}, so ${n}/${d} = ${n} × ${dec} = ${whole}`,
  aFracMul: (n1, n2, top, d1, d2, bot, cancelled, whole) =>
    `Multiplying is straight across: tops ${n1} × ${n2} = ${top}, bottoms ${d1} × ${d2} = ${bot}. ` +
    (cancelled ? `That cancels to ${cancelled}, which is ${whole}.` : `As a decimal that is ${whole}.`),
  aFracAdd: (n1, d1, a1, n2, d2, a2, lcm, sum, whole) =>
    `Adding needs the same bottom. Both fit into ${lcm}: ${n1}/${d1} = ${a1}/${lcm} and ${n2}/${d2} = ${a2}/${lcm}. ` +
    `Now add the tops: ${sum}/${lcm} = ${whole}`,
  aPctHalf: (y, half) => `Per cent means per hundred, and 50 per hundred is half. Halve ${y}: ${half}`,
  aPctQuarter: (y, half, quarter) => `25 per hundred is a quarter. Halve ${y} to get ${half}, then halve again: ${quarter}`,
  aPctTenth: (y, ten) => `10 per hundred is one tenth, so shift the digits one place: ${y} becomes ${ten}`,
  aPctFromTen: (p, y, ten, whole) => `Start from a tenth of ${y}, which is ${ten}. Then ${p}% is ${p === 20 ? "twice that" : "half of that"}: ${whole}`,
  aPctBuild: (ten, times, p, whole, y) => `Build it from a tenth of ${y}, which is ${ten}. ${p}% is ${times} of those, so ${ten} × ${times} = ${whole}`,
  aPctOfWhole: (x, y, share, whole) => `Put it over the whole, then read it as hundredths: ${x}/${y} ≈ ${share}. Multiplying by 100 turns that into ${whole}, so the answer is ${whole}%.`,
  aEstDiv: (a, rb, first, b, pct, dir, est, exact) =>
    `Divide by the round number first: ${a} ÷ ${rb} ≈ ${first}. But ${b} is about ${pct}% ${dir} ${rb}, ` +
    `so nudge the answer the other way by about that much: roughly ${est}. The true value is ${exact}, and anything within 5% counts.`,
  aEstMul: (a, ra, b, est, exact) =>
    `Round the big number, not the small one: ${a} is about ${ra}, and ${ra} × ${b} = ${est}. ` +
    `The true value is ${exact}. Rounding ${b} instead would have thrown it out by far more than the 5% you are allowed.`,
  aEstSqrt: (lo, loSq, hi, hiSq, a, side, near, rough) =>
    `${lo}² = ${loSq} and ${hi}² = ${hiSq}, and ${a} sits between them, so the root is a little ${side} ${near}: about ${rough}`,
  aAbove: "above", aBelow: "below",
  aEstMore: "more than", aEstLess: "less than",
  aBalanceCancel: (g, a, c, left, right, ans) =>
    `Cancel the ${g} shared by ${a} and ${c} first: ${left} × ? is what is left, so ? = ${ans}`,
  aBalanceDirect: (a, b, prod, c, ans) => `Work out the left side, ${a} × ${b} = ${prod}, then divide by ${c}: ${prod} ÷ ${c} = ${ans}`,
  aMissingMul: (prod, a, b, place, digit) => `Divide back: ${prod} ÷ ${a} = ${b}, so the ${place} digit is ${digit}`,
  aMissingAdd: (sum, b, a, place, digit) => `Undo the addition: ${sum} − ${b} = ${a}, so the ${place} digit is ${digit}`,
  aMissingSub: (diff, b, a, place, digit) => `Undo the subtraction: ${diff} + ${b} = ${a}, so the ${place} digit is ${digit}`,
  aPlaces: ["units", "tens", "hundreds", "thousands"],
  aRelationSol: (b1, den, part, num, A, b2, tenth, B, diff) =>
    `A: ${b1} ÷ ${den} = ${part}, then ${part} × ${num} = ${A}. B: a tenth of ${b2} is ${tenth}, so B comes to ${B}. Then ${A} − ${B} = ${diff}`,
  aLargestSol: (list, best) => `Work each one out: ${list}. The largest is ${best}.`,
  aStraddle: (lo, hi, centre, d, sq, corr, whole) =>
    `They sit either side of ${centre}, ${d} away each. So ${centre}² − ${d}² = ${sq} − ${corr} = ${whole}`,

  /* arithmetic — trap explanations */
  ttRowEarly: (a, b) => `That is ${a} × ${b}. One row too early in the table.`,
  ttRowLate: (a, b) => `That is ${a} × ${b}. One row too far down the table.`,
  ttAddedNotMultiplied: () => "Added instead of multiplied.",
  ttTenDropped: () => "A ten went missing while carrying.",
  ttHundredDropped: () => "A hundred went missing while carrying. Say the running total out loud at each step and it stops happening.",
  ttHundredLeftIn: () => "A hundred was left in. This is what rounding up and adding back tends to do when you are rushed; going left to right never does it.",
  ttHundredTwice: () => "A hundred was taken away twice.",
  ttBorrowMissed: () => "A borrow was missed in the tens.",
  ttOnlyTens: (a, tens, units, part) => `That is only ${a} × ${tens}. The units, ${a} × ${units} = ${part}, still have to be added.`,
  ttOnlyTensOfA: (tens, b, units, part) => `That is only ${tens} × ${b}. The units, ${units} × ${b} = ${part}, still have to be added.`,
  ttOnlyUnits: (a, units, tens, part) => `That is only ${a} × ${units}. The tens part, ${a} × ${tens} = ${part}, is missing.`,
  ttNoPlaceValue: () => "The two halves were added without their place value: the tens part is worth ten times what it looks.",
  ttOneCopyShort: (a) => `One copy of ${a} is missing. Check the last step of the split.`,
  ttOneCopyOver: (a) => `One copy of ${a} too many. Count the parts of the split again.`,
  ttCarryOver: (tens, units) => `A ten too many while adding ${tens} and ${units}. This is the single most common way this question is lost.`,
  ttCarryUnder: (tens, units) => `A ten short while adding ${tens} and ${units}.`,
  ttCarryHundred: (tens, units) => `A hundred too many while adding ${tens} and ${units}. Say the running total out loud.`,
  ttCentreOnly: (centre, d, corr) => `That is ${centre}², the halfway point. You still have to take off the gap squared, ${d}² = ${corr}.`,
  ttCentreAdded: () => "The correction was added instead of taken off. The product of two numbers either side of a centre is always below the centre squared.",
  ttMultipliedNotDivided: () => "Multiplied instead of divided. Check by multiplying back: the answer times the divisor has to give the number you started with.",
  ttQuotientHigh: (b) => `One too high. Multiply back to check: ${b} times your answer should return the number you started with.`,
  ttQuotientLow: (b) => `One too low. Multiply back to check: ${b} times your answer should return the number you started with.`,
  ttQuotientTen: () => "A ten too many in the answer; the place value slipped.",
  ttQuotientTenLow: () => "A ten short in the answer; the place value slipped.",
  ttQuotientFive: (b) => `Too low by 5. A first guess at the quotient is usually low; multiply it back by ${b} and you will see how much is left over.`,
  ttQuotientFour: (b) => `Too low by 4. Multiply your answer back by ${b}: whatever is left over is still to be divided.`,
  ttNoCorrection: (lo, hi, prod, d, corr) => `The correction was never added. ${lo} × ${hi} = ${prod}, and you still owe ${d}² = ${corr}.`,
  ttOffByOneSquare: (m) => `That is ${m}². Off by one before squaring.`,
  ttDoubled: () => "Doubled instead of squared.",
  ttHalvedNotRooted: () => "Halved instead of taking a square root. A square root asks what number times itself gives this.",
  ttSquaredNotCubed: (n) => `That is ${n}², one multiplication short. Cubing means three copies multiplied together.`,
  ttTimesThree: () => "Multiplied by 3 instead of raising to the third power. The 3 counts the copies, it is not a factor.",
  ttOneFactorShort: (b, e, count) => `That is ${b}^${e}. One factor short; the exponent counts the copies, so there are ${count} of them.`,
  ttBaseTimesExp: () => "Multiplied the base by the exponent. The exponent counts how many copies to multiply, it is not one of them.",
  ttCubeLastDigit: (last, root) => `The last digit of a cube does not stay put for 2, 3, 7 and 8: 2 and 8 swap, and 3 and 7 swap. A cube ending in ${last} has a root ending in ${root}.`,
  ttDividedByThree: () => "Divided by 3 instead of taking a cube root. A cube root asks what number, multiplied by itself three times, gives this.",
  ttUpsideDown: () => "The fraction was read upside down. The top number is how many parts you have, the bottom is how many make a whole.",
  ttAddedNotMultipliedFrac: () => "Added instead of multiplied.",
  ttBottomsAdded: () => "The bottoms were added. When multiplying, the bottoms multiply too.",
  ttTopsAndBottoms: () => "Tops added and bottoms added. That is not how adding works: a half plus a half would come out as a half. Give them the same bottom first.",
  ttMultipliedNotAdded: () => "Multiplied instead of added.",
  ttFactorOfTen: () => "Out by a factor of ten. Per cent means per hundred, so divide by 100.",
  ttDividedByPercent: (p, y) => `Divided by ${p} instead of taking ${p} hundredths of ${y}.`,
  ttFactorOfTenCheck: () => "Out by a factor of ten. Check against 10%, which is easy to see.",
  ttSwapped: () => "The two numbers were swapped. Whatever follows the word 'of' is the whole, and goes on the bottom.",
  ttNotAPercent: () => "The share is right but it never became a percentage. Multiply by 100.",
  ttOffByOneDiv: () => "Off by one in the final division. Multiply back to check.",
  ttLeftSideOnly: (a, b, c) => `That is the left side, ${a} × ${b}. It still has to be divided by ${c}.`,
  ttWrongWayRound: () => "Subtracted the wrong way round.",
  ttAddedNotSubtracted: () => "Added instead of subtracted.",
  ttAOnly: () => "That is A on its own. B still has to come off.",
  ttLargestNote: () => "Comparing the bases alone does not work: a smaller base with a bigger exponent often wins, as 4^7 beats both 3^7 and 6^5. Work each one out.",

  /* arithmetic — the level-3 shapes the paper actually has */
  aTeens: (a, b, ub, plus, tens, ua, units, whole) =>
    `Teens times teens: add the units of one to the whole of the other, times ten, then add the product of the two units. ` +
    `${a} + ${ub} = ${plus}, so ${plus} × 10 = ${tens}. The units are ${ua} × ${ub} = ${units}. Then ${tens} + ${units} = ${whole}.`,
  ttTeensNoUnits: (ua, ub, units) => `That is the first half only. The two units still multiply: ${ua} × ${ub} = ${units}, and it goes on the end.`,
  aSplitThree: (a, b, h, tn, u, hb, tb, ub, whole) =>
    `Three pieces, biggest first: ${a} = ${h} + ${tn} + ${u}. ` +
    `${h} × ${b} = ${hb}, ${tn} × ${b} = ${tb}, ${u} × ${b} = ${ub}. Add them as you go: ${hb} + ${tb} + ${ub} = ${whole}.`,
  ttForgotHundreds: (h, b, hb) => `The hundreds were added on instead of multiplied. ${h} × ${b} = ${hb}, not ${h}.`,
  aDivideRemainder: (b, whole, product, total, r, frac, ans) =>
    `It does not come out even, and that is the point. ${b} × ${whole} = ${product}, leaving ${total} − ${product} = ${r}. ` +
    `Now ${r} ÷ ${b} = ${frac}, so the answer is ${whole} + ${frac} = ${ans}.`,
  ttDroppedRemainder: (r) => `That is the whole-number part only. There were ${r} left over, and they are worth something.`,
  ttRoundedUp: (r, b) => `Rounded up to the next whole number. The paper wants the exact figure: ${r} over ${b}, as a decimal, on the end.`,
  ttRemainderAsTenths: (r, b) => `The remainder was written as tenths. It is ${r} out of ${b}, not ${r} out of 10.`,
  aFracDiv: (n1, d1, n2, d2, fn, fd, top, bot, cancelled, whole) =>
    `Dividing by a fraction is multiplying by it upside down: (${n1}/${d1}) ÷ (${n2}/${d2}) = (${n1}/${d1}) × (${fn}/${fd}). ` +
    `Tops ${n1} × ${fn} = ${top}, bottoms ${d1} × ${fd} = ${bot}. ` +
    (cancelled ? `That cancels to ${cancelled}, which is ${whole}.` : `As a decimal that is ${whole}.`),
  ttNotFlipped: () => "Multiplied straight across without flipping the second fraction. Division flips it first.",
  ttFlippedWrongOne: () => "The first fraction was flipped instead of the second. Only the one you divide by turns over.",
  aFracSub: (n1, d1, a1, n2, d2, a2, lcm, diff, whole) =>
    `Subtracting needs the same bottom. Both fit into ${lcm}: ${n1}/${d1} = ${a1}/${lcm} and ${n2}/${d2} = ${a2}/${lcm}. ` +
    `Now take the tops: ${a1} − ${a2} = ${diff}, so ${diff}/${lcm} = ${whole}`,
  aPctOnePercent: (y, one, p, whole) =>
    `Any percentage at all: find one per cent first. 1% of ${y} is ${one}, so ${p}% is ${p} of those: ${p} × ${one} = ${whole}`,
  aAskPctChain: (y, up, down) => `Start at ${y}. Increase it by ${up}%, then decrease the result by ${down}%. What is it now?`,
  aPctChain: (y, up, upFactor, mid, down, downFactor, end) =>
    `Two steps, each a multiplication. Up ${up}% means × ${upFactor}: ${y} × ${upFactor} = ${mid}. ` +
    `Down ${down}% means × ${downFactor}: ${mid} × ${downFactor} = ${end}. The percentages do not cancel, because the second one acts on a different number.`,
  ttChainAdded: (up, down) => `Added the percentages: up ${up} and down ${down} as one net move. They act on different numbers, so they do not add.`,
  ttChainHalfDone: (down) => `That is after the increase only. The ${down}% decrease is still to come.`,

  /* arithmetic — decimals */
  dSolAdd: (wa, wb, wsum, fa, fb, fsum, ans) =>
    `Whole parts first: ${wa} + ${wb} = ${wsum}. Then the decimal parts on their own: ${fa} + ${fb} = ${fsum}. ` +
    `Put them together: ${wsum} + ${fsum} = ${ans}.`,
  dSolSub: (a, wb, afterWhole, fb, ans) =>
    `Take the whole part of the second number first: ${a} − ${wb} = ${afterWhole}. ` +
    `Then its decimal part: ${afterWhole} − ${fb} = ${ans}.`,
  dtForgotFraction: (fb) => `The whole part was handled and the ${fb} on the end of the second number was not.`,
  dtPointRight: () => "The decimal point landed one place too far right, so this is ten times too big.",
  dtPointLeft: () => "The decimal point landed one place too far left, so this is a tenth of the answer.",
  dSolMul: (a, b, ia, ib, prod, ans) =>
    `Ignore the points and multiply the whole numbers: ${ia} × ${ib} = ${prod}. ` +
    `The question has two decimal places altogether, one in ${a} and one in ${b}, so move the point two places back: ${ans}.`,
  dtPlacesShort: () => "Only one decimal place was put back. There is one in each number, so two altogether.",
  dtPlacesOver: () => "Three decimal places were put back. Count them in the question: one in each number, two altogether.",
  dSolMulFrac: (a, num, den, b, share, ans) =>
    `${a} is ${num}/${den} in disguise, so take ${num}/${den} of ${b}: ${b} ÷ ${den} = ${share}` + (num === 1 ? `.` : `, and ${share} × ${num} = ${ans}.`),
  dSolDiv: (a, d, scale, a2, d2, ans) =>
    `Make the divisor a whole number first: multiply both numbers by ${scale}, which does not change the answer. ` +
    `${a} ÷ ${d} becomes ${a2} ÷ ${d2}, and ${a2} ÷ ${d2} = ${ans}.`,
  dtDividendNotScaled: (a, d2) => `The divisor was scaled up to ${d2} but ${a} was left as it was. Whatever you do to one number you do to the other.`,

  /* estimation — unit names, prompts, solutions and traps */
  eUnits: {
    secMin:    { one: "minute",   many: "minutes",    small: "seconds" },
    minHour:   { one: "hour",     many: "hours",      small: "minutes" },
    hourDay:   { one: "day",      many: "days",       small: "hours" },
    dayWeek:   { one: "week",     many: "weeks",      small: "days" },
    monthYear: { one: "year",     many: "years",      small: "months" },
    gKg:       { one: "kilogram", many: "kilograms",  small: "grams" },
    mKm:       { one: "kilometre", many: "kilometres", small: "metres" },
    mlLitre:   { one: "litre",    many: "litres",     small: "millilitres" },
    cmM:       { one: "metre",    many: "metres",     small: "centimetres" },
    mmCm:      { one: "centimetre", many: "centimetres", small: "millimetres" },
  },
  eBeats: "beats",
  eBreaths: "breaths",
  eCups: "cups",
  eWindows: "windows",
  eMessages: "messages",
  eSeats: "seats",
  eBooks: "books",

  eAskUnits: (small, n, many) => `How many ${small} in ${n} ${many}?`,
  eSolUnits: (one, per, small, n, ans) =>
    `One ${one} is ${per} ${small}, so ${n} of them is ${n} × ${per} = ${ans}.`,
  etOneUnitOnly: (one) => `That is one ${one}. The question asks about several of them.`,
  etAddedNotMultiplied: "These two numbers multiply, they do not add. Each one of the first thing brings a whole set of the second.",

  eAskHeartHour: (r) => `A heart beats ${r} times a minute. About how many beats in an hour?`,
  eSolHeartHour: (r, ans) => `An hour is 60 minutes, and each of them costs ${r} beats: 60 × ${r} = ${ans}.`,
  etOneMinuteOnly: "That is one minute. An hour holds sixty of them.",
  etOneSecondOnly: "That is one second. An hour is three thousand six hundred of them.",
  etOneHourOnly: "That is one hour on its own. The question asks for longer than that.",
  etOneDayOnly: "That is one day. A year is another 365 of them.",
  etOneWeekOnly: "That is one week. A year holds fifty-two of them.",
  etForgotPerMinute: "The rate you were given is per minute, not per hour, and every hour you counted holds sixty minutes.",

  eAskTap: (r, h) => `A tap runs at ${r} litres a minute. How many litres in ${h} hours?`,
  eSolTap: (r, perHour, h, ans) =>
    `One hour gives 60 × ${r} = ${perHour} litres, and ${h} hours gives ${h} × ${perHour} = ${ans}.`,
  eAskRead: (w, h) => `You read ${w} words a minute. About how many words in ${h} hours?`,
  eSolRead: (w, perHour, h, ans) =>
    `An hour is 60 × ${w} = ${perHour} words, and ${h} hours is ${h} × ${perHour} = ${ans}.`,
  eAskCar: (v, h) => `A car travels at ${v} kilometres an hour. How far does it go in ${h} hours?`,
  eSolCar: (v, h, ans) => `Distance is speed times time: ${v} × ${h} = ${ans} kilometres.`,
  eAskMachine: (r, h) => `A machine makes ${r} parts an hour. How many does it make in a ${h}-hour shift?`,
  eSolMachine: (r, h, ans) => `Every hour of the shift adds ${r}, so ${r} × ${h} = ${ans}.`,
  eAskDrip: (r) => `A tap drips ${r} times a second. About how many drips in an hour?`,
  eSolDrip: (r, perMin, ans) =>
    `A minute gives 60 × ${r} = ${perMin} drips, and an hour is 60 of those minutes: 60 × ${perMin} = ${ans}.`,

  eAskHeartYear: (r) => `A heart beats ${r} times a minute. About how many beats in a year?`,
  eAskBreathYear: (r) => `You breathe ${r} times a minute. About how many breaths in a year?`,
  eSolPerYear: (r, perHour, perDay, ans, noun) =>
    `Climb one step at a time rather than reaching for the whole thing at once. ` +
    `An hour is 60 × ${r} = ${perHour} ${noun}. A day is 24 hours: 24 × ${perHour} = ${perDay}. ` +
    `A year is 365 days: 365 × ${perDay} = ${ans}.`,
  etCountedDaysNotMinutes: "You multiplied by the days in a year but left out the minutes inside each day, and there are 1440 of those.",
  eAskSleepYear: (h) => `You sleep ${h} hours a night. About how many hours of sleep is that in a year?`,
  eSolSleepYear: (h, ans) => `A year is 365 nights, and each costs ${h} hours: 365 × ${h} = ${ans}.`,
  etAnsweredInMinutes: "That is the answer in minutes. The question asks for hours.",
  eAskLight: (n) =>
    `Light travels 300 thousand kilometres a second. About how far does it go in ${n} minutes, in thousands of kilometres?`,
  eSolLight: (n, secs, ans) =>
    `${n} minutes is ${n} × 60 = ${secs} seconds, and every second carries light 300 thousand kilometres: ` +
    `${secs} × 300 = ${ans}.`,
  etLightSeconds: "That is how far light gets in that many seconds. The question is in minutes, and each one is sixty seconds long.",
  etLightOneMinute: "That is one minute's worth of travel. The question asks about several minutes, so multiply it up.",
  eAskRiver: (v) => `A river carries ${v} cubic metres of water past a point every second. About how much passes in a day?`,
  eSolRiver: (v, perHour, ans) =>
    `An hour is 3600 seconds: 3600 × ${v} = ${perHour}. A day is 24 hours: 24 × ${perHour} = ${ans} cubic metres.`,
  etCountedMinutesNotSeconds: "You counted the minutes in a day rather than the seconds, and each minute holds sixty of those.",

  eAskCups: (n, c) => `A school has ${n} students and each drinks ${c} cups of water a day. About how many cups a day is that?`,
  eAskWindows: (n, w) => `A street has ${n} houses, each with about ${w} windows. Roughly how many windows along the street?`,
  eAskMessages: (n, m) => `In a group of ${n} people, each person sends about ${m} messages a day. Roughly how many messages a day altogether?`,
  eAskBus: (b, s) => `A depot keeps ${b} buses with ${s} seats each. How many seats is that altogether?`,
  eAskShelves: (s, b) => `A library has ${s} shelves holding about ${b} books each. Roughly how many books?`,
  eSubjects: {
    students: { one: "student", many: "students" },
    houses:   { one: "house",   many: "houses" },
    people:   { one: "person",  many: "people" },
    buses:    { one: "bus",     many: "buses" },
    shelves:  { one: "shelf",   many: "shelves" },
  },
  eSolTwoFactor: (a, subj, b, ans, noun) =>
    `There are ${a} ${subj.many}, and each ${subj.one} accounts for ${b} ${noun}. ` +
    `So the two numbers multiply: ${a} × ${b} = ${ans}.`,
  etOnePerPerson: (subj, noun) =>
    `That is just the number of ${subj.many}. Each ${subj.one} accounts for several ${noun}, so the answer has to be bigger.`,

  eAskTuners: (S, P, shops, A) =>
    `One piano tuner looks after ${S} pianos a year. A city of ${P} thousand people has ${shops} music shops, ` +
    `and about 1 person in ${A} owns a piano. Roughly how many tuners does the city keep busy?`,
  eSolTuners: (P, people, A, pianos, S, ans) =>
    `Take one step at a time. ${P} thousand people is ${P} × 1000 = ${people}. ` +
    `One piano for every ${A} of them gives ${people} ÷ ${A} = ${pianos} pianos. ` +
    `A tuner covers ${S} pianos a year, so ${pianos} ÷ ${S} = ${ans} tuners.`,
  etTunersPianos: "That is how many pianos the city has, not how many tuners. One tuner looks after hundreds of them.",
  etTunersPeople: "That is the whole population. Only a small share of them owns a piano at all.",

  etFuelDistance: "That is the distance the town drives, not the fuel it burns. Those kilometres still have to be turned into litres.",
  etFuelPerHundred: "The rate is per 100 kilometres, not per kilometre, so this answer is a hundred times too big.",

  eSolCoffee: (n, h, perDay, d, ans) =>
    `A day is ${n} × ${h} = ${perDay} cups, and a week is ${d} of those days: ${perDay} × ${d} = ${ans}.`,
  etCoffeeOneDay: "That is a single day. The question asks about a week.",
  etCoffeeNoHours: "You multiplied the days in but left the opening hours out, and each day is several hours long.",

  eSolTiles: (w, l, area, per, ans) =>
    `The floor is ${w} × ${l} = ${area} square metres, and each square metre takes ${per} tiles: ${area} × ${per} = ${ans}.`,
  etTilesArea: "That is the floor area in square metres, not the number of tiles standing on it.",
  etTilesPerimeter: "That is the distance round the edge of the room. A floor is covered by its area, not by its border.",

  eSolEggs: (P, e, perWeek, ans) =>
    `A week takes ${P} × ${e} = ${perWeek} million eggs, and a year is 52 weeks: ${perWeek} × 52 = ${ans} million.`,
  etEggsWeek: "That is one week. A year is fifty-two of them.",
  etEggsDays: "You multiplied by the days in a year, but the rate you were given is per week.",

  eSolWater: (P, l, litres, ans) =>
    `The city uses ${P} × 1000 × ${l} = ${litres} litres. A cubic metre is 1000 litres, ` +
    `so ${litres} ÷ 1000 = ${ans} cubic metres. The two thousands cancel, which is why the answer is simply ${P} times ${l}.`,
  etWaterLitres: "That is the answer in litres. The question asks for cubic metres, and each of those holds a thousand litres.",
  etWaterPeople: "That is how many people live there, with nothing about how much water each of them drinks.",

  etFlightsSeats: "That is every seat on offer. The planes do not fly full, which is the whole reason the percentage is there.",
  etFlightsOneFlight: "That is a single flight. The airline runs many of them a day, and the question asks for a week of them.",

  eSolBarbers: (P, people, w, cuts, c, d, perBarber, ans) =>
    `${P} thousand people is ${P} × 1000 = ${people}, and each wants a cut every ${w} weeks, ` +
    `so one week brings ${people} ÷ ${w} = ${cuts} haircuts. ` +
    `One barber manages ${c} × ${d} = ${perBarber} cuts a week, so the town needs ${cuts} ÷ ${perBarber} = ${ans}.`,
  etBarbersCuts: "That is how many haircuts the town wants each week, not how many barbers it takes to give them.",
  etBarbersOneBarber: "That is one barber's week. The town needs a good many barbers.",

  eNoise: {
    shops: "music shops", people: "population", tables: "tables", ceiling: "ceiling height",
    farms: "farms", reservoirs: "reservoirs", staff: "staff", barbershops: "barbershops",
    weight: "weight of a box",
  },
  eIgnored: (noun) => `Nothing here uses the ${noun}. A question can hand you a number you do not need, and deciding what to leave out is part of the work.`,

  eAskPacking: (a, b, c, x, y, z, kg) =>
    `A shipping container measures ${a} metres by ${b} metres by ${c} metres. A box measures ${x} centimetres ` +
    `by ${y} centimetres by ${z} centimetres and weighs ${kg} kilograms when full. Ignoring the weight and the ` +
    `space wasted between boxes, roughly how many boxes fit in the container?`,
  eSolPacking: (a, b, c, holdM, x, y, z, boxCm, holdCm, ans) =>
    `Volume over volume, but the two are in different units, and that is where this goes wrong. ` +
    `The container is ${a} × ${b} × ${c} = ${holdM} cubic metres. The box is ${x} × ${y} × ${z} = ${boxCm} cubic centimetres. ` +
    `A metre is 100 centimetres, so a cubic metre is 100 × 100 × 100 = 1000000 cubic centimetres, ` +
    `which makes the container ${holdM} × 1000000 = ${holdCm} cubic centimetres. Then ${holdCm} ÷ ${boxCm} = ${ans}.`,
  etPackingThousand: "A cubic metre is not a thousand cubic centimetres. Cubing the metre cubes the hundred as well, so it is a million.",
  etPackingOneEdge: "That compares one edge against one edge. A box takes up room in three directions at once, so all three have to be multiplied in.",

  eAskFuel: (pop, N, L, K) =>
    `A town of ${pop} thousand people owns ${N} cars. A car burns ${L} litres of fuel every 100 kilometres, ` +
    `and covers about ${K} kilometres a month. Roughly how many litres does the town burn in a year?`,
  eSolFuel: (K, year, N, km, L, ans) =>
    `The rate is monthly and the question is yearly, so start there: ${K} × 12 = ${year} kilometres a car. ` +
    `All the cars together cover ${N} × ${year} = ${km} kilometres. Every 100 of those costs ${L} litres, ` +
    `so ${km} ÷ 100 × ${L} = ${ans} litres.`,
  etFuelMonth: "That is one month. The question asks for a year, and nothing in the sentence says twelve for you.",

  eAskCoffee: (tables, n, h, d) =>
    `A coffee shop has ${tables} tables. It sells about ${n} cups an hour, opens ${h} hours a day and trades ` +
    `${d} days a week. Roughly how many cups a week?`,

  eAskTiles: (w, l, high, per) =>
    `A room is ${w} metres by ${l} metres and ${high} metres high, and ${per} tiles cover a square metre. ` +
    `Roughly how many tiles does the floor take?`,

  eAskEggs: (P, farms, e) =>
    `A country of ${P} million people has ${farms} thousand egg farms, and each person eats about ${e} eggs a week. ` +
    `Roughly how many million eggs a year?`,

  eAskWater: (P, res, l) =>
    `A city of ${P} thousand people draws from ${res} reservoirs, and each person uses about ${l} litres of water a day. ` +
    `Roughly how many cubic metres a day is that? A cubic metre is 1000 litres.`,

  eAskFlights: (F, staff, s, pct) =>
    `An airline runs ${F} flights a day and employs ${staff} thousand people. Each aircraft seats ${s} passengers ` +
    `and flies about ${pct}% full. Roughly how many passengers does it carry in a week?`,
  eSolFlights: (s, pct, perFlight, F, perDay, ans) =>
    `A full aircraft is ${s} passengers, and ${pct}% of that is ${s} × ${pct} ÷ 100 = ${perFlight}. ` +
    `A day is ${F} × ${perFlight} = ${perDay}. The question asks for a week, which nothing in the sentence ` +
    `counts for you: ${perDay} × 7 = ${ans}.`,
  etFlightsOneDay: "That is a single day. The question asks for a week, and the seven is yours to supply.",

  eAskBarbers: (c, d, P, shops, w) =>
    `A barber cuts ${c} heads a day and works ${d} days a week. A town of ${P} thousand people has ${shops} ` +
    `barbershops, and each person needs a cut every ${w} weeks. Roughly how many barbers does the town need?`,

  /* probability — event names, reused across prompts */
  pEvents: {
    die6: "a 6 when rolling a fair die",
    coinH: "heads when flipping a fair coin",
    dieOver4: "a number greater than 4 when rolling a die",
    heart: "a heart when drawing one card from a full deck",
    dieEven: "an even number when rolling a die",
    dieUnder3: "a number less than 3 when rolling a die",
    dieNot6: "anything except a 6 when rolling a die",
    redCard: "a red card when drawing one card from a full deck",
    aceCard: "an ace when drawing one card from a full deck",
    faceCard: "a face card (jack, queen or king) when drawing one card from a full deck",
    twoHeads: "two heads when flipping two fair coins",
  },
  pTrialNames: {
    die6: "a 6 on a die", coinH: "HEADS on a coin",
    die56: "a 5 or 6 on a die", heartRep: "a heart, drawing with replacement",
  },
  pWaitNames: {
    die6: "a 6 when rolling a die", coinH: "heads when flipping a coin",
    die56: "a 5 or 6 when rolling a die", heartRep: "a heart when drawing cards with replacement",
    ace13: "an ace when drawing cards with replacement",
    redRep: "a red card when drawing cards with replacement",
    dieUnder3: "a number below 3 when rolling a die",
    sumSeven: "a sum of 7 when rolling two dice",
    sumTen: "a sum of 10 when rolling two dice",
    doubleSix: "a double 6 when rolling two dice",
  },
  pShortNames: { die6: "a 6", coinH: "heads", die56: "a 5 or 6" },
  pActions: { die: "Roll a fair die", coin: "Flip a fair coin", card: "Draw a card with replacement" },
  pAtLeast: {
    six: "at least one 6", head: "at least one head", heart: "at least one heart",
    ace: "at least one ace", oneTwo: "at least one 1 or 2",
  },
  pMissNames: { six: "a 6", head: "a head", heart: "a heart", ace: "an ace", oneTwo: "a 1 or 2" },
  pEvNames: {
    oneDie: "the value shown on one fair die",
    sumTwo: "the sum of two fair dice",
    heads4: "the number of heads in 4 flips of a fair coin",
    sixes12: "the number of 6s in 12 rolls of a fair die",
    heads10: "the number of heads in 10 flips of a fair coin",
    sixes6: "the number of 6s in 6 rolls of a fair die",
    sumThree: "the sum of three fair dice",
    cardRank: "the rank of one card drawn from a full deck, counting ace as 1 and king as 13",
    evens4: "the number of even results in 4 rolls of a fair die",
    coinPay: "a game that pays 10 if a fair coin lands heads and nothing if it lands tails",
    maxThree: "the largest of three fair dice",
    minThree: "the smallest of three fair dice",
    absDiff: "the gap between two fair dice, ignoring which one is bigger",
    product: "the product of two fair dice",
    larger: "the larger of two fair dice",
    smaller: "the smaller of two fair dice",
  },
  pFirstNames: { six: "rolls a 6", head: "flips heads", five6: "rolls a 5 or 6" },
  pCollect: {
    faces: "all 6 faces of a die",
    suits: "all 4 suits, drawing cards with replacement",
    coin: "both faces of a coin",
    ranks: "all 13 ranks of a deck, drawing with replacement",
    weekdays: "all 7 days of the week, picking one at random each time",
    vowels: "all 5 vowels, picking one at random each time",
  },
  pPatterns: { HT: "heads then tails", TH: "tails then heads", HH: "two heads in a row", TT: "two tails in a row" },
  pCards: { suit: "of the same suit", rank: "a pair, meaning the same rank", red: "both red" },
  pUnit: { band: "|X − Y| < ½", sum: "X + Y < 1", twice: "X > 2Y" },

  /* probability — prompts */
  pAskChance: (ev) => `Probability of getting ${ev}?`,
  pAskDiceSum: (s) => `Roll two fair dice. Probability the sum is ${s}?`,
  pAskAtLeast: (action, n, ev) => `${action} ${n} times. Probability of ${ev}?`,
  pAskEV: (name) => `Expected value of ${name}?`,
  pAskStock: (S, pct, n) =>
    `A stock is at ${S}. Each day it goes up ${pct}% or down ${pct}%, equally likely. Expected price after ${n} days?`,
  pAskAces: (n) => `Expected number of aces in a hand of ${n} cards dealt from a full deck?`,
  pAskReroll: (k) =>
    `Roll a die and you are paid its face value. You may re-roll up to ${k === 1 ? "once" : k + " times"}, ` +
    `discarding the previous roll. Playing optimally, what is the expected payoff?`,
  pChildStem: (n) => `A family has ${n} children, boys and girls equally likely. `,
  pSexWord: (boys) => (boys ? "boy" : "girl"),
  pAskChildren: (eldest, boys, n) =>
    `${eldest ? `The ${n === 2 ? "older" : "oldest"} child is a ${boys ? "boy" : "girl"}` : `At least one is a ${boys ? "boy" : "girl"}`}. ` +
    `Probability ${n === 2 ? "both are" : `all ${n} are`} ${boys ? "boys" : "girls"}?`,
  pCondEldest: (boys, n) => `Being told the ${n === 2 ? "older" : "oldest"} one is a ${boys ? "boy" : "girl"}`,
  pCondLeast: (boys) => `"At least one is a ${boys ? "boy" : "girl"}"`,
  pAskCondDice: (s, k) => `Two fair dice are rolled and the sum is ${s}. Probability at least one die shows a ${k}?`,
  pAskUrnTwo: (r, b) => `An urn holds ${r} red and ${b} blue balls. You draw 2 without replacement. Probability both are red?`,
  pAskThreeCoins: (set, target) =>
    `Three coins have P(heads) = ${set}. You pick one at random and flip heads. Probability it was the coin with P(heads) = ${target}?`,
  pAskUrns: (ab, ar, bb, br) =>
    `Urn A holds ${ab} blue and ${ar} red. Urn B holds ${bb} blue and ${br} red. ` +
    `You pick an urn at random and draw a red ball. Probability it was urn B?`,
  pAskBox: (n, wantFair) =>
    `A box holds 3 coins: one fair, one two-headed, one two-tailed. You pick one at random and flip it ` +
    `${n === 1 ? "once: heads" : n + " times: all heads"}. ` +
    `Probability it is the ${wantFair ? "fair" : "two-headed"} coin?`,
  pAskWaitFirst: (ev) => `Expected number of trials until you first get ${ev}?`,
  pAskWaitK: (ev, k, action) =>
    `Expected number of trials until ${ev} has come up ${k === 2 ? "twice" : k + " times"}, not necessarily in a row, when ${action}?`,
  pAskPattern: (pat) => `Flip a fair coin repeatedly. Expected number of flips until you first see ${pat}?`,
  pAskCollect: (what) => `Expected number of trials to see ${what} at least once each?`,
  pAskOrderMax: (n, ord) => `${n} independent Uniform[0,1] values are drawn in order. Probability the ${ord} one is the largest?`,
  pAskOrderMono: (n, dir) => `${n} independent draws from a continuous distribution. Probability they come out ${dir} in the order drawn?`,
  pAskPickRepeat: (k, N) => `Pick ${k} numbers from 1–${N}, each pick independent so repeats are possible, in order. Probability they are strictly increasing?`,
  pAskPickDistinct: (k, N) => `Pick ${k} distinct numbers from 1–${N}, revealed in random order. Probability they come out strictly increasing?`,
  pAskMonty: (sw, n) =>
    `${n} doors hide one car and ${n - 1} goats. You pick a door. The host, who knows where the car is, ` +
    (n === 3 ? `opens a different door revealing a goat. ` : `opens ${n - 2} of the other doors, every one revealing a goat. `) +
    `Probability you win the car if you ` +
    `${sw ? "switch to the one door still shut" : "stay with your first door"}?`,
  pAskRuin: (i, j) =>
    `A holds ${i} coins and B holds ${j}. They play a fair game; each round the loser hands the winner one coin, ` +
    `until someone has none. Probability A ends up with everything?`,
  pAskFirst: (ev) => `A and B take turns and whoever ${ev} first wins. A goes first. Probability A wins?`,
  pAskDerange: (n, none) =>
    `${n} letters are placed at random into ${n} addressed envelopes. Probability that ` +
    `${none ? "no letter" : "at least one letter"} reaches the right envelope?`,
  pAskWalk: (steps) =>
    `A walker on the integers takes each step +1 or −1 with probability ½. ` +
    `Probability of standing back at the start after ${steps} steps?`,
  pAskCards: (what) => `Draw 2 cards from a standard 52-card deck without replacement. Probability they are ${what}?`,
  pAskUnit: (cond) => `X and Y are independent Uniform[0,1]. Probability that ${cond}?`,
  pGerunds: { die: "rolling a die", coin: "flipping a coin" },
  pBoxOneHead: "one head",
  pBoxManyHeads: (n) => `${n} heads in a row`,
  pAskOrderEnds: (n) => `${n} independent draws from a continuous distribution. Probability the first one drawn is the largest and the last one drawn is the smallest?`,
  pAskOrderEither: (n) => `${n} independent draws from a continuous distribution. Probability they come out either strictly increasing or strictly decreasing?`,
  pStrictUp: "strictly increasing", pStrictDown: "strictly decreasing",
  pOrdinals: ["1st", "2nd", "3rd", "4th", "5th"],

  /* probability — worked solutions */
  pSolChance: {
    die6: "A die has 6 equally likely faces and 1 of them is a 6, so 1 out of 6.",
    coinH: "Two faces, both equally likely, one of them is heads: 1 out of 2.",
    dieOver4: "Two faces beat 4, namely 5 and 6, so 2 out of 6, which is 1/3.",
    heart: "A deck has 13 hearts among 52 cards: 13 out of 52, which is 1/4.",
    dieEven: "The even faces are 2, 4 and 6: 3 out of 6, which is 1/2.",
    dieUnder3: "The faces below 3 are 1 and 2: 2 out of 6, which is 1/3.",
    dieNot6: "Five of the six faces are not a 6, so 5 out of 6. Counting what you do not want and taking it from 1 gets there too.",
    redCard: "Half the deck is red, 13 hearts and 13 diamonds: 26 out of 52, which is 1/2.",
    aceCard: "There are 4 aces among 52 cards, one in each suit: 4 out of 52, which is 1/13.",
    faceCard: "Each suit holds a jack, a queen and a king, so 4 × 3 = 12 face cards among 52: 12/52, which is 3/13.",
    twoHeads: "Two coins give 4 equally likely results: HH, HT, TH, TT. One of them is two heads, so 1 out of 4.",
  },
  pSolDiceSum: (s, pairs, ways, reduced) =>
    `Two dice give 6 × 6 = 36 equally likely results, counting the dice as different. ` +
    `The ones that add to ${s} are ${pairs} — that is ${ways} of them. So ${ways}/36` +
    (reduced ? `, which is ${reduced}.` : "."),
  pSolAtLeast: (n, missOne, missAll, ans) =>
    `Go the other way round and work out the chance of missing every time. ` +
    `One try misses with chance ${missOne}, so ${n} tries all miss with chance (${missOne})^${n} ≈ ${missAll}. ` +
    `Everything else is "at least one", so 1 − ${missAll} ≈ ${ans}.`,
  pSolEV: {
    oneDie: "Add the faces and share them out evenly: (1+2+3+4+5+6)/6 = 21/6 = 3.5. No face shows 3.5, and that is fine — an average does not have to be a possible result.",
    sumTwo: "Each die averages 3.5 on its own, and averages simply add: 3.5 + 3.5 = 7.",
    heads4: "Each flip contributes half a head on average, and averages add up: 4 × ½ = 2.",
    sixes12: "Each roll contributes 1/6 of a six on average, and averages add up: 12 × 1/6 = 2.",
    heads10: "Each flip contributes half a head on average, and averages add up: 10 × ½ = 5.",
    sixes6: "Each roll contributes 1/6 of a six on average, and averages add up: 6 × 1/6 = 1. Six rolls buy you one six on average, which is why a 6 still feels rare.",
    sumThree: "Each die averages 3.5 on its own, and averages simply add: 3.5 + 3.5 + 3.5 = 10.5.",
    cardRank: "All 13 ranks are equally likely, because every rank appears once in each suit. So it is the middle of 1 to 13: (1 + 13)/2 = 7.",
    evens4: "Half the faces are even, so each roll contributes half an even result on average: 4 × ½ = 2.",
    coinPay: "Weigh each outcome by how often it happens. Half the time you collect 10, which is worth 10/2 = 5 on average, and half the time you collect nothing, worth 0. Adding those gives 5 + 0 = 5. Note that 5 is never actually paid out: an average is not a result.",
    maxThree: "Count how often the largest is exactly k. All three dice land at or below k in k × k × k of the 216 results, and at or below k − 1 in (k − 1)^3 of them, so the largest is exactly k in the difference: 1, 7, 19, 37, 61, 91 for k running 1 to 6. Weighting each k by its count gives (1 × 1 + 2 × 7 + 3 × 19 + 4 × 37 + 5 × 61 + 6 × 91)/216 = 1071/216, about 4.96.",
    minThree: "Relabel every face v as 7 − v. A fair die is unchanged by that swap, and it turns the smallest of the three into the largest. So the average smallest is 7 minus the average largest: 7 − 1071/216 = 441/216, about 2.04.",
    absDiff: "Go through the 36 results and count the gaps: 6 give a gap of 0, 10 give 1, 8 give 2, 6 give 3, 4 give 4, and 2 give 5. Weighting each gap by how often it happens gives (0 × 6 + 1 × 10 + 2 × 8 + 3 × 6 + 4 × 4 + 5 × 2)/36 = 70/36, about 1.94.",
    product: "The dice do not affect each other, so you may multiply the two averages: 3.5 × 3.5 = 12.25.",
    larger: "Go through each possible top face k and count how often it wins: k is the larger in 2k−1 of the 36 results. Adding those up gives 161/36, about 4.47.",
    smaller: "The larger and the smaller always add to the total, so their averages do too: 7 − 161/36 = 91/36, about 2.53.",
  },
  pSolStock: (up, down, n, S) =>
    `Each day multiplies the price by ${up} or by ${down}, equally often, so on average it multiplies by (${up} + ${down})/2 = 1. ` +
    `Multiplying by 1 changes nothing, and ${n} days of that still changes nothing: the answer stays ${S}.`,
  pSolReroll1: "If you re-roll, you get an ordinary die, worth 3.5 on average. So keep anything above 3.5, which means 4, 5 or 6, and re-roll 1, 2 and 3. That gives (4 + 5 + 6)/6 for the halves you keep, plus 3/6 × 3.5 for the halves you re-roll: 2.5 + 1.75 = 4.25.",
  pSolReroll2: "Work backwards. With one re-roll left the game is worth 4.25, from the case above. So on the first roll keep anything above 4.25, meaning 5 or 6, and re-roll the rest: (5 + 6)/6 + 4/6 × 4.25 = 11/6 + 17/6 = 14/3, about 4.67.",
  pSolChildren: (all, cond, kept, keptCount, target) =>
    `List every family, oldest child first: ${all}. ${cond} leaves ${kept} — ${keptCount} of them, all equally likely. ` +
    `Exactly one is ${target}, so the answer is 1/${keptCount}.`,
  pSolAces: (n, ans) =>
    `Look at the cards one at a time. Any single card is an ace 4 times in 52, which is 1/13, and that stays true ` +
    `for the second card and the third whatever the earlier ones were. The draws are not independent, but averages ` +
    `add up anyway — that is the whole trick. So ${n} × 1/13 = ${ans}.`,
  pSolReroll3: "Work backwards again. With two re-rolls still to come the game is worth 14/3, about 4.67, from the case above. So on the first roll keep anything above that, meaning 5 or 6, and re-roll the other four faces: (5 + 6)/6 + 4/6 × 14/3 = 11/6 + 56/18 = 89/18, about 4.94.",
  pSolCondDice: (pairs, total, hits, k, ans) =>
    `Knowing the sum throws away every result except these: ${pairs} — ${total} of them. ` +
    `A ${k} appears in ${hits === 1 ? `exactly 1 of them, because the two dice would both have to show ${k}` : `exactly 2, once on each die`}. ` +
    `So ${hits}/${total} = ${ans}.`,
  pSolUrnTwo: (r, N, ans) =>
    `The first draw is red with chance ${r}/${N}. If it was, the urn now holds ${r - 1} red among ${N - 1} balls, ` +
    `so the second is red with chance ${r - 1}/${N - 1}. Multiply: ${r}/${N} × ${r - 1}/${N - 1} = ${ans}.`,
  pSolThreeCoins: (list, target, sum, total, ans) =>
    `Ask how eagerly each coin produces the heads you saw: ${list}. ` +
    `All three were equally likely to be picked, so that part affects each of them the same way and drops out. ` +
    `What is left is this coin's share of the total: ${target} ÷ (${sum}) = ${target} ÷ ${total} = ${ans}.`,
  pSolUrns: (ar, aTot, br, bTot, rA, rB, ans) =>
    `Ask how readily each urn gives up a red ball: A does it ${ar}/${aTot} of the time, B does it ${br}/${bTot} of the time. ` +
    `Both urns were equally likely to be chosen, so that drops out and B's answer is its share of the two: ` +
    `${rB} ÷ (${rA} + ${rB}) = ${ans}.`,
  pSolBox: (flips, fair, ans) =>
    `Ask how readily each coin gives ${flips}. The fair coin: ${fair}. The two-headed coin: 1, every time. ` +
    `The two-tailed coin: 0, never, so it is out. Take the fair coin's share of what is left: ${fair} ÷ (${fair} + 1) = ${ans}.`,
  pSolBoxHeads: (flips, fair, ans) =>
    `Ask how readily each coin gives ${flips}. The fair coin: ${fair}. The two-headed coin: 1, every time. ` +
    `The two-tailed coin: 0, never, so it is out. Take the two-headed coin's share of what is left: ` +
    `1 ÷ (${fair} + 1) = ${ans}.`,
  pSolWaitFirst: (p, ans) => `It happens ${p} of the time, so on average you wait for it once every ${ans} tries. Turn the chance upside down: 1 ÷ (${p}) = ${ans}.`,
  pSolWaitK: (one, k, ans) =>
    `Waiting for the first one costs ${one} tries on average. After it lands, nothing has changed and the wait for the next one costs ${one} again. ` +
    `Waits like this simply add: ${k} × ${one} = ${ans}.`,
  pSolPattern: {
    HT: "Wait 2 flips on average for the first head. Then wait 2 more for a tail. Any extra heads in between cost nothing, because the head you need is already banked. So 2 + 2 = 4.",
    TH: "Wait 2 flips on average for the first tail. Then wait 2 more for a head. Any extra tails in between cost nothing, because the tail you need is already banked. So 2 + 2 = 4.",
    HH: "Wait 2 flips for the first head. Then half the time the next flip is a head and you are done, and half the time it is a tail and you are back to the very beginning. Writing that as E = 2 + 1 + ½·E and solving gives E = 6.",
    TT: "Wait 2 flips for the first tail. Then half the time the next flip is a tail and you are done, and half the time it is a head and you are back to the very beginning. Writing that as E = 2 + 1 + ½·E and solving gives E = 6.",
  },
  pSolCollect: (n, terms, ans) =>
    `The first one is free, it arrives immediately. Once you hold j of them, a new one turns up ${n}−j times out of ${n}, ` +
    `so you wait ${n}/(${n}−j) tries for it. Adding those waits up gives ${n} × (${terms}) ≈ ${ans}. ` +
    `The last one is the slow part: it alone costs ${n} tries.`,
  pSolOrderMax: (n) =>
    `The draws know nothing about each other, so no position is special. ` +
    `Exactly one of the ${n} has to be the biggest, and each is as likely as the next, so each gets 1/${n}.`,
  pSolOrderMono: (n, fact, dir) =>
    `Whatever ${n} numbers you end up with, they could have arrived in any order, and every order is as likely as any other. ` +
    `There are ${n}! = ${fact} orders and exactly one of them is ${dir}, so 1/${fact}.`,
  pSolPickRepeat: (N, k, total, c, ans) =>
    `There are ${N}^${k} = ${total} equally likely sequences in total. An increasing one needs ${k} different values, and each set of ${k} different values ` +
    `can be written in increasing order in exactly one way. The number of such sets is C(${N},${k}) = ${c}, meaning the ways to choose ${k} things from ${N}. ` +
    `So ${c}/${total} ≈ ${ans}.`,
  pSolPickDistinct: (k, fact, N) =>
    `Whichever ${k} numbers you get, they can appear in ${k}! = ${fact} orders, all equally likely, and one of those is increasing. ` +
    `So 1/${fact}. Notice the pool size ${N} never enters the answer.`,
  pSolMontySwitch: (n) =>
    `Your first pick is right 1 time in ${n}. The other ${n - 1} times in ${n} the car sits behind one of the ${n - 1} ` +
    `doors you did not pick, and the host has just opened all of those but one. So switching hands you the car exactly ` +
    `when your first pick was wrong, which is ${n - 1}/${n}.`,
  pSolMontyStay: (n) =>
    `Staying wins exactly when your first pick was right. That was 1 in ${n} before the host opened anything, and the ` +
    `host was always going to be able to show you goats whichever door you had picked, so his opening them tells you ` +
    `nothing about your own door: it is still 1 in ${n}.`,
  pSolRuin: (i, N, ans) =>
    `Neither player has an edge in a single round, so nobody gains or loses on average, and your chance of taking the lot is simply your share of the coins on the table: ` +
    `${i} out of ${N}, which is ${ans}. Coins are the only advantage in this game.`,
  pSolFirst: (p, both, ans) =>
    `Call A's chance P. Two things can happen. A succeeds straight away, chance ${p}. Or A misses and B misses, chance ${both}, ` +
    `and then it is A's turn again with nothing changed, so A's chance is P once more. That gives P = ${p} + ${both}·P, ` +
    `and solving it gives P = ${ans}. Going first is worth a little over half.`,
  pSolDerange: (n, fact, D, none, asksNone, other) =>
    `There are ${n}! = ${fact} ways to fill the envelopes, all equally likely. Of those, ÷ have every letter in the wrong envelope. ` +
    `So the chance of no letter being right is ${none}` +
    (asksNone ? "." : `, and at least one is 1 − ${none} = ${other}.`),
  pSolWalk: (steps, n, c, total, ans) =>
    `Getting home after ${steps} steps means exactly ${n} steps forward and ${n} steps back, in any order. ` +
    `The number of orders is C(${steps},${n}) = ${c}, meaning the ways to choose which ${n} of the ${steps} steps go forward. ` +
    `Every one of the 2^${steps} = ${total} possible walks is equally likely, so ${c}/${total} = ${ans}.`,
  pSolCards: {
    suit: "The first card can be anything at all, so ignore it. Of the 51 cards left, 12 share its suit. So 12/51, which is 4/17.",
    rank: "The first card can be anything at all, so ignore it. Of the 51 cards left, 3 share its rank. So 3/51, which is 1/17.",
    red: "The first card is red 26 times in 52, which is 1/2. Then 25 reds remain among 51 cards. Multiply: 1/2 × 25/51 = 25/102, about 0.245.",
  },
  pSolUnit: {
    band: "Draw a 1 by 1 square with X across and Y up. The points where the two differ by less than ½ form a band down the middle. What it leaves out is two corner triangles, each with legs ½ and area 1/8. So 1 − 2 × 1/8 = 3/4.",
    sum: "Draw a 1 by 1 square. The line X + Y = 1 runs corner to corner, and the region below it is a triangle covering exactly half the square. So 1/2.",
    twice: "Draw a 1 by 1 square. The line Y = X/2 passes through the corner and the midpoint of the right edge, and the region below it is a triangle with base 1 and height ½, so area 1/4.",
  },

  /* probability — trap explanations */
  ptChance: {
    die6: ["There are six faces, not three.", "A die is not a coin."],
    coinH: ["That is two heads in a row."],
    dieOver4: ["Two faces qualify, 5 and 6, not one.", "Greater than 4 is not the same as greater than 3."],
    heart: ["That is one particular rank, not one suit.", "That is one specific card."],
    dieEven: ["Three faces out of six are even."],
    dieUnder3: ["Two faces are below 3, namely 1 and 2, not one.", "Less than 3 is two faces out of six, not half of them."],
    dieNot6: ["That is the chance of rolling a 6, which is the one result the question rules out. Take it from 1."],
    redCard: ["That is one suit. Red is two of them, hearts and diamonds.", "That is one rank, not one colour."],
    aceCard: ["That is one whole suit. The aces are one rank, and there are only 4 of them.", "That is one particular card. Any of the 4 aces counts."],
    faceCard: ["That is one rank. Jack, queen and king are three ranks between them.", "That is three particular cards. Every suit has its own jack, queen and king."],
    twoHeads: ["That is one coin. The second one has to land heads as well.", "HT and TH are two different results, not one, so there are 4 and not 3."],
  },
  ptSumEleven: "There are 11 possible sums but they are not equally likely: 7 happens far more often than 2. Count the 36 pairs instead.",
  ptSumUnordered: "Each pair was counted once, but (2,5) and (5,2) really are two different results, so there are 36 of them, not 21.",
  ptSumOnePair: "That is one single pair. Several different pairs give this sum.",
  ptMissAll: (ev) => `That is the chance of never getting ${ev}. You are one subtraction away: take it from 1.`,
  ptAddedChances: "Chances cannot just be added up like that. Adding counts the times it happens twice over and over, and with enough tries it would pass 1, which is impossible.",
  ptOneTrialOnly: "That is one single try. The question asks across all of them.",
  ptEV: {
    oneDie: ["The middle of 1 to 6 sits between 3 and 4, so the average is 3.5. There is no middle face.", "That is the biggest face, not the average one."],
    sumTwo: ["That is one die. The other die is still there, so add its average too.", "The face that comes up most often is not the same as the average total."],
    heads4: ["That is how many flips you make, not how many come up heads.", "That is one flip's share. There are four flips."],
    sixes12: ["That is how many rolls you make, not how many are sixes.", "That is a number on the die, not a count of anything."],
    heads10: ["That is how many flips you make, not how many land heads.", "That is one flip's share. There are ten flips, so ten shares."],
    sixes6: ["That is how many rolls you make, not how many are sixes.", "That is the average face value, which is a different question."],
    sumThree: ["That is the average for two dice. A third die is still there, so add another 3.5.", "That is one die on its own. All three of them count."],
    cardRank: ["The middle of 1 to 13 is 7. With an odd number of ranks the middle is a real rank, not a half.", "That is the highest rank, not the average one."],
    evens4: ["That is how many rolls you make, not how many come up even.", "Half of four is two."],
    coinPay: ["That is what you collect when you win, and you only win half the time.", "That is a quarter of the prize. Heads comes up half the time, not a quarter."],
    maxThree: ["That is the biggest a die can show, not the biggest it shows on average.", "That is one die on its own. Always taking the largest of three pulls the average well above it."],
    minThree: ["That is the smallest a die can show, not the smallest it shows on average.", "That is one die on its own. Always taking the smallest of three pulls the average well below it."],
    absDiff: ["That is the average of the signed difference, where being ahead and being behind cancel out. The question ignores which die is bigger, so nothing cancels.", "That is one die's own average, not the gap between two of them."],
    product: ["That is the average total, not the average product.", "That is 3.5 × 6. The second die averages 3.5 as well, not 6.", "Very close: 3.5 × 3.5 is 12.25 exactly."],
    larger: ["That is one die by itself. Always taking the bigger of two pulls the average up.", "That is the biggest it can ever be, not what it is on average."],
    smaller: ["That is one die by itself. Always taking the smaller of two pulls the average down.", "That is the smallest it can ever be, not what it is on average."],
  },
  ptStockPath: (n) => `Up then down really does land below where you started, but that is only one of the ways the ${n} days can go. Up then up lands above. Averaged over all of them, they cancel exactly.`,
  ptStockBest: "That is the luckiest case, up every single day.",
  ptStockWorst: "That is the unluckiest case, down every single day.",
  ptAcesOneCard: (n) => `That is one single card's share. The hand holds ${n} cards, and each of them counts.`,
  ptAcesAllFour: "That is every ace in the deck. A hand this size will not usually hold all of them.",
  ptRerollPlain: "That is a plain die with no re-roll. Being allowed to re-roll can only help, so the answer has to be above 3.5.",
  ptRerollOther: "That is the answer for a different number of re-rolls. Check how many this question gives you.",
  ptRerollFive: "You do not keep only 5 and 6 here. Re-roll whenever your roll is below what a fresh roll is worth, and keep it otherwise.",
  ptChildOtherVersion: (sex, kept, other) =>
    `That is the answer to the other version, "at least one is a ${sex}". Naming a particular child is stronger ` +
    `information than saying one exists somewhere: it leaves ${kept} families rather than ${other}.`,
  ptChildNamedOne: (sex, kept, other) =>
    `That is the answer to the other version, the one that names a particular child. "At least one is a ${sex}" only ` +
    `says such a child exists somewhere, which rules out far less: ${kept} families survive it rather than ${other}.`,
  ptChildPrior: "That is the chance before anyone told you anything at all. What you were told rules some families out, so the answer has to be bigger than this.",
  ptCondUnconditional: "That is one die on its own, ignoring what you were told. The sum rules out most results and changes the answer.",
  ptCondPlain: (k) => `That is the chance of a ${k} in two rolls when you know nothing about the total.`,
  ptCondOnePair: (total, k) => `Two of the ${total} results contain a ${k}, not one, because the ${k} can sit on either die.`,
  ptUrnReplace: "That would be right if you put the first ball back. You do not, so the second draw sees one fewer red ball and one fewer ball in total.",
  ptUrnFirstOnly: "That is only the first draw. The second one still has to be red as well.",
  ptUrnSecondOnly: "That is the second draw, assuming the first was red. You still have to multiply by the chance the first one was.",
  ptCoinAlone: "That is how often this coin alone shows heads. You still have to compare it against what the other two would have done.",
  ptCoinPrior: "That is the chance before you flipped. Seeing heads is evidence, and evidence has to move the answer.",
  ptCoinDividedThrice: "The 1/3 chance of picking each coin appears on the top and the bottom of the fraction, so it cancels. Do not divide by 3 as well.",
  ptUrnsBOnly: "That is how often urn B gives a red ball on its own. The question is which urn you are holding, so urn A's rate has to come into it too.",
  ptUrnsPrior: "That is the chance before you drew anything. A red ball is evidence, and it points at whichever urn is redder.",
  ptUrnsCounts: (a, aTot, b, bTot) => `Red balls were counted straight up, but the urns hold different numbers of balls, so compare the rates ${a}/${aTot} and ${b}/${bTot} instead of the counts.`,
  ptBoxPrior: "That is the chance before you flipped. A run of heads is evidence, and it counts against the fair coin.",
  ptBoxHalf: "Two coins can show heads, but not equally readily: the two-headed one does it every single time, the fair one only sometimes.",
  ptBoxAlone: (flips) => `That is how often the fair coin gives ${flips} on its own. You still have to compare it against the two-headed coin.`,
  ptBoxCertain: "The two-headed coin does give heads every single time, but that is not what was asked. Being certain to produce the evidence is not the same as being certain once you have seen it, because the fair coin produces it too, just less often.",
  ptWaitFlip: "That is the probability of it happening, not how long you wait. Flip the fraction over.",
  ptWaitCountsToo: "The try that finally works counts as a try too.",
  ptWaitFirstOnly: "That is the wait for the first one only. Each of the others costs the same again.",
  ptWaitMultiplied: "Waits add, they do not multiply. Multiplying is for working out the chance of several things all happening.",
  ptWaitSuccesses: "That is how many successes you want, not how many tries it takes to get them.",
  ptPatternContrast: {
    HT: "After a head, another head does not hurt you: you are still waiting for the tail, and the head you already have is still good.",
    TH: "After a tail, another tail does not hurt you: you are still waiting for the head, and the tail you already have is still good.",
    HH: "A tail lands after your first head half the time, and it wipes the run out so you start again. That restarting is why this costs 6 while heads-then-tails costs only 4.",
    TT: "A head lands after your first tail half the time, and it wipes the run out so you start again. That restarting is why this costs 6 while tails-then-heads costs only 4.",
  },
  ptPatternOneFace: "That is the wait for one particular face. This question wants a two-flip pattern.",
  ptCollectMin: "That is the fastest it could possibly go, with no repeats at all. Repeats are common, so the real wait is longer.",
  ptCollectSquare: "Too long. Waiting gets slower as you go, but not that much slower: the total is a bit under twice the number of trials you would guess.",
  ptOrderPosition: "The position number does not matter. Coming out later does not make a number bigger.",
  ptOrderTwo: "That would be the answer with only two draws.",
  ptOrderFull: (n) => `That is the chance of one exact ordering of all ${n}. Here you only care which one is on top.`,
  pSolOrderEnds: (n, orders, less, both) =>
    `Whatever values turn up, all ${orders} orders of them are equally likely. The largest has to land in the first slot, ` +
    `which happens 1 time in ${n}. Once it has, the smallest has to land in the last slot among the ${less} places left, ` +
    `1 time in ${less}. That second count was taken after the first had already landed, so the two multiply: ` +
    `1/(${n} × ${less}) = 1/${both}.`,
  pSolOrderEither: (orders) =>
    `All ${orders} orders are equally likely. Exactly one of them runs increasing and exactly one runs decreasing, ` +
    `so 2 of the ${orders}, which is 2/${orders}.`,
  ptEndsFullOrder: "That pins the whole order down. Only the two ends are fixed here, and the draws in between may fall any way they like.",
  ptEndsFirstOnly: "That is the first half of the condition only. The last draw still has to be the smallest of everything that is left.",
  ptEitherOne: "That is one of the two orders. Both count here, so there are two of them, not one.",
  ptMonoMax: "That is the chance of one particular number being the biggest. Here the whole order has to be right, which is much harder.",
  ptMonoBoth: "Increasing and decreasing are two separate orders. The question asks for one of them, not either.",
  ptMonoFlips: "Ordering is not a run of coin flips. Count the orders instead: there are n! of them.",
  ptPickDistinctAnswer: "That is the answer when the picks have to be different. Here repeats are allowed, and a repeat can never be increasing, so the answer must be smaller.",
  ptPickPerItem: (total) => `Not a per-pick chance. Count the increasing sequences against all ${total} of them.`,
  ptPickPoolSize: (k) => `Once the ${k} numbers are different, the size of the pool stops mattering. Only the number of orders counts.`,
  ptPickPoolCancels: (k, fact) => `The pool size cancels out. Any ${k} different values have ${fact} equally likely orders and one is increasing.`,
  ptMontyHalf: "Two doors are left, but they are not equally likely. The host is not choosing at random: he knows where the car is and never opens it, and that is information about the door he left shut.",
  ptMontyOther: "That is the chance for the other strategy. Read carefully which one the question asks about.",
  ptRuinHalf: "Each round is fair, but the whole game is not. Whoever starts with fewer coins runs out first far more often.",
  ptRuinOther: "That is B's chance of winning, not A's. The two have to add up to 1.",
  ptRuinOneCoin: "The chance follows the whole starting pile, not a single coin.",
  ptFirstHalf: "Going first is a genuine advantage: A gets a chance to win before B ever throws.",
  ptFirstTurnOne: "That is only A's very first turn. A can also win later, after both players miss.",
  ptFirstAverage: "Set it up as one equation instead: A wins now, or both miss and the game is back where it started.",
  ptDerangeOpposite: "That is the opposite of what was asked. Check whether the question says no letter or at least one.",
  ptDerangeOne: "That is about one named letter. The question is about the whole arrangement at once.",
  ptDerangePerfect: "That is the chance of the single perfect arrangement where every letter lands correctly.",
  ptWalkHalf: "Coming home is one particular outcome among many, not a coin flip between home and not home.",
  ptWalkCount: (c, total) => `Count the walks: ${c} of the ${total} possible ones end where they started.`,
  ptCards: {
    suit: ["That would be right if the second card had to be a named suit. It only has to match the first, and one card of that suit has already left the deck.", "That is about ranks like queens, not about suits."],
    rank: ["Three cards of that rank remain out of 51, not four out of 52: the first card is already in your hand.", "That is one specific card."],
    red: ["Very close, but the deck changes: after a red leaves, 25 reds remain among 51 cards, not 26 among 52.", "That is only the first card. The second one has to be red as well."],
  },
  ptUnit: {
    band: ["The band is wider than half the square. Draw it: the two corners it misses are triangles of area 1/8 each, so only 1/4 is left out.", "That is the part left out, not the part asked for."],
    sum: ["The line runs corner to corner and cuts the square cleanly in half, so the triangle below it is 1/2, not 1/4."],
    twice: ["That would be the line Y = X. The line Y = X/2 is shallower and cuts off only a quarter."],
  },

  ordinal: (n) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th"),
  fallbackOdd: "arithmetic",
};

/* ── Vietnamese ──────────────────────────────────────────────────────────── */
const vi = {
  lang: "vi",
  n: (x) => num(x, "vi"),
  sep: pairSep("vi"),
  f: (x) => frac(x).replace(".", ","),

  seqNext: (terms) => terms.join(",  ") + ",  ?",
  seqSolution: (rule, last, next) =>
    `Quy luật: ${rule}. Đi tiếp từ ${last} thì ra ${next}.`,
  oddSolution: (rule, pos, shown, wanted) =>
    `Tìm quy luật mà phần lớn tuân theo: ${rule}. Mọi số đều khớp trừ vị trí ${pos}, ` +
    `chỗ đó đang là ${shown} trong khi quy luật cần ${wanted}.`,

  ruleAdd: (d) => (d >= 0 ? `cộng ${d} mỗi lần` : `trừ ${-d} mỗi lần`),
  ruleMul: (r) => `nhân với ${r} mỗi lần`,
  ruleMulNeg: (r) => `nhân với ${r} mỗi lần, nên dấu đổi qua lại từng bước`,
  ruleDiv: (r) => `chia cho ${r} mỗi lần`,
  ruleQuad: (gaps, dd) =>
    `các hiệu là ${gaps.join(", ")}, và chính các hiệu đó lại ${vi.ruleAdd(dd)}`,
  ruleFib: () => "mỗi số là hai số đứng trước cộng lại",
  ruleAffine: (a, b) => `nhân với ${a}, rồi ${vi.ruleAdd(b)}`,
  ruleInter: (d1, d2) =>
    `hai dãy đi xen kẽ: các số thứ 1, 3, 5 thì ${vi.ruleAdd(d1)}, còn các số thứ 2, 4, 6 thì ${vi.ruleAdd(d2)}`,
  ruleAltOps: (mul, add) =>
    `hai phép tính thay phiên: nhân với ${mul}, rồi cộng ${add}, rồi lại nhân với ${mul}`,
  ruleSpecial: (name, st) => `${name}, bắt đầu từ số thứ ${st}`,
  ruleSpecialOff: (name, off) =>
    `${name}, mỗi số ${off > 0 ? "cộng thêm " + off : "trừ đi " + -off}`,
  ruleGrowing: (first, dd) => `các hiệu bắt đầu từ ${first} và tăng thêm ${dd} mỗi lần`,
  ruleLetterStep: (d) => `đi ${Math.abs(d)} chữ cái ${d > 0 ? "tới" : "lùi"} trong bảng chữ cái mỗi lần`,
  ruleLetterGrow: (first) => `bước nhảy trong bảng chữ cái bắt đầu từ ${first} rồi tăng thêm 1 mỗi lần`,
  ruleLetterPair: () => "chữ cái thứ nhất đi tới từng bước một, chữ cái thứ hai lùi lại từng bước một",
  ruleLetterMix: (d) => `chữ cái đi tới ${d} mỗi lần, còn con số đếm lên 1, 2, 3`,
  ruleCubic: (gaps) =>
    `các hiệu là ${gaps.join(", ")}; lấy hiệu của chúng lần nữa thì tăng đều, tức là dạng bậc ba`,
  ruleProduct: () => "mỗi số là hai số đứng trước nhân lại",
  ruleDigitSum: (a, digits, next) =>
    `cộng chính các chữ số của nó vào nó: ${a} + ${digits.join(" + ")} = ${next}, cứ thế tiếp`,
  ruleThree: (d0, d1, d2) =>
    `ba dãy thay phiên nhau: cứ cách 3 số tính từ số thứ nhất thì ${vi.ruleAdd(d0)}, từ số thứ hai thì ${vi.ruleAdd(d1)}, từ số thứ ba thì ${vi.ruleAdd(d2)}`,
  ruleLetterSquare: (d) => `chữ cái đi tới ${d} mỗi lần, còn con số chạy theo các bình phương 1, 4, 9, 16, 25`,
  ruleGeomDiff: (gaps, r) => `các hiệu là ${gaps.join(", ")} — mỗi hiệu bằng hiệu trước nhân với ${r}`,
  ruleSkip: (word, skip) => `${word}, lấy cách ${skip === 2 ? "một số" : skip - 1 + " số"}`,
  ruleWords: (name, shown) =>
    `đây không phải bước nhảy trong bảng chữ cái — đó là chữ cái đầu của ${name}. Ở đây: ${shown}`,

  specialNames: {
    sq: "các số chính phương", cb: "các số lập phương", pr: "các số nguyên tố",
    tri: "các số tam giác", fac: "các giai thừa 1, 2, 6, 24, 120",
  },
  skipNames: { prime: "các số nguyên tố", square: "các số chính phương", tri: "các số tam giác", cube: "các số lập phương" },
  wordListNames: {
    numbers: "các số viết bằng chữ tiếng Anh: One, Two, Three, Four…",
    ordinals: "các thứ tự viết bằng chữ tiếng Anh: First, Second, Third…",
    months: "các tháng trong năm bằng tiếng Anh",
    days: "các thứ trong tuần bằng tiếng Anh",
  },
  /* arithmetic — prompts */
  aFracToDec: (n, d) => `${n}/${d} ra số thập phân`,
  aPercentOf: (p, y) => `${p}% của ${y}`,
  aWhatPercent: (x, y) => `${x} bằng bao nhiêu % của ${y}`,
  aWhichLarger: () => "Số nào lớn hơn?",
  aWhichLargest: () => "Số nào lớn nhất?",
  aRelation: (n, d, b1, p, b2) => `A = ${n}/${d} của ${b1},  B = ${p}% của ${b2}.  A − B`,
  aCubeRoot: (cube) => `∛${cube}`,

  /* arithmetic — worked solutions */
  aTimesDropZero: (big, small, prod, whole) =>
    `Bỏ số 0 đi: ${big} × ${small} = ${prod}, rồi trả số 0 lại: ${whole}`,
  aTimesEleven: (small, whole) => `11 × ${small} = ${small} × 10 + ${small} = ${small * 10} + ${small} = ${whole}`,
  aTimesTwelve: (small, whole) => `12 × ${small} = ${small} × 10 + ${small} × 2 = ${small * 10} + ${small * 2} = ${whole}`,
  aTimesFromTen: (small, big, whole) =>
    `${small} × ${big} = ${whole}. Nếu quên, đi vòng từ ${small} × 10 = ${small * 10}, ` +
    `rồi bớt ${small} × ${10 - big} = ${small * (10 - big)}: ${small * 10} − ${small * (10 - big)} = ${whole}`,
  aSplitMul: (a, b, tens, units) =>
    `${a} × ${b} = ${a} × ${tens} + ${a} × ${units} = ${a * tens} + ${a * units} = ${a * b}`,
  aPlainMul: (a, b) => `${a} × ${b} = ${a * b}`,
  aRunningAdd: (a, steps) => `Cộng phần lớn trước và đọc to từng số: ${steps}`,
  aRunningSub: (a, steps) => `Trừ phần lớn trước và đọc to từng số: ${steps}`,
  aStep: (from, sign, place, running) => `${from} ${sign} ${place} = ${running}`,
  aSplitBigger: (a, b, tens, units) =>
    `Tách số lớn hơn ra: ${a} × ${b} = ${tens} × ${b} + ${units} × ${b} = ${tens * b} + ${units * b} = ${a * b}`,
  aHalveTen: (a, ten, half) => `${a} × 10 = ${ten}, rồi chia đôi: ${half}`,
  aHalveHundred: (a, hundred, half) => `${a} × 100 = ${hundred}, rồi chia đôi: ${half}`,
  aElevenDigits: (hi, lo, sum, whole) => `Hai chữ số ngoài là ${hi} và ${lo}, tổng ${sum} đặt vào giữa: ${whole}`,
  aTakeOneOff: (a, round, whole) => `${a} × ${round} = ${a * round}, rồi bớt đi một lần ${a}: ${whole}`,
  aQuarter: (a, hundred, quarter) => `${a} × 100 = ${hundred}, rồi lấy một phần tư: ${quarter}`,
  aDivideAsk: (b, total, ans) => `Hỏi số nào nhân ${b} ra ${total}: ${b} × ${ans} = ${total}`,
  aDivideSteps: (total, b, chunk, rest, ans) =>
    `${b} × ${chunk} = ${b * chunk}, còn lại ${total} − ${b * chunk} = ${total - b * chunk}, ` +
    `và ${total - b * chunk} ÷ ${b} = ${rest}. Vậy ${chunk} + ${rest} = ${ans}`,
  aDivideDirect: (b, ans, total) => `${b} × ${ans} = ${total}, nên đáp án là ${ans}`,
  aSquareEndsFive: (front, next, prod, whole) =>
    `Nó tận cùng bằng 5, nên lấy phần đầu là ${front} nhân với số liền sau là ${next}: ` +
    `${front} × ${next} = ${prod}. Viết 25 vào sau: ${whole}`,
  aSquareRound: (n, tens, whole) => `${n} tận cùng bằng 0, nên bình phương ${tens} rồi thêm hai số 0: ${whole}`,
  aSquareSlide: (d, dir, n, lo, hi, prod, corr, whole) =>
    `Trượt ${d} ${dir} để chạm số tròn, rồi trả lại phần bù: ` +
    `${n}² = ${lo} × ${hi} + ${d}² = ${prod} + ${corr} = ${whole}`,
  aSlideDown: "xuống", aSlideUp: "lên",
  aSqrtAsk: (sq, n) => `Hỏi số nào bình phương ra ${sq}: ${n}² = ${sq}, nên căn là ${n}`,
  aCubeSteps: (n, sq, cube) => `Lập phương là ba lần nhân với chính nó: ${n} × ${n} = ${sq}, rồi ${sq} × ${n} = ${cube}`,
  aPowerSteps: (base, e, chain, whole) => `${e} lần ${base} nhân với nhau: ${chain} = ${whole}`,
  aCubeRootSol: (cube, tens, loCube, hiCube, lastCube, lastRoot, n) =>
    `Hai manh mối ép ra đáp án. Về độ lớn: ${cube} nằm giữa ${tens * 10}³ = ${loCube} và ${(tens + 1) * 10}³ = ${hiCube}, ` +
    `nên đáp án bắt đầu bằng ${tens}. Về chữ số cuối: lập phương tận cùng ${lastCube} chỉ có thể đến từ căn tận cùng ${lastRoot}. Vậy là ${n}.`,
  aOneOverD: (d, dec, n, whole) => `1/${d} = ${dec}, nên ${n}/${d} = ${n} × ${dec} = ${whole}`,
  aFracMul: (n1, n2, top, d1, d2, bot, cancelled, whole) =>
    `Nhân phân số là nhân thẳng: tử ${n1} × ${n2} = ${top}, mẫu ${d1} × ${d2} = ${bot}. ` +
    (cancelled ? `Rút gọn thành ${cancelled}, tức ${whole}.` : `Đổi ra thập phân là ${whole}.`),
  aFracAdd: (n1, d1, a1, n2, d2, a2, lcm, sum, whole) =>
    `Muốn cộng thì phải cùng mẫu. Cả hai đều quy về ${lcm}: ${n1}/${d1} = ${a1}/${lcm} và ${n2}/${d2} = ${a2}/${lcm}. ` +
    `Giờ cộng tử: ${sum}/${lcm} = ${whole}`,
  aPctHalf: (y, half) => `Phần trăm là phần của một trăm, và 50 trên 100 là một nửa. Chia đôi ${y}: ${half}`,
  aPctQuarter: (y, half, quarter) => `25 trên 100 là một phần tư. Chia đôi ${y} được ${half}, rồi chia đôi lần nữa: ${quarter}`,
  aPctTenth: (y, ten) => `10 trên 100 là một phần mười, nên dịch chữ số sang một hàng: ${y} thành ${ten}`,
  aPctFromTen: (p, y, ten, whole) => `Bắt đầu từ một phần mười của ${y}, tức ${ten}. Rồi ${p}% là ${p === 20 ? "gấp đôi số đó" : "một nửa số đó"}: ${whole}`,
  aPctBuild: (ten, times, p, whole, y) => `Dựng từ một phần mười của ${y}, tức ${ten}. ${p}% là ${times} lần số đó, nên ${ten} × ${times} = ${whole}`,
  aPctOfWhole: (x, y, share, whole) => `Đặt nó trên tổng rồi đọc thành phần trăm: ${x}/${y} ≈ ${share}. Nhân 100 thì thành ${whole}, nên đáp án là ${whole}%.`,
  aEstDiv: (a, rb, first, b, pct, dir, est, exact) =>
    `Chia cho số tròn trước đã: ${a} ÷ ${rb} ≈ ${first}. Nhưng ${b} ${dir} ${rb} khoảng ${pct}%, ` +
    `nên đẩy đáp án ngược lại chừng đó: khoảng ${est}. Giá trị thật là ${exact}, và sai lệch trong 5% vẫn tính đúng.`,
  aEstMul: (a, ra, b, est, exact) =>
    `Làm tròn số lớn chứ đừng làm tròn số nhỏ: ${a} xấp xỉ ${ra}, và ${ra} × ${b} = ${est}. ` +
    `Giá trị thật là ${exact}. Nếu làm tròn ${b} thì lệch xa hơn 5% được phép rất nhiều.`,
  aEstSqrt: (lo, loSq, hi, hiSq, a, side, near, rough) =>
    `${lo}² = ${loSq} và ${hi}² = ${hiSq}, mà ${a} nằm giữa hai số đó, nên căn nhỉnh ${side} ${near} một chút: khoảng ${rough}`,
  aAbove: "hơn", aBelow: "kém",
  aEstMore: "lớn hơn", aEstLess: "nhỏ hơn",
  aBalanceCancel: (g, a, c, left, right, ans) =>
    `Rút gọn thừa số chung ${g} của ${a} và ${c} trước: còn lại ${left} × ?, nên ? = ${ans}`,
  aBalanceDirect: (a, b, prod, c, ans) => `Tính vế trái, ${a} × ${b} = ${prod}, rồi chia cho ${c}: ${prod} ÷ ${c} = ${ans}`,
  aMissingMul: (prod, a, b, place, digit) => `Chia ngược lại: ${prod} ÷ ${a} = ${b}, nên chữ số ${place} là ${digit}`,
  aMissingAdd: (sum, b, a, place, digit) => `Làm ngược phép cộng: ${sum} − ${b} = ${a}, nên chữ số ${place} là ${digit}`,
  aMissingSub: (diff, b, a, place, digit) => `Làm ngược phép trừ: ${diff} + ${b} = ${a}, nên chữ số ${place} là ${digit}`,
  aPlaces: ["hàng đơn vị", "hàng chục", "hàng trăm", "hàng nghìn"],
  aRelationSol: (b1, den, part, num, A, b2, tenth, B, diff) =>
    `A: ${b1} ÷ ${den} = ${part}, rồi ${part} × ${num} = ${A}. B: một phần mười của ${b2} là ${tenth}, nên B bằng ${B}. Rồi ${A} − ${B} = ${diff}`,
  aLargestSol: (list, best) => `Tính từng cái ra: ${list}. Lớn nhất là ${best}.`,
  aStraddle: (lo, hi, centre, d, sq, corr, whole) =>
    `Chúng nằm hai bên ${centre}, mỗi bên cách ${d}. Vậy ${centre}² − ${d}² = ${sq} − ${corr} = ${whole}`,

  /* arithmetic — trap explanations */
  ttRowEarly: (a, b) => `Đó là ${a} × ${b}. Lệch một dòng lên trên trong bảng cửu chương.`,
  ttRowLate: (a, b) => `Đó là ${a} × ${b}. Lệch một dòng xuống dưới trong bảng cửu chương.`,
  ttAddedNotMultiplied: () => "Cộng mất rồi, đề là nhân.",
  ttTenDropped: () => "Rơi mất một chục lúc nhớ.",
  ttHundredDropped: () => "Rơi mất một trăm lúc nhớ. Đọc to số đang cộng dở ở mỗi bước là hết bị.",
  ttHundredLeftIn: () => "Còn thừa lại một trăm. Đây đúng là thứ mà cách làm tròn lên rồi cộng bù gây ra khi bạn vội; đi từ trái sang phải thì không bao giờ bị.",
  ttHundredTwice: () => "Trừ mất một trăm hai lần.",
  ttBorrowMissed: () => "Quên mượn ở hàng chục.",
  ttOnlyTens: (a, tens, units, part) => `Đó mới là ${a} × ${tens}. Phần đơn vị, ${a} × ${units} = ${part}, vẫn phải cộng vào.`,
  ttOnlyTensOfA: (tens, b, units, part) => `Đó mới là ${tens} × ${b}. Phần đơn vị, ${units} × ${b} = ${part}, vẫn phải cộng vào.`,
  ttOnlyUnits: (a, units, tens, part) => `Đó mới là ${a} × ${units}. Phần chục, ${a} × ${tens} = ${part}, còn thiếu.`,
  ttNoPlaceValue: () => "Hai nửa được cộng lại mà quên giá trị hàng: phần chục đáng giá gấp mười lần vẻ ngoài của nó.",
  ttOneCopyShort: (a) => `Thiếu một lần ${a}. Kiểm lại bước cuối của phép tách.`,
  ttOneCopyOver: (a) => `Thừa một lần ${a}. Đếm lại các phần của phép tách.`,
  ttCarryOver: (tens, units) => `Thừa một chục lúc cộng ${tens} với ${units}. Đây là cách mất câu này phổ biến nhất.`,
  ttCarryUnder: (tens, units) => `Thiếu một chục lúc cộng ${tens} với ${units}.`,
  ttCarryHundred: (tens, units) => `Thừa một trăm lúc cộng ${tens} với ${units}. Hãy đọc to số đang cộng dở.`,
  ttCentreOnly: (centre, d, corr) => `Đó là ${centre}², tức số ở chính giữa. Bạn còn phải trừ đi bình phương khoảng cách, ${d}² = ${corr}.`,
  ttCentreAdded: () => "Phần bù bị cộng vào thay vì trừ đi. Tích của hai số nằm hai bên một tâm luôn nhỏ hơn bình phương của tâm.",
  ttMultipliedNotDivided: () => "Nhân mất rồi, đề là chia. Thử nhân ngược lại để kiểm: đáp án nhân số chia phải ra đúng số ban đầu.",
  ttQuotientHigh: (b) => `Cao hơn một đơn vị. Nhân ngược lại để kiểm: ${b} nhân đáp án của bạn phải ra đúng số ban đầu.`,
  ttQuotientLow: (b) => `Thấp hơn một đơn vị. Nhân ngược lại để kiểm: ${b} nhân đáp án của bạn phải ra đúng số ban đầu.`,
  ttQuotientTen: () => "Thừa một chục trong đáp án; giá trị hàng bị trượt.",
  ttQuotientTenLow: () => "Thiếu một chục trong đáp án; giá trị hàng bị trượt.",
  ttQuotientFive: (b) => `Thấp hơn 5. Lần đoán thương đầu tiên thường thấp; nhân nó ngược lại với ${b} là thấy còn dư bao nhiêu.`,
  ttQuotientFour: (b) => `Thấp hơn 4. Nhân đáp án ngược lại với ${b}: phần còn dư chính là phần chưa chia hết.`,
  ttNoCorrection: (lo, hi, prod, d, corr) => `Chưa cộng phần bù. ${lo} × ${hi} = ${prod}, và bạn còn nợ ${d}² = ${corr}.`,
  ttOffByOneSquare: (m) => `Đó là ${m}². Lệch một đơn vị trước khi bình phương.`,
  ttDoubled: () => "Nhân đôi mất rồi, đề là bình phương.",
  ttHalvedNotRooted: () => "Chia đôi mất rồi, đề là căn bậc hai. Căn bậc hai hỏi số nào nhân với chính nó ra số này.",
  ttSquaredNotCubed: (n) => `Đó là ${n}², còn thiếu một phép nhân. Lập phương là ba lần nhân với nhau.`,
  ttTimesThree: () => "Nhân 3 mất rồi, đề là luỹ thừa ba. Số 3 đếm số lần nhân, nó không phải một thừa số.",
  ttOneFactorShort: (b, e, count) => `Đó là ${b}^${e}. Thiếu một thừa số; số mũ đếm số lần nhân, nên phải có ${count} lần.`,
  ttBaseTimesExp: () => "Nhân cơ số với số mũ mất rồi. Số mũ đếm số lần nhân, nó không phải một trong các thừa số.",
  ttCubeLastDigit: (last, root) => `Chữ số cuối của lập phương không đứng yên với 2, 3, 7 và 8: 2 đổi với 8, còn 3 đổi với 7. Lập phương tận cùng ${last} thì căn tận cùng ${root}.`,
  ttDividedByThree: () => "Chia 3 mất rồi, đề là căn bậc ba. Căn bậc ba hỏi số nào nhân với chính nó ba lần ra số này.",
  ttUpsideDown: () => "Phân số bị đọc ngược. Số trên là bạn có mấy phần, số dưới là mấy phần thì thành một.",
  ttAddedNotMultipliedFrac: () => "Cộng mất rồi, đề là nhân.",
  ttBottomsAdded: () => "Mẫu số bị cộng lại. Khi nhân thì mẫu cũng nhân với nhau.",
  ttTopsAndBottoms: () => "Tử cộng tử, mẫu cộng mẫu. Cộng không làm vậy được: một nửa cộng một nửa sẽ ra một nửa. Phải quy về cùng mẫu trước.",
  ttMultipliedNotAdded: () => "Nhân mất rồi, đề là cộng.",
  ttFactorOfTen: () => "Lệch mười lần. Phần trăm là phần của một trăm, nên phải chia cho 100.",
  ttDividedByPercent: (p, y) => `Chia cho ${p} mất rồi, đề là lấy ${p} phần trăm của ${y}.`,
  ttFactorOfTenCheck: () => "Lệch mười lần. Đối chiếu với 10% là thấy ngay.",
  ttSwapped: () => "Hai số bị đảo chỗ. Cái đứng sau chữ 'của' là toàn thể, và nó nằm dưới mẫu.",
  ttNotAPercent: () => "Tỉ lệ đúng rồi nhưng chưa đổi ra phần trăm. Nhân với 100.",
  ttOffByOneDiv: () => "Lệch một đơn vị ở phép chia cuối. Nhân ngược lại để kiểm.",
  ttLeftSideOnly: (a, b, c) => `Đó là vế trái, ${a} × ${b}. Nó còn phải chia cho ${c}.`,
  ttWrongWayRound: () => "Trừ ngược chiều rồi.",
  ttAddedNotSubtracted: () => "Cộng mất rồi, đề là trừ.",
  ttAOnly: () => "Đó mới là A. Còn phải trừ B đi.",
  ttLargestNote: () => "So cơ số không thôi thì không được: cơ số nhỏ với số mũ lớn thường thắng, như 4^7 lớn hơn cả 3^7 lẫn 6^5. Phải tính từng cái ra.",

  /* số học — các dạng cấp 3 có trên đề thật */
  aTeens: (a, b, ub, plus, tens, ua, units, whole) =>
    `Hai số từ 11 tới 19 nhân nhau: lấy hàng đơn vị của số này cộng vào nguyên số kia, nhân mười, rồi cộng tích hai hàng đơn vị. ` +
    `${a} + ${ub} = ${plus}, nên ${plus} × 10 = ${tens}. Hai hàng đơn vị là ${ua} × ${ub} = ${units}. Rồi ${tens} + ${units} = ${whole}.`,
  ttTeensNoUnits: (ua, ub, units) => `Đó mới là nửa đầu. Hai hàng đơn vị vẫn phải nhân: ${ua} × ${ub} = ${units}, và cộng vào cuối.`,
  aSplitThree: (a, b, h, tn, u, hb, tb, ub, whole) =>
    `Ba phần, phần lớn trước: ${a} = ${h} + ${tn} + ${u}. ` +
    `${h} × ${b} = ${hb}, ${tn} × ${b} = ${tb}, ${u} × ${b} = ${ub}. Cộng dần theo từng bước: ${hb} + ${tb} + ${ub} = ${whole}.`,
  ttForgotHundreds: (h, b, hb) => `Hàng trăm bị cộng vào thay vì nhân. ${h} × ${b} = ${hb}, không phải ${h}.`,
  aDivideRemainder: (b, whole, product, total, r, frac, ans) =>
    `Chia không hết, và đó chính là ý đề. ${b} × ${whole} = ${product}, còn lại ${total} − ${product} = ${r}. ` +
    `Giờ ${r} ÷ ${b} = ${frac}, nên đáp án là ${whole} + ${frac} = ${ans}.`,
  ttDroppedRemainder: (r) => `Đó mới là phần nguyên. Còn dư ${r}, và phần dư đó có giá trị.`,
  ttRoundedUp: (r, b) => `Làm tròn lên số nguyên kế tiếp. Đề muốn con số chính xác: ${r} trên ${b}, đổi ra thập phân, gắn vào cuối.`,
  ttRemainderAsTenths: (r, b) => `Phần dư bị viết thành phần mười. Nó là ${r} trên ${b}, không phải ${r} trên 10.`,
  aFracDiv: (n1, d1, n2, d2, fn, fd, top, bot, cancelled, whole) =>
    `Chia cho một phân số là nhân với nghịch đảo của nó: (${n1}/${d1}) ÷ (${n2}/${d2}) = (${n1}/${d1}) × (${fn}/${fd}). ` +
    `Tử ${n1} × ${fn} = ${top}, mẫu ${d1} × ${fd} = ${bot}. ` +
    (cancelled ? `Rút gọn thành ${cancelled}, tức ${whole}.` : `Đổi ra thập phân là ${whole}.`),
  ttNotFlipped: () => "Nhân thẳng mà không lật phân số thứ hai. Phép chia phải lật nó trước.",
  ttFlippedWrongOne: () => "Lật phân số thứ nhất thay vì thứ hai. Chỉ phân số đem chia mới được lật.",
  aFracSub: (n1, d1, a1, n2, d2, a2, lcm, diff, whole) =>
    `Muốn trừ thì phải cùng mẫu. Cả hai đều quy về ${lcm}: ${n1}/${d1} = ${a1}/${lcm} và ${n2}/${d2} = ${a2}/${lcm}. ` +
    `Giờ trừ tử: ${a1} − ${a2} = ${diff}, nên ${diff}/${lcm} = ${whole}`,
  aPctOnePercent: (y, one, p, whole) =>
    `Phần trăm bất kỳ: tìm một phần trăm trước. 1% của ${y} là ${one}, nên ${p}% là ${p} lần số đó: ${p} × ${one} = ${whole}`,
  aAskPctChain: (y, up, down) => `Bắt đầu từ ${y}. Tăng ${up}%, rồi giảm kết quả đi ${down}%. Giờ còn bao nhiêu?`,
  aPctChain: (y, up, upFactor, mid, down, downFactor, end) =>
    `Hai bước, mỗi bước là một phép nhân. Tăng ${up}% là × ${upFactor}: ${y} × ${upFactor} = ${mid}. ` +
    `Giảm ${down}% là × ${downFactor}: ${mid} × ${downFactor} = ${end}. Hai phần trăm không triệt tiêu nhau, vì cái thứ hai tác động lên một con số khác.`,
  ttChainAdded: (up, down) => `Cộng hai phần trăm lại: tăng ${up} và giảm ${down} thành một bước ròng. Chúng tác động lên hai con số khác nhau, nên không cộng được.`,
  ttChainHalfDone: (down) => `Đó mới là sau bước tăng. Bước giảm ${down}% vẫn còn phía trước.`,

  /* số học — số thập phân */
  dSolAdd: (wa, wb, wsum, fa, fb, fsum, ans) =>
    `Phần nguyên trước: ${wa} + ${wb} = ${wsum}. Rồi riêng phần thập phân: ${fa} + ${fb} = ${fsum}. ` +
    `Ghép lại: ${wsum} + ${fsum} = ${ans}.`,
  dSolSub: (a, wb, afterWhole, fb, ans) =>
    `Trừ phần nguyên của số thứ hai trước: ${a} − ${wb} = ${afterWhole}. ` +
    `Rồi trừ phần thập phân của nó: ${afterWhole} − ${fb} = ${ans}.`,
  dtForgotFraction: (fb) => `Phần nguyên đã được xử lý, còn ${fb} ở đuôi số thứ hai thì bị bỏ quên.`,
  dtPointRight: () => "Dấu phẩy rơi lệch một chỗ sang phải, nên con số này lớn gấp mười.",
  dtPointLeft: () => "Dấu phẩy rơi lệch một chỗ sang trái, nên con số này chỉ bằng một phần mười đáp án.",
  dSolMul: (a, b, ia, ib, prod, ans) =>
    `Bỏ dấu phẩy đi và nhân hai số nguyên: ${ia} × ${ib} = ${prod}. ` +
    `Đề có tổng cộng hai chữ số thập phân, một ở ${a} và một ở ${b}, nên lùi dấu phẩy hai chỗ: ${ans}.`,
  dtPlacesShort: () => "Chỉ lùi một chữ số thập phân. Mỗi số có một chữ số, tổng cộng là hai.",
  dtPlacesOver: () => "Lùi tới ba chữ số thập phân. Đếm trong đề: mỗi số một chữ số, tổng cộng hai.",
  dSolMulFrac: (a, num, den, b, share, ans) =>
    `${a} chính là ${num}/${den} trá hình, nên lấy ${num}/${den} của ${b}: ${b} ÷ ${den} = ${share}` + (num === 1 ? `.` : `, và ${share} × ${num} = ${ans}.`),
  dSolDiv: (a, d, scale, a2, d2, ans) =>
    `Làm cho số chia thành số nguyên trước: nhân cả hai số với ${scale}, đáp án không đổi. ` +
    `${a} ÷ ${d} thành ${a2} ÷ ${d2}, và ${a2} ÷ ${d2} = ${ans}.`,
  dtDividendNotScaled: (a, d2) => `Số chia đã được nhân lên thành ${d2} nhưng ${a} thì để nguyên. Làm gì với số này thì phải làm y hệt với số kia.`,

  /* ước lượng — tên đơn vị, đề bài, lời giải và bẫy */
  eUnits: {
    secMin:    { one: "phút",        many: "phút",        small: "giây" },
    minHour:   { one: "giờ",         many: "giờ",         small: "phút" },
    hourDay:   { one: "ngày",        many: "ngày",        small: "giờ" },
    dayWeek:   { one: "tuần",        many: "tuần",        small: "ngày" },
    monthYear: { one: "năm",          many: "năm",          small: "tháng" },
    gKg:       { one: "ki-lô-gam",   many: "ki-lô-gam",   small: "gam" },
    mKm:       { one: "ki-lô-mét",   many: "ki-lô-mét",   small: "mét" },
    mlLitre:   { one: "lít",         many: "lít",         small: "mi-li-lít" },
    cmM:       { one: "mét",         many: "mét",         small: "xăng-ti-mét" },
    mmCm:      { one: "xăng-ti-mét", many: "xăng-ti-mét", small: "mi-li-mét" },
  },
  eBeats: "nhịp",
  eBreaths: "nhịp thở",
  eCups: "cốc",
  eWindows: "cửa sổ",
  eMessages: "tin nhắn",
  eSeats: "chỗ ngồi",
  eBooks: "cuốn sách",

  eAskUnits: (small, n, many) => `Có bao nhiêu ${small} trong ${n} ${many}?`,
  eSolUnits: (one, per, small, n, ans) =>
    `Một ${one} là ${per} ${small}, nên ${n} ${one} là ${n} × ${per} = ${ans}.`,
  etOneUnitOnly: (one) => `Đó mới là một ${one}. Đề hỏi nhiều hơn thế.`,
  etAddedNotMultiplied: "Hai số này nhân với nhau chứ không cộng. Mỗi cái của thứ nhất kéo theo nguyên một bộ của thứ hai.",

  eAskHeartHour: (r) => `Tim đập ${r} nhịp một phút. Khoảng bao nhiêu nhịp trong một giờ?`,
  eSolHeartHour: (r, ans) => `Một giờ là 60 phút, mỗi phút tốn ${r} nhịp: 60 × ${r} = ${ans}.`,
  etOneMinuteOnly: "Đó mới là một phút. Một giờ có sáu mươi phút.",
  etOneSecondOnly: "Đó mới là một giây. Một giờ có ba nghìn sáu trăm giây.",
  etOneHourOnly: "Đó mới là một giờ đứng riêng. Đề hỏi khoảng thời gian dài hơn.",
  etOneDayOnly: "Đó mới là một ngày. Một năm còn 365 ngày như vậy.",
  etOneWeekOnly: "Đó mới là một tuần. Một năm có năm mươi hai tuần.",
  etForgotPerMinute: "Tốc độ đề cho là mỗi phút chứ không phải mỗi giờ, và mỗi giờ bạn đếm đều chứa sáu mươi phút.",

  eAskTap: (r, h) => `Một vòi nước chảy ${r} lít một phút. Bao nhiêu lít trong ${h} giờ?`,
  eSolTap: (r, perHour, h, ans) =>
    `Một giờ được 60 × ${r} = ${perHour} lít, và ${h} giờ được ${h} × ${perHour} = ${ans}.`,
  eAskRead: (w, h) => `Bạn đọc ${w} chữ một phút. Khoảng bao nhiêu chữ trong ${h} giờ?`,
  eSolRead: (w, perHour, h, ans) =>
    `Một giờ là 60 × ${w} = ${perHour} chữ, và ${h} giờ là ${h} × ${perHour} = ${ans}.`,
  eAskCar: (v, h) => `Một chiếc xe chạy ${v} ki-lô-mét một giờ. Trong ${h} giờ nó đi được bao xa?`,
  eSolCar: (v, h, ans) => `Quãng đường bằng tốc độ nhân thời gian: ${v} × ${h} = ${ans} ki-lô-mét.`,
  eAskMachine: (r, h) => `Một cái máy làm ${r} chi tiết một giờ. Một ca ${h} giờ thì làm được bao nhiêu?`,
  eSolMachine: (r, h, ans) => `Mỗi giờ trong ca thêm ${r}, nên ${r} × ${h} = ${ans}.`,
  eAskDrip: (r) => `Một vòi nước nhỏ ${r} giọt một giây. Khoảng bao nhiêu giọt trong một giờ?`,
  eSolDrip: (r, perMin, ans) =>
    `Một phút được 60 × ${r} = ${perMin} giọt, và một giờ là 60 phút như vậy: 60 × ${perMin} = ${ans}.`,

  eAskHeartYear: (r) => `Tim đập ${r} nhịp một phút. Khoảng bao nhiêu nhịp trong một năm?`,
  eAskBreathYear: (r) => `Bạn thở ${r} nhịp một phút. Khoảng bao nhiêu nhịp thở trong một năm?`,
  eSolPerYear: (r, perHour, perDay, ans, noun) =>
    `Leo từng bậc một thay vì với ngay tới đích. ` +
    `Một giờ là 60 × ${r} = ${perHour} ${noun}. Một ngày là 24 giờ: 24 × ${perHour} = ${perDay}. ` +
    `Một năm là 365 ngày: 365 × ${perDay} = ${ans}.`,
  etCountedDaysNotMinutes: "Bạn đã nhân với số ngày trong năm nhưng bỏ quên số phút trong mỗi ngày, mà mỗi ngày có 1440 phút.",
  eAskSleepYear: (h) => `Bạn ngủ ${h} tiếng một đêm. Một năm là khoảng bao nhiêu tiếng ngủ?`,
  eSolSleepYear: (h, ans) => `Một năm là 365 đêm, mỗi đêm tốn ${h} tiếng: 365 × ${h} = ${ans}.`,
  etAnsweredInMinutes: "Đó là đáp án tính theo phút. Đề hỏi theo giờ.",
  eAskLight: (n) =>
    `Ánh sáng đi 300 nghìn ki-lô-mét một giây. Trong ${n} phút nó đi được khoảng bao xa, tính theo nghìn ki-lô-mét?`,
  eSolLight: (n, secs, ans) =>
    `${n} phút là ${n} × 60 = ${secs} giây, và mỗi giây ánh sáng đi 300 nghìn ki-lô-mét: ` +
    `${secs} × 300 = ${ans}.`,
  etLightSeconds: "Đó là quãng đường ánh sáng đi trong bấy nhiêu giây. Đề cho phút, mà mỗi phút dài sáu mươi giây.",
  etLightOneMinute: "Đó là quãng đường của đúng một phút. Đề hỏi nhiều phút, nên còn phải nhân lên.",
  eAskRiver: (v) => `Một con sông đưa ${v} mét khối nước qua một điểm mỗi giây. Một ngày qua đó khoảng bao nhiêu?`,
  eSolRiver: (v, perHour, ans) =>
    `Một giờ là 3600 giây: 3600 × ${v} = ${perHour}. Một ngày là 24 giờ: 24 × ${perHour} = ${ans} mét khối.`,
  etCountedMinutesNotSeconds: "Bạn đã đếm số phút trong một ngày thay vì số giây, mà mỗi phút chứa sáu mươi giây.",

  eAskCups: (n, c) => `Một trường có ${n} học sinh, mỗi em uống ${c} cốc nước một ngày. Một ngày khoảng bao nhiêu cốc?`,
  eAskWindows: (n, w) => `Một con phố có ${n} ngôi nhà, mỗi nhà khoảng ${w} cửa sổ. Cả phố khoảng bao nhiêu cửa sổ?`,
  eAskMessages: (n, m) => `Một nhóm ${n} người, mỗi người gửi khoảng ${m} tin nhắn một ngày. Một ngày tổng cộng khoảng bao nhiêu tin nhắn?`,
  eAskBus: (b, s) => `Một bến xe có ${b} xe buýt, mỗi xe ${s} chỗ ngồi. Tổng cộng bao nhiêu chỗ?`,
  eAskShelves: (s, b) => `Một thư viện có ${s} kệ sách, mỗi kệ khoảng ${b} cuốn. Khoảng bao nhiêu cuốn sách?`,
  eSubjects: {
    students: { one: "học sinh", many: "học sinh" },
    houses:   { one: "ngôi nhà", many: "ngôi nhà" },
    people:   { one: "người",   many: "người" },
    buses:    { one: "xe buýt",  many: "xe buýt" },
    shelves:  { one: "kệ sách", many: "kệ sách" },
  },
  eSolTwoFactor: (a, subj, b, ans, noun) =>
    `Có ${a} ${subj.many}, và mỗi ${subj.one} ứng với ${b} ${noun}. ` +
    `Vậy hai số nhân với nhau: ${a} × ${b} = ${ans}.`,
  etOnePerPerson: (subj, noun) =>
    `Đó mới là số ${subj.many}. Mỗi ${subj.one} ứng với nhiều ${noun}, nên đáp án phải lớn hơn thế.`,

  eAskTuners: (S, P, shops, A) =>
    `Một thợ chỉnh đàn lo được ${S} cây dương cầm mỗi năm. Một thành phố ${P} nghìn dân có ${shops} cửa hàng nhạc cụ, ` +
    `và khoảng 1 người trong ${A} người sở hữu một cây đàn. Thành phố có đủ việc cho khoảng bao nhiêu thợ chỉnh đàn?`,
  eSolTuners: (P, people, A, pianos, S, ans) =>
    `Đi từng bước một. ${P} nghìn dân là ${P} × 1000 = ${people}. ` +
    `Cứ ${A} người có một cây đàn thì được ${people} ÷ ${A} = ${pianos} cây. ` +
    `Một thợ lo ${S} cây một năm, nên ${pianos} ÷ ${S} = ${ans} thợ.`,
  etTunersPianos: "Đó là số cây đàn trong thành phố, không phải số thợ. Một người thợ lo hàng trăm cây.",
  etTunersPeople: "Đó là toàn bộ dân số. Chỉ một phần nhỏ trong đó có đàn dương cầm.",

  etFuelDistance: "Đó là quãng đường cả thị trấn chạy, không phải lượng nhiên liệu. Số ki-lô-mét đó còn phải đổi ra lít.",
  etFuelPerHundred: "Mức tiêu hao là cho mỗi 100 ki-lô-mét chứ không phải mỗi ki-lô-mét, nên đáp án này lớn gấp một trăm lần.",

  eSolCoffee: (n, h, perDay, d, ans) =>
    `Một ngày là ${n} × ${h} = ${perDay} cốc, và một tuần là ${d} ngày như vậy: ${perDay} × ${d} = ${ans}.`,
  etCoffeeOneDay: "Đó mới là một ngày. Đề hỏi cả tuần.",
  etCoffeeNoHours: "Bạn đã nhân số ngày vào nhưng bỏ quên số giờ mở cửa, mà mỗi ngày dài mấy tiếng.",

  eSolTiles: (w, l, area, per, ans) =>
    `Sàn rộng ${w} × ${l} = ${area} mét vuông, mỗi mét vuông cần ${per} viên: ${area} × ${per} = ${ans}.`,
  etTilesArea: "Đó là diện tích sàn tính theo mét vuông, không phải số viên gạch nằm trên đó.",
  etTilesPerimeter: "Đó là chu vi quanh mép phòng. Sàn được phủ bằng diện tích chứ không phải bằng đường viền.",

  eSolEggs: (P, e, perWeek, ans) =>
    `Một tuần tốn ${P} × ${e} = ${perWeek} triệu quả, và một năm là 52 tuần: ${perWeek} × 52 = ${ans} triệu.`,
  etEggsWeek: "Đó mới là một tuần. Một năm có năm mươi hai tuần.",
  etEggsDays: "Bạn đã nhân với số ngày trong năm, nhưng mức đề cho là mỗi tuần.",

  eSolWater: (P, l, litres, ans) =>
    `Thành phố dùng ${P} × 1000 × ${l} = ${litres} lít. Một mét khối là 1000 lít, ` +
    `nên ${litres} ÷ 1000 = ${ans} mét khối. Hai con số nghìn triệt tiêu nhau, nên đáp án đơn giản là ${P} nhân ${l}.`,
  etWaterLitres: "Đó là đáp án tính theo lít. Đề hỏi mét khối, mà mỗi mét khối chứa một nghìn lít.",
  etWaterPeople: "Đó là số người sống ở đó, chưa nói gì tới lượng nước mỗi người dùng.",

  etFlightsSeats: "Đó là toàn bộ số ghế có sẵn. Máy bay không bay đầy, và đó chính là lý do đề cho phần trăm.",
  etFlightsOneFlight: "Đó mới là một chuyến. Hãng bay chạy rất nhiều chuyến mỗi ngày, và đề hỏi cả một tuần như vậy.",

  eSolBarbers: (P, people, w, cuts, c, d, perBarber, ans) =>
    `${P} nghìn dân là ${P} × 1000 = ${people}, mỗi người cắt ${w} tuần một lần, ` +
    `nên một tuần có ${people} ÷ ${w} = ${cuts} lượt cắt. ` +
    `Một thợ làm được ${c} × ${d} = ${perBarber} lượt một tuần, nên thị trấn cần ${cuts} ÷ ${perBarber} = ${ans}.`,
  etBarbersCuts: "Đó là số lượt cắt tóc thị trấn cần mỗi tuần, không phải số thợ để cắt hết chúng.",
  etBarbersOneBarber: "Đó mới là một tuần của một người thợ. Thị trấn cần khá nhiều thợ.",

  eNoise: {
    shops: "số cửa hàng nhạc cụ", people: "dân số", tables: "số bàn", ceiling: "chiều cao trần",
    farms: "số trang trại", reservoirs: "số hồ chứa", staff: "số nhân viên", barbershops: "số tiệm cắt tóc",
    weight: "cân nặng của một thùng",
  },
  eIgnored: (noun) => `${noun.charAt(0).toUpperCase() + noun.slice(1)} không hề tham gia vào phép tính. Đề có thể đưa cho bạn một con số không cần dùng, và quyết định bỏ cái gì ra cũng là một phần của bài toán.`,

  eAskPacking: (a, b, c, x, y, z, kg) =>
    `Một thùng container dài ${a} mét, rộng ${b} mét, cao ${c} mét. Một chiếc hộp có kích thước ` +
    `${x} × ${y} × ${z} xăng-ti-mét và nặng ${kg} ki-lô-gam khi đầy. Bỏ qua cân nặng và phần khoảng trống ` +
    `giữa các hộp, xếp được khoảng bao nhiêu hộp vào container?`,
  eSolPacking: (a, b, c, holdM, x, y, z, boxCm, holdCm, ans) =>
    `Thể tích chia thể tích, nhưng hai bên khác đơn vị, và đó chính là chỗ hay hỏng. ` +
    `Container là ${a} × ${b} × ${c} = ${holdM} mét khối. Hộp là ${x} × ${y} × ${z} = ${boxCm} xăng-ti-mét khối. ` +
    `Một mét là 100 xăng-ti-mét, nên một mét khối là 100 × 100 × 100 = 1000000 xăng-ti-mét khối, ` +
    `tức container bằng ${holdM} × 1000000 = ${holdCm} xăng-ti-mét khối. Rồi ${holdCm} ÷ ${boxCm} = ${ans}.`,
  etPackingThousand: "Một mét khối không phải một nghìn xăng-ti-mét khối. Lập phương mét thì lập phương luôn cả trăm, nên nó là một triệu.",
  etPackingOneEdge: "Đó là so một cạnh với một cạnh. Một chiếc hộp chiếm chỗ theo cả ba chiều cùng lúc, nên phải nhân cả ba vào.",

  eAskFuel: (pop, N, L, K) =>
    `Một thị trấn ${pop} nghìn dân sở hữu ${N} xe hơi. Một chiếc xe tốn ${L} lít nhiên liệu cho mỗi 100 ki-lô-mét, ` +
    `và chạy khoảng ${K} ki-lô-mét một tháng. Một năm cả thị trấn đốt khoảng bao nhiêu lít?`,
  eSolFuel: (K, year, N, km, L, ans) =>
    `Mức đề cho là theo tháng còn câu hỏi là theo năm, nên bắt đầu từ đó: ${K} × 12 = ${year} ki-lô-mét một xe. ` +
    `Tất cả xe cộng lại chạy ${N} × ${year} = ${km} ki-lô-mét. Cứ 100 ki-lô-mét tốn ${L} lít, ` +
    `nên ${km} ÷ 100 × ${L} = ${ans} lít.`,
  etFuelMonth: "Đó mới là một tháng. Đề hỏi cả năm, và không câu nào trong đề nhân 12 sẵn cho bạn.",

  eAskCoffee: (tables, n, h, d) =>
    `Một quán cà phê có ${tables} cái bàn. Quán bán khoảng ${n} cốc một giờ, mở ${h} tiếng một ngày và bán ` +
    `${d} ngày một tuần. Một tuần khoảng bao nhiêu cốc?`,

  eAskTiles: (w, l, high, per) =>
    `Một căn phòng rộng ${w} mét, dài ${l} mét và cao ${high} mét, và ${per} viên gạch phủ kín một mét vuông. ` +
    `Sàn phòng cần khoảng bao nhiêu viên?`,

  eAskEggs: (P, farms, e) =>
    `Một nước có ${P} triệu dân và ${farms} nghìn trang trại trứng, mỗi người ăn khoảng ${e} quả trứng một tuần. ` +
    `Một năm khoảng bao nhiêu triệu quả trứng?`,

  eAskWater: (P, res, l) =>
    `Một thành phố ${P} nghìn dân lấy nước từ ${res} hồ chứa, mỗi người dùng khoảng ${l} lít nước một ngày. ` +
    `Một ngày khoảng bao nhiêu mét khối? Một mét khối là 1000 lít.`,

  eAskFlights: (F, staff, s, pct) =>
    `Một hãng bay có ${F} chuyến một ngày và ${staff} nghìn nhân viên. Mỗi máy bay có ${s} chỗ ` +
    `và bay đầy khoảng ${pct}%. Một tuần hãng chở khoảng bao nhiêu hành khách?`,
  eSolFlights: (s, pct, perFlight, F, perDay, ans) =>
    `Một máy bay đầy là ${s} khách, và ${pct}% của nó là ${s} × ${pct} ÷ 100 = ${perFlight}. ` +
    `Một ngày là ${F} × ${perFlight} = ${perDay}. Đề hỏi cả tuần, mà không câu nào trong đề đếm sẵn cho bạn: ` +
    `${perDay} × 7 = ${ans}.`,
  etFlightsOneDay: "Đó mới là một ngày. Đề hỏi cả tuần, và con số 7 là bạn phải tự nhớ.",

  eAskBarbers: (c, d, P, shops, w) =>
    `Một thợ cắt cho ${c} khách một ngày và làm ${d} ngày một tuần. Một thị trấn ${P} nghìn dân có ${shops} ` +
    `tiệm cắt tóc, và mỗi người cần cắt tóc ${w} tuần một lần. Thị trấn cần khoảng bao nhiêu thợ cắt tóc?`,

  /* probability — event names, reused across prompts */
  pEvents: {
    die6: "mặt 6 khi tung một xúc xắc công bằng",
    coinH: "mặt ngửa khi tung một đồng xu công bằng",
    dieOver4: "số lớn hơn 4 khi tung xúc xắc",
    heart: "quân Cơ khi rút một lá từ bộ bài đầy đủ",
    dieEven: "số chẵn khi tung xúc xắc",
    dieUnder3: "số nhỏ hơn 3 khi tung xúc xắc",
    dieNot6: "một mặt khác 6 khi tung xúc xắc",
    redCard: "một lá bài đỏ khi rút một lá từ bộ bài đầy đủ",
    aceCard: "quân Át khi rút một lá từ bộ bài đầy đủ",
    faceCard: "quân hình (J, Q hoặc K) khi rút một lá từ bộ bài đầy đủ",
    twoHeads: "hai mặt ngửa khi tung hai đồng xu công bằng",
  },
  pTrialNames: {
    die6: "mặt 6 trên xúc xắc", coinH: "mặt NGỬA trên đồng xu",
    die56: "mặt 5 hoặc 6 trên xúc xắc", heartRep: "quân Cơ, rút có hoàn lại",
  },
  pWaitNames: {
    die6: "mặt 6 khi tung xúc xắc", coinH: "mặt ngửa khi tung xu",
    die56: "mặt 5 hoặc 6 khi tung xúc xắc", heartRep: "quân Cơ khi rút bài có hoàn lại",
    ace13: "quân Át khi rút bài có hoàn lại",
    redRep: "một lá bài đỏ khi rút bài có hoàn lại",
    dieUnder3: "số nhỏ hơn 3 khi tung xúc xắc",
    sumSeven: "tổng bằng 7 khi tung hai xúc xắc",
    sumTen: "tổng bằng 10 khi tung hai xúc xắc",
    doubleSix: "hai mặt 6 cùng lúc khi tung hai xúc xắc",
  },
  pShortNames: { die6: "mặt 6", coinH: "mặt ngửa", die56: "mặt 5 hoặc 6" },
  pActions: { die: "Tung một xúc xắc công bằng", coin: "Tung một đồng xu công bằng", card: "Rút một lá bài có hoàn lại" },
  pAtLeast: {
    six: "ít nhất một mặt 6", head: "ít nhất một mặt ngửa", heart: "ít nhất một quân Cơ",
    ace: "ít nhất một quân Át", oneTwo: "ít nhất một mặt 1 hoặc 2",
  },
  pMissNames: { six: "mặt 6", head: "mặt ngửa", heart: "quân Cơ", ace: "quân Át", oneTwo: "mặt 1 hoặc 2" },
  pEvNames: {
    oneDie: "số trên một xúc xắc công bằng",
    sumTwo: "tổng hai xúc xắc công bằng",
    heads4: "số lần ngửa trong 4 lần tung một đồng xu công bằng",
    sixes12: "số lần ra mặt 6 trong 12 lần tung một xúc xắc công bằng",
    heads10: "số lần ngửa trong 10 lần tung một đồng xu công bằng",
    sixes6: "số lần ra mặt 6 trong 6 lần tung một xúc xắc công bằng",
    sumThree: "tổng của ba xúc xắc công bằng",
    cardRank: "quân số của một lá rút từ bộ bài đầy đủ, tính Át là 1 và K là 13",
    evens4: "số kết quả chẵn trong 4 lần tung một xúc xắc công bằng",
    coinPay: "một trò trả 10 nếu đồng xu công bằng ra ngửa và không trả gì nếu ra sấp",
    maxThree: "số lớn nhất trong ba xúc xắc công bằng",
    minThree: "số nhỏ nhất trong ba xúc xắc công bằng",
    absDiff: "khoảng cách giữa hai xúc xắc công bằng, không xét con nào lớn hơn",
    product: "tích hai xúc xắc công bằng",
    larger: "số lớn hơn trong hai xúc xắc công bằng",
    smaller: "số nhỏ hơn trong hai xúc xắc công bằng",
  },
  pFirstNames: { six: "ra mặt 6", head: "ra mặt ngửa", five6: "ra mặt 5 hoặc 6" },
  pCollect: {
    faces: "đủ cả 6 mặt của xúc xắc",
    suits: "đủ cả 4 chất, khi rút bài có hoàn lại",
    coin: "cả hai mặt của đồng xu",
    ranks: "đủ cả 13 quân số của bộ bài, khi rút có hoàn lại",
    weekdays: "đủ cả 7 ngày trong tuần, mỗi lần chọn ngẫu nhiên một ngày",
    vowels: "đủ cả 5 nguyên âm, mỗi lần chọn ngẫu nhiên một nguyên âm",
  },
  pPatterns: { HT: "ngửa rồi sấp", TH: "sấp rồi ngửa", HH: "hai mặt ngửa liên tiếp", TT: "hai mặt sấp liên tiếp" },
  pCards: { suit: "cùng chất", rank: "một đôi, tức cùng số", red: "cả hai đều đỏ" },
  pUnit: { band: "|X − Y| < ½", sum: "X + Y < 1", twice: "X > 2Y" },

  /* probability — prompts */
  pAskChance: (ev) => `Xác suất ra ${ev} là bao nhiêu?`,
  pAskDiceSum: (s) => `Tung hai xúc xắc công bằng. Xác suất tổng bằng ${s}?`,
  pAskAtLeast: (action, n, ev) => `${action} ${n} lần. Xác suất được ${ev}?`,
  pAskEV: (name) => `Kỳ vọng của ${name} là bao nhiêu?`,
  pAskStock: (S, pct, n) =>
    `Một cổ phiếu đang ở giá ${S}. Mỗi ngày nó tăng ${pct}% hoặc giảm ${pct}% với khả năng như nhau. Kỳ vọng giá sau ${n} ngày?`,
  pAskAces: (n) => `Kỳ vọng số quân Át trong một tay ${n} lá chia từ bộ bài đầy đủ là bao nhiêu?`,
  pAskReroll: (k) =>
    `Tung một xúc xắc và bạn được trả tiền đúng bằng mặt hiện ra. Bạn được tung lại tối đa ${k === 1 ? "một lần" : k + " lần"}, ` +
    `bỏ kết quả cũ đi. Chơi tối ưu thì kỳ vọng nhận được là bao nhiêu?`,
  pChildStem: (n) => `Một gia đình có ${n} con, khả năng trai và gái như nhau. `,
  pSexWord: (boys) => (boys ? "trai" : "gái"),
  pAskChildren: (eldest, boys, n) =>
    `${eldest ? `Con lớn${n === 2 ? "" : " nhất"} là con ${boys ? "trai" : "gái"}` : `Có ít nhất một con ${boys ? "trai" : "gái"}`}. ` +
    `Xác suất ${n === 2 ? "cả hai đều là" : `cả ${n} đều là`} con ${boys ? "trai" : "gái"}?`,
  pCondEldest: (boys, n) => `Biết con lớn${n === 2 ? "" : " nhất"} là con ${boys ? "trai" : "gái"} thì chỉ`,
  pCondLeast: (boys) => `"Có ít nhất một con ${boys ? "trai" : "gái"}" chỉ`,
  pAskCondDice: (s, k) => `Tung hai xúc xắc công bằng và biết tổng bằng ${s}. Xác suất có ít nhất một con ra mặt ${k}?`,
  pAskUrnTwo: (r, b) => `Một rổ có ${r} bóng đỏ và ${b} bóng xanh. Bạn rút 2 bóng không hoàn lại. Xác suất cả hai đều đỏ?`,
  pAskThreeCoins: (set, target) =>
    `Ba đồng xu có P(ngửa) lần lượt là ${set}. Bạn chọn ngẫu nhiên một đồng và tung ra mặt ngửa. Xác suất đó là đồng có P(ngửa) = ${target}?`,
  pAskUrns: (ab, ar, bb, br) =>
    `Rổ A có ${ab} bóng xanh và ${ar} bóng đỏ. Rổ B có ${bb} bóng xanh và ${br} bóng đỏ. ` +
    `Bạn chọn ngẫu nhiên một rổ và rút ra một bóng đỏ. Xác suất đó là rổ B?`,
  pAskBox: (n, wantFair) =>
    `Một hộp có 3 đồng xu: một đồng công bằng, một đồng hai mặt ngửa, một đồng hai mặt sấp. Bạn chọn ngẫu nhiên một đồng và tung ` +
    `${n === 1 ? "một lần: ra ngửa" : n + " lần: đều ra ngửa"}. ` +
    `Xác suất đó là ${wantFair ? "đồng công bằng" : "đồng hai mặt ngửa"}?`,
  pAskWaitFirst: (ev) => `Trung bình cần bao nhiêu lần thử để lần đầu ra ${ev}?`,
  pAskWaitK: (ev, k, action) =>
    `Trung bình cần bao nhiêu lần thử để ${ev} xuất hiện ${k === 2 ? "hai lần" : k + " lần"}, không cần liên tiếp, khi ${action}?`,
  pAskPattern: (pat) => `Tung một đồng xu công bằng liên tục. Trung bình cần bao nhiêu lần tung để lần đầu thấy ${pat}?`,
  pAskCollect: (what) => `Trung bình cần bao nhiêu lần thử để thấy ${what} ít nhất một lần?`,
  pAskOrderMax: (n, ord) => `${n} giá trị độc lập phân phối đều trên [0;1] được lấy ra lần lượt. Xác suất giá trị ${ord} là lớn nhất?`,
  pAskOrderMono: (n, dir) => `${n} lần lấy độc lập từ một phân phối liên tục. Xác suất chúng ra theo thứ tự ${dir} đúng như thứ tự lấy?`,
  pAskPickRepeat: (k, N) => `Chọn ${k} số từ 1–${N}, mỗi lần chọn độc lập nên có thể trùng, theo thứ tự. Xác suất chúng tăng ngặt?`,
  pAskPickDistinct: (k, N) => `Chọn ${k} số khác nhau từ 1–${N}, rồi lật ra theo thứ tự ngẫu nhiên. Xác suất chúng ra theo thứ tự tăng ngặt?`,
  pAskMonty: (sw, n) =>
    `${n} cánh cửa giấu một chiếc xe và ${n - 1} con dê. Bạn chọn một cửa. Người dẫn, vốn biết xe ở đâu, ` +
    (n === 3 ? `mở một cửa khác lộ ra con dê. ` : `mở ${n - 2} cửa trong số các cửa còn lại, cửa nào cũng lộ ra một con dê. `) +
    `Xác suất bạn thắng chiếc xe nếu bạn ` +
    `${sw ? "đổi sang cửa còn lại" : "giữ cửa đã chọn ban đầu"}?`,
  pAskRuin: (i, j) =>
    `A cầm ${i} đồng và B cầm ${j} đồng. Họ chơi một trò công bằng; mỗi ván người thua đưa người thắng một đồng, ` +
    `cho tới khi một người hết sạch. Xác suất A ăn hết tất cả?`,
  pAskFirst: (ev) => `A và B thay phiên nhau, ai ${ev} trước thì thắng. A đi trước. Xác suất A thắng?`,
  pAskDerange: (n, none) =>
    `${n} lá thư được bỏ ngẫu nhiên vào ${n} phong bì đã ghi sẵn tên. Xác suất ` +
    `${none ? "không lá nào" : "có ít nhất một lá"} vào đúng phong bì?`,
  pAskWalk: (steps) =>
    `Một người đi trên trục số, mỗi bước tiến 1 hoặc lùi 1 với xác suất ½. ` +
    `Xác suất anh ta đứng đúng điểm xuất phát sau ${steps} bước?`,
  pAskCards: (what) => `Rút 2 lá từ bộ bài 52 lá, không hoàn lại. Xác suất hai lá ${what}?`,
  pAskUnit: (cond) => `X và Y độc lập, phân phối đều trên [0;1]. Xác suất ${cond}?`,
  pGerunds: { die: "tung xúc xắc", coin: "tung xu" },
  pBoxOneHead: "một mặt ngửa",
  pBoxManyHeads: (n) => `${n} mặt ngửa liên tiếp`,
  pAskOrderEnds: (n) => `${n} lần lấy độc lập từ một phân phối liên tục. Xác suất số lấy đầu tiên là lớn nhất và số lấy cuối cùng là nhỏ nhất?`,
  pAskOrderEither: (n) => `${n} lần lấy độc lập từ một phân phối liên tục. Xác suất chúng ra theo thứ tự tăng ngặt hoặc giảm ngặt?`,
  pStrictUp: "tăng ngặt", pStrictDown: "giảm ngặt",
  pOrdinals: ["thứ 1", "thứ 2", "thứ 3", "thứ 4", "thứ 5"],

  /* probability — worked solutions */
  pSolChance: {
    die6: "Xúc xắc có 6 mặt đồng khả năng, trong đó 1 mặt là số 6, nên 1 trên 6.",
    coinH: "Hai mặt, khả năng như nhau, một mặt là ngửa: 1 trên 2.",
    dieOver4: "Có hai mặt lớn hơn 4, là 5 và 6, nên 2 trên 6, tức 1/3.",
    heart: "Bộ bài có 13 quân Cơ trong 52 lá: 13 trên 52, tức 1/4.",
    dieEven: "Các mặt chẵn là 2, 4 và 6: 3 trên 6, tức 1/2.",
    dieUnder3: "Các mặt nhỏ hơn 3 là 1 và 2: 2 trên 6, tức 1/3.",
    dieNot6: "Năm trong sáu mặt không phải là 6, nên 5 trên 6. Đếm phần mình không muốn rồi lấy 1 trừ đi cũng ra như vậy.",
    redCard: "Một nửa bộ bài màu đỏ, 13 quân Cơ và 13 quân Rô: 26 trên 52, tức 1/2.",
    aceCard: "Có 4 quân Át trong 52 lá, mỗi chất một quân: 4 trên 52, tức 1/13.",
    faceCard: "Mỗi chất có một quân J, một quân Q và một quân K, nên 4 × 3 = 12 quân hình trong 52 lá: 12/52, tức 3/13.",
    twoHeads: "Hai đồng xu cho 4 kết quả đồng khả năng: NN, NS, SN, SS. Chỉ một kết quả là hai mặt ngửa, nên 1 trên 4.",
  },
  pSolDiceSum: (s, pairs, ways, reduced) =>
    `Hai xúc xắc cho 6 × 6 = 36 kết quả đồng khả năng, coi hai con là khác nhau. ` +
    `Những kết quả có tổng bằng ${s} là ${pairs} — được ${ways} cái. Vậy ${ways}/36` +
    (reduced ? `, tức ${reduced}.` : "."),
  pSolAtLeast: (n, missOne, missAll, ans) =>
    `Hãy đi đường vòng và tính xác suất trượt hết mọi lần. ` +
    `Một lần trượt với xác suất ${missOne}, nên ${n} lần trượt hết có xác suất (${missOne})^${n} ≈ ${missAll}. ` +
    `Mọi trường hợp còn lại đều là "ít nhất một", nên 1 − ${missAll} ≈ ${ans}.`,
  pSolEV: {
    oneDie: "Cộng các mặt lại rồi chia đều: (1+2+3+4+5+6)/6 = 21/6 = 3,5. Không mặt nào là 3,5, và điều đó bình thường — trung bình không nhất thiết phải là một kết quả có thể xảy ra.",
    sumTwo: "Mỗi xúc xắc tự nó trung bình 3,5, và các trung bình cộng thẳng vào nhau: 3,5 + 3,5 = 7.",
    heads4: "Mỗi lần tung góp trung bình nửa mặt ngửa, và các trung bình cộng lại: 4 × ½ = 2.",
    sixes12: "Mỗi lần tung góp trung bình 1/6 mặt sáu, và các trung bình cộng lại: 12 × 1/6 = 2.",
    heads10: "Mỗi lần tung góp trung bình nửa mặt ngửa, và các trung bình cộng lại: 10 × ½ = 5.",
    sixes6: "Mỗi lần tung góp trung bình 1/6 mặt sáu, và các trung bình cộng lại: 6 × 1/6 = 1. Sáu lần tung mới đổi được trung bình một mặt 6, nên mặt 6 vẫn thấy hiếm.",
    sumThree: "Mỗi xúc xắc tự nó trung bình 3,5, và các trung bình chỉ việc cộng lại: 3,5 + 3,5 + 3,5 = 10,5.",
    cardRank: "Cả 13 quân số đều đồng khả năng, vì mỗi quân số xuất hiện một lần trong mỗi chất. Vậy đây là điểm giữa của 1 đến 13: (1 + 13)/2 = 7.",
    evens4: "Một nửa số mặt là chẵn, nên mỗi lần tung góp trung bình nửa kết quả chẵn: 4 × ½ = 2.",
    coinPay: "Cân mỗi kết quả theo mức độ thường xuyên của nó. Một nửa số lần bạn nhận 10, phần này trung bình đáng 10/2 = 5, và một nửa số lần bạn không nhận gì, đáng 0. Cộng lại được 5 + 0 = 5. Để ý là 5 không bao giờ thật sự được trả: trung bình không phải một kết quả.",
    maxThree: "Đếm xem số lớn nhất bằng đúng k bao nhiêu lần. Cả ba con đều ở mức k trở xuống trong k × k × k trên 216 kết quả, và ở mức k − 1 trở xuống trong (k − 1)^3 kết quả, nên số lớn nhất bằng đúng k trong phần hiệu: 1, 7, 19, 37, 61, 91 với k chạy từ 1 đến 6. Cân mỗi k theo số lần của nó được (1 × 1 + 2 × 7 + 3 × 19 + 4 × 37 + 5 × 61 + 6 × 91)/216 = 1071/216, khoảng 4,96.",
    minThree: "Đổi tên mọi mặt v thành 7 − v. Một xúc xắc công bằng không đổi gì sau phép tráo đó, và nó biến số nhỏ nhất thành số lớn nhất. Vậy trung bình của số nhỏ nhất bằng 7 trừ trung bình của số lớn nhất: 7 − 1071/216 = 441/216, khoảng 2,04.",
    absDiff: "Đi qua 36 kết quả và đếm khoảng cách: 6 kết quả cho khoảng cách 0, 10 cho 1, 8 cho 2, 6 cho 3, 4 cho 4, và 2 cho 5. Cân mỗi khoảng cách theo mức độ thường xuyên của nó được (0 × 6 + 1 × 10 + 2 × 8 + 3 × 6 + 4 × 4 + 5 × 2)/36 = 70/36, khoảng 1,94.",
    product: "Hai xúc xắc không ảnh hưởng nhau, nên được phép nhân hai trung bình: 3,5 × 3,5 = 12,25.",
    larger: "Xét từng mặt k có thể là mặt lớn hơn và đếm xem nó thắng bao nhiêu lần: k là số lớn hơn trong 2k−1 trên 36 kết quả. Cộng hết lại được 161/36, khoảng 4,47.",
    smaller: "Số lớn hơn và số nhỏ hơn luôn cộng lại bằng tổng, nên trung bình của chúng cũng vậy: 7 − 161/36 = 91/36, khoảng 2,53.",
  },
  pSolStock: (up, down, n, S) =>
    `Mỗi ngày nhân giá với ${up} hoặc ${down}, hai khả năng như nhau, nên trung bình nó nhân với (${up} + ${down})/2 = 1. ` +
    `Nhân với 1 thì không đổi gì, và ${n} ngày như vậy cũng vẫn không đổi: đáp án vẫn là ${S}.`,
  pSolReroll1: "Nếu tung lại, bạn nhận một xúc xắc bình thường, trung bình đáng 3,5. Vậy giữ lại mọi mặt trên 3,5, tức 4, 5 và 6, còn 1, 2, 3 thì tung lại. Được (4 + 5 + 6)/6 cho phần giữ, cộng 3/6 × 3,5 cho phần tung lại: 2,5 + 1,75 = 4,25.",
  pSolReroll2: "Làm ngược từ cuối. Còn một lần tung lại thì ván đáng 4,25, đúng như trường hợp trên. Vậy ở lần tung đầu, giữ mọi mặt trên 4,25, tức 5 và 6, còn lại tung lại: (5 + 6)/6 + 4/6 × 4,25 = 11/6 + 17/6 = 14/3, khoảng 4,67.",
  pSolChildren: (all, cond, kept, keptCount, target) =>
    `Liệt kê mọi gia đình, con lớn nhất trước: ${all}. ${cond} còn lại ${kept} — ${keptCount} cái, đồng khả năng. ` +
    `Đúng một cái là ${target}, nên đáp án là 1/${keptCount}.`,
  pSolAces: (n, ans) =>
    `Nhìn từng lá một. Một lá bất kỳ là quân Át 4 lần trong 52, tức 1/13, và điều đó vẫn đúng với lá thứ hai ` +
    `và lá thứ ba dù những lá trước đó là gì. Các lần rút không độc lập, nhưng trung bình vẫn cứ cộng lại được ` +
    `— đó mới là mẹo. Vậy ${n} × 1/13 = ${ans}.`,
  pSolReroll3: "Lại làm ngược từ cuối. Khi còn hai lần tung lại phía trước thì trò chơi đáng 14/3, khoảng 4,67, theo trường hợp trên. Vậy ở lần tung đầu hãy giữ mọi mặt cao hơn con số đó, tức 5 hoặc 6, và tung lại bốn mặt còn lại: (5 + 6)/6 + 4/6 × 14/3 = 11/6 + 56/18 = 89/18, khoảng 4,94.",
  pSolCondDice: (pairs, total, hits, k, ans) =>
    `Biết tổng thì mọi kết quả khác đều bị loại, chỉ còn: ${pairs} — được ${total} cái. ` +
    `Mặt ${k} xuất hiện ${hits === 1 ? `đúng trong 1 cái, vì khi đó cả hai con đều phải ra ${k}` : `đúng trong 2 cái, mỗi con một lần`}. ` +
    `Vậy ${hits}/${total} = ${ans}.`,
  pSolUrnTwo: (r, N, ans) =>
    `Lần rút đầu ra đỏ với xác suất ${r}/${N}. Nếu đúng vậy thì rổ giờ còn ${r - 1} bóng đỏ trong ${N - 1} bóng, ` +
    `nên lần thứ hai ra đỏ với xác suất ${r - 1}/${N - 1}. Nhân lại: ${r}/${N} × ${r - 1}/${N - 1} = ${ans}.`,
  pSolThreeCoins: (list, target, sum, total, ans) =>
    `Hỏi xem mỗi đồng xu tạo ra mặt ngửa bạn vừa thấy dễ dàng tới đâu: ${list}. ` +
    `Cả ba đều có cơ hội được chọn như nhau, nên phần đó tác động lên cả ba giống hệt và triệt tiêu. ` +
    `Còn lại là phần của đồng này trên tổng: ${target} ÷ (${sum}) = ${target} ÷ ${total} = ${ans}.`,
  pSolUrns: (ar, aTot, br, bTot, rA, rB, ans) =>
    `Hỏi xem mỗi rổ nhả ra bóng đỏ dễ dàng tới đâu: rổ A nhả ${ar}/${aTot} số lần, rổ B nhả ${br}/${bTot} số lần. ` +
    `Hai rổ đều có cơ hội được chọn như nhau nên phần đó triệt tiêu, và đáp án cho rổ B là phần của nó trên hai cái: ` +
    `${rB} ÷ (${rA} + ${rB}) = ${ans}.`,
  pSolBox: (flips, fair, ans) =>
    `Hỏi xem mỗi đồng xu cho ra ${flips} dễ dàng tới đâu. Đồng công bằng: ${fair}. Đồng hai mặt ngửa: 1, lần nào cũng được. ` +
    `Đồng hai mặt sấp: 0, không bao giờ, nên loại. Lấy phần của đồng công bằng trên phần còn lại: ${fair} ÷ (${fair} + 1) = ${ans}.`,
  pSolBoxHeads: (flips, fair, ans) =>
    `Hỏi xem mỗi đồng xu cho ra ${flips} dễ dàng tới đâu. Đồng công bằng: ${fair}. Đồng hai mặt ngửa: 1, lần nào cũng được. ` +
    `Đồng hai mặt sấp: 0, không bao giờ, nên loại. Lấy phần của đồng hai mặt ngửa trên phần còn lại: ` +
    `1 ÷ (${fair} + 1) = ${ans}.`,
  pSolWaitFirst: (p, ans) => `Nó xảy ra ${p} số lần, nên trung bình cứ ${ans} lần thử mới gặp một lần. Lật ngược xác suất lại: 1 ÷ (${p}) = ${ans}.`,
  pSolWaitK: (one, k, ans) =>
    `Chờ cái đầu tiên tốn trung bình ${one} lần thử. Sau khi nó xuất hiện thì mọi thứ y như cũ, nên chờ cái tiếp theo lại tốn ${one} lần nữa. ` +
    `Những khoảng chờ kiểu này cộng thẳng vào nhau: ${k} × ${one} = ${ans}.`,
  pSolPattern: {
    HT: "Chờ trung bình 2 lần tung để có mặt ngửa đầu tiên. Rồi chờ thêm 2 lần nữa để có mặt sấp. Những mặt ngửa thừa ở giữa không tốn gì, vì mặt ngửa bạn cần đã nằm sẵn trong túi. Vậy 2 + 2 = 4.",
    TH: "Chờ trung bình 2 lần tung để có mặt sấp đầu tiên. Rồi chờ thêm 2 lần nữa để có mặt ngửa. Những mặt sấp thừa ở giữa không tốn gì, vì mặt sấp bạn cần đã nằm sẵn trong túi. Vậy 2 + 2 = 4.",
    HH: "Chờ 2 lần tung để có mặt ngửa đầu tiên. Rồi một nửa số lần, cú tung kế là ngửa và bạn xong; nửa còn lại nó là sấp và bạn quay về vạch xuất phát. Viết thành E = 2 + 1 + ½·E rồi giải ra E = 6.",
    TT: "Chờ 2 lần tung để có mặt sấp đầu tiên. Rồi một nửa số lần, cú tung kế là sấp và bạn xong; nửa còn lại nó là ngửa và bạn quay về vạch xuất phát. Viết thành E = 2 + 1 + ½·E rồi giải ra E = 6.",
  },
  pSolCollect: (n, terms, ans) =>
    `Cái đầu tiên là miễn phí, nó tới ngay lập tức. Khi bạn đã có j cái, một cái mới xuất hiện ${n}−j lần trên ${n}, ` +
    `nên bạn chờ ${n}/(${n}−j) lần thử cho nó. Cộng hết các khoảng chờ lại được ${n} × (${terms}) ≈ ${ans}. ` +
    `Cái cuối cùng mới là chỗ chậm: riêng nó đã tốn ${n} lần thử.`,
  pSolOrderMax: (n) =>
    `Các lần lấy không biết gì về nhau, nên không vị trí nào đặc biệt. ` +
    `Đúng một trong ${n} giá trị phải là lớn nhất, và cái nào cũng như cái nào, nên mỗi cái được 1/${n}.`,
  pSolOrderMono: (n, fact, dir) =>
    `Dù bạn nhận được ${n} số nào đi nữa, chúng có thể tới theo bất kỳ thứ tự nào, và mọi thứ tự đều dễ xảy ra như nhau. ` +
    `Có ${n}! = ${fact} thứ tự và đúng một cái là ${dir}, nên 1/${fact}.`,
  pSolPickRepeat: (N, k, total, c, ans) =>
    `Tổng cộng có ${N}^${k} = ${total} dãy đồng khả năng. Một dãy tăng cần ${k} giá trị khác nhau, và mỗi bộ ${k} giá trị khác nhau ` +
    `chỉ viết được theo thứ tự tăng đúng một cách. Số bộ như vậy là C(${N};${k}) = ${c}, tức số cách chọn ${k} thứ từ ${N} thứ. ` +
    `Vậy ${c}/${total} ≈ ${ans}.`,
  pSolPickDistinct: (k, fact, N) =>
    `Dù bạn nhận ${k} số nào, chúng có thể hiện ra theo ${k}! = ${fact} thứ tự, tất cả đồng khả năng, và một trong số đó là tăng dần. ` +
    `Vậy 1/${fact}. Để ý là cỡ của kho số, ${N}, không hề đi vào đáp án.`,
  pSolMontySwitch: (n) =>
    `Cửa bạn chọn đầu tiên đúng 1 lần trong ${n}. Còn ${n - 1} lần trong ${n}, chiếc xe nằm sau một trong ${n - 1} ` +
    `cửa bạn không chọn, và người dẫn vừa mở hết những cửa đó chỉ chừa lại một. Nên đổi cửa đưa xe cho bạn đúng vào ` +
    `những lần cửa đầu tiên bạn chọn sai, tức ${n - 1}/${n}.`,
  pSolMontyStay: (n) =>
    `Giữ nguyên thì thắng đúng vào những lần cửa đầu tiên bạn chọn đúng. Con số đó là 1 trên ${n} trước khi người dẫn ` +
    `mở gì cả, và anh ta thì kiểu gì cũng chỉ được cho bạn toàn dê dù bạn đã chọn cửa nào, nên việc anh ta mở cửa ` +
    `không nói lên điều gì về cửa của bạn: nó vẫn là 1 trên ${n}.`,
  pSolRuin: (i, N, ans) =>
    `Không ai có lợi thế trong một ván, nên tính trung bình không ai được hay mất, và cơ hội ăn hết của bạn đúng bằng phần tiền bạn đang cầm trên bàn: ` +
    `${i} trên ${N}, tức ${ans}. Tiền là lợi thế duy nhất trong trò này.`,
  pSolFirst: (p, both, ans) =>
    `Gọi cơ hội thắng của A là P. Có hai chuyện có thể xảy ra. A thành công ngay, xác suất ${p}. Hoặc A trượt và B cũng trượt, xác suất ${both}, ` +
    `rồi tới lượt A với mọi thứ y như cũ, nên cơ hội của A lại là P. Từ đó P = ${p} + ${both}·P, ` +
    `giải ra được P = ${ans}. Đi trước đáng giá hơn một nửa một chút.`,
  pSolDerange: (n, fact, D, none, asksNone, other) =>
    `Có ${n}! = ${fact} cách bỏ thư vào phong bì, tất cả đồng khả năng. Trong số đó, ÷ cách có mọi lá thư đều sai phong bì. ` +
    `Vậy xác suất không lá nào đúng là ${none}` +
    (asksNone ? "." : `, và xác suất có ít nhất một lá đúng là 1 − ${none} = ${other}.`),
  pSolWalk: (steps, n, c, total, ans) =>
    `Về được chỗ cũ sau ${steps} bước nghĩa là đúng ${n} bước tiến và ${n} bước lùi, theo thứ tự bất kỳ. ` +
    `Số thứ tự như vậy là C(${steps};${n}) = ${c}, tức số cách chọn ${n} bước nào trong ${steps} bước sẽ đi tới. ` +
    `Mỗi trong số 2^${steps} = ${total} đường đi đều đồng khả năng, nên ${c}/${total} = ${ans}.`,
  pSolCards: {
    suit: "Lá đầu tiên là lá gì cũng được, nên bỏ qua nó. Trong 51 lá còn lại, có 12 lá cùng chất với nó. Vậy 12/51, tức 4/17.",
    rank: "Lá đầu tiên là lá gì cũng được, nên bỏ qua nó. Trong 51 lá còn lại, có 3 lá cùng số với nó. Vậy 3/51, tức 1/17.",
    red: "Lá đầu tiên là đỏ 26 lần trên 52, tức 1/2. Rồi còn 25 lá đỏ trong 51 lá. Nhân lại: 1/2 × 25/51 = 25/102, khoảng 0,245.",
  },
  pSolUnit: {
    band: "Vẽ một hình vuông cạnh 1, X nằm ngang và Y thẳng đứng. Những điểm mà hai số lệch nhau dưới ½ tạo thành một dải chạy dọc giữa. Phần bị loại ra là hai tam giác ở góc, mỗi cái có hai cạnh góc vuông bằng ½ và diện tích 1/8. Vậy 1 − 2 × 1/8 = 3/4.",
    sum: "Vẽ một hình vuông cạnh 1. Đường X + Y = 1 chạy từ góc này sang góc kia, và phần nằm dưới nó là một tam giác chiếm đúng nửa hình vuông. Vậy 1/2.",
    twice: "Vẽ một hình vuông cạnh 1. Đường Y = X/2 đi qua góc và điểm giữa cạnh phải, và phần nằm dưới nó là tam giác đáy 1 cao ½, tức diện tích 1/4.",
  },

  /* probability — trap explanations */
  ptChance: {
    die6: ["Xúc xắc có sáu mặt chứ không phải ba.", "Xúc xắc không phải đồng xu."],
    coinH: ["Đó là hai mặt ngửa liên tiếp."],
    dieOver4: ["Có hai mặt thoả mãn là 5 và 6, không phải một.", "Lớn hơn 4 không giống lớn hơn 3."],
    heart: ["Đó là một quân số cụ thể, không phải một chất.", "Đó là một lá bài cụ thể."],
    dieEven: ["Ba mặt trong sáu mặt là số chẵn."],
    dieUnder3: ["Có hai mặt nhỏ hơn 3 là 1 và 2, không phải một.", "Nhỏ hơn 3 là hai mặt trong sáu mặt, không phải một nửa."],
    dieNot6: ["Đó là xác suất ra mặt 6, đúng cái mà câu hỏi loại ra. Hãy lấy 1 trừ đi."],
    redCard: ["Đó là một chất. Màu đỏ gồm hai chất, Cơ và Rô.", "Đó là một quân số, không phải một màu."],
    aceCard: ["Đó là nguyên một chất. Quân Át là một quân số, và chỉ có 4 quân.", "Đó là một lá cụ thể. Bất kỳ quân nào trong 4 quân Át đều tính."],
    faceCard: ["Đó là một quân số. J, Q và K cộng lại là ba quân số.", "Đó là ba lá cụ thể. Mỗi chất đều có J, Q và K riêng."],
    twoHeads: ["Đó là một đồng xu. Đồng thứ hai cũng phải ra ngửa.", "NS và SN là hai kết quả khác nhau chứ không phải một, nên có 4 chứ không phải 3."],
  },
  ptSumEleven: "Có 11 tổng khả dĩ nhưng chúng không đồng khả năng: tổng 7 ra nhiều hơn tổng 2 rất nhiều. Hãy đếm 36 cặp thay vì đếm tổng.",
  ptSumUnordered: "Mỗi cặp chỉ được đếm một lần, nhưng (2;5) và (5;2) thật sự là hai kết quả khác nhau, nên có 36 cái chứ không phải 21.",
  ptSumOnePair: "Đó là một cặp duy nhất. Có nhiều cặp khác nhau cùng cho tổng này.",
  ptMissAll: (ev) => `Đó là xác suất không bao giờ ra ${ev}. Bạn chỉ còn cách đáp án một phép trừ: lấy 1 trừ đi nó.`,
  ptAddedChances: "Không cộng thẳng các xác suất lại như vậy được. Cộng như thế là đếm lặp những lần nó xảy ra hai lần, và nếu thử đủ nhiều thì tổng sẽ vượt quá 1, điều không thể xảy ra.",
  ptOneTrialOnly: "Đó là một lần thử duy nhất. Đề hỏi trên toàn bộ các lần.",
  ptEV: {
    oneDie: ["Chính giữa của 1 tới 6 nằm giữa 3 và 4, nên trung bình là 3,5. Không có mặt nào ở chính giữa.", "Đó là mặt lớn nhất, không phải mặt trung bình."],
    sumTwo: ["Đó mới là một xúc xắc. Con kia vẫn còn đó, nên phải cộng cả trung bình của nó.", "Mặt hay ra nhất không giống với tổng trung bình."],
    heads4: ["Đó là số lần bạn tung, không phải số lần ra ngửa.", "Đó là phần của một lần tung. Có tới bốn lần tung."],
    sixes12: ["Đó là số lần bạn tung, không phải số lần ra mặt 6.", "Đó là một con số trên xúc xắc, không phải số đếm gì cả."],
    heads10: ["Đó là số lần bạn tung, không phải số lần ra ngửa.", "Đó là phần của một lần tung. Có mười lần tung, nên mười phần."],
    sixes6: ["Đó là số lần bạn tung, không phải số lần ra mặt 6.", "Đó là giá trị trung bình của mặt xúc xắc, một câu hỏi khác."],
    sumThree: ["Đó là trung bình của hai xúc xắc. Vẫn còn con thứ ba, nên cộng thêm 3,5 nữa.", "Đó mới là một xúc xắc đứng riêng. Cả ba con đều tính."],
    cardRank: ["Điểm giữa của 1 tới 13 là 7. Với số quân số lẻ thì điểm giữa là một quân số thật, không phải số lẻ nửa.", "Đó là quân số lớn nhất, không phải quân số trung bình."],
    evens4: ["Đó là số lần bạn tung, không phải số lần ra chẵn.", "Một nửa của bốn là hai."],
    coinPay: ["Đó là số tiền bạn nhận khi thắng, mà bạn chỉ thắng một nửa số lần.", "Đó là một phần tư giải thưởng. Mặt ngửa ra một nửa số lần, không phải một phần tư."],
    maxThree: ["Đó là mặt lớn nhất mà xúc xắc có thể ra, không phải mức lớn nhất trung bình.", "Đó mới là một xúc xắc đứng riêng. Luôn lấy con lớn nhất trong ba con thì trung bình bị kéo lên cao hơn nhiều."],
    minThree: ["Đó là mặt nhỏ nhất mà xúc xắc có thể ra, không phải mức nhỏ nhất trung bình.", "Đó mới là một xúc xắc đứng riêng. Luôn lấy con nhỏ nhất trong ba con thì trung bình bị kéo xuống thấp hơn nhiều."],
    absDiff: ["Đó là trung bình của hiệu có dấu, phần hơn và phần kém triệt tiêu nhau. Đề không xét con nào lớn hơn, nên không có gì triệt tiêu cả.", "Đó là trung bình của một xúc xắc, không phải khoảng cách giữa hai con."],
    product: ["Đó là tổng trung bình, không phải tích trung bình.", "Đó là 3,5 × 6. Con thứ hai cũng trung bình 3,5 chứ không phải 6.", "Rất sát: 3,5 × 3,5 đúng bằng 12,25."],
    larger: ["Đó mới là một xúc xắc đứng riêng. Luôn lấy con lớn hơn trong hai con thì trung bình bị kéo lên.", "Đó là giá trị lớn nhất có thể, không phải giá trị trung bình."],
    smaller: ["Đó mới là một xúc xắc đứng riêng. Luôn lấy con nhỏ hơn trong hai con thì trung bình bị kéo xuống.", "Đó là giá trị nhỏ nhất có thể, không phải giá trị trung bình."],
  },
  ptStockPath: (n) => `Lên rồi xuống đúng là kết thúc dưới chỗ ban đầu, nhưng đó chỉ là một trong các cách ${n} ngày có thể diễn ra. Lên rồi lên nữa thì kết thúc ở trên. Lấy trung bình hết thì chúng triệt tiêu nhau chính xác.`,
  ptStockBest: "Đó là trường hợp may nhất, ngày nào cũng lên.",
  ptStockWorst: "Đó là trường hợp xui nhất, ngày nào cũng xuống.",
  ptAcesOneCard: (n) => `Đó là phần của một lá duy nhất. Tay bài có ${n} lá, và lá nào cũng tính.`,
  ptAcesAllFour: "Đó là toàn bộ số quân Át trong bộ bài. Một tay bài cỡ này thường không giữ hết chúng.",
  ptRerollPlain: "Đó là xúc xắc thường không được tung lại. Được phép tung lại thì chỉ có lợi, nên đáp án bắt buộc phải trên 3,5.",
  ptRerollOther: "Đó là đáp án cho số lần tung lại khác. Kiểm lại đề cho bạn mấy lần.",
  ptRerollFive: "Ở đây không phải chỉ giữ 5 và 6. Hãy tung lại mỗi khi mặt hiện ra thấp hơn giá trị của một lần tung mới, còn không thì giữ.",
  ptChildOtherVersion: (sex, kept, other) =>
    `Đó là đáp án của phiên bản kia, "có ít nhất một con ${sex}". Chỉ đích danh một đứa là thông tin mạnh hơn ` +
    `việc nói rằng có một đứa nào đó: nó chỉ chừa lại ${kept} gia đình thay vì ${other}.`,
  ptChildNamedOne: (sex, kept, other) =>
    `Đó là đáp án của phiên bản kia, phiên bản chỉ đích danh một đứa con. "Có ít nhất một con ${sex}" chỉ nói rằng ` +
    `có một đứa như vậy ở đâu đó, nên loại đi ít hơn nhiều: còn ${kept} gia đình chứ không phải ${other}.`,
  ptChildPrior: "Đó là xác suất khi chưa ai nói gì với bạn cả. Thông tin bạn được cho đã loại bớt một số gia đình, nên đáp án bắt buộc phải lớn hơn con số này.",
  ptCondUnconditional: "Đó mới là một xúc xắc đứng riêng, bỏ qua điều bạn được cho biết. Cái tổng đã loại phần lớn kết quả và làm đổi đáp án.",
  ptCondPlain: (k) => `Đó là xác suất có mặt ${k} trong hai lần tung khi bạn chưa biết gì về tổng.`,
  ptCondOnePair: (total, k) => `Hai trong ${total} kết quả có chứa mặt ${k} chứ không phải một, vì mặt ${k} có thể nằm ở con nào cũng được.`,
  ptUrnReplace: "Điều đó đúng nếu bạn bỏ bóng đầu tiên trở lại rổ. Bạn không làm vậy, nên lần rút thứ hai thấy ít hơn một bóng đỏ và ít hơn một bóng tổng cộng.",
  ptUrnFirstOnly: "Đó mới là lần rút đầu tiên. Lần thứ hai cũng phải ra đỏ nữa.",
  ptUrnSecondOnly: "Đó là lần rút thứ hai với giả thiết lần đầu đã ra đỏ. Bạn còn phải nhân với xác suất lần đầu ra đỏ.",
  ptCoinAlone: "Đó là mức độ ra ngửa của riêng đồng xu này. Bạn còn phải so nó với những gì hai đồng kia có thể đã làm.",
  ptCoinPrior: "Đó là xác suất trước khi bạn tung. Thấy mặt ngửa là bằng chứng, và bằng chứng thì phải làm đáp án dịch chuyển.",
  ptCoinDividedThrice: "Xác suất 1/3 chọn mỗi đồng xu xuất hiện ở cả tử lẫn mẫu, nên nó triệt tiêu. Đừng chia thêm cho 3 nữa.",
  ptUrnsBOnly: "Đó là mức độ nhả bóng đỏ của riêng rổ B. Câu hỏi là bạn đang cầm rổ nào, nên tỉ lệ của rổ A cũng phải tham gia vào.",
  ptUrnsPrior: "Đó là xác suất trước khi bạn rút. Một bóng đỏ là bằng chứng, và nó chỉ về phía rổ nào nhiều đỏ hơn.",
  ptUrnsCounts: (a, aTot, b, bTot) => `Số bóng đỏ được đem so thẳng, nhưng hai rổ chứa số bóng khác nhau, nên phải so tỉ lệ ${a}/${aTot} với ${b}/${bTot} chứ không so số lượng.`,
  ptBoxPrior: "Đó là xác suất trước khi bạn tung. Một chuỗi toàn ngửa là bằng chứng, và nó bất lợi cho đồng công bằng.",
  ptBoxHalf: "Hai đồng xu đều có thể ra ngửa, nhưng không dễ như nhau: đồng hai mặt ngửa thì lần nào cũng ra, đồng công bằng chỉ thỉnh thoảng.",
  ptBoxAlone: (flips) => `Đó là mức độ đồng công bằng cho ra ${flips} khi đứng riêng. Bạn còn phải so nó với đồng hai mặt ngửa.`,
  ptBoxCertain: "Đồng hai mặt ngửa đúng là lần nào cũng ra ngửa, nhưng đề không hỏi điều đó. Chắc chắn tạo ra được bằng chứng không giống với chắc chắn khi đã nhìn thấy bằng chứng, bởi đồng công bằng cũng tạo ra nó được, chỉ là ít hơn.",
  ptWaitFlip: "Đó là xác suất nó xảy ra, không phải thời gian bạn phải chờ. Hãy lật ngược phân số lại.",
  ptWaitCountsToo: "Lần thử cuối cùng thành công cũng là một lần thử.",
  ptWaitFirstOnly: "Đó mới là khoảng chờ cho cái đầu tiên. Mỗi cái còn lại tốn đúng chừng đó nữa.",
  ptWaitMultiplied: "Các khoảng chờ cộng lại chứ không nhân. Nhân là để tính xác suất nhiều việc cùng xảy ra.",
  ptWaitSuccesses: "Đó là số lần thành công bạn muốn, không phải số lần thử để đạt được chúng.",
  ptPatternContrast: {
    HT: "Sau một mặt ngửa, thêm một mặt ngửa nữa không hại gì: bạn vẫn đang chờ mặt sấp, và mặt ngửa đang có vẫn còn giá trị.",
    TH: "Sau một mặt sấp, thêm một mặt sấp nữa không hại gì: bạn vẫn đang chờ mặt ngửa, và mặt sấp đang có vẫn còn giá trị.",
    HH: "Một nửa số lần, sau mặt ngửa đầu tiên là mặt sấp, và nó xoá sạch chuỗi khiến bạn phải làm lại. Chính việc phải làm lại là lý do cái này tốn 6 trong khi ngửa-rồi-sấp chỉ tốn 4.",
    TT: "Một nửa số lần, sau mặt sấp đầu tiên là mặt ngửa, và nó xoá sạch chuỗi khiến bạn phải làm lại. Chính việc phải làm lại là lý do cái này tốn 6 trong khi sấp-rồi-ngửa chỉ tốn 4.",
  },
  ptPatternOneFace: "Đó là khoảng chờ cho một mặt cụ thể. Câu này hỏi một mẫu gồm hai lần tung.",
  ptCollectMin: "Đó là trường hợp nhanh nhất có thể, không trùng lần nào. Trùng là chuyện thường xuyên, nên khoảng chờ thật dài hơn.",
  ptCollectSquare: "Dài quá. Càng về sau càng chờ lâu hơn, nhưng không lâu tới mức đó: tổng cộng chỉ hơi dưới gấp đôi con số bạn đoán ban đầu.",
  ptOrderPosition: "Số thứ tự của vị trí không quan trọng. Ra sau không làm cho một số lớn hơn.",
  ptOrderTwo: "Đó là đáp án nếu chỉ có hai lần lấy.",
  ptOrderFull: (n) => `Đó là xác suất của đúng một thứ tự cụ thể cho cả ${n} số. Ở đây bạn chỉ quan tâm cái nào đứng trên cùng.`,
  pSolOrderEnds: (n, orders, less, both) =>
    `Dù các giá trị có là gì, cả ${orders} thứ tự của chúng đều đồng khả năng. Số lớn nhất phải rơi vào chỗ đầu tiên, ` +
    `chuyện đó xảy ra 1 lần trong ${n}. Khi nó đã rơi vào đó, số nhỏ nhất phải rơi vào chỗ cuối trong ${less} chỗ còn lại, ` +
    `1 lần trong ${less}. Lần đếm thứ hai đã tính đến lần đầu rồi, nên hai số nhân với nhau: ` +
    `1/(${n} × ${less}) = 1/${both}.`,
  pSolOrderEither: (orders) =>
    `Cả ${orders} thứ tự đều đồng khả năng. Đúng một thứ tự chạy tăng và đúng một thứ tự chạy giảm, ` +
    `nên 2 trong ${orders}, tức 2/${orders}.`,
  ptEndsFullOrder: "Đó là ghim chặt toàn bộ thứ tự. Ở đây chỉ hai đầu bị cố định, còn những lần lấy ở giữa muốn xếp kiểu nào cũng được.",
  ptEndsFirstOnly: "Đó mới là nửa đầu của điều kiện. Lần lấy cuối cùng vẫn phải là nhỏ nhất trong tất cả những gì còn lại.",
  ptEitherOne: "Đó mới là một trong hai thứ tự. Ở đây cả hai đều tính, nên có hai chứ không phải một.",
  ptMonoMax: "Đó là xác suất một số cụ thể là lớn nhất. Ở đây cả thứ tự phải đúng, khó hơn nhiều.",
  ptMonoBoth: "Tăng dần và giảm dần là hai thứ tự riêng biệt. Đề hỏi một trong hai, không phải cái nào cũng được.",
  ptMonoFlips: "Sắp thứ tự không phải một chuỗi tung xu. Hãy đếm số thứ tự: có n! cái.",
  ptPickDistinctAnswer: "Đó là đáp án khi các lần chọn bắt buộc khác nhau. Ở đây được phép trùng, và trùng thì không bao giờ tăng ngặt, nên đáp án phải nhỏ hơn.",
  ptPickPerItem: (total) => `Đây không phải xác suất cho từng lần chọn. Hãy đếm số dãy tăng trên tổng ${total} dãy.`,
  ptPickPoolSize: (k) => `Một khi ${k} số đã khác nhau thì cỡ của kho số hết quan trọng. Chỉ số thứ tự mới đáng kể.`,
  ptPickPoolCancels: (k, fact) => `Cỡ kho số triệt tiêu mất. ${k} giá trị khác nhau bất kỳ đều có ${fact} thứ tự đồng khả năng và một cái là tăng dần.`,
  ptMontyHalf: "Còn lại hai cửa, nhưng chúng không đồng khả năng. Người dẫn không chọn ngẫu nhiên: anh ta biết xe ở đâu và không bao giờ mở nó, và đó chính là thông tin về cánh cửa anh ta để nguyên.",
  ptMontyOther: "Đó là xác suất của chiến thuật kia. Đọc kỹ xem đề hỏi chiến thuật nào.",
  ptRuinHalf: "Từng ván thì công bằng, nhưng cả cuộc chơi thì không. Ai bắt đầu với ít tiền hơn sẽ cháy túi trước, và thường xuyên hơn hẳn.",
  ptRuinOther: "Đó là xác suất B thắng, không phải A. Hai cái phải cộng lại bằng 1.",
  ptRuinOneCoin: "Xác suất đi theo cả đống tiền ban đầu, không phải theo một đồng lẻ.",
  ptFirstHalf: "Đi trước là lợi thế thật: A có cơ hội thắng trước cả khi B kịp tung lần nào.",
  ptFirstTurnOne: "Đó mới là lượt đầu tiên của A. A còn có thể thắng ở các lượt sau, sau khi cả hai cùng trượt.",
  ptFirstAverage: "Hãy dựng thành một phương trình: A thắng ngay, hoặc cả hai trượt và ván cờ quay về đúng chỗ ban đầu.",
  ptDerangeOpposite: "Đó là điều ngược với câu hỏi. Kiểm lại xem đề hỏi không lá nào hay ít nhất một lá.",
  ptDerangeOne: "Đó là chuyện của một lá thư cụ thể. Đề hỏi về cả cách sắp xếp cùng lúc.",
  ptDerangePerfect: "Đó là xác suất của cách sắp xếp hoàn hảo duy nhất, khi mọi lá thư đều vào đúng chỗ.",
  ptWalkHalf: "Về được chỗ cũ là một kết quả cụ thể trong nhiều kết quả, không phải một cú tung xu giữa về và không về.",
  ptWalkCount: (c, total) => `Hãy đếm số đường đi: ${c} trong ${total} đường khả dĩ kết thúc đúng chỗ xuất phát.`,
  ptCards: {
    suit: ["Điều đó đúng nếu lá thứ hai phải thuộc một chất được nêu tên. Nó chỉ cần trùng chất với lá đầu, mà một lá của chất đó đã rời khỏi bộ bài rồi.", "Đó là chuyện quân số như quân Q, không phải chuyện chất."],
    rank: ["Còn ba lá cùng số trong 51 lá, chứ không phải bốn trong 52: lá đầu tiên đã nằm trên tay bạn.", "Đó là một lá bài cụ thể."],
    red: ["Rất sát, nhưng bộ bài có thay đổi: sau khi một lá đỏ rời đi thì còn 25 lá đỏ trong 51 lá, không phải 26 trong 52.", "Đó mới là lá đầu tiên. Lá thứ hai cũng phải đỏ nữa."],
  },
  ptUnit: {
    band: ["Cái dải đó rộng hơn nửa hình vuông. Vẽ ra mà xem: hai góc nó bỏ sót là hai tam giác diện tích 1/8 mỗi cái, nên chỉ 1/4 bị loại ra.", "Đó là phần bị loại ra, không phải phần đề hỏi."],
    sum: ["Đường đó chạy từ góc này sang góc kia và cắt hình vuông làm đôi gọn ghẽ, nên tam giác bên dưới là 1/2 chứ không phải 1/4."],
    twice: ["Đó là đường Y = X. Đường Y = X/2 thoải hơn và chỉ cắt ra một phần tư."],
  },

  ordinal: (n) => `thứ ${n}`,
  fallbackOdd: "cấp số cộng",
};

export const TEXT = { en, vi };
