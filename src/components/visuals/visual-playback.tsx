import { useEffect, useRef, useState } from "react";
import { frameDuration, nextFrame, shouldPlay } from "src/components/visuals/playback-policy";
import { InteractionScene } from "src/components/visuals/interaction-scene";
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

  const togglePlay = () => setManualPlayback(!wantsPlayback);
  const hasKeys = story.frames.some((step) => step.key);

  return (
    <figure className="visual-story not-content" aria-label={story.title} data-playing={playing} data-frame={index} data-frame-count={story.frames.length}>
      <div ref={stageRef} className={`visual-story__stage visual-story__stage--${story.layout}`}>
        {story.interaction ? <InteractionScene story={story} step={index} /> : <>
        {hasKeys ? <div className="visual-story__input">
          {frame.key ? <kbd key={index}>{frame.key}</kbd> : null}
        </div> : null}
        {story.illustration ? <StoryIllustration variant={story.illustration} step={index} /> : null}
        <div className="visual-story__nodes">
          {story.nodes.map((node, position) => {
            const state = frame.states[position];
            return (
              <div className="visual-story__slot" key={node}>
                <div className="visual-story__node" data-tone={state?.tone ?? "idle"}>
                  <span>{node}</span>
                  <div className="visual-story__value">
                    {story.frames.map((step, stepIndex) => <strong className="visual-story__measure" key={stepIndex} aria-hidden="true">{step.states[position]?.value ?? "대기"}</strong>)}
                    <strong key={state?.value}>{state?.value ?? "대기"}</strong>
                  </div>
                </div>
                {story.layout === "flow" && position < story.nodes.length - 1 ? <span className="visual-story__arrow" data-active={frame.states[position + 1]?.tone === "active"} aria-hidden="true">→</span> : null}
              </div>
            );
          })}
        </div>
        </>}
        <span className="visual-story__sr-only" role="status" aria-live={wantsPlayback ? "off" : "polite"}>{frame.label}: {frame.note}</span>
        <span className="visual-story__sr-only">{story.frames.map((step) => `${step.label}: ${step.note}`).join(" ")}</span>
        <button type="button" className="visual-story__play" onClick={togglePlay} aria-label={wantsPlayback ? "자동 재생 일시 정지" : "자동 재생 시작"}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            {wantsPlayback ? <path d="M6 4h3v12H6zm5 0h3v12h-3z" /> : <path d="M7 4v12l10-6z" />}
          </svg>
        </button>
      </div>
    </figure>
  );
};
