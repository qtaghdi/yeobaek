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
const watchDialogOpening = (dialog) => dialog.evaluate(element => {
  element.addEventListener("animationstart", () => {
    const animations = element.getAnimations();
    const fades = animations.some(animation => animation.effect?.getKeyframes()
      .some(frame => frame.opacity !== undefined && Number(frame.opacity) < 1));
    element.dataset.openingKeepsOpacity = String(animations.length > 0 && !fades);
  }, { once: true });
});

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
    const source = page.locator("section[data-footnotes] li:target");
    await source.getByRole("link").waitFor();
    assert.equal(await source.locator("[data-footnote-backref]").count(), 0);
    await page.goBack();
    await page.waitForURL("**/browser/storage/");

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
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const searchDialog = page.locator(".search-dialog");
    await watchDialogOpening(searchDialog);
    await searchTrigger(page).click();
    await page.locator(".search-dialog[data-opening-keeps-opacity]").waitFor();
    assert.equal(await searchDialog.getAttribute("data-opening-keeps-opacity"), "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const input = searchInput(page);
    const field = page.locator(".search-field");
    const icon = field.locator("svg");
    assert.equal(await icon.getAttribute("aria-hidden"), "true");
    assert.ok(await field.evaluate(element => {
      const border = element.getBoundingClientRect();
      const icon = element.querySelector("svg").getBoundingClientRect();
      const input = element.querySelector("input").getBoundingClientRect();
      return icon.left > border.left && icon.right < input.left && icon.top > border.top && icon.bottom < border.bottom
        && getComputedStyle(element).outlineStyle === "solid"
        && getComputedStyle(element.querySelector("input")).outlineStyle === "none";
    }), `${engine}: search icon and focus outline should sit inside and around the field respectively`);
    await icon.click();
    assert.ok(await focusIs(input));
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

    await page.locator(".sidebar-content a[aria-current=page][href$='/browser/storage/']").waitFor();
    await page.locator(".sidebar-content a[href$='/accessibility/dialog-focus/']").click();
    await page.waitForURL("**/accessibility/dialog-focus/");
    await page.locator(".sidebar-content a[aria-current=page][href$='/accessibility/dialog-focus/']").waitFor();
    await page.waitForFunction(() => !document.querySelector(".example-frame astro-island[ssr]"));
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

const checkPagination = async (browser, engine) => {
  const title = "빌드와 배포를 분리해서 생각하기";
  const renderedLines = element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const rows = new Map();
    const range = document.createRange();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let index = 0; index < node.length; index++) {
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const { top, width } = range.getBoundingClientRect();
        if (width) rows.set(top, (rows.get(top) ?? "") + node.data[index]);
      }
    }
    return [...rows.values()].map(row => row.trim());
  };

  for (const javaScriptEnabled of [true, false]) {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 }, javaScriptEnabled, reducedMotion: "reduce" });
    try {
      await page.goto(origin + "architecture/testing/");
      const next = page.locator('.pagination-links a[rel="next"]');
      const label = next.locator(".link-title");
      if (javaScriptEnabled) await next.locator(".link-title[data-juliya-wrapped]").waitFor();
      assert.equal(await label.textContent(), title);
      const narrow = await label.evaluate(renderedLines);
      assert.ok(narrow.length >= 2);
      assert.equal(narrow.join(" "), title, `${engine}: the pagination title split a word`);
      await assertNoOverflow(page, `${engine}: pagination on narrow screen`);
      if (javaScriptEnabled) {
        const narrowWidth = await label.evaluate(element => element.clientWidth);
        await page.setViewportSize({ width: 540, height: 900 });
        await settle(page);
        assert.ok(await label.evaluate(element => element.clientWidth) > narrowWidth);
        assert.deepEqual(await label.evaluate(renderedLines), [title], `${engine}: the pagination title kept a break after resizing`);
      }
      await next.press("Enter");
      await page.waitForURL("**/architecture/delivery/");
      await page.getByRole("heading", { level: 1, name: title }).waitFor();
      const previous = page.locator('.pagination-links a[rel="prev"]');
      await previous.press("Enter");
      await page.waitForURL("**/architecture/testing/");
    } finally { await page.close(); }
  }
  console.log(`${engine}: pagination wrapping, fallback and keyboard navigation passed`);
};

