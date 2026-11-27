import assert from "node:assert/strict";
import { test } from "node:test";
import { initialStorage, updateStorage, maxTabs } from "../src/components/examples/browser/storage-model.ts";

test("가상 탭의 같은 출처 localStorage 공유와 페이지 세션 분리", () => {
  let s = initialStorage();
  for (const type of ["density", "draft", "reload", "new"]) s = updateStorage(s, { type });
  assert.equal(s.dense, true);
  assert.equal(s.tabs[0].hasDraft, true);
  assert.equal(s.tabs[0].refreshes, 1);
  assert.equal(s.tabs[1].hasDraft, false);
  s = updateStorage(s, { type: "draft" });
  s = updateStorage(s, { type: "select", id: 1 });
  assert.equal(s.tabs[0].hasDraft, true);
  s = updateStorage(s, { type: "close" });
  assert.equal(s.activeId, 2);
  assert.equal(s.tabs[0].hasDraft, true);
  s = updateStorage(s, { type: "close" });
  assert.equal(s.tabs.length, 1);
  assert.equal(s.tabs[0].hasDraft, false);
  assert.equal(s.dense, true);
  while (s.tabs.length < maxTabs) s = updateStorage(s, { type: "new" });
  assert.equal(updateStorage(s, { type: "new" }), s);
  assert.deepEqual(updateStorage(s, { type: "reset" }), initialStorage());
});
