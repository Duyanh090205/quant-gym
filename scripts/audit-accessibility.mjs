/**
 * Accessibility audit of the demo, run in a real browser.
 *
 * Checks the things a stylesheet gets wrong quietly: text that fails the WCAG AA
 * contrast ratio against whatever is actually painted behind it, controls with no
 * accessible name, and controls the keyboard cannot reach. Both themes and three
 * screens, because a colour that reads well on one ground often fails on the other,
 * and the timed sheet looks nothing like the ladder.
 *
 * The repo itself has no dependencies. This one script needs a browser driver, so
 * it is a script rather than part of `npm test`:
 *
 *   npm i -D puppeteer-core
 *   npm run audit:a11y
 *   CHROME=/path/to/chrome npm run audit:a11y
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  console.error("This audit needs puppeteer-core and a local Chrome.");
  console.error("  npm i -D puppeteer-core");
  console.error("  CHROME=/path/to/chrome npm run audit:a11y");
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "file:///" + join(root, "demo/standalone.html").split("\\").join("/");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** Runs inside the page: every visible run of text, measured against what is behind it. */
function inspect() {
  const channel = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const parse = (text) => {
    const m = String(text).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map(Number);
    return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
  };
  // Walk up until something actually paints: a transparent element shows whatever
  // its ancestor painted, and measuring against transparent measures nothing.
  const backgroundOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.alpha > 0.99) return c.rgb;
      node = node.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    return body ? body.rgb : [255, 255, 255];
  };
  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const low = [];
  for (const el of document.querySelectorAll("*")) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    // WCAG AA: large text is allowed 3:1, everything else needs 4.5:1.
    const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    const r = ratio(fg.rgb, backgroundOf(el));
    if (r < need) {
      low.push({
        text: own.slice(0, 40),
        cls: el.className || el.tagName,
        size: Math.round(size),
        ratio: Number(r.toFixed(2)),
        need,
      });
    }
  }

  // details is not the focusable part; its summary is.
  const interactive = [...document.querySelectorAll("button,input,select,textarea,a[href],summary")];
  const unnamed = interactive
    .filter((el) => !(el.getAttribute("aria-label") || el.textContent || el.value || "").trim())
    .map((el) => `${el.tagName}.${el.className}`);
  const unreachable = interactive.filter((el) => el.tabIndex < 0).map((el) => `${el.tagName}.${el.className}`);

  return { low, unnamed, unreachable, interactive: interactive.length };
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--allow-file-access-from-files"],
});

async function audit(label, theme, setup) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
  await page.goto(FILE, { waitUntil: "load" });
  await new Promise((r) => setTimeout(r, 600));
  if (setup) {
    await page.evaluate(setup);
    await new Promise((r) => setTimeout(r, 400));
  }
  const out = await page.evaluate(inspect);
  await page.close();

  console.log(`\n=== ${label} (${theme}) === ${out.interactive} interactive elements`);
  console.log(`  below the contrast minimum: ${out.low.length}`);
  for (const l of out.low.slice(0, 8)) {
    console.log(`    ${l.ratio}:1 needs ${l.need}  ${l.size}px .${l.cls}  "${l.text}"`);
  }
  if (out.unnamed.length) console.log(`  no accessible name: ${out.unnamed.join(", ")}`);
  if (out.unreachable.length) console.log(`  keyboard cannot reach: ${out.unreachable.join(", ")}`);
  return out.low.length + out.unnamed.length + out.unreachable.length;
}

const openTimedSheet = () => {
  S.skill = "arith.multiply";
  S.level = 2;
  S.screen = "level";
  render();
  [...document.querySelectorAll("button")].find((b) => /Beat the clock|đồng hồ/.test(b.textContent)).click();
};

const openDrillFeedback = () => {
  S.skill = "prob.bayes";
  S.level = 2;
  S.screen = "level";
  render();
  document.querySelector(".card .primary").click();
  S.verdict = grade(S.paper.questions[S.i], "999");
  render();
};

let failures = 0;
for (const theme of ["dark", "light"]) {
  failures += await audit("ladder", theme, null);
  failures += await audit("timed sheet", theme, openTimedSheet);
  failures += await audit("drill feedback", theme, openDrillFeedback);
}

await browser.close();

if (failures) {
  console.error(`\n${failures} accessibility problems`);
  process.exit(1);
}
console.log("\nno contrast, naming or keyboard problems found");
