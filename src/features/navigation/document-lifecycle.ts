import { mountKowrap } from "@oddmash/juliya/dom";
import { searchNavigation } from "src/features/search/search-location";
import { highlightDocumentMatch } from "src/features/search/document-highlight";
import { mountNavigationMotion } from "src/features/navigation/navigation-motion";
import { mountReferenceTooltips } from "src/features/references/reference-tooltip";

const selectors = ".hero h1, .hero .tagline, h1#_top, .sl-markdown-content :is(h2, h3, p)";
const mountWrapping = () => {
  let disposed = false;
  const cleanups: (() => void)[] = [];
  const apply = () => {
    if (disposed) return;
    for (const element of document.querySelectorAll<HTMLElement>(selectors)) {
      const text = element.textContent?.trim() ?? "";
      if (!/[가-힣]/.test(text) || text.length < 12 || text.length > 180 || !element.clientWidth) continue;
      if (element.closest(".not-content, .example-frame, .chapter-index, [data-search-highlight], [data-footnotes]") || element.querySelector("a, code, pre, button, input, select, textarea, svg, astro-island")) continue;
      if ([...element.children].some(child => !["MARK", "STRONG", "EM", "SPAN", "BR"].includes(child.tagName))) continue;
      try {
        const controller = mountKowrap(element, { inline: true, locale: "ko" });
        element.dataset.juliyaWrapped = "true";
        cleanups.push(() => { controller.destroy(); delete element.dataset.juliyaWrapped; });
      } catch { delete element.dataset.juliyaWrapped; }
    }
  };
  if (!document.fonts || document.fonts.status === "loaded") apply();
  else void document.fonts.ready.then(apply);
  return () => { disposed = true; cleanups.forEach((dispose) => dispose()); };
};

let disposePage: (() => void) | undefined;
let pendingTimer: number | undefined;
let navigationToken = 0;
let restoreScroll = false;
let pageTransition: Promise<void> | undefined;
let loadingMain: HTMLElement | null = null;
let loadingStatus: HTMLElement | null = null;

const clearLoading = () => {
  window.clearTimeout(pendingTimer);
  loadingMain?.removeAttribute("aria-busy");
  loadingStatus?.remove();
  loadingMain = null;
  loadingStatus = null;
};

const mountPage = () => {
  disposePage?.();
  const navigate = mountNavigationMotion();
  const cancelHighlight = highlightDocumentMatch(!restoreScroll, pageTransition);
  restoreScroll = false;
  pageTransition = undefined;
  const tooltip = mountReferenceTooltips();
  const wrap = mountWrapping();
  disposePage = () => { cancelHighlight?.(); navigate(); tooltip(); wrap(); };
};

document.addEventListener("astro:before-preparation", (event) => {
  const transition = event as Event & { from: URL; to: URL; navigationType?: string; signal?: AbortSignal };
  clearLoading();
  const token = ++navigationToken;
  if (transition.from.pathname === transition.to.pathname && transition.from.search === transition.to.search) return;
  pendingTimer = window.setTimeout(() => {
    if (token !== navigationToken) return;
    loadingMain = document.querySelector<HTMLElement>(".main-pane");
    if (!loadingMain) return;
    loadingMain.setAttribute("aria-busy", "true");
    loadingStatus = document.createElement("div");
    loadingStatus.className = "document-loading";
    loadingStatus.setAttribute("role", "status");
    loadingStatus.textContent = "글 불러오는 중";
    loadingMain.append(loadingStatus);
  }, 180);
  transition.signal?.addEventListener("abort", () => { if (token === navigationToken) clearLoading(); }, { once: true });
});

document.addEventListener("astro:before-swap", (event) => {
  const transition = event as Event & { navigationType?: string; newDocument: Document; viewTransition: ViewTransition; info?: unknown };
  restoreScroll = transition.navigationType === "traverse";
  if (transition.info === searchNavigation) {
    // Skipping the snapshot intentionally prevents the ready promise from resolving.
    void transition.viewTransition.ready.catch(() => {});
    transition.viewTransition.skipTransition();
  } else if (typeof document.startViewTransition === "function") {
    pageTransition = transition.viewTransition.finished;
  }
  const theme = document.documentElement.dataset.theme;
  if (theme) transition.newDocument.documentElement.dataset.theme = theme;
  clearLoading();
  disposePage?.();
  disposePage = undefined;
});
document.addEventListener("astro:after-swap", () => {
  mountPage();
});
document.addEventListener("astro:page-load", () => {
  if (!disposePage) mountPage();
});
