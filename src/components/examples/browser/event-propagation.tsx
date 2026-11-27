import { useState } from "react";
import "src/components/examples/example.scss";
import "./event-propagation.scss";

export const EventPropagationExample = () => {
  const [stop, setStop] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);
  const lastClick = entries.slice(entries.lastIndexOf("부모 캡처"));
  const phases = ["부모 캡처", "대상 버튼", "부모 버블"];
  const append = (entry: string) => setEntries((items) => [...items, entry].slice(-9));

  return (
    <div className="inline-example event-propagation">
      <label className="inline-example__check">
        <input type="checkbox" checked={stop} onChange={(event) => setStop(event.target.checked)} />
        stopPropagation 적용
      </label>
      <div className="inline-example__event event-propagation__parent" onClickCapture={() => append("부모 캡처")} onClick={() => append("부모 버블")}>
        <span className="event-propagation__label">부모 요소 · capture / bubble</span>
        <button type="button" className="inline-example__button event-propagation__target" onClick={(event) => {
          if (stop) event.stopPropagation();
          append("대상 버튼");
        }}>안쪽 버튼</button>
      </div>
      <div className="event-propagation__path" aria-label="마지막 클릭의 전달 경로">
        {phases.map((phase, index) => <div key={phase} data-phase={index} data-fired={lastClick.includes(phase)}><small>{index === 0 ? "내려감" : index === 1 ? "대상" : "올라감"}</small><strong>{phase}</strong><span>{lastClick.includes(phase) ? "실행됨" : lastClick.length ? "미실행" : "대기"}</span></div>)}
      </div>
      <ol className="inline-example__log" aria-live="polite">
        {entries.length === 0 ? <li>버튼을 눌러 보세요.</li> : entries.map((entry, index) => <li key={index}>{entry}</li>)}
      </ol>
      <button type="button" className="inline-example__button" onClick={() => setEntries([])}>기록 지우기</button>
    </div>
  );
};
