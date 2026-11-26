import references from "./reference-catalog.mjs";

const text = (value) => ({ type: "text", value });

export const remarkReferenceNotes = () => (tree) => {
  const used = new Map();

  const visit = (node) => {
    if (!Array.isArray(node.children) || node.type === "footnoteDefinition" || node.type === "link") return;
    node.children = node.children.flatMap((child) => {
      const reference = child.type === "link" ? references[child.url] : undefined;
      if (!reference) {
        visit(child);
        return [child];
      }
      if (!used.has(child.url)) {
        used.set(child.url, { ...reference, identifier: `source-${used.size + 1}` });
      }
      const { identifier, summary } = used.get(child.url);
      child.title = child.title || summary;
      return [child, { type: "footnoteReference", identifier, label: identifier }];
    });
  };

  visit(tree);
  for (const [url, { identifier, title, summary }] of used) {
    tree.children.push({
      type: "footnoteDefinition",
      identifier,
      label: identifier,
      children: [{
        type: "paragraph",
        children: [
          { type: "link", url, children: [text(title)] },
          text(` — ${summary}`),
        ],
      }],
    });
  }
};

export const rehypeReferenceNotes = () => (tree) => {
  const visit = (node, inNotes = false) => {
    const notes = inNotes || (node.tagName === "section" && node.properties?.dataFootnotes !== undefined);
    if (notes && node.tagName === "h2" && node.properties?.id === "footnote-label") {
      node.properties.className = ["reference-notes-heading"];
      node.children = [text("참고 자료 요약")];
    }
    if (notes && node.tagName === "a" && node.properties?.dataFootnoteBackref !== undefined) {
      node.properties.ariaLabel = "본문의 인용 위치로 돌아가기";
    }
    node.children?.forEach((child) => visit(child, notes));
  };
  visit(tree);
};
