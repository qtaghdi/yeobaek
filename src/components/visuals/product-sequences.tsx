import { ScenePointer } from "src/components/visuals/scene-pointer";
import "src/components/visuals/product-sequences.scss";

export const CounterScene = ({ step, cueStep }: { step: number; cueStep: number }) => (
  <div className="interaction-targets interaction-counters" aria-hidden="true">
    {[false, true].map((functional) => (
      <div className="interaction-control" key={String(functional)}>
        <small>{functional ? "함수형 갱신" : "직접 갱신"}</small>
        <div className="interaction-count" key={step === 2 ? "result" : "initial"} data-committed={step === 2}>
          {step === 2 ? functional ? 3 : 1 : 0}
        </div>
        <div className="interaction-target interaction-target--control sequence-press" data-action={step === 1} data-preview={cueStep === 1 && step !== cueStep}>
          +3 요청
          {cueStep === 1 && <ScenePointer />}
        </div>
        <div className="interaction-queue" data-action={step === 1}>
          {[0, 1, 2].map((item) => (
            <code key={item} data-shown={step > 0}>{functional ? "+1" : "1"}</code>
          ))}
        </div>
        <code>{functional ? "setCount(c => c + 1)" : "setCount(count + 1)"}</code>
      </div>
    ))}
  </div>
);

export const FilterScene = ({ step, cueStep }: { step: number; cueStep: number }) => {
  const invalid = step === 1;
  const applied = step === 3;

  return (
    <div className="interaction-window" aria-hidden="true">
      <div className="interaction-filter date-sequence">
        <div className="date-sequence__controls">
          <div className="interaction-field" data-active={step === 1}>
            <small>시작일</small><b key={step > 0 ? "15" : "01"}>11월 {step > 0 ? "15" : "01"}일</b>
          </div>
          <div className="interaction-field" data-active={step === 2}>
            <small>종료일</small><b key={step >= 2 ? "20" : "10"}>11월 {step >= 2 ? "20" : "10"}일</b>
          </div>
          <div className="interaction-target interaction-target--control sequence-press" data-dim={invalid} data-action={applied} data-preview={cueStep === 3 && !applied}>
            적용
            {cueStep === 3 && <ScenePointer />}
          </div>
        </div>
        <div className="interaction-filter__result date-sequence__result" data-applied={applied}>
          <small>적용된 범위</small>
          <div className="date-sequence__range">
            <strong data-visible={!applied}>11월 01일 ~ 10일</strong>
            <strong data-visible={applied}>11월 15일 ~ 20일</strong>
          </div>
          <div className="date-sequence__range">
            <span data-warning={invalid} data-visible={!applied}>{invalid ? "시작일이 종료일보다 늦음" : "기존 결과 유지"}</span>
            <span data-visible={applied}>새 범위로 조회</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const requestStates = {
  idle: "아직 요청하지 않음",
  pending: "응답 대기 중",
  done: "응답 도착 · 화면에 적용",
  late: "늦게 도착 · 화면에서 제외",
};

export const RequestScene = ({ step }: { step: number }) => {
  const keyword = step === 0 ? "A" : "B";
  const first = step === 3 ? "late" : "pending";
  const second = step === 0 ? "idle" : step === 1 ? "pending" : "done";

  return (
    <div className="interaction-window" aria-hidden="true">
      <div className="interaction-filter request-sequence">
        <div className="interaction-field request-sequence__search" data-active={step < 2}>
          <small>검색어</small><b key={keyword}>{keyword}</b>
        </div>
        <div className="request-sequence__requests">
          {([["A", first], ["B", second]] as const).map(([name, state]) => (
            <div className="request-sequence__request" key={name} data-state={state}>
              <code>요청 {name}</code>
              <span>{requestStates[state]}</span>
            </div>
          ))}
        </div>
        <div className="interaction-filter__result request-sequence__result">
          <small>현재 화면</small>
          <strong key={step >= 2 ? "result" : keyword}>{step >= 2 ? "B 검색 결과" : `${keyword} 검색 중…`}</strong>
          <span data-visible={step === 3}>이전 A 응답 무시</span>
        </div>
      </div>
    </div>
  );
};
