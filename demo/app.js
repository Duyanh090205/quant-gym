/**
 * Quant Gym demo shell.
 *
 * Deliberately plain: vanilla DOM, no framework, no build step. Its job is to
 * show what the engine can do and to act as a reference for the React module
 * that will live inside the host application. Everything interesting happens in
 * `src/engine`; this file only draws it.
 *
 * Note how little state there is. Progress here goes to `localStorage` purely so
 * the demo remembers itself between refreshes. In a real integration the host
 * owns progress: it passes `initialProgress` in and listens for events out.
 */

import {
  CURRICULUM, generateSet, generateExam, EXAMS, grade, gradeSet,
  displayAnswer, getTip, getSkill, skillName, nextSkill, TIPS,
  generateReview, weakSpots, accumulate,
} from "../src/engine/index.js";

/* ── translations for the shell itself ───────────────────────────────────── */
const T = {
  en: {
    tagline: "Mental maths, sequences and probability, the way trading firms ask them.",
    ladder: "The ladder", practice: "Practice", noClock: "no clock, feedback every question",
    beatClock: "Beat the clock", mastered: "mastered", level: "Level",
    back: "Back", next: "Next question", check: "Check", submit: "Submit",
    yourAnswer: "your answer", correct: "Correct", notQuite: "Not quite",
    answerIs: "The answer is", score: "Score", blank: "blank", trapped: "known mistakes",
    timeLeft: "time left", review: "Review", again: "Again", exams: "Full papers",
    startExam: "Start", part: "Part", of: "of", questions: "questions",
    done: "Level cleared", needed: "needed to clear", tipTitle: "The trick",
    howItsDone: "How it's done", seeIt: "How to see it", useWhen: "Use it when",
    worked: "Worked example",
    weakTitle: "Practise your weak spots",
    weakBlurb: (list) => `Twelve questions drawn from what you are getting wrong: ${list}.`,
    weakLocked: "Run a timed section or two and this fills itself in.",
    weakStart: "Start",
    reviewDone: "Weak-spot practice",
    whichOne: "Which idea does a question want?",
    whyItWorks: "Why it works", blankWarn: (n) => `${n} still blank. A blank is a guaranteed zero, so guess.`,
    autoSubmit: "Runs out on its own. Nothing is deducted for a wrong answer.",
    typeHint: "Fractions like 3/8, decimals like 0.375, or 37.5% all count.",
  },
  vi: {
    tagline: "Tính nhẩm, dãy số và xác suất, đúng kiểu các công ty giao dịch hỏi.",
    ladder: "Cái thang", practice: "Luyện tập", noClock: "không đồng hồ, phản hồi từng câu",
    beatClock: "Chạy với đồng hồ", mastered: "đã thạo", level: "Cấp",
    back: "Quay lại", next: "Câu tiếp", check: "Kiểm tra", submit: "Nộp bài",
    yourAnswer: "bạn trả lời", correct: "Đúng", notQuite: "Chưa đúng",
    answerIs: "Đáp án là", score: "Điểm", blank: "bỏ trống", trapped: "lỗi đã biết",
    timeLeft: "thời gian còn", review: "Xem lại", again: "Làm lại", exams: "Đề đầy đủ",
    startExam: "Bắt đầu", part: "Phần", of: "trên", questions: "câu",
    done: "Đã qua cấp này", needed: "cần đúng để qua", tipTitle: "Mẹo",
    howItsDone: "Cách làm", seeIt: "Cách nhận ra", useWhen: "Dùng khi",
    worked: "Ví dụ có lời giải",
    weakTitle: "Luyện đúng chỗ yếu",
    weakBlurb: (list) => `Mười hai câu rút từ những chỗ bạn đang sai: ${list}.`,
    weakLocked: "Chạy vài phần có đồng hồ là mục này tự đầy lên.",
    weakStart: "Bắt đầu",
    reviewDone: "Luyện chỗ yếu",
    whichOne: "Câu hỏi đang cần ý nào?",
    whyItWorks: "Vì sao dùng được", blankWarn: (n) => `Còn ${n} ô trống. Bỏ trống chắc chắn 0 điểm, nên cứ đoán.`,
    autoSubmit: "Hết giờ tự nộp. Sai không bị trừ điểm.",
    typeHint: "Gõ phân số như 3/8, thập phân như 0.375, hay 37.5% đều được.",
  },
};

