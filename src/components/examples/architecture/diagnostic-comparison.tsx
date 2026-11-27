import { useId, useState } from "react";
import { Radio } from "src/components/ui/controls";
import "./diagnostic-comparison.scss";

type Diagnostic = { path: string; rule: string };
const reference = [
  { path: "orders/summary.ts", rule: "no-cross-domain" },
  { path: "checkout/submit.ts", rule: "no-deep-import" },
];
const keyOf = ({ path, rule }: Diagnostic) => JSON.stringify([path, rule]);

export const DiagnosticComparison = () => {
  const name = useId();
  const [matches, setMatches] = useState(true);
  const candidate = matches
    ? reference
    : [reference[0], { path: "reports/list.ts", rule: "no-deep-import" }];
  const referenceKeys = new Set(reference.map(keyOf));
  const candidateKeys = new Set(candidate.map(keyOf));
  const missing = reference.filter((item) => !candidateKeys.has(keyOf(item)));
  const extra = candidate.filter((item) => !referenceKeys.has(keyOf(item)));

  return (
    <div className="example-workbench diagnostic-comparison" data-match={matches}>
      <div className="example-workbench__controls">
        <fieldset className="example-choices">
          <legend>후보 결과</legend>
          <div className="example-choices__options">
            <label>
              <Radio name={name} checked={matches} onChange={() => setMatches(true)} />
              전체 검사와 일치
            </label>
            <label>
              <Radio name={name} checked={!matches} onChange={() => setMatches(false)} />
              한 건의 경로 변경
            </label>
          </div>
        </fieldset>
      </div>
      <div className="diagnostic-comparison__columns">
        {[{ title: "전체 검사", list: reference, differences: missing, status: "후보에 없음" },
          { title: "증분 후보", list: candidate, differences: extra, status: "후보에만 있음" }].map(({ title, list, differences, status }) => (
          <div className="diagnostic-comparison__column" key={title}>
            <strong>{title} · {list.length}건</strong>
            <ul>
              {list.map((item) => {
                const different = differences.includes(item);
                return (
                  <li key={keyOf(item)} data-different={different}>
                    {different && <span>{status}</span>}
                    <code>{item.path}</code>
                    <code>{item.rule}</code>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="diagnostic-comparison__result" role="status">
        {missing.length === 0 && extra.length === 0
          ? "파일과 규칙이 모두 일치합니다."
          : `건수는 같고 항목은 다릅니다. 누락 ${missing.length}건, 추가 ${extra.length}건.`}
      </p>
    </div>
  );
};
