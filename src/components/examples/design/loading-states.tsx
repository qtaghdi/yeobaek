import { useState } from "react";
import "src/components/examples/example.scss";
import "./loading-states.scss";

export const LoadingStatesExample = () => {
  const [loaded, setLoaded] = useState(false);
  const cardContent = <><strong>문서 제목</strong><p>문서의 설명과 작성 정보입니다.</p><span>읽기 →</span></>;
  return (
    <div className="inline-example">
      <button type="button" className="inline-example__button" onClick={() => setLoaded((value) => !value)}>
        {loaded ? "다시 로딩" : "로딩 완료"}
      </button>
      <div className="inline-example--comparison loading-demo__comparison">
        <div>
          <p className="inline-example__caption">높이를 유지하지 않음</p>
          <div>{loaded ? <div className="inline-example__loaded">{cardContent}</div> : <p role="status">로딩 중</p>}</div>
          <p className="inline-example__next">다음 콘텐츠</p>
        </div>
        <div>
          <p className="inline-example__caption">레이아웃에 맞춘 스켈레톤</p>
          <div className="inline-example__loaded loading-demo__card">
            <div className="loading-demo__content" aria-hidden={!loaded || undefined}>{cardContent}</div>
            {!loaded && <div className="inline-example__skeleton" role="status" aria-label="로딩 중"><span /><span /><span /></div>}
          </div>
          <p className="inline-example__next">다음 콘텐츠</p>
        </div>
      </div>
    </div>
  );
};
