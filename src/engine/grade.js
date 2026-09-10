/**
 * Marking.
 *
 * One rule throughout: mark the value, not the spelling. A student who types
 * `0.33` for 1/3, or `1,234` for 1234, or `hs` for HS, has the answer. Making
 * them guess a format is testing the interface, not the maths.
 *
 * Every result carries the question's worked `solution`, and additionally a
 * `why` naming the specific mistake when the typed answer matches a known trap.
 * A student should never see only "wrong".
 */

import { parseAnswer, parseCandidates, near, normal, fmt, frac, LETTERS } from "./format.js";

/**
 * How the correct answer should be shown in a review screen.
 *
 * It follows the question's own language: a Vietnamese question that says 0,51
 * in its working must not answer itself with 0.51, or a student who is already
 * unsure reads two different numbers.
 */
export function displayAnswer(qn) {
  const dec = (text) => (qn.lang === "vi" ? String(text).replace(/\./g, ",") : String(text));
  switch (qn.format) {
    case "letter": {
      const i = LETTERS.indexOf(qn.answer);
      const label = qn.options?.[i];
      return label ? `(${qn.answer}) ${label}` : String(qn.answer);
    }
    case "odd-term":
      return `${qn.answer}`;
    case "probability": {
      const f = frac(qn.answer);
      const rounded = Math.round(qn.answer * 1000) / 1000;
      return f.includes("/") ? `${f}  ≈ ${dec(rounded)}` : dec(f);
    }
    default:
      return qn.approx ? `≈ ${dec(Math.round(qn.answer * 10) / 10)}` : dec(fmt(qn.answer));
  }
}

/**
 * Did this input hit one of the question's known traps?
 *
 * A trap fires only when the typed value would have been marked *correct* had
 * the trap been the answer: the same test `grade` runs below, against a
 * different target. Anything looser tells a student they made a particular
 * mistake they did not make, which is worse than saying nothing. On a fractions
 * question every answer lives between 0 and 10, so a fixed half-unit window
 * swallowed numbers that had nothing to do with the trap.
 */
function findTrap(qn, value) {
  if (!qn.traps?.length || typeof value !== "number") return null;
  const hits = (t) => (qn.approx ? near(value, t.value, 0.05, 0) : near(value, t.value, 0, 0.0051));
  return qn.traps.find((t) => isFinite(t.value) && hits(t)) || null;
}

/**
 * Mark one answer.
 *
 * @returns {{answered:boolean, correct:boolean, given:string, expected:string,
 *            trap:{value:number,why:string}|null, why:string|null}}
 */
export function grade(qn, raw) {
  const given = raw == null ? "" : String(raw).trim();
  // `why` names the mistake and is only there when we can identify it.
  // `solution` shows how the question is done and is always there.
  const base = {
    answered: given !== "", given, expected: displayAnswer(qn),
    trap: null, why: null, solution: qn.solution || null,
  };
  if (!base.answered) return { ...base, correct: false };

  const parsed = parseAnswer(given, qn.lang);
  // Both readings of an ambiguous comma, so 0,272 and 1,234 each work.
  const candidates = parseCandidates(given, qn.lang).filter((v) => typeof v === "number");

  // Multiple options labelled (a), (b)…: accept the letter or the option text.
  if (qn.format === "letter") {
    const i = LETTERS.indexOf(qn.answer);
    const correct =
      given.toLowerCase() === qn.answer ||
      (qn.options && normal(given) === normal(qn.options[i]));
    return { ...base, correct, why: correct ? null : qn.note || null };
  }

  // Odd one out: the answer is the offending term itself.
  if (qn.format === "odd-term") {
    const want = parseAnswer(qn.answer);
    const correct =
      typeof want === "number" && candidates.length
        ? candidates.some((v) => Math.abs(v - want) < 1e-9)
        : normal(given) === normal(qn.answer);
    let why = null;
    if (!correct) {
      why =
        normal(given) === normal(qn.shouldBe)
          ? `That is what the term should have been. The question asks for the value actually printed, which is ${qn.answer}.`
          : `${qn.answer} is the one that breaks the rule; in position ${qn.position + 1} the pattern needs ${qn.shouldBe}.`;
    }
    return { ...base, correct, why };
  }

  // Letter sequences: "HS", " hs ", "Hs" are the same answer.
  if (qn.format === "letter-term" || typeof qn.answer === "string") {
    return { ...base, correct: normal(given) === normal(qn.answer) };
  }

  if (typeof parsed !== "number" && !candidates.length) return { ...base, correct: false };

  // Probabilities accept two-decimal rounding: 0.33 is 1/3.
  const hits = (v) => (qn.approx ? near(v, qn.answer, 0.05, 0) : near(v, qn.answer, 0, 0.0051));
  if (candidates.some(hits)) return { ...base, correct: true };

  const trap = candidates.map((v) => findTrap(qn, v)).find(Boolean) || null;
  return { ...base, correct: false, trap, why: trap ? trap.why : null };
}

/** Mark a whole paper. Blanks score zero and are counted separately. */
export function gradeSet(questions, answers) {
  const results = questions.map((qn, i) => grade(qn, answers[i]));
  const score = results.filter((r) => r.correct).length;
  const answered = results.filter((r) => r.answered).length;
  const trapped = results.filter((r) => r.trap).length;
  return {
    results,
    score,
    total: questions.length,
    answered,
    blank: questions.length - answered,
    wrong: answered - score,
    trapped,
  };
}
