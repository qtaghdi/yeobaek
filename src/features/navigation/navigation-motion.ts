import { getStoredSearchMatchLocation } from "src/features/search/search-location";

type MarkerGeometry = { x: number; y: number; width: number; height: number };
type SidebarState = { groups: Record<string, boolean>; scroll: number };

const sidebarStorageKey = "yeobaek-sidebar-state-v1";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const measure = (root: HTMLElement, target: HTMLElement): MarkerGeometry | undefined => {
  if (target.closest("details:not([open])")) return undefined;
  const bounds = root.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height || !bounds.width) return undefined;
  return { x: rect.left - bounds.left + root.scrollLeft, y: rect.top - bounds.top + root.scrollTop, width: rect.width, height: rect.height };
};

const applyGeometry = (marker: HTMLElement, geometry: MarkerGeometry) => {
  marker.style.transform = `translate(${geometry.x}px, ${geometry.y}px)`;
  marker.style.width = `${geometry.width}px`;
  marker.style.height = `${geometry.height}px`;
};

const mountMarker = (root: HTMLElement, currentSelector: string) => {
  const controller = new AbortController();
  const { signal } = controller;
  const marker = document.createElement("span");
  marker.className = "navigation-marker";
  marker.setAttribute("aria-hidden", "true");
  root.classList.add("navigation-track");
  root.append(marker);
  let frame = 0;
  let last: MarkerGeometry | undefined;
  let current: HTMLElement | null = null;

  const update = (animate = true) => {
    const active = root.querySelector<HTMLElement>(currentSelector);
    if (active !== current) {
      if (current) resize.unobserve(current);
      current = active;
      if (current) resize.observe(current);
    }
    const geometry = current ? measure(root, current) : undefined;
    if (!geometry) {
      root.classList.remove("navigation-marker-ready");
      marker.style.opacity = "0";
      last = undefined;
      return;
    }
    const same = last && Object.keys(geometry).every((key) => geometry[key as keyof MarkerGeometry] === last?.[key as keyof MarkerGeometry]);
    if (!same) {
      marker.style.transition = animate && last && !reducedMotion.matches ? "" : "none";
      applyGeometry(marker, geometry);
      last = geometry;
    }
    marker.style.opacity = "1";
    root.classList.add("navigation-marker-ready");
  };

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update());
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  const mutation = new MutationObserver(schedule);
  mutation.observe(root, { attributes: true, attributeFilter: ["aria-current", "open"], subtree: true });

  update(false);
  document.fonts?.ready.then(() => { if (!signal.aborted) schedule(); });
  window.addEventListener("pageshow", schedule, { signal });
  return () => { controller.abort(); cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); marker.remove(); root.classList.remove("navigation-track", "navigation-marker-ready"); };
};

const animateDisclosure = (details: HTMLDetailsElement, onChange: (open: boolean) => void) => {
  const summary = details.querySelector<HTMLElement>(":scope > summary");
  const list = details.querySelector<HTMLElement>(":scope > ul");
  if (!summary || !list) return () => undefined;
  const controller = new AbortController();
  let animation: Animation | undefined;
  let desired = details.open;

  const settle = () => {
    animation?.cancel();
    animation = undefined;
    details.open = desired;
    list.style.removeProperty("overflow");
  };
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) settle();
  }, { signal: controller.signal });
  summary.addEventListener("click", (event) => {
    event.preventDefault();
    if (reducedMotion.matches) {
      desired = !desired;
      settle();
      onChange(desired);
      return;
    }
    const wasOpen = details.open;
    const from = wasOpen ? list.getBoundingClientRect().height : 0;
    desired = animation ? !desired : !wasOpen;
    onChange(desired);
    animation?.cancel();
    if (desired) details.open = true;
    const to = desired ? list.scrollHeight : 0;
    list.style.overflow = "hidden";
    const current = list.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: 260, easing: "cubic-bezier(.22,.7,.25,1)", fill: "both" },
    );
    animation = current;
    current.onfinish = () => {
      if (animation !== current) return;
      settle();
    };
  }, { signal: controller.signal });
  return () => { controller.abort(); settle(); };
};

const mountSidebar = (sidebar: HTMLElement) => {
  const controller = new AbortController();
  const { signal } = controller;
  const cleanups: (() => void)[] = [];
  let restoreFrame = 0;
  const pane = sidebar.closest<HTMLElement>(".sidebar-pane");
  for (const link of sidebar.querySelectorAll<HTMLAnchorElement>("a[href]")) link.dataset.astroPrefetch = "hover";
  const groups = [...sidebar.querySelectorAll<HTMLDetailsElement>("details")].flatMap((details) => {
    const link = details.querySelector<HTMLAnchorElement>("a[href]");
    if (!link) return [];
    const path = new URL(link.href).pathname;
    const isSection = Boolean(details.querySelector(":scope > ul > li > details"));
    return [{ key: isSection ? `section:${path}` : path, details }];
  });
  let previous: SidebarState | undefined;
  try {
    const raw = sessionStorage.getItem(sidebarStorageKey);
    if (raw) {
      const value = JSON.parse(raw) as SidebarState;
      if (typeof value.groups === "object" && value.groups && Number.isFinite(value.scroll)) previous = value;
    }
  } catch { previous = undefined; }

  const state: SidebarState = { groups: {}, scroll: previous?.scroll ?? pane?.scrollTop ?? 0 };
  const persist = () => {
    state.scroll = pane?.scrollTop ?? 0;
    try { sessionStorage.setItem(sidebarStorageKey, JSON.stringify(state)); } catch { return; }
  };

  for (const { key, details } of groups) {
    const active = Boolean(details.querySelector('a[aria-current="page"]'));
    const stored = previous?.groups[key];
    details.open = active || (typeof stored === "boolean" ? stored : details.open);
    state.groups[key] = details.open;
    cleanups.push(animateDisclosure(details, (open) => {
      state.groups[key] = open;
      persist();
    }));
  }
  if (pane && previous) {
    const savedScroll = previous.scroll;
    pane.scrollTop = savedScroll;
    restoreFrame = requestAnimationFrame(() => { pane.scrollTop = savedScroll; });
  }
  window.addEventListener("pagehide", persist, { signal });
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (link && new URL(link.href).origin === location.origin) persist();
  }, { signal });
  return () => { persist(); controller.abort(); cancelAnimationFrame(restoreFrame); cleanups.forEach((cleanup) => cleanup()); };
};

