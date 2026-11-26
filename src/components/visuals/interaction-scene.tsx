import type { Story } from "src/components/visuals/stories";

const Keyboard = ({ input, step }: { input?: string; step: number }) => {
  const pressed = input?.split(" / ")[0].split(" + ") ?? [];
  const rows = [["Escape", "1", "2", "3", "4", "5"], ["Tab", "Q", "W", "E", "R", "Enter"], ["Shift", "A", "S", "D", "Space"]];
  return (
    <div className="interaction-keyboard" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div className="interaction-keyboard__row" key={rowIndex}>
          {row.map((key) => (
            <kbd key={`${key}-${pressed.includes(key) ? step : "idle"}`} data-key={key} data-pressed={pressed.includes(key)}>
              <span key={pressed.includes(key) ? step : "idle"}>{key === "Escape" ? "Esc" : key}</span>
            </kbd>
          ))}
        </div>
      ))}
    </div>
  );
};

const Cursor = ({ step }: { step: number }) => (
  <span key={step} className="interaction-cursor" aria-hidden="true">
    <svg width="25" height="31" viewBox="0 0 25 31" fill="none">
      <path d="M3 2L21 19L13 20L17 28L12 30L8 22L3 27Z" fill="var(--text)" stroke="var(--background)" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  </span>
);

const KeyTarget = ({ label, active = false, dim = false, note }: { label: string; active?: boolean; dim?: boolean; note?: string }) => (
  <div className="interaction-target" data-active={active} data-dim={dim}>
    <span>{label}</span>
    {note ? <small>{note}</small> : null}
  </div>
);

const EventScene = ({ step }: { step: number }) => (
  <div className="interaction-event" data-step={step} aria-hidden="true">
    <div className="interaction-event__parent">
      <span className="interaction-event__label">부모 요소</span>
      <div className="interaction-event__flow" data-active={step === 0}><i /><span>Capture ↓</span></div>
      <div className="interaction-event__target" data-active={step === 1 || step === 3}>
        버튼
        {step === 0 || step === 3 ? <Cursor step={step} /> : null}
      </div>
      <div className="interaction-event__flow" data-active={step === 2} data-blocked={step === 3}><i /><span>{step === 3 ? "전파 차단" : "Bubble ↑"}</span></div>
      {step === 3 ? <code className="interaction-event__stop">stopPropagation()</code> : null}
    </div>
  </div>
);

const FocusScene = ({ story, step, tabOrder }: { story: Story; step: number; tabOrder: boolean }) => (
  <div className="interaction-scene" aria-hidden="true">
    <Keyboard input={story.frames[step].key} step={step} />
    <div className="interaction-targets">
      {story.nodes.map((node, index) => (
        <KeyTarget key={node} label={node}
          active={story.frames[step].states[index]?.tone === "active"}
          dim={story.frames[step].states[index]?.tone === "muted"}
          note={tabOrder && step >= 2 && index === 1 ? "tabindex=-1" : !tabOrder && step === 2 && index === 2 ? "표시 제거" : undefined} />
      ))}
    </div>
  </div>
);

const ControlsScene = ({ story, step, disabled }: { story: Story; step: number; disabled: boolean }) => {
  const input = story.frames[step].key;
  return (
    <div className="interaction-scene" aria-hidden="true">
      <div className="interaction-keyboard-space"><Keyboard input={input === "Click" ? undefined : input} step={step} /></div>
      <div className="interaction-targets">
        {story.nodes.map((node, index) => {
          const state = story.frames[step].states[index];
          return (
            <div className="interaction-control" key={node}>
              <small>{node}</small>
              <div className="interaction-target interaction-target--control" data-active={state?.tone === "active" || (disabled && input === "Tab" && index === 0)} data-dim={disabled && (step === 0 || index === 1)}>
                실행
                {input === "Click" && !(disabled && index === 1) ? <Cursor step={step} /> : null}
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
    <div className="interaction-scene" aria-hidden="true">
      <Keyboard input={story.frames[step].key} step={step} />
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

const CounterScene = ({ step }: { step: number }) => (
  <div className="interaction-targets interaction-counters" aria-hidden="true">
    {[false, true].map((functional) => (
      <div className="interaction-control" key={String(functional)}>
        <small>{functional ? "함수형 갱신" : "직접 갱신"}</small>
        <div className="interaction-count">{step === 2 ? functional ? 3 : 1 : 0}</div>
        <div className="interaction-target interaction-target--control">
          + 3 요청
          {step === 1 ? <Cursor step={step} /> : null}
        </div>
        <div className="interaction-queue">{[0, 1, 2].map((item) => <code key={item} data-shown={step > 0}>{functional ? "+1" : "1"}</code>)}</div>
        <code>{functional ? "setCount(c => c + 1)" : "setCount(count + 1)"}</code>
      </div>
    ))}
  </div>
);

const FilterScene = ({ step }: { step: number }) => (
  <div className="interaction-window" aria-hidden="true">
    <div className="interaction-window__toolbar"><i /><i /><i /></div>
    <div className="interaction-filter">
      <div className="interaction-targets">
        <div className="interaction-field" data-active={step === 1}><small>시작일</small><b>11월 {step === 0 ? 1 : 15}일</b>{step === 1 ? <Cursor step={step} /> : null}</div>
        <div className="interaction-field" data-active={step === 2}><small>종료일</small><b>11월 {step < 2 ? 10 : 20}일</b>{step === 2 ? <Cursor step={step} /> : null}</div>
        <div className="interaction-target interaction-target--control" data-dim={step === 1}>적용{step === 3 ? <Cursor step={step} /> : null}</div>
      </div>
      <div className="interaction-filter__result"><small>적용된 범위</small><strong>{step === 3 ? "11월 15일 ~ 20일" : "11월 1일 ~ 10일"}</strong><span data-warning={step === 1}>{step === 1 ? "시작일이 종료일보다 늦음" : step === 3 ? "새 결과" : "기존 결과 유지"}</span></div>
    </div>
  </div>
);

const RequestScene = ({ step }: { step: number }) => (
  <div className="interaction-window" aria-hidden="true">
    <div className="interaction-window__toolbar"><i /><i /><i /></div>
    <div className="interaction-filter">
      <div className="interaction-field" data-active={step < 2}><small>검색어</small><b>{step === 0 ? "A" : "B"}</b></div>
      <div className="interaction-requests">
        {["A", "B"].map((name, i) => <div key={name}><span>요청 {name}</span><div className="interaction-request-track"><i data-state={i === 0 ? step === 3 ? "late" : "pending" : step === 0 ? "idle" : step === 1 ? "pending" : "done"} /></div></div>)}
      </div>
      <div className="interaction-filter__result"><small>현재 화면</small><strong>{step < 2 ? `${step === 0 ? "A" : "B"} 검색 중…` : "B 검색 결과"}</strong><span>{step === 3 ? "이전 A 응답 무시" : "최신 요청 기준"}</span></div>
    </div>
  </div>
);

export const InteractionScene = ({ story, step }: { story: Story; step: number }) => {
  switch (story.interaction) {
    case "event": return <EventScene step={step} />;
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
