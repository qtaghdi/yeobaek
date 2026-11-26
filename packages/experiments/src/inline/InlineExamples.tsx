import { useId, useRef, useState } from "react";
import "./inline.scss";

export const SemanticDemo = () => {
  const [fake, setFake] = useState(0);
  const [native, setNative] = useState(0);

  return (
    <div className="inline-example inline-example--comparison">
      <div>
        <p className="inline-example__caption">div · 의도된 실패</p>
        <div className="inline-example__button" onClick={() => setFake((value) => value + 1)}>
          클릭 {fake}
        </div>
      </div>
      <div>
        <p className="inline-example__caption">button · 기본 동작</p>
        <button className="inline-example__button" type="button" onClick={() => setNative((value) => value + 1)}>
          클릭 {native}
        </button>
      </div>
    </div>
  );
};

export const TabOrderDemo = () => {
  const [skip, setSkip] = useState(false);
  return (
    <div className="inline-example">
      <label className="inline-example__check">
        <input type="checkbox" checked={skip} onChange={(event) => setSkip(event.target.checked)} />
        두 번째 버튼에 tabindex="-1" 적용
      </label>
      <div className="inline-example__row">
        {[1, 2, 3].map((value) => (
          <button key={value} type="button" className="inline-example__button" tabIndex={skip && value === 2 ? -1 : 0}>
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export const DialogDemo = () => {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = useId();
  return (
    <div className="inline-example">
      <button ref={trigger} type="button" className="inline-example__button" onClick={() => dialog.current?.showModal()}>
        모달 열기
      </button>
      <dialog ref={dialog} aria-labelledby={title} className="inline-example__dialog" onClose={() => trigger.current?.focus()}>
        <h3 id={title}>확인 대화상자</h3>
        <p>Tab 또는 Escape 키를 눌러 보세요.</p>
        <form method="dialog" className="inline-example__row">
          <button type="submit" className="inline-example__button">닫기</button>
          <button type="submit" className="inline-example__button">확인</button>
        </form>
      </dialog>
    </div>
  );
};

export const FlexDemo = () => {
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

export const EventDemo = () => {
  const [stop, setStop] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);
  const append = (entry: string) => setEntries((items) => [...items, entry].slice(-9));

  return (
    <div className="inline-example">
      <label className="inline-example__check">
        <input type="checkbox" checked={stop} onChange={(event) => setStop(event.target.checked)} />
        stopPropagation 적용
      </label>
      <div className="inline-example__event" onClickCapture={() => append("부모 캡처")} onClick={() => append("부모 버블")}>
        <button type="button" className="inline-example__button" onClick={(event) => {
          if (stop) event.stopPropagation();
          append("대상 버튼");
        }}>안쪽 버튼</button>
      </div>
      <ol className="inline-example__log" aria-live="polite">
        {entries.length === 0 ? <li>버튼을 눌러 보세요.</li> : entries.map((entry, index) => <li key={index}>{entry}</li>)}
      </ol>
      <button type="button" className="inline-example__button" onClick={() => setEntries([])}>기록 지우기</button>
    </div>
  );
};

export const StateDemo = () => {
  const [direct, setDirect] = useState(0);
  const [functional, setFunctional] = useState(0);
  return (
    <div className="inline-example inline-example--comparison">
      <div>
        <p className="inline-example__caption">현재 렌더 값</p>
        <output className="inline-example__count" aria-live="polite">{direct}</output>
        <button type="button" className="inline-example__button" onClick={() => {
          setDirect(direct + 1);
          setDirect(direct + 1);
          setDirect(direct + 1);
        }}>세 번 요청</button>
      </div>
      <div>
        <p className="inline-example__caption">이전 상태 updater</p>
        <output className="inline-example__count" aria-live="polite">{functional}</output>
        <button type="button" className="inline-example__button" onClick={() => {
          setFunctional((value) => value + 1);
          setFunctional((value) => value + 1);
          setFunctional((value) => value + 1);
        }}>세 번 요청</button>
      </div>
      <button type="button" className="inline-example__button" onClick={() => {
        setDirect(0);
        setFunctional(0);
      }}>초기화</button>
    </div>
  );
};

export const SkeletonDemo = () => {
  const [loaded, setLoaded] = useState(false);
  const card = <div className="inline-example__loaded"><strong>문서 제목</strong><p>문서의 설명과 작성 정보입니다.</p><span>읽기 →</span></div>;
  return (
    <div className="inline-example">
      <button type="button" className="inline-example__button" onClick={() => setLoaded((value) => !value)}>
        {loaded ? "다시 로딩" : "로딩 완료"}
      </button>
      <div className="inline-example--comparison">
        <div>
          <p className="inline-example__caption">높이를 유지하지 않음</p>
          <div>{loaded ? card : <p role="status">로딩 중</p>}</div>
          <p className="inline-example__next">다음 콘텐츠</p>
        </div>
        <div>
          <p className="inline-example__caption">레이아웃에 맞춘 스켈레톤</p>
          {loaded ? card : <div className="inline-example__loaded inline-example__skeleton" role="status" aria-label="로딩 중"><span /><span /><span /></div>}
          <p className="inline-example__next">다음 콘텐츠</p>
        </div>
      </div>
    </div>
  );
};
