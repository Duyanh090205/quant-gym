/**
 * Engine tests. Run with `npm test` (Node 18+, no dependencies).
 *
 * The important ones are not "does it run" but:
 *   - the same seed reproduces the same paper, which classroom assignments need;
 *   - every trap is far enough from the answer that marking can tell them apart;
 *   - answers agree with a formula written independently of the generator.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  generate, generateSet, generateExam, GENERATOR_IDS,
  grade, gradeSet, displayAnswer,
  CURRICULUM, EXAMS, ALL_SKILLS, TIPS, getTip, tipsForSkill,
  frac, makeCode, makeRng,
} from "../src/engine/index.js";

const LEVELS = [1, 2, 3];
const REAL_SKILLS = ALL_SKILLS.map((s) => s.id);

/* ── determinism ─────────────────────────────────────────────────────────── */

test("the same seed reproduces the same paper", () => {
  for (const skill of ["arith.mixed", "prob.mixed", "seq.odd-one-out", "arith.squares"]) {
    const a = generateSet({ skill, level: 2, count: 12, seed: "QG-CLASS-1" });
    const b = generateSet({ skill, level: 2, count: 12, seed: "QG-CLASS-1" });
    assert.deepEqual(
      a.questions.map((q) => [q.prompt, q.answer]),
      b.questions.map((q) => [q.prompt, q.answer]),
      `${skill} is not reproducible`
    );
  }
});

test("different seeds give different papers", () => {
  const a = generateSet({ skill: "arith.mixed", level: 2, count: 20, seed: "one" });
  const b = generateSet({ skill: "arith.mixed", level: 2, count: 20, seed: "two" });
  const same = a.questions.filter((q, i) => q.prompt === b.questions[i].prompt).length;
  assert.ok(same < 5, `papers overlap too much: ${same}/20 identical`);
});

test("assignment codes are stable and well formed", () => {
  assert.equal(makeCode("seed-a"), makeCode("seed-a"));
  assert.match(makeCode("seed-a"), /^QG-[2-9A-HJ-NP-Z]{4}$/);
  assert.notEqual(makeCode("seed-a"), makeCode("seed-b"));
});

/* ── shape ───────────────────────────────────────────────────────────────── */

test("every skill and level produces well-formed questions", () => {
  for (const skill of REAL_SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `shape|${skill}|${level}` });
      assert.equal(questions.length, 40, `${skill} L${level} came up short`);
      for (const q of questions) {
        assert.ok(q.prompt && typeof q.prompt === "string", `${skill}: empty prompt`);
        assert.ok(q.answer !== undefined && q.answer !== null, `${skill}: no answer`);
        if (typeof q.answer === "number") {
          assert.ok(isFinite(q.answer), `${skill}: non-finite answer for "${q.prompt}"`);
        }
        assert.ok(!/undefined|NaN|\[object/.test(q.prompt), `${skill}: broken prompt "${q.prompt}"`);
        assert.ok(!/undefined|NaN/.test(displayAnswer(q)), `${skill}: broken answer display for "${q.prompt}"`);
        assert.equal(q.level, level);
      }
    }
  }
});

test("probabilities lie in [0,1] and expectations are positive", () => {
  for (const skill of REAL_SKILLS.filter((s) => s.startsWith("prob."))) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 60, seed: `range|${skill}|${level}` });
      for (const q of questions) {
        if (q.format === "probability") {
          assert.ok(q.answer >= 0 && q.answer <= 1, `${skill}: P = ${q.answer} for "${q.prompt}"`);
        } else {
          assert.ok(q.answer > 0, `${skill}: E = ${q.answer} for "${q.prompt}"`);
        }
      }
    }
  }
});

/* ── marking ─────────────────────────────────────────────────────────────── */

