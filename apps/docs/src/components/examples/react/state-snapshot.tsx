import { useState } from "react";
import "src/components/examples/example.scss";

export const StateSnapshotExample = () => {
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
