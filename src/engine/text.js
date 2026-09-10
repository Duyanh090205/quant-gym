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
  aRunningAdd: (a, steps) => `Add the big part first and say each number out loud: ${a} ${steps}`,
  aRunningSub: (a, steps) => `Take the big part away first and say each number out loud: ${a} ${steps}`,
  aStep: (sign, place, running) => `${sign} ${place} = ${running}`,
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
    `Multiplying is straight across: tops ${n1} × ${n2} = ${top}, bottoms ${d1} × ${d2} = ${bot}` +
    (cancelled ? `, which cancels to ${cancelled} = ${whole}` : ` = ${whole}`),
  aFracAdd: (n1, d1, a1, n2, d2, a2, lcm, sum, whole) =>
    `Adding needs the same bottom. Both fit into ${lcm}: ${n1}/${d1} = ${a1}/${lcm} and ${n2}/${d2} = ${a2}/${lcm}. ` +
    `Now add the tops: ${sum}/${lcm} = ${whole}`,
  aPctHalf: (y, half) => `Per cent means per hundred, and 50 per hundred is half. Halve ${y}: ${half}`,
  aPctQuarter: (y, half, quarter) => `25 per hundred is a quarter. Halve ${y} to get ${half}, then halve again: ${quarter}`,
  aPctTenth: (y, ten) => `10 per hundred is one tenth, so shift the digits one place: ${y} becomes ${ten}`,
  aPctFromTen: (p, y, ten, whole) => `Start from 10%, which is one tenth of ${y} = ${ten}. Then ${p}% is ${p === 20 ? "twice that" : "half of that"}: ${whole}`,
  aPctBuild: (ten, times, p, whole) => `Build it from 10% = ${ten}: ${p}% is ${times} of those, so ${ten} × ${times} = ${whole}`,
  aPctOfWhole: (x, y, share, whole) => `Put it over the whole and turn it into hundredths: ${x}/${y} = ${share}, and ${share} × 100 = ${whole}%`,
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
    `A: ${b1} ÷ ${den} = ${part}, times ${num} = ${A}. B: 10% of ${b2} is ${tenth}, so it comes to ${B}. Then ${A} − ${B} = ${diff}`,
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
  aRunningAdd: (a, steps) => `Cộng phần lớn trước và đọc to từng số: ${a} ${steps}`,
  aRunningSub: (a, steps) => `Trừ phần lớn trước và đọc to từng số: ${a} ${steps}`,
  aStep: (sign, place, running) => `${sign} ${place} = ${running}`,
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
    `Nhân phân số là nhân thẳng: tử ${n1} × ${n2} = ${top}, mẫu ${d1} × ${d2} = ${bot}` +
    (cancelled ? `, rút gọn thành ${cancelled} = ${whole}` : ` = ${whole}`),
  aFracAdd: (n1, d1, a1, n2, d2, a2, lcm, sum, whole) =>
    `Muốn cộng thì phải cùng mẫu. Cả hai đều quy về ${lcm}: ${n1}/${d1} = ${a1}/${lcm} và ${n2}/${d2} = ${a2}/${lcm}. ` +
    `Giờ cộng tử: ${sum}/${lcm} = ${whole}`,
  aPctHalf: (y, half) => `Phần trăm là phần của một trăm, và 50 trên 100 là một nửa. Chia đôi ${y}: ${half}`,
  aPctQuarter: (y, half, quarter) => `25 trên 100 là một phần tư. Chia đôi ${y} được ${half}, rồi chia đôi lần nữa: ${quarter}`,
  aPctTenth: (y, ten) => `10 trên 100 là một phần mười, nên dịch chữ số sang một hàng: ${y} thành ${ten}`,
  aPctFromTen: (p, y, ten, whole) => `Bắt đầu từ 10%, tức một phần mười của ${y} = ${ten}. Rồi ${p}% là ${p === 20 ? "gấp đôi số đó" : "một nửa số đó"}: ${whole}`,
  aPctBuild: (ten, times, p, whole) => `Dựng từ 10% = ${ten}: ${p}% là ${times} lần số đó, nên ${ten} × ${times} = ${whole}`,
  aPctOfWhole: (x, y, share, whole) => `Đặt nó trên tổng rồi đổi ra phần trăm: ${x}/${y} = ${share}, và ${share} × 100 = ${whole}%`,
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
    `A: ${b1} ÷ ${den} = ${part}, nhân ${num} = ${A}. B: 10% của ${b2} là ${tenth}, nên nó bằng ${B}. Rồi ${A} − ${B} = ${diff}`,
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

  ordinal: (n) => `thứ ${n}`,
  fallbackOdd: "cấp số cộng",
};

export const TEXT = { en, vi };
