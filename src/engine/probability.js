/**
 * Probability and expected value.
 *
 * These are the questions a trading firm actually asks, reduced to the seven
 * ideas that generate almost all of them.
 *
 * Every generator takes `(rng, level, t)`, where `t` is the phrasebook resolved
 * to the reader's language. The numbers and the wrong routes live here; every
 * sentence lives in `text.js`. That split is what lets a Vietnamese student read
 * the explanation at the moment it matters, which is the moment they are stuck.
 *
 * Two kinds of feedback ride along, doing different jobs:
 *
 *   solution — always available. The worked line for this exact question, built
 *              from the same numbers that built the question.
 *   traps    — a specific wrong route with the sentence naming it. Only fires
 *              when the typed answer matches. This is the diagnosis; the
 *              solution is the treatment.
 *
 * House style for both: no term a fifteen-year-old has not met, unless the
 * sentence defines it on the spot.
 *
 * Sources for the classics: Zhou's *A Practical Guide to Quantitative Finance
 * Interviews*, and questions repeatedly reported from Optiver, SIG, IMC and
 * Jane Street first rounds.
 */

import { fact, choose, frac } from "./format.js";

const q = (o) => ({ format: "probability", traps: [], ...o });

/** Pair a list of trap values with the phrasebook's list of explanations. */
const traps = (values, whys) =>
  values.map((value, i) => ({ value, why: whys[i] })).filter((x) => x.why);

/* ── 1. Counting ─────────────────────────────────────────────────────────── */
const CHANCE = [
  { k: "die6", p: 1 / 6, traps: [1 / 3, 1 / 2] },
  { k: "coinH", p: 1 / 2, traps: [1 / 4] },
  { k: "dieOver4", p: 1 / 3, traps: [1 / 6, 1 / 2] },
  { k: "heart", p: 1 / 4, traps: [1 / 13, 1 / 52] },
  { k: "dieEven", p: 1 / 2, traps: [1 / 3] },
  { k: "dieUnder3", p: 1 / 3, traps: [1 / 6, 1 / 2] },
  { k: "dieNot6", p: 5 / 6, traps: [1 / 6] },
  { k: "redCard", p: 1 / 2, traps: [1 / 4, 1 / 13] },
  { k: "aceCard", p: 1 / 13, traps: [1 / 4, 1 / 52] },
  { k: "faceCard", p: 3 / 13, traps: [1 / 13, 3 / 52] },
  { k: "twoHeads", p: 1 / 4, traps: [1 / 2, 1 / 3] },
];

const AT_LEAST = [
  { k: "six", p: 1 / 6, action: "die", miss: "5/6" },
  { k: "head", p: 1 / 2, action: "coin", miss: "1/2" },
  { k: "heart", p: 1 / 4, action: "card", miss: "3/4" },
  { k: "ace", p: 1 / 13, action: "card", miss: "12/13" },
  { k: "oneTwo", p: 1 / 3, action: "die", miss: "2/3" },
];

