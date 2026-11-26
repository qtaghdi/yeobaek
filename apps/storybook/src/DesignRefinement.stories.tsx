import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesignStage, Login, stages } from "@yeobaek/experiments/design";

const meta = {
  title: "UI와 UX/시각적 위계",
  id: "002-design-refinement",
  component: DesignStage,
  args: { stage: "before" },
  argTypes: { stage: { control: "select", options: stages } },
} satisfies Meta<typeof DesignStage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Before: Story = {};
export const Typography: Story = { args: { stage: "typography" } };
export const Spacing: Story = { args: { stage: "spacing" } };
export const Color: Story = { args: { stage: "color" } };
export const VisualHierarchy: Story = { args: { stage: "hierarchy" } };
export const After: Story = { args: { stage: "after" } };

export const BeforeAfter: Story = {
  name: "Before / After",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className="design-demo">
      <div className="design-demo__comparison">
        <section aria-label="Before">
          <p className="design-demo__caption">Before</p>
          <Login stage="before" />
        </section>
        <section aria-label="After">
          <p className="design-demo__caption">After</p>
          <Login stage="after" />
        </section>
      </div>
    </main>
  ),
};
