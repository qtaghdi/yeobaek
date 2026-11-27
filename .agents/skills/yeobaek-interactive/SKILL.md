---
name: yeobaek-interactive
description: "Build or revise in-article interactive examples in Yeobaek, including isolated simulators and real DOM or framework demonstrations."
---

# 인터랙티브 예제

- Plan a short reproducible reader action and an observable result for each state; the article explains what to try and why.
- Keep demonstrations inside the article. For browser chrome, navigation, networks or file operations that would otherwise disrupt the site, use a clearly labeled isolated virtual environment with no real navigation, popups, storage writes or network side effects.
- When a real DOM or React behavior is the teaching target, use real platform APIs inside the bounded demo and report actual values; explain synthetic traces as models. Do not simulate results while claiming measurement.
- Separate pure state model from rendering where state transitions are complex. Include deterministic initialization, reset, alternate and boundary cases, accessible names, keyboard and pointer controls. Retain focus where possible.
- Use the released shared UI API for compatible controls. Native controls are acceptable to demonstrate native behavior or browser chrome. Keep width bounded; no incidental horizontal scroll or page jump; test 320px and both themes.
- Verify actual rendered outcome after every meaningful input, not merely toggled state. Check no real URL change, popup, storage mutation, unintended scrolling or console errors for simulations.
- Preserve existing tests; revise obsolete expected UI actions only to assert the new equivalent contract.
- Apply the shared Yeobaek control tokens to every compatible native and Oddmash UI control. Inspect enabled, hover, active, selected, keyboard focus and disabled states with correct pointer/text/not-allowed cursors, including Select options, checkbox labels and indeterminate state. Keep intentional teaching differences intact; never change behavior just for visual consistency.