export function counting(rng, level, t) {
  if (level === 1) {
    const v = rng.pick(CHANCE);
    return q({
      prompt: t.pAskChance(t.pEvents[v.k]),
      answer: v.p,
      solution: t.pSolChance[v.k],
      traps: traps(v.traps, t.ptChance[v.k]),
      tip: "equally-likely",
    });
  }

  if (level === 2) {
    const s = rng.int(2, 12);
    const ways = 6 - Math.abs(s - 7);
    const pairs = [];
    for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) pairs.push(`(${a}${t.sep}${s - a})`);
    const exact = ways / 36;
    return q({
      prompt: t.pAskDiceSum(s),
      answer: exact,
      solution: t.pSolDiceSum(s, pairs.join(" "), ways, t.f(exact) === `${ways}/36` ? null : t.f(exact)),
      traps: [
        { value: 1 / 11, why: t.ptSumEleven },
        { value: ways / 21, why: t.ptSumUnordered },
        { value: 1 / 36, why: t.ptSumOnePair },
      ],
      tip: "equally-likely",
    });
  }

  const ev = rng.pick(AT_LEAST);
  const n = rng.int(2, 6);
  const none = (1 - ev.p) ** n;
  const ans = 1 - none;
  return q({
    prompt: t.pAskAtLeast(t.pActions[ev.action], n, t.pAtLeast[ev.k]),
    answer: ans,
    solution: t.pSolAtLeast(n, ev.miss, t.f(Math.round(none * 1e6) / 1e6), t.f(Math.round(ans * 1e6) / 1e6)),
    traps: [
      { value: none, why: t.ptMissAll(t.pMissNames[ev.k]) },
      { value: Math.min(1, n * ev.p), why: t.ptAddedChances },
      { value: ev.p, why: t.ptOneTrialOnly },
    ],
    tip: "at-least-one-complement",
  });
}

/* ── 2. Expected value ───────────────────────────────────────────────────── */
const EV1 = [
  { k: "oneDie", a: 3.5, traps: [3, 6] },
  { k: "sumTwo", a: 7, traps: [3.5, 6] },
  { k: "heads4", a: 2, traps: [4, 0.5] },
  { k: "sixes12", a: 2, traps: [12, 6] },
  { k: "heads10", a: 5, traps: [10, 0.5] },
  { k: "sixes6", a: 1, traps: [6, 3.5] },
  { k: "sumThree", a: 10.5, traps: [7, 3.5] },
  { k: "cardRank", a: 7, traps: [6.5, 13] },
  { k: "evens4", a: 2, traps: [4, 3] },
  { k: "coinPay", a: 5, traps: [10, 2.5] },
];

const EV2 = [
  { k: "product", a: 12.25, traps: [7, 21, 12] },
  { k: "larger", a: 161 / 36, traps: [3.5, 6] },
  { k: "smaller", a: 91 / 36, traps: [3.5, 1] },
];

