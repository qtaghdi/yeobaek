import { useEffect, useRef, useState, type CSSProperties } from "react";
import { frameDuration, nextFrame, shouldPlay } from "src/components/visuals/playback-policy";
import { StoryIllustration } from "src/components/visuals/story-illustration";
import type { Story } from "src/components/visuals/stories";

export const VisualPlayback = ({ story }: { story: Story }) => {
  const [index, setIndex] = useState(0);
  const [manualPlayback, setManualPlayback] = useState<boolean | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frame = story.frames[index];
  const last = index === story.frames.length - 1;
  const wantsPlayback = manualPlayback ?? motionAllowed;
  const playing = shouldPlay(wantsPlayback, visible, pageVisible);
  const duration = frameDuration(frame.note, last);

  useEffect(() => {
    const target = stageRef.current;
    if (!target) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotionAllowed(!preference.matches);
    const syncPage = () => setPageVisible(!document.hidden);
    syncMotion();
    syncPage();
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncPage);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25);
    }, { threshold: [0, 0.25] });
    observer.observe(target);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncPage);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((current) => nextFrame(current, story.frames.length)), duration);
    return () => window.clearTimeout(timer);
  }, [playing, index, duration, story.frames.length]);

  const move = (next: number) => {
    setManualPlayback(false);
    setIndex(Math.min(story.frames.length - 1, Math.max(0, next)));
  };

  const togglePlay = () => setManualPlayback(!wantsPlayback);

  return (
    <figure className="visual-story not-content" aria-label={story.title} data-playing={playing} style={{ "--step-duration": `${duration}ms` } as CSSProperties}>
      <div className="visual-story__header">
        <div>
          <span className="visual-story__eyebrow">시각 예제</span>
          <figcaption>{story.title}</figcaption>
        </div>
        <span className="visual-story__counter">{String(index + 1).padStart(2, "0")} / {String(story.frames.length).padStart(2, "0")}</span>
      </div>
      <div ref={stageRef} className={`visual-story__stage visual-story__stage--${story.layout}`}>
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
                  <span className="visual-story__badge" data-visible={state?.tone === "active"} aria-hidden={state?.tone !== "active"}>현재</span>
                </div>
                {story.layout === "flow" && position < story.nodes.length - 1 ? <span className="visual-story__arrow" aria-hidden="true">→</span> : null}
              </div>
            );
          })}
        </div>
        <div className="visual-story__explanation">
          {story.frames.map((step) => (
            <div className="visual-story__caption-measure" key={step.label} aria-hidden="true">
              <strong>{step.label}</strong><p>{step.note}</p>
            </div>
          ))}
          <div className="visual-story__caption-current" role="status" aria-live={wantsPlayback ? "off" : "polite"}>
            <strong>{frame.label}</strong><p>{frame.note}</p>
          </div>
        </div>
      </div>
      <div className="visual-story__controls">
        <button type="button" className="visual-story__play" onClick={togglePlay} aria-label={wantsPlayback ? "자동 재생 일시 정지" : "자동 재생 시작"}>
          {wantsPlayback ? <span aria-hidden="true">Ⅱ</span> : <span aria-hidden="true">▶</span>}
          {wantsPlayback ? "일시 정지" : "재생"}
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
