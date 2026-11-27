import { mountKowrap, type KowrapController } from "@oddmash/juliya/dom";

const excluded = ".not-content, .example-frame, .visual-story, .article-diagram, [data-footnotes], [data-search-highlight], .chapter-index";
const isProse = (element: HTMLElement) => {
  const text = element.textContent?.trim() ?? "";
  return text.length >= 12 && text.length <= 500 && /[가-힣]/.test(text) &&
    !element.closest(excluded) && !element.hasAttribute("data-juliya-prose") &&
    element.childElementCount === 0 && element.clientWidth > 0;
};

const fits = (element: HTMLElement) => {
  const box = element.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(element);
  return [...range.getClientRects()].every(rect => !rect.width || (rect.left >= box.left - 2 && rect.right <= box.right + 2));
};

export const mountProseWrapping = () => {
  const root = document.querySelector<HTMLElement>(".sl-markdown-content");
  if (!root) return () => {};
  const mounted = new Map<HTMLElement, KowrapController>();
  const rejected = new Set<HTMLElement>();
  let disposed = false;
  let frame = 0;
  let width = root.clientWidth;

  const reset = (element: HTMLElement) => {
    mounted.get(element)?.destroy();
    mounted.delete(element);
    delete element.dataset.juliyaWrapped;
  };
  const validate = () => {
    frame = 0;
    for (const element of mounted.keys()) {
      if (fits(element)) continue;
      reset(element);
      rejected.add(element);
    }
  };
  const schedule = () => {
    if (!disposed && !frame) frame = requestAnimationFrame(validate);
  };
  const apply = () => {
    if (disposed) return;
    for (const element of root.querySelectorAll<HTMLElement>("p")) {
      if (mounted.has(element) || rejected.has(element) || !isProse(element)) continue;
      try {
        const controller = mountKowrap(element, { inline: true, locale: "ko", strategy: "balanced", breakLongWords: false });
        mounted.set(element, controller);
        element.dataset.juliyaWrapped = "true";
      } catch {
        rejected.add(element);
      }
    }
    validate();
  };

  const mutations = new MutationObserver(records => {
    if (records.some(record => [...mounted.keys()].some(element => element.contains(record.target)))) schedule();
  });
  mutations.observe(root, { childList: true, characterData: true, subtree: true });
  const size = new ResizeObserver(() => {
    const next = root.clientWidth;
    if (next !== width) {
      width = next;
      rejected.clear();
      apply();
    }
    schedule();
  });
  size.observe(root);
  if (document.fonts.status === "loaded") apply();
  else void document.fonts.ready.then(apply);

  return () => {
    disposed = true;
    mutations.disconnect();
    size.disconnect();
    cancelAnimationFrame(frame);
    for (const element of mounted.keys()) reset(element);
    rejected.clear();
  };
};