export function expectedValue(rng, level, t) {
  if (level === 1) {
    const v = rng.pick(EV1);
    return q({
      prompt: t.pAskEV(t.pEvNames[v.k]),
      answer: v.a,
      format: "number",
      solution: t.pSolEV[v.k],
      traps: traps(v.traps, t.ptEV[v.k]),
      tip: "expectation-is-a-weighted-average",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const v = rng.pick(EV2);
      return q({
        prompt: t.pAskEV(t.pEvNames[v.k]),
        answer: v.a,
        format: "number",
        solution: t.pSolEV[v.k],
        traps: traps(v.traps, t.ptEV[v.k]),
        tip: "expectation-is-a-weighted-average",
      });
    }
    const S = rng.pick([100, 200, 50]);
    const x = rng.pick([0.1, 0.2, 0.05]);
    const n = rng.pick([2, 2, 3]);
    const pct = Math.round(x * 100);
    return q({
      prompt: t.pAskStock(S, pct, n),
      answer: S,
      format: "number",
      solution: t.pSolStock(t.n(1 + x), t.n(Math.round((1 - x) * 100) / 100), n, S),
      traps: [
        { value: S * (1 - x * x) ** Math.floor(n / 2), why: t.ptStockPath(n) },
        { value: S * (1 + x) ** n, why: t.ptStockBest },
        { value: S * (1 - x) ** n, why: t.ptStockWorst },
      ],
      tip: "expectation-not-one-path",
    });
  }

  const k = rng.pick([1, 1, 2]);
  return q({
    prompt: t.pAskReroll(k),
    answer: k === 1 ? 4.25 : 14 / 3,
    format: "number",
    solution: k === 1 ? t.pSolReroll1 : t.pSolReroll2,
    traps: [
      { value: 3.5, why: t.ptRerollPlain },
      { value: k === 1 ? 14 / 3 : 4.25, why: t.ptRerollOther },
      { value: 5, why: t.ptRerollFive },
    ],
    tip: "expectation-is-a-weighted-average",
  });
}

/* ── 3. Conditional probability ──────────────────────────────────────────── */
export function conditional(rng, level, t) {
  if (level === 1) {
    const v = rng.pick(["least", "least", "elder", "leastG"]);
    if (v === "elder") {
      return q({
        prompt: t.pTwoChildStem + t.pAskElder,
        answer: 1 / 2,
        solution: t.pSolElder,
        traps: [{ value: 1 / 3, why: t.ptElderThird }],
        tip: "condition-shrinks-the-space",
      });
    }
    if (v === "leastG") {
      return q({
        prompt: t.pTwoChildStem + t.pAskLeastGirl,
        answer: 1 / 3,
        solution: t.pSolLeastGirl,
        traps: [{ value: 1 / 2, why: t.ptTwoChildHalf }],
        tip: "condition-shrinks-the-space",
      });
    }
    return q({
      prompt: t.pTwoChildStem + t.pAskLeastBoy,
      answer: 1 / 3,
      solution: t.pSolLeastBoy,
      traps: [
        { value: 1 / 2, why: t.ptTwoChildHalf },
        { value: 1 / 4, why: t.ptTwoChildQuarter },
      ],
      tip: "condition-shrinks-the-space",
    });
  }

  if (level === 2) {
    const s = rng.pick([7, 8, 9, 10]);
    const total = 13 - s;
    const pairs = [];
    for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) pairs.push(`(${a}${t.sep}${s - a})`);
    return q({
      prompt: t.pAskCondDice(s),
      answer: 2 / total,
      solution: t.pSolCondDice(pairs.join(" "), total, t.f(2 / total)),
      traps: [
        { value: 1 / 6, why: t.ptCondUnconditional },
        { value: 11 / 36, why: t.ptCondPlain },
        { value: 1 / total, why: t.ptCondOnePair(total) },
      ],
      tip: "condition-shrinks-the-space",
    });
  }

  const r = rng.int(2, 6);
  const b = rng.int(2, 6);
  const N = r + b;
  return q({
    prompt: t.pAskUrnTwo(r, b),
    answer: (r * (r - 1)) / (N * (N - 1)),
    solution: t.pSolUrnTwo(r, N, t.f((r * (r - 1)) / (N * (N - 1)))),
    traps: [
      { value: (r / N) ** 2, why: t.ptUrnReplace },
      { value: r / N, why: t.ptUrnFirstOnly },
      { value: (r - 1) / (N - 1), why: t.ptUrnSecondOnly },
    ],
    tip: "condition-shrinks-the-space",
  });
}

/* ── 4. Bayes ────────────────────────────────────────────────────────────── */
export function bayes(rng, level, t) {
  if (level === 1) {
    const set = rng.pick([[1 / 4, 1 / 2, 3 / 4], [1 / 10, 1 / 2, 9 / 10], [1 / 3, 1 / 2, 2 / 3], [1 / 5, 2 / 5, 4 / 5]]);
    const k = rng.int(0, 2);
    const total = set[0] + set[1] + set[2];
    const shown = set.map((x) => t.f(x));
    return q({
      prompt: t.pAskThreeCoins(shown.join(", "), t.f(set[k])),
      answer: set[k] / total,
      solution: t.pSolThreeCoins(shown.join(", "), t.f(set[k]), shown.join(" + "), t.f(total), t.f(set[k] / total)),
      traps: [
        { value: set[k], why: t.ptCoinAlone },
        { value: 1 / 3, why: t.ptCoinPrior },
        { value: set[k] / 3, why: t.ptCoinDividedThrice },
      ],
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
        prompt: t.pAskUrns(A[0], A[1], B[0], B[1]),
        answer: rB / (rA + rB),
        solution: t.pSolUrns(A[1], A[0] + A[1], B[1], B[0] + B[1], t.f(rA), t.f(rB), t.f(rB / (rA + rB))),
        traps: [
          { value: rB, why: t.ptUrnsBOnly },
          { value: 1 / 2, why: t.ptUrnsPrior },
          { value: B[1] / (A[1] + B[1]), why: t.ptUrnsCounts(A[1], A[0] + A[1], B[1], B[0] + B[1]) },
        ],
        tip: "bayes-likelihood-share",
      });
    }
  }

  const n = rng.int(1, 3);
  const fair = 1 / 2 ** n;
  const headsText = n === 1 ? t.pBoxOneHead : t.pBoxManyHeads(n);
  return q({
    prompt: t.pAskBox(n),
    answer: fair / (fair + 1),
    solution: t.pSolBox(headsText, t.f(fair), t.f(fair / (fair + 1))),
    traps: [
      { value: 1 / 3, why: t.ptBoxPrior },
      { value: 1 / 2, why: t.ptBoxHalf },
      { value: fair, why: t.ptBoxAlone(headsText) },
    ],
    tip: "bayes-likelihood-share",
  });
}

