/**
 * A small evaluator for the notation this project prints.
 *
 * Written for the tip cards, now shared with the generated solutions, which are
 * the far bigger surface: twenty-four cards versus thousands of worked lines in
 * two languages, every one of them assembled from templates at run time.
 *
 * It parses ×, ÷, ², ³, !, %, ≈, brackets and fractions, and it knows that a
 * comma marks a decimal in Vietnamese and groups thousands in English.
 * Everything it cannot read is reported rather than skipped, so a caller can
 * fail when the share it could not parse grows large enough to make the check
 * hollow.
 */

const isDigit = (c) => c >= "0" && c <= "9";

function tokenize(src, lang) {
  const thousands = lang === "vi" ? "." : ",";
  const decimal = lang === "vi" ? "," : ".";
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === " ") { i++; continue; }
    if (isDigit(c)) {
      let text = "";
      while (i < src.length) {
        const d = src[i];
        if (isDigit(d)) { text += d; i++; continue; }
        if (d === thousands && /^\d{3}(?!\d)/.test(src.slice(i + 1))) { i++; continue; }
        if (d === decimal && isDigit(src[i + 1])) { text += "."; i++; continue; }
        break;
      }
      out.push({ t: "num", v: parseFloat(text) });
      continue;
    }
    if ("+-−*×·/÷^()²³!%".includes(c)) { out.push({ t: c }); i++; continue; }
    return null;
  }
  return out;
}

function parseExpr(ts, pos) {
  let r = parseTerm(ts, pos);
  if (!r) return null;
  let { value, next } = r;
  while (next < ts.length && (ts[next].t === "+" || ts[next].t === "-" || ts[next].t === "−")) {
    const op = ts[next].t;
    const rhs = parseTerm(ts, next + 1);
    if (!rhs) return null;
    value = op === "+" ? value + rhs.value : value - rhs.value;
    next = rhs.next;
  }
  return { value, next };
}

function parseTerm(ts, pos) {
  let r = parsePower(ts, pos);
  if (!r) return null;
  let { value, next } = r;
  while (next < ts.length && ["*", "×", "·", "/", "÷"].includes(ts[next].t)) {
    const op = ts[next].t;
    const rhs = parsePower(ts, next + 1);
    if (!rhs) return null;
    if (op === "/" || op === "÷") {
      if (rhs.value === 0) return null;
      value /= rhs.value;
    } else {
      value *= rhs.value;
    }
    next = rhs.next;
  }
  return { value, next };
}

function parsePower(ts, pos) {
  const base = parseUnary(ts, pos);
  if (!base) return null;
  if (base.next < ts.length && ts[base.next].t === "^") {
    const exp = parsePower(ts, base.next + 1);
    if (!exp) return null;
    return { value: base.value ** exp.value, next: exp.next };
  }
  return base;
}

function parseUnary(ts, pos) {
  let sign = 1;
  let i = pos;
  while (i < ts.length && (ts[i].t === "-" || ts[i].t === "−")) { sign = -sign; i++; }
  let r;
  if (i < ts.length && ts[i].t === "num") {
    r = { value: ts[i].v, next: i + 1 };
  } else if (i < ts.length && ts[i].t === "(") {
    const inner = parseExpr(ts, i + 1);
    if (!inner || inner.next >= ts.length || ts[inner.next].t !== ")") return null;
    r = { value: inner.value, next: inner.next + 1 };
  } else {
    return null;
  }
  while (r.next < ts.length && ["²", "³", "!", "%"].includes(ts[r.next].t)) {
    const op = ts[r.next].t;
    if (op === "²") r.value = r.value ** 2;
    else if (op === "³") r.value = r.value ** 3;
    else if (op === "%") r.value = r.value / 100;
    else {
      if (!Number.isInteger(r.value) || r.value < 0 || r.value > 20) return null;
      let f = 1;
      for (let k = 2; k <= r.value; k++) f *= k;
      r.value = f;
    }
    r.next++;
  }
  if (sign === -1) r.value = -r.value;
  return r;
}

/** Evaluate a whole expression, or null if it is not one. */
export function evaluate(text, lang = "en") {
  const ts = tokenize(text, lang);
  if (!ts || !ts.length) return null;
  const r = parseExpr(ts, 0);
  if (!r || r.next !== ts.length) return null;
  return Number.isFinite(r.value) ? r.value : null;
}

/** A run of characters that could be maths. */
export const RUN = /[0-9(][0-9()\s+\-−*×·/÷^²³!%.,≈=]*[0-9)²³!%]/g;

/**
 * Every `a = b = c` chain inside a piece of prose.
 *
 * Text holding a `?` placeholder is skipped whole: "8 × 240 = 24 × ?" is a
 * puzzle for the reader, and the ? never survives into a run, which would leave
 * "8 × 240 = 24" looking false.
 */
export function equations(text) {
  if (/[=×÷*+\-−/]\s*\?/.test(text)) return [];
  const found = [];
  for (const wholeRun of String(text).match(RUN) || []) {
    // A line may list several facts in one breath: "1/2 = 50%, 1/4 = 25%".
    // A comma followed by a space separates them; a comma inside a number is
    // never followed by a space, in either language.
    for (const run of wholeRun.split(/,\s+/)) {
      if (!/[=≈]/.test(run)) continue;
      const parts = run.split(/[=≈]/).map((s) => s.replace(/^[\s,.]+|[\s,.]+$/g, "")).filter(Boolean);
      if (parts.length >= 2) found.push({ parts, approx: run.includes("≈"), run: run.trim() });
    }
  }
  return found;
}

/**
 * Check every equation in a piece of prose.
 *
 * @returns {{checked:number, unreadable:number, bad:string[]}}
 */
export function checkEquations(text, lang = "en", label = "") {
  let checked = 0, unreadable = 0;
  const bad = [];
  for (const eq of equations(text)) {
    const values = eq.parts.map((p) => evaluate(p, lang));
    if (values.some((v) => v === null)) { unreadable++; continue; }
    const tol = eq.approx
      ? Math.max(Math.abs(values[0]) * 0.01, 1e-9)
      : Math.max(Math.abs(values[0]) * 1e-9, 1e-9);
    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - values[0]) > tol) {
        bad.push(`${label}: ${eq.run}  →  ${values.join(" vs ")}`);
      }
    }
    checked++;
  }
  return { checked, unreadable, bad };
}
