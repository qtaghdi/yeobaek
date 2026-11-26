import type { Meta, StoryObj } from "@storybook/react-vite";
import { Buttons, type FocusRingArgs } from "@yeobaek/experiments/focus";

const meta = {
  title: "접근성/포커스 링",
  id: "001-focus-ring",
  args: {
    count: 3,
    size: "regular",
    labels: "numbers",
    disableSecond: false,
    showLegend: true,
  },
  argTypes: {
    count: { control: "inline-radio", options: [2, 3, 4] },
    size: {
      control: "inline-radio",
      options: ["compact", "regular", "large"],
    },
    labels: { control: "inline-radio", options: ["numbers", "letters"] },
    disableSecond: { control: "boolean", name: "Disable second button" },
    showLegend: { control: "boolean", name: "Show selector legend" },
  },
  parameters: {
    controls: { exclude: ["showLegend"] },
  },
} satisfies Meta<FocusRingArgs>;

export default meta;

type Story = StoryObj<FocusRingArgs>;

export const BrowserDefault: Story = {
  render: (args) => (
    <main className="focus-ring" aria-label="브라우저 기본 포커스 링">
      <Buttons {...args} />
    </main>
  ),
};

export const OutlineRemoved: Story = {
  render: (args) => (
    <main
      className="focus-ring focus-ring--outline-removed"
      aria-label="포커스 표시를 제거한 의도된 접근성 실패 예제"
    >
      <Buttons {...args} />
    </main>
  ),
};

export const CustomFocusRing: Story = {
  render: (args) => (
    <main
      className="focus-ring focus-ring--split"
      aria-label="밝은 배경과 어두운 배경의 커스텀 포커스 링 비교"
    >
      <section className="focus-ring__panel" aria-label="밝은 배경">
        <Buttons {...args} />
      </section>
      <section
        className="focus-ring__panel focus-ring__panel--dark"
        aria-label="어두운 배경"
      >
        <Buttons {...args} />
      </section>
    </main>
  ),
};

export const FocusVsFocusVisible: Story = {
  name: "Focus vs Focus Visible",
  parameters: {
    controls: { exclude: [] },
  },
  render: ({ showLegend, ...args }) => (
    <main
      className="focus-ring focus-ring--comparison"
      aria-label="클릭과 Tab으로 focus와 focus-visible 비교"
    >
      <Buttons {...args} />
      {showLegend && (
        <div className="focus-ring__legend">
          <code>:focus</code>
          <code>:focus-visible</code>
        </div>
      )}
    </main>
  ),
};