/* ── 5. Waiting time ─────────────────────────────────────────────────────── */
const WAIT1 = [
  { k: "die6", a: 6, p: "1/6" },
  { k: "coinH", a: 2, p: "1/2" },
  { k: "die56", a: 3, p: "1/3" },
  { k: "heartRep", a: 4, p: "1/4" },
  { k: "ace13", a: 13, p: "1/13" },
  { k: "redRep", a: 2, p: "1/2" },
  { k: "dieUnder3", a: 3, p: "1/3" },
  { k: "sumSeven", a: 6, p: "1/6" },
  { k: "sumTen", a: 12, p: "1/12" },
  { k: "doubleSix", a: 36, p: "1/36" },
];
const WAIT_K = [
  { k: "die6", one: 6, g: "die" },
  { k: "coinH", one: 2, g: "coin" },
  { k: "die56", one: 3, g: "die" },
];
const PATTERNS = [{ k: "HT", a: 4 }, { k: "TH", a: 4 }, { k: "HH", a: 6 }, { k: "TT", a: 6 }];
const COLLECT = [
  { k: "faces", n: 6 }, { k: "suits", n: 4 }, { k: "coin", n: 2 },
  { k: "ranks", n: 13 }, { k: "weekdays", n: 7 }, { k: "vowels", n: 5 },
];

export function waitingTime(rng, level, t) {
  if (level === 1) {
    const v = rng.pick(WAIT1);
    return q({
      prompt: t.pAskWaitFirst(t.pWaitNames[v.k]),
      answer: v.a,
      format: "number",
      solution: t.pSolWaitFirst(v.p, v.a),
      traps: [
        { value: 1 / v.a, why: t.ptWaitFlip },
        { value: v.a - 1, why: t.ptWaitCountsToo },
      ],
      tip: "waiting-time-one-over-p",
    });
  }

  if (level === 2) {
    const v = rng.pick(WAIT_K);
    const k = rng.int(2, 4);
    return q({
      prompt: t.pAskWaitK(t.pShortNames[v.k], k, t.pGerunds[v.g]),
      answer: v.one * k,
      format: "number",
      solution: t.pSolWaitK(v.one, k, v.one * k),
      traps: [
        { value: v.one, why: t.ptWaitFirstOnly },
        { value: v.one ** k, why: t.ptWaitMultiplied },
        { value: k, why: t.ptWaitSuccesses },
      ],
      tip: "waiting-time-one-over-p",
    });
  }

  if (rng.chance(0.6)) {
    const pat = rng.pick(PATTERNS);
    const other = pat.a === 4 ? "HH" : "HT";
    return q({
      prompt: t.pAskPattern(t.pPatterns[pat.k]),
      answer: pat.a,
      format: "number",
      solution: t.pSolPattern[pat.k],
      traps: [
        { value: pat.a === 4 ? 6 : 4, why: t.ptPatternContrast[pat.k] },
        { value: 2, why: t.ptPatternOneFace },
      ],
      tip: "waiting-time-one-over-p",
    });
  }

  const v = rng.pick(COLLECT);
  const n = v.n;
  let h = 0;
  const terms = [];
  for (let i = 1; i <= n; i++) { h += 1 / i; terms.push(i === 1 ? "1" : `1/${i}`); }
  return q({
    prompt: t.pAskCollect(t.pCollect[v.k]),
    answer: n * h,
    format: "number",
    solution: t.pSolCollect(n, terms.join(" + "), t.n(Math.round(n * h * 100) / 100)),
    traps: [
      { value: n, why: t.ptCollectMin },
      { value: n * n, why: t.ptCollectSquare },
    ],
    tip: "waiting-time-one-over-p",
  });
}