const checkDialogBeforeHydration = async (browser, engine) => {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  let release;
  const gate = new Promise(resolve => { release = resolve; });

  try {
    await page.route("**/dialog-focus.*.js", async route => {
      await gate;
      await route.continue();
    });
    await page.goto(origin + "accessibility/dialog-focus/", { waitUntil: "domcontentloaded" });
    const frame = page.locator(".example-frame");
    const island = frame.locator("astro-island[ssr]");
    const trigger = frame.getByRole("button", { name: "모달 열기" });
    const dialog = frame.getByRole("dialog", { name: "확인 대화상자" });

    await watchDialogOpening(frame.locator("dialog"));
    await trigger.click();
    await frame.locator("dialog[data-opening-keeps-opacity]").waitFor();
    assert.equal(await dialog.getAttribute("data-opening-keeps-opacity"), "true");
    assert.equal(await island.count(), 1, `${engine}: modal example script should still be pending`);
    assert.ok(await dialog.isVisible(), `${engine}: the first click should open the modal before hydration`);

    release();
    await island.waitFor({ state: "detached" });
    assert.ok(await dialog.isVisible(), `${engine}: modal should remain open when hydration completes`);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.ok(await focusIs(trigger));
    assert.deepEqual(errors, []);
    console.log(`${engine}: initial click opened the modal before hydration`);
  } finally {
    release();
    await page.close();
  }
};

const checkBackDuringHydration = async (browser) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const NativeMessageChannel = window.MessageChannel;
    const pendingTasks = [];
    const state = { phase: "search", released: 0 };
    window.qaBackDuringHydration = state;

    window.MessageChannel = class extends NativeMessageChannel {
      constructor() {
        super();
        // Hold React Scheduler callbacks while the Astro router and input remain active.
        if (!new Error().stack?.includes("/_astro/client.")) return;
        const post = this.port2.postMessage.bind(this.port2);
        this.port2.postMessage = (...args) => {
          if (state.phase === "restored") post(...args);
          else pendingTasks.push(() => post(...args));
        };
      }
    };

    document.addEventListener("astro:hydrate", event => {
      if (state.phase !== "search" || event.target.getAttribute("component-export") !== "FocusRingExample") return;
      state.phase = "back";
      history.back();
    }, true);

    document.addEventListener("astro:page-load", () => {
      if (state.phase !== "back" || !location.pathname.endsWith("/browser/storage/")) return;
      state.phase = "restored";
      state.released = pendingTasks.length;
      pendingTasks.splice(0).forEach(post => post());
    });
  });

  try {
    await go(page, "browser/storage/");
    await searchTrigger(page).click();
    await searchInput(page).fill("ㅍㅋㅅㄹ");
    await page.locator(".search-results a[href$='/accessibility/focus-ring/']").click();
    await page.waitForFunction(() => window.qaBackDuringHydration.phase === "restored");
    await page.locator(".sidebar-content a[aria-current=page][href$='/browser/storage/']").waitFor();
    await settle(page);
    assert.ok(page.url().endsWith("/browser/storage/"));
    assert.ok(await page.evaluate(() => window.qaBackDuringHydration.released > 0), "React scheduler should have queued work");
    assert.deepEqual(errors, [], "WebKit: runtime errors when leaving during hydration");
    console.log("webkit: rapid back while React scheduler work is queued passed");
  } finally {
    await page.close();
  }
};

const checkLoadingExample = async (browser, engine) => {
  const page = await browser.newPage({ hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  try {
    for (const [width, height] of [[320, 568], [390, 844], [560, 800], [768, 1024]]) {
      await page.setViewportSize({ width, height });
      await go(page, "design/loading-states/");
      const frame = page.locator(".example-frame");
      const improved = frame.locator(".inline-example--comparison > div").nth(1);
      const skeleton = improved.getByRole("status", { name: "로딩 중" });
      const title = improved.getByText("문서 제목", { exact: true });
      const positions = () => frame.locator(".inline-example__next").evaluateAll(markers => markers.map(marker =>
        marker.getBoundingClientRect().top - marker.closest(".inline-example").getBoundingClientRect().top));

      await skeleton.waitFor();
      assert.ok(!await title.isVisible(), "Loading card text should be hidden");
      const before = await positions();
      await frame.getByRole("button", { name: "로딩 완료" }).tap();
      await title.waitFor();
      await skeleton.waitFor({ state: "hidden" });
      const after = await positions();
      assert.ok(after[0] > before[0], `${engine} ${width}px: unreserved card should move the next content`);
      assert.ok(Math.abs(after[1] - before[1]) <= 2, `${engine} ${width}px: skeleton moved the next content by ${after[1] - before[1]}px`);

      await frame.getByRole("button", { name: "다시 로딩" }).tap();
      await skeleton.waitFor();
      assert.deepEqual(await positions(), before);
      await assertNoOverflow(page, `${engine} ${width}px loading example`);
    }
    console.log(`${engine}: loading example kept its skeleton position across four touch viewport sizes`);
  } finally {
    await page.close();
  }
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
      await checkPagination(browser, engine);
      await checkDialogBeforeHydration(browser, engine);
      if (engine !== "firefox") await checkLoadingExample(browser, engine);
      if (engine === "chromium") await mobileFlow(browser);
      if (engine === "webkit") await checkBackDuringHydration(browser);
    } finally { await browser.close(); }
  }
} finally { await new Promise(done => server.close(done)); }
