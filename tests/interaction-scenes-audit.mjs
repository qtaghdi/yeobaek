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
    const awaitingInput = () => story.and(page.locator('[data-input-pending="true"]'));
    const inputStarted = () => story.and(page.locator('[data-input-pending="false"]'));
    await awaitingInput().waitFor();
    assert.equal(await event.locator(".scene-pointer__arrow").evaluate(el => getComputedStyle(el).opacity), "1");
    const trace = () => event.locator("li").evaluateAll(rows => rows.map(row => getComputedStyle(row).opacity));
    assert.deepEqual(await trace(), ["0", "0", "0"]);
    await page.clock.fastForward(800);
    assert.equal(await awaitingInput().count(), 1);
    await story.getByRole("button", { name: "자동 재생 일시 정지" }).press("Space");
    await story.and(page.locator('[data-playing="false"]')).waitFor();
    await page.clock.fastForward(1500);
    assert.deepEqual(await trace(), ["0", "0", "0"]);
    await story.getByRole("button", { name: "자동 재생 시작" }).press("Space");
    await page.clock.fastForward(550);
    await inputStarted().waitFor();
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

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await open("accessibility/tab-order");
    await story.and(page.locator('[data-playing="true"]')).waitFor();
    const ring = story.locator(".interaction-targets__ring");
    const initialRing = await ring.elementHandle();
    await page.clock.fastForward(2400);
    assert.equal(await story.getAttribute("data-frame"), "0");
    await story.getByRole("button", { name: "자동 재생 일시 정지" }).press("Space");
    await story.and(page.locator('[data-playing="false"]')).waitFor();
    await page.clock.fastForward(6500);
    assert.equal(await story.getAttribute("data-frame"), "0");
    await story.getByRole("button", { name: "자동 재생 시작" }).press("Space");
    await story.and(page.locator('[data-playing="true"]')).waitFor();
    await page.clock.fastForward(1900);
    await story.and(page.locator('[data-frame="1"]')).waitFor();
    await awaitingInput().waitFor();
    const tab = story.locator(".interaction-keypress kbd");
    assert.equal(await tab.textContent(), "Tab");
    assert.equal(await tab.evaluate(el => getComputedStyle(el).animationPlayState), "paused");
    assert.equal(await ring.evaluate(el => getComputedStyle(el).transform), "matrix(1, 0, 0, 1, 0, 0)");
    await page.clock.fastForward(650);
    assert.equal(await awaitingInput().count(), 1);
    await page.clock.fastForward(650);
    await inputStarted().waitFor();
    assert.ok(await ring.evaluate((element, before) => element === before, initialRing));
    const path = await ring.evaluate((element) => {
      const animation = element.getAnimations().find(item => item.transitionProperty === "transform");
      if (!animation) return null;
      animation.pause();
      const left = time => {
        animation.currentTime = time;
        return element.getBoundingClientRect().left;
      };
      return [left(0), left(175), left(400)];
    });
    assert.ok(path && path[0] + 2 < path[1] && path[1] + 2 < path[2], JSON.stringify(path));
    await open("integrations/docx-dropdown-choice");
    await story.and(page.locator('[data-playing="true"]')).waitFor();
    await advance(1);
    const menu = story.locator(".article-scene__choices");
    await awaitingInput().waitFor();
    assert.equal(await menu.getAttribute("data-open"), "false");
    await page.clock.fastForward(1250);
    await inputStarted().waitFor();
    assert.equal(await menu.getAttribute("data-open"), "true");
    await advance(2);
    await awaitingInput().waitFor();
    const values = story.locator(".article-scene__field strong");
    assert.deepEqual(await values.allTextContents(), ["검토 중", "reviewing"]);
    await page.clock.fastForward(1250);
    await inputStarted().waitFor();
    assert.deepEqual(await values.allTextContents(), ["완료", "done"]);
    await page.emulateMedia({ reducedMotion: "reduce" });

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
