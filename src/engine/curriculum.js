/**
 * The ladder.
 *
 * Nineteen skills in three topics, ordered so that a student who has never seen
 * any of this can start at the top and never hit a wall they were not prepared
 * for. Each skill has three levels, and each level has two modes:
 *
 *   drill  — no clock, feedback after every question. This is where learning happens.
 *   clock  — fixed count, fixed time. This is where it becomes automatic.
 *
 * `pass` is how many of the clocked questions must be right to master the level.
 * Mastery unlocks the next level; mastering level 3 unlocks the next skill.
 * A student in a hurry can skip straight to any level's clock and test out.
 */

const lv = (count, seconds, pass) => ({ count, seconds, pass });

const skill = (id, en, vi, levels, opts = {}) => ({
  id,
  name: { en, vi },
  drill: opts.drill ?? 8,
  levels,
  ...opts,
});

export const CURRICULUM = [
  {
    id: "arithmetic",
    name: { en: "Mental arithmetic", vi: "Tính nhẩm" },
    blurb: {
      en: "Speed with numbers, without a calculator and without paper. Everything later rests on this.",
      vi: "Nhanh với con số, không máy tính và không giấy bút. Mọi thứ về sau đều dựa trên phần này.",
    },
    skills: [
      skill("arith.times-tables", "Times tables", "Bảng cửu chương",
        [lv(20, 90, 17), lv(20, 100, 17), lv(20, 120, 15)]),
      skill("arith.add-subtract", "Add and subtract", "Cộng và trừ",
        [lv(20, 120, 16), lv(20, 150, 16), lv(15, 120, 11)]),
      skill("arith.multiply", "Multiply", "Nhân",
        [lv(15, 120, 12), lv(15, 120, 12), lv(12, 120, 8)]),
      skill("arith.divide", "Divide", "Chia",
        [lv(15, 110, 12), lv(15, 130, 12), lv(12, 120, 8)]),
      skill("arith.squares", "Squares", "Bình phương",
        [lv(15, 90, 13), lv(15, 100, 12), lv(12, 100, 9)]),
      skill("arith.roots", "Roots and powers", "Căn và luỹ thừa",
        [lv(12, 100, 10), lv(12, 120, 9), lv(10, 150, 7)]),
      skill("arith.fractions", "Fractions", "Phân số",
        [lv(15, 100, 12), lv(12, 130, 9), lv(12, 120, 8)]),
      skill("arith.percent", "Percentages", "Phần trăm",
        [lv(15, 110, 12), lv(15, 140, 11), lv(12, 120, 8)]),
      skill("arith.decimals", "Decimals", "Số thập phân",
        [lv(15, 120, 12), lv(12, 120, 9), lv(12, 140, 8)]),
      skill("arith.estimate", "Rough answers", "Tính áng chừng",
        [lv(10, 100, 8), lv(10, 110, 7), lv(10, 120, 7)]),
      skill("arith.puzzles", "Number puzzles", "Câu đố số học",
        [lv(10, 150, 8), lv(10, 180, 7), lv(8, 200, 6)]),
    ],
  },
  {
    id: "estimation",
    name: { en: "Estimation", vi: "Ước lượng" },
    blurb: {
      en: "How big a thing is, and how many of them there are. The half of a trading interview with no formula in it.",
      vi: "Một thứ lớn cỡ nào, và có bao nhiêu cái như thế. Nửa phần của buổi phỏng vấn giao dịch không có công thức nào cả.",
    },
    skills: [
      skill("est.scale", "Scale and units", "Đơn vị và bậc độ lớn",
        [lv(12, 150, 10), lv(10, 180, 8), lv(10, 240, 7)]),
      skill("est.fermi", "Fermi estimates", "Ước lượng Fermi",
        [lv(10, 200, 8), lv(8, 300, 6), lv(8, 360, 6)]),
    ],
  },
  {
    id: "sequences",
    name: { en: "Sequences", vi: "Dãy số" },
    blurb: {
      en: "Spot the rule behind a row of numbers, then spot the one term that disobeys it.",
      vi: "Nhận ra quy luật đằng sau một dãy số, rồi tìm đúng một số không tuân theo.",
    },
    skills: [
      skill("seq.find-rule", "Find the rule", "Tìm quy luật",
        [lv(12, 180, 10), lv(12, 240, 9), lv(10, 300, 7)]),
      skill("seq.odd-one-out", "Odd one out", "Tìm số lạc",
        [lv(12, 240, 10), lv(12, 300, 9), lv(20, 720, 14)]),
    ],
  },
  {
    id: "probability",
    name: { en: "Probability and expected value", vi: "Xác suất và kỳ vọng" },
    blurb: {
      en: "Seven ideas that answer almost every probability question a trading firm asks.",
      vi: "Bảy ý trả lời được gần như mọi câu xác suất mà một công ty giao dịch hỏi.",
    },
    skills: [
      skill("prob.counting", "Counting outcomes", "Đếm kết quả",
        [lv(10, 240, 8), lv(10, 300, 8), lv(10, 360, 7)]),
      skill("prob.expected-value", "Expected value", "Kỳ vọng",
        [lv(10, 240, 8), lv(10, 360, 7), lv(8, 400, 6)]),
      skill("prob.conditional", "Conditional probability", "Xác suất có điều kiện",
        [lv(8, 240, 6), lv(8, 300, 6), lv(8, 360, 6)]),
      skill("prob.bayes", "Bayes", "Bayes",
        [lv(8, 300, 6), lv(8, 360, 6), lv(8, 400, 6)]),
      skill("prob.waiting-time", "Waiting times", "Thời gian chờ",
        [lv(8, 240, 6), lv(8, 300, 6), lv(8, 360, 6)]),
      skill("prob.symmetry", "Symmetry and ordering", "Đối xứng và thứ tự",
        [lv(8, 240, 6), lv(8, 300, 6), lv(8, 400, 6)]),
      skill("prob.classics", "Classic puzzles", "Câu đố kinh điển",
        [lv(8, 300, 6), lv(8, 360, 6), lv(8, 420, 5)]),
    ],
  },
];

