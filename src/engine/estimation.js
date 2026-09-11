/**
 * Estimation.
 *
 * The part of a trading interview that has no formula in it. You are asked how
 * many piano tuners a city keeps busy, and nobody expects the right number —
 * they want to watch you break a question into parts you can actually reason
 * about, and then arrive somewhere defensible under time pressure.
 *
 * Two skills, and the order between them is the point:
 *
 *   est.scale  — how big is a thing. Seconds in a year, litres in a day,
 *                beats in a lifetime. Chains of round factors, exact answers.
 *   est.fermi  — how many of a thing. A quantity nobody has counted, reached
 *                by multiplying together numbers you do know.
 *
 * Scale comes first because a Fermi chain is only ever as good as the factors
 * going into it, and a student who cannot say how many seconds are in a day
 * will not get the rest of the way.
 *
 * Every question here states the assumptions it wants you to use. That is a
 * deliberate limit, not an oversight: a question that leaves you to invent the
 * assumptions has no single right answer, so it cannot be marked by a machine
 * without teaching a made-up number as the truth. Inventing the assumptions is
 * the next step up, and it needs a person on the other side of the table. What
 * this trains is the half that can be trained alone — the decomposition and the
 * arithmetic of big round numbers — and it is the half students get wrong.
 *
 * Every generator takes `(rng, level, t)` like the rest of the engine, and every
 * sentence lives in `text.js`.
 */

const q = (o) => ({ format: "number", traps: [], ...o });

/** Keep drawing until the numbers divide evenly; give up rather than lie. */
function until(rng, attempts, draw) {
  for (let i = 0; i < attempts; i++) {
    const got = draw(rng);
    if (got && Number.isInteger(got.answer)) return got;
  }
  return null;
}

/* ── 1. Scale: how big is a thing ────────────────────────────────────────── */

/**
 * One step of a unit ladder. `per` is how many of the small unit fit in one big
 * one; the names live in the phrasebook so both languages read naturally.
 */
const UNITS = [
  { k: "secMin", per: 60 },
  { k: "minHour", per: 60 },
  { k: "hourDay", per: 24 },
  { k: "dayWeek", per: 7 },
  { k: "monthYear", per: 12 },
  { k: "gKg", per: 1000 },
  { k: "mKm", per: 1000 },
  { k: "mlLitre", per: 1000 },
  { k: "cmM", per: 100 },
  { k: "mmCm", per: 10 },
];

