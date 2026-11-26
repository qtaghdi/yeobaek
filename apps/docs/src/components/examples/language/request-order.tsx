import { useEffect, useRef, useState } from "react";
import "src/components/examples/example.scss";

type Result = "대기" | "B 조회 중" | "A 결과" | "B 결과";

export const RequestOrderExample = () => {
  const [naive, setNaive] = useState<Result>("대기");
  const [latest, setLatest] = useState<Result>("대기");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const requestId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
  }, []);

  const run = () => {
    clear();
    setRunning(true);
    setNaive("B 조회 중");
    setLatest("B 조회 중");
    const firstId = ++requestId.current;
    const secondId = ++requestId.current;
    setEvents(["A 요청 시작", "B 요청 시작"]);
    timers.current.push(setTimeout(() => {
      setNaive("B 결과");
      if (secondId === requestId.current) setLatest("B 결과");
      setEvents((previous) => [...previous, "B 응답 도착"]);
    }, 280));
    timers.current.push(setTimeout(() => {
      setNaive("A 결과");
      if (firstId === requestId.current) setLatest("A 결과");
      setEvents((previous) => [...previous, "A 응답 도착"]);
      setRunning(false);
    }, 900));
  };

  return (
    <div className="inline-example">
      <div className="inline-example__row">
        <button type="button" className="inline-example__button" onClick={run}>
          {running ? "다시 재현" : "응답 순서 재현"}
        </button>
      </div>
      <div className="inline-example--comparison" aria-live="polite">
        <div className="inline-example__loaded">
          <p className="inline-example__caption">완료 순서대로 적용</p>
          <output>{naive}</output>
        </div>
        <div className="inline-example__loaded">
          <p className="inline-example__caption">최신 요청만 적용</p>
          <output>{latest}</output>
        </div>
      </div>
      <ol className="inline-example__log">
        {events.length ? events.map((event) => <li key={event}>{event}</li>) : <li>버튼을 눌러 확인하세요.</li>}
      </ol>
    </div>
  );
};
