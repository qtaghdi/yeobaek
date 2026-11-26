import type { Story } from "src/components/visuals/stories";
import "src/components/visuals/browser-sequences.scss";

export const StoryIllustration = ({ variant, step }: { variant: NonNullable<Story["illustration"]>; step: number }) => {
  if (variant === "loading") return (
    <div className="story-art story-art--loading" aria-hidden="true">
      {[false, true].map((reserved) => (
        <div className="story-art__mock" key={String(reserved)}>
          <div className={`story-art__content ${step > 0 || reserved ? "story-art__content--reserved" : ""}`}>
            {step === 0 ? reserved ? <><i /><i /><i /></> : <small>로딩 중…</small> : step === 2 && !reserved ? <small>로딩 중…</small> : <><strong>문서 제목</strong><i /><i />{step === 2 && reserved ? <small>갱신 중</small> : null}</>}
          </div>
          <span className="story-art__next">다음 콘텐츠</span>
        </div>
      ))}
    </div>
  );
  if (variant === "stacking") return (
    <div className="story-art story-art--stacking" aria-hidden="true">
      <div className="story-art__layer-a" style={{ zIndex: ["auto", 1, 3][step] }}><span>부모 A · {["auto", "1", "3"][step]}</span><div className="story-art__layer-child" style={{ zIndex: 9999 }}>자식 A · 9999</div></div>
      <div className="story-art__layer-b" style={{ zIndex: 2 }}>부모 B · 2</div>
    </div>
  );
  if (variant === "text-width") return (
    <div className="story-art story-art--width" aria-hidden="true">
      {["WWWWWWWW", "iiiiiiii"].map((word) => (
        <div className="story-art__measure" key={word}><span>{word}</span><b className={step > 0 ? "story-art__measurement" : ""} /></div>
      ))}
    </div>
  );
  if (variant === "scrollbar") return (
    <div className="story-art story-art--scrollbar" aria-hidden="true">
      <div className="story-art__browser">
        <div className="story-art__browser-head">
          <span>{step === 0 ? "문서 읽기" : "모달 열림"}</span>
          <code>{step === 2 ? "scrollbar-gutter: stable" : "scrollbar-gutter: auto"}</code>
        </div>
        <div className="story-art__browser-body">
          <div className="story-art__browser-content"><span>가운데 콘텐츠</span></div>
          <div className="story-art__scrollbar" data-gutter={step !== 1} data-scroll={step === 0} />
        </div>
      </div>
    </div>
  );
  if (variant === "viewport") return (
    <div className="story-art story-art--viewport" aria-hidden="true">
      <div className="viewport-sequence__phone" data-collapsed={step === 1} data-unit={["svh", "lvh", "dvh"][step]}>
        <div className="viewport-sequence__address"><span>yeobaek</span></div>
        <div className="viewport-sequence__screen">
          <b>{["100svh", "100lvh", "100dvh"][step]}</b>
          <span>{step === 1 ? "주소창 접힘" : "주소창 펼침"}</span>
        </div>
      </div>
    </div>
  );
  return (
    <div className="story-art story-art--flex" aria-hidden="true">
      <div className="story-art__file-row">
        <div className="story-art__filename" data-step={step}>{step === 0 ? "report.pdf" : "very-long-unbreakable-file-name.pdf"}</div>
        <span className="story-art__delete">삭제</span>
      </div>
    </div>
  );
};
