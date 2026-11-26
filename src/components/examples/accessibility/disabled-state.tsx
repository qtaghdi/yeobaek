import { useState } from "react";
import "src/components/examples/example.scss";

const ButtonTrial = ({ mode }: { mode: "native" | "aria-only" | "guarded" }) => {
  const [attempts, setAttempts] = useState(0);
  const isNative = mode === "native";
  const labels = {
    native: ["disabled", "비활성 상태와 실행 차단을 브라우저가 처리합니다."],
    "aria-only": ['aria-disabled="true"', "비활성 상태는 전달하지만 실행을 막는 코드는 없습니다."],
    guarded: ["aria-disabled + 실행 조건", "포커스를 받을 수 있고, 실행은 코드에서 막습니다."],
  };
  const [label, explanation] = labels[mode];

  return (
    <div data-disabled-trial={mode}>
      <p className="inline-example__caption"><code>{label}</code></p>
      <button
        className="inline-example__button"
        type="button"
        disabled={isNative}
        aria-disabled={isNative ? undefined : true}
        onClick={() => {
          if (mode === "aria-only") setAttempts((previous) => previous + 1);
        }}
      >
        저장
      </button>
      <p>{explanation}</p>
      <output>저장 실행 {attempts}회</output>
    </div>
  );
};

export const DisabledStateExample = () => (
  <div className="inline-example">
    <ButtonTrial mode="native" />
    <ButtonTrial mode="aria-only" />
    <ButtonTrial mode="guarded" />
  </div>
);
