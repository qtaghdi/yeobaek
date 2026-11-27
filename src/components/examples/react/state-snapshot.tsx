import { useState } from "react";
import "src/components/examples/example.scss";
import "./state-snapshot.scss";

const Trace = ({ before, functional }: { before: number | null; functional: boolean }) => (
  <div className="state-trace" aria-label="갱신 큐 설명 모델">
    {before === null ? <p>세 번 요청을 누르면 큐에서 처리되는 값을 볼 수 있습니다.</p> : <>
      <p>클릭 핸들러의 count = <code>{before}</code></p>
      <div className="state-trace__queue">
        {[1, 2, 3].map(step => <div key={step} data-queue-step={step}><small>{step}번째 요청</small><code>{functional ? `${before + step - 1} + 1` : `${before} + 1`}</code><strong>{functional ? before + step : before + 1}</strong></div>)}
      </div>
      <small>큐 처리 원리를 나타낸 설명 모델</small>
    </>}
  </div>
);

export const StateSnapshotExample = () => {
  const [direct, setDirect] = useState(0);
  const [functional, setFunctional] = useState(0);
  const [directBefore, setDirectBefore] = useState<number | null>(null);
  const [functionalBefore, setFunctionalBefore] = useState<number | null>(null);
  return (
    <div className="inline-example inline-example--comparison state-snapshot">
      <div className="state-snapshot__panel">
        <p className="inline-example__caption">현재 렌더 값</p>
        <output className="inline-example__count" aria-live="polite">{direct}</output>
        <Trace before={directBefore} functional={false} />
        <button type="button" className="inline-example__button" onClick={() => {
          setDirectBefore(direct);
          setDirect(direct + 1);
          setDirect(direct + 1);
          setDirect(direct + 1);
        }}>세 번 요청</button>
      </div>
      <div className="state-snapshot__panel">
        <p className="inline-example__caption">이전 상태 updater</p>
        <output className="inline-example__count" aria-live="polite">{functional}</output>
        <Trace before={functionalBefore} functional />
        <button type="button" className="inline-example__button" onClick={() => {
          setFunctionalBefore(functional);
          setFunctional((value) => value + 1);
          setFunctional((value) => value + 1);
          setFunctional((value) => value + 1);
        }}>세 번 요청</button>
      </div>
      <button type="button" className="inline-example__button" onClick={() => {
        setDirect(0);
        setFunctional(0);
        setDirectBefore(null);
        setFunctionalBefore(null);
      }}>초기화</button>
    </div>
  );
};
