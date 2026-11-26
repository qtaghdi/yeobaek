import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "여백 · 실험실",
    brandUrl: "https://qtaghdi.github.io/yeobaek/",
    colorPrimary: "#554b28",
    colorSecondary: "#554b28",
    appBg: "#f8f6ef",
    appContentBg: "#fffdf7",
    appBorderColor: "#dedad0",
    barBg: "#f8f6ef",
    barTextColor: "#67645b",
    barSelectedColor: "#292823",
    textColor: "#292823",
  }),
});
