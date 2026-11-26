import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://qtaghdi.github.io",
  base: "/yeobaek",
  integrations: [
    react(),
    starlight({
      title: "여백",
      description: "아는 것과 이해하는 것 사이의 여백을 채웁니다.",
      defaultLocale: "root",
      locales: { root: { label: "한국어", lang: "ko" } },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/qtaghdi/yeobaek" }],
      customCss: ["./src/styles/notebook.scss"],
      sidebar: [
        { label: "첫 장", items: [{ label: "여백 소개", slug: "start" }] },
        { label: "01 · 웹과 접근성", items: ["accessibility/focus-ring"] },
        { label: "02 · CSS", items: ["css/stacking-context"] },
        { label: "03 · UI와 UX", items: ["design/visual-hierarchy"] },
      ],
      expressiveCode: { styleOverrides: { borderRadius: "0.25rem" } },
    }),
  ],
});