test("a correct answer is accepted however it is written", () => {
  for (const skill of REAL_SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 30, seed: `mark|${skill}|${level}` });
      for (const q of questions) {
        if (q.format === "letter") {
          assert.ok(grade(q, q.answer).correct, `${skill}: letter answer rejected`);
          assert.ok(grade(q, q.answer.toUpperCase()).correct, `${skill}: upper-case letter rejected`);
          continue;
        }
        if (q.format === "odd-term" || q.format === "letter-term" || typeof q.answer === "string") {
          assert.ok(grade(q, q.answer).correct, `${skill}: exact answer rejected: ${q.answer}`);
          assert.ok(grade(q, ` ${String(q.answer).toLowerCase()} `).correct, `${skill}: spacing or case rejected`);
          continue;
        }
        assert.ok(grade(q, String(q.answer)).correct, `${skill}: exact value rejected for "${q.prompt}"`);
        if (q.format === "probability") {
          assert.ok(grade(q, frac(q.answer)).correct, `${skill}: fraction form rejected for "${q.prompt}"`);
          const twoDp = String(Math.round(q.answer * 100) / 100);
          assert.ok(grade(q, twoDp).correct, `${skill}: 2-dp rounding ${twoDp} rejected for "${q.prompt}"`);
          if (q.answer > 0 && q.answer < 1) {
            assert.ok(grade(q, (q.answer * 100).toFixed(2) + "%").correct, `${skill}: percent form rejected`);
          }
        }
        if (Number.isInteger(q.answer) && q.answer >= 1000) {
          assert.ok(grade(q, q.answer.toLocaleString("en-US")).correct, `${skill}: thousands comma rejected`);
        }
      }
    }
  }
});

test("blank scores zero and is reported as blank, not wrong", () => {
  const q = generate("arith.squares", 2, "blank");
  const r = grade(q, "");
  assert.equal(r.answered, false);
  assert.equal(r.correct, false);
  const set = gradeSet([q, q], ["", String(q.answer)]);
  assert.equal(set.blank, 1);
  assert.equal(set.wrong, 0);
  assert.equal(set.score, 1);
});

