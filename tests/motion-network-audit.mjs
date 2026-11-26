import assert from "node:assert/strict";

const base = (origin) => origin + "/yeobaek/";
const storySelector = ".visual-story";

const checkPaintOrder = async (page, frame) => {
  const top = await page.locator(".story-art--stacking").evaluate((art) => {
    const child = art.querySelector(".story-art__layer-child");
    const sibling = art.querySelector(".story-art__layer-b");
    const a = child.getBoundingClientRect();
    const b = sibling.getBoundingClientRect();
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    if (right <= left || bottom <= top) return "no overlap";
    const visible = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
    return visible?.closest(".story-art__layer-child") === child ? "A"
      : visible?.closest(".story-art__layer-b") === sibling ? "B" : "unknown";
  });
  assert.equal(top, frame === 1 ? "B" : "A");
};

const checkMotion = async (browser, origin) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  try {
    await page.clock.install();
    await page.goto(base(origin) + "css/stacking-context/");
    const story = page.locator(storySelector);
    await story.scrollIntoViewIfNeeded();
    await page.locator("astro-island[ssr]:has(.visual-story)").waitFor({ state: "hidden" });
    await story.getByRole("button", { name: "자동 재생 시작" }).click();
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "true");
    for (let index = 0; index < 3; index++) {
      await page.waitForFunction(expected => Number(document.querySelector(".visual-story")?.dataset.frame) === expected, index);
      await checkPaintOrder(page, index);
      if (index < 2) await page.clock.fastForward(6500);
    }
    await story.getByRole("button", { name: "자동 재생 일시 정지" }).click();
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "false");
    const paused = await story.getAttribute("data-frame");
    await page.clock.fastForward(13000);
    assert.equal(await story.getAttribute("data-frame"), paused);

    await story.getByRole("button", { name: "자동 재생 시작" }).click();
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "true");
    const toc = page.locator("starlight-toc nav");
    await toc.getByRole("link", { name: "참고 자료 요약" }).click();
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "false");
    const offscreen = await story.getAttribute("data-frame");
    await page.clock.fastForward(13000);
    assert.equal(await story.getAttribute("data-frame"), offscreen);
    await toc.getByRole("link", { name: "직접 숫자를 바꿔봅시다" }).click();
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "true");
    await page.clock.fastForward(6500);
    await page.waitForFunction(previous => document.querySelector(".visual-story")?.dataset.frame !== previous, offscreen);

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "false");
    const hiddenFrame = await story.getAttribute("data-frame");
    await page.clock.fastForward(13000);
    assert.equal(await story.getAttribute("data-frame"), hiddenFrame);
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "true");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => document.querySelector(".visual-story")?.dataset.playing === "false");
    assert.equal(await story.getByRole("button", { name: "자동 재생 시작" }).count(), 1);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    const summary = page.locator(".sidebar-content summary").filter({ hasText: "03 · React와 상태·데이터" });
    const group = summary.locator("..");
    await summary.click();
    await page.waitForFunction(() => [...document.querySelectorAll(".sidebar-content details")].some(details =>
      details.querySelector("summary")?.textContent?.includes("03 · React") && details.querySelector("ul")?.style.overflow === "hidden"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => [...document.querySelectorAll(".sidebar-content details")].some(details =>
      details.querySelector("summary")?.textContent?.includes("03 · React") && details.open && details.querySelector("ul")?.style.overflow === ""));
    await summary.click();
    assert.equal(await group.getAttribute("open"), null);
    await summary.click();
    assert.notEqual(await group.getAttribute("open"), null);
  } finally {
    await page.close();
  }
};

const checkDelayedFont = async (browser, origin) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  try {
    await page.route("**/qa-delayed-font.woff2", async route => {
      await gate;
      await route.abort();
    });
    await page.addInitScript(() => {
      const font = new FontFace("qa-delayed", "url(/yeobaek/qa-delayed-font.woff2)");
      document.fonts.add(font);
      void font.load().catch(() => undefined);
    });
    await page.goto(base(origin) + "react/state-snapshot/", { waitUntil: "domcontentloaded" });
    const title = page.locator("h1#_top");
    const original = await title.textContent();
    assert.equal(await title.getAttribute("data-juliya-wrapped"), null);
    assert.equal(await page.evaluate(() => document.fonts.status), "loading");
    assert.ok(original?.trim().length > 0);
    assert.ok(await title.isVisible());
    release();
    await page.waitForFunction(() => document.fonts.status === "loaded");
    await page.locator("h1#_top[data-juliya-wrapped=true]").waitFor();
    assert.equal(await title.textContent(), original);
    for (const width of [375, 1440, 320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await title.textContent(), original);
      const bounds = await title.evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
      assert.ok(bounds.width > 0 && bounds.scroll <= bounds.width + 2);
    }
  } finally {
    release();
    await page.close();
  }
  const fallback = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 667 } });
  try {
    await fallback.goto(base(origin) + "react/state-snapshot/");
    const title = fallback.locator("h1#_top");
    assert.equal(await title.textContent(), "상태를 바꿨는데 값이 그대로인 이유");
    assert.ok(await title.isVisible());
    assert.equal(await title.getAttribute("data-juliya-wrapped"), null);
  } finally {
    await fallback.close();
  }
};

const checkDocumentLoading = async (browser, origin) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  try {
    await page.goto(base(origin) + "css/stacking-context/");
    await page.locator("h1#_top[data-juliya-wrapped=true]").waitFor();
    await page.route("**/react/state-snapshot/", async (route) => {
      await gate;
      await route.continue();
    });
    await page.locator(".sidebar-content summary").filter({ hasText: "03 · React와 상태·데이터" }).click();
    await page.locator(".sidebar-content a[href$='/react/state-snapshot/']").click({ noWaitAfter: true });
    await page.locator(".main-pane[aria-busy=true] .document-loading").waitFor();
    assert.equal(await page.locator(".sidebar-pane[aria-busy=true], header[aria-busy=true]").count(), 0);
    release();
    await page.waitForURL("**/react/state-snapshot/");
    await page.getByRole("heading", { level: 1, name: "상태를 바꿨는데 값이 그대로인 이유" }).waitFor();
    await page.locator("h1#_top[data-juliya-wrapped=true]").waitFor();
    assert.equal(await page.locator(".main-pane[aria-busy=true], .document-loading").count(), 0);
    await page.locator("starlight-toc nav").getByRole("link", { name: "두 버튼을 눌러봅시다" }).click();
    await page.waitForURL(/state-snapshot\/#/);
    assert.equal(await page.locator(".main-pane[aria-busy=true], .document-loading").count(), 0);
  } finally {
    release();
    await page.close();
  }
};

export const runMotionNetworkAudit = async (browser, origin) => {
  await checkMotion(browser, origin);
  await checkDelayedFont(browser, origin);
  await checkDocumentLoading(browser, origin);
  console.log("motion, delayed font fallback and document loading audit passed");
};
