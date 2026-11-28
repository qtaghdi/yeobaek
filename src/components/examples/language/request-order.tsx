import { useEffect, useRef, useState } from "react";
import "src/components/examples/example.scss";

type Result = "대기" | "B 조회 중" | "A 결과" | "B 결과" | "A 오류" | "B 오류";
type Scenario = "success" | "A" | "B";

export const RequestOrderExample = () => {
  const [naive, setNaive] = useState<Result>("대기");
  const [latest, setLatest] = useState<Result>("대기");
  const [running, setRunning] = useState<Scenario | null>(null);
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

  const run = (scenario: Scenario) => {
    clear();
    setRunning(scenario);
    setNaive("B 조회 중");
    setLatest("B 조회 중");
    const firstId = ++requestId.current;
    const secondId = ++requestId.current;
    setEvents(["A 요청 시작", "B 요청 시작"]);
    timers.current.push(setTimeout(() => {
      const result = scenario === "B" ? "B 오류" : "B 결과";
      setNaive(result);
      if (secondId === requestId.current) setLatest(result);
      setEvents((previous) => [...previous, scenario === "B" ? "B 실패 응답 도착" : "B 응답 도착"]);
    }, 280));
    timers.current.push(setTimeout(() => {
      const result = scenario === "A" ? "A 오류" : "A 결과";
      setNaive(result);
      if (firstId === requestId.current) setLatest(result);
      setEvents((previous) => [...previous, scenario === "A" ? "A 실패 응답 도착" : "A 응답 도착"]);
      setRunning(null);
    }, 900));
  };

  return (
    <div className="inline-example">
      <div className="inline-example__row">
        <button type="button" className="inline-example__button" onClick={() => run("success")}>
          {running === "success" ? "다시 재현" : "응답 순서 재현"}
        </button>
        <button type="button" className="inline-example__button" onClick={() => run("A")}>
          A 실패 재현
        </button>
        <button type="button" className="inline-example__button" onClick={() => run("B")}>
          B 실패 재현
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
