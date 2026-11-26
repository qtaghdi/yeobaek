import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const docs = fileURLToPath(new URL("../src/content/docs/", import.meta.url));
const requiredRoutes = [
  "accessibility/focus-ring",
  "accessibility/semantic-controls",
  "accessibility/tab-order",
  "accessibility/dialog-focus",
  "accessibility/disabled-state",
  "css/stacking-context",
  "css/flex-overflow",
  "css/cascade",
  "css/viewport",
  "css/scrollbar",
  "css/text-wrap",
  "browser/events",
  "browser/storage",
  "browser/layout-observation",
  "language/type-runtime",
  "language/async-requests",
  "react/state-snapshot",
  "react/controlled-input",
  "react/effects",
  "react/state-location",
  "react/query-keys",
  "design/visual-hierarchy",
  "design/loading-states",
  "design/feedback",
  "design-system/tokens",
  "design-system/component-api",
  "design-system/compatibility",
  "architecture/module-boundaries",
  "architecture/monorepo",
  "architecture/testing",
  "architecture/delivery",
  "css/rendering-strategies",
  "react/server-state",
  "react/error-handling",
  "react/auth-lifecycle",
  "design-system/why-design-system",
  "design/team-balance"
];
const visualRoutes = ["browser/events", "accessibility/focus-ring", "accessibility/tab-order", "accessibility/dialog-focus", "css/text-wrap", "react/server-state", "design/loading-states"];

const read = (path) => readFile(join(dist, path), "utf8");
const sourceRoutes = (await readdir(docs, { recursive: true }))
  .filter(path => /\.mdx?$/.test(path))
  .map(path => path.replace(/\.mdx?$/, "").replace(/(^|\/)index$/, "$1").replace(/\/$/, ""));
for (const route of new Set([...requiredRoutes, ...sourceRoutes])) {
  await read(join(route, "index.html"));
}
for (const route of visualRoutes) {
  assert.ok((await read(join(route, "index.html"))).includes("visual-story__stage"), route);
}
const index = JSON.parse(await read("search-index.json"));
assert.ok(index.length >= 37);
assert.ok(index.every(entry => entry.url.startsWith("/yeobaek/") && entry.sections.length));
assert.ok(!(await readdir(dist)).includes("lab"));
console.log(`Verified ${sourceRoutes.length} document routes, search index and visual scenes.`);
