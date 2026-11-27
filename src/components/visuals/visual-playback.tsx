import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { frameDuration, nextFrame, shouldPlay } from "src/components/visuals/playback-policy";
import { ArticleScene } from "src/components/visuals/article-scene";
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
  const remainingTime = useRef({ index, milliseconds: 0 });
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
    const onMotionChange = () => {
      syncMotion();
      if (preference.matches) {
        setManualPlayback((current) => current === true ? null : current);
      }
    };
    const syncPage = () => {
      setPageVisible(!document.hidden);
    };
    syncMotion();
    syncPage();
    preference.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", syncPage);
    const observer = new IntersectionObserver(([entry]) => {
      const inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      setVisible(inView);
    }, { threshold: [0, 0.25] });
    observer.observe(target);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", syncPage);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const segment = remainingTime.current;
    const remaining = segment.index === index ? segment.milliseconds || duration : duration;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => {
      if (document.hidden || !stageRef.current?.isConnected) return;
      setIndex((current) => nextFrame(current, story.frames.length));
    }, remaining);
    return () => {
      window.clearTimeout(timer);
      remainingTime.current = { index, milliseconds: Math.max(1, remaining - (performance.now() - startedAt)) };
    };
  }, [playing, index, duration, story.frames.length]);

  useLayoutEffect(() => {
    for (const animation of stageRef.current?.getAnimations({ subtree: true }) ?? []) {
      if (!("transitionProperty" in animation)) continue;
      if (playing && animation.playState === "paused") animation.play();
      if (!playing && animation.playState === "running") animation.pause();
    }
  }, [playing]);

  const togglePlay = () => setManualPlayback(!wantsPlayback);
  const hasKeys = story.frames.some((step) => step.key);

  return (
    <figure className="visual-story not-content" aria-label={story.title} data-playing={playing} data-frame={index} data-frame-count={story.frames.length}>
      <div ref={stageRef} className={`visual-story__stage visual-story__stage--${story.layout}`}>
        {story.interaction ? <InteractionScene story={story} step={index} /> : story.scene ? <ArticleScene variant={story.scene} frame={frame} step={index} /> : <>
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
                    {[...new Set(story.frames.map((step) => step.states[position]?.value ?? "대기"))].map((value) => (
                      <strong key={value} data-current={value === (state?.value ?? "대기")} aria-hidden="true">{value}</strong>
                    ))}
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
