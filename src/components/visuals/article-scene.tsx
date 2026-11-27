import { ScenePointer } from "src/components/visuals/scene-pointer";
import type { Frame, Story } from "src/components/visuals/stories";
import "src/components/visuals/article-scene.scss";

type Props = { variant: NonNullable<Story["scene"]>; frame: Frame; step: number };

export const ArticleScene = ({ variant, frame, step }: Props) => {
  const [first, second] = frame.states;

  if (variant === "music") {
    const paused = step === 3;
    const position = [40, 45, 130, 130][step] / 240 * 100;
    return (
      <div className="article-scene article-scene--music" aria-hidden="true">
        <div className="article-scene__pane">
          <span className="article-scene__label">Apple Music</span>
          <strong>샘플 트랙</strong>
          <div className="article-scene__track">
            <span style={{ inlineSize: `${position}%` }} />
            {step === 2 && <div className="article-scene__seek" style={{ insetInlineStart: `${position}%` }}><ScenePointer shape="hand" /></div>}
          </div>
          <div className="article-scene__time"><span>{first.value}</span><span>4:00</span></div>
        </div>
        <div className="article-scene__pane">
          <span className="article-scene__label">Discord</span>
          <strong>샘플 트랙</strong>
          <div className="article-scene__track" data-paused={paused}>
            {!paused && <span style={{ inlineSize: `${position}%` }} />}
          </div>
          <div className="article-scene__payload">
            <span>{paused ? "일시정지 표시 옵션" : "보낸 시작·종료 시각"}</span>
            <code>{second.value}</code>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "docx") {
    return (
      <div className="article-scene article-scene--docx" aria-hidden="true">
        <div className="article-scene__pane">
          <span className="article-scene__label">결재 문서 · 동작 예시</span>
          <div className="article-scene__document">
            상태 <strong>{first.value} <span>⌄</span></strong>
            <div className="article-scene__choices" data-open={step === 1}>
              <span>검토 중</span>
              <span>완료 <ScenePointer shape="hand" /></span>
            </div>
          </div>
        </div>
        <div className="article-scene__pane">
          <span className="article-scene__label">저장할 XML</span>
          <div className="article-scene__field"><code>w:t</code><strong>{first.value}</strong></div>
          <div className="article-scene__field"><code>w:lastValue</code><strong>{second.value}</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-scene article-scene--revision" aria-hidden="true">
      <div className="article-scene__pane">
        <span className="article-scene__label">서버 · 리비전 {step === 0 ? 12 : 13}</span>
        <div className="article-scene__sheet">
          <span /><span>A</span><span>B</span>
          <span>3</span><span>소계</span><span>40</span>
          <span>4</span><span>합계</span><strong>{first.value}</strong>
        </div>
      </div>
      <div className="article-scene__pane">
        <span className="article-scene__label">AI</span>
        <code>baseRevision: 12</code>
        <div className="article-scene__request">
          {step === 2 && <code>B4 =SUM(B2:B3)</code>}
          <strong>{second.value}</strong>
        </div>
      </div>
    </div>
  );
};
