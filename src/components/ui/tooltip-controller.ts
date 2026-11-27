let nextId = 0;

export const mountTooltip = (trigger: HTMLElement, panel: HTMLElement) => {
  const controller = new AbortController();
  const { signal } = controller;
  if (!panel.id) panel.id = "yb-reference-tooltip-" + ++nextId;
  const id = panel.id;
  panel.setAttribute("role", "tooltip");
  const originalTitle = trigger.getAttribute("title");
  if (originalTitle !== null) trigger.removeAttribute("title");
  const descriptions = new Set((trigger.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
  descriptions.add(id);
  trigger.setAttribute("aria-describedby", [...descriptions].join(" "));

  let hovered = false;
  let overPanel = false;
  let focused = document.activeElement === trigger;
  let dismissed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const place = () => {
    if (panel.hidden) return;
    const anchor = trigger.getBoundingClientRect();
    const rect = panel.getBoundingClientRect();
    const margin = 12;
    const left = Math.max(margin, Math.min(anchor.left, window.innerWidth - rect.width - margin));
    const below = anchor.bottom + 6;
    const top = below + rect.height <= window.innerHeight - margin ? below : Math.max(margin, anchor.top - rect.height - 6);
    panel.style.left = left + "px";
    panel.style.top = top + "px";
  };
  const show = () => {
    clearTimeout(timer);
    if (dismissed) return;
    panel.hidden = false;
    place();
  };
  const hide = () => { clearTimeout(timer); panel.hidden = true; };
  const scheduleHide = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (!hovered && !overPanel && !focused) hide(); }, 160);
  };
  trigger.addEventListener("pointerenter", event => {
    if (event.pointerType === "touch") return;
    hovered = true; dismissed = false; show();
  }, { signal });
  trigger.addEventListener("pointerleave", () => { hovered = false; scheduleHide(); }, { signal });
  panel.addEventListener("pointerenter", () => { overPanel = true; clearTimeout(timer); }, { signal });
  panel.addEventListener("pointerleave", () => { overPanel = false; scheduleHide(); }, { signal });
  trigger.addEventListener("focus", () => { focused = true; dismissed = false; show(); }, { signal });
  trigger.addEventListener("blur", () => { focused = false; scheduleHide(); }, { signal });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) { dismissed = true; hide(); }
  }, { signal });
  window.addEventListener("resize", place, { signal });
  window.addEventListener("scroll", place, { signal, capture: true });
  if (focused) show();

  return { destroy: () => {
    controller.abort();
    hide();
    const remaining = (trigger.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(value => value && value !== id);
    if (remaining.length) trigger.setAttribute("aria-describedby", remaining.join(" "));
    else trigger.removeAttribute("aria-describedby");
    if (originalTitle !== null && !trigger.hasAttribute("title")) trigger.setAttribute("title", originalTitle);
    panel.style.removeProperty("left");
    panel.style.removeProperty("top");
  } };
};
