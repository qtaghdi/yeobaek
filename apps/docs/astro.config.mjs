import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://qtaghdi.github.io",
  base: "/yeobaek",
  vite: { resolve: { alias: { src: fileURLToPath(new URL("./src", import.meta.url)) } } },
  integrations: [
    react(),
    starlight({
      title: "여백",
      description: "아는 것과 이해하는 것 사이의 여백을 채웁니다.",
      defaultLocale: "root",
      locales: { root: { label: "한국어", lang: "ko" } },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/qtaghdi/yeobaek" }],
      customCss: ["./src/styles/notebook.scss"],
      components: { Head: "./src/components/document-head.astro" },
      sidebar: [
        { label: "첫 장", items: [{ label: "여백 소개", slug: "start" }] },
        { label: "01 · 웹과 접근성", collapsed: true, items: ["accessibility/focus-ring", "accessibility/semantic-controls", "accessibility/tab-order", "accessibility/dialog-focus", "accessibility/disabled-state"] },
        { label: "02 · CSS", collapsed: true, items: ["css/stacking-context", "css/flex-overflow", "css/cascade", "css/viewport", "css/scrollbar", "css/text-wrap"] },
        { label: "03 · 브라우저", collapsed: true, items: ["browser/events", "browser/storage", "browser/layout-observation"] },
        { label: "04 · JavaScript와 TypeScript", collapsed: true, items: ["language/type-runtime", "language/async-requests"] },
        { label: "05 · React와 상태 관리", collapsed: true, items: ["react/state-snapshot", "react/controlled-input", "react/effects", "react/state-location", "react/query-keys"] },
        { label: "06 · UI와 UX", collapsed: true, items: ["design/visual-hierarchy", "design/loading-states", "design/feedback"] },
        { label: "07 · 디자인 시스템", collapsed: true, items: ["design-system/tokens", "design-system/component-api", "design-system/compatibility"] },
        { label: "08 · 아키텍처와 품질", collapsed: true, items: ["architecture/module-boundaries", "architecture/monorepo", "architecture/testing", "architecture/delivery"] },
      ],
      expressiveCode: { styleOverrides: { borderRadius: "0.25rem" } },
    }),
  ],
});
