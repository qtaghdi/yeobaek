import type { Meta, StoryObj } from "@storybook/react-vite";
import { Comparison, defaults, Playground } from "@yeobaek/experiments/stack";

const meta = {
  title: "CSS/쌓임 맥락",
  id: "003-stacking-context",
  component: Playground,
  args: defaults,
  parameters: { controls: { disable: true } },
  argTypes: {
    parentZ: {
      name: "부모 A · z-index",
      control: "select",
      options: ["auto", -1, 0, 1, 2, 3, 9999],
    },
    childZ: {
      name: "자식 A · z-index",
      control: { type: "number", step: 1 },
    },
    transform: { control: "boolean" },
    opacity: { control: { type: "range", min: 0.1, max: 1, step: 0.05 } },
    isolate: { name: "isolation: isolate", control: "boolean" },
  },
} satisfies Meta<typeof Playground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicZIndex: Story = {
  name: "Basic Z-Index",
  render: () => (
    <main className="stack-demo">
      <div className="stack-demo__comparison">
        {[1, 3].map((z) => (
          <section key={z} aria-label={`A의 z-index가 ${z}일 때`}>
            <p className="stack-demo__caption">
              <code>A: {z} / B: 2</code>
            </p>
            <div className="stack-demo__diagram">
              <div className="stack-demo__first" style={{ zIndex: z }}>
                <strong>A</strong>
                <code>z: {z}</code>
              </div>
              <div className="stack-demo__sibling">
                <strong>B</strong>
                <code>z: 2</code>
              </div>
              <p className="stack-demo__context">장면 → A · 장면 → B</p>
            </div>
          </section>
        ))}
      </div>
    </main>
  ),
};

export const StackingContextProblem: Story = { args: { parentZ: 1 } };

export const TransformAndStackingContext: Story = {
  render: () => (
    <Comparison
      before="transform: none"
      after="transform: translateX(0)"
      change={{ transform: true }}
    />
  ),
};

export const OpacityAndStackingContext: Story = {
  render: () => (
    <Comparison
      before="opacity: 1"
      after="opacity: 0.8"
      change={{ opacity: 0.8 }}
    />
  ),
};

export const Isolation: Story = {
  render: () => (
    <Comparison
      before="isolation: auto"
      after="isolation: isolate"
      change={{ isolate: true }}
    />
  ),
};

export const InteractivePlayground: Story = {
  parameters: { controls: { disable: false } },
};
