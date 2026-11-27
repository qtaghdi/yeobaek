export const documentSections = [
  {
    id: "frontend",
    title: "프론트엔드",
    topics: ["프론트엔드", "접근성", "CSS", "렌더링", "React"],
    chapters: [
      {
        number: "01",
        title: "웹 플랫폼과 접근성",
        description: "브라우저 이벤트와 키보드·포커스",
        pages: [
          "browser/events",
          "accessibility/semantic-controls",
          "accessibility/focus-ring",
          "accessibility/tab-order",
          "accessibility/dialog-focus",
          "accessibility/reference-tooltip",
          "accessibility/disabled-state",
          "browser/storage",
        ],
      },
      {
        number: "02",
        title: "CSS·텍스트·렌더링",
        description: "레이아웃, CSS 우선순위, 한국어 줄바꿈",
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
        description: "React 상태와 타입, 비동기 요청",
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
        description: "디자인 토큰, 공개 API와 호환성",
        pages: [
          "design-system/tokens",
          "design-system/why-design-system",
          "design-system/component-api",
          "design-system/input-leading-icon",
          "design-system/compatibility",
        ],
      },
      {
        number: "05",
        title: "복합 인터랙션과 제품 UI",
        description: "정보의 위계, 로딩과 피드백",
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
        description: "기능과 모듈의 경계를 정하는 기준",
        pages: [
          "architecture/module-boundaries",
          "architecture/monorepo",
        ],
      },
      {
        number: "07",
        title: "검증·배포·운영",
        description: "테스트 대상과 빌드·배포의 조건",
        pages: [
          "architecture/testing",
          "architecture/delivery",
        ],
      },
      {
        number: "08",
        title: "도구 연동과 파일 형식",
        description: "앱 연동과 문서에 값을 저장하는 법",
        pages: [
          "integrations/apple-music-presence",
          "integrations/docx-dropdown-choice",
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "백엔드",
    topics: ["Backend"],
    chapters: [
      {
        number: "09",
        title: "데이터와 쓰기 요청",
        description: "동시 수정과 재전송 처리",
        pages: [
          "backend/workbook-revisions",
          "backend/error-grouping",
        ],
      },
    ],
  },
  {
    id: "ai",
    title: "AI",
    topics: ["AI"],
    chapters: [
      {
        number: "10",
        title: "개발을 돕는 에이전트",
        description: "검사 결과와 리뷰 시작 조건",
        pages: ["ai/review-ci-gating"],
      },
    ],
  },
];
