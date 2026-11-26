import { useRef, useState } from "react";
import "src/components/examples/example.scss";
import "./save-feedback.scss";

const feedback = {
  idle: "아직 저장하지 않았습니다.",
  pending: "변경 사항을 저장하는 중입니다.",
  success: "변경 사항을 저장했습니다.",
  error: "저장하지 못했습니다. 다시 시도해 주세요.",
} as const;

export const SaveFeedbackExample = () => {
  const [phase, setPhase] = useState<keyof typeof feedback>("idle");
  const respond = useRef<((saved: boolean) => void) | null>(null);
  const pending = phase === "pending";

  const save = async () => {
    if (respond.current) return;
    setPhase("pending");
    const saved = await new Promise<boolean>((resolve) => {
      respond.current = resolve;
    });
    respond.current = null;
    setPhase(saved ? "success" : "error");
  };

  return (
    <div className="inline-example save-feedback">
      <div className="save-feedback__preview" data-phase={phase}>
        <strong>알림 설정</strong>
        <p role="status">{feedback[phase]}</p>
        <button
          type="button"
          className="inline-example__button"
          aria-disabled={pending || undefined}
          onClick={() => void save()}
        >
          {phase === "error" ? "다시 시도" : "변경 사항 저장"}
        </button>
      </div>
      <fieldset className="save-feedback__response">
        <legend>예제의 응답</legend>
        <div className="inline-example__row">
          <button
            type="button"
            className="inline-example__button"
            aria-disabled={!pending || undefined}
            onClick={() => respond.current?.(true)}
          >
            성공 응답 보내기
          </button>
          <button
            type="button"
            className="inline-example__button"
            aria-disabled={!pending || undefined}
            onClick={() => respond.current?.(false)}
          >
            실패 응답 보내기
          </button>
        </div>
      </fieldset>
    </div>
  );
};