/**
 * Exam papers. These are not part of the ladder; they are the thing the ladder
 * is preparing you for, unlocked once the probability topic is mastered.
 *
 * `maven-round-1` reproduces a real first-round paper sat on 9 September 2026:
 * every question of a part on one page, typed answers, a countdown, and no
 * negative marking anywhere, so a blank is strictly worse than a guess.
 */
export const EXAMS = [
  {
    id: "maven-round-1",
    name: { en: "Maven Securities, round 1", vi: "Maven Securities, vòng 1" },
    note: {
      en: "The real format: 50 arithmetic in 5 minutes, 20 odd-one-out in 12, 15 probability in 15. +1 for correct, 0 for wrong, 0 for blank.",
      vi: "Format thật: 50 câu tính nhẩm trong 5 phút, 20 câu tìm số lạc trong 12, 15 câu xác suất trong 15. Đúng +1, sai 0, bỏ trống 0.",
    },
    // Each part is a blend of rungs, not one rung. The probability split is
    // measured: of the thirteen questions recalled from the sitting, three were
    // level-1 ideas, seven level-2, two level-3. The other two are set to feel
    // like the sitting rather than measured from it.
    parts: [
      { skill: "arith.mixed", levels: { 1: 20, 2: 40, 3: 40 }, count: 50, seconds: 300 },
      { skill: "seq.odd-one-out", levels: { 1: 20, 2: 30, 3: 50 }, count: 20, seconds: 720 },
      { skill: "prob.mixed", levels: { 1: 25, 2: 55, 3: 20 }, count: 15, seconds: 900 },
    ],
  },
  {
    id: "penalty-80in8",
    name: { en: "80 in 8, with penalties", vi: "80 câu trong 8 phút, có trừ điểm" },
    note: {
      en: "80 arithmetic questions in 8 minutes: +1 for a correct answer, −1 for a wrong one, 0 for a blank. " +
          "This is the shape candidates report from Optiver's first round. The penalty is the whole point — a guess " +
          "you are not confident in loses on average, and knowing when not to trade is the job.",
      vi: "80 câu tính nhẩm trong 8 phút: đúng +1, sai −1, bỏ trống 0. " +
          "Đây là dạng các ứng viên kể lại từ vòng 1 của Optiver. Việc trừ điểm mới là điểm mấu chốt — một cú đoán " +
          "mà bạn không chắc thì trung bình là lỗ, và biết lúc nào không nên vào lệnh mới là nghề.",
    },
    penalty: 1,
    pass: 55,
    parts: [{ skill: "arith.mixed", level: 3, count: 80, seconds: 480 }],
  },
  {
    id: "sprint-60",
    name: { en: "Sixty-second sprint", vi: "Chạy nước rút 60 giây" },
    note: {
      en: "Twenty arithmetic questions, sixty seconds, mixed levels. Good for a warm-up or a class competition.",
      vi: "Hai mươi câu tính nhẩm, sáu mươi giây, trộn cấp độ. Hợp để khởi động hoặc thi đua trong lớp.",
    },
    parts: [{ skill: "arith.mixed", level: 2, count: 20, seconds: 60 }],
  },
];

/* ── lookups ─────────────────────────────────────────────────────────────── */

export const ALL_SKILLS = CURRICULUM.flatMap((t) =>
  t.skills.map((s) => ({ ...s, topic: t.id, topicName: t.name }))
);

const SKILL_BY_ID = new Map(ALL_SKILLS.map((s) => [s.id, s]));

export const getSkill = (id) => SKILL_BY_ID.get(id) || null;

/** Skills in ladder order, so `next` and `previous` are well defined. */
export const SKILL_ORDER = ALL_SKILLS.map((s) => s.id);

export function nextSkill(id) {
  const i = SKILL_ORDER.indexOf(id);
  return i >= 0 && i + 1 < SKILL_ORDER.length ? SKILL_ORDER[i + 1] : null;
}

/** Resolve a skill name in one language, falling back to English. */
export function skillName(id, lang = "en") {
  const s = SKILL_BY_ID.get(id);
  if (!s) return id;
  return s.name[lang] || s.name.en;
}
