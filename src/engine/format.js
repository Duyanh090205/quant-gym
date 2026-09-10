/**
 * Number formatting and answer parsing.
 *
 * Students type answers, they do not pick from options. So the parser has to be
 * generous about how a human writes a number, and strict about what counts as
 * the same value.
 */

/** Round to 4 decimal places, dropping float noise like 0.30000000000000004. */
export const round4 = (x) => Math.round(x * 10000) / 10000;

/**
 * Write a number the way the reader's language writes it.
 *
 * Vietnamese marks the decimal with a comma, so 0.545 is 0,545. Grading accepts
 * either, but a card that shows one form while the questions show the other
 * looks careless, and to a student who is already unsure it looks like a
 * different number.
 *
 * The thousands separator is deliberately left out in both languages. English
 * 5,832 and Vietnamese 5.832 are each ambiguous with the other's decimal mark,
 * and a student reading fast does not need that.
 */
export function num(x, lang = "en") {
  if (typeof x === "string") return x;
  if (!isFinite(x)) return String(x);
  const text = Number.isInteger(x) ? String(x) : String(round4(x));
  return lang === "vi" ? text.replace(".", ",") : text;
}

/** The separator for a list of coordinates. A comma reads as a decimal in Vietnamese. */
export const pairSep = (lang = "en") => (lang === "vi" ? ";" : ",");

/** Display a number the way a person would write it. */
export function fmt(x) {
  if (typeof x === "string") return x;
  if (!isFinite(x)) return String(x);
  return Number.isInteger(x) ? String(x) : String(round4(x));
}

/**
 * Probabilities read better as fractions, expectations as decimals.
 * Anything below 1 is searched for a small denominator; 6/11 beats 0.545.
 */
export function frac(x, maxDen = 130) {
  if (!isFinite(x)) return String(x);
  if (x === 0) return "0";
  if (Math.abs(x) >= 1) return String(Math.round(x * 100) / 100);
  for (let d = 2; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (n !== 0 && Math.abs(n / d - x) < 1e-9) return `${n}/${d}`;
  }
  // Three decimals is fine for a half, and badly wrong for a fiftieth: 0.01157
  // shown as 0.012 is out by nearly 4%, which the question itself would mark
  // wrong. Below 0.05, keep four significant figures.
  if (Math.abs(x) < 0.05) return String(Number(x.toPrecision(4)));
  return String(Math.round(x * 1000) / 1000);
}

/**
 * Parse what the student typed.
 *
 * Understood: `1234`, `1,234`, `12.5`, `12,5` (comma decimal), `3/8`, `40%`,
 * leading `+`/`-`, stray spaces. Anything else comes back as an upper-cased
 * string, which is what letter-sequence answers need.
 *
 * Returns a number, a string, or null for empty input.
 */
export function parseAnswer(raw) {
  const all = parseCandidates(raw);
  return all.length ? all[0] : (raw == null || String(raw).trim() === "" ? null : String(raw).trim().toUpperCase());
}

/**
 * Every value the typed text could reasonably mean.
 *
 * A comma between digits is genuinely ambiguous across the two languages:
 * English `1,234` is one thousand two hundred and thirty-four, Vietnamese
 * `1,234` is one point two three four, and `0,272` can only be the second. So
 * both readings are returned and marking accepts either. A student should not
 * lose a mark because the parser guessed the wrong convention.
 *
 * Returns numbers, or a single upper-cased string for letter answers.
 */
export function parseCandidates(raw) {
  if (raw == null) return [];
  let s = String(raw).trim();
  if (!s) return [];

  s = s.replace(/\s+/g, "");
  const isPercent = s.endsWith("%");
  if (isPercent) s = s.slice(0, -1);

  const readings = new Set();
  if (s.includes(".")) {
    // A dot is already doing the decimal work, so any comma groups thousands.
    readings.add(s.replace(/,/g, ""));
  } else if (s.includes(",")) {
    readings.add(s.replace(/,/g, ""));      // English: a thousands separator
    readings.add(s.replace(/,/g, "."));     // Vietnamese: a decimal mark
  } else {
    readings.add(s);
  }

  const out = [];
  for (const text of readings) {
    if (!/^[-+]?[\d.]*\/?[-+]?[\d.]+$/.test(text)) continue;
    let v;
    if (text.includes("/")) {
      const [n, d] = text.split("/");
      v = parseFloat(n) / parseFloat(d);
    } else {
      v = parseFloat(text);
    }
    if (isFinite(v)) out.push(isPercent ? v / 100 : v);
  }
  return out.length ? out : [String(raw).trim().toUpperCase()];
}

/** Compare with both a relative and an absolute tolerance. */
export function near(a, b, rel = 0, abs = 0.0051) {
  return Math.abs(a - b) <= Math.max(abs, rel * Math.abs(b));
}

/** Normalise a typed string for letter answers: "  hs " and "HS" are equal. */
export const normal = (s) => String(s).trim().replace(/\s+/g, "").toUpperCase();

export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LETTERS = "abcdefghij";

/** n! for the small n this engine uses. */
export function fact(n) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/** Binomial coefficient. */
export function choose(n, k) {
  if (k < 0 || k > n) return 0;
  return fact(n) / (fact(k) * fact(n - k));
}

/** Ordinal suffix: 1 → "1st". Used in question prompts. */
export function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
