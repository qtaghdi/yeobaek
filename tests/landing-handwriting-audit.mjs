import assert from "node:assert/strict";

const expectedTopics = ["프론트엔드", "접근성", "CSS", "렌더링", "React", "디자인", "Dev Tools", "테스트"];

const checkGeometry = async (surface, topics) => {
  const geometry = await surface.locator("[data-topic]").evaluateAll(notes => notes.map(note => {
    const letters = note.querySelector(".landing-note__lettering");
    const line = note.querySelector(".landing-note__underline");
    const text = letters.getBBox();
    const rule = line.getBBox();
    return { topic: note.dataset.topic, start: text.x - rule.x, end: rule.x + rule.width - text.x - text.width, gap: rule.y - text.y - text.height };
  }));
  assert.deepEqual(geometry.map(note => note.topic), topics);
  for (const { topic, start, end, gap } of geometry) {
    assert.ok(start >= 0 && end >= 0, `${topic}: underline should span the drawing`);
    assert.ok(gap >= 4 && gap <= 10, `${topic}: the underline must sit below the lettering, gap ${gap}`);
  }
};

export const auditLandingHandwriting = async (browser, origin) => {
  const url = origin + "/yeobaek/";
  const fallback = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  try {
    await fallback.goto(url);
    const image = fallback.getByRole("img", { name: "손글씨 메모, 프론트엔드" });
    await image.waitFor();
    const front = image.locator('[data-topic="프론트엔드"]');
    const underlined = await front.evaluate(note => {
      const text = note.querySelector(".landing-note__lettering").getBBox();
      const line = note.querySelector(".landing-note__underline").getBBox();
      return line.x <= text.x && line.x + line.width >= text.x + text.width && line.y - text.y - text.height >= 4;
    });
    assert.ok(underlined, "the initial topic should have a full underline without JavaScript");
    assert.equal(await fallback.getByRole("button", { name: "손글씨 애니메이션 일시 정지" }).count(), 0);
  } finally {
    await fallback.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  try {
    await page.clock.install();
    await page.goto(url);
    const surface = page.locator(".landing-notes");
    await page.waitForFunction(() => [...document.querySelectorAll(".landing-note__underline")].every(path => path.hasAttribute("d")));
    await checkGeometry(surface, expectedTopics);
    await surface.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const surface = document.querySelector(".landing-notes");
      const viewBox = surface.viewBox.baseVal;
      const completed = new Set();
      const contained = new Map();
      const premature = new Set();
      const observer = new MutationObserver(() => {
        const note = surface.querySelector('[data-topic][opacity="1"]');
        const drawing = note.querySelector(".landing-note__writing");
        const rule = note.querySelector(".landing-note__underline");
        const label = note.dataset.topic;
        if (!contained.has(label) && drawing.hasAttribute("transform")) {
          const bounds = drawing.getBBox();
          const matrix = drawing.transform.baseVal.getItem(0).matrix;
          const left = bounds.x + matrix.e;
          const top = bounds.y + matrix.f;
          contained.set(label, left > viewBox.x && top > viewBox.y && left + bounds.width < viewBox.x + viewBox.width && top + bounds.height < viewBox.y + viewBox.height);
        }
        if (!rule.hasAttribute("stroke-dasharray")) return;
        const offset = rule.getAttribute("stroke-dashoffset");
        if ((offset === null || Number(offset) < rule.getTotalLength()) && note.querySelector(".landing-note__lettering [stroke-dashoffset]")) premature.add(label);
        if (offset === null) completed.add(label);
      });
      observer.observe(surface, { attributes: true, subtree: true, attributeFilter: ["stroke-dashoffset", "opacity"] });
      window.landingHandwritingAudit = { completed, contained, premature };
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const toggle = page.getByRole("button", { name: "손글씨 애니메이션 일시 정지" });
    await toggle.waitFor();
    await page.clock.runFor(135000);
    const cycle = await page.evaluate(() => ({
      completed: [...window.landingHandwritingAudit.completed],
      contained: [...window.landingHandwritingAudit.contained],
      premature: [...window.landingHandwritingAudit.premature],
    }));
    assert.deepEqual(cycle.completed.sort(), [...expectedTopics].sort());
    assert.equal(cycle.contained.length, expectedTopics.length);
    for (const [topic, fits] of cycle.contained) assert.ok(fits, `${topic}: note outside of its drawing area`);
    assert.deepEqual(cycle.premature, []);
    await toggle.focus();
    await toggle.press("Enter");
    const paused = await surface.evaluate(el => el.innerHTML);
    await page.clock.runFor(3000);
    assert.equal(await surface.evaluate(el => el.innerHTML), paused);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "손글씨 애니메이션 재생" }).waitFor({ state: "hidden" });
    assert.equal(await surface.locator('[data-topic][opacity="1"] [stroke-dashoffset]').count(), 0);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2));
    }
    console.log("Landing topics, measured underlines, full loop, pause and reduced motion passed");
  } finally {
    await page.close();
  }
};
