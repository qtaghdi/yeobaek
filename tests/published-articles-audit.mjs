import assert from "node:assert/strict";

const articles = [
  { slug: "integrations/apple-music-presence", query: "Discord Presence", sample: "code" },
  { slug: "integrations/docx-dropdown-choice", query: "Word 드롭다운", sample: "code" },
  { slug: "backend/workbook-revisions", query: "baseRevision" },
  { slug: "backend/error-grouping", query: "오류 지문", sample: "table" },
  { slug: "ai/review-ci-gating", query: "리뷰 에이전트", sample: "table" },
];

export const auditPublishedArticles = async (browser, origin, screenshots) => {
  const base = origin + "/yeobaek/";
  const page = await browser.newPage({ viewport: { width: 320, height: 760 }, reducedMotion: "reduce" });
  try {
    for (const { slug, query, sample } of articles) {
      await page.goto(base);
      await page.getByRole("button", { name: "글 검색" }).click();
      await page.getByRole("searchbox", { name: "검색어" }).fill(query);
      const reachable = page.locator(`.search-results a[href^="/yeobaek/${slug}/"]`);
      await reachable.click();
      await page.waitForURL(base + slug + "/");
      const title = page.locator("h1#_top");
      assert.ok((await title.textContent()).trim().endsWith("?"));
      assert.ok(await title.evaluate(el => el.scrollWidth <= el.clientWidth + 2), slug);
      const contents = page.locator(".sl-markdown-content");
      assert.ok(await contents.locator("h2").count() >= 3);
      assert.ok(await contents.locator("section[data-footnotes] li").count() >= 2);
      await contents.getByRole("heading", { name: "참고 자료 요약" }).waitFor();
      if (sample === "code") {
        assert.ok(await contents.locator(".expressive-code pre code").count() >= 1);
        await contents.getByRole("button", { name: "코드 복사" }).first().waitFor();
      } else if (sample === "table") {
        assert.equal(await contents.locator("table tbody tr").count(), slug.startsWith("backend/") ? 3 : 2);
      }
      const reference = contents.locator("a[data-footnote-ref]").first();
      await reference.click();
      const summary = page.locator("section[data-footnotes] li:target");
      await summary.getByRole("link").waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2), slug);
      if (screenshots) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.screenshot({ path: screenshots + "/" + slug.split("/").at(-1) + "-320.png" });
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + "backend/workbook-revisions/");
    const sidebar = page.locator(".sidebar-content");
    await sidebar.getByRole("link", { name: "사람과 AI가 같은 시트를 편집하면 누구의 변경을 남겨야 할까?" }).waitFor();
    const next = page.locator('.pagination-links a[rel="next"]');
    await next.click();
    await page.waitForURL(base + "backend/error-grouping/");
    assert.ok(await sidebar.locator('a[aria-current="page"][href$="/backend/error-grouping/"]').isVisible());
    if (screenshots) await page.screenshot({ path: screenshots + "/error-grouping-desktop.png" });
    console.log("Five new notes opened through search, with rendered code, tables, citations and sidebar navigation");
  } finally {
    await page.close();
  }
};