/* ── state ───────────────────────────────────────────────────────────────── */
const KEY = "quant-gym-demo-v1";
const STATS_KEY = "quant-gym-demo-stats-v1";
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

let S = {
  screen: "ladder",
  lang: (navigator.language || "en").startsWith("vi") ? "vi" : "en",
  progress: read(KEY),
  // Per skill and level: how many questions were answered and how many were
  // right. This is the whole input to weak-spot practice, and it is exactly the
  // shape a host would keep on its own server.
  stats: read(STATS_KEY),
};
const t = () => T[S.lang];
const tr = (obj) => (obj ? obj[S.lang] || obj.en : "");
const isMastered = (skill, level) => !!S.progress[`${skill}|${level}`];

/* ── tiny DOM helpers ────────────────────────────────────────────────────── */
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const btn = (label, cls, onClick) => {
  const b = el("button", cls, label);
  b.type = "button";
  b.onclick = onClick;
  return b;
};
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/** Only arithmetic has genuine shortcuts. The rest have ways of seeing. */
const isTrickTopic = (skillId) => String(skillId).startsWith("arith.");
const PREFIX = { arithmetic: "arith.", sequences: "seq.", probability: "prob." };
/** Word problems need prose type; bare arithmetic needs tabular figures. */
const isWordy = (q) => q.prompt.length > 40 || /[a-z]{4}/.test(q.prompt);

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(topbar());
  ({ ladder, level: levelScreen, drill, clock: clockScreen, results }[S.screen] || ladder)(app);
  window.scrollTo(0, 0);
}

function topbar() {
  const bar = el("div", "topbar");
  const brand = el("div", "brand");
  brand.appendChild(el("span", "eyebrow", "Quant Gym"));
  const heading = S.screen === "ladder" ? "Quant Gym"
    : S.review ? t().weakTitle
    : S.exam ? tr(S.exam.name)
    : skillName(S.skill, S.lang);
  brand.appendChild(el("h1", "", heading));
  if (S.screen === "ladder") brand.appendChild(el("p", "muted small", t().tagline));
  bar.appendChild(brand);

  const tools = el("div", "tools");
  if (S.screen !== "ladder") tools.appendChild(btn("← " + t().back, "", () => { stopTimer(); S.screen = "ladder"; render(); }));
  const seg = el("div", "seg");
  for (const lang of ["en", "vi"]) {
    const b = btn(lang.toUpperCase(), "", () => { S.lang = lang; render(); });
    b.setAttribute("aria-pressed", String(S.lang === lang));
    seg.appendChild(b);
  }
  tools.appendChild(seg);
  bar.appendChild(tools);
  return bar;
}

