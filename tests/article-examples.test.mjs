import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

test("등록되지 않은 서버 오류 코드에는 기본 문구를 사용한다", async () => {
  const article = await readFile(new URL("../src/content/docs/react/error-handling.md", import.meta.url), "utf8");
  const code = article.match(/```ts\n([\s\S]+?)```/)[1];
  const getErrorMessage = runInNewContext(stripTypeScriptTypes(code) + "\ngetErrorMessage");
  const fallback = getErrorMessage({ code: "UNKNOWN", status: null });

  assert.equal(fallback, "요청을 처리하지 못했습니다. 다시 시도해주세요.");
  assert.equal(getErrorMessage({ code: "toString", status: 400 }), fallback);
  assert.equal(getErrorMessage({ code: "VALIDATION_FAILED", status: 400 }), "입력한 내용을 다시 확인해주세요.");
});

test("목록 조회와 키 생성 함수는 동일한 캐시 키를 사용한다", async () => {
  const article = await readFile(new URL("../src/content/docs/react/query-keys.md", import.meta.url), "utf8");
  const [query, factory] = [...article.matchAll(/```tsx?\n([\s\S]+?)```/g)].map((match) => match[1]);
  const keys = runInNewContext(stripTypeScriptTypes(query + factory) + "\n[query.queryKey, itemKeys.list(keyword, page)]", {
    useQuery: (options) => options,
    keyword: "여백",
    page: 2,
  });

  assert.deepEqual(keys[0], keys[1]);
});
