import { useEffect, useState } from "react";
import { StoryIllustration } from "src/components/visuals/story-illustration";
import type { Story } from "src/components/visuals/stories";

export const VisualPlayback = ({ story }: { story: Story }) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = story.frames[index];
  const last = index === story.frames.length - 1;
  useEffect(() => {
    if (!playing || last) return;
    const timer = window.setTimeout(() => {
      setIndex(index + 1);
      if (index + 1 === story.frames.length - 1) setPlaying(false);
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [playing, index, last, story.frames.length]);

  const move = (next: number) => {
    setPlaying(false);
    setIndex(Math.min(story.frames.length - 1, Math.max(0, next)));
  };

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (last) setIndex(0);
    setPlaying(true);
  };

  return (
    <figure className="visual-story not-content" aria-label={story.title}>
      <div className="visual-story__header">
        <div>
          <span className="visual-story__eyebrow">시각 예제</span>
          <figcaption>{story.title}</figcaption>
        </div>
        <span className="visual-story__counter">{String(index + 1).padStart(2, "0")} / {String(story.frames.length).padStart(2, "0")}</span>
      </div>
      <div className={`visual-story__stage visual-story__stage--${story.layout}`}>
        <div className="visual-story__input">
          <span>{story.layout === "keyboard" ? "입력" : "진행 단계"}</span>
          {frame.key ? <kbd>{frame.key}</kbd> : <strong>{frame.label}</strong>}
        </div>
        {story.illustration ? <StoryIllustration variant={story.illustration} step={index} /> : null}
        <div className="visual-story__nodes">
          {story.nodes.map((node, position) => {
            const state = frame.states[position];
            return (
              <div className="visual-story__slot" key={node}>
                <div className="visual-story__node" data-tone={state?.tone ?? "idle"}>
                  <span>{node}</span>
                  <strong>{state?.value ?? "대기"}</strong>
                  {state?.tone === "active" ? <span className="visual-story__badge">현재</span> : null}
                </div>
                {story.layout === "flow" && position < story.nodes.length - 1 ? <span className="visual-story__arrow" aria-hidden="true">→</span> : null}
              </div>
            );
          })}
        </div>
        <div className="visual-story__explanation" role="status" aria-live="polite">
          <strong>{frame.label}</strong>
          <p>{frame.note}</p>
        </div>
      </div>
      <div className="visual-story__controls">
        <button type="button" className="visual-story__play" onClick={togglePlay}>
          {playing ? <span aria-hidden="true">Ⅱ</span> : <span aria-hidden="true">▶</span>}
          {playing ? "일시 정지" : last ? "다시 재생" : "재생"}
        </button>
        <button type="button" onClick={() => move(index - 1)} disabled={index === 0} aria-label="이전 단계">←</button>
        <div className="visual-story__steps" aria-label="재생 단계">
          {story.frames.map((step, stepIndex) => (
            <button type="button" key={step.label} aria-label={`${stepIndex + 1}단계: ${step.label}`} aria-current={stepIndex === index ? "step" : undefined} onClick={() => move(stepIndex)} />
          ))}
        </div>
        <button type="button" onClick={() => move(index + 1)} disabled={last} aria-label="다음 단계">→</button>
      </div>
      <details className="visual-story__transcript">
        <summary>전체 흐름 읽기</summary>
        <ol>{story.frames.map((step) => <li key={step.label}><strong>{step.label}</strong> <span>{step.note}</span></li>)}</ol>
      </details>
    </figure>
  );
};
