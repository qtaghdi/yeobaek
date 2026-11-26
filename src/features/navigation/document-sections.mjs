export const documentSections = [
  {
    id: "frontend",
    title: "프론트엔드",
    topics: ["프론트엔드", "접근성", "CSS", "렌더링", "React"],
    chapters: [
      {
        number: "01",
        title: "웹 플랫폼과 접근성",
        description: "브라우저 동작, 이벤트, 키보드와 포커스의 원리.",
        pages: [
          "browser/events",
          "accessibility/semantic-controls",
          "accessibility/focus-ring",
          "accessibility/tab-order",
          "accessibility/dialog-focus",
          "accessibility/disabled-state",
          "browser/storage",
        ],
      },
      {
        number: "02",
        title: "CSS·텍스트·렌더링",
        description: "레이아웃과 측정, CSS 우선순위, 한국어 줄바꿈.",
        pages: [
          "css/cascade",
          "css/flex-overflow",
          "css/stacking-context",
          "css/viewport",
          "css/scrollbar",
          "css/text-wrap",
          "browser/layout-observation",
          "css/rendering-strategies",
        ],
      },
      {
        number: "03",
        title: "React와 상태·데이터",
        description: "상태의 책임과 동기화, 타입, 비동기 요청.",
        pages: [
          "language/type-runtime",
          "react/state-snapshot",
          "react/controlled-input",
          "react/effects",
          "react/server-state",
          "react/state-location",
          "react/query-keys",
          "language/async-requests",
          "react/error-handling",
          "react/auth-lifecycle",
        ],
      },
    ],
  },
  {
    id: "design",
    title: "디자인",
    topics: ["디자인"],
    chapters: [
      {
        number: "04",
        title: "컴포넌트와 디자인 시스템",
        description: "디자인 토큰과 공개 API, 소비자 호환성.",
        pages: [
          "design-system/tokens",
          "design-system/why-design-system",
          "design-system/component-api",
          "design-system/compatibility",
        ],
      },
      {
        number: "05",
        title: "복합 인터랙션과 제품 UI",
        description: "시각적 위계와 실제 상태에 맞는 사용자 경험.",
        pages: [
          "design/visual-hierarchy",
          "design/loading-states",
          "design/feedback",
          "design/team-balance",
        ],
      },
    ],
  },
  {
    id: "development-operations",
    title: "개발과 운영",
    topics: ["Dev Tools", "테스트"],
    chapters: [
      {
        number: "06",
        title: "아키텍처와 개발자 경험",
        description: "모듈 경계와 구조를 선택하는 기준.",
        pages: [
          "architecture/module-boundaries",
          "architecture/monorepo",
        ],
      },
      {
        number: "07",
        title: "검증·배포·운영",
        description: "검증해야 할 계약과 실제 배포의 차이.",
        pages: [
          "architecture/testing",
          "architecture/delivery",
        ],
      },
    ],
  },
];
