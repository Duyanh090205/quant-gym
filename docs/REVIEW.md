# What is verified, and what is not

Read this before trusting the content. Most of the engine is checked by machine,
and the parts that are not are listed here rather than left for you to find.

Last read end to end: 11 September 2026 — all 28 tip cards and every generator's
questions, solutions and traps, in both languages.

---

## What a machine verifies

Every run of `npm test` re-checks all of this. None of it is a spot check.

| Test | What it holds to account | Scale |
|---|---|---|
| `engine.test.js` | every generated answer, re-derived from a formula written separately from the generator | ~1,000 questions per run |
| `simulate.test.js` | the same answers again, by playing the game rather than computing it | 348 distinct shapes, 120,000 trials each |
| `estimation.test.js` | estimation answers, read back out of the sentence the student sees | 720 answers, conversions written from scratch |
| `solution-arithmetic.test.js` | both sides of every equation printed inside a solution or a trap | 7,054 equations, plus 490 in traps |
| `sequence-ambiguity.test.js` | whether a sequence admits two defensible answers, using rules fitted from scratch | 1,079 sequences, 789 odd-one-out |
| `question-pool.test.js` | that every skill can fill its own paper without repeating a question | all 66 skill-levels |
| `tip-arithmetic.test.js` | the hand-written tip cards, evaluating every equation printed on them | 164 equations across 28 cards |
| `bilingual.test.js` | that the two languages never disagree about a number | every prompt, both languages |

Three of these are worth a note. `simulate.test.js` fails if a probability shape
has no simulator, so a new shape cannot be added without one.
`question-pool.test.js` fails if a skill falls short of the paper the curriculum
asks of it, and fails again if a skill listed as short has quietly been fixed and
left on the list. `estimation.test.js` also refuses a worked solution that uses a
figure its question never gave the student.

## What no machine checks

**Prose reasoning.** Around 150 instruction steps, plus a "why it works" and a
"use it when" line on each of 28 cards in two languages, are arguments made in
words. The numbers inside them are checked; the arguments are not, and cannot be.
They have been read end to end on the date above. If you change one, nothing will
catch a new mistake in it.

**Four equations that cannot be parsed.** All of them in the ×11 trick, which
uses positional notation: `3 (3+6) 6 = 396`. The test reports these rather than
hiding them. Checked by hand: 36 × 11 = 396 and 78 × 11 = 858.

**Vietnamese fluency.** The translations are checked for numbers, for jargon, and
for agreeing with the English on every answer and trap. What no test can check is
whether they read naturally to a Vietnamese speaker. This is the largest
unverified surface in the project.

**Claims about real assessments.** Two papers reproduce formats reported from
outside this repository:

- The Maven Securities paper comes from one sitting on 9 September 2026, written
  down immediately afterwards from memory. The format is right. The difficulty of
  the arithmetic section is a judgement call, and the person who sat it reported
  that the real thing was harder than this trainer was at the time.
- Level 3 of every arithmetic skill is pitched from the drill that matched the
  Maven sitting and from the three questions photographed during it: a digit
  missing from a three-digit multiplier, `2 × 232 = 16 × ?`, and which of
  `7^4, 6^5, 5^6, 222, 4^7` is largest. The drill's own notes named decimal
  division and arbitrary percentages as its gaps against the real paper; both
  are now in. The paper blends the three levels in measured proportion for
  probability — three level-1 ideas, seven level-2, two level-3 among the
  thirteen questions recalled — and in proportions set by feel for arithmetic
  and sequences, where nothing was photographed.
- The 80-in-8 paper with penalties follows what candidates report of Optiver's
  first round, including the pass mark of 55. That is community reporting, not an
  official specification. What it teaches — that a guess you are not confident in
  loses on average, so the right move is to leave it — holds whatever the real bar
  turns out to be.

**What the estimation topic deliberately will not do.** Every question states the
assumptions it wants used, so that it can be marked without presenting an
invented figure as the truth. What it trains is decomposition and the arithmetic
of big round numbers. What it does not train is inventing the assumptions
yourself: that has no single right answer and needs a person on the other side of
the table.

**Accessibility.** `npm run audit:a11y` measures contrast against whatever is
actually painted behind the text, in both themes, and checks that every control
has a name and can be reached by keyboard. It does not run a screen reader; it
checks the markup one would rely on.

## Open questions for whoever picks this up

1. **A Vietnamese speaker should read the translations once.** Everything is
   machine-checked for correctness; how it reads is not.
2. **The pass marks in `curriculum.js` are guesses.** They were set to feel right,
   not measured. Set them from real data once a cohort has used the thing.
3. **An actual screen-reader pass has not been done.**
4. **`est.fermi` could grow an open-ended mode**, where the student supplies the
   assumptions and a teacher judges the answer. It cannot be auto-marked, so it
   belongs in a classroom rather than in this engine.