export function scale(rng, level, t) {
  if (level === 1) {
    const v = rng.pick(UNITS);
    const n = rng.int(2, 9);
    const u = t.eUnits[v.k];
    return q({
      prompt: t.eAskUnits(u.small, n, u.many),
      answer: v.per * n,
      solution: t.eSolUnits(u.one, v.per, u.small, n, v.per * n),
      traps: [
        { value: v.per, why: t.etOneUnitOnly(u.one) },
        { value: v.per + n, why: t.etAddedNotMultiplied },
      ],
      tip: "count-the-zeros",
    });
  }

  if (level === 2) {
    const shape = rng.pick(["heart", "tap", "read", "car", "machine", "drip"]);

    if (shape === "heart") {
      const r = rng.pick([60, 64, 66, 68, 70, 72, 75, 80]);
      return q({
        prompt: t.eAskHeartHour(r),
        answer: 60 * r,
        solution: t.eSolHeartHour(r, 60 * r),
        traps: [{ value: r, why: t.etOneMinuteOnly }],
        tip: "chain-the-factors",
      });
    }

    if (shape === "tap") {
      const r = rng.pick([2, 3, 4, 5, 6, 8]);
      const h = rng.int(2, 5);
      return q({
        prompt: t.eAskTap(r, h),
        answer: 60 * r * h,
        solution: t.eSolTap(r, 60 * r, h, 60 * r * h),
        traps: [
          { value: r * h, why: t.etForgotPerMinute },
          { value: 60 * r, why: t.etOneHourOnly },
        ],
        tip: "chain-the-factors",
      });
    }

    if (shape === "read") {
      const w = rng.pick([180, 200, 220, 240, 250, 300]);
      const h = rng.int(2, 4);
      return q({
        prompt: t.eAskRead(w, h),
        answer: 60 * w * h,
        solution: t.eSolRead(w, 60 * w, h, 60 * w * h),
        traps: [
          { value: w * h, why: t.etForgotPerMinute },
          { value: 60 * w, why: t.etOneHourOnly },
        ],
        tip: "chain-the-factors",
      });
    }

    if (shape === "car") {
      const v = rng.pick([60, 70, 80, 90, 100, 110]);
      const h = rng.int(2, 6);
      return q({
        prompt: t.eAskCar(v, h),
        answer: v * h,
        solution: t.eSolCar(v, h, v * h),
        traps: [{ value: v + h, why: t.etAddedNotMultiplied }],
        tip: "chain-the-factors",
      });
    }

    if (shape === "machine") {
      const r = rng.pick([15, 20, 24, 25, 30, 40, 50]);
      const h = rng.pick([6, 7, 8, 9, 10, 12]);
      return q({
        prompt: t.eAskMachine(r, h),
        answer: r * h,
        solution: t.eSolMachine(r, h, r * h),
        traps: [{ value: r, why: t.etOneHourOnly }],
        tip: "chain-the-factors",
      });
    }

    const r = rng.int(2, 6);
    return q({
      prompt: t.eAskDrip(r),
      answer: 3600 * r,
      solution: t.eSolDrip(r, 60 * r, 3600 * r),
      traps: [
        { value: 60 * r, why: t.etOneMinuteOnly },
        { value: r, why: t.etOneSecondOnly },
      ],
      tip: "chain-the-factors",
    });
  }

  const shape = rng.pick(["heartYear", "sleepYear", "light", "river", "breathYear"]);

  if (shape === "heartYear" || shape === "breathYear") {
    const heart = shape === "heartYear";
    const r = heart ? rng.pick([60, 64, 66, 68, 70, 72, 75, 80]) : rng.pick([12, 14, 15, 16, 18, 20]);
    return q({
      prompt: heart ? t.eAskHeartYear(r) : t.eAskBreathYear(r),
      answer: 525600 * r,
      solution: t.eSolPerYear(r, 60 * r, 1440 * r, 525600 * r, heart ? t.eBeats : t.eBreaths),
      traps: [
        { value: 1440 * r, why: t.etOneDayOnly },
        { value: 365 * r, why: t.etCountedDaysNotMinutes },
      ],
      tip: "chain-the-factors",
    });
  }

  if (shape === "sleepYear") {
    const h = rng.int(6, 9);
    return q({
      prompt: t.eAskSleepYear(h),
      answer: 365 * h,
      solution: t.eSolSleepYear(h, 365 * h),
      traps: [
        { value: 7 * h, why: t.etOneWeekOnly },
        { value: 365 * h * 60, why: t.etAnsweredInMinutes },
      ],
      tip: "chain-the-factors",
    });
  }

  if (shape === "light") {
    const n = rng.int(2, 9);
    return q({
      prompt: t.eAskLight(n),
      answer: 18000 * n,
      solution: t.eSolLight(n, 60 * n, 18000 * n),
      traps: [
        { value: 300 * n, why: t.etLightSeconds },
        { value: 18000, why: t.etLightOneMinute },
      ],
      tip: "count-the-zeros",
    });
  }

  const v = rng.pick([5, 8, 10, 12, 15, 20, 25]);
  return q({
    prompt: t.eAskRiver(v),
    answer: 86400 * v,
    solution: t.eSolRiver(v, 3600 * v, 86400 * v),
    traps: [
      { value: 3600 * v, why: t.etOneHourOnly },
      { value: 1440 * v, why: t.etCountedMinutesNotSeconds },
    ],
    tip: "chain-the-factors",
  });
}