const syncToc = () => {
  const roots = [...document.querySelectorAll<HTMLElement>("starlight-toc nav, mobile-starlight-toc .dropdown")];
  if (!roots.length) return () => undefined;
  const entries = [...roots[0].querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].flatMap((link) => {
    try {
      const id = decodeURIComponent(link.hash.slice(1));
      const element = document.getElementById(id);
      return element ? [{ id, element }] : [];
    } catch { return []; }
  });
  if (!entries.length) return () => undefined;
  const controller = new AbortController();
  const { signal } = controller;
  const header = document.querySelector("header.header");
  let frame = 0;
  const update = () => {
    const mobileToc = document.querySelector("mobile-starlight-toc");
    const threshold = (header?.getBoundingClientRect().height ?? 64) + (mobileToc?.getBoundingClientRect().height ?? 0) + 42;
    let active = entries[0].id;
    for (const { id, element } of entries) {
      if (element.getBoundingClientRect().top <= threshold) active = id;
      else break;
    }
    if (scrollY > 0 && Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2) {
      active = entries.at(-1)?.id ?? active;
    }
    const searchAnchor = !location.hash && getStoredSearchMatchLocation()?.anchor;
    if (searchAnchor && entries.some(entry => entry.id === searchAnchor)) {
      const bounds = document.querySelector(".search-document-match")?.getBoundingClientRect();
      if (bounds && bounds.top >= threshold - 42 && bounds.bottom <= innerHeight) active = searchAnchor;
    }
    for (const root of roots) {
      let currentLabel = "";
      for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
        let id: string;
        try { id = decodeURIComponent(link.hash.slice(1)); } catch { continue; }
        if (id === active) {
          if (link.getAttribute("aria-current") !== "true") link.setAttribute("aria-current", "true");
          currentLabel = link.textContent?.trim() ?? "";
        } else if (link.hasAttribute("aria-current")) link.removeAttribute("aria-current");
      }
      const label = root.closest("mobile-starlight-toc")?.querySelector(".display-current");
      if (label && currentLabel && label.textContent?.trim() !== currentLabel) label.textContent = currentLabel;
    }
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("resize", schedule, { passive: true, signal });
  window.addEventListener("hashchange", schedule, { signal });
  window.addEventListener("pageshow", schedule, { signal });
  const content = document.querySelector(".sl-markdown-content");
  const resize = new ResizeObserver(schedule);
  if (content) resize.observe(content);
  const mutation = new MutationObserver(schedule);
  for (const root of roots) mutation.observe(root, { attributes: true, attributeFilter: ["aria-current"], subtree: true });
  schedule();
  return () => { controller.abort(); cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); };
};

const mountMobileMenu = () => {
  const host = document.querySelector<HTMLElement>("starlight-menu-button");
  const button = host?.querySelector<HTMLButtonElement>("button");
  const main = document.querySelector<HTMLElement>(".main-frame");
  if (!host || !button || !main) return () => undefined;
  const controller = new AbortController();
  const narrow = matchMedia("(max-width: 49.999rem)");
  const sync = () => {
    const expanded = host.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(expanded && narrow.matches));
    main.inert = expanded && narrow.matches;
    if (expanded && !narrow.matches) {
      host.setAttribute("aria-expanded", "false");
      document.body.removeAttribute("data-mobile-menu-expanded");
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(host, { attributes: true, attributeFilter: ["aria-expanded"] });
  narrow.addEventListener("change", sync, { signal: controller.signal });
  sync();
  return () => { observer.disconnect(); controller.abort(); main.inert = false; };
};

export const mountNavigationMotion = () => {
  const sidebar = document.querySelector<HTMLElement>(".sidebar-content sl-sidebar-state-persist");
  const cleanups: (() => void)[] = [];
  if (sidebar) cleanups.push(mountSidebar(sidebar));
  for (const toc of document.querySelectorAll<HTMLElement>("starlight-toc nav, mobile-starlight-toc .dropdown")) {
    cleanups.push(mountMarker(toc, 'a[aria-current="true"]'));
  }
  cleanups.push(syncToc(), mountMobileMenu());
  return () => cleanups.forEach((cleanup) => cleanup());
};