test("every trap is distinguishable from the answer and explains itself", () => {
  let checked = 0;
  for (const skill of REAL_SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `trap|${skill}|${level}` });
      for (const q of questions) {
        for (const t of q.traps || []) {
          if (!isFinite(t.value)) continue;
          assert.ok(t.why && t.why.length > 15, `${skill}: trap ${t.value} has no explanation`);
          const r = grade(q, String(t.value));
          assert.equal(r.correct, false,
            `${skill}: trap ${t.value} is marked correct against answer ${q.answer} for "${q.prompt}"`);
          assert.ok(r.trap, `${skill}: trap ${t.value} was not recognised as a trap`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 2000, `only ${checked} traps checked`);
});

test("a wrong answer that is not a trap is still marked wrong, with no false explanation", () => {
  const q = generate("arith.add-subtract", 2, "wrong");
  const r = grade(q, String(q.answer + 12345));
  assert.equal(r.correct, false);
  assert.equal(r.trap, null);
  assert.equal(r.why, null);
});

/* ── answers checked against independent formulas ────────────────────────── */

const closeTo = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: got ${a}, expected ${b}`);

test("probability answers agree with formulas written separately", () => {
  let checked = 0;
  for (const skill of REAL_SKILLS.filter((s) => s.startsWith("prob."))) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 120, seed: `formula|${skill}|${level}` });
      for (const q of questions) {
        const p = q.prompt;
        let m;

        if ((m = p.match(/two fair dice\. Probability the sum is (\d+)/))) {
          closeTo(q.answer, (6 - Math.abs(+m[1] - 7)) / 36, `dice sum ${m[1]}`); checked++;
        } else if ((m = p.match(/A holds (\d+) coins and B holds (\d+)/))) {
          closeTo(q.answer, +m[1] / (+m[1] + +m[2]), "gambler's ruin"); checked++;
        } else if ((m = p.match(/urn holds (\d+) red and (\d+) blue balls\. You draw 2 without/))) {
          const r = +m[1], b = +m[2], N = r + b;
          closeTo(q.answer, (r * (r - 1)) / (N * (N - 1)), "two reds"); checked++;
        } else if ((m = p.match(/Urn A holds (\d+) blue and (\d+) red\. Urn B holds (\d+) blue and (\d+) red/))) {
          const rA = +m[2] / (+m[1] + +m[2]);
          const rB = +m[4] / (+m[3] + +m[4]);
          closeTo(q.answer, rB / (rA + rB), "Bayes urns"); checked++;
        } else if ((m = p.match(/sum is (\d+)\. Probability at least one die shows a 6/))) {
          closeTo(q.answer, 2 / (13 - +m[1]), "conditional dice"); checked++;
        } else if ((m = p.match(/flip it (?:once: heads|(\d+) times: all heads)/))) {
          const n = m[1] ? +m[1] : 1;
          closeTo(q.answer, 1 / 2 ** n / (1 / 2 ** n + 1), "three-coin box"); checked++;
        } else if ((m = p.match(/(\d+) letters are placed at random into \d+ addressed envelopes\. Probability that (no letter|at least one letter)/))) {
          const n = +m[1];
          const D = { 3: 2, 4: 9, 5: 44 }[n];
          const none = D / [1, 1, 2, 6, 24, 120][n];
          closeTo(q.answer, m[2] === "no letter" ? none : 1 - none, "derangement"); checked++;
        } else if ((m = p.match(/each step \+1 or −1 with probability ½\. Probability of standing back at the start after (\d+) steps/))) {
          const n = +m[1] / 2;
          const c = [1, 2, 6, 20][n]; // C(2n, n) for n = 0..3
          closeTo(q.answer, c / 4 ** n, "random walk return"); checked++;
        } else if ((m = p.match(/(\d+) independent Uniform\[0,1\] values are drawn in order\. Probability the \w+ one is the largest/))) {
          closeTo(q.answer, 1 / +m[1], "position is max"); checked++;
        }
      }
    }
  }
  assert.ok(checked > 300, `only ${checked} answers cross-checked, expected many more`);
});

test("at-least-one questions equal one minus none", () => {
  const P = { "a 6": 1 / 6, "a head": 1 / 2, "a heart": 1 / 4 };
  let checked = 0;
  const { questions } = generateSet({ skill: "prob.counting", level: 3, count: 200, seed: "atleast" });
  for (const q of questions) {
    const m = q.prompt.match(/(?:Roll a fair die|Flip a fair coin|Draw a card with replacement) (\d+) times\. Probability of at least one (6|head|heart)/);
    if (!m) continue;
    const p = P["a " + m[2]];
    closeTo(q.answer, 1 - (1 - p) ** +m[1], "at least one");
    checked++;
  }
  assert.ok(checked > 100, `only ${checked} checked`);
});

/* ── worked solutions ────────────────────────────────────────────────────── */

test("every question carries a worked solution using its own numbers", () => {
  for (const skill of REAL_SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `sol|${skill}|${level}` });
      for (const q of questions) {
        assert.ok(q.solution, `${skill} L${level}: no solution for "${q.prompt}"`);
        assert.ok(q.solution.length > 25, `${skill}: solution too thin for "${q.prompt}": ${q.solution}`);
        assert.ok(!/undefined|NaN|\[object|\+ -\d/.test(q.solution),
          `${skill}: broken solution for "${q.prompt}": ${q.solution}`);
      }
    }
  }
});

test("the solution reaches the student on every wrong answer, trap or not", () => {
  for (const skill of REAL_SKILLS) {
    const { questions } = generateSet({ skill, level: 2, count: 20, seed: `reach|${skill}` });
    for (const q of questions) {
      const nonsense = q.format === "letter" ? "z" : "-999999";
      const r = grade(q, nonsense);
      assert.equal(r.correct, false);
      assert.equal(r.trap, null, `${skill}: nonsense should not match a trap`);
      assert.ok(r.solution, `${skill}: an unrecognised wrong answer got no solution`);
    }
    // and a blank still carries it, so a review screen can teach from skipped questions
    assert.ok(grade(questions[0], "").solution);
  }
});

test("explanations stay inside a beginner's vocabulary", () => {
  // Words a fifteen-year-old meeting this for the first time will not know.
  // If one is genuinely needed, the sentence has to define it on the spot.
  const BANNED = [
    [/martingale/i, "martingale"],
    [/likelihood/i, "likelihood"],
    [/prior/i, "prior"],
    [/harmonic/i, "harmonic"],
    [/complement/i, "complement"],
    [/derangement/i, "derangement"],
    [/i\.i\.d|independent and identically/i, "iid"],
    [/sample space/i, "sample space"],
  ];
  const offenders = [];
  for (const skill of REAL_SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `plain|${skill}|${level}` });
      for (const q of questions) {
        const texts = [q.solution, q.note, ...(q.traps || []).map((t) => t.why)].filter(Boolean);
        for (const text of texts) {
          for (const [re, word] of BANNED) {
            if (re.test(text)) offenders.push(`${skill}: "${word}" in — ${text.slice(0, 80)}`);
          }
        }
        // C(n,k) is fine, but only when the sentence says what it means.
        if (/C\(\d+,\s*\d+\)/.test(q.solution) && !/ways to choose/i.test(q.solution)) {
          offenders.push(`${skill}: C(n,k) used without explaining it — ${q.solution.slice(0, 80)}`);
        }
      }
    }
  }
  assert.deepEqual(offenders.slice(0, 6), [], `${offenders.length} jargon uses`);
});

test("every tip says when to reach for it", () => {
  // Knowing seven probability ideas is worth nothing without knowing which one
  // a question is asking for. That recognition is the skill being taught, so it
  // is a required field on the card, not a nice-to-have.
  for (const t of TIPS) {
    for (const lang of ["en", "vi"]) {
      const { when } = getTip(t.id, lang);
      assert.ok(when, `${t.id} (${lang}) does not say when to use it`);
      assert.ok(when.length > 25, `${t.id} (${lang}): trigger too vague - ${when}`);
      assert.ok(/[.?"]$/.test(when.trim()), `${t.id} (${lang}): trigger is not a sentence - ${when}`);
    }
  }
});

test("a tip title names the move, not the formula", () => {
  // "Fair ruin is i/N, and going first is 1/(2 - p)" is a crib sheet: it states
  // two results, uses three symbols it never introduces, and helps only someone
  // who already knows the material. A title has to be something you DO.
  for (const t of TIPS) {
    for (const lang of ["en", "vi"]) {
      const { title } = getTip(t.id, lang);
      assert.ok(!/=|\/\(/.test(title), `${t.id} (${lang}): the title is a formula — ${title}`);
      assert.ok(title.length < 90, `${t.id} (${lang}): title too long — ${title}`);
    }
  }
});

test("tip cards avoid the same jargon, in both languages", () => {
  // Same bar as the solutions, plus the Vietnamese habit of leaving English
  // statistics terms untranslated, which helps nobody who is stuck.
  const BANNED = [
    /martingale/i, /likelihood/i, /prior[s]?/i, /harmonic/i,
    /derangement/i, /sample space/i, /posterior/i,
    /commute[sd]?/i, /infinite series/i, /converge/i,
  ];
  const offenders = [];
  for (const t of TIPS) {
    for (const lang of ["en", "vi"]) {
      const card = getTip(t.id, lang);
      const all = [card.title, card.why, ...card.examples.flatMap((e) => [e.ask, e.work]), ...card.steps].join(" ");
      for (const re of BANNED) {
        if (re.test(all)) offenders.push(`${t.id} (${lang}): ${all.match(re)[0]}`);
      }
    }
  }
  assert.deepEqual(offenders, [], "jargon in tip cards");
});

test("a worked solution arrives at the answer it claims", () => {
  // A solution that walks through numbers and never reaches the right one has
  // drifted from its question. Catch it by requiring the answer to appear.
  let checked = 0;
  for (const skill of REAL_SKILLS) {
    for (const level of LEVELS) {
      const { questions } = generateSet({ skill, level, count: 40, seed: `arrive|${skill}|${level}` });
      for (const q of questions) {
        if (typeof q.answer !== "number" || q.approx) continue;
        if (!Number.isInteger(q.answer)) continue;      // decimals get rounded in prose
        const shown = q.answer.toString();
        const withComma = q.answer.toLocaleString("en-US");
        assert.ok(q.solution.includes(shown) || q.solution.includes(withComma),
          `${skill}: solution never reaches ${q.answer} — ${q.prompt} — ${q.solution}`);
        checked++;
      }
    }
  }
  assert.ok(checked > 800, `only ${checked} solutions checked`);
});

/* ── sequences ───────────────────────────────────────────────────────────── */

test("odd one out has exactly one defensible answer", () => {
  for (const level of LEVELS) {
    const { questions } = generateSet({ skill: "seq.odd-one-out", level, count: 200, seed: `odd|${level}` });
    for (const q of questions) {
      assert.ok(q.terms.length >= 6, `too few terms: ${q.prompt}`);
      assert.equal(q.terms[q.position], q.answer, "answer is not the term at the stated position");
      assert.notEqual(q.position, 0, "the first term must never be the broken one");
      assert.equal(q.terms.filter((t) => t === q.answer).length, 1, `answer appears twice: ${q.prompt}`);
      assert.notEqual(q.answer, q.shouldBe, "the broken term equals the correct term");
      assert.ok(grade(q, q.answer).correct);
      assert.equal(grade(q, q.shouldBe).correct, false, "the corrected value must not be accepted");
      const other = q.terms.find((t) => t !== q.answer);
      assert.equal(grade(q, other).correct, false, "another term must not be accepted");
    }
  }
});

test("odd one out explains itself when missed", () => {
  const q = generate("seq.odd-one-out", 2, "explain");
  const r = grade(q, q.shouldBe);
  assert.equal(r.correct, false);
  assert.match(r.why, /should have been/);
});

/* ── papers and exams ────────────────────────────────────────────────────── */

test("a paper has no repeated prompt and is not dominated by one skill", () => {
  for (const skill of ["arith.mixed", "prob.mixed"]) {
    const { questions } = generateSet({ skill, level: 2, count: 30, seed: `mix|${skill}` });
    assert.equal(new Set(questions.map((q) => q.prompt)).size, 30, "duplicate prompt");
    const counts = {};
    for (const q of questions) counts[q.skill] = (counts[q.skill] || 0) + 1;
    const worst = Math.max(...Object.values(counts));
    assert.ok(worst <= 5, `${skill}: one skill took ${worst} of 30 slots`);
  }
});

test("the Maven paper matches the format that was actually sat", () => {
  const exam = generateExam("maven-round-1", "seed");
  assert.equal(exam.parts.length, 3);
  assert.deepEqual(exam.parts.map((p) => [p.questions.length, p.seconds]), [[50, 300], [20, 720], [15, 900]]);
  for (const part of exam.parts) {
    assert.equal(new Set(part.questions.map((q) => q.prompt)).size, part.questions.length);
  }
});

test("every exam listed can actually be generated", () => {
  for (const e of EXAMS) {
    const built = generateExam(e.id, "x");
    assert.equal(built.parts.length, e.parts.length);
    built.parts.forEach((p, i) => assert.equal(p.questions.length, e.parts[i].count));
  }
});

/* ── curriculum and tips ─────────────────────────────────────────────────── */

test("every curriculum skill has a generator and three levels", () => {
  for (const s of ALL_SKILLS) {
    assert.ok(GENERATOR_IDS.includes(s.id), `no generator for ${s.id}`);
    assert.equal(s.levels.length, 3, `${s.id} does not have three levels`);
    for (const lv of s.levels) {
      assert.ok(lv.pass <= lv.count, `${s.id}: pass mark above the question count`);
      assert.ok(lv.pass / lv.count >= 0.6, `${s.id}: mastery threshold is too soft`);
      assert.ok(lv.seconds / lv.count >= 3, `${s.id}: fewer than 3 seconds per question`);
    }
    assert.ok(s.name.en && s.name.vi, `${s.id} is missing a name in one language`);
  }
});

test("every tip exists in both languages and every referenced tip resolves", () => {
  for (const t of TIPS) {
    for (const lang of ["en", "vi"]) {
      const card = getTip(t.id, lang);
      assert.ok(card.title && card.steps.length && card.examples?.length, `${t.id} incomplete in ${lang}`);
      assert.ok(card.why, `${t.id} (${lang}): no "why it works"`);
      for (const ex of card.examples) {
        // Working on its own is an answer key, readable only by someone who
        // already knows the puzzle. State the question first.
        assert.ok(ex.ask, `${t.id} (${lang}): example does not state the question`);
        assert.ok(ex.work, `${t.id} (${lang}): example does not show the working`);
        // The question mark is the real guard: working alone never carries one.
        assert.match(ex.ask, /\?/, `${t.id} (${lang}): the example is not a question - ${ex.ask}`);
        // No length rule. Splitting the welded examples made the arithmetic
        // questions shorter, and "What is 48 x 5?" is a complete question.
        // One block, one question. Two question marks means two questions welded
        // together, which asks a beginner to track both at once.
        assert.equal((ex.ask.match(/\?/g) || []).length, 1,
          `${t.id} (${lang}): more than one question in a block - ${ex.ask}`);
        // A worked answer has to arrive at a number, not merely reject one.
        assert.match(ex.work, /[0-9]/, `${t.id} (${lang}): the working has no numbers - ${ex.work}`);
      }
    }
  }
  const ids = new Set(TIPS.map((t) => t.id));
  for (const skill of REAL_SKILLS) {
    const { questions } = generateSet({ skill, level: 2, count: 30, seed: `tips|${skill}` });
    for (const q of questions) {
      if (q.tip) assert.ok(ids.has(q.tip), `${skill} points at a tip that does not exist: ${q.tip}`);
    }
  }
});

test("tips are reachable from the skill they belong to", () => {
  const covered = new Set(TIPS.map((t) => t.skill));
  for (const s of covered) {
    assert.ok(tipsForSkill(s, "vi").length > 0, `${s} has no Vietnamese tips`);
  }
});

/* ── the RNG itself ──────────────────────────────────────────────────────── */

test("the seeded generator is uniform enough to build papers from", () => {
  const rng = makeRng("uniformity");
  const buckets = new Array(10).fill(0);
  for (let i = 0; i < 100000; i++) buckets[Math.floor(rng.float() * 10)]++;
  for (const b of buckets) assert.ok(b > 9000 && b < 11000, `bucket out of range: ${b}`);
});
