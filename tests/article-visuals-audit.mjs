import assert from "node:assert/strict";

export const auditArticleVisuals = async (browser, origin, screenshotDir) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const go = async (route, label) => {
    await page.goto(origin + "/yeobaek/" + route + "/");
    const frame = page.getByRole("region", { name: label, exact: true });
    await frame.scrollIntoViewIfNeeded();
    await frame.locator("astro-island[ssr]").waitFor({ state: "detached" });
    return frame;
  };

  try {
    const storage = await go("browser/storage", "브라우저 저장소 유지 범위 실험");
    await storage.getByRole("button", { name: "목록 간격 좁히기" }).click();
    await storage.getByRole("button", { name: "임시 검색어 저장" }).click();
    await storage.getByRole("button", { name: "이 탭 새로고침" }).click();
    await storage.getByRole("button", { name: "임시 검색어 지우기" }).waitFor();
    assert.equal(await storage.locator('output[aria-label="표시 밀도"]').textContent(), "좁은 간격");
    const [independent] = await Promise.all([
      context.waitForEvent("page"),
      storage.getByRole("link", { name: "독립 탭에서 열기" }).click(),
    ]);
    try {
      await independent.getByRole("button", { name: "기본 간격으로 복구" }).waitFor();
      assert.equal(await independent.locator('output[aria-label="이 탭의 임시 검색어"]').textContent(), "저장된 검색어 없음");
    } finally {
      await independent.close();
    }

    const editor = await go("react/state-location", "미리보기와 변경 이력 비교");
    const marker = editor.getByRole("button", { name: "지도에서 말 옮기기" });
    await marker.press("ArrowRight");
    assert.equal(await editor.locator("[data-preview]").textContent(), "36, 50");
    assert.equal(await editor.locator("[data-committed]").textContent(), "28, 50");
    assert.equal(await editor.locator("[data-history-count]").textContent(), "0건");
    await marker.press("Escape");
    assert.equal(await editor.locator("[data-preview]").textContent(), "없음");
    await marker.press("ArrowRight");
    await marker.press("Enter");
    assert.equal(await editor.locator("[data-committed]").textContent(), "36, 50");
    assert.equal(await editor.locator("[data-history-count]").textContent(), "1건");
    if (screenshotDir) await editor.screenshot({ path: screenshotDir + "/state-location.png" });
    await editor.getByRole("button", { name: "되돌리기" }).click();
    assert.equal(await editor.locator("[data-committed]").textContent(), "28, 50");

    const errors = await go("react/error-handling", "서버 오류 코드와 사용자 문구 비교");
    await errors.getByRole("button", { name: "새 오류 코드" }).click();
    await errors.getByText("NEW_SERVER_ERROR", { exact: true }).waitFor();
    assert.equal(await errors.locator("output").textContent(), "요청을 처리하지 못했습니다. 다시 시도해주세요.");
    await errors.getByRole("button", { name: "기능 중단" }).click();
    assert.equal(await errors.locator("output").textContent(), "지금은 사용할 수 없는 기능입니다.");

    const tokens = await go("design-system/tokens", "테마에 따른 실제 토큰 연결");
    const colors = () => tokens.locator(".theme-token-preview__sample").evaluate(el => {
      const { color, backgroundColor } = getComputedStyle(el);
      return [color, backgroundColor];
    });
    const light = await colors();
    await tokens.getByRole("checkbox", { name: "예제에 어두운 테마 적용" }).press("Space");
    assert.deepEqual(await colors(), [...light].reverse());
    if (screenshotDir) await tokens.screenshot({ path: screenshotDir + "/design-tokens.png" });

    const report = await go("architecture/module-boundaries", "전체 경계 진단의 변경 파일 분류");
    assert.equal(await report.locator('[data-bucket="focused"]').count(), 1);
    assert.equal(await report.locator('[data-bucket="other"]').count(), 1);
    await report.getByRole("radio", { name: "파일 삭제" }).press("Space");
    assert.equal(await report.locator('[data-bucket="focused"]').count(), 2);
    assert.equal(await report.locator('[data-bucket="other"]').count(), 0);
    assert.match(await report.locator("[aria-live]").textContent(), /전체 진단 2건/);

    const diff = await go("architecture/testing", "전체 검사와 증분 후보의 진단 비교");
    assert.equal(await diff.locator('[data-different="true"]').count(), 0);
    await diff.getByRole("radio", { name: "한 건의 경로 변경" }).press("Space");
    assert.deepEqual(await diff.locator(".diagnostic-comparison__column li").count(), 4);
    assert.equal(await diff.locator('[data-different="true"]').count(), 2);
    assert.match(await diff.getByRole("status").textContent(), /누락 1건, 추가 1건/);
    if (screenshotDir) await diff.screenshot({ path: screenshotDir + "/diagnostic-comparison.png" });
    console.log("Storage lifetime, edit history, error copy, theme tokens and diagnostics examples passed");
  } finally {
    await context.close();
  }
};
