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

A wrong answer is never just wrong. Every question carries two kinds of feedback,
and they do different jobs.

**The solution** is the worked line for these exact numbers, built from the same
values that built the question. It is always there, so a student who went wrong in
some way nobody anticipated still gets taught.

> **38²**
> Not quite. The answer is 1444.
> **How it's done** — Slide 2 down to reach a round number, then pay it back:
> 38² = 36 × 40 + 2² = 1440 + 4 = 1444.

**The traps** are specific wrong routes, each with the sentence that names the
mistake. They fire only when the typed answer matches one, and then they say what
the student actually did:

> *The correction was never added. 36 × 40 = 1440, and you still owe 2² = 4.*

There are about 180 traps across the engine, and a test checks that every one of
them is far enough from the right answer for marking to tell them apart, and that
none is left without an explanation.

Both are written for someone meeting this for the first time. A test enforces
that: it fails the build on words like *likelihood*, *prior* or *martingale*, and
on C(n,k) appearing without "ways to choose k from n" beside it.

Attached to each skill is a **tip card**, shown before the first drill and again
the moment a relevant question is missed. A trick delivered while the mistake is
still warm sticks; the same trick in a textbook chapter does not. Cards are
written in English and Vietnamese.

Every card title names a move you can carry out, never a result to memorise: *Cancel
first, divide once*, not *Fair ruin is i/N*. A test enforces that too, by rejecting
any title containing a formula.

Each card also opens with **Use it when**, the sentence that tells you this is the
card your question wants. Arithmetic barely needs it: you see 37² and you reach for
the square rule. Probability is nothing but that. A student who knows all seven
probability ideas and cannot tell which one a question is asking for still scores
nothing, so the header there says *How to see it*, not *The trick* — there is no
shortcut on offer, and promising one sets up an expectation nothing can meet.

Every topic on the ladder carries a **Which idea does a question want?** table
listing all its triggers in one place.

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
marked.results[4].solution;      // "Ask how readily each urn gives up a red ball: …"
marked.results[4].why;           // "That is the chance before you drew anything. …" (when we can tell)
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