/* ── 6. Symmetry ─────────────────────────────────────────────────────────── */
export function symmetry(rng, level, t) {
  if (level === 1) {
    const n = rng.int(3, 5);
    const j = rng.int(1, n);
    return q({
      prompt: t.pAskOrderMax(n, t.pOrdinals[j - 1]),
      answer: 1 / n,
      solution: t.pSolOrderMax(n),
      traps: [
        { value: j / n, why: t.ptOrderPosition },
        { value: 1 / 2, why: t.ptOrderTwo },
        { value: 1 / fact(n), why: t.ptOrderFull(n) },
      ],
      tip: "symmetry-orderings",
    });
  }

  if (level === 2) {
    const n = rng.int(3, 5);
    const up = rng.chance(0.5);
    const dir = up ? t.pStrictUp : t.pStrictDown;
    return q({
      prompt: t.pAskOrderMono(n, dir),
      answer: 1 / fact(n),
      solution: t.pSolOrderMono(n, fact(n), dir),
      traps: [
        { value: 1 / n, why: t.ptMonoMax },
        { value: 2 / fact(n), why: t.ptMonoBoth },
        { value: 1 / 2 ** n, why: t.ptMonoFlips },
      ],
      tip: "symmetry-orderings",
    });
  }

  const k = rng.pick([2, 3, 3, 4]);
  const N = rng.pick([6, 8, 10, 10, 12]);
  if (rng.chance(0.35)) {
    const c = choose(N, k);
    return q({
      prompt: t.pAskPickRepeat(k, N),
      answer: c / N ** k,
      solution: t.pSolPickRepeat(N, k, N ** k, c, t.f(c / N ** k)),
      traps: [
        { value: 1 / fact(k), why: t.ptPickDistinctAnswer },
        { value: 1 / k, why: t.ptPickPerItem(N ** k) },
      ],
      tip: "symmetry-orderings",
    });
  }
  return q({
    prompt: t.pAskPickDistinct(k, N),
    answer: 1 / fact(k),
    solution: t.pSolPickDistinct(k, fact(k), N),
    traps: [
      { value: 1 / N, why: t.ptPickPoolSize(k) },
      { value: k / N, why: t.ptPickPoolCancels(k, fact(k)) },
    ],
    tip: "symmetry-orderings",
  });
}

/* ── 7. Classic puzzles ──────────────────────────────────────────────────── */
const CARDS = [
  { k: "suit", a: 12 / 51, traps: [1 / 4, 1 / 13] },
  { k: "rank", a: 3 / 51, traps: [1 / 13, 1 / 52] },
  { k: "red", a: 25 / 102, traps: [1 / 4, 1 / 2] },
];
const UNIT = [
  { k: "band", a: 3 / 4, traps: [1 / 2, 1 / 4] },
  { k: "sum", a: 1 / 2, traps: [1 / 4] },
  { k: "twice", a: 1 / 4, traps: [1 / 2] },
];
// Monty Hall is one puzzle, so drilling it eight times asks the same question
// eight times. Opening it up to N doors turns it into a family, and the hundred
// door version is the one that makes the answer obvious rather than surprising:
// nobody believes the host left the car behind the one door he happened to skip.
const DOORS = [3, 3, 3, 4, 5, 6, 8, 10, 100];
const FIRST_TO = [
  { k: "six", p: 1 / 6 },
  { k: "head", p: 1 / 2 },
  { k: "five6", p: 1 / 3 },
];

