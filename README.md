<picture>
  <source media="(prefers-color-scheme: dark)" srcset="src/assets/brand/lockup-dark.svg">
  <img alt="여백" src="src/assets/brand/lockup-light.svg" height="64">
</picture>

직접 써본 기술 이야기부터, 만들다 막혔던 일과 시간이 지나 달라진 생각까지 씁니다.

[여백 읽기](https://qtaghdi.github.io/yeobaek/)

## 목차

### 프론트엔드

- 웹 플랫폼과 접근성
  - [클릭 이벤트는 어디까지 전달될까?](https://qtaghdi.github.io/yeobaek/browser/events/)
  - [버튼과 링크를 구분하는 이유](https://qtaghdi.github.io/yeobaek/accessibility/semantic-controls/)
  - [포커스 링은 왜 필요할까?](https://qtaghdi.github.io/yeobaek/accessibility/focus-ring/)
  - [tabindex와 키보드 이동 순서](https://qtaghdi.github.io/yeobaek/accessibility/tab-order/)
  - [모달이 닫히면 포커스는 어디로 가야 할까?](https://qtaghdi.github.io/yeobaek/accessibility/dialog-focus/)
  - [링크에 툴팁을 붙일 때 놓치기 쉬운 것](https://qtaghdi.github.io/yeobaek/accessibility/reference-tooltip/)
  - [비활성화와 접근성 상태](https://qtaghdi.github.io/yeobaek/accessibility/disabled-state/)
  - [localStorage와 sessionStorage의 차이](https://qtaghdi.github.io/yeobaek/browser/storage/)
- CSS·텍스트·렌더링
  - [CSS를 덮어썼는데 적용되지 않는 이유](https://qtaghdi.github.io/yeobaek/css/cascade/)
  - [flex: 1인데 왜 화면 밖으로 넘어갈까?](https://qtaghdi.github.io/yeobaek/css/flex-overflow/)
  - [z-index가 9999여도 안 되는 이유](https://qtaghdi.github.io/yeobaek/css/stacking-context/)
  - [모바일에서 100vh가 어긋나는 이유](https://qtaghdi.github.io/yeobaek/css/viewport/)
  - [모달을 열 때 화면이 옆으로 밀리는 이유](https://qtaghdi.github.io/yeobaek/css/scrollbar/)
  - [한국어 줄바꿈을 다루는 방법](https://qtaghdi.github.io/yeobaek/css/text-wrap/)
  - [요소 크기와 글꼴의 변화를 관찰하기](https://qtaghdi.github.io/yeobaek/browser/layout-observation/)
  - [프론트엔드 렌더링은 언제, 어디에서 하는 것이 좋을까?](https://qtaghdi.github.io/yeobaek/css/rendering-strategies/)
- React와 상태·데이터
  - [TypeScript 타입은 런타임에도 안전할까?](https://qtaghdi.github.io/yeobaek/language/type-runtime/)
  - [상태를 바꿨는데 값이 그대로인 이유](https://qtaghdi.github.io/yeobaek/react/state-snapshot/)
  - [입력 상태는 누가 관리해야 할까?](https://qtaghdi.github.io/yeobaek/react/controlled-input/)
  - [useEffect는 언제 사용해야 할까?](https://qtaghdi.github.io/yeobaek/react/effects/)
  - [API 통신에 useEffect 쓰면 안됨?](https://qtaghdi.github.io/yeobaek/react/server-state/)
  - [상태는 어디에 두는 것이 좋을까?](https://qtaghdi.github.io/yeobaek/react/state-location/)
  - [서버 상태와 Query Key](https://qtaghdi.github.io/yeobaek/react/query-keys/)
  - [비동기 요청의 실패와 응답 순서](https://qtaghdi.github.io/yeobaek/language/async-requests/)
  - [프론트는 에러 전처리가 불가능할까?](https://qtaghdi.github.io/yeobaek/react/error-handling/)
  - [Auth가 쉽다는 당신에게](https://qtaghdi.github.io/yeobaek/react/auth-lifecycle/)

### 디자인

- 컴포넌트와 디자인 시스템
  - [디자인 토큰은 왜 필요할까?](https://qtaghdi.github.io/yeobaek/design-system/tokens/)
  - [디자이너 없는 환경에서 디자인 시스템을 만든 이유](https://qtaghdi.github.io/yeobaek/design-system/why-design-system/)
  - [재사용 가능한 컴포넌트의 API](https://qtaghdi.github.io/yeobaek/design-system/component-api/)
  - [입력란에 아이콘을 추가해도 포커스가 유지되어야 하는 이유](https://qtaghdi.github.io/yeobaek/design-system/input-leading-icon/)
  - [공통 컴포넌트의 호환성과 변경](https://qtaghdi.github.io/yeobaek/design-system/compatibility/)
- 복합 인터랙션과 제품 UI
  - [왜 내 웹만 구릴까?](https://qtaghdi.github.io/yeobaek/design/visual-hierarchy/)
  - [로딩이 끝날 때 화면이 움직이는 이유](https://qtaghdi.github.io/yeobaek/design/loading-states/)
  - [로딩·성공·실패를 어떻게 보여줄까?](https://qtaghdi.github.io/yeobaek/design/feedback/)
  - [팀을 짜는 웹사이트 때문에 알고리즘을 다시 공부했습니다](https://qtaghdi.github.io/yeobaek/design/team-balance/)

### 개발과 운영

- 아키텍처와 개발자 경험
  - [폴더 구조보다 중요한 모듈 경계](https://qtaghdi.github.io/yeobaek/architecture/module-boundaries/)
  - [모노레포가 필요한 상황](https://qtaghdi.github.io/yeobaek/architecture/monorepo/)
- 검증·배포·운영
  - [테스트는 어떤 문제를 막아야 할까?](https://qtaghdi.github.io/yeobaek/architecture/testing/)
  - [빌드와 배포를 분리해서 생각하기](https://qtaghdi.github.io/yeobaek/architecture/delivery/)
- 도구 연동과 파일 형식
  - [재생 위치가 40초면 Discord에는 무엇을 보내야 할까?](https://qtaghdi.github.io/yeobaek/integrations/apple-music-presence/)
  - [Word 드롭다운에서 항목 하나를 고르면 문서에는 뭐가 바뀔까?](https://qtaghdi.github.io/yeobaek/integrations/docx-dropdown-choice/)

### 백엔드

- 데이터와 쓰기 요청
  - [사람과 AI가 같은 시트를 편집하면 누구의 변경을 남겨야 할까?](https://qtaghdi.github.io/yeobaek/backend/workbook-revisions/)
  - [같은 오류가 세 번 들어오면 세 건으로 세어야 할까?](https://qtaghdi.github.io/yeobaek/backend/error-grouping/)

### AI

- 개발을 돕는 에이전트
  - [CI가 통과했는데 리뷰 에이전트는 왜 기다리고 있을까?](https://qtaghdi.github.io/yeobaek/ai/review-ci-gating/)
