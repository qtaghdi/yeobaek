import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { auditArticleVisuals } from "./article-visuals-audit.mjs";
import { auditExamplesInContext } from "./browser-examples-in-context.mjs";
import { auditSearchRaces } from "./browser-search-races.mjs";
import { runMotionNetworkAudit } from "./motion-network-audit.mjs";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!pathname.startsWith("/yeobaek/")) { response.writeHead(404).end(); return; }
    const relative = pathname.slice("/yeobaek/".length);
    const target = resolve(root, relative.endsWith("/") || !relative ? join(relative, "index.html") : relative);
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep)) { response.writeHead(404).end(); return; }
    const content = await readFile(target);
    response.writeHead(200, { "Content-Type": types[extname(target)] ?? "application/octet-stream" }).end(content);
  } catch {
    const fallback = await readFile(join(root, "404.html")).catch(() => "Not Found");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end(fallback);
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch();
try {
  const pages = (await readdir(root, { recursive: true })).filter((file) => file.endsWith("index.html") && !file.startsWith("_astro/")).map((file) => "/yeobaek/" + file.slice(0, -"index.html".length));
  let storyCount = 0;
  let exampleCount = 0;
  const documentPaths = new Set(pages);
  const anchors = new Map();
  const linkedAnchors = [];
  for (const [width, theme] of [[1280, "light"], [320, "dark"]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => {
      if (response.url().startsWith(origin + "/") && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.clock.install();
    for (const route of pages) {
      errors.length = 0;
      const response = await page.goto(origin + route);
      assert.ok(response?.ok(), `${route}: document response failed`);
      await page.locator(".main-pane").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (route === "/yeobaek/css/text-wrap/" && width === 1280) {
        const paragraph = page.locator(".sl-markdown-content p").filter({ hasText: /^제목이 한 줄에 안 들어가는 건 괜찮습니다\./ });
        await paragraph.waitFor();
        await page.waitForFunction(() => document.querySelector(".sl-markdown-content p[data-juliya-wrapped]"));
        assert.equal(await paragraph.getAttribute("data-juliya-wrapped"), "true");
        await paragraph.evaluate(element => { element.style.maxWidth = "360px"; });
        await page.clock.runFor(300);
        assert.ok(await paragraph.locator("br[data-kowrap-break]").count(), await paragraph.evaluate(element => element.outerHTML));
        const widths = await paragraph.evaluate(element => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0).map(rect => rect.width);
        });
        assert.ok(widths.length >= 2 && widths.at(-1) >= Math.max(...widths) * .5, "본문 마지막 줄이 지나치게 짧지 않아야 함");
        assert.equal(await paragraph.textContent(), "제목이 한 줄에 안 들어가는 건 괜찮습니다. 그런데 줄 끝에 단어가 어색하게 끊기거나 마지막 줄에 몇 글자만 남으면 같은 제목도 읽기 어렵습니다.");
        await paragraph.evaluate(element => { element.style.removeProperty("max-width"); });
        await page.clock.runFor(300);
      }
      const proseOverflow = await page.evaluate(() => {
        const prose = document.querySelectorAll(".sl-markdown-content p, .sl-markdown-content li");
        return [...prose].filter(el => !el.closest(".not-content, .example-frame, .chapter-index, table, pre, [data-footnotes]")).filter(el => {
          const box = el.getBoundingClientRect();
          if (box.width < 1) return false;
          const range = document.createRange();
          range.selectNodeContents(el);
          return [...range.getClientRects()].some(rect => rect.width > 0 && rect.right > box.right + 3);
        }).map(el => el.textContent.trim().slice(0, 80));
      });
      assert.deepEqual(proseOverflow, [], `${route}: prose overflow`);
      const referenceHeading = page.locator('section[data-footnotes] .reference-notes-heading');
      if (await referenceHeading.count()) {
        const geometry = await referenceHeading.evaluate(heading => {
          const link = heading.nextElementSibling;
          const a = heading.getBoundingClientRect();
          const b = link?.getBoundingClientRect();
          const svg = link?.querySelector("svg");
          const icon = svg?.getBoundingClientRect();
          return b && icon && { iconDelta: Math.abs((a.top + a.bottom - icon.top - icon.bottom) / 2), iconTransform: getComputedStyle(svg).transform, gap: b.left - a.right, midlineDelta: Math.abs((a.top + a.bottom - b.top - b.bottom) / 2), cursor: getComputedStyle(link).cursor, before: getComputedStyle(link, "::before").content, after: getComputedStyle(link, "::after").content };
        });
        assert.ok(geometry && geometry.gap >= 0 && geometry.midlineDelta < 3, `${route}: reference permalink overlaps heading`);
        assert.ok(geometry.iconDelta <= 2, `${route}: 실제 SVG의 세로 위치 ${geometry.iconDelta}`);
        assert.equal(geometry.iconTransform, "none");
        assert.equal(geometry.cursor, "pointer");
        assert.equal(geometry.before, "none");
        assert.equal(geometry.after, "none");
      }
      const geometry = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        examples: [...document.querySelectorAll(".example-frame, .visual-story, .article-diagram")].map((element) => ({ label: element.getAttribute("aria-label"), width: element.clientWidth, scroll: element.scrollWidth })),
        visuals: document.querySelectorAll(".visual-story").length,
        interactive: document.querySelectorAll(".example-frame").length
      }));
      assert.ok(geometry.scroll <= geometry.viewport + 2, `${width} ${route}: page overflow ${geometry.scroll} > ${geometry.viewport}`);
      if (width === 1280) {
        const documentState = await page.evaluate(() => ({
          headings: [...document.querySelectorAll("h1")].map(heading => heading.textContent?.trim()),
          ids: [...document.querySelectorAll("[id]")].map(element => element.id),
          links: [...document.querySelectorAll("a[href]")].map(link => link.href),
          images: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
        }));
        assert.equal(documentState.headings.length, 1, `${route}: expected a single page heading`);
        assert.ok(documentState.headings[0], `${route}: empty page heading`);
        assert.deepEqual(documentState.images, [], `${route}: image load failure`);
        anchors.set(route, new Set(documentState.ids));
        for (const href of documentState.links) {
          const url = new URL(href, origin + route);
          if (url.origin !== origin || !url.pathname.startsWith("/yeobaek/")) continue;
          if (url.pathname.endsWith("/")) {
            assert.ok(documentPaths.has(url.pathname), `${route}: missing internal page ${href}`);
            if (url.hash) linkedAnchors.push({ from: route, path: url.pathname, anchor: decodeURIComponent(url.hash.slice(1)) });
          }
        }
      }
      for (const example of geometry.examples) {
        assert.ok(example.width > 0 && example.scroll <= example.width + 3, `${width} ${route}: ${example.label} leaked overflow ${example.scroll} > ${example.width}`);
      }
      for (const scene of await page.locator(".visual-story").all()) {
        await scene.locator(".visual-story__stage").evaluate(stage => stage.scrollIntoView({ block: "center", behavior: "instant" }));
        await scene.locator("xpath=ancestor::astro-island[@ssr]").waitFor({ state: "detached" });
        await scene.getByRole("button", { name: "자동 재생 시작" }).click();
        await scene.and(page.locator('[data-playing="true"]')).waitFor();
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
          if (route === "/yeobaek/integrations/apple-music-presence/") {
            const discord = scene.locator(".article-scene__pane").nth(1);
            assert.equal(await discord.locator("code").textContent(), ["", "20:59:20 ~ 21:03:20", "20:57:55 ~ 21:01:55", "재생 시각 없음"][step]);
            assert.equal(await discord.locator(".article-scene__track").isVisible(), step !== 3);
          }
          if (route === "/yeobaek/integrations/docx-dropdown-choice/") {
            assert.deepEqual(await scene.locator(".article-scene__field strong").allTextContents(),
              step === 1 ? ["검토 중", "reviewing"] : ["완료", "done"]);
          }
          if (route === "/yeobaek/backend/workbook-revisions/") {
            assert.equal(await scene.locator(".article-scene__sheet strong").textContent(), "42");
            assert.equal(await scene.locator(".article-scene__request strong").textContent(), step === 1 ? "12 읽음" : "충돌");
          }
          const dimensions = await scene.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth }));
          assert.ok(dimensions.scroll <= dimensions.width + 3, width + " " + route + " frame " + step + ": overflow");
        }
      }
      if (width === 1280) { storyCount += geometry.visuals; exampleCount += geometry.interactive; }
      assert.deepEqual(errors, [], `${width} ${route}: JavaScript or local resource failure`);
      console.log(`${width} ${theme} ${route} : ${geometry.visuals} visuals, ${geometry.interactive} interactive examples`);
    }
    await page.close();
  }
  for (const { from, path, anchor } of linkedAnchors) {
    assert.ok(anchors.get(path)?.has(anchor), `${from}: missing internal anchor ${path}#${anchor}`);
  }
  assert.ok(pages.length >= 39 && storyCount >= 22 && exampleCount >= 28, `pages=${pages.length}, visuals=${storyCount}, examples=${exampleCount}`);

  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  try {
    await staticPage.goto(origin + "/yeobaek/integrations/apple-music-presence/");
    const story = staticPage.locator(".visual-story");
    assert.ok(await story.locator(".article-scene--music").isVisible());
    assert.equal(await story.locator(".visual-story__play").count(), 1);
    assert.equal(await story.locator(".visual-story__play").isVisible(), false);
    assert.match(await story.locator(".visual-story__sr-only").last().textContent(), /일시정지/);
  } finally {
    await staticPage.close();
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const go = async (route) => { await page.goto(origin + "/yeobaek/" + route + "/"); await page.locator(".main-pane").first().waitFor(); await page.waitForFunction(() => !document.querySelector(".example-frame astro-island[ssr]")); };
  const frame = () => page.locator(".example-frame");
  const layoutScreenshotDir = process.env.LAYOUT_SCREENSHOT_DIR;
  if (layoutScreenshotDir) await (await import("node:fs/promises")).mkdir(layoutScreenshotDir, { recursive: true });
  const click = async (name) => frame().getByRole("button", { name, exact: true }).click();
  await go("browser/events");
  await click("안쪽 버튼");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), ["부모 캡처", "대상 버튼", "부모 버블"]);
  assert.equal(await frame().locator(".event-propagation__path [data-fired=true]").count(), 3);
  await click("기록 지우기");
  await frame().getByRole("checkbox").check();
  await click("안쪽 버튼");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), ["부모 캡처", "대상 버튼"]);
  assert.equal(await frame().locator(".event-propagation__path [data-fired=true]").count(), 2);
  if (layoutScreenshotDir) await frame().screenshot({ path: join(layoutScreenshotDir, "event-propagation-stopped.png") });
  await click("기록 지우기");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), ["버튼을 눌러 보세요."]);
  await frame().getByRole("checkbox").uncheck();
  for (let index = 0; index < 4; index++) await click("안쪽 버튼");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), Array(3).fill(["부모 캡처", "대상 버튼", "부모 버블"]).flat());

  await go("accessibility/semantic-controls");
  await frame().locator(".inline-example__button").first().click();
  await frame().getByRole("button", { name: "클릭 0" }).press("Enter");
  assert.equal(await frame().locator(".inline-example__button").first().innerText(), "클릭 1");
  assert.equal(await frame().getByRole("button", { name: "클릭 1" }).count(), 1);
  await frame().getByRole("button", { name: "클릭 1" }).press("Space");
  assert.equal(await frame().getByRole("button", { name: "클릭 2" }).count(), 1);
  assert.equal(await frame().locator("div.inline-example__button").innerText(), "클릭 1");

  await go("accessibility/focus-ring");
  await frame().getByRole("checkbox").check();
  assert.ok(await frame().getByRole("button", { name: "버튼 02" }).isDisabled());
  await frame().getByRole("button", { name: "버튼 01" }).focus();
  await page.keyboard.press("Tab");
  assert.ok(await frame().getByRole("button", { name: "버튼 03" }).evaluate(el => el === document.activeElement && el.matches(":focus-visible")));
  await frame().getByText("포커스 제거", { exact: true }).click();
  assert.equal(await frame().locator(".focus-ring--outline-removed").count(), 1);

  await go("accessibility/tab-order");
  await frame().getByRole("checkbox").check();
  assert.equal(await frame().getByRole("button", { name: "2", exact: true }).getAttribute("tabindex"), "-1");
  await frame().getByRole("button", { name: "1", exact: true }).focus();
  await page.keyboard.press("Tab");
  assert.ok(await frame().getByRole("button", { name: "3", exact: true }).evaluate(el => el === document.activeElement));
  await frame().getByRole("checkbox").uncheck();
  await frame().getByRole("button", { name: "1", exact: true }).focus();
  await page.keyboard.press("Tab");
  assert.ok(await frame().getByRole("button", { name: "2", exact: true }).evaluate(el => el === document.activeElement));

  await go("accessibility/dialog-focus");
  await click("모달 열기");
  await frame().getByRole("dialog").waitFor();
  const dialog = frame().getByRole("dialog");
  assert.ok(await dialog.getByRole("button", { name: "닫기" }).evaluate(el => el === document.activeElement));
  await page.keyboard.press("Tab");
  assert.ok(await dialog.getByRole("button", { name: "확인" }).evaluate(el => el === document.activeElement));
  await page.keyboard.press("Shift+Tab");
  assert.ok(await dialog.getByRole("button", { name: "닫기" }).evaluate(el => el === document.activeElement));
  const modalScroll = await page.evaluate(() => scrollY);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY), "hidden");
  for (const key of ["ArrowDown", "ArrowUp", "PageDown", "PageUp"]) await page.keyboard.press(key);
  assert.equal(await page.evaluate(() => scrollY), modalScroll);
  await page.keyboard.press("Escape");
  await frame().getByRole("dialog").waitFor({ state: "hidden" });
  assert.ok(await frame().getByRole("button", { name: "모달 열기" }).evaluate(el => el === document.activeElement));
  for (const action of ["확인", "닫기"]) {
    await click("모달 열기");
    await click(action);
    await dialog.waitFor({ state: "hidden" });
    assert.ok(await frame().getByRole("button", { name: "모달 열기" }).evaluate(el => el === document.activeElement));
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY), "hidden");
  }

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
  const topLayer = async () => {
    await frame().locator(".stack-demo__diagram").scrollIntoViewIfNeeded();
    return frame().locator(".stack-demo__child").evaluate(child => {
      const sibling = child.closest(".stack-demo__diagram").querySelector(".stack-demo__sibling");
      const a = child.getBoundingClientRect(), b = sibling.getBoundingClientRect();
      const left = Math.max(a.left, b.left), right = Math.min(a.right, b.right);
      const top = Math.max(a.top, b.top), bottom = Math.min(a.bottom, b.bottom);
      if (right <= left || bottom <= top) return "no overlap";
      const target = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
      return child.contains(target) ? "child" : sibling.contains(target) ? "sibling" : "other";
    });
  };
  await click("초기화");
  assert.equal(await topLayer(), "child");
  await frame().getByLabel("부모 A z-index").selectOption("1");
  assert.equal(await topLayer(), "sibling");
  if (layoutScreenshotDir) await frame().screenshot({ path: join(layoutScreenshotDir, "stacking-context-scope.png") });
  await frame().getByLabel("부모 A z-index").selectOption("3");
  assert.equal(await topLayer(), "child");
  await click("초기화");
  await frame().getByLabel("transform").check();
  assert.equal(await topLayer(), "sibling");
  await click("초기화");
  await frame().getByLabel("isolation").check();
  assert.equal(await topLayer(), "sibling");

  await go("react/state-snapshot");
  const requests = frame().getByRole("button", { name: "세 번 요청" });
  await requests.first().click();
  await requests.last().click();
  assert.deepEqual(await frame().locator("output").allTextContents(), ["1", "3"]);
  assert.deepEqual(await frame().locator(".state-trace__queue strong").allTextContents(), ["1", "1", "1", "1", "2", "3"]);
  await requests.first().click();
  await requests.last().click();
  assert.deepEqual(await frame().locator("output").allTextContents(), ["2", "6"]);
  assert.deepEqual(await frame().locator(".state-trace__queue strong").allTextContents(), ["2", "2", "2", "4", "5", "6"]);
  if (layoutScreenshotDir) await frame().screenshot({ path: join(layoutScreenshotDir, "state-snapshot-queue.png") });
  await click("초기화");
  assert.deepEqual(await frame().locator("output").allTextContents(), ["0", "0"]);

  await go("language/async-requests");
  await click("응답 순서 재현");
  await click("다시 재현");
  await page.waitForFunction(() => [...document.querySelectorAll(".example-frame output")].map(e => e.textContent).join(",") === "A 결과,B 결과");
  assert.deepEqual(await frame().locator("ol li").allTextContents(), ["A 요청 시작", "B 요청 시작", "B 응답 도착", "A 응답 도착"]);

  await go("design/visual-hierarchy");
  for (const stage of ["문자", "간격", "색상", "위계", "개선 후"]) {
    await frame().getByText(stage, { exact: true }).click();
    assert.ok(await frame().getByRole("radio", { name: stage }).isChecked());
  }
  await frame().getByText("개선 후", { exact: true }).click();
  assert.equal(await frame().locator(".design-demo__card--after").count(), 1);
  const email = frame().getByRole("textbox", { name: "이메일 주소" });
  const login = frame().getByRole("button", { name: "로그인" });
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme });
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, colorScheme);
    await email.focus();
    await page.keyboard.press("Tab");
    assert.ok(await login.evaluate(button => button.matches(":focus-visible") && getComputedStyle(button).outlineColor !== getComputedStyle(button.closest(".design-demo__card")).backgroundColor));
  }
  await email.fill("invalid");
  await login.click();
  assert.ok(await email.evaluate(input => !input.validity.valid));
  assert.equal(await frame().locator(".design-demo__note").innerText(), "연습용 화면 · 실제 인증 없음");
  await email.fill("qa@example.com");
  await login.click();
  assert.equal(await frame().locator(".design-demo__note").innerText(), "이메일 형식을 확인했어요.");
  await page.emulateMedia({ colorScheme: "light" });

  await go("design/loading-states");
  const nextTops = () => frame().locator(".inline-example__next").evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top - el.closest(".inline-example").getBoundingClientRect().top));
  const beforeLoading = await nextTops();
  await click("로딩 완료");
  assert.equal(await frame().locator(".inline-example__loaded").count(), 2);
  const afterLoading = await nextTops();
  assert.ok(afterLoading[0] > beforeLoading[0]);
  assert.ok(Math.abs(afterLoading[1] - beforeLoading[1]) <= 2);
  await click("다시 로딩");
  assert.deepEqual(await nextTops(), beforeLoading);

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
  const source = page.locator("section[data-footnotes] li:target");
  const sourceLink = source.getByRole("link");
  await sourceLink.waitFor();
  const summary = source.locator(".reference-note-summary");
  assert.equal((await summary.textContent()).trim(), await ref.getAttribute("data-reference-summary"));
  assert.ok(await summary.evaluate(element => {
    const title = element.previousElementSibling;
    return title.getBoundingClientRect().bottom <= element.getBoundingClientRect().top
      && parseFloat(getComputedStyle(element).fontSize) < parseFloat(getComputedStyle(title).fontSize);
  }));
  assert.equal(await source.locator("[data-footnote-backref]").count(), 0);
  await page.goBack();
  await page.waitForURL("**/browser/storage/");

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
  await searchPage.goto(origin + "/yeobaek/css/text-wrap/");
  await searchPage.evaluate(() => document.fonts.ready);
  await searchPage.evaluate(() => window.scrollTo({top: 450, behavior: "instant"}));
  const originalUrl = searchPage.url();
  const originalScroll = await searchPage.evaluate(() => scrollY);
  await searchPage.getByRole("button", { name: "글 검색" }).click();
  const searchInput = searchPage.getByRole("searchbox", { name: "검색어" });
  const results = searchPage.locator(".search-results a");
  assert.ok(originalScroll > 0);
  assert.equal(await searchPage.evaluate(() => getComputedStyle(document.documentElement).overflowY), "hidden");
  await searchInput.press("ArrowDown");
  assert.ok(await searchPage.locator(".search-query").first().evaluate(el => el === document.activeElement));
  await searchPage.keyboard.press("ArrowUp");
  assert.ok(await searchInput.evaluate(el => el === document.activeElement));
  await searchInput.press("PageDown");
  await searchInput.press("ArrowUp");
  assert.equal(await searchPage.evaluate(() => scrollY), originalScroll);
  await searchInput.focus();
  await searchInput.press("Escape");
  await searchPage.locator(".search-dialog").waitFor({state: "hidden"});
  assert.notEqual(await searchPage.evaluate(() => getComputedStyle(document.documentElement).overflowY), "hidden");
  assert.equal(await searchPage.evaluate(() => scrollY), originalScroll);
  await searchPage.getByRole("button", { name: "글 검색" }).click();
  await searchInput.fill("유지합니다. 실제 레이아웃");
  await searchPage.getByText("검색 결과가 없습니다. 다른 검색어를 입력해 보세요.", { exact: true }).waitFor();
  for (const key of ["ArrowDown", "ArrowUp", "PageDown", "PageUp"]) await searchInput.press(key);
  assert.equal(await searchPage.evaluate(() => scrollY), originalScroll);
  assert.ok(await searchInput.evaluate(el => el === document.activeElement));
  await searchInput.press("Enter");
  await searchInput.fill("");
  await searchPage.getByRole("heading", {name: "검색 기록"}).waitFor();
  assert.equal(await searchPage.locator(".search-history .search-query").first().innerText(), "유지합니다. 실제 레이아웃");
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
  assert.ok(await results.first().evaluate(el => el === document.activeElement));
  assert.equal(await searchPage.evaluate(() => scrollY), originalScroll);
  await searchPage.keyboard.press("ArrowDown");
  await searchPage.keyboard.press("ArrowUp");
  assert.ok(await results.first().evaluate(el => el === document.activeElement));
  await searchPage.keyboard.press("Enter");
  await searchPage.waitForURL("**/accessibility/focus-ring/");
  await searchPage.locator("h1").filter({ hasText: "포커스 링" }).waitFor();
  await searchPage.close();

  for (const theme of ["light", "dark"]) {
    const layoutPage = await browser.newPage({ viewport: { width: 1920, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
    const measureLayout = () => layoutPage.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const main = rect(".sl-markdown-content"), sidebar = rect(".sidebar-pane"), toc = rect(".right-sidebar");
      const header = rect("header.header > .header"), search = rect(".search-trigger");
      const clientWidth = document.documentElement.clientWidth;
      const page = rect(".page"), root = document.documentElement.getBoundingClientRect();
      return {
        left: main.left - sidebar.right,
        right: toc.left - main.right,
        outerLeft: sidebar.left - page.left,
        outerRight: page.right - toc.right,
        reservedScrollbar: clientWidth - root.width,
        pageAlignment: Math.max(Math.abs(page.left - root.left), Math.abs(page.right - root.right)),
        headerLeft: header.left - sidebar.left,
        headerRight: toc.right - header.right,
        searchAlignment: (search.left + search.right - header.left - header.right) / 2,
        width: main.width,
        overflow: document.documentElement.scrollWidth - Math.min(clientWidth, root.width),
      };
    });
    for (const route of ["browser/events", "css/text-wrap"]) {
      await layoutPage.goto(origin + "/yeobaek/" + route + "/");
      for (const width of [1152, 1280, 1440, 1536, 1600, 1920, 2560]) {
        await layoutPage.setViewportSize({ width, height: 900 });
        await layoutPage.evaluate(() => document.fonts.ready);
        const layout = await measureLayout();
        const label = `${theme} ${route} ${width}`;
        assert.ok(layout.left >= 0 && layout.left <= 50, `${label}: excessive left gutter ${layout.left}`);
        assert.ok(layout.right >= 0 && layout.right <= 50, `${label}: excessive right gutter ${layout.right}`);
        assert.ok(Math.abs(layout.left - layout.right) <= 3, `${label}: unequal internal gutters ${JSON.stringify(layout)}`);
        assert.ok(layout.outerLeft >= -2 && layout.outerRight >= -2 && Math.abs(layout.outerLeft - layout.outerRight) <= 3, `${label}: asymmetric outer space ${JSON.stringify(layout)}`);
        assert.ok(layout.pageAlignment <= 2, `${label}: page does not fill the root layout viewport ${JSON.stringify(layout)}`);
        assert.ok(Math.abs(layout.searchAlignment) <= 3 && Math.abs(layout.headerLeft - layout.headerRight) <= 3, `${label}: header misalignment ${JSON.stringify(layout)}`);
        assert.ok(layout.width <= 840 && layout.overflow <= 2, `${label}: layout overflow ${JSON.stringify(layout)}`);
        if (layoutScreenshotDir) await layoutPage.screenshot({ path: join(layoutScreenshotDir, `${theme}-${route.replaceAll("/", "-")}-${width}.png`) });
        console.log(`${label} layout: ${JSON.stringify(layout)}`);
      }
      const beforeSidebar = await measureLayout();
      for (const summary of await layoutPage.locator(".sidebar-content details:not([open]) > summary").all()) {
        if (await summary.isVisible()) await summary.click();
      }
      const sidebar = layoutPage.locator(".sidebar-pane");
      await sidebar.hover();
      await layoutPage.mouse.wheel(0, 500);
      await layoutPage.waitForFunction(() => document.querySelector(".sidebar-pane").scrollTop > 0);
      assert.deepEqual(await measureLayout(), beforeSidebar, `${theme} ${route}: sidebar expansion/scroll shifted the document`);
      for (const width of [320, 375, 390, 768, 1024]) {
        await layoutPage.setViewportSize({ width, height: 900 });
        assert.ok(await layoutPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2), `${theme} ${route} ${width}: page overflow`);
      }
    }
    await layoutPage.close();
  }

  const sharedHeader = await browser.newPage({ reducedMotion: "reduce" });
  const measureHeader = () => sharedHeader.evaluate(() => {
    const selectors = [".site-title", ".search-trigger", ".social-icons a", ".theme-trigger"];
    return selectors.map(selector => {
      const element = document.querySelector("header.header " + selector);
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    });
  });
  for (const width of [1024, 1152, 1280, 1920, 2560]) {
    await sharedHeader.setViewportSize({ width, height: 900 });
    await sharedHeader.goto(origin + "/yeobaek/");
    await sharedHeader.locator("header.header .theme-trigger").waitFor();
    const landing = await measureHeader();
    await sharedHeader.goto(origin + "/yeobaek/css/text-wrap/");
    await sharedHeader.locator("header.header .theme-trigger").waitFor();
    const article = await measureHeader();
    for (let i = 0; i < landing.length; i++) {
      assert.ok(Math.abs(landing[i].left - article[i].left) < 2 && Math.abs(landing[i].right - article[i].right) < 2, `${width}: 헤더 컨트롤 ${i}가 이동함`);
    }
  }
  for (const route of ["start/", "does-not-exist/"]) {
    const response = await sharedHeader.goto(origin + "/yeobaek/" + route);
    assert.equal(response.status(), 404);
    assert.equal(sharedHeader.url(), origin + "/yeobaek/" + route);
    await sharedHeader.getByRole("heading", { name: "404" }).waitFor();
    await sharedHeader.locator(".hero .tagline[data-juliya-wrapped='true']").waitFor({ state: "attached" });
    await sharedHeader.locator(".not-found p[data-juliya-wrapped='true']").waitFor({ state: "attached" });
    assert.equal(await sharedHeader.locator(".hero h1[data-juliya-wrapped]").count(), 0, "numeric 404 must not be rewritten");
    assert.equal(await sharedHeader.locator(".not-found p").textContent(), "주소를 다시 확인해 주세요. 읽고 싶은 글이 있다면 상단의 검색을 이용하거나 홈의 목차에서 찾아보실 수 있습니다.");
    assert.ok(await sharedHeader.locator(".not-found p").evaluate(el => el.scrollWidth <= el.clientWidth + 2), "404 prose must fit its reading width");
    await sharedHeader.getByRole("link", { name: "홈으로 돌아가기" }).click();
    await sharedHeader.waitForURL(origin + "/yeobaek/");
  }
  await sharedHeader.close();

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
  await historyPage.waitForURL(origin + "/yeobaek/design/loading-states/");
  await historyPage.locator(".search-document-match").waitFor();
  await historyPage.locator("starlight-toc a[aria-current=true]").filter({hasText: "접근성과 모션"}).waitFor();
  await historyPage.evaluate(() => window.scrollTo({top: 0, behavior: "instant"}));
  await historyPage.waitForFunction(() => scrollY < 5);
  await historyPage.locator(".sidebar-content a[href$='/design/feedback/']").click();
  await historyPage.waitForURL("**/design/feedback/");
  await historyPage.goBack();
  await historyPage.waitForURL(origin + "/yeobaek/design/loading-states/");
  await historyPage.getByRole("heading", { name: "접근성과 모션" }).waitFor();
  assert.equal(await historyPage.locator(".search-document-match").count(), 0);
  assert.ok(await historyPage.evaluate(() => scrollY < 100), "history restoration must not jump to search highlight");
  await historyPage.close();

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  const first = await context.newPage(), second = await context.newPage();
  await Promise.all([first.goto(origin + "/yeobaek/"), second.goto(origin + "/yeobaek/browser/storage/")]);
  await first.locator(".theme-trigger").click();
  await first.locator("[data-theme-value=dark]").click();
  await second.waitForFunction(() => document.documentElement.dataset.theme === "dark");
  await second.waitForFunction(() => [...document.querySelectorAll(".theme-trigger")].every(button => button.getAttribute("aria-label") === "테마 선택: 어두움"));
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
  for (const width of [390, 768, 800, 844, 1024, 1152, 1280, 1920, 2560]) {
    await featuredPage.setViewportSize({ width, height: 900 });
    const layout = await featuredPage.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const header = rect("header.header > .header");
      const search = rect(".search-trigger");
      const card = rect(".archive-highlights");
      const featured = rect(".archive-featured");
      const latest = rect(".archive-latest");
      const featuredRows = [...document.querySelectorAll(".archive-featured > a")].map(element => element.getBoundingClientRect());
      const latestRows = [...document.querySelectorAll(".archive-latest > a")].map(element => element.getBoundingClientRect());
      const rowsAligned = featuredRows.length === latestRows.length && featuredRows.every((row, index) => Math.abs(row.top - latestRows[index].top) <= 2 && Math.abs(row.bottom - latestRows[index].bottom) <= 2);
      const hero = rect(".landing-hero");
      const title = rect(".site-title");
      const controls = rect(".right-group");
      return {
        rowsAligned,
        noLatestDates: !document.querySelector('.archive-latest time'),
        sideBySide: latest.left >= featured.right && Math.abs(latest.top - featured.top) <= 2,
        stacked: latest.top >= featured.bottom,
        center: (search.left + search.right - header.left - header.right) / 2,
        contentAlignment: (card.left + card.right - header.left - header.right) / 2,
        heroAlignment: (hero.left + hero.right - card.left - card.right) / 2,
        left: search.left - card.left,
        right: search.right - card.right,
        titleClearance: search.left - title.right,
        controlsClearance: controls.left - search.right,
      };
    });
    assert.ok(width > 736 ? layout.sideBySide && layout.rowsAligned : layout.stacked, `${width}px: latest layout and row alignment`);
    assert.ok(layout.noLatestDates, `${width}px: latest dates should be hidden`);
    assert.ok(Math.abs(layout.contentAlignment) <= 2, `${width}px: featured articles are not centered`);
    assert.ok(Math.abs(layout.heroAlignment) <= 2, `${width}px: hero and featured articles do not align`);
    if (width >= 800) {
      assert.ok(Math.abs(layout.center) <= 2, `${width}px: search is not centered`);
      assert.ok(layout.titleClearance > 0 && layout.controlsClearance > 0, `${width}px: search overlaps other header controls`);
    }
    if (width >= 1280) {
      assert.ok(Math.abs(layout.left) <= 2 && Math.abs(layout.right) <= 2, `${width}px: search and featured articles should use the same width`);
    }
    if (layoutScreenshotDir && [390, 1024, 1920].includes(width)) {
      await featuredPage.screenshot({ path: join(layoutScreenshotDir, `landing-${width}.png`), fullPage: true });
    }
  }
  await featuredPage.setViewportSize({ width: 1280, height: 900 });
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
  await auditExamplesInContext(browser, origin, layoutScreenshotDir);
  const referencePage = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  try {
    await referencePage.goto(origin + "/yeobaek/css/text-wrap/");
    const input = referencePage.getByRole("textbox", { name: "비교할 문장" });
    await input.scrollIntoViewIfNeeded();
    await referencePage.locator("astro-island[ssr]:has(.text-wrap-preview)").waitFor({ state: "detached" });
    await input.fill("긴기술용어와 짧은 문장");
    await referencePage.waitForFunction(() => [...document.querySelectorAll(".text-wrap-preview__text")].every(node => node.textContent.trim() === "긴기술용어와 짧은 문장") && document.querySelectorAll(".text-wrap-preview__text").length === 3);
    const related = referencePage.getByRole("navigation", { name: "관련 글", exact: true });
    const link = related.getByRole("link").first();
    await link.focus();
    await link.press("Enter");
    await referencePage.waitForURL(url => url.pathname !== "/yeobaek/css/text-wrap/");
    assert.ok(await referencePage.getByRole("heading", { level: 1 }).isVisible());
  } finally {
    await referencePage.close();
  }
  await auditArticleVisuals(browser, origin, layoutScreenshotDir);
  await auditSearchRaces(browser, origin);
  await runMotionNetworkAudit(browser, origin);
  console.log(`Verified ${storyCount} visual scenes and ${exampleCount} interactive examples at both viewport widths plus interaction contracts.`);
  await page.close();
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
