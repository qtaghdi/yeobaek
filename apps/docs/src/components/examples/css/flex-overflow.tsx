import { useState } from "react";
import "src/components/examples/example.scss";

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
      <div className="inline-example__scroll" role="region" aria-label="고정 폭 카드 비교 영역" tabIndex={0}>
        <div className="inline-example__flex" data-overflow={!shrink} style={{ inlineSize: width }}>
          <div className="inline-example__filename" style={{ minInlineSize: shrink ? 0 : undefined }}>
            <span>very-long-design-system-component-documentation.tsx</span>
          </div>
          <button type="button" className="inline-example__button">열기</button>
        </div>
      </div>
      <output className="inline-example__flex-status" data-overflow={!shrink}>{shrink ? "최소 너비를 0으로 지정한 상태입니다." : "의도적으로 넘치는 상태입니다. 버튼이 카드 경계 밖으로 이동할 수 있습니다."}</output>
    </div>
  );
};