/* ── screen 1: the ladder ────────────────────────────────────────────────── */
function ladder(app) {
  for (const topic of CURRICULUM) {
    const box = el("div", "topic");
    const head = el("div", "topic-head");
    head.appendChild(el("h2", "", tr(topic.name)));
    head.appendChild(el("p", "muted small", tr(topic.blurb)));
    box.appendChild(head);

    // Knowing seven ideas is useless without knowing which one a question is
    // asking for, so put every trigger in one place, openable at any time.
    const cards = TIPS.filter((x) => x.skill.startsWith(PREFIX[topic.id])).map((x) => getTip(x.id, S.lang));
    if (cards.length) {
      const d = document.createElement("details");
      d.className = "recognise";
      const sum = document.createElement("summary");
      sum.textContent = t().whichOne;
      d.appendChild(sum);
      const list = el("div", "reclist");
      for (const c of cards) {
        const row = el("div", "recrow");
        row.appendChild(el("span", "recwhen", c.when || ""));
        row.appendChild(el("span", "rectitle", c.title));
        list.appendChild(row);
      }
      d.appendChild(list);
      box.appendChild(d);
    }

    const grid = el("div", "skills");
    for (const sk of topic.skills) {
      const card = el("div", "skill");
      const nameRow = el("div", "skill-name");
      nameRow.appendChild(el("h3", "", tr(sk.name)));
      const dots = el("div", "dots");
      for (let i = 1; i <= 3; i++) {
        const d = el("span", "dot");
        d.dataset.on = String(isMastered(sk.id, i));
        dots.appendChild(d);
      }
      nameRow.appendChild(dots);
      card.appendChild(nameRow);

      const levels = el("div", "levels");
      for (let i = 1; i <= 3; i++) {
        const b = btn(t().level + " " + i, "lvl", () => { S.skill = sk.id; S.level = i; S.screen = "level"; render(); });
        b.dataset.done = String(isMastered(sk.id, i));
        levels.appendChild(b);
      }
      card.appendChild(levels);
      grid.appendChild(card);
    }
    box.appendChild(grid);
    app.appendChild(box);
  }

  // Weak-spot practice sits above the exams: it is the thing to do next once
  // there is any history, and the ladder alone will not point you at it.
  const weak = weakSpots(S.stats, { limit: 4 });
  const wbox = el("div", "topic");
  const wcard = el("div", "skill");
  wcard.style.borderColor = weak.length ? "var(--accent)" : "var(--line)";
  wcard.appendChild(el("h3", "", t().weakTitle));
  if (weak.length) {
    const list = weak.map((w) => `${skillName(w.skill, S.lang)} ${Math.round(w.rate * 100)}%`).join(", ");
    wcard.appendChild(el("p", "muted small", t().weakBlurb(list)));
    wcard.appendChild(btn(t().weakStart, "primary", startReview));
  } else {
    wcard.appendChild(el("p", "muted small", t().weakLocked));
  }
  const wgrid = el("div", "skills");
  wgrid.appendChild(wcard);
  wbox.appendChild(wgrid);
  app.appendChild(wbox);

  const exams = el("div", "topic");
  exams.appendChild(el("h2", "", t().exams));
  const grid = el("div", "skills");
  for (const e of EXAMS) {
    const card = el("div", "skill");
    card.appendChild(el("h3", "", tr(e.name)));
    card.appendChild(el("p", "muted small", tr(e.note)));
    card.appendChild(btn(t().startExam, "primary", () => startExam(e.id)));
    grid.appendChild(card);
  }
  exams.appendChild(grid);
  app.appendChild(exams);
}

/* ── screen 2: the level, with its tip card ──────────────────────────────── */
function levelScreen(app) {
  const sk = getSkill(S.skill);
  const cfg = sk.levels[S.level - 1];
  const stack = el("div", "stack");

  const q0 = generateSet({ skill: S.skill, level: S.level, count: 1, seed: "tip" }).questions[0];
  const tip = q0.tip ? getTip(q0.tip, S.lang) : null;
  if (tip) {
    const card = el("div", "tip");
    // Arithmetic really does have tricks: a faster road to the same answer.
    // Probability has none. What it has is knowing which idea a question wants,
    // so promising a trick there sets up an expectation nothing can meet.
    card.appendChild(el("span", "eyebrow", isTrickTopic(S.skill) ? t().tipTitle : t().seeIt));
    card.appendChild(el("h3", "", tip.title));
    if (tip.when) {
      const w = el("p", "when");
      w.appendChild(el("strong", "", t().useWhen + " — "));
      w.appendChild(document.createTextNode(tip.when));
      card.appendChild(w);
    }
    const ol = el("ol");
    for (const step of tip.steps) ol.appendChild(el("li", "", step));
    card.appendChild(ol);
    // One block per question. The question first in ordinary words, then the
    // working in figures. Working on its own is an answer key: it only reads to
    // someone who already knows which puzzle it belongs to.
    for (const ex of tip.examples) {
      const box = el("div", "ex");
      box.appendChild(el("p", "exask", ex.ask));
      box.appendChild(el("p", "exwork", ex.work));
      card.appendChild(box);
    }
    card.appendChild(el("p", "small muted", `${t().whyItWorks}: ${tip.why}`));
    stack.appendChild(card);
  }

  const choose = el("div", "card stack");
  const a = el("div", "row");
  a.appendChild(btn(`${t().practice} · ${sk.drill} ${t().questions}`, "primary", () => startDrill()));
  a.appendChild(el("span", "muted small", t().noClock));
  choose.appendChild(a);

  const b = el("div", "row");
  b.appendChild(btn(`${t().beatClock} · ${cfg.count} ${t().questions} / ${clock(cfg.seconds)}`, "", () => startClock()));
  b.appendChild(el("span", "muted small", `${cfg.pass}/${cfg.count} ${t().needed}`));
  choose.appendChild(b);
  stack.appendChild(choose);

  app.appendChild(stack);
}

