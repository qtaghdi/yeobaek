import { test } from "node:test";
import assert from "node:assert/strict";
import { stories } from "../src/components/visuals/stories.ts";

test("모든 시각 예제는 읽을 수 있는 단계와 모든 노드의 상태를 포함한다", () => {
  assert.ok(Object.keys(stories).length >= 22);
  for (const [id, story] of Object.entries(stories)) {
    assert.ok(story.frames.length >= 3, id);
    assert.ok(story.nodes.length >= 2, id);
    for (const frame of story.frames) {
      assert.equal(frame.states.length, story.nodes.length, id);
      assert.ok(frame.label.length && frame.note.length, id);
    }
  }
});

test("키보드 설명은 실제 문서 포커스를 변경하지 않고 입력 순서를 제공한다", () => {
  assert.deepEqual(stories["focus-ring"].frames.map((frame) => frame.key), ["Tab", "Tab", "Tab", "Shift + Tab"]);
  assert.equal(stories["dialog-focus"].frames.at(-1).key, "Escape");
  assert.equal(stories["dialog-focus"].frames.at(-1).states[0].value, "포커스 복원");
});
