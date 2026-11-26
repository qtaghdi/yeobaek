export type TooltipController = { destroy: () => void };

let nextId = 0;

export const mountTooltip = (trigger: HTMLElement, tooltip: HTMLElement): TooltipController => {
  const doc = trigger.ownerDocument;
  const view = doc.defaultView;
  if (!view) return { destroy: () => undefined };

  const previousDescription = trigger.getAttribute('aria-describedby');
  const previousTitle = trigger.getAttribute('title');
  if (!tooltip.id) {
    do { tooltip.id = `om-tooltip-${++nextId}`; } while (doc.getElementById(tooltip.id) && doc.getElementById(tooltip.id) !== tooltip);
  }
  const descriptions = new Set((previousDescription ?? '').split(/\s+/).filter(Boolean));
  descriptions.add(tooltip.id);
  trigger.setAttribute('aria-describedby', [...descriptions].join(' '));
  trigger.removeAttribute('title');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;

  const controller = new AbortController();
  const { signal } = controller;
  let active = false;
  let hoveringTrigger = false;
  let hoveringTooltip = false;
  let focused = false;
  let dismissed = false;
  let timer: number | undefined;

  const position = () => {
    if (!active) return;
    const anchor = trigger.getBoundingClientRect();
    const panel = tooltip.getBoundingClientRect();
    const gap = 8;
    const viewport = view.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const right = left + (viewport?.width ?? view.innerWidth);
    const bottom = top + (viewport?.height ?? view.innerHeight);
    const x = Math.max(left + gap, Math.min(anchor.left + (anchor.width - panel.width) / 2, right - panel.width - gap));
    const above = anchor.top - panel.height - gap;
    const below = anchor.bottom + gap;
    const y = Math.max(top + gap, Math.min(above >= top + gap ? above : below, bottom - panel.height - gap));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  };

  const hide = () => {
    view.clearTimeout(timer);
    if (!active) return;
    active = false;
    if (typeof tooltip.hidePopover === 'function') {
      try { tooltip.hidePopover(); } catch { tooltip.removeAttribute('popover'); }
    }
    tooltip.hidden = true;
  };

  const show = () => {
    view.clearTimeout(timer);
    if (dismissed || active) return;
    active = true;
    tooltip.hidden = false;
    if (typeof tooltip.showPopover === 'function') {
      tooltip.setAttribute('popover', 'manual');
      try { tooltip.showPopover(); } catch { tooltip.removeAttribute('popover'); }
    }
    position();
  };

  const scheduleHide = () => {
    view.clearTimeout(timer);
    if (hoveringTrigger || hoveringTooltip || focused) return;
    dismissed = false;
    timer = view.setTimeout(hide, 140);
  };

  trigger.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    hoveringTrigger = true;
    dismissed = false;
    show();
  }, { signal });
  trigger.addEventListener('pointerleave', () => { hoveringTrigger = false; scheduleHide(); }, { signal });
  tooltip.addEventListener('pointerenter', () => { hoveringTooltip = true; view.clearTimeout(timer); }, { signal });
  tooltip.addEventListener('pointerleave', () => { hoveringTooltip = false; scheduleHide(); }, { signal });
  trigger.addEventListener('focusin', () => { focused = true; dismissed = false; show(); }, { signal });
  trigger.addEventListener('focusout', () => { focused = false; scheduleHide(); }, { signal });
  doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !active) return;
    dismissed = true;
    hoveringTooltip = false;
    hide();
    event.preventDefault();
  }, { signal, capture: true });
  view.addEventListener('resize', position, { signal });
  view.addEventListener('scroll', position, { signal, capture: true, passive: true });
  view.visualViewport?.addEventListener('resize', position, { signal });
  view.visualViewport?.addEventListener('scroll', position, { signal });

  return {
    destroy: () => {
      controller.abort();
      hide();
      if (previousDescription === null) trigger.removeAttribute('aria-describedby');
      else trigger.setAttribute('aria-describedby', previousDescription);
      if (previousTitle !== null) trigger.setAttribute('title', previousTitle);
      tooltip.removeAttribute('popover');
      tooltip.style.removeProperty('top');
      tooltip.style.removeProperty('left');
    },
  };
};
