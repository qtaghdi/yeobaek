import { Button } from "@oddmash/ui/button";
import { useEffect, useRef, useState } from "react";
import "src/components/examples/example.scss";
import "./resize-subscription.scss";

export const ResizeSubscription = () => {
  const [wide, setWide] = useState(true);
  const [observe, setObserve] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observe || !panel.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setMeasuredWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, [observe]);

  return (
    <div className="inline-example resize-subscription">
      <div className="inline-example__row">
        <Button type="button" className="inline-example__button"
          onClick={() => setWide(!wide)}>{wide ? "패널 좁히기" : "패널 넓히기"}</Button>
        <Button type="button" className="inline-example__button"
          onClick={() => setObserve(!observe)}>{observe ? "관찰 해제" : "크기 관찰"}</Button>
      </div>
      <div className="resize-subscription__panel" data-wide={wide} ref={panel}>관찰 대상</div>
      <p className="inline-example__caption">최근 관찰한 너비 <output aria-live="polite">
        {measuredWidth === null ? "측정 전" : `${measuredWidth}px`}
      </output></p>
    </div>
  );
};
