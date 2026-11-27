import assert from "node:assert/strict";
import { documentSections } from "../src/features/navigation/document-sections.mjs";

export const auditPublishedNavigation = async (browser, origin, screenshotDir) => {
  const base = origin + "/yeobaek/";
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  try {
    await page.goto(base);
    const index = page.locator(".chapter-index");
    const articles = await index.locator("a").evaluateAll(links => links.map(link => new URL(link.href).pathname));
    const expected = documentSections.flatMap(section => section.chapters.flatMap(chapter => chapter.pages.map(route => "/yeobaek/" + route + "/")));
    assert.deepEqual(articles, expected);
    assert.deepEqual(await index.locator(".chapter-section > h3").allTextContents(), ["프론트엔드", "디자인", "개발과 운영", "백엔드", "AI"]);
    assert.match(await page.locator(".chapter-heading").textContent(), new RegExp(`${expected.length}개 글`));
    for (const [width, columns] of [[320, 1], [736, 1], [737, 2], [1007, 2], [1008, 3], [1280, 3]]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.evaluate((columns) => {
        const gap = (first, second) => second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
        const title = document.querySelector(".hero h1");
        const tagline = document.querySelector(".hero .tagline");
        const sections = [...document.querySelectorAll(".chapter-section")];
        const chapters = [...sections[0].querySelectorAll(".chapter")];
        const description = chapters[0].querySelector("p");
        const original = description.textContent;
        description.textContent += " 설명이 길어서 두 줄 이상 이어지는 경우에도 장 제목과 첫 번째 글의 위치를 확인합니다.";
        const firstRow = chapters.slice(0, columns);
        const listStarts = firstRow.map(chapter => chapter.querySelector("li > a").getBoundingClientRect().top);
        const aligned = Math.max(...listStarts) - Math.min(...listStarts) <= 1;
        const overflow = sections.some(section => section.scrollWidth > section.clientWidth + 1);
        const introSpacing = gap(title, tagline) > 0 && gap(title, tagline) < gap(tagline, document.querySelector(".hero .actions"));
        description.textContent = original;
        return { aligned, overflow, introSpacing };
      }, columns);
      assert.deepEqual(geometry, { aligned: true, overflow: false, introSpacing: true }, width + "px");
    }
    await page.getByRole("link", { name: "글 둘러보기" }).click();
    await page.waitForURL(url => decodeURIComponent(url.hash) === "#목차");
    if (screenshotDir) await index.screenshot({ path: screenshotDir + "/index-desktop.png" });

    const labels = index.locator(".chapter-label > h4");
    await labels.first().and(page.locator("[data-juliya-wrapped]")).waitFor();
    assert.equal(await labels.and(page.locator("[data-juliya-wrapped]")).count(), await labels.count());
    assert.equal(await index.locator("a[data-juliya-wrapped]").count(), 0);
    const longLabel = labels.filter({ hasText: "컴포넌트와 디자인 시스템" });
    const originalTitle = await longLabel.textContent();
    await longLabel.evaluate(el => { el.style.inlineSize = "7rem"; });
    await longLabel.locator("br[data-kowrap-break]").first().waitFor({ state: "attached" });
    assert.equal(await longLabel.textContent(), originalTitle);
    await longLabel.evaluate(el => { el.style.removeProperty("inline-size"); });
    await longLabel.locator("br[data-kowrap-break]").first().waitFor({ state: "detached" });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.getByRole("link", { name: "글 둘러보기" }).click();
    await page.waitForURL(url => decodeURIComponent(url.hash) === "#목차");
    await page.waitForFunction(() => {
      const header = document.querySelector("header.header").getBoundingClientRect();
      const toc = document.getElementById("목차").getBoundingClientRect();
      return toc.top >= header.bottom && toc.bottom <= innerHeight;
    });
    assert.ok(await index.evaluate(el => el.scrollWidth <= el.clientWidth + 2));
    if (screenshotDir) await page.screenshot({ path: screenshotDir + "/index-mobile.png" });
    const design = index.getByRole("link", { name: "디자인 토큰은 왜 필요할까?" });
    await design.click();
    await page.waitForURL("**/design-system/tokens/");

    const sidebar = page.locator(".sidebar-content");
    await page.locator("starlight-menu-button button").click();
    await sidebar.locator('a[aria-current="page"][href$="/design-system/tokens/"]').waitFor();
    await page.setViewportSize({ width: 1280, height: 900 });
    const outer = sidebar.locator(".top-level > li > details > summary").filter({ hasText: "개발과 운영" });
    const inner = sidebar.locator("summary").filter({ hasText: "06 · 아키텍처와 개발자 경험" });
    const open = summary => summary.locator("..").evaluate(el => el.open);
    assert.equal(await open(outer), true);
    assert.equal(await open(inner), false);
    await inner.press("Enter");
    assert.equal(await open(inner), true);
    await outer.press("Enter");
    assert.equal(await open(outer), false);
    assert.equal(await sidebar.getByRole("link", { name: "여백 소개" }).count(), 0);
    await sidebar.getByRole("link", { name: "재사용 가능한 컴포넌트의 API" }).click();
    await page.waitForURL("**/design-system/component-api/");
    assert.equal(await open(outer), false);
    await outer.press("Enter");
    assert.equal(await open(inner), true);
    await sidebar.getByRole("link", { name: "폴더 구조보다 중요한 모듈 경계" }).click();
    await page.waitForURL("**/architecture/module-boundaries/");
    await sidebar.locator('a[aria-current="page"][href$="/architecture/module-boundaries/"]').waitFor();
    await page.goto(base + "start/");
    await page.waitForURL(base);
    assert.equal(await page.locator(".chapter-index").count(), 1);
    console.log("Published navigation, chapter links, legacy redirect, mobile menu and nested sidebar persistence passed");
  } finally {
    await page.close();
  }
};
