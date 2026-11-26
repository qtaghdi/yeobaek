import { useState } from "react";
import "../example.scss";

export const FlexOverflowExample = () => {
  const [width, setWidth] = useState(300);
  const [shrink, setShrink] = useState(false);
  return (
    <div className="inline-example">
      <label className="inline-example__check">
        <input type="checkbox" checked={shrink} onChange={(event) => setShrink(event.target.checked)} />
        min-width: 0
      </label>
      <label className="inline-example__check">
        카드 폭 {width}px
        <input type="range" min="190" max="480" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
      </label>
      <div className="inline-example__scroll">
        <div className="inline-example__flex" style={{ inlineSize: width }}>
          <div className="inline-example__filename" style={{ minInlineSize: shrink ? 0 : undefined }}>
            <span>very-long-design-system-component-documentation.tsx</span>
          </div>
          <button type="button" className="inline-example__button">열기</button>
        </div>
      </div>
      <output>카드의 경계와 버튼 위치를 비교하세요.</output>
    </div>
  );
};