/* ── 2. Fermi: how many of a thing ───────────────────────────────────────── */

export function fermi(rng, level, t) {
  if (level === 1) {
    const shape = rng.pick(["cups", "windows", "messages", "bus", "shelves"]);

    if (shape === "cups") {
      const n = rng.pick([400, 600, 800, 900, 1200]);
      const c = rng.int(2, 5);
      return q({
        prompt: t.eAskCups(n, c),
        answer: n * c,
        solution: t.eSolTwoFactor(n, t.eSubjects.students, c, n * c, t.eCups),
        traps: [
          { value: n, why: t.etOnePerPerson(t.eSubjects.students, t.eCups) },
          { value: n + c, why: t.etAddedNotMultiplied },
        ],
        tip: "chain-the-factors",
      });
    }

    if (shape === "windows") {
      const n = rng.pick([200, 300, 500, 800, 1000]);
      const w = rng.pick([6, 8, 10, 12]);
      return q({
        prompt: t.eAskWindows(n, w),
        answer: n * w,
        solution: t.eSolTwoFactor(n, t.eSubjects.houses, w, n * w, t.eWindows),
        traps: [
          { value: n, why: t.etOnePerPerson(t.eSubjects.houses, t.eWindows) },
          { value: n + w, why: t.etAddedNotMultiplied },
        ],
        tip: "chain-the-factors",
      });
    }

    if (shape === "messages") {
      const n = rng.pick([50, 80, 120, 200, 300]);
      const m = rng.pick([20, 30, 40, 50]);
      return q({
        prompt: t.eAskMessages(n, m),
        answer: n * m,
        solution: t.eSolTwoFactor(n, t.eSubjects.people, m, n * m, t.eMessages),
        traps: [
          { value: n, why: t.etOnePerPerson(t.eSubjects.people, t.eMessages) },
          { value: n + m, why: t.etAddedNotMultiplied },
        ],
        tip: "chain-the-factors",
      });
    }

    if (shape === "bus") {
      const b = rng.pick([12, 15, 20, 24, 30]);
      const s = rng.pick([40, 45, 50, 52]);
      return q({
        prompt: t.eAskBus(b, s),
        answer: b * s,
        solution: t.eSolTwoFactor(b, t.eSubjects.buses, s, b * s, t.eSeats),
        traps: [{ value: b + s, why: t.etAddedNotMultiplied }],
        tip: "chain-the-factors",
      });
    }

    const s = rng.pick([20, 25, 30, 40, 50]);
    const b = rng.pick([24, 30, 36, 40]);
    return q({
      prompt: t.eAskShelves(s, b),
      answer: s * b,
      solution: t.eSolTwoFactor(s, t.eSubjects.shelves, b, s * b, t.eBooks),
      traps: [{ value: s + b, why: t.etAddedNotMultiplied }],
      tip: "chain-the-factors",
    });
  }

  if (level === 2) {
    const shape = rng.pick(["tuners", "fuel", "coffee", "tiles"]);

    if (shape === "tuners") {
      const got = until(rng, 40, (r) => {
        const P = r.pick([300, 400, 600, 800, 900]);
        const A = r.pick([100, 150, 200]);
        const S = r.pick([500, 600, 800]);
        const shops = r.pick([12, 18, 25, 40]);     // nothing to do with the answer
        return { P, A, S, shops, pianos: (P * 1000) / A, answer: (P * 1000) / A / S };
      });
      if (got) {
        return q({
          prompt: t.eAskTuners(got.S, got.P, got.shops, got.A),
          answer: got.answer,
          solution: t.eSolTuners(got.P, got.P * 1000, got.A, got.pianos, got.S, got.answer)
            + " " + t.eIgnored(t.eNoise.shops),
          traps: [
            { value: got.pianos, why: t.etTunersPianos },
            { value: got.P * 1000, why: t.etTunersPeople },
          ],
          tip: "chain-the-factors",
        });
      }
    }

    if (shape === "fuel") {
      const pop = rng.pick([9, 12, 20, 30]);        // thousand people, and noise
      const N = rng.pick([2000, 4000, 5000, 8000]);
      const K = rng.pick([800, 1000, 1200, 1500]);  // a month, not a year
      const L = rng.pick([6, 7, 8, 9]);
      const year = K * 12;
      return q({
        prompt: t.eAskFuel(pop, N, L, K),
        answer: (N * year * L) / 100,
        solution: t.eSolFuel(K, year, N, N * year, L, (N * year * L) / 100)
          + " " + t.eIgnored(t.eNoise.people),
        traps: [
          { value: (N * K * L) / 100, why: t.etFuelMonth },
          { value: N * year, why: t.etFuelDistance },
          { value: N * year * L, why: t.etFuelPerHundred },
        ],
        tip: "chain-the-factors",
      });
    }

    if (shape === "coffee") {
      const n = rng.pick([8, 10, 12, 15]);
      const h = rng.pick([8, 10, 12]);
      const d = rng.pick([5, 6, 7]);
      const tables = rng.pick([8, 12, 14, 20]);     // noise
      return q({
        prompt: t.eAskCoffee(tables, n, h, d),
        answer: n * h * d,
        solution: t.eSolCoffee(n, h, n * h, d, n * h * d) + " " + t.eIgnored(t.eNoise.tables),
        traps: [{ value: n * h, why: t.etCoffeeOneDay }, { value: n * d, why: t.etCoffeeNoHours }],
        tip: "chain-the-factors",
      });
    }

    const w = rng.pick([4, 5, 6, 8]);
    const l = rng.pick([5, 6, 8, 10]);
    const per = rng.pick([4, 9, 16, 25]);
    const high = rng.pick([3, 4]);                  // a floor does not care
    return q({
      prompt: t.eAskTiles(w, l, high, per),
      answer: w * l * per,
      solution: t.eSolTiles(w, l, w * l, per, w * l * per) + " " + t.eIgnored(t.eNoise.ceiling),
      traps: [{ value: w * l, why: t.etTilesArea }, { value: 2 * (w + l), why: t.etTilesPerimeter }],
      tip: "chain-the-factors",
    });
  }

  const shape = rng.pick(["eggs", "water", "flights", "barbers", "packing", "packing"]);

  if (shape === "packing") {
    // Volume over volume, with the two given in different units. Nothing here is
    // a new idea; what makes it hard is that four separate things have to go
    // right and a single slipped factor of a hundred ruins it.
    const box = rng.pick([[40, 30, 25], [50, 40, 20], [60, 50, 40], [25, 20, 20]]);
    const hold = rng.pick([[12, 2, 3], [12, 2, 2], [6, 2, 3], [12, 3, 3]]);
    const kg = rng.pick([8, 12, 15, 20]);           // weight is ruled out by the question
    const boxCm = box[0] * box[1] * box[2];
    const holdM = hold[0] * hold[1] * hold[2];
    return q({
      prompt: t.eAskPacking(hold[0], hold[1], hold[2], box[0], box[1], box[2], kg),
      answer: (holdM * 1000000) / boxCm,
      solution: t.eSolPacking(hold[0], hold[1], hold[2], holdM, box[0], box[1], box[2],
                              boxCm, holdM * 1000000, (holdM * 1000000) / boxCm)
        + " " + t.eIgnored(t.eNoise.weight),
      traps: [
        { value: holdM / (boxCm / 1000000) / 1000, why: t.etPackingThousand },
        { value: Math.round(holdM / (box[0] / 100)), why: t.etPackingOneEdge },
      ],
      tip: "chain-the-factors",
    });
  }

  if (shape === "eggs") {
    const P = rng.pick([40, 60, 90, 100, 120]);
    const e = rng.int(2, 5);
    const farms = rng.pick([3, 6, 9, 14]);          // thousand farms, and noise
    return q({
      prompt: t.eAskEggs(P, farms, e),
      answer: P * e * 52,
      solution: t.eSolEggs(P, e, P * e, P * e * 52) + " " + t.eIgnored(t.eNoise.farms),
      traps: [
        { value: P * e, why: t.etEggsWeek },
        { value: P * e * 365, why: t.etEggsDays },
      ],
      tip: "chain-the-factors",
    });
  }

  if (shape === "water") {
    const P = rng.pick([100, 200, 400, 500, 800]);
    const l = rng.pick([120, 150, 200, 250]);
    const res = rng.pick([3, 4, 6, 8]);             // reservoirs, and noise
    return q({
      prompt: t.eAskWater(P, res, l),
      answer: P * l,
      solution: t.eSolWater(P, l, P * 1000 * l, P * l) + " " + t.eIgnored(t.eNoise.reservoirs),
      traps: [
        { value: P * 1000 * l, why: t.etWaterLitres },
        { value: P * 1000, why: t.etWaterPeople },
      ],
      tip: "chain-the-factors",
    });
  }

  if (shape === "flights") {
    const got = until(rng, 40, (r) => {
      const F = r.pick([400, 600, 800, 1000]);
      const s = r.pick([150, 180, 200]);
      const pct = r.pick([70, 75, 80, 90]);
      const staff = r.pick([4, 6, 9, 12]);          // thousand staff, and noise
      const perFlight = (s * pct) / 100;
      // Half a passenger on a plane is not an estimate, it is a typo with a
      // reason. Redraw rather than print one.
      if (!Number.isInteger(perFlight)) return null;
      // Asked for a week, so the student has to reach for the 7 themselves.
      return { F, s, pct, staff, perFlight, answer: ((F * s * pct) / 100) * 7 };
    });
    if (got) {
      return q({
        prompt: t.eAskFlights(got.F, got.staff, got.s, got.pct),
        answer: got.answer,
        solution: t.eSolFlights(got.s, got.pct, got.perFlight, got.F,
                                got.F * got.perFlight, got.answer)
          + " " + t.eIgnored(t.eNoise.staff),
        traps: [
          { value: got.F * got.perFlight, why: t.etFlightsOneDay },
          { value: got.F * got.s * 7, why: t.etFlightsSeats },
          { value: got.perFlight, why: t.etFlightsOneFlight },
        ],
        tip: "chain-the-factors",
      });
    }
  }

  const got = until(rng, 60, (r) => {
    const P = r.pick([120, 200, 240, 300, 400]);      // thousands of people
    const w = r.pick([6, 8, 10, 12]);                  // weeks between haircuts
    const c = r.pick([10, 12, 15]);                    // cuts a day
    const d = r.pick([5, 6]);                          // days a week
    const shops = r.pick([14, 22, 35, 60]);            // noise
    const cuts = (P * 1000) / w;                       // haircuts wanted each week
    return { P, w, c, d, shops, cuts, perBarber: c * d, answer: cuts / (c * d) };
  });
  if (got) {
    return q({
      prompt: t.eAskBarbers(got.c, got.d, got.P, got.shops, got.w),
      answer: got.answer,
      solution: t.eSolBarbers(got.P, got.P * 1000, got.w, got.cuts, got.c, got.d, got.perBarber, got.answer)
        + " " + t.eIgnored(t.eNoise.barbershops),
      traps: [
        { value: got.cuts, why: t.etBarbersCuts },
        { value: got.perBarber, why: t.etBarbersOneBarber },
      ],
      tip: "chain-the-factors",
    });
  }

  // The pools above always yield something; this only runs if one is edited badly.
  const P = rng.pick([100, 200, 400]);
  const l = rng.pick([150, 200]);
  return q({
    prompt: t.eAskWater(P, l),
    answer: P * l,
    solution: t.eSolWater(P, l, P * 1000 * l, P * l),
    traps: [{ value: P * 1000 * l, why: t.etWaterLitres }],
    tip: "chain-the-factors",
  });
}

export const ESTIMATION = {
  "est.scale": scale,
  "est.fermi": fermi,
};
