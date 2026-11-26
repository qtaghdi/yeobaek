import { useState } from "react";
import "./focus-ring.scss";

export type ButtonProps = {
  count: 2 | 3 | 4;
  size: "compact" | "regular" | "large";
  labels: "numbers" | "letters";
  disableSecond: boolean;
};

export type FocusRingArgs = ButtonProps & {
  showLegend: boolean;
};

const buttonLabels = {
  numbers: ["01", "02", "03", "04"],
  letters: ["A", "B", "C", "D"],
};

export const Buttons = ({ count, size, labels, disableSecond }: ButtonProps) => (
  <div className="focus-ring__buttons" data-size={size}>
    {buttonLabels[labels].slice(0, count).map((label, index) => (
      <button
        type="button"
        key={label}
        aria-label={`버튼 ${label}`}
        disabled={disableSecond && index === 1}
      >
        {label}
      </button>
    ))}
  </div>
);


export const FocusComparison = ({ showLegend, ...args }: FocusRingArgs) => (
  <div className="focus-ring focus-ring--comparison" aria-label="클릭과 Tab으로 포커스 비교">
    <Buttons {...args} />
    {showLegend && <div className="focus-ring__legend"><code>:focus</code><code>:focus-visible</code></div>}
  </div>
);

export const FocusLab = () => {
  const [mode, setMode] = useState("comparison");
  const [disableSecond, setDisableSecond] = useState(false);
  return (
    <div className="notebook-experiment">
      <div className="notebook-experiment__controls">
        <label>표시 방식 <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="comparison">focus / focus-visible</option>
          <option value="default">브라우저 기본</option>
          <option value="outline-removed">outline 제거 (의도된 실패)</option>
        </select></label>
        <label><input type="checkbox" checked={disableSecond} onChange={(event) => setDisableSecond(event.target.checked)} /> 두 번째 버튼 비활성화</label>
      </div>
      {mode === "comparison" ? <FocusComparison count={3} size="regular" labels="numbers" disableSecond={disableSecond} showLegend /> : <div className={`focus-ring focus-ring--${mode}`}><Buttons count={3} size="regular" labels="numbers" disableSecond={disableSecond} /></div>}
    </div>
  );
};
