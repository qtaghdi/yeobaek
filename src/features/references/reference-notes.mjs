import references from "./reference-catalog.mjs";

const text = (value) => ({ type: "text", value });
const element = (tagName, properties, children) => ({ type: "element", tagName, properties, children });
const linkText = (node) => node.children?.map(linkText).join("") ?? node.value ?? node.alt ?? "";
const validTitle = (value) => typeof value === "string" && value.trim() && !/^(undefined|null)$/i.test(value.trim());

const inputSummary = "제어형과 비제어형 입력, 날짜 범위 필터의 입력값과 적용값을 살펴봅니다.";
const relatedSummaries = {
  "../controlled-input/": inputSummary,
  "../../react/controlled-input/": inputSummary,
  "../query-keys/": "조회 조건을 Query Key에 담아 캐시를 구분하고 갱신하는 방법을 살펴봅니다.",
  "../testing/": "전체 검사와 증분 검사의 결과를 비교해 테스트가 지켜야 할 동작을 살펴봅니다.",
  "../../css/text-wrap/": "글꼴의 실제 폭을 측정하고 한국어 줄바꿈 위치를 고르는 과정을 살펴봅니다.",
  "../../browser/layout-observation/": "요소 크기와 글꼴이 달라졌을 때 측정 결과를 갱신하는 방법을 살펴봅니다.",
};

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
        const authoredTitle = linkText(child).trim();
        const title = validTitle(reference.title) ? reference.title.trim() : validTitle(authoredTitle) ? authoredTitle : child.url;
        used.set(child.url, { ...reference, title, identifier: `source-${used.size + 1}` });
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
      children: [
        { type: "paragraph", children: [{ type: "link", url, children: [text(title)] }] },
        { type: "paragraph", data: { hProperties: { className: ["reference-note-summary"] } }, children: [text(summary)] },
      ],
    });
  }
};

const mergeAuthoredReferences = (tree) => {
  const section = tree.children.find(node => node.tagName === "section" && node.properties?.dataFootnotes !== undefined);
  const notes = section?.children.find(node => node.tagName === "ol");
  if (!notes) return;

  const index = tree.children.findLastIndex(node =>
    node.tagName === "h2" && node.children.some(child => child.type === "text" && child.value === "참고 자료"),
  );
  if (index < 0) return;
  const trailing = tree.children.slice(index + 1, tree.children.indexOf(section)).filter(node => node.type !== "text" || node.value.trim());
  if (trailing.length !== 1 || trailing[0].tagName !== "ul") return;

  const entries = trailing[0].children.filter(node => node.tagName === "li");
  const links = entries.flatMap(item =>
    item.children.flatMap(child => child.tagName === "p" ? child.children : [child]),
  );
  if (!links.length || links.some(node =>
    node.tagName !== "a" && node.tagName !== "sup" && (node.type !== "text" || /[^\s·,]/.test(node.value)),
  )) return;

  const listedUrls = new Set(notes.children.flatMap(item =>
    (item.children ?? []).flatMap(child =>
      child.tagName === "p" ? child.children.filter(node => node.tagName === "a").map(node => node.properties.href) : [],
    ),
  ));
  for (const link of links) {
    if (link.tagName !== "a" || listedUrls.has(link.properties.href)) continue;
    const url = link.properties.href;
    listedUrls.add(url);
    const children = [element("p", {}, [link])];
    const summary = relatedSummaries[url];
    if (summary) children.push(element("p", { className: ["reference-note-summary"] }, [text(summary)]));
    notes.children.push(element("li", {}, children));
  }

  const id = tree.children[index].properties?.id ?? "참고-자료";
  if (id !== "footnote-label") section.properties.id = id;
  tree.children.splice(index, tree.children.indexOf(section) - index);
};

export const rehypeReferenceNotes = () => (tree) => {
  mergeAuthoredReferences(tree);
  const visit = (node, inNotes = false) => {
    const notes = inNotes || (node.tagName === "section" && node.properties?.dataFootnotes !== undefined);
    if (notes && node.tagName === "h2" && node.properties?.id === "footnote-label") {
      node.properties.className = ["reference-notes-heading"];
      node.children = [text("참고 자료")];
    }
    if (node.tagName === "a" && typeof node.properties?.href === "string" && references[node.properties.href]) {
      node.properties.dataReferenceSummary = references[node.properties.href].summary;
    }
    if (notes && node.children) {
      node.children = node.children.filter(child => !(
        child.properties?.dataFootnoteBackref !== undefined &&
        /^#user-content-fnref-source-\d+(?:-\d+)?$/.test(child.properties.href)
      ));
    }
    node.children?.forEach((child) => visit(child, notes));
  };
  visit(tree);
};
