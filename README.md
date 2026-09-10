# Quant Gym

A question engine for teaching high-school students the mental maths, sequence
reasoning and probability that quantitative trading firms test for.

Nineteen skills, three levels each, ordered so a student who has never seen any
of this can start at the top and never hit a wall they were not prepared for.
Questions are generated, not stored, so nobody runs out and nobody can memorise
an answer key.

**Try it in ten seconds:** open `demo/standalone.html` in any browser. One file,
no install, works offline.

---

## What makes it different from a question bank

Every question knows the ways a student gets it wrong, and says so.

> **38²**
> Not quite. The answer is 1444.
> *The correction was never added. (n−d)(n+d) = 1440, and you still owe d² = 4.*
> The trick: any square, slide to a round number then add back. 37² → 34 × 40 = 1360 → +9 = 1369.

That is a `trap`: a specific wrong route with the sentence that names it. There
are about 180 of them across the engine, and every one is checked by a test to be
far enough from the right answer that marking can tell them apart. A student who
misses a question learns *which mistake they made*, not only that they made one.

Attached to each skill is a **tip card**, shown before the first drill and again
the moment a relevant question is missed. A trick delivered while the mistake is
still warm sticks; the same trick in a textbook chapter does not. Cards are
written in English and Vietnamese.

## The ladder

| Topic | Skills |
|---|---|
| Mental arithmetic | times tables · add and subtract · multiply · divide · squares · roots and powers · fractions · percentages · estimation · number puzzles |
| Sequences | find the rule · odd one out |
| Probability and expected value | counting · expected value · conditional · Bayes · waiting times · symmetry · classic puzzles |

Each level runs in two modes. **Practice** has no clock and gives feedback after
every question. **Beat the clock** puts every question of the level on one page
with a countdown, which is how the real assessments work. Clearing a level
unlocks the next.

Two full papers sit at the end of the ladder. One reproduces a Maven Securities
first round sat on 9 September 2026: 50 arithmetic in 5 minutes, 20 odd-one-out
in 12, 15 probability in 15, with no negative marking anywhere.

## Using the engine

No DOM, no framework, no dependencies. Import it and call it.

```js
import { generateSet, gradeSet } from "quant-gym";

const paper = generateSet({ skill: "prob.bayes", level: 2, count: 8, seed: "QG-7A3F" });
const marked = gradeSet(paper.questions, ["1/2", "0.6", "", "3/5", "0.25", "1/3", "2/3", "0.4"]);

marked.score;                    // 5
marked.blank;                    // 1
marked.results[2].expected;      // "3/8  ≈ 0.375"
marked.results[4].why;           // "That is the likelihood on its own. Bayes divides it by …"
```

Questions come back as plain objects. Render them with your own components if
you would rather they matched the rest of your product; see
[docs/QUESTION_SCHEMA.md](docs/QUESTION_SCHEMA.md).

**Same seed, same paper.** A teacher shares the code `QG-7A3F` and all thirty
students sit the identical set, with no server and no stored questions.

**Marking is generous about form, strict about value.** `0.375`, `3/8` and
`37.5%` are the same answer. So are `1,234` and `1234`, and `12,5` and `12.5`.
Making a student guess a format tests the interface, not the maths.

## Putting it in a website

See [docs/INTEGRATION.md](docs/INTEGRATION.md). The short version: the engine is
plain ES modules, so copy `src/engine/` into your project and import it. It never
touches storage, authentication or routing, because your application already owns
those. You pass progress in and listen for events out.

## Layout

```
src/engine/     the whole engine. No React, no DOM, no dependencies.
  curriculum.js   the ladder: topics, skills, levels, pass marks
  tips.js         tip cards, English and Vietnamese
  arithmetic.js   \
  sequences.js     ) question generators
  probability.js  /
  grade.js        marking, and the explanation for a wrong answer
  rng.js          seeded randomness, so a paper is reproducible
demo/           a vanilla-JS shell showing the engine in use
test/           run with `npm test`
scripts/        sample.mjs prints papers; build-demo.mjs bundles the demo
```

## Commands

```
npm test                          run the test suite
node scripts/sample.mjs           print a sample paper for every skill
node scripts/sample.mjs prob.bayes 3 10
node scripts/build-demo.mjs       rebuild demo/standalone.html
```

Tests check the things that would quietly ruin a lesson: that a seed reproduces
its paper, that no trap can be confused with a right answer, that every trap has
an explanation, and that answers agree with formulas written separately from the
generators.

## Status

Phase 1: engine, curriculum, tips, marking, demo. Done and tested.
Phase 2: a React component styled to match the host application.
Phase 3: classroom mode — assignment codes, a teacher view, progress reporting.
