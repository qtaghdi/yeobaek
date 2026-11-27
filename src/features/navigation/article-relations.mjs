const topicGroups = [
  [
    "browser/events",
    "accessibility/semantic-controls",
    "accessibility/focus-ring",
    "accessibility/tab-order",
    "accessibility/dialog-focus",
    "accessibility/disabled-state",
    "design-system/component-api"
  ],
  [
    "browser/storage",
    "react/auth-lifecycle",
    "react/state-location",
    "react/server-state"
  ],
  [
    "css/cascade",
    "css/flex-overflow",
    "css/stacking-context",
    "css/viewport",
    "css/scrollbar",
    "design/loading-states"
  ],
  [
    "css/text-wrap",
    "browser/layout-observation",
    "css/flex-overflow",
    "css/rendering-strategies"
  ],
  [
    "language/type-runtime",
    "react/state-snapshot",
    "react/controlled-input",
    "react/effects",
    "react/state-location"
  ],
  [
    "react/server-state",
    "react/query-keys",
    "language/async-requests",
    "react/error-handling",
    "react/auth-lifecycle",
    "backend/error-grouping"
  ],
  [
    "design-system/tokens",
    "design-system/why-design-system",
    "design-system/component-api",
    "design-system/compatibility",
    "design/visual-hierarchy"
  ],
  [
    "design/loading-states",
    "design/feedback",
    "design/visual-hierarchy",
    "design/team-balance",
    "react/state-snapshot"
  ],
  [
    "architecture/module-boundaries",
    "architecture/monorepo",
    "architecture/testing",
    "architecture/delivery",
    "ai/review-ci-gating"
  ],
  [
    "integrations/apple-music-presence",
    "integrations/docx-dropdown-choice",
    "backend/workbook-revisions",
    "language/async-requests",
    "language/type-runtime"
  ],
  [
    "backend/workbook-revisions",
    "backend/error-grouping",
    "architecture/testing",
    "react/query-keys",
    "ai/review-ci-gating"
  ]
];

export const relatedArticles = (slug) => {
  const matches = topicGroups.filter(group => group.includes(slug));
  const scores = new Map();
  for (const group of matches) {
    for (const candidate of group) {
      if (candidate === slug) continue;
      scores.set(candidate, (scores.get(candidate) ?? 0) + 1);
    }
  }
  return [...scores].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([candidate]) => candidate);
};
