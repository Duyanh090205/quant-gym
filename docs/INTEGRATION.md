# Putting Quant Gym in a website

The engine is deliberately small and rude about its boundaries: it generates
questions and marks answers, and it does nothing else. It never reads storage,
never asks who the user is, never routes, and never calls your API. Your
application already does all of that better than a drop-in widget could.

## The fastest path

Copy `src/engine/` into your project and import it.

```
your-app/
  src/
    features/quant/
      engine/        ← copied from this repo, unchanged
      QuantGym.jsx   ← your UI, or ours
```

```js
import { generateSet, gradeSet, CURRICULUM, getTip } from "./engine/index.js";
```

It is plain ES modules with no dependencies, so Vite, Next, Webpack, Rollup and a
bare `<script type="module">` all handle it without configuration. It runs in
Node too, which is what the tests do.

## The component contract

The React module in phase 2 takes props in and sends events out. Nothing else.

```jsx
<QuantGym
  user={session.user}          // whatever your auth already returns
  lang="en"                    // "en" | "vi"
  theme={theme}                // "light" | "dark"
  initialProgress={progress}   // loaded by you, shape below
  onEvent={handleEvent}
/>
```

```js
function handleEvent(e) {
  // e.type is one of:
  //   "question-answered"  { skill, level, questionId, correct, trapHit, seconds }
  //   "level-complete"     { skill, level, score, total, blank, trapped, seconds, mastered }
  //   "exam-complete"      { examId, parts: [{ skill, score, total, blank }], seconds }
  //   "tip-opened"         { tipId, skill }
  fetch("/api/quant/progress", { method: "POST", body: JSON.stringify(e) });
}
```

`initialProgress` is a flat map, which is all the ladder needs to decide what is
unlocked:

```json
{
  "arith.squares|1": { "score": 14, "at": 1757400000000 },
  "arith.squares|2": { "score": 13, "at": 1757400600000 }
}
```

Store it however you like. It is small, it is JSON, and it never needs a schema
migration because unknown keys are ignored.

## If you would rather use your own question UI

Then skip the component and call the engine directly. This is the better choice
if you already have a practice-question screen you like, because the questions
will look native rather than like an embedded product.

```js
const paper = generateSet({ skill: "prob.mixed", level: 2, count: 15, seed: assignmentCode });

// render paper.questions with your own components
// collect answers into an array in the same order

const marked = gradeSet(paper.questions, answers);
```

Two things to carry through if you build your own screen, because they are where
most of the teaching value is:

1. **Show `result.solution` on every wrong answer, and `result.why` above it when
   it is there.** `why` names the specific mistake and is only present when the
   typed answer matches a known wrong route; `solution` works the question through
   with its own numbers and is always present. Without them the module is just a
   timer with sums in it.
2. **Show the tip card on a miss**, via `getTip(question.tip, lang)`. A trick
   lands when the mistake is still warm. The card is
   `{ title, when, steps[], example: { ask, work }, why }`. Render `when` before
   the steps and `example.ask` before `example.work`: recognising which idea a
   question wants is the skill, and working shown without its question is an
   answer key nobody can read.

## Practice aimed at what a student gets wrong

A ladder is a curriculum, not a tutor: worked through in order it gives every
skill the same attention whether or not you have it. Feed the engine what it has
seen and it will build a paper from the skills that need work.

```js
import { accumulate, weakSpots, generateReview } from "./engine/index.js";

// After marking anything at all, fold it into a record and store it.
stats = accumulate(stats, paper.questions, marked.results);

// { "arith.divide|3": { seen: 23, correct: 9 }, "arith.multiply|3": { seen: 31, correct: 15 }, ... }

weakSpots(stats);          // ranked worst first, with rate and need
generateReview({ stats, count: 12, seed });
```

`accumulate` returns a new object rather than editing yours, ignores blanks
(a skipped question says nothing about the skill), and ignores keys it does not
recognise, so you can hand it a whole user record without filtering.

Ranking is not raw accuracy. A skill seen twice and missed twice is not yet a
weakness, so need is discounted until there is evidence. A review paper spreads
across up to four skills and never takes more than half from one, because a
student who has just failed at something learns more from mixed practice.

With no history `generateReview` still returns a usable paper and sets
`ready: false`, so a fresh user is never shown an empty screen.

## Classroom assignments without a backend

Because generation is seeded, a shared code is a shared paper.

```js
const code = "QG-7A3F";                       // teacher generates once, writes on the board
const paper = generateSet({ skill: "arith.mixed", level: 2, count: 20, seconds: 300, seed: code });
```

Every student who enters that code gets the identical twenty questions in the
identical order. Nothing is stored server-side, and the questions cannot leak in
advance because they do not exist until the code is used.

## Language

Everything a student reads is bilingual: prompts, worked solutions, trap
explanations and tip cards. Pass `lang` and the same code produces either.

```js
generateSet({ skill: "prob.bayes", level: 2, count: 8, seed, lang: "vi" });
generateExam("maven-round-1", seed, "vi");
generateReview({ stats, count: 12, seed, lang: "vi" });
getTip("bayes-likelihood-share", "vi");
```

Every sentence lives in `src/engine/text.js` as a function of the question's own
numbers, so a translation reorders them freely instead of being trapped in
English word order. Generators receive the resolved half and never see the other.

Three details that matter more than they look:

- **Numbers follow the reader.** Vietnamese gets 0,545; English gets 0.545.
  Thousands separators are dropped in both, because English 5,832 and Vietnamese
  5.832 are each ambiguous with the other's decimal mark.
- **Coordinate pairs and intervals use a semicolon in Vietnamese.** `(1,4)` and
  `[0,1]` read as one-point-four and zero-point-one to a Vietnamese student.
- **Marking accepts either convention.** A comma between digits is genuinely
  ambiguous, so `1,234` is tried as both one thousand two hundred and thirty-four
  and one point two three four, and either is accepted.

The house style holds in both languages: no term a fifteen-year-old has not met,
unless the sentence defines it on the spot. `npm test` enforces it against a list
of banned words, and `bilingual.test.js` checks that the two languages ask the
same questions, print the same numbers, carry the same traps and reach the same
answers.

Interface labels belong to your application, not to the engine.

## What is deliberately missing

No analytics, no telemetry, no network calls, no cookies, no `localStorage` in the
engine. The demo uses `localStorage`, but that is the demo remembering itself, not
the engine. If you see a network request from this code, something is wrong.
