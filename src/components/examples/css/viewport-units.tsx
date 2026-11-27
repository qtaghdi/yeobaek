import { useState } from "react";
import { Button } from "@oddmash/ui/button";
import "src/components/examples/example.scss";
import "../article-quality.scss";

export const ViewportUnitsExample = () => {
  const [expanded, setExpanded] = useState(true);
  const current = expanded ? 700 : 800;
  const values = [["vh / lvh", 800], ["svh", 700], ["dvh", current]] as const;
  return (
    <div className="inline-example article-quality">
      <div className="inline-example__row">
        <Button type="button" className="inline-example__button" onClick={() => setExpanded(value => !value)}>{expanded ? "주소창 접기" : "주소창 펼치기"}</Button>
        <span>현재 가용 높이 <strong>{current}px</strong></span>
      </div>
      <div className="viewport-unit-model" aria-label="뷰포트 높이 단위 설명 모델">
        {values.map(([unit, height]) => <div className="viewport-unit-model__column" key={unit}>
          <strong>{unit}</strong>
          <div className="viewport-unit-model__screen">
            <div className="viewport-unit-model__box" style={{ height: `${height / 8}%` }}><span>본문</span><span>하단</span></div>
            <div className="viewport-unit-model__chrome" style={{ height: `${(800-current)/8}%` }} aria-hidden="true" />
          </div>
          <span>{height}px</span>
          <small data-viewport-overflow={unit}>{height > current ? `가려짐 ${height-current}px` : height < current ? `남는 공간 ${current-height}px` : "가용 높이와 일치"}</small>
        </div>)}
      </div>
      <small>설명 모델 · 가정한 작은 높이 700px, 큰 높이 800px. 실제 기기 측정값이 아닙니다.</small>
    </div>
  );
};
