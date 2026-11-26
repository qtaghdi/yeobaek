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

  await page.evaluate(() => { window.__yeobaekNavigationProbe = true; });
  const inactive = page.locator(".sidebar-content a[href$='/browser/events/']").first();
  await inactive.click();
  await page.waitForURL("**/browser/events/");
  await page.locator(".sidebar-content a[aria-current='page'][href$='/browser/events/']").waitFor();
  assert.equal(await page.evaluate(() => window.__yeobaekNavigationProbe), true, "sidebar navigation reloaded the document");
  await page.goBack();
  await page.waitForURL("**/browser/storage/**");
  assert.equal(await page.evaluate(() => window.__yeobaekNavigationProbe), true, "history navigation reloaded the document");
  console.log(`Verified ${storyCount} visual scenes and ${exampleCount} interactive examples at both viewport widths plus interaction contracts.`);
  await page.close();
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
