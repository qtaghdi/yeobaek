import { Button } from "@oddmash/ui/button";
import { Input } from "@oddmash/ui/input";
import { useId, useState } from "react";
import "src/components/examples/example.scss";
import "./applied-date-filter.scss";

const initialRange = { start: "2026-11-01", end: "2026-11-10" };
const runs = [
  { date: "2026-11-02", name: "검색 검증" },
  { date: "2026-11-08", name: "탐색 검증" },
  { date: "2026-11-16", name: "모바일 검증" },
  { date: "2026-11-20", name: "배포 검증" },
];

export const AppliedDateFilter = () => {
  const [draft, setDraft] = useState(initialRange);
  const [applied, setApplied] = useState(initialRange);
  const errorId = useId();
  const error = !draft.start || !draft.end
    ? "시작일과 종료일을 모두 입력하세요."
    : draft.start > draft.end ? "시작일은 종료일보다 늦을 수 없습니다." : "";
  const visibleRuns = runs.filter(({ date }) => applied.start <= date && date <= applied.end);

  return (
    <div className="inline-example applied-date-filter">
      <form className="applied-date-filter__form" onSubmit={event => {
        event.preventDefault();
        if (!error) setApplied(draft);
      }}>
        <div className="applied-date-filter__dates">
          <label>
            시작일
            <Input type="date" value={draft.start} aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              onChange={event => setDraft({ ...draft, start: event.currentTarget.value })} />
          </label>
          <label>
            종료일
            <Input type="date" value={draft.end} aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              onChange={event => setDraft({ ...draft, end: event.currentTarget.value })} />
          </label>
        </div>
        <div className="inline-example__row">
          <Button type="submit" className="inline-example__button" disabled={Boolean(error)}>적용</Button>
          <Button type="button" className="inline-example__button" onClick={() => setDraft(applied)}>취소</Button>
        </div>
        {error && <p id={errorId} role="status">{error}</p>}
      </form>
      <div className="inline-example__loaded" aria-live="polite" aria-label="조회 결과">
        <p>적용된 범위 <b>{applied.start}</b> ~ <b>{applied.end}</b></p>
        {visibleRuns.length ? (
          <ul>
            {visibleRuns.map(run => (
              <li key={run.date}><time dateTime={run.date}>{run.date}</time> {run.name}</li>
            ))}
          </ul>
        ) : <p>범위에 실행 기록이 없습니다.</p>}
      </div>
    </div>
  );
};
