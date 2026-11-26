import { test } from "node:test";
import assert from "node:assert/strict";
import { isSearchIndex, searchArticles, relatedQueries, getMatchRanges, makeSearchPreview, isMultiCharacterQuery } from "../src/features/search/search-index.ts";

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

test("문장 검색은 단어를 분리하지 않고 원문의 연속된 구절만 검색한다", () => {
  const records = [
    article("exact", "실제 문장", [], "접근성 상태를 다뤘습니다."),
    article("scattered", "다른 상태를 설명하는 글", ["상태를"], "별도로 접근성을 다뤘습니다."),
    { ...article("split", "개별 절", [], "상태를"), sections: [{title: "첫 절", text: "상태를"}, {title: "다음 절", text: "다뤘습니다."}] },
  ];
  assert.deepEqual(searchArticles(records, "상태를 다뤘습니다.").map(result => result.article.id), ["exact"]);
  assert.deepEqual(getMatchRanges("상태를 따로 다뤘습니다.", "상태를 다뤘습니다."), []);
});

test("초성은 한글 원문과 연속된 초성으로 비교하고 실제 범위를 강조한다", () => {
  assert.equal(searchArticles(entries, "ㅍㅋㅅㄹ")[0].article.id, "focus");
  assert.equal(searchArticles(entries, "ㅈ ㅂ ㄲ")[0].article.id, "wrap");
  assert.equal(searchArticles(entries, "ᄌᄇᄁ")[0].article.id, "wrap");
  const text = "본문의 포커스 링과 😀";
  const range = getMatchRanges(text, "ㅍㅋㅅㄹ")[0];
  assert.equal(text.slice(range.start, range.end), "포커스 링");
  assert.deepEqual(getMatchRanges("포커스 ABC 링", "ㅍㅋㅅㄹ"), []);
  assert.equal(searchArticles([article("double", "쌍자음", [], "")], "ㅆㅈㅇ")[0].article.id, "double");
  const decomposed = "포커스 링".normalize("NFD");
  const decomposedRange = getMatchRanges(decomposed, "ㅍㅋㅅㄹ")[0];
  assert.equal(decomposed.slice(decomposedRange.start, decomposedRange.end), decomposed);
});

test("한 글자 검색은 본문 검색과 연관 검색의 범위를 제한한다", () => {
  assert.equal(isMultiCharacterQuery("상"), false);
  assert.equal(isMultiCharacterQuery("ㅍ"), false);
  assert.equal(isMultiCharacterQuery("ㅍㅋ"), true);
  assert.equal(isMultiCharacterQuery(" "), false);
  assert.equal(isMultiCharacterQuery("."), false);
  assert.deepEqual(searchArticles([article("body", "제목", [], "상태")], "상"), []);
  assert.deepEqual(searchArticles(entries, "포").map(result => result.article.id).sort(), ["dialog", "focus"]);
});

test("같은 섹션에서도 별개의 문단을 연결하지 않는다", () => {
  const entry = article("paragraph", "문서", [], "유지합니다. 실제 레이아웃");
  entry.sections[0].blocks = ["유지합니다.", "실제 레이아웃"];
  assert.deepEqual(searchArticles([entry], "유지합니다. 실제 레이아웃"), []);
  assert.equal(searchArticles([entry], "실제 레이아웃")[0].snippet, "실제 레이아웃");
});
test("잘못된 인덱스를 거부한다", () => {
  assert.equal(isSearchIndex(entries), true);
  assert.equal(isSearchIndex({}), false);
  assert.equal(isSearchIndex([null]), false);
  assert.equal(isSearchIndex([{ ...entries[0], sections: [{ title: "본문", text: 3 }] }]), false);
});
