import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { articleDates, newestArticles } from "../src/features/navigation/article-dates.mjs";
import { documentSections } from "../src/features/navigation/document-sections.mjs";

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
const visualRoutes = ["browser/events", "accessibility/focus-ring", "accessibility/tab-order", "accessibility/dialog-focus", "css/text-wrap", "react/server-state", "design/loading-states", "integrations/apple-music-presence", "integrations/docx-dropdown-choice", "backend/workbook-revisions"];

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
for (const route of ["ai/review-ci-gating", "architecture/monorepo", "backend/error-grouping", "design-system/why-design-system", "react/auth-lifecycle"]) {
  const page = await read(join(route, "index.html"));
  assert.match(page, /<figure class="article-diagram[^>]*>[\s\S]+?<figcaption[^>]*>[^<]+<\/figcaption>/, route);
}
const musicPage = await read("integrations/apple-music-presence/index.html");
const screenshot = musicPage.match(/<img src="\/yeobaek\/([^"]+discord-apple-music[^"]+\.webp)"[^>]+alt="Discord 활동[^"]+"/);
assert.ok(screenshot, "Apple Music screenshot with alternative text");
await read(screenshot[1]);
const unavailableReference = /https:\/\/github\.com\/oddmash\/vertactics\/(?:issues\/(?:67|82)|pull\/83|commit\/90a6784ae34eb3735382ae70b65603dfacef2298)\b/i;
for (const route of sourceRoutes) {
  const page = await read(join(route, "index.html"));
  assert.doesNotMatch(page, unavailableReference, `${route}: 공개 글에서 접근할 수 없는 참고 자료`);
  assert.ok(!page.includes('title="Copy to clipboard"'), `${route}: 코드 복사 버튼의 한국어 라벨`);
  if (page.includes("expressive-code")) {
    assert.ok(!page.includes('data-copied="Copied!"'), `${route}: 복사 결과의 한국어 메시지`);
  }
  const notes = page.match(/<section data-footnotes[^>]*>[\s\S]*?<\/section>/)?.[0];
  if (notes) {
    assert.doesNotMatch(page, /참고 자료 요약|<h2[^>]*id="참고-자료"/, `${route}: 참고 자료 제목 중복`);
    const entries = [...notes.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(match => match[1]);
    const urls = entries.map(entry => {
      const links = [...entry.matchAll(/<a\b[^>]*href="([^"]+)"/g)];
      assert.equal(links.length, 1, `${route}: 항목마다 링크 하나`);
      assert.match(entry, /<\/a><\/p>\s*<p class="reference-note-summary">[^<]+<\/p>/, `${route}: 링크 아래 설명`);
      return links[0][1];
    });
    assert.equal(new Set(urls).size, urls.length, `${route}: 참고 자료 URL 중복`);
  }
}
const textWrap = await read("css/text-wrap/index.html");
assert.match(textWrap, /<section data-footnotes[^>]*id="참고-자료"/);
assert.match(textWrap, /<section data-footnotes[\s\S]*?href="\.\.\/\.\.\/browser\/layout-observation\/"[\s\S]*?<\/section>/);
const codePage = await read("react/effects/index.html");
assert.ok(codePage.includes('title="코드 복사"'));
assert.ok(codePage.includes('data-copied="복사했습니다"'));
const catalog = documentSections.flatMap(section => section.chapters.flatMap(chapter => chapter.pages));
assert.deepEqual([...catalog].sort(), sourceRoutes.filter(route => route).sort(), "every public article belongs to exactly one chapter");
for (const route of catalog) {
  const page = await read(join(route, "index.html"));
  assert.match(page, /aria-label="관련 글"/, route);
  if (process.env.CI) {
    assert.match(page, /작성일\s*<time datetime="\d{4}-\d{2}-\d{2}"/, route);
    assert.match(page, /최종 수정일\s*<time datetime="\d{4}-\d{2}-\d{2}"/, route);
  }
}
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
assert.deepEqual([...readme.matchAll(/https:\/\/qtaghdi\.github\.io\/yeobaek\/([^\s)]+)\/\)/g)].map(match => match[1]), catalog);
const home = await read("index.html");
assert.match(await read("start/index.html"), /http-equiv="refresh" content="0; url=\.\.\//);
assert.ok(!home.includes("여백 소개"));
assert.deepEqual([...home.matchAll(/<title>(.*?)<\/title>/g)].map(match => match[1]), ["여백"]);
assert.ok((await read("browser/events/index.html")).includes("<title>클릭 이벤트는 어디까지 전달될까? | 여백</title>"));
assert.ok(home.includes("/yeobaek/favicon.svg"));
assert.match(home, /class="archive-highlights"/);
assert.match(home, /id="latest-heading"[^>]*>최신 글/);
const latest = home.match(/<section class="archive-latest"[\s\S]*?<\/section>/)?.[0];
assert.ok(latest);
assert.doesNotMatch(latest, /<time\b/);
if (process.env.CI) {
  const expected = newestArticles(catalog.flatMap(id => {
    const dates = articleDates(id);
    return dates ? [{ id, ...dates }] : [];
  }));
  const links = [...latest.matchAll(/<a href="\.\/([^"]+)\/"/g)].map(match => match[1]);
  assert.equal(links.length, 3);
  assert.deepEqual(links, expected.map(article => article.id));
}
const index = JSON.parse(await read("search-index.json"));
assert.ok(index.length >= 37);
assert.ok(index.every(entry => entry.url.startsWith("/yeobaek/") && entry.sections.length));
assert.ok(!(await readdir(dist)).includes("lab"));
console.log(`Verified ${sourceRoutes.length} document routes, search index and visual scenes.`);

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
assert.ok(!manifest.dependencies["@oddmash/ui"], "여백 UI 런타임은 독립적으로 유지");
