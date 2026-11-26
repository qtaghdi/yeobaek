import { mountTooltip } from "src/lib/references/tooltip-controller";

export const mountReferenceTooltips = () => {
  const cleanup: (() => void)[] = [];
  for (const trigger of document.querySelectorAll<HTMLAnchorElement>(".sl-markdown-content a[data-reference-summary]")) {
    const summary = trigger.dataset.referenceSummary;
    if (!summary || trigger.closest("[data-footnotes]")) continue;
    const panel = document.createElement("span");
    panel.className = "om-tooltip";
    panel.textContent = summary;
    panel.hidden = true;
    trigger.after(panel);
    const controller = mountTooltip(trigger, panel);
    cleanup.push(() => { controller.destroy(); panel.remove(); });
  }
  return () => cleanup.forEach((dispose) => dispose());
};
