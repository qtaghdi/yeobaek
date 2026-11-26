import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const playwright = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const engines = (process.env.BROWSER_ENGINES ?? "chromium").split(",");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!pathname.startsWith("/yeobaek/")) { response.writeHead(404).end(); return; }
    const relative = pathname.slice("/yeobaek/".length);
    const target = resolve(root, relative.endsWith("/") || !relative ? join(relative, "index.html") : relative);
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep)) { response.writeHead(404).end(); return; }
    const content = await readFile(target);
    response.writeHead(200, { "Content-Type": types[extname(target)] ?? "application/octet-stream" }).end(content);
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}/yeobaek/`;
const go = async (page, path) => {
  await page.goto(origin + path);
  await page.locator(".main-pane").first().waitFor();
  await page.waitForFunction(() => !document.querySelector(".example-frame astro-island[ssr]"));
  await page.evaluate(() => document.fonts.ready);
};
const documentScroll = page => page.evaluate(() => window.scrollY);
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const searchTrigger = page => page.getByRole("button", { name: "글 검색" });
const searchInput = page => page.getByRole("searchbox", { name: "검색어" });
const menuButton = page => page.locator("starlight-menu-button button");
const assertNoOverflow = async (page, name) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 2, `${name}: document overflow ${overflow}px`);
};
const focusIs = (locator) => locator.evaluate(element => element === document.activeElement);

const coreFlow = async (browser, engine) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", colorScheme: "light" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  try {
    await go(page, "browser/storage/");
    await page.locator("h1#_top[data-juliya-wrapped=true]").waitFor();
    const reference = page.locator(".sl-markdown-content a[data-reference-summary]").first();
    await reference.hover();
    const tooltip = page.getByRole("tooltip");
    await tooltip.waitFor();
    const tip = await tooltip.boundingBox();
    assert.ok(tip && tip.x >= 0 && tip.y >= 0 && tip.x + tip.width <= 1281 && tip.y + tip.height <= 901, `${engine}: tooltip escaped viewport`);
    await page.keyboard.press("Escape");
    await tooltip.waitFor({ state: "hidden" });
    await page.mouse.move(0, 0);
    await reference.focus();
    await tooltip.waitFor();
    await page.keyboard.press("Escape");
    await tooltip.waitFor({ state: "hidden" });

    const citation = page.locator("[data-footnote-ref]").first();
    await citation.click();
    assert.match(page.url(), /#user-content-fn-/);
    await page.locator("[data-footnote-backref]").first().click();
    assert.match(page.url(), /#user-content-fnref-/);

    const theme = page.locator("header.header .theme-trigger");
    await theme.click();
    await page.locator("header.header [data-theme-value=dark]").click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await theme.click();
    await page.locator("header.header [data-theme-value=auto]").click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light");

    await page.evaluate(() => window.scrollTo(0, 250));
    const before = await documentScroll(page);
    assert.ok(before > 0);
    await searchTrigger(page).click();
    const input = searchInput(page);
    await input.fill("ㅍㅋㅅㄹ");
    await page.locator(".search-result-title mark").filter({ hasText: "포커스 링" }).first().waitFor();
    await input.press("Enter");
    assert.match(page.url(), /browser\/storage\//);
    await input.press("ArrowDown");
    assert.ok(await focusIs(page.locator(".search-results a").first()));
    await page.keyboard.press("ArrowUp");
    assert.ok(await focusIs(input));
    await input.press("PageDown");
    assert.equal(await documentScroll(page), before);
    await input.press("Escape");
    await page.locator(".search-dialog").waitFor({ state: "hidden" });
    assert.ok(await focusIs(searchTrigger(page)));
    assert.equal(await documentScroll(page), before);
    await searchTrigger(page).click();
    await input.fill("ㅍㅋㅅㄹ");
    await page.locator(".search-result-title mark").filter({ hasText: "포커스 링" }).first().waitFor();
    await input.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/accessibility/focus-ring/**");
    await page.locator(".main-pane h1").filter({ hasText: "포커스 링" }).waitFor();
    await page.goBack();
    await page.waitForURL("**/browser/storage/**");

    await go(page, "accessibility/dialog-focus/");
    const trigger = page.getByRole("button", { name: "모달 열기" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "확인 대화상자" });
    await dialog.waitFor();
    const modalScroll = await documentScroll(page);
    for (const key of ["Tab", "Shift+Tab", "PageDown", "ArrowDown"]) await page.keyboard.press(key);
    assert.ok(await page.evaluate(() => document.querySelector(".inline-example__dialog").contains(document.activeElement)));
    assert.equal(await documentScroll(page), modalScroll);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.ok(await focusIs(trigger));
    await trigger.click();
    await dialog.getByRole("button", { name: "확인" }).click();
    await dialog.waitFor({ state: "hidden" });
    assert.ok(await focusIs(trigger));
    await assertNoOverflow(page, engine);
    assert.deepEqual(errors, [], `${engine}: runtime or resource errors`);
    console.log(`${engine}: core navigation, theme, tooltip, citation, search, modal and resource checks passed`);
  } finally { await context.close(); }
};

const swipe = async (session, from, to) => {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...from, id: 1 }] });
  for (let step = 1; step <= 8; step++) {
    const x = from.x + (to.x - from.x) * step / 8;
    const y = from.y + (to.y - from.y) * step / 8;
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y, id: 1 }] });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};

const mobileFlow = async (browser) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  try {
    for (const [width, height] of [[320, 568], [375, 667], [390, 844], [768, 1024], [844, 390]]) {
      await page.setViewportSize({ width, height });
      for (const route of ["accessibility/dialog-focus/", "css/flex-overflow/", "css/stacking-context/"]) {
        await go(page, route);
        await assertNoOverflow(page, `${width}x${height} ${route}`);
      }
    }
    await page.setViewportSize({ width: 375, height: 667 });
    await go(page, "accessibility/dialog-focus/");
    await page.evaluate(() => scrollTo(0, 350));
    const before = await documentScroll(page);
    await menuButton(page).tap();
    await page.waitForFunction(() => document.querySelector(".main-frame").inert);
    assert.equal(await menuButton(page).getAttribute("aria-expanded"), "true");
    const pane = page.locator(".sidebar-pane");
    await pane.locator("details:not([open]) > summary").first().tap();
    await page.waitForFunction(() => { const element = document.querySelector(".sidebar-pane"); return element.scrollHeight > element.clientHeight; });
    await pane.evaluate(element => { element.scrollTop = 0; });
    const bounds = await pane.boundingBox();
    const start = await pane.evaluate(element => element.scrollTop);
    await swipe(session, { x: Math.floor(bounds.x + bounds.width / 2), y: Math.floor(bounds.y + bounds.height * .8) }, { x: Math.floor(bounds.x + bounds.width / 2), y: Math.floor(bounds.y + bounds.height * .2) });
    await page.waitForFunction(initial => document.querySelector(".sidebar-pane").scrollTop > initial, start);
    assert.equal(await documentScroll(page), before);
    await menuButton(page).press("Escape");
    await page.waitForFunction(() => !document.querySelector(".main-frame").inert);
    assert.equal(await documentScroll(page), before);
    assert.ok(await focusIs(menuButton(page)));
    await menuButton(page).tap();
    await page.waitForFunction(() => document.querySelector(".main-frame").inert);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForFunction(() => !document.querySelector(".main-frame").inert && !document.body.hasAttribute("data-mobile-menu-expanded"));
    await page.setViewportSize({ width: 375, height: 667 });
    assert.equal(await menuButton(page).getAttribute("aria-expanded"), "false");

    await searchTrigger(page).tap();
    const input = searchInput(page);
    await input.fill("React");
    await page.locator(".search-results a").first().waitFor();
    const locked = await documentScroll(page);
    const content = page.locator(".search-content");
    const area = await content.boundingBox();
    await swipe(session, { x: Math.floor(area.x + area.width / 2), y: Math.floor(area.y + area.height * .85) }, { x: Math.floor(area.x + area.width / 2), y: Math.floor(area.y + area.height * .2) });
    await page.waitForFunction(() => document.querySelector(".search-content").scrollTop > 0);
    assert.equal(await documentScroll(page), locked);
    const dialogBounds = await page.locator(".search-dialog").boundingBox();
    assert.ok(dialogBounds.y + dialogBounds.height <= 667);
    const outsideY = Math.min(666, Math.floor(dialogBounds.y + dialogBounds.height + 15));
    await swipe(session, { x: 180, y: 665 }, { x: 180, y: outsideY });
    await settle(page);
    assert.equal(await documentScroll(page), locked);
    await page.getByRole("button", { name: "검색 닫기" }).tap();
    await page.locator(".search-dialog").waitFor({ state: "hidden" });
    assert.equal(await documentScroll(page), locked);
    assert.ok(await focusIs(searchTrigger(page)));

    const trigger = page.getByRole("button", { name: "모달 열기" });
    await trigger.tap();
    const dialog = page.getByRole("dialog", { name: "확인 대화상자" });
    await dialog.waitFor();
    const modalScroll = await documentScroll(page);
    await swipe(session, { x: 185, y: 625 }, { x: 185, y: 545 });
    await settle(page);
    assert.equal(await documentScroll(page), modalScroll);
    await dialog.getByRole("button", { name: "확인" }).tap();
    await dialog.waitFor({ state: "hidden" });
    assert.ok(await focusIs(trigger));

    await go(page, "css/flex-overflow/");
    const frame = page.locator(".example-frame");
    await frame.getByRole("checkbox").tap();
    assert.ok(await frame.getByRole("checkbox").isChecked());
    const range = frame.getByRole("slider");
    await range.scrollIntoViewIfNeeded();
    const slider = await range.boundingBox();
    const value = await range.inputValue();
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: slider.x + slider.width * .85, y: slider.y + slider.height / 2 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.notEqual(await range.inputValue(), value);
    const region = frame.getByRole("region", { name: "고정 폭 카드 비교 영역" });
    await region.scrollIntoViewIfNeeded();
    const regionBounds = await region.boundingBox();
    await swipe(session, { x: regionBounds.x + regionBounds.width * .8, y: regionBounds.y + regionBounds.height / 2 }, { x: regionBounds.x + regionBounds.width * .2, y: regionBounds.y + regionBounds.height / 2 });
    await page.waitForFunction(() => document.querySelector(".inline-example__scroll").scrollLeft > 0);
    await assertNoOverflow(page, "mobile horizontal example scrolling");

    await go(page, "css/stacking-context/");
    await frame.getByLabel("부모 A z-index").selectOption("3");
    await frame.getByLabel("자식 A z-index").fill("-1");
    assert.equal(await frame.locator(".stack-demo__parent").evaluate(element => element.style.zIndex), "3");
    assert.equal(await frame.locator(".stack-demo__child").evaluate(element => element.style.zIndex), "-1");
    await frame.getByRole("button", { name: "초기화" }).tap();
    assert.equal(await frame.getByLabel("자식 A z-index").inputValue(), "9999");
    await assertNoOverflow(page, "mobile stacking controls");
    console.log("Chromium touch emulation: five viewport sizes, menu, search, modal, touch swipes, checkbox, range, horizontal scrolling, select, number and reset passed");
  } finally { await session.detach(); await context.close(); }
};

try {
  for (const engine of engines) {
    assert.ok(["chromium", "firefox", "webkit"].includes(engine), `Unknown browser ${engine}`);
    const browser = await playwright[engine].launch();
    try {
      await coreFlow(browser, engine);
      if (engine === "chromium") await mobileFlow(browser);
    } finally { await browser.close(); }
  }
} finally { await new Promise(done => server.close(done)); }