/* ── screen 3: practice, one question at a time ──────────────────────────── */
function startDrill() {
  const sk = getSkill(S.skill);
  S.paper = generateSet({ skill: S.skill, level: S.level, count: sk.drill, seed: Date.now() });
  S.i = 0;
  S.verdict = null;
  S.screen = "drill";
  render();
}

function drill(app) {
  const qn = S.paper.questions[S.i];
  const stack = el("div", "stack");

  const rail = el("div", "rail");
  rail.appendChild(Object.assign(el("i"), { style: `width:${(S.i / S.paper.questions.length) * 100}%` }));
  stack.appendChild(rail);
  stack.appendChild(el("p", "muted small mono", `${S.i + 1} / ${S.paper.questions.length}`));

  const card = el("div", "card stack");
  card.appendChild(el("div", "qbig" + (isWordy(qn) ? " words" : ""), qn.prompt));
  if (qn.options) {
    card.appendChild(el("div", "mono small muted", qn.options.map((o, j) => `(${"abcde"[j]}) ${o}`).join("    ")));
  }

  if (!S.verdict) {
    const input = el("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", t().yourAnswer);
    const submit = () => { S.verdict = grade(qn, input.value); render(); };
    input.onkeydown = (e) => { if (e.key === "Enter") submit(); };
    card.appendChild(input);
    const row = el("div", "row");
    row.appendChild(btn(t().check, "primary", submit));
    if (qn.format === "probability") row.appendChild(el("span", "muted small", t().typeHint));
    card.appendChild(row);
    setTimeout(() => input.focus(), 0);
  } else {
    const v = S.verdict;
    const box = el("div", "verdict " + (v.correct ? "ok" : "no"));
    box.appendChild(el("strong", "", v.correct ? t().correct : t().notQuite));
    if (!v.correct) {
      box.appendChild(el("p", "mono small", `${t().answerIs} ${v.expected}`));
      // Two different sentences, in the order a student needs them.
      // First: which wrong route you took, when we can tell.
      if (v.why) box.appendChild(el("p", "", v.why));
      // Then: how this exact question is done. Always present, so a student who
      // went wrong in some way we do not recognise still gets taught something.
      if (v.solution) {
        const sol = el("div", "solution");
        sol.appendChild(el("span", "eyebrow", t().howItsDone));
        sol.appendChild(el("p", "", v.solution));
        box.appendChild(sol);
      }
      const tip = qn.tip ? getTip(qn.tip, S.lang) : null;
      if (tip) {
        const label = isTrickTopic(qn.skill) ? t().tipTitle : t().seeIt;
        box.appendChild(el("p", "small muted", `${label}: ${tip.title}`));
      }
    }
    card.appendChild(box);
    const isLast = S.i + 1 >= S.paper.questions.length;
    card.appendChild(btn(isLast ? t().back : t().next, "primary", () => {
      if (isLast) { S.screen = "level"; S.verdict = null; render(); return; }
      S.i++; S.verdict = null; render();
    }));
  }

  stack.appendChild(card);
  app.appendChild(stack);
}

