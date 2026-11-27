import { useId, useState } from "react";
import { Radio } from "src/components/ui/controls";
import "./changed-diagnostics-preview.scss";

const diagnostics = [
  { source: "orders/summary.ts", target: "accounts/internal.ts" },
  { source: "checkout/submit.ts", target: "orders/internal.ts" },
];

const scenarios = [
  { id: "edit", label: "파일 편집", changedPath: "orders/summary.ts" },
  { id: "delete", label: "파일 삭제", changedPath: "orders/format.ts" },
] as const;

export const ChangedDiagnosticsPreview = () => {
  const name = useId();
  const [scenario, setScenario] = useState<(typeof scenarios)[number]>(scenarios[0]);

  return (
    <div className="example-workbench changed-diagnostics-preview" data-change={scenario.id}>
      <div className="example-workbench__controls">
        <fieldset className="example-choices">
          <legend>변경 종류</legend>
          <div className="example-choices__options">
            {scenarios.map((mode) => (
              <label key={mode.id}>
                <Radio name={name} checked={mode.id === scenario.id} onChange={() => setScenario(mode)} />
                {mode.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p className="changed-diagnostics-preview__summary" aria-live="polite">
        변경 파일 <code>{scenario.changedPath}</code> · 전체 진단 {diagnostics.length}건
      </p>
      <ul className="changed-diagnostics-preview__list">
        {diagnostics.map(({ source, target }) => {
          const bucket = scenario.id === "delete" || scenario.changedPath === source ? "focused" : "other";
          return (
            <li key={source} data-bucket={bucket}>
              <span><code>{source}</code> → <code>{target}</code></span>
              <code className="changed-diagnostics-preview__bucket">{bucket}</code>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
