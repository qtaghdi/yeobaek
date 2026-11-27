import { mountTooltip } from "@oddmash/ui/tooltip-controller";
import { Button } from "@oddmash/ui/button";
import { useEffect, useRef, useState } from "react";
import "src/components/examples/example.scss";
import "../article-quality.scss";

export const ReferenceTooltipExample = () => {
  const trigger = useRef<HTMLAnchorElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [observed, setObserved] = useState({ description: "example-reference-hint", open: false, focused: false });
  const [activations, setActivations] = useState(0);
  useEffect(() => {
    const link = trigger.current, tooltip = panel.current;
    if (!link || !tooltip) return;
    const sync = () => setObserved({ description: link.getAttribute("aria-describedby") ?? "", open: !tooltip.hidden, focused: document.activeElement === link });
    const observer = new MutationObserver(sync);
    observer.observe(link, { attributes: true, attributeFilter: ["aria-describedby"] });
    observer.observe(tooltip, { attributes: true, attributeFilter: ["hidden"] });
    const controller = enabled ? mountTooltip(link, tooltip) : null;
    link.addEventListener("focus", sync);
    link.addEventListener("blur", sync);
    sync();
    return () => {
      observer.disconnect();
      link.removeEventListener("focus", sync);
      link.removeEventListener("blur", sync);
      controller?.destroy();
    };
  }, [enabled]);
  return (
    <div className="inline-example article-quality">
      <div className="article-quality__sample">
        <span id="example-reference-hint">예제 내 이동입니다.</span>
        <a ref={trigger} href="#example-reference-result" aria-describedby="example-reference-hint" onClick={event => { event.preventDefault(); setActivations(value => value + 1); }}>가이드 참고 링크</a>
        <span ref={panel} id="example-reference-tip" className="om-tooltip" hidden>원본 가이드의 부가 설명입니다.</span>
        <Button type="button" className="inline-example__button" onClick={() => setEnabled(value => !value)}>{enabled ? "툴팁 연결 해제" : "툴팁 연결"}</Button>
      </div>
      <dl className="article-quality__observations">
        <div><dt>aria-describedby</dt><dd data-tooltip-description>{observed.description || "없음"}</dd></div>
        <div><dt>툴팁</dt><dd data-tooltip-open>{observed.open ? "열림" : "닫힘"}</dd></div>
        <div><dt>포커스</dt><dd data-tooltip-focus>{observed.focused ? "링크" : "다른 위치"}</dd></div>
        <div><dt>링크 활성화</dt><dd id="example-reference-result">{activations}회</dd></div>
      </dl>
    </div>
  );
};
