import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
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
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch();
try {
  const pages = (await readdir(root, { recursive: true })).filter((file) => file.endsWith("index.html") && !file.startsWith("_astro/")).map((file) => "/yeobaek/" + file.slice(0, -"index.html".length));
  let storyCount = 0;
  let exampleCount = 0;
  for (const [width, theme] of [[1280, "light"], [320, "dark"]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
    await page.clock.install();
    for (const route of pages) {
      await page.goto(origin + route);
      await page.locator(".main-pane").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        examples: [...document.querySelectorAll(".example-frame, .visual-story")].map((element) => ({ label: element.getAttribute("aria-label"), width: element.clientWidth, scroll: element.scrollWidth })),
        visuals: document.querySelectorAll(".visual-story").length,
        interactive: document.querySelectorAll(".example-frame").length
      }));
      assert.ok(geometry.scroll <= geometry.viewport + 2, `${width} ${route}: page overflow ${geometry.scroll} > ${geometry.viewport}`);
      for (const example of geometry.examples) {
        assert.ok(example.width > 0 && example.scroll <= example.width + 3, `${width} ${route}: ${example.label} leaked overflow ${example.scroll} > ${example.width}`);
      }
      for (const scene of await page.locator(".visual-story").all()) {
        await scene.scrollIntoViewIfNeeded();
        await scene.getByRole("button", { name: "자동 재생 시작" }).click();
        await page.waitForFunction(() => document.querySelector(".visual-story")?.getAttribute("data-playing") === "true");
        const count = Number(await scene.getAttribute("data-frame-count"));
        assert.ok(count > 1);
        for (let step = 1; step < count; step++) {
          await page.clock.fastForward(6500);
          await page.waitForFunction(expected => Number(document.querySelector(".visual-story")?.getAttribute("data-frame")) === expected, step);
          if (route.includes("/css/stacking-context/")) {
            const layers = await scene.locator(".story-art--stacking").evaluate(el => [...el.children].map(child => getComputedStyle(child).zIndex));
            assert.deepEqual(layers, [[ "auto", "2"], ["1", "2"], ["3", "2"]][step]);
            assert.equal(await scene.locator(".story-art__layer-child").evaluate(el => getComputedStyle(el).zIndex), "9999");
          }
          const dimensions = await scene.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
          assert.ok(dimensions.scroll <= dimensions.width + 3, width + " " + route + " frame " + step + ": overflow");
        }
      }
      if (width === 1280) { storyCount += geometry.visuals; exampleCount += geometry.interactive; }
      console.log(`${width} ${theme} ${route} : ${geometry.visuals} visuals, ${geometry.interactive} interactive examples`);
    }
    await page.close();
  }
  assert.ok(storyCount >= 20 && exampleCount >= 11, `visuals=${storyCount}, examples=${exampleCount}`);

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const go = async (route) => { await page.goto(origin + "/yeobaek/" + route + "/"); await page.locator(".main-pane").first().waitFor(); await page.waitForFunction(() => !document.querySelector(".example-frame astro-island[ssr]")); };
  const frame = () => page.locator(".example-frame");
  const click = async (name) => frame().getByRole("button", { name, exact: true }).click();
  await go("browser/events");
  await click("안쪽 버튼");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), ["부모 캡처", "대상 버튼", "부모 버블"]);
  await click("기록 지우기");
  await frame().getByRole("checkbox").check();
  await click("안쪽 버튼");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), ["부모 캡처", "대상 버튼"]);

  await go("accessibility/semantic-controls");
  await frame().locator(".inline-example__button").first().click();
  await frame().getByRole("button", { name: "클릭 0" }).press("Enter");
  assert.equal(await frame().locator(".inline-example__button").first().innerText(), "클릭 1");
  assert.equal(await frame().getByRole("button", { name: "클릭 1" }).count(), 1);

  await go("accessibility/focus-ring");
  await frame().getByRole("checkbox").check();
  assert.ok(await frame().getByRole("button", { name: "버튼 02" }).isDisabled());
  await frame().getByText("포커스 제거", { exact: true }).click();
  assert.equal(await frame().locator(".focus-ring--outline-removed").count(), 1);

  await go("accessibility/tab-order");
  await frame().getByRole("checkbox").check();
  assert.equal(await frame().getByRole("button", { name: "2", exact: true }).getAttribute("tabindex"), "-1");

  await go("accessibility/dialog-focus");
  await click("모달 열기");
  await frame().getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await frame().getByRole("dialog").waitFor({ state: "hidden" });
  assert.ok(await frame().getByRole("button", { name: "모달 열기" }).evaluate(el => el === document.activeElement));

  await go("css/flex-overflow");
  const scroll = frame().getByRole("region", { name: "고정 폭 카드 비교 영역" });
  await frame().getByRole("checkbox").check();
  assert.ok(await scroll.locator(".inline-example__flex").evaluate(el => el.scrollWidth <= el.clientWidth + 2));
  await frame().getByRole("checkbox").uncheck();
  assert.equal(await scroll.locator(".inline-example__flex").getAttribute("data-overflow"), "true");

  await go("css/stacking-context");
  await frame().getByLabel("부모 A z-index").selectOption("3");
  assert.equal(await frame().locator(".stack-demo__parent").evaluate(el => el.style.zIndex), "3");
  const childZ = frame().getByLabel("자식 A z-index");
  await childZ.fill("");
  assert.equal(await frame().locator(".stack-demo__child").evaluate(el => el.style.zIndex), "9999");
  await childZ.fill("-1");
  assert.equal(await frame().locator(".stack-demo__child").evaluate(el => el.style.zIndex), "-1");
  await childZ.fill("1.5");
  await childZ.blur();
  assert.equal(await childZ.inputValue(), "-1");

  await go("react/state-snapshot");
  const requests = frame().getByRole("button", { name: "세 번 요청" });
  await requests.first().click();
  await requests.last().click();
  assert.deepEqual(await frame().locator("output").allTextContents(), ["1", "3"]);

  await go("language/async-requests");
  await click("응답 순서 재현");
  await page.waitForFunction(() => [...document.querySelectorAll(".example-frame output")].map(e => e.textContent).join(",") === "A 결과,B 결과");

  await go("design/visual-hierarchy");
  await frame().getByText("개선 후", { exact: true }).click();
  assert.equal(await frame().locator(".design-demo__card--after").count(), 1);

  await go("design/loading-states");
  await click("로딩 완료");
  assert.equal(await frame().locator(".inline-example__loaded").count(), 2);

  await go("browser/storage");
  await page.locator("h1#_top[data-juliya-wrapped=true]").waitFor();
  const ref = page.locator(".sl-markdown-content a[data-reference-summary]").first();
  await ref.hover();
  await page.getByRole("tooltip").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("tooltip").waitFor({ state: "hidden" });
  assert.ok(await ref.getAttribute("aria-describedby"));
  const citation = page.locator("[data-footnote-ref]").first();
  await citation.click();
  assert.ok(page.url().includes("#user-content-fn-"));
  const back = page.locator("[data-footnote-backref]").first();
  assert.equal(await back.innerText(), "본문으로");
  await back.click();

  const storageLink = page.locator(".sidebar-content a[href$='/browser/storage/']").first();
  const activeHeight = await storageLink.evaluate(el => el.getBoundingClientRect().height);
  await page.evaluate(() => { window.__yeobaekNavigationProbe = true; });
  const inactive = page.locator(".sidebar-content a[href$='/browser/events/']").first();
  await inactive.click();
  await page.waitForURL("**/browser/events/");
  await page.locator(".sidebar-content a[aria-current='page'][href$='/browser/events/']").waitFor();
  assert.equal(await page.evaluate(() => window.__yeobaekNavigationProbe), true, "sidebar navigation reloaded the document");
  assert.equal(await storageLink.evaluate(el => el.getBoundingClientRect().height), activeHeight, "active sidebar label changed its height");
  await page.goBack();
  await page.waitForURL("**/browser/storage/**");
  assert.equal(await page.evaluate(() => window.__yeobaekNavigationProbe), true, "history navigation reloaded the document");
  const searchPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await searchPage.goto(origin + "/yeobaek/browser/storage/");
  const originalUrl = searchPage.url();
  await searchPage.getByRole("button", { name: "글 검색" }).click();
  const searchInput = searchPage.getByRole("searchbox", { name: "검색어" });
  const results = searchPage.locator(".search-results a");
  await searchInput.fill("유지합니다. 실제 레이아웃");
  await searchPage.getByText("검색 결과가 없습니다. 다른 검색어를 입력해 보세요.", { exact: true }).waitFor();
  await searchInput.fill("React");
  await results.first().waitFor();
  await searchPage.evaluate(() => {
    const input = document.querySelector(".search-bar input");
    const old = document.querySelector(".search-results a");
    input.value = "존재하지않는검색어";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    old.click();
  });
  await searchPage.getByText("검색 결과가 없습니다. 다른 검색어를 입력해 보세요.", { exact: true }).waitFor();
  assert.equal(searchPage.url(), originalUrl);
  assert.ok(await searchPage.locator(".search-dialog").isVisible());
  await searchInput.fill("상태를 다뤘습니다.");
  await searchPage.locator(".search-result-description mark").filter({ hasText: "상태를 다뤘습니다." }).first().waitFor();
  assert.ok(await results.count() > 0);
  for (const result of await results.all()) {
    assert.ok((await result.innerText()).includes("상태를 다뤘습니다."));
  }
  await searchInput.press("Enter");
  assert.equal(searchPage.url(), originalUrl);
  assert.ok(await searchPage.locator(".search-dialog").isVisible());
  assert.equal(await searchPage.locator(".search-bar button").count(), 1);
  assert.equal(await searchInput.evaluate(el => getComputedStyle(el).appearance), "none");
  await searchInput.fill("포");
  await searchPage.locator(".search-status").filter({ hasText: "결과를 선택해 열어 주세요." }).waitFor();
  await searchInput.press("Enter");
  assert.equal(searchPage.url(), originalUrl);
  assert.ok(await searchPage.locator(".search-dialog").isVisible());
  await searchInput.fill("ㅍ");
  await searchInput.press("Enter");
  assert.equal(searchPage.url(), originalUrl);
  assert.ok(await searchPage.locator(".search-dialog").isVisible());
  await searchInput.fill("ㅍㅋㅅㄹ");
  await searchPage.locator(".search-result-title mark").filter({ hasText: "포커스 링" }).first().waitFor();
  await searchInput.press("Enter");
  assert.equal(searchPage.url(), originalUrl);
  assert.ok(await searchPage.locator(".search-dialog").isVisible());
  await searchInput.press("ArrowDown");
  await searchPage.keyboard.press("Enter");
  await searchPage.waitForURL("**/accessibility/focus-ring/");
  await searchPage.locator("h1").filter({ hasText: "포커스 링" }).waitFor();
  await searchPage.close();

  const recovery = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await recovery.route("**/search-index.json", route => route.fulfill({ json: {} }));
  await recovery.goto(origin + "/yeobaek/");
  await recovery.getByRole("button", { name: "글 검색" }).click();
  await recovery.getByRole("button", { name: "다시 시도" }).waitFor();
  await recovery.unroute("**/search-index.json");
  await recovery.getByRole("button", { name: "다시 시도" }).click();
  await recovery.getByRole("searchbox").fill("포커스 링");
  await recovery.locator(".search-result-title mark").filter({ hasText: "포커스 링" }).first().waitFor();
  await recovery.close();

  const historyPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await historyPage.goto(origin + "/yeobaek/design/loading-states/?highlight=" + encodeURIComponent("상태를 다뤘습니다.") + "#" + encodeURIComponent("접근성과-모션"));
  await historyPage.locator(".search-document-match").waitFor();
  await historyPage.locator("starlight-toc a[aria-current=true]").filter({hasText: "접근성과 모션"}).waitFor();
  await historyPage.evaluate(() => window.scrollTo({top: 0, behavior: "instant"}));
  await historyPage.waitForFunction(() => scrollY < 5);
  await historyPage.locator(".sidebar-content a[href$='/design/feedback/']").click();
  await historyPage.waitForURL("**/design/feedback/");
  await historyPage.goBack();
  await historyPage.waitForURL("**/design/loading-states/**");
  await historyPage.locator(".search-document-match").waitFor();
  assert.ok(await historyPage.evaluate(() => scrollY < 100), "history restoration must not jump to search highlight");
  await historyPage.close();

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  const first = await context.newPage(), second = await context.newPage();
  await Promise.all([first.goto(origin + "/yeobaek/"), second.goto(origin + "/yeobaek/browser/storage/")]);
  await first.locator(".theme-trigger").click();
  await first.locator("[data-theme-value=dark]").click();
  await second.waitForFunction(() => document.documentElement.dataset.theme === "dark");
  assert.equal(await second.locator(".theme-trigger").getAttribute("aria-label"), "테마 선택: 어두움");
  await first.locator(".theme-trigger").click();
  await first.locator("[data-theme-value=light]").click();
  await second.waitForFunction(() => document.documentElement.dataset.theme === "light");
  await context.close();

  const mobile = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: "reduce" });
  await mobile.goto(origin + "/yeobaek/");
  await mobile.locator(".theme-trigger").waitFor();
  await mobile.goto(origin + "/yeobaek/accessibility/dialog-focus/");
  const menu = mobile.locator("starlight-menu-button button");
  await menu.click();
  await mobile.waitForFunction(() => document.querySelector("starlight-menu-button button").getAttribute("aria-expanded") === "true");
  assert.equal(await mobile.locator(".main-frame").evaluate(el => el.inert), true);
  await menu.press("Escape");
  await mobile.waitForFunction(() => document.querySelector("starlight-menu-button button").getAttribute("aria-expanded") === "false");
  assert.equal(await mobile.locator(".main-frame").evaluate(el => el.inert), false);
  await mobile.locator(".example-frame").getByRole("button", { name: "모달 열기" }).click();
  await mobile.locator(".example-frame").getByRole("dialog").waitFor();
  await mobile.keyboard.press("Escape");
  await mobile.locator(".example-frame").getByRole("dialog").waitFor({state: "hidden"});
  await mobile.close();

  const featuredPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await featuredPage.goto(origin + "/yeobaek/");
  const featuredLink = featuredPage.locator(".archive-featured > a").first();
  assert.equal(await featuredLink.evaluate(el => getComputedStyle(el).backgroundSize), "0% 100%");
  await featuredLink.hover();
  await featuredPage.waitForFunction(() => getComputedStyle(document.querySelector(".archive-featured > a")).backgroundSize === "100% 100%");
  await featuredPage.locator(".search-trigger").hover();
  await featuredPage.waitForFunction(() => getComputedStyle(document.querySelector(".archive-featured > a")).backgroundSize === "0% 100%");
  await featuredLink.focus();
  await featuredPage.keyboard.press("Tab");
  await featuredPage.keyboard.press("Shift+Tab");
  await featuredPage.waitForFunction(() => getComputedStyle(document.querySelector(".archive-featured > a")).backgroundSize === "100% 100%");
  await featuredPage.close();

  const slowPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  let releaseResponse;
  const responseGate = new Promise(resolve => { releaseResponse = resolve; });
  let requestIntercepted;
  const intercepted = new Promise(resolve => { requestIntercepted = resolve; });
  await slowPage.route("**/accessibility/tab-order/", async route => {
    requestIntercepted();
    await responseGate;
    await route.continue();
  });
  try {
    await slowPage.goto(origin + "/yeobaek/browser/storage/");
    await slowPage.locator(".sidebar-content a[href$='/browser/events/']").first().click();
    await slowPage.waitForURL("**/browser/events/");
    await slowPage.locator(".sidebar-content a[aria-current='page'][href$='/browser/events/']").waitFor();
    await slowPage.evaluate(() => { window.__yeobaekNavigationProbe = true; });
    await slowPage.locator(".sidebar-content a[href$='/accessibility/tab-order/']").first().press("Enter");
    await Promise.race([
      intercepted,
      slowPage.waitForURL("**/accessibility/tab-order/").then(() => { throw new Error("Slow document response was not intercepted"); })
    ]);
    await slowPage.locator(".main-pane .document-loading").waitFor({ timeout: 5000 });
    assert.equal(await slowPage.locator(".main-pane").getAttribute("aria-busy"), "true");
    assert.equal(await slowPage.locator(".sidebar-pane").getAttribute("aria-busy"), null);
    releaseResponse();
    await slowPage.waitForURL("**/accessibility/tab-order/");
    await slowPage.locator(".document-loading").waitFor({ state: "hidden" });
    assert.equal(await slowPage.evaluate(() => window.__yeobaekNavigationProbe), true);
  } finally {
    releaseResponse();
    await slowPage.close();
  }
  console.log(`Verified ${storyCount} visual scenes and ${exampleCount} interactive examples at both viewport widths plus interaction contracts.`);
  await page.close();
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
