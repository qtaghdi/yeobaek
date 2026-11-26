import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { remarkReferenceNotes, rehypeReferenceNotes } from "./src/lib/references/reference-notes.mjs";

export default defineConfig({
  site: "https://qtaghdi.github.io",
  base: "/yeobaek",
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  vite: { resolve: { alias: { src: fileURLToPath(new URL("./src", import.meta.url)) } } },
  markdown: { remarkPlugins: [remarkReferenceNotes], rehypePlugins: [rehypeReferenceNotes] },
  integrations: [
    react(),
    starlight({
      title: "여백",
      logo: { light: "./src/assets/brand/lockup-light.svg", dark: "./src/assets/brand/lockup-dark.svg", replacesTitle: true },
      description: "아는 것과 이해하는 것 사이의 여백을 채웁니다.",
      defaultLocale: "root",
      locales: { root: { label: "한국어", lang: "ko" } },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/qtaghdi/yeobaek" }],
      customCss: ["./src/styles/archive.scss"],
      pagefind: false,
      components: { Head: "./src/components/document-head.astro", Search: "./src/components/document-search.astro", ThemeSelect: "./src/components/document-theme-select.astro" },
      sidebar: [
        { label: "첫 장", items: [{ label: "여백 소개", slug: "start" }] },
        { label: "01 · 웹 플랫폼과 접근성", collapsed: true, items: ["browser/events","accessibility/semantic-controls","accessibility/focus-ring","accessibility/tab-order","accessibility/dialog-focus","accessibility/disabled-state","browser/storage"] },
        { label: "02 · CSS·텍스트·렌더링", collapsed: true, items: ["css/cascade","css/flex-overflow","css/stacking-context","css/viewport","css/scrollbar","css/text-wrap","browser/layout-observation","css/rendering-strategies"] },
        { label: "03 · React와 상태·데이터", collapsed: true, items: ["language/type-runtime","react/state-snapshot","react/controlled-input","react/effects","react/server-state","react/state-location","react/query-keys","language/async-requests","react/error-handling","react/auth-lifecycle"] },
        { label: "04 · 컴포넌트와 디자인 시스템", collapsed: true, items: ["design-system/tokens","design-system/why-design-system","design-system/component-api","design-system/compatibility"] },
        { label: "05 · 복합 인터랙션과 제품 UI", collapsed: true, items: ["design/visual-hierarchy","design/loading-states","design/feedback","design/team-balance"] },
        { label: "06 · 아키텍처와 개발자 경험", collapsed: true, items: ["architecture/module-boundaries","architecture/monorepo"] },
        { label: "07 · 검증·배포·운영", collapsed: true, items: ["architecture/testing","architecture/delivery"] },
      ],
      expressiveCode: { styleOverrides: { borderRadius: "0.25rem" } },
    }),
  ],
});