export function classics(rng, level, t) {
  if (level === 1) {
    const n = rng.pick(DOORS);
    const sw = rng.chance(0.66);
    return q({
      prompt: t.pAskMonty(sw, n),
      answer: sw ? (n - 1) / n : 1 / n,
      solution: sw ? t.pSolMontySwitch(n) : t.pSolMontyStay(n),
      traps: [
        { value: 1 / 2, why: t.ptMontyHalf },
        { value: sw ? 1 / n : (n - 1) / n, why: t.ptMontyOther },
      ],
      tip: "host-knows-something",
    });
  }

  if (level === 2) {
    if (rng.chance(0.5)) {
      const N = rng.pick([4, 5, 5, 6, 8, 10]);
      const i = rng.int(1, N - 1);
      return q({
        prompt: t.pAskRuin(i, N - i),
        answer: i / N,
        solution: t.pSolRuin(i, N, t.f(i / N)),
        traps: [
          { value: 1 / 2, why: t.ptRuinHalf },
          { value: (N - i) / N, why: t.ptRuinOther },
          { value: 1 / N, why: t.ptRuinOneCoin },
        ],
        tip: "ruin-share-of-the-pot",
      });
    }
    const ev = rng.pick(FIRST_TO);
    const p = ev.p;
    return q({
      prompt: t.pAskFirst(t.pFirstNames[ev.k]),
      answer: 1 / (2 - p),
      solution: t.pSolFirst(t.f(p), t.f((1 - p) ** 2), t.f(1 / (2 - p))),
      traps: [
        { value: 1 / 2, why: t.ptFirstHalf },
        { value: p, why: t.ptFirstTurnOne },
        { value: (1 + p) / 2, why: t.ptFirstAverage },
      ],
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
      prompt: t.pAskDerange(n, asksNone),
      answer: asksNone ? none : 1 - none,
      solution: t.pSolDerange(n, fact(n), D, t.f(none), asksNone, t.f(1 - none)),
      traps: [
        { value: asksNone ? 1 - none : none, why: t.ptDerangeOpposite },
        { value: 1 / n, why: t.ptDerangeOne },
        { value: 1 / fact(n), why: t.ptDerangePerfect },
      ],
      tip: "symmetry-orderings",
    });
  }

  if (kind === "walk") {
    const n = rng.pick([1, 2, 3]);
    const c = choose(2 * n, n);
    return q({
      prompt: t.pAskWalk(2 * n),
      answer: c / 4 ** n,
      solution: t.pSolWalk(2 * n, n, c, 4 ** n, t.f(c / 4 ** n)),
      traps: [
        { value: 1 / 2, why: t.ptWalkHalf },
        { value: 1 / 2 ** n, why: t.ptWalkCount(c, 4 ** n) },
      ],
      tip: "equally-likely",
    });
  }

  if (kind === "cards") {
    const v = rng.pick(CARDS);
    return q({
      prompt: t.pAskCards(t.pCards[v.k]),
      answer: v.a,
      solution: t.pSolCards[v.k],
      traps: traps(v.traps, t.ptCards[v.k]),
      tip: "condition-shrinks-the-space",
    });
  }

  const v = rng.pick(UNIT);
  return q({
    prompt: t.pAskUnit(t.pUnit[v.k]),
    answer: v.a,
    solution: t.pSolUnit[v.k],
    traps: traps(v.traps, t.ptUnit[v.k]),
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
