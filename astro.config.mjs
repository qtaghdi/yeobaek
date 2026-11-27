import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { documentSections } from "./src/features/navigation/document-sections.mjs";
import { remarkReferenceNotes, rehypeReferenceNotes } from "./src/features/references/reference-notes.mjs";

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
      favicon: "/favicon.svg",
      logo: { light: "./src/assets/brand/lockup-light.svg", dark: "./src/assets/brand/lockup-dark.svg", replacesTitle: true },
      description: "직접 써본 기술과 만들면서 겪은 일을 기록하는 개인 블로그입니다.",
      defaultLocale: "root",
      locales: { root: { label: "한국어", lang: "ko" } },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/qtaghdi/yeobaek" }],
      customCss: ["./src/styles/document.scss"],
      pagefind: false,
      components: { PageTitle: "./src/features/navigation/article-title.astro", Pagination: "./src/features/navigation/article-pagination.astro", Hero: "./src/features/landing/landing-hero.astro", Head: "./src/features/navigation/document-head.astro", Search: "./src/features/search/document-search.astro", ThemeSelect: "./src/features/theme/document-theme-select.astro" },
      sidebar: [
        ...documentSections.map(({ title, chapters }) => ({
          label: title,
          items: chapters.map(({ number, title, pages }) => ({
            label: number + " · " + title,
            collapsed: true,
            items: pages,
          })),
        })),
      ],
      expressiveCode: { styleOverrides: { borderRadius: "0.25rem" } },
    }),
  ],
});
