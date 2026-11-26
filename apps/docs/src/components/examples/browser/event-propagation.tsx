import { useState } from "react";
import "../example.scss";

export const EventPropagationExample = () => {
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
