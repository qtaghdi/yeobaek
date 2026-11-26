import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import references from "../src/features/references/reference-catalog.mjs";
import { remarkReferenceNotes, rehypeReferenceNotes } from "../src/features/references/reference-notes.mjs";

test("external citation summaries cover all current Markdown sources", () => {
  const docs = fileURLToPath(new URL("../src/content/docs/", import.meta.url));
  const used = new Set();
  for (const file of readdirSync(docs, { recursive: true })) {
    if (!/\.mdx?$/.test(file)) continue;
    const source = readFileSync(join(docs, file), "utf8");
    const prose = source.replace(/```[\s\S]*?```/g, "");
    for (const match of prose.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      const url = match[1];
      used.add(url);
      assert.ok(references[url]?.summary, `${file}: ${url}`);
    }
  }
  assert.ok(used.size > 100);
});

test("a citation receives a tooltip and repeated URLs share a footnote", () => {
  const url = "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling";
  const link = () => ({ type: "link", url, children: [{ type: "text", value: "MDN" }] });
  const tree = { type: "root", children: [{ type: "paragraph", children: [link(), link(), { type: "link", url: "../internal/", children: [] }] }] };
  remarkReferenceNotes()(tree);
  const [first, ref, second, refAgain, internal] = tree.children[0].children;
  assert.equal(first.title, references[url].summary);
  assert.equal(second.title, first.title);
  assert.equal(ref.identifier, refAgain.identifier);
  assert.equal(internal.url, "../internal/");
  assert.equal(tree.children.length, 2);
  assert.equal(tree.children[1].type, "footnoteDefinition");
  assert.equal(tree.children[1].children[0].children[0].url, url);
});

test("reference labels are localized without changing anchors", () => {
  const heading = { type: "element", tagName: "h2", properties: { id: "footnote-label", className: ["sr-only"] }, children: [{ type: "text", value: "Footnotes" }] };
  const back = { type: "element", tagName: "a", properties: { href: "#ref", dataFootnoteBackref: "" }, children: [] };
  rehypeReferenceNotes()({ type: "root", children: [{ type: "element", tagName: "section", properties: { dataFootnotes: "" }, children: [heading, back] }] });
  assert.equal(heading.children[0].value, "참고 자료 요약");
  assert.equal(back.properties.ariaLabel, "본문의 인용 위치로 돌아가기");
  assert.equal(back.properties.href, "#ref");
  assert.equal(back.children[0].value, "본문으로");
});
