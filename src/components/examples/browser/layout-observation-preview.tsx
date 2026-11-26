import { Checkbox } from "@oddmash/ui/checkbox";
import { useEffect, useRef, useState } from "react";
import "src/components/examples/example.scss";
import "./layout-observation-preview.scss";

export const LayoutObservationPreview = () => {
  const sampleRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<number>();
  const [elementChanges, setElementChanges] = useState(0);
  const [windowResizes, setWindowResizes] = useState(0);

  useEffect(() => {
    const sample = sampleRef.current;
    if (!sample) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setContentWidth(Math.round(entry.contentRect.width));
      setElementChanges((count) => count + 1);
    });
    const handleWindowResize = () => setWindowResizes((count) => count + 1);

    observer.observe(sample);
    window.addEventListener("resize", handleWindowResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <div className="inline-example layout-observation-preview">
      <label className="inline-example__check">
        <Checkbox checked={sidebarOpen} onChange={(event) => setSidebarOpen(event.currentTarget.checked)} />
        사이드바 표시
      </label>
      <div className="layout-observation-preview__window" data-sidebar={sidebarOpen}>
        {sidebarOpen && <span className="layout-observation-preview__sidebar">사이드바</span>}
        <div ref={sampleRef} className="layout-observation-preview__article">
          창을 그대로 둬도 본문에 쓸 수 있는 공간은 달라집니다.
        </div>
      </div>
      <dl className="layout-observation-preview__measurements">
        <div><dt>본문 콘텐츠 폭</dt><dd data-content-width={contentWidth}>{contentWidth === undefined ? "측정 대기" : `${contentWidth}px`}</dd></div>
        <div><dt><code>ResizeObserver</code></dt><dd data-element-changes={elementChanges}>{elementChanges}회</dd></div>
        <div><dt><code>window.resize</code></dt><dd data-window-resizes={windowResizes}>{windowResizes}회</dd></div>
      </dl>
    </div>
  );
};
