# Review notes

Read before trusting the content. This is an honest account of what has been
checked, by what, and what has not.

Last read end to end: 10 September 2026, all 21 tip cards in both languages,
plus every generator's questions, solutions and traps.

---

## What a machine verifies

`npm test` runs 31 tests. Three of them do the load-bearing work, and they are
deliberately independent of one another, because a formula and the generator that
produced it can be wrong in the same way.

| Check | What it reads | Scale |
|---|---|---|
| `engine.test.js` | every generated answer, re-derived from a formula written separately from the generator | ~1,000 questions per run |
| `simulate.test.js` | the same answers, by playing the game instead of computing it | 265 distinct question shapes, 120,000 trials each |
| `tip-arithmetic.test.js` | the hand-written tip cards, parsing and evaluating both sides of every equation printed on them | 100 equations across 21 cards in two languages |

Simulation is the one worth explaining. It ignores the formulas entirely and
rolls the dice, draws the balls, shuffles the envelopes, walks the walks and plays
out the duels, using rejection sampling for the conditional questions. Every
probability question the engine can produce is covered; a run reports `0 shapes
had no simulator`, and the test fails if that number rises.

Also enforced, because they are the failure modes that would quietly ruin a lesson:

- Every trap is far enough from the right answer that marking can tell them apart.
- Every trap and every worked solution carries an explanation, and the solution
  arrives at the answer it claims.
- No card uses a word a fifteen-year-old has not met (*likelihood*, *prior*,
  *martingale*, *commute*, *sample space*, and others), in either language.
- No card title is a formula.
- Every card says when to reach for it.
- Every example states its question, and holds exactly one question.
- The two languages of a card never print different numbers.

## What no machine checks

**Prose reasoning.** 122 instruction steps, 42 "why it works" lines and 42 "use it
when" lines are arguments in words. The numbers inside them are checked; the
arguments are not, and cannot be. They have been read end to end once, on the date
above. If you change one, nothing will catch a new mistake in it.

**Four equations that cannot be parsed.** All in the ×11 trick, which uses
positional notation: `3 (3+6) 6 = 396`. The test reports these rather than hiding
them. Checked by hand: 36 × 11 = 396 and 78 × 11 = 858.

**Claims about the real exam.** The Maven paper reproduced here comes from one
sitting on 9 September 2026, recorded immediately afterwards from memory. The
format is right. The exact difficulty of the arithmetic section is a judgement
call, and the person who sat it reported the real thing was harder than this
trainer was at the time.

**Vietnamese fluency.** The translations are checked for numbers and for jargon,
not for how they read. A Vietnamese teacher should skim them once.

## What this read-through changed

Two were real errors.

1. **`split-and-add` contradicted its own example.** The step said to break the
   *smaller* factor; the example breaks 54 in `17 × 54`. Now it says to break
   whichever factor splits more cleanly.
2. **`odd-one-out` stated a guarantee that only holds inside this trainer.**
   "The first term is never the broken one" is true of this generator and of
   nothing else. A student leaning on it in a real exam would be burned. It now
   teaches testing the rule forward, and retrying on the assumption that an early
   term is itself the odd one.

Two cards promised more than they taught, or less.

3. **`subtract-hundreds-first` is used for addition too**, but its title said only
   "subtract". Retitled to *Work from the left, and say each running total out
   loud*, with an addition example added.
4. **`times-five-and-eleven` triggered on 5, 9, 11, 25, 50 and 99** and taught only
   two of them. Rebuilt around the idea that unifies all six: each is a 10 or a 100
   with a small adjustment. A ×9 example was added.

Four statements were invented statistics, now removed: *four families out of five*,
*roughly a third of percentage questions*, *the most interviewed idea on this list*,
*one of them is always miscounted*. Each has been replaced by a claim that is true.

Two triggers were vague and are now concrete: what counts as a square worth the
sliding trick, and when a cube root is worth reading off its last digit.

Earlier passes, recorded here so the history is in one place:

- A Vietnamese card wrote dice pairs as `(1,4) (2,3)`. Vietnamese uses the comma as
  a decimal mark, so a reader sees one-point-four. Rewritten with semicolons.
- The fraction anchors claimed `1/3 = 33.3%` with an equals sign. Now `≈`.
- The expectation card rejected 99 as "not the average" without ever saying the
  average is 100.
- A card headed *The trick* for probability, where no shortcut exists and the
  difficulty is recognising which idea a question wants. Probability and sequence
  cards now read *How to see it*.

## Open questions for whoever picks this up

1. **Question prompts and worked solutions are English only.** Tip cards are
   bilingual. Translating the solutions matters most, because that is the text a
   student reads at the moment they are stuck.
2. **The pass marks in `curriculum.js` are guesses.** They were set to feel right,
   not measured. After a cohort has used it, set them from real data.
3. **Level 1 of a narrow skill can run out of distinct questions.** `generateSet`
   returns `distinct` alongside `questions` so a caller can see when this happens;
   it repeats a question rather than handing back a short paper.
4. **No accessibility audit** beyond keyboard focus and reduced-motion. Screen
   reader behaviour on the timed sheet is untested.
