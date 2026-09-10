# Question schema

`generate()` and `generateSet()` return plain objects. Nothing is a class, nothing
has methods, and everything survives `JSON.stringify`, so a question can be stored,
sent over the wire, or rendered by any framework.

## Fields

| Field | Type | Always present | Meaning |
|---|---|---|---|
| `id` | string | yes | `"prob.bayes.L2#3"`. Unique within a paper, stable for a given seed. |
| `skill` | string | yes | The generator that produced it, e.g. `"prob.bayes"`. |
| `requested` | string | yes | What the caller asked for. Differs from `skill` only for the mixed pseudo-skills. |
| `topic` | string | yes | `"arithmetic"`, `"sequences"` or `"probability"`. |
| `level` | 1 \| 2 \| 3 | yes | Difficulty. |
| `prompt` | string | yes | The question as the student reads it. Already localised into symbols, not markup. |
| `answer` | number \| string | yes | The value. Do not string-compare it; call `grade()`. |
| `format` | string | yes | How to render and mark it. See below. |
| `traps` | array | yes | Wrong routes, each `{ value, why }`. May be empty. |
| `tip` | string \| null | yes | Id of a tip card, resolve with `getTip(id, lang)`. |
| `approx` | true | no | Answers within 5% are correct. Render the prompt's `≈` prominently. |
| `options` | string[] | no | Present only when `format` is `"letter"`. Label them (a), (b), … |
| `terms` | string[] | no | Odd-one-out only: the sequence as separate terms, if you want to lay them out yourself. |
| `position` | number | no | Odd-one-out only: zero-based index of the offending term. |
| `shouldBe` | string | no | Odd-one-out only: what that position should have contained. |
| `family` | string | no | Sequences only: which rule generated it, e.g. `"geometric differences"`. |
| `note` | string | no | An explanation shown when the question has no per-value traps. |

## Formats

| `format` | Input | Marking |
|---|---|---|
| `"number"` | one number | Exact to 0.0051, or within 5% when `approx` is set |
| `"probability"` | fraction, decimal or percentage | Two-decimal rounding counts: `0.33` is `1/3` |
| `"letter"` | a letter, or the option text | Case-insensitive |
| `"odd-term"` | the offending term itself | Numeric if both sides parse as numbers, else case-insensitive text |
| `"letter-term"` | a letter group like `HS` | Case- and space-insensitive |

## Example

```json
{
  "id": "prob.bayes.L2#3",
  "skill": "prob.bayes",
  "requested": "prob.mixed",
  "topic": "probability",
  "level": 2,
  "format": "probability",
  "prompt": "Urn A holds 3 blue and 1 red. Urn B holds 1 blue and 3 red. You pick an urn at random and draw a red ball. Probability it was urn B?",
  "answer": 0.75,
  "traps": [
    { "value": 0.5, "why": "That is the prior. Drawing red is evidence, and it favours whichever urn has more red." },
    { "value": 0.25, "why": "Red counts were compared directly, but the urns hold different totals, so compare proportions." }
  ],
  "tip": "bayes-likelihood-share"
}
```

## Marking

```js
import { grade, gradeSet } from "quant-gym";

grade(question, "0.75");
// { answered: true, correct: true, given: "0.75", expected: "3/4  ≈ 0.75", trap: null, why: null }

grade(question, "0.5");
// { answered: true, correct: false, given: "0.5", expected: "3/4  ≈ 0.75",
//   trap: { value: 0.5, why: "That is the prior. …" },
//   why: "That is the prior. Drawing red is evidence, and it favours whichever urn has more red." }

grade(question, "");
// { answered: false, correct: false, given: "", expected: "3/4  ≈ 0.75", trap: null, why: null }
```

`answered` is separate from `correct` on purpose. Under the +1/0/0 marking these
assessments use, a blank and a wrong answer both score nothing, but they mean very
different things about the student: one ran out of time or nerve, the other tried
and misunderstood. Report them separately or you will coach the wrong problem.

`gradeSet(questions, answers)` returns `{ results, score, total, answered, blank,
wrong, trapped }`. `trapped` counts the wrong answers that landed on a known
mistake, which is the most useful single number for a teacher.

## Papers

```js
generateSet({ skill, level, count, seed, seconds });
// → { seed, code, skill, level, seconds, questions, distinct }
```

`code` is the shareable assignment code derived from the seed, like `QG-7A3F`.
`distinct` is how many of the questions are unique; it is below `count` only when
a narrow skill at level 1 does not contain that many different questions, in which
case a question repeats rather than the paper coming back short.

The mixed pseudo-skills `arith.mixed`, `seq.mixed` and `prob.mixed` draw across a
topic with weights tuned to real assessments, capped at `ceil(count / 6)` questions
from any one skill so a paper is never nine divisions in a row.
