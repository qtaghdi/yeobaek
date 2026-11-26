import { useId, useState } from "react";
import "./focus-ring.scss";

type ButtonProps = {
  count: 2 | 3 | 4;
  size: "compact" | "regular" | "large";
  labels: "numbers" | "letters";
  disableSecond: boolean;
};

type FocusRingArgs = ButtonProps & {
  showLegend: boolean;
};

const buttonLabels = {
  numbers: ["01", "02", "03", "04"],
  letters: ["A", "B", "C", "D"],
};

const Buttons = ({ count, size, labels, disableSecond }: ButtonProps) => (
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


const FocusComparison = ({ showLegend, ...args }: FocusRingArgs) => (
  <div className="focus-ring focus-ring--comparison" aria-label="클릭과 Tab으로 포커스 비교">
    <Buttons {...args} />
    {showLegend && <div className="focus-ring__legend"><code>:focus</code><code>:focus-visible</code></div>}
  </div>
);

const focusModes = [
  { value: "comparison", label: "포커스 비교" },
  { value: "default", label: "브라우저 기본" },
  { value: "outline-removed", label: "포커스 제거" },
] as const;

export const FocusRingExample = () => {
  const [mode, setMode] = useState<(typeof focusModes)[number]["value"]>("comparison");
  const [disableSecond, setDisableSecond] = useState(false);
  const group = useId();

  return (
    <div className="notebook-experiment">
      <div className="notebook-experiment__controls">
        <fieldset className="notebook-choices">
          <legend>표시 방식</legend>
          <div className="notebook-choices__options">
            {focusModes.map(({ value, label }) => (
              <label key={value}>
                <input type="radio" name={group} value={value} checked={mode === value} onChange={() => setMode(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          <input type="checkbox" checked={disableSecond} onChange={(event) => setDisableSecond(event.target.checked)} />
          두 번째 버튼 비활성화
        </label>
        {mode === "outline-removed" && <span role="status">의도된 접근성 실패 예제</span>}
      </div>
      {mode === "comparison" ? (
        <FocusComparison count={3} size="regular" labels="numbers" disableSecond={disableSecond} showLegend />
      ) : (
        <div className={`focus-ring focus-ring--${mode}`}>
          <Buttons count={3} size="regular" labels="numbers" disableSecond={disableSecond} />
        </div>
      )}
    </div>
  );
};
