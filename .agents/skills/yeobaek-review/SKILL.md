---
name: yeobaek-review
description: "Review or evaluate Yeobaek articles and examples for correctness, depth, visual detail, accessibility, source fidelity and release readiness."
---

# 품질 검수

- Inspect the original article, code, evidence and rendered page. Record route, revision, environment and observation. Source inventory cannot certify rendered quality.
- Score separately: factual accuracy/provenance; conceptual depth; practical usefulness; visual mechanism; actual interaction/accessibility. Use 0 (missing or wrong), 1 (partial), 2 (clear and evidenced). Skip visual or interaction only with a reason. Any incorrect fact or broken action blocks release regardless of total.
- Check the first reading journey and the difficult boundary case. Verify links, anchors, search/contents registration, keyboard and pointer, theme, mobile layout, reduced motion and no unrelated side effects. Inspect output and geometry; don't certify quality from green CI alone.
- Match each reader instruction to the exact rendered DOM element, accessible name and actual interaction contract; a citation number and its source link may have different actions. Distinguish observed behavior from proposed demo behavior.
- Compare representative before/after screenshots and behavior. Report verified, failed, not applicable and unverified separately.
- Run the repository's check/lint/test/build/test:build/test:browser plus applicable browser matrix. Confirm exact PR revision before merge; validate deployed URL if asked to deploy.
- Maintain an actionable backlog. Group recurring defects by owning skill and revise instructions after real evidence, not after arbitrary cosmetic preferences.
- Inspect visible heading permalink geometry (including reference notes), checkbox and select options, cursor state, both themes and actual focus indicators. Verify prose emphasis and line wrapping with inline strong/em and references; inspect readable fallback without script. Do not infer visual quality from source or screenshots of only one state.
- Review independent UI controls in every consuming example, not only component screenshots. Verify keyboard and pointer parity, form reset, disabled controls, tooltip text/hover/focus cleanup, and no external UI runtime dependency. Check mixed Korean/English, inline code, emphasis, headings, tables and long identifiers at multiple reading widths.
- Verify actual line text and relative final-line length, not just overflow. Keep a regression fixture for a real article paragraph at multiple widths, including the CSS fallback; do not disable the wrapping improvement globally to solve a single overflow.
