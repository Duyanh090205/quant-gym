# Review notes

Read before trusting the content. This is an honest account of what has been
checked, by what, and what has not.

Last read end to end: 10 September 2026, all 24 tip cards in both languages,
plus every generator's questions, solutions and traps.

---

## What a machine verifies

`npm test` runs 46 tests. Three of them do the load-bearing work, and they are
deliberately independent of one another, because a formula and the generator that
produced it can be wrong in the same way.

| Check | What it reads | Scale |
|---|---|---|
| `engine.test.js` | every generated answer, re-derived from a formula written separately from the generator | ~1,000 questions per run |
| `simulate.test.js` | the same answers, by playing the game instead of computing it | 265 distinct question shapes, 120,000 trials each |
| `tip-arithmetic.test.js` | the hand-written tip cards, parsing and evaluating both sides of every equation printed on them | 140 equations across 24 cards in two languages |
| `bilingual.test.js` | the two languages against each other: answers, traps, numbers, and what is left untranslated | every skill at every level |

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

**Prose reasoning.** Around 140 instruction steps, and a "why it works" and a
"use it when" line on each of 24 cards in two languages, are arguments in words. The numbers inside them are checked; the
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

**Vietnamese fluency.** The translations are checked for numbers, for jargon, and
for agreeing with the English on every answer and trap. What no test can check is
whether they read naturally. A Vietnamese teacher should skim them once.

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

## Changes driven by evidence rather than judgement

Two sources of real data were read before this pass, and both changed the product.

**`maven-drill-misses.csv`** records every question one student got wrong while
preparing for the Maven paper. The engine's traps did not match it.

| Skill | What the engine offered | What actually happened |
|---|---|---|
| 2×2 multiplication | "you forgot a partial product" | all six errors were the two partial products added wrong, by +10, +30, +40 or +100 |
| Division | off by one | all three errors were off by four or five: an opening estimate pitched low and never corrected |

Traps for both now match the recorded failures, and each says what to do about it
rather than naming an omission the student did not make.

**`BANG-GHI-NHO.md`**, the memory table the same student built while practising,
contained three strong tricks the app did not teach at all. Each is now a card,
and the generators produce the cases they are for:

- The difference of two squares, for factors either side of a round number:
  62 × 58 becomes 60² − 2². A quarter of level-3 multiplications are now built to
  straddle a round number, because a trick the drill never presents is a trick
  nobody learns.
- Squaring a number ending in 5: for 35², take 3 × 4 and write 25 after it.
- The seventeen square-root anchors, for estimation. Estimation was that student's
  worst category, four errors out of seven in one session, and it was the only
  skill with no card of its own.

## Practice aimed at weak spots

The same drill logs showed the deeper problem, which no amount of better content
fixes: session after session spent on skills already at 95%, while 2×2
multiplication sat at 50% and division kept running out of time. A ladder gives
every skill the same attention whether or not you have it.

`generateReview` builds a paper from whichever skills the student is getting
wrong, ranked by need rather than by raw accuracy, so that two unlucky misses do
not outrank a genuine gap. It mixes up to four skills and never takes more than
half from one. `accumulate` folds any marked paper into the record that feeds it.

Neither is checked by simulation, because neither is a maths claim. What is
tested: the ranking order, the mix, reproducibility from a seed, that blanks do
not count as evidence, that `accumulate` does not edit the record it is given, and
that a record full of unknown keys does not break anything.

## Translating the engine, and what it exposed

Prompts and solutions were English only until 10 September. That is the wrong way
round for this cohort: a tip card is read once, calmly, but a solution is read at
the moment a student is stuck, and that is when a second language costs the most.

The translation is not a layer on top. Generators take a resolved phrasebook as
their third argument, each entry a function of the question's own numbers, so
Vietnamese reorders them rather than following English word order.

Doing it exposed four real faults that English alone would never have shown:

1. **`Uniform[0,1]` and `C(10,2)` read as decimals in Vietnamese**, exactly like
   the dice pairs found earlier. All now use a semicolon.
2. **Marking rejected `0,272`.** The parser stripped a comma followed by three
   digits as a thousands separator, right for English 1,234 and wrong for
   Vietnamese 0,272. A comma between digits is genuinely ambiguous across the two
   languages, so marking now tries both readings and accepts either.
3. **The answer was shown with an English decimal point** on a Vietnamese question
   whose own working used a comma. Two different numbers on one screen, to a
   student already unsure.
4. **A loop variable named `t` shadowed the phrasebook** in three generators,
   which would have thrown the moment anyone touched those branches.

`bilingual.test.js` now holds the pair to account: same seed, both languages, same
answers, same traps, same numbers in the prompt, no English left in the Vietnamese,
no comma-separated pairs, and the shown answer in the question's own convention.

## Open questions for whoever picks this up

1. **Vietnamese fluency, not correctness.** Everything is now translated, and the
   tests check that the two languages carry the same numbers, traps and answers.
   What they cannot check is whether the Vietnamese reads well. A Vietnamese
   teacher should skim it once.
2. **The pass marks in `curriculum.js` are guesses.** They were set to feel right,
   not measured. After a cohort has used it, set them from real data.
3. **Level 1 of a narrow skill can run out of distinct questions.** `generateSet`
   returns `distinct` alongside `questions` so a caller can see when this happens;
   it repeats a question rather than handing back a short paper.
4. **No accessibility audit** beyond keyboard focus and reduced-motion. Screen
   reader behaviour on the timed sheet is untested.
