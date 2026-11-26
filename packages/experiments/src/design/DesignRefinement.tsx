import { useId, useState } from "react";
import "./design-refinement.scss";

export const stages = [
  "before",
  "typography",
  "spacing",
  "color",
  "hierarchy",
  "after",
] as const;

export type Stage = (typeof stages)[number];

export const Login = ({ stage }: { stage: Stage }) => {
  const [submitted, setSubmitted] = useState(false);
  const styles = stages
    .slice(1, stages.indexOf(stage) + 1)
    .map((step) => `design-demo__card--${step}`)
    .join(" ");

  return (
    <article className={`design-demo__card ${styles}`}>
      <header className="design-demo__intro">
        <p className="design-demo__brand">작업실</p>
        <h2>다시 만나서 반가워요</h2>
        <p>이메일로 작업 공간에 로그인하세요.</p>
      </header>
      <form
        className="design-demo__form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label className="design-demo__field">
          이메일 주소
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
            onChange={() => setSubmitted(false)}
          />
        </label>
        <button type="submit">로그인</button>
      </form>
      <p className="design-demo__note" role="status">
        {submitted
          ? "이메일 형식을 확인했어요."
          : "연습용 화면 · 실제 인증 없음"}
      </p>
    </article>
  );
};

export const DesignStage = ({ stage }: { stage: Stage }) => (
  <div className="design-demo">
    <Login stage={stage} />
  </div>
);


const stageLabels: Record<Stage, string> = {
  before: "개선 전",
  typography: "문자",
  spacing: "간격",
  color: "색상",
  hierarchy: "위계",
  after: "개선 후",
};

export const DesignLab = () => {
  const [stage, setStage] = useState<Stage>("before");
  const group = useId();

  return (
    <div className="notebook-experiment">
      <div className="notebook-experiment__controls">
        <fieldset className="notebook-choices">
          <legend>개선 단계</legend>
          <div className="notebook-choices__options">
            {stages.map((step) => (
              <label key={step}>
                <input type="radio" name={group} value={step} checked={stage === step} onChange={() => setStage(step)} />
                {stageLabels[step]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <DesignStage stage={stage} />
    </div>
  );
};
