type MarkerGeometry = { x: number; y: number; width: number; height: number };
type PendingMarker = { path: string; geometry: MarkerGeometry; timestamp: number };

const storageKey = "yeobaek-navigation-marker";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const measure = (root: HTMLElement, target: HTMLElement): MarkerGeometry | undefined => {
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

const readPendingMarker = (): PendingMarker | undefined => {
  try {
    const raw = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
    if (!raw) return;
    const value = JSON.parse(raw) as PendingMarker;
    if (value.path === location.pathname && Date.now() - value.timestamp < 10_000 && Object.values(value.geometry).every(Number.isFinite)) return value;
  } catch { return; }
};

const mountMarker = (root: HTMLElement, currentSelector: string, pending?: PendingMarker) => {
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

  if (pending && !reducedMotion.matches && measure(root, root.querySelector<HTMLElement>(currentSelector) ?? root)) {
    marker.style.transition = "none";
    last = pending.geometry;
    applyGeometry(marker, pending.geometry);
    marker.style.opacity = "1";
    root.classList.add("navigation-marker-ready");
    requestAnimationFrame(() => requestAnimationFrame(() => update()));
  } else update(false);

  if (root.matches("sl-sidebar-state-persist")) {
    document.addEventListener("click", (event) => {
      if (!(event instanceof MouseEvent) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (![...root.querySelectorAll<HTMLAnchorElement>("a[href]")].some((entry) => new URL(entry.href).pathname === url.pathname)) return;
      const active = root.querySelector<HTMLElement>(currentSelector);
      const geometry = active ? measure(root, active) : undefined;
      if (!geometry) return;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({ path: url.pathname, geometry, timestamp: Date.now() }));
      } catch { return; }
    });
  }
  document.fonts?.ready.then(schedule);
  window.addEventListener("pageshow", schedule);
};

const animateDisclosure = (details: HTMLDetailsElement) => {
  const summary = details.querySelector<HTMLElement>(":scope > summary");
  const list = details.querySelector<HTMLElement>(":scope > ul");
  if (!summary || !list) return;
  let animation: Animation | undefined;
  let desired = details.open;

  summary.addEventListener("click", (event) => {
    if (reducedMotion.matches) {
      animation?.cancel();
      animation = undefined;
      list.style.removeProperty("overflow");
      list.style.removeProperty("height");
      desired = !details.open;
      return;
    }
    event.preventDefault();
    const wasOpen = details.open;
    const from = wasOpen ? list.getBoundingClientRect().height : 0;
    desired = animation ? !desired : !wasOpen;
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
      details.open = desired;
      current.cancel();
      list.style.removeProperty("overflow");
      animation = undefined;
    };
  });
};

export const mountNavigationMotion = () => {
  const sidebar = document.querySelector<HTMLElement>(".sidebar-content sl-sidebar-state-persist");
  if (sidebar) {
    for (const details of sidebar.querySelectorAll<HTMLDetailsElement>("details")) animateDisclosure(details);
    mountMarker(sidebar, 'a[aria-current="page"]', readPendingMarker());
  }
  for (const toc of document.querySelectorAll<HTMLElement>("starlight-toc nav, mobile-starlight-toc .dropdown")) {
    mountMarker(toc, 'a[aria-current="true"]');
  }
};
