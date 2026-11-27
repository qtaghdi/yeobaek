import { Button } from "src/components/ui/controls";
import { useState } from "react";
import "src/components/examples/example.scss";
import "./error-feedback.scss";

const responses = [
  { label: "입력 오류", status: 422, code: "VALIDATION_FAILED", message: "The submitted fields are invalid." },
  { label: "기능 중단", status: 503, code: "NOT_AVAILABLE", message: "Feature temporarily unavailable." },
  { label: "새 오류 코드", status: 500, code: "NEW_SERVER_ERROR", message: "Unexpected upstream response." },
] as const;

const errorMessages = new Map([
  ["VALIDATION_FAILED", "입력한 내용을 다시 확인해주세요."],
  ["NOT_AVAILABLE", "지금은 사용할 수 없는 기능입니다."],
]);

export const ErrorFeedback = () => {
  const [response, setResponse] = useState<(typeof responses)[number]>(responses[0]);
  const userMessage = errorMessages.get(response.code) ?? "요청을 처리하지 못했습니다. 다시 시도해주세요.";

  return (
    <div className="inline-example error-feedback">
      <div className="inline-example__row" role="group" aria-label="오류 응답 선택">
        {responses.map(item => (
          <Button key={item.code} type="button" className="inline-example__button" aria-pressed={item === response}
            onClick={() => setResponse(item)}>{item.label}</Button>
        ))}
      </div>
      <div className="inline-example inline-example--comparison">
        <div className="inline-example__loaded error-feedback__response">
          <p className="inline-example__caption">서버 응답</p>
          <dl>
            <div><dt>HTTP 상태</dt><dd><code>{response.status}</code></dd></div>
            <div><dt>오류 코드</dt><dd><code>{response.code}</code></dd></div>
            <div><dt>원문</dt><dd>{response.message}</dd></div>
          </dl>
        </div>
        <div className="inline-example__loaded error-feedback__response">
          <p className="inline-example__caption">사용자 화면</p>
          <output aria-label="오류 안내">{userMessage}</output>
        </div>
      </div>
    </div>
  );
};
