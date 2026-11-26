import assert from "node:assert/strict";

export const auditInteractionScenes = async (browser, origin, screenshotDir) => {
  const page = await browser.newPage({ viewport: { width: 320, height: 844 }, reducedMotion: "no-preference" });
  const story = page.locator(".visual-story");
  const open = async (route) => {
    await page.goto(origin + "/yeobaek/" + route + "/");
    await story.locator(".visual-story__stage").evaluate(el => el.scrollIntoView({ block: "center" }));
    await story.locator("xpath=ancestor::astro-island[@ssr]").waitFor({ state: "detached" });
  };
  const advance = async (index) => {
    await page.clock.fastForward(6500);
    await story.and(page.locator(`[data-frame="${index}"]`)).waitFor();
  };

  try {
    await page.clock.install();
    await open("browser/events");
    await story.and(page.locator('[data-playing="true"]')).waitFor();
    const event = story.locator(".event-visual");
    const seek = (time) => event.evaluate((el, ms) => {
      for (const animation of el.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = ms;
      }
      const opacity = selector => Number(getComputedStyle(el.querySelector(selector)).opacity);
      return {
        arrow: opacity(".scene-pointer__arrow"),
        hand: opacity(".scene-pointer__hand"),
        scale: getComputedStyle(el.querySelector(".event-visual__target")).scale,
        trace: [...el.querySelectorAll("li")].map(row => Number(getComputedStyle(row).opacity)),
      };
    }, time);

    const approach = await seek(100);
    assert.deepEqual([approach.arrow, approach.hand, approach.trace], [1, 0, [0, 0, 0]]);
    const hover = await seek(410);
    assert.deepEqual([hover.arrow, hover.hand, hover.trace], [0, 1, [0, 0, 0]]);
    const press = await seek(512);
    assert.equal(press.scale, "0.965");
    assert.deepEqual(press.trace, [0, 0, 0]);
    const release = await seek(580);
    assert.ok(release.trace[0] > 0);
    assert.equal(release.trace[1], 0);
    assert.equal(release.scale, "1");
    assert.deepEqual((await seek(770)).trace, [1, 1, 1]);
    assert.deepEqual(await event.locator("li").allTextContents(), ["부모 캡처", "대상 버튼", "부모 버블"]);
    if (screenshotDir) await story.screenshot({ path: screenshotDir + "/event-normal-320.png" });
    await advance(1);
    const blocked = event.locator('li[data-blocked="true"]');
    assert.match(await blocked.textContent(), /부모 버블.*호출 안 됨/);
    await story.getByRole("button", { name: "자동 재생 일시 정지" }).click();
    await story.and(page.locator('[data-playing="false"]')).waitFor();
    assert.ok(await event.evaluate(el => el.getAnimations({ subtree: true }).every(animation => animation.playState !== "running")));
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.deepEqual(await event.locator("li").evaluateAll(rows => rows.map(row => getComputedStyle(row).opacity)), ["1", "1", "1"]);
    if (screenshotDir) await story.screenshot({ path: screenshotDir + "/event-blocked-320.png" });

    const frame = page.getByRole("region", { name: "이벤트 전파 순서" });
    const button = frame.getByRole("button", { name: "안쪽 버튼" });
    await frame.scrollIntoViewIfNeeded();
    await frame.locator("astro-island[ssr]").waitFor({ state: "detached" });
    await button.hover();
    assert.equal(await button.evaluate(el => getComputedStyle(el).cursor), "pointer");
    await page.mouse.down();
    assert.ok(await button.evaluate(el => el.matches(":active")));
    await page.mouse.up();
    assert.deepEqual(await frame.locator("ol li").allTextContents(), ["부모 캡처", "대상 버튼", "부모 버블"]);

    const startAtRest = async (route) => {
      await open(route);
      await story.getByRole("button", { name: "자동 재생 시작" }).click();
      await story.and(page.locator('[data-playing="true"]')).waitFor();
    };

    await startAtRest("accessibility/tab-order");
    assert.deepEqual(await story.locator(".interaction-keypress kbd").allTextContents(), ["Tab"]);
    await advance(1);
    await advance(2);
    const keys = story.locator(".interaction-keypress kbd");
    assert.deepEqual(await keys.allTextContents(), ["Shift", "Tab"]);
    assert.equal(await keys.evaluateAll(elements => elements.reduce((count, key) => count + key.getAnimations().length, 0)), 0);
    assert.ok(await story.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    if (screenshotDir) await story.screenshot({ path: screenshotDir + "/keyboard-320.png" });

    await startAtRest("react/controlled-input");
    await advance(1);
    assert.equal(await story.locator(".date-sequence__range strong:visible").textContent(), "11월 01일 ~ 10일");
    await advance(2);
    assert.equal(await story.locator(".date-sequence__range strong:visible").textContent(), "11월 01일 ~ 10일");
    await advance(3);
    assert.equal(await story.locator(".date-sequence__range strong:visible").textContent(), "11월 15일 ~ 20일");

    await startAtRest("language/async-requests");
    await advance(1);
    await advance(2);
    assert.equal(await story.locator(".request-sequence__result strong").textContent(), "B 검색 결과");
    await advance(3);
    assert.equal(await story.locator(".request-sequence__result strong").textContent(), "B 검색 결과");
    assert.match(await story.locator('.request-sequence__request[data-state="late"]').textContent(), /요청 A.*화면에서 제외/);

    await startAtRest("css/viewport");
    const screen = story.locator(".viewport-sequence__screen");
    const screenHeight = async () => (await screen.boundingBox()).height;
    const smallHeight = await screenHeight();
    await advance(1);
    assert.ok(await screenHeight() > smallHeight);
    await advance(2);
    assert.equal(await screenHeight(), smallHeight);
    console.log("Cursor timing, key labels, date application, request order and viewport illustration passed");
  } finally {
    await page.close();
  }
};
