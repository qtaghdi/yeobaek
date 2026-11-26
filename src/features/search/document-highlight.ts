import { getMatchRanges } from "src/features/search/search-index";
import { readSearchMatchLocation } from "src/features/search/search-location";

const collectTextNodes = (element: HTMLElement) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; start: number; end: number }[] = [];
  let offset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.parentElement?.closest("[data-footnote-ref], [aria-hidden=true], .sl-anchor-link")) continue;
    const end = offset + node.length;
    nodes.push({ node, start: offset, end });
    offset = end;
  }
  return nodes;
};

export const highlightDocumentMatch = (scroll = true, pageTransition?: Promise<void>) => {
  const matchLocation = readSearchMatchLocation();
  if (!matchLocation || !scroll) return;
  const { query, anchor } = matchLocation;
  const root = document.querySelector(".sl-markdown-content");
  if (!root) return;
  const candidates = [...root.querySelectorAll<HTMLElement>("p, li, td, th, h2, h3, h4")]
    .filter((element) => !element.closest(".example-frame, .not-content, pre, .expressive-code") && !element.querySelector("p, li, td, th"));
  const matching = candidates.map((element) => {
    const nodes = collectTextNodes(element);
    return { element, nodes, ranges: getMatchRanges(nodes.map(item => item.node.data).join(""), query) };
  }).filter((candidate) => candidate.ranges.length);
  const inSection = (element: HTMLElement) => {
    if (!anchor) return false;
    let heading: Element | undefined;
    for (const candidate of root.querySelectorAll("h2[id],h3[id],h4[id]")) {
      if (candidate === element || candidate.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) heading = candidate;
      else break;
    }
    return heading?.id === anchor;
  };
  const match = matching.find((candidate) => inSection(candidate.element)) ?? matching[0];
  if (!match) return;

  const { element, nodes, ranges } = match;
  element.dataset.searchHighlight = "true";
  for (const item of nodes.reverse()) {
    const overlaps = ranges.filter((range) => range.end > item.start && range.start < item.end).reverse();
    for (const range of overlaps) {
      const start = Math.max(0, range.start - item.start);
      const end = Math.min(item.end - item.start, range.end - item.start);
      if (end <= start) continue;
      const matchNode = item.node.splitText(start);
      matchNode.splitText(end - start);
      const mark = document.createElement("mark");
      mark.className = "search-document-match";
      matchNode.replaceWith(mark);
      mark.append(matchNode);
    }
  }
  const target = element.querySelector(".search-document-match");
  if (!target) return;
  const clearHighlight = () => {
    for (const mark of element.querySelectorAll(".search-document-match")) mark.replaceWith(...mark.childNodes);
    element.normalize();
    delete element.dataset.searchHighlight;
  };
  const address = location.href;
  let disposed = false;
  let highlightTimer: number | undefined;
  const scrollToMatch = () => {
    if (disposed || !target.isConnected || location.href !== address) return;
    const bounds = target.getBoundingClientRect();
    const rootStyle = document.documentElement.style;
    const previousBehavior = rootStyle.scrollBehavior;
    rootStyle.scrollBehavior = "auto";
    window.scrollTo(window.scrollX, window.scrollY + bounds.top + (bounds.height - window.innerHeight) / 2);
    rootStyle.scrollBehavior = previousBehavior;
    highlightTimer = window.setTimeout(clearHighlight, 2000);
    if (typeof history.state?.index === "number") {
      history.replaceState({ ...history.state, scrollX: window.scrollX, scrollY: window.scrollY }, "");
    }
  };
  if (pageTransition) void pageTransition.then(scrollToMatch, scrollToMatch);
  else scrollToMatch();
  return () => {
    disposed = true;
    window.clearTimeout(highlightTimer);
    if (element.hasAttribute("data-search-highlight")) clearHighlight();
  };
};
