import { useState } from "react";
import "./stacking-context.scss";

type StackArgs = {
  parentZ: number | "auto";
  childZ: number;
  transform: boolean;
  opacity: number;
  isolate: boolean;
};

const defaults: StackArgs = {
  parentZ: "auto",
  childZ: 9999,
  transform: false,
  opacity: 1,
  isolate: false,
};

const Layers = ({
  parentZ,
  childZ,
  transform,
  opacity,
  isolate,
}: StackArgs) => {
  const hasContext = parentZ !== "auto" || transform || opacity < 1 || isolate;

  return (
    <div className="stack-demo__diagram">
      <div
        className="stack-demo__parent"
        style={{
          zIndex: parentZ,
          transform: transform ? "translateX(0)" : "none",
          opacity,
          isolation: isolate ? "isolate" : "auto",
        }}
      >
        <span>부모 A · {parentZ}</span>
        <div className="stack-demo__child" style={{ zIndex: childZ }}>
          <strong>자식 A</strong>
          <code>z: {childZ}</code>
        </div>
      </div>
      <div className="stack-demo__sibling">
        <strong>부모 B</strong>
        <code>z: 2</code>
      </div>
      <p className="stack-demo__context">
        {hasContext ? "장면 → 부모 A → 자식 A" : "장면 → 자식 A"} · 장면 → 부모
        B
      </p>
    </div>
  );
};

const Playground = (args: StackArgs) => (
  <div className="stack-demo">
    <Layers {...args} />
  </div>
);

export const StackingContextExample = () => {
  const [args, setArgs] = useState<StackArgs>(defaults);
  const [childDraft, setChildDraft] = useState(String(defaults.childZ));
  return <div className="example-workbench">
    <div className="example-workbench__controls">
      <label>부모 A z-index <select value={args.parentZ} onChange={(event) => setArgs({ ...args, parentZ: event.target.value === "auto" ? "auto" : Number(event.target.value) })}>
        {["auto", 0, 1, 2, 3].map((z) => <option key={z}>{z}</option>)}
      </select></label>
      <label>자식 A z-index <input type="number" step="1" value={childDraft} onChange={(event) => {
        const value = event.target.value;
        setChildDraft(value);
        if (/^-?\d+$/.test(value) && Number.isSafeInteger(Number(value))) setArgs(previous => ({ ...previous, childZ: Number(value) }));
      }} onBlur={() => setChildDraft(String(args.childZ))} /></label>
      <label><input type="checkbox" checked={args.transform} onChange={(event) => setArgs({ ...args, transform: event.target.checked })} /> transform</label>
      <label><input type="checkbox" checked={args.isolate} onChange={(event) => setArgs({ ...args, isolate: event.target.checked })} /> isolation</label>
      <label>opacity <input type="range" min="0.1" max="1" step="0.1" value={args.opacity} onChange={(event) => setArgs({ ...args, opacity: Number(event.target.value) })} /></label>
      <button type="button" onClick={() => { setArgs(defaults); setChildDraft(String(defaults.childZ)); }}>초기화</button>
    </div>
    <Playground {...args} />
  </div>;
};
