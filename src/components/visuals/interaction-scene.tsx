import { EventVisual } from "src/components/visuals/event-visual";
import { CounterScene, FilterScene, RequestScene } from "src/components/visuals/product-sequences";
import { KeyPress } from "src/components/visuals/key-press";
import { ScenePointer } from "src/components/visuals/scene-pointer";
import type { Story } from "src/components/visuals/stories";

const KeyTarget = ({ label, active = false, dim = false, note }: { label: string; active?: boolean; dim?: boolean; note?: string }) => (
  <div className="interaction-target" data-active={active} data-dim={dim}>
    <span>{label}</span>
    {note ? <small>{note}</small> : null}
  </div>
);

const FocusScene = ({ story, step, tabOrder }: { story: Story; step: number; tabOrder: boolean }) => (
  <div className="interaction-scene interaction-scene--keys" aria-hidden="true">
    <KeyPress input={story.frames[step].key} step={step} />
    <div className="interaction-targets">
      {story.nodes.map((node, index) => (
        <KeyTarget key={node} label={node}
          active={story.frames[step].states[index]?.tone === "active"}
          dim={story.frames[step].states[index]?.tone === "muted"}
          note={tabOrder && story.frames[step].states[index]?.value === "tabindex=-1" ? "tabindex=-1" : !tabOrder && step === 2 && index === 2 ? "표시 제거" : undefined} />
      ))}
    </div>
  </div>
);

const ControlsScene = ({ story, step, disabled }: { story: Story; step: number; disabled: boolean }) => {
  const input = story.frames[step].key;
  return (
    <div className="interaction-scene interaction-scene--keys" aria-hidden="true">
      <KeyPress input={input} step={step} />
      <div className="interaction-targets">
        {story.nodes.map((node, index) => {
          const state = story.frames[step].states[index];
          const activatedWithKey = input === "Enter" && state?.tone === "done";
          const focused = state?.tone === "active" || activatedWithKey;
          return (
            <div className="interaction-control" data-clicking={input === "Click"} key={node}>
              <small>{node}</small>
              <div
                className="interaction-target interaction-target--control sequence-press"
                data-active={focused}
                data-dim={disabled && !focused}
                data-key-activation={activatedWithKey}
                data-action={input === "Click"}
                data-native-disabled={disabled && index === 0}
              >
                {disabled ? "저장" : "실행"}
                {input === "Click" && <ScenePointer />}
              </div>
              <span className="interaction-result" data-tone={state?.tone}>{state?.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DialogScene = ({ story, step }: { story: Story; step: number }) => {
  const open = step === 1 || step === 2;
  return (
    <div className="interaction-scene interaction-scene--keys" aria-hidden="true">
      <KeyPress input={story.frames[step].key} step={step} />
      <div className="interaction-window">
        <div className="interaction-window__toolbar"><i /><i /><i /></div>
        <div className="interaction-window__content">
          <KeyTarget label="모달 열기" active={!open} />
          <span className="interaction-window__line" />
          <span className="interaction-window__line" />
        </div>
        <div className="interaction-dialog" data-open={open}>
          <div className="interaction-dialog__panel">
            <b>알림</b>
            <span>내용을 확인하세요.</span>
            <div className="interaction-targets">
              <KeyTarget label="닫기" active={step === 1} />
              <KeyTarget label="확인" active={step === 2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractionScene = ({ story, step }: { story: Story; step: number }) => {
  switch (story.interaction) {
    case "event": return <EventVisual key={step} stop={step === 1} />;
    case "focus": return <FocusScene story={story} step={step} tabOrder={false} />;
    case "tab": return <FocusScene story={story} step={step} tabOrder />;
    case "controls": return <ControlsScene story={story} step={step} disabled={false} />;
    case "disabled": return <ControlsScene story={story} step={step} disabled />;
    case "dialog": return <DialogScene story={story} step={step} />;
    case "counter": return <CounterScene step={step} />;
    case "filter": return <FilterScene step={step} />;
    case "request": return <RequestScene step={step} />;
    default: return null;
  }
};
