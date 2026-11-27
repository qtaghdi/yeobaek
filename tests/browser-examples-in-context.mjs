import assert from "node:assert/strict";

export const auditExamplesInContext = async (browser, origin, screenshotDir) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const go = async (route, label) => {
    const response = await page.goto(origin + "/yeobaek/" + route + "/");
    assert.ok(response?.ok(), route);
    const frame = page.getByRole("region", { name: label, exact: true });
    await frame.scrollIntoViewIfNeeded();
    await frame.locator("astro-island[ssr]").waitFor({ state: "detached" });
    return frame;
  };
  const press = async (button) => {
    const bounds = await button.boundingBox();
    assert.ok(bounds);
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  };

  try {
    const disabled = await go("accessibility/disabled-state", "비활성 버튼의 포커스와 실행 비교");
    const trial = mode => disabled.locator(`[data-disabled-trial="${mode}"]`);
    const native = trial("native").getByRole("button", { name: "저장" });
    const ariaOnly = trial("aria-only").getByRole("button", { name: "저장" });
    const guarded = trial("guarded").getByRole("button", { name: "저장" });
    const comparison = page.locator(".main-pane");
    assert.equal(await comparison.locator(".visual-story").count(), 0, "the button example is the only demonstration");
    await disabled.evaluate(element => {
      element.tabIndex = -1;
      element.focus();
    });
    await page.keyboard.press("Tab");
    assert.equal(await ariaOnly.evaluate(el => el === document.activeElement), true);
    await page.keyboard.press("Tab");
    assert.equal(await guarded.evaluate(el => el === document.activeElement), true);
    if (screenshotDir) await disabled.screenshot({ path: screenshotDir + "/disabled-keyboard-390.png" });
    await page.keyboard.press("Shift+Tab");
    assert.equal(await ariaOnly.evaluate(el => el === document.activeElement), true);
    await native.scrollIntoViewIfNeeded();
    await native.focus();
    assert.equal(await native.evaluate(el => el === document.activeElement), false);
    for (const button of [native, ariaOnly, guarded]) {
      await button.scrollIntoViewIfNeeded();
      await press(button);
    }
    assert.deepEqual(await disabled.locator("output").allTextContents(), ["저장 실행 0회", "저장 실행 1회", "저장 실행 0회"]);
    await ariaOnly.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    assert.equal(await guarded.evaluate(el => el === document.activeElement), true);
    await page.keyboard.press("Enter");
    assert.deepEqual(await disabled.locator("output").allTextContents(), ["저장 실행 0회", "저장 실행 2회", "저장 실행 0회"]);

    const runtime = await go("language/type-runtime", "API 응답의 타입 단언과 런타임 검사 비교");
    const response = runtime.getByRole("combobox", { name: "API 응답" });
    assert.deepEqual(await runtime.locator("output").allTextContents(), ["TypeError · 이름을 표시하지 못했습니다.", "이름을 불러올 수 없습니다."]);
    await response.selectOption("valid");
    assert.equal(await runtime.locator("pre").textContent(), '{ "name": "여백" }');
    assert.deepEqual(await runtime.locator("output").allTextContents(), ["여백님, 안녕하세요.", "여백님, 안녕하세요."]);
    await response.selectOption("invalid");
    assert.equal(await runtime.locator("pre").textContent(), '{ "name": null }');
    if (screenshotDir) await runtime.screenshot({ path: screenshotDir + "/type-runtime.png" });
    console.log("Native disabled behavior and runtime response validation passed");

    const cascade = await go("css/cascade", "캐스케이드 레이어의 버튼 여백");
    const layer = cascade.getByRole("checkbox", { name: "app 레이어 적용" });
    const waitForPadding = value => page.waitForFunction(expected => {
      const button = document.querySelector(".cascade-preview__button");
      return button && getComputedStyle(button).paddingTop === expected;
    }, value);
    await waitForPadding("12px");
    await layer.press("Space");
    await waitForPadding("8px");
    await layer.press("Space");
    await waitForPadding("12px");

    const wrap = await go("css/text-wrap", "카드 폭에 따른 CSS 줄바꿈");
    const slider = wrap.getByRole("slider", { name: "카드 폭" });
    const wrapMetrics = () => wrap.locator("[data-wrap-mode]").evaluateAll(cards => cards.map(card => {
      const range = document.createRange();
      const rows = new Map();
      const text = card.firstChild;
      for (let index = 0; index < text.length; index++) {
        range.setStart(text, index);
        range.setEnd(text, index + 1);
        const { top, width } = range.getBoundingClientRect();
        if (width) rows.set(top, (rows.get(top) ?? "") + text.data[index]);
      }
      return {
        lines: [...rows.values()],
        width: card.clientWidth,
        text: card.textContent.trim(),
        wordBreak: getComputedStyle(card).wordBreak,
        wrapStyle: getComputedStyle(card).textWrapStyle,
      };
    }));
    await slider.press("Home");
    const narrow = await wrapMetrics();
    assert.notDeepEqual(narrow[0].lines, narrow[1].lines);
    if (screenshotDir) await wrap.screenshot({ path: screenshotDir + "/text-wrap.png" });
    await slider.press("End");
    const wide = await wrapMetrics();
    assert.equal(new Set(narrow.map(card => card.width)).size, 1);
    assert.equal(new Set(narrow.map(card => card.text)).size, 1);
    assert.ok(narrow[0].width < wide[0].width);
    assert.deepEqual(wide.map(card => card.wordBreak), ["normal", "keep-all", "keep-all"]);
    assert.equal(wide[2].wrapStyle, "balance");
    assert.ok(wide[1].lines.length < narrow[1].lines.length);

    const layout = await go("browser/layout-observation", "본문 폭과 크기 변경 알림");
    const sidebar = layout.getByRole("checkbox", { name: "사이드바 표시" });
    const width = layout.locator("[data-content-width]");
    const elementChanges = layout.locator("[data-element-changes]");
    const windowResizes = layout.locator("[data-window-resizes]");
    const readNumber = async (locator) => Number((await locator.textContent()).match(/\d+/)?.[0]);
    await page.waitForFunction(() => Number(document.querySelector("[data-content-width]")?.textContent.match(/\d+/)?.[0]) > 0);
    const originalWidth = await readNumber(width);
    const initialChanges = await readNumber(elementChanges);
    await sidebar.check();
    await page.waitForFunction(previous => Number(document.querySelector("[data-content-width]")?.textContent.match(/\d+/)?.[0]) < previous, originalWidth);
    assert.ok(await readNumber(elementChanges) > initialChanges);
    assert.equal(await readNumber(windowResizes), 0);
    await sidebar.uncheck();
    await page.waitForFunction(expected => Number(document.querySelector("[data-content-width]")?.textContent.match(/\d+/)?.[0]) === expected, originalWidth);
    await page.setViewportSize({ width: 430, height: 844 });
    await page.waitForFunction(() => Number(document.querySelector("[data-window-resizes]")?.textContent.match(/\d+/)?.[0]) > 0);
    console.log("CSS layer, wrapping and ResizeObserver behavior passed");

    const filter = await go("react/controlled-input", "편집 범위와 적용 범위 비교");
    const apply = filter.getByRole("button", { name: "적용", exact: true });
    const start = filter.getByLabel("시작일");
    const end = filter.getByLabel("종료일");
    await start.fill("2026-11-15");
    assert.equal(await apply.isDisabled(), true);
    assert.equal(await filter.getByText("검색 검증", { exact: false }).count(), 1);
    await filter.getByRole("button", { name: "취소" }).click();
    assert.equal(await start.inputValue(), "2026-11-01");
    await start.fill("2026-11-15");
    await end.fill("2026-11-20");
    await apply.click();
    await filter.getByText("모바일 검증", { exact: false }).waitFor();
    await filter.getByText("배포 검증", { exact: false }).waitFor();
    assert.equal(await filter.getByText("검색 검증", { exact: false }).count(), 0);

    const cache = await go("react/query-keys", "검색 조건에 따른 캐시 키 비교");
    const query = name => cache.getByRole("button", { name, exact: true }).click();
    await query("펜 조회");
    await query("노트 조회");
    await cache.getByText("저장된 키 2개").waitFor();
    await cache.getByText("줄 노트, 무지 노트", { exact: true }).waitFor();
    await query("검색어 제외");
    await query("펜 조회");
    await query("노트 조회");
    await cache.getByText("저장된 키 1개").waitFor();
    await cache.getByText("캐시에서 반환").waitFor();
    await cache.getByText("검정 펜, 파란 펜", { exact: true }).waitFor();
    if (screenshotDir) await cache.screenshot({ path: screenshotDir + "/query-keys.png" });

    const observer = await go("react/effects", "패널 크기 관찰과 해제");
    const measurement = observer.locator("output");
    await observer.getByRole("button", { name: "크기 관찰" }).click();
    await measurement.filter({ hasText: /\d+px/ }).waitFor();
    const measuredBefore = await readNumber(measurement);
    await observer.getByRole("button", { name: "패널 좁히기" }).click();
    await page.waitForFunction(previous => Number(document.querySelector(".resize-subscription output")?.textContent.match(/\d+/)?.[0]) < previous, measuredBefore);
    const measuredNarrow = await readNumber(measurement);
    await observer.getByRole("button", { name: "관찰 해제" }).click();
    await observer.getByRole("button", { name: "패널 넓히기" }).click();
    const renderedWide = await observer.locator(".resize-subscription__panel").evaluate(el => el.clientWidth);
    assert.ok(renderedWide > measuredNarrow);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await readNumber(measurement), measuredNarrow);
    console.log("React filter, cache key and effect cleanup behavior passed");

    const feedback = await go("design/feedback", "저장 요청의 진행·성공·실패 비교");
    const save = feedback.getByRole("button", { name: "변경 사항 저장" });
    await save.click();
    await feedback.getByRole("status").filter({ hasText: "변경 사항을 저장하는 중입니다." }).waitFor();
    assert.equal(await save.getAttribute("aria-disabled"), "true");
    await feedback.getByRole("button", { name: "실패 응답 보내기" }).click();
    await feedback.getByRole("status").filter({ hasText: "저장하지 못했습니다." }).waitFor();
    await feedback.getByRole("button", { name: "다시 시도" }).click();
    await feedback.getByRole("button", { name: "성공 응답 보내기" }).click();
    await feedback.getByRole("status").filter({ hasText: "변경 사항을 저장했습니다." }).waitFor();
    if (screenshotDir) await feedback.screenshot({ path: screenshotDir + "/feedback.png" });

    let releaseSelect;
    const selectModuleGate = new Promise(resolve => { releaseSelect = resolve; });
    await page.route("**/select-contract.*.js", async route => {
      await selectModuleGate;
      await route.continue();
    });
    await page.goto(origin + "/yeobaek/design-system/component-api/", { waitUntil: "domcontentloaded" });
    const select = page.getByRole("region", { name: "Select의 활성 항목과 폼 전송값 확인" });
    const combobox = select.getByRole("combobox", { name: "작업 상태" });
    try {
      await select.scrollIntoViewIfNeeded();
      await select.getByRole("status").filter({ hasText: "예제를 준비하는 중입니다." }).waitFor();
      for (const control of [combobox, ...await select.getByRole("button").all()]) {
        assert.ok(await control.isDisabled(), "controls must wait for the example to be ready");
      }
      if (screenshotDir) await select.screenshot({ path: screenshotDir + "/select-preparing-390.png" });
    } finally {
      releaseSelect();
    }
    await select.getByRole("status").filter({ hasText: "전송값이 여기에 표시됩니다." }).waitFor();
    assert.ok(await combobox.isEnabled());
    const formValue = select.locator('input[name="status"]');
    assert.equal(await formValue.inputValue(), "in-progress");
    await combobox.press("Enter");
    await combobox.press("ArrowDown");
    const active = await combobox.getAttribute("aria-activedescendant");
    assert.ok(active);
    assert.equal(await page.evaluate(id => document.getElementById(id)?.textContent.trim(), active), "완료");
    assert.equal(await formValue.inputValue(), "in-progress");
    await combobox.press("Escape");
    assert.equal(await formValue.inputValue(), "in-progress");
    assert.ok(await combobox.evaluate(element => element === document.activeElement));
    await combobox.press("Enter");
    await combobox.press("ArrowDown");
    await combobox.press("Enter");
    await select.getByRole("button", { name: "전송값 확인" }).click();
    await select.getByRole("status").filter({ hasText: "status=done" }).waitFor();
    if (screenshotDir) await select.screenshot({ path: screenshotDir + "/select-submitted-390.png" });
    await select.getByRole("button", { name: "초기 상태로" }).click();
    assert.equal(await formValue.inputValue(), "in-progress");

    const assets = await go("architecture/delivery", "배포 경로별 이미지 요청");
    await assets.getByRole("status").filter({ hasText: "이미지가 로드되었습니다." }).waitFor();
    assert.equal(await assets.locator("img").getAttribute("src"), "/yeobaek/favicon.svg");
    await assets.getByRole("button", { name: "도메인 루트" }).click();
    await assets.getByRole("status").filter({ hasText: "이 주소에서 이미지를 불러오지 못했습니다." }).waitFor();
    assert.equal(await assets.locator("img").getAttribute("src"), "/favicon.svg");
    await assets.getByRole("button", { name: "프로젝트 경로" }).click();
    await assets.getByRole("status").filter({ hasText: "이미지가 로드되었습니다." }).waitFor();
    assert.ok(await assets.locator("img").evaluate(image => image.complete && image.naturalWidth > 0));
    console.log("Save feedback, Select form contract and deployment path behavior passed");


  } finally {
    await page.close();
  }
};
