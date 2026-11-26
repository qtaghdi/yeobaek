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
for (const route of sourceRoutes) {
  const page = await read(join(route, "index.html"));
  assert.ok(!page.includes('title="Copy to clipboard"'), `${route}: 코드 복사 버튼의 한국어 라벨`);
  if (page.includes("expressive-code")) {
    assert.ok(!page.includes('data-copied="Copied!"'), `${route}: 복사 결과의 한국어 메시지`);
  }
}
const codePage = await read("react/effects/index.html");
assert.ok(codePage.includes('title="코드 복사"'));
assert.ok(codePage.includes('data-copied="복사했습니다"'));
const home = await read("index.html");
assert.deepEqual([...home.matchAll(/<title>(.*?)<\/title>/g)].map(match => match[1]), ["여백"]);
assert.ok((await read("browser/events/index.html")).includes("<title>클릭 이벤트는 어디까지 전달될까? | 여백</title>"));
assert.ok(home.includes("/yeobaek/favicon.svg"));
const index = JSON.parse(await read("search-index.json"));
assert.ok(index.length >= 37);
assert.ok(index.every(entry => entry.url.startsWith("/yeobaek/") && entry.sections.length));
assert.ok(!(await readdir(dist)).includes("lab"));
console.log(`Verified ${sourceRoutes.length} document routes, search index and visual scenes.`);
