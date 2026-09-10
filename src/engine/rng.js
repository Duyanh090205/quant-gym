/**
 * Seeded random number generator.
 *
 * Every question in Quant Gym is produced from a seed, so the same seed always
 * yields the same paper. That is what makes classroom assignments possible:
 * a teacher shares the code `QG-7A3F` and all thirty students sit the same set,
 * with no server and no database of questions.
 */

/** Turn any string into a 32-bit integer. */
export function hashSeed(seed) {
  let h = 2166136261 >>> 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Create a deterministic RNG. `mulberry32` is small, fast and has a long
 * enough period for exam papers; it is not cryptographic and does not need to be.
 */
export function makeRng(seed) {
  let a = hashSeed(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    /** Float in [0, 1). */
    float: next,
    /** Integer in [lo, hi], both inclusive. */
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    /** One element of `arr`. Repeat an element to weight it. */
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    /** Fisher-Yates, in place, returns the same array. */
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    /** True with probability p. */
    chance: (p) => next() < p,
  };
}

/** Human-friendly assignment code, e.g. "QG-7A3F". Ambiguous glyphs removed. */
export function makeCode(seed = Date.now() + ":" + Math.random()) {
  const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let h = hashSeed(seed);
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[h % ALPHABET.length];
    h = Math.floor(h / ALPHABET.length) + 7919;
  }
  return "QG-" + out;
}
