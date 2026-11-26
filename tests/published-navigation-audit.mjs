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
    assert.deepEqual(await index.locator(".chapter-section > h3").allTextContents(), ["프론트엔드", "디자인", "개발과 운영"]);
    assert.match(await page.locator(".chapter-heading").textContent(), /37개 글/);
    await page.getByRole("link", { name: "글 둘러보기" }).click();
    await page.waitForURL(url => decodeURIComponent(url.hash) === "#목차");
    if (screenshotDir) await index.screenshot({ path: screenshotDir + "/index-desktop.png" });

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
    await sidebar.getByRole("link", { name: "여백 소개" }).click();
    await page.waitForURL("**/start/");
    assert.equal(await open(outer), false);
    await outer.press("Enter");
    assert.equal(await open(inner), true);
    await sidebar.getByRole("link", { name: "폴더 구조보다 중요한 모듈 경계" }).click();
    await page.waitForURL("**/architecture/module-boundaries/");
    await sidebar.locator('a[aria-current="page"][href$="/architecture/module-boundaries/"]').waitFor();
    console.log("Published navigation, chapter links, mobile menu and nested sidebar persistence passed");
  } finally {
    await page.close();
  }
};
