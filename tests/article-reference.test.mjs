import assert from "node:assert/strict";
import { test } from "node:test";
import { documentSections } from "../src/features/navigation/document-sections.mjs";
import { relatedArticles } from "../src/features/navigation/article-relations.mjs";
import { parseArticleDates } from "../src/features/navigation/article-dates.mjs";

test("모든 공개 글에 유효한 관련 글이 있고 자기 자신은 포함하지 않는다", () => {
  const routes = documentSections.flatMap(section => section.chapters.flatMap(chapter => chapter.pages));
  for (const route of routes) {
    const related = relatedArticles(route);
    assert.ok(related.length >= 1 && related.length <= 3, route);
    assert.equal(new Set(related).size, related.length);
    assert.ok(related.every(link => link !== route && routes.includes(link)), route);
  }
  assert.deepEqual(relatedArticles("start"), []);
});

test("문서의 최초 변경과 마지막 변경을 구분하고 없는 날짜를 만들지 않는다", () => {
  assert.deepEqual(parseArticleDates("2026-11-27\n2026-11-26\n2026-11-24\n"), { created: "2026-11-24", updated: "2026-11-27" });
  assert.deepEqual(parseArticleDates("2026-11-24"), { created: "2026-11-24", updated: "2026-11-24" });
  assert.equal(parseArticleDates(""), null);
});