/* ── screen 4: the clock, every question on one page ─────────────────────── */
let timer = null;
const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };

function startClock() {
  const cfg = getSkill(S.skill).levels[S.level - 1];
  S.paper = generateSet({ skill: S.skill, level: S.level, count: cfg.count, seconds: cfg.seconds, seed: Date.now() });
  S.parts = [{ paper: S.paper, answers: new Array(cfg.count).fill("") }];
  S.partIndex = 0;
  S.exam = null;
  S.review = false;
  S.screen = "clock";
  render();
}

function startReview() {
  const paper = generateReview({ stats: S.stats, count: 12, seconds: 420, seed: Date.now() });
  S.paper = paper;
  S.parts = [{ paper, answers: new Array(paper.questions.length).fill("") }];
  S.partIndex = 0;
  S.exam = null;
  S.review = true;
  S.skill = null;
  S.screen = "clock";
  render();
}

function startExam(examId) {
  const exam = generateExam(examId, Date.now());
  S.exam = exam;
  S.skill = exam.parts[0].skill;
  S.parts = exam.parts.map((p) => ({ paper: p, answers: new Array(p.questions.length).fill("") }));
  S.partIndex = 0;
  S.review = false;
  S.screen = "clock";
  render();
}

function clockScreen(app) {
  const part = S.parts[S.partIndex];
  const { questions, seconds } = part.paper;
  const deadline = Date.now() + seconds * 1000;

  const stack = el("div", "stack");
  const head = el("div", "row");
  head.style.justifyContent = "space-between";
  const label = S.exam
    ? `${t().part} ${S.partIndex + 1} ${t().of} ${S.parts.length} · ${questions.length} ${t().questions}`
    : S.review
    ? `${t().weakTitle} · ${questions.length} ${t().questions}`
    : `${skillName(S.skill, S.lang)} · ${t().level} ${S.level} · ${questions.length} ${t().questions}`;
  head.appendChild(el("span", "muted small", label));
  const clockEl = el("span", "clock", clock(seconds));
  head.appendChild(clockEl);
  stack.appendChild(head);

  const rail = el("div", "rail");
  const fill = el("i");
  fill.style.width = "100%";
  rail.appendChild(fill);
  stack.appendChild(rail);

  const wordy = questions.some(isWordy);
  const sheet = el("div", "sheet " + (wordy ? "" : "two"));
  const inputs = [];
  questions.forEach((qn, i) => {
    const row = el("div", "qrow" + (isWordy(qn) ? " words" : ""));
    row.appendChild(el("span", "qn", String(i + 1)));
    const text = qn.options
      ? qn.prompt + "   " + qn.options.map((o, j) => `(${"abcde"[j]}) ${o}`).join("   ")
      : qn.prompt;
    row.appendChild(el("span", "qq", text));
    const input = el("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.value = part.answers[i];
    input.setAttribute("aria-label", `${t().yourAnswer} ${i + 1}`);
    input.oninput = () => { part.answers[i] = input.value; };
    input.onkeydown = (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const nextInput = inputs[i + 1];
      if (nextInput) { nextInput.focus(); nextInput.select(); }
    };
    inputs.push(input);
    row.appendChild(input);
    sheet.appendChild(row);
  });
  stack.appendChild(sheet);

  const foot = el("div", "row");
  foot.appendChild(btn(t().submit, "primary", finish));
  foot.appendChild(el("span", "muted small", t().autoSubmit));
  stack.appendChild(foot);
  app.appendChild(stack);
  setTimeout(() => inputs[0]?.focus(), 0);

  stopTimer();
  timer = setInterval(() => {
    const left = Math.max(0, (deadline - Date.now()) / 1000);
    clockEl.textContent = clock(left);
    const frac = left / seconds;
    fill.style.width = (frac * 100).toFixed(1) + "%";
    clockEl.classList.toggle("hot", frac < 0.2);
    rail.classList.toggle("hot", frac < 0.2);
    if (left <= 0) finish(true);
  }, 250);

  function finish(auto = false) {
    if (!auto) {
      const blank = part.answers.filter((a) => !a.trim()).length;
      if (blank && !confirm(t().blankWarn(blank))) return;
    }
    stopTimer();
    part.marked = gradeSet(questions, part.answers);
    if (S.partIndex + 1 < S.parts.length) { S.partIndex++; render(); return; }
    S.screen = "results";
    recordProgress();
    render();
  }
}

function recordProgress() {
  // Every answered question feeds the stats, whatever mode produced it. This is
  // what makes weak-spot practice possible, and it is the one call a host would
  // replace with a POST to its own API.
  for (const part of S.parts) {
    S.stats = accumulate(S.stats, part.paper.questions, part.marked.results);
  }
  write(STATS_KEY, S.stats);

  if (S.exam || S.review) return; // neither unlocks a ladder level
  const cfg = getSkill(S.skill).levels[S.level - 1];
  const { score } = S.parts[0].marked;
  if (score >= cfg.pass) {
    S.progress[`${S.skill}|${S.level}`] = { score, at: Date.now() };
    write(KEY, S.progress);
  }
  // In a real integration this is where the host is told, and the host decides
  // what to persist: onEvent({ type:"level-complete", skill, level, score, ... })
}

/* ── screen 5: results, with the explanation for every miss ──────────────── */
function results(app) {
  const stack = el("div", "stack");

  const totals = S.parts.reduce(
    (a, p) => ({
      score: a.score + p.marked.score, total: a.total + p.marked.total,
      blank: a.blank + p.marked.blank, trapped: a.trapped + p.marked.trapped,
    }),
    { score: 0, total: 0, blank: 0, trapped: 0 }
  );

  const tiles = el("div", "tiles");
  const tile = (v, l) => { const d = el("div", "tile"); d.appendChild(el("div", "tv", v)); d.appendChild(el("div", "tl", l)); return d; };
  tiles.appendChild(tile(`${totals.score}/${totals.total}`, t().score));
  tiles.appendChild(tile(String(totals.blank), t().blank));
  tiles.appendChild(tile(String(totals.trapped), t().trapped));
  stack.appendChild(tiles);

  if (!S.exam && !S.review) {
    const cfg = getSkill(S.skill).levels[S.level - 1];
    const passed = totals.score >= cfg.pass;
    const note = el("div", "verdict " + (passed ? "ok" : "no"));
    note.appendChild(el("strong", "", passed ? `${t().done} · ${t().level} ${S.level}` : `${cfg.pass}/${cfg.total || cfg.count} ${t().needed}`));
    if (passed && nextSkill(S.skill)) note.appendChild(el("p", "small", skillName(nextSkill(S.skill), S.lang)));
    stack.appendChild(note);
  }

  for (const part of S.parts) {
    const review = el("div", "review");
    part.paper.questions.forEach((qn, i) => {
      const r = part.marked.results[i];
      if (r.correct) return;
      const box = el("div", "rev");
      box.dataset.ok = "false";
      box.appendChild(el("p", isWordy(qn) ? "" : "mono", qn.prompt));
      const line = el("p", "small mono muted");
      line.textContent = `${t().answerIs} ${r.expected}` + (r.answered ? `   ·   ${t().yourAnswer}: ${r.given}` : `   ·   ${t().blank}`);
      box.appendChild(line);
      if (r.why) box.appendChild(el("p", "small", r.why));
      if (r.solution) box.appendChild(el("p", "small muted", r.solution));
      review.appendChild(box);
    });
    if (review.children.length) stack.appendChild(review);
  }

  const row = el("div", "row");
  row.appendChild(btn(t().again, "primary",
    () => (S.exam ? startExam(S.exam.id) : S.review ? startReview() : startClock())));
  row.appendChild(btn(t().back, "", () => { S.screen = "ladder"; render(); }));
  stack.appendChild(row);
  app.appendChild(stack);
}

render();
