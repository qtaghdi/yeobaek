import assert from "node:assert/strict";

const historyKey = "yeobaek-search-history-v1";
const start = "/yeobaek/css/text-wrap/";
const zeroResults = "검색 결과가 없습니다. 다른 검색어를 입력해 보세요.";

export const auditSearchRaces = async (browser, origin) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    let releaseIndex;
    const indexGate = new Promise(resolve => { releaseIndex = resolve; });
    let indexRequests = 0;
    await page.route("**/search-index.json", async route => {
      indexRequests++;
      await indexGate;
      await route.continue();
    });
    try {
      await page.goto(origin + start);
      const input = page.getByRole("searchbox", { name: "검색어" });
      const dialog = page.locator(".search-dialog");
      await page.getByRole("button", { name: "글 검색" }).click();
      await input.fill("React");
      await page.getByText("검색 준비 중…", { exact: true }).waitFor();
      await input.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.equal(await page.locator(".search-trigger").evaluate(el => el === document.activeElement), true);
      await page.getByRole("button", { name: "글 검색" }).click();
      await input.fill("ㅍㅋㅅㄹ");
      releaseIndex();
      await page.locator(".search-result-title mark").filter({ hasText: "포커스 링" }).waitFor();
      assert.equal(indexRequests, 1, "closing/reopening must reuse the in-flight index request");
      await input.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "글 검색" }).click();
      await page.locator(".search-result-title mark").filter({ hasText: "포커스 링" }).waitFor();

      const staleLink = await page.evaluate(() => {
        const input = document.querySelector(".search-bar input");
        const old = document.querySelector(".search-results a");
        for (const value of ["React", "ㅍㅋㅅㄹ"]) {
          input.value = value;
          input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        }
        return {
          auxiliary: old.dispatchEvent(new MouseEvent("auxclick", { button: 1, bubbles: true, cancelable: true })),
          context: old.dispatchEvent(new MouseEvent("contextmenu", { button: 2, bubbles: true, cancelable: true })),
          primary: old.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })),
        };
      });
      assert.deepEqual(staleLink, { auxiliary: false, context: false, primary: false }, "A to B to A must not activate a result from an earlier input generation");
      assert.equal(page.url(), origin + start);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), historyKey), null);

      await input.fill("");
      await page.getByRole("heading", { name: "추천 검색어" }).waitFor();
      const staleChip = await page.evaluate(() => {
        const input = document.querySelector(".search-bar input");
        const old = document.querySelector(".search-suggestions .search-query");
        input.value = "존재하지않는검색어";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        old.click();
        return input.value;
      });
      assert.equal(staleChip, "존재하지않는검색어", "old recommendation must not replace new input");
      await page.getByText(zeroResults, { exact: true }).waitFor();
      assert.equal(await page.evaluate(key => localStorage.getItem(key), historyKey), null);

      await input.fill("React");
      await page.locator(".search-results a").first().waitFor();
      const composing = await page.evaluate(() => {
        const input = document.querySelector(".search-bar input");
        const old = document.querySelector(".search-results a");
        const chip = document.querySelector(".search-suggestions .search-query");
        input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
        input.value = "포";
        input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
        const keys = ["Enter", "ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"];
        const keysLeftToIme = [true, false].every(isComposing => keys.every(key =>
          input.dispatchEvent(new KeyboardEvent("keydown", { key, isComposing, bubbles: true, cancelable: true }))
        ));
        const focused = document.activeElement === input;
        const cancelAllowed = document.querySelector(".search-dialog").dispatchEvent(new Event("cancel", { cancelable: true }));
        chip?.click();
        const clicked = old.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        const value = input.value;
        input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
        return { clicked, value, cancelAllowed, keysLeftToIme, focused };
      });
      assert.deepEqual(composing, { clicked: false, value: "포", cancelAllowed: false, keysLeftToIme: true, focused: true });
      assert.equal(page.url(), origin + start);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), historyKey), null);
      await page.locator(".search-status").filter({ hasText: "결과를 선택해 열어 주세요." }).waitFor();

      const staleKey = await page.evaluate(() => {
        const input = document.querySelector(".search-bar input");
        const old = document.querySelector(".search-results a");
        old.focus();
        input.value = "포커스 링";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        return { activated: old.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })), focused: document.activeElement === input };
      });
      assert.deepEqual(staleKey, { activated: false, focused: true });
      assert.equal(page.url(), origin + start);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), historyKey), null);
      await input.press("Enter");
      await input.fill("React");
      await input.press("Enter");
      await input.fill("react");
      await input.press("Enter");
      await input.fill("");
      await page.getByRole("heading", { name: "검색 기록" }).waitFor();
      assert.deepEqual(await page.locator(".search-history .search-query").allTextContents(), ["react", "포커스 링"]);

      const second = await context.newPage();
      await second.goto(origin + start);
      await second.getByRole("button", { name: "글 검색" }).click();
      await second.getByRole("heading", { name: "검색 기록" }).waitFor();
      await input.fill("Juliya");
      await input.press("Enter");
      await second.locator(".search-history .search-query").filter({ hasText: "Juliya" }).waitFor();
      assert.deepEqual(await second.locator(".search-history .search-query").allTextContents(), ["Juliya", "react", "포커스 링"]);
      await input.fill("");
      await page.getByRole("button", { name: "기록 지우기" }).click();
      await second.getByRole("heading", { name: "검색 기록" }).waitFor({ state: "hidden" });
      await second.close();
      await input.press("Escape");
      await dialog.waitFor({ state: "hidden" });
    } finally {
      releaseIndex();
      await page.close();
    }

    const searchAddress = await context.newPage();
    await searchAddress.emulateMedia({ reducedMotion: "no-preference" });
    try {
      const from = origin + start;
      const article = origin + "/yeobaek/react/server-state/";
      await searchAddress.goto(from);
      await searchAddress.getByRole("button", { name: "글 검색" }).click();
      await searchAddress.getByRole("searchbox", { name: "검색어" }).fill("TanStack Query");
      const result = searchAddress.locator(".search-results a[href^='/yeobaek/react/server-state/']");
      await result.waitFor();
      const shareableUrl = new URL(await result.getAttribute("href"), origin);
      assert.equal(shareableUrl.searchParams.get("highlight"), "TanStack Query");
      assert.equal(decodeURIComponent(shareableUrl.hash), "#우리가-가져온-데이터는-누구의-상태일까");
      let releaseArticle;
      const articleGate = new Promise(resolve => { releaseArticle = resolve; });
      await searchAddress.route(article, async route => {
        await articleGate;
        await route.continue();
      }, { times: 1 });
      await result.press("Enter");
      try {
        const searchDialog = searchAddress.locator(".search-dialog[open]");
        await searchDialog.getByRole("status").filter({ hasText: "글 불러오는 중" }).waitFor();
        assert.equal(searchAddress.url(), from);
      } finally {
        releaseArticle();
      }
      await searchAddress.waitForURL(article);
      await searchAddress.locator(".search-dialog").waitFor({ state: "hidden" });
      const match = searchAddress.locator(".search-document-match").first();
      await match.waitFor();
      assert.equal(await match.textContent(), "TanStack Query");
      const section = searchAddress.locator("starlight-toc [aria-current=true]").filter({ hasText: "우리가 가져온 데이터는 누구의 상태일까?" });
      await section.waitFor();
      const paragraph = searchAddress.getByText("Axios와 TanStack Query를 비교할 때도", { exact: false }).last();
      const waitForParagraphInView = () => searchAddress.waitForFunction(() => {
        const paragraph = [...document.querySelectorAll(".sl-markdown-content p")].find(element => element.textContent.includes("Axios와 TanStack Query를 비교할 때도"));
        const rect = paragraph?.getBoundingClientRect();
        return rect && rect.top >= 64 && rect.bottom <= innerHeight - 24;
      });
      await waitForParagraphInView();
      const originalParagraph = await paragraph.textContent();
      await match.waitFor({ state: "detached" });
      assert.equal(await paragraph.textContent(), originalParagraph);
      await waitForParagraphInView();
      await searchAddress.goBack();
      await searchAddress.waitForURL(from);
      await searchAddress.locator("h1").filter({ hasText: "한국어 줄바꿈" }).waitFor();
      assert.equal(await match.count(), 0);
      await searchAddress.goForward();
      await searchAddress.waitForURL(article);
      await waitForParagraphInView();
      assert.equal(await match.count(), 0);

      const tocLink = searchAddress.locator("starlight-toc nav").getByRole("link", { name: "1분이 지나면 데이터가 사라질까?" });
      await tocLink.click();
      await searchAddress.waitForURL(url => url.pathname === new URL(article).pathname && url.hash !== "");
      await searchAddress.goBack();
      await searchAddress.waitForURL(article);
      await paragraph.waitFor();
      assert.equal(await match.count(), 0);

      const initialIndex = await searchAddress.evaluate(() => history.state.index);
      for (const offset of [1, 2]) {
        const term = "Axios";
        await searchAddress.getByRole("button", { name: "글 검색" }).click();
        await searchAddress.getByRole("searchbox", { name: "검색어" }).fill(term);
        await result.press("Enter");
        await searchAddress.waitForFunction(index => history.state?.index === index && !location.search && !location.hash, initialIndex + offset);
        await match.filter({ hasText: term }).waitFor();
      }
      for (const offset of [1, 0]) {
        const outgoingParagraph = await paragraph.elementHandle();
        await searchAddress.goBack();
        await searchAddress.waitForFunction(index => history.state?.index === index, initialIndex + offset);
        await outgoingParagraph.waitForElementState("hidden");
        await waitForParagraphInView();
        assert.equal(await match.count(), 0);
      }

      shareableUrl.searchParams.set("ref", "qa");
      await searchAddress.goto(shareableUrl.href);
      await searchAddress.waitForURL(article + "?ref=qa");
      await match.waitFor();
      await section.waitFor();
    } finally {
      await searchAddress.close();
    }

    const navigation = await context.newPage();
    let releaseFirst;
    let notifyIntercept;
    let notifyFinished;
    const firstGate = new Promise(resolve => { releaseFirst = resolve; });
    const intercepted = new Promise(resolve => { notifyIntercept = resolve; });
    const finished = new Promise(resolve => { notifyFinished = resolve; });
    await navigation.route("**/css/cascade/", async route => {
      notifyIntercept();
      await firstGate;
      try { await route.continue(); } catch {} finally { notifyFinished(); }
    });
    try {
      await navigation.goto(origin + start);
      await navigation.locator(".sidebar-content a[href$='/css/cascade/']").press("Enter");
      await Promise.race([intercepted, navigation.waitForURL("**/css/cascade/").then(() => { throw new Error("Delayed navigation did not intercept"); })]);
      await navigation.locator(".main-pane .document-loading").waitFor();
      assert.equal(await navigation.locator(".main-pane").getAttribute("aria-busy"), "true");
      await navigation.evaluate(() => document.dispatchEvent(new Event("astro:page-load")));
      assert.equal(await navigation.locator(".main-pane").getAttribute("aria-busy"), "true", "a previous page-load notification must not clear the current request's loading state");
      await navigation.locator(".sidebar-content a[href$='/css/viewport/']").press("Enter");
      await navigation.waitForURL("**/css/viewport/");
      await navigation.locator(".sidebar-content a[aria-current=page][href$='/css/viewport/']").waitFor();
      releaseFirst();
      await finished;
      await navigation.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(navigation.url(), origin + "/yeobaek/css/viewport/");
      assert.equal(await navigation.locator(".main-pane").getAttribute("aria-busy"), null);
      assert.equal(await navigation.locator(".document-loading").count(), 0);
    } finally {
      releaseFirst();
      await navigation.close();
    }
  } finally {
    await context.close();
  }
};
