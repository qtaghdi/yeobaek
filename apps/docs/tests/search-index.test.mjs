import { test } from "node:test";
import assert from "node:assert/strict";
import { searchArticles, relatedQueries, getMatchRanges, makeSearchPreview } from "../src/lib/search/search-index.ts";

const article = (id, title, keywords, text) => ({
  id, title, keywords, description: title, category: "테스트", url: "/" + id + "/",
  sections: [{ title: "본문", text }],
});

const entries = [
  article("focus", "포커스 링은 왜 필요할까?", ["focus", "키보드", "접근성"], "브라우저의 outline을 활용합니다."),
  article("dialog", "모달이 닫히면 포커스는 어디로 가야 할까?", ["dialog", "포커스"], "Escape를 누릅니다."),
  article("query", "서버 상태와 Query Key", ["TanStack Query", "서버 상태"], "staleTime을 사용합니다."),
  article("wrap", "한국어 줄바꿈을 다루는 방법", ["Juliya", "줄바꿈"], "텍스트 실제 너비를 측정합니다."),
];

test("한글 검색과 띄어쓰기 차이", () => {
  assert.equal(searchArticles(entries, "포커스 링")[0].article.id, "focus");
  assert.equal(searchArticles(entries, "포커스링")[0].article.id, "focus");
  assert.equal(searchArticles(entries, "줄 바꿈")[0].article.id, "wrap");
});

test("영문 대소문자, 별칭, 본문 검색", () => {
  assert.equal(searchArticles(entries, "TANSTACK QUERY")[0].article.id, "query");
  assert.equal(searchArticles(entries, "staleTime")[0].article.id, "query");
  assert.equal(searchArticles(entries, "outline")[0].article.id, "focus");
});

test("관련 검색어 중복과 검색 결과 없음", () => {
  const related = relatedQueries(entries, "focus");
  assert.ok(related.includes("키보드"));
  assert.ok(!related.includes("focus"));
  assert.deepEqual(searchArticles(entries, "존재하지않는검색어"), []);
  assert.deepEqual(searchArticles(entries, " "), []);
});

test("띄어쓰기와 대소문자가 다른 실제 원문 범위를 찾는다", () => {
  const text = "본문에는 포커스 링과 focus-visible이 있습니다.";
  const range = getMatchRanges(text, "포커스링")[0];
  assert.equal(text.slice(range.start, range.end), "포커스 링");
  const english = getMatchRanges(text, "FOCUS VISIBLE")[0];
  assert.equal(text.slice(english.start, english.end), "focus-visible");
});

test("본문 앞부분이 길어도 일치하는 구절을 미리보기에 포함한다", () => {
  const text = "앞부분 ".repeat(80) + "검색할 정확한 구절이 있습니다.";
  const preview = makeSearchPreview(text, "정확한구절");
  assert.ok(preview.startsWith("…"));
  assert.ok(preview.includes("정확한 구절"));
});

test("제목이 아닌 본문 검색은 일치하는 섹션으로 연결한다", () => {
  const entry = { ...entries[0], sections: [
    { title: "개요", text: "다른 이야기" },
    { title: "outline", text: "브라우저의 outline을 활용합니다.", anchor: "outline" },
  ] };
  const result = searchArticles([entry], "outline")[0];
  assert.equal(result.target, "outline");
  assert.equal(result.bodyMatches, true);
  assert.equal(result.titleMatches, false);
  assert.equal(searchArticles([entry], "포커스 링")[0].target, undefined);
});
