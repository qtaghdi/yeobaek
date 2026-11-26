# 여백 콘텐츠 설계

> 기획 검토안. 아래는 글의 설계 후보이며 작성 완료, 구현 경험 또는 공개를 보장하지 않는다.

## 작성 순서와 범위

현재 31개 글을 7개 장의 학습 흐름으로 재구성한다. 54개의 글 후보는 기존 글 통합, 내용 심화, 신규 사례, 보류 후보를 모두 포함한 설계 목록이다. 공개 전 작성자 이해와 실제 구현 근거를 검토한다. 초기 공개 범위는 네 가지 대표 사례를 먼저 검토한 뒤 결정한다.

- **1차: 대표 사례**: Juliya의 DOM/Canvas 측정 및 Observer, Oddmash UI의 Select/Toast, Boundra의 변경 파일 및 baseline, Foloom의 편집 revision.
- **2차: 기초와 연결**: 기존 기본 개념을 실제 제품 문제와 연결하고 겹치는 글을 통합한다.
- **3차: 제품 수준 사례**: 지도 드래그, 워크플로우 그래프, 날짜 필터, 어댑터와 배포·검증을 작성하되 실제 코드와 PR을 읽어 검증한다.
- **4차: 미확정 후보**: 열린 이슈, 복합 문서 구조, 엔진 내부 등은 작성자 설명과 완료 증거가 확보된 후 공개 여부를 결정한다.

각 행의 근거는 문제와 설계의 출발점이다. 이슈가 닫혔다는 사실만으로 구현이나 테스트 완료를 단정하지 않는다. 최소한 관련 병합 PR 및 현재 소스의 계약을 확인하고, 공개 시점에 근거 링크를 실제로 검증한다.

## 01. 웹 플랫폼과 접근성

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| 브라우저가 상호작용을 전달하는 방식 | target/currentTarget, capture/bubble, 기본 동작, 이벤트 취소, listener lifecycle. 요소 선택 도구에서 관찰하는 이벤트와 원래 페이지 조작을 구분한다. | [interaction-inspector #26](https://github.com/Oddmash/interaction-inspector/issues/26) (열린 회귀 검증 후보) | browser/events |
| 웹에서 버튼과 링크를 구분하는 이유 | 네이티브 의미, 기본 키보드 동작, 링크의 브라우저 기능, aria-disabled와 disabled 및 pagination의 현재 페이지. | [oddmash-ui #41](https://github.com/Oddmash/oddmash-ui/issues/41), [oddmash-ui #104](https://github.com/Oddmash/oddmash-ui/issues/104) | accessibility/semantic-controls, accessibility/disabled-state |
| 포커스와 키보드 탐색의 설계 | DOM 순서, tabindex, :focus-visible, 동적 메뉴의 Escape와 포커스 복귀, 명확한 실패/개선 비교. | [oddmash-ui #23](https://github.com/Oddmash/oddmash-ui/issues/23), [oddmash-ui #42](https://github.com/Oddmash/oddmash-ui/issues/42) | accessibility/focus-ring, accessibility/tab-order |
| 모달과 중첩 오버레이의 상호작용 | Dialog와 Toast가 겹치는 경우 포커스 소유권, 배경 비활성, 닫기와 복귀, portal과 레이어의 관계. | [oddmash-ui #46](https://github.com/Oddmash/oddmash-ui/issues/46), [oddmash-ui #64](https://github.com/Oddmash/oddmash-ui/issues/64) | accessibility/dialog-focus |
| 브라우저 저장소와 관찰 데이터의 경계 | localStorage/sessionStorage, 새로고침과 탭, 값 검증, 필요한 정보만 보존하는 export 설계. | [interaction-inspector #13](https://github.com/Oddmash/interaction-inspector/issues/13) | browser/storage |
| 브라우저 확장 프로그램의 페이지 관찰 설계 | 선택 모드, 이벤트 타임라인, 기록·필터·취소, 패널과 페이지의 생명주기. 기존 코드와 테스트에서 책임 경계를 확인한다. | [interaction-inspector #13](https://github.com/Oddmash/interaction-inspector/issues/13), [interaction-inspector #26](https://github.com/Oddmash/interaction-inspector/issues/26) (후속 후보), [interaction-inspector #29](https://github.com/Oddmash/interaction-inspector/issues/29) | 신규 후보 |

## 02. CSS·텍스트·렌더링

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| CSS의 우선순위와 공유 스타일의 소유권 | cascade/layer/명시도·선언 순서, 토큰과 소비자 오버라이드, 복사된 CSS의 드리프트. | [oddmash-website #74](https://github.com/Oddmash/oddmash-website/issues/74) (열린 개선 후보), [oddmash-ui #116](https://github.com/Oddmash/oddmash-ui/issues/116) | css/cascade |
| 레이아웃의 최소 크기와 넘침 | flex/grid 최소 콘텐츠 크기, 긴 텍스트, min-inline-size, 스크롤 영역과 레이아웃의 소유권. | [oddmash-ui #121](https://github.com/Oddmash/oddmash-ui/issues/121), [oddmash-ui #81](https://github.com/Oddmash/oddmash-ui/issues/81) | css/flex-overflow |
| 쌓임 맥락과 오버레이 레이어 | position, transform, stacking context, z-index, portal, 실제 레이어의 기대 우선순위. | [oddmash-ui #46](https://github.com/Oddmash/oddmash-ui/issues/46) | css/stacking-context |
| 뷰포트·스크롤바·실제 콘텐츠 폭 | vh/dvh, 모바일 주소 표시줄, 클래식 스크롤바, scroll lock, 정확한 측정과 fallback. | [oddmash-ui #81](https://github.com/Oddmash/oddmash-ui/issues/81), [juliya #1](https://github.com/Oddmash/juliya/issues/1) | css/viewport, css/scrollbar |
| 한국어 줄바꿈의 후보와 한계 | CSS 기본 줄바꿈과 균형, 의미 단위의 경계, 혼합 언어와 기술 명사구, 긴 단어와 수동 개행. | [juliya #123](https://github.com/Oddmash/juliya/issues/123), [juliya #1](https://github.com/Oddmash/juliya/issues/1) | css/text-wrap |
| 실제 글꼴로 문자열의 폭 측정하기 | DOM content box와 Canvas 측정, 소수점 폭, lang과 fallback, letter-spacing, 동일 조건 비교. | [juliya #1](https://github.com/Oddmash/juliya/issues/1), [juliya #3](https://github.com/Oddmash/juliya/issues/3) | css/text-wrap에서 분리 후보 |
| 텍스트 줄바꿈 엔진의 선택 구조 | 분리 가능한 경계, 폭을 이용한 선택, 균형 비용 함수, 제한적 언어 휴리스틱. 실제 core 소스·fixtures를 읽고 설명하며 일반 자연어 분석으로 과장하지 않는다. | [juliya #123](https://github.com/Oddmash/juliya/issues/123), [juliya #1](https://github.com/Oddmash/juliya/issues/1) | 신규 후보 |
| 인라인 마크업을 보존한 줄바꿈 | DOM의 강조·중첩·명시 개행과 텍스트 구조, framework adapter의 SSR fallback. 실제 공개 API와 기존 계약을 확인한다. | [juliya #3](https://github.com/Oddmash/juliya/issues/3), [juliya #13](https://github.com/Oddmash/juliya/issues/13) | 신규 후보 |
| ResizeObserver에서 레이아웃을 변경할 때 | 관찰 입력/출력, WebKit delivery loop, 스케줄링·해제, 높이만 바뀌는 통지의 중복 제거. | [juliya #6](https://github.com/Oddmash/juliya/issues/6), [juliya #121](https://github.com/Oddmash/juliya/issues/121) | browser/layout-observation |
| 첫 렌더링, 하이드레이션과 레이아웃 안정화 | 정적 HTML과 실제 측정 결과의 차이, 폰트 대기, CSS fallback, 글자가 깜빡이거나 줄 수가 바뀌는 경우. | [juliya #13](https://github.com/Oddmash/juliya/issues/13), [oddmash-website #57](https://github.com/Oddmash/oddmash-website/issues/57) | 신규 후보 |
| 리플로우 애니메이션과 취소 가능한 전이 | 측정 전후 좌표, FLIP의 적용 범위, 장면 전환과 resize 충돌, 최신 입력과 reduced motion. | [juliya #119](https://github.com/Oddmash/juliya/issues/119) | 신규 후보 |

## 03. React와 상태·데이터

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| 상태 스냅샷과 업데이트 순서 | 렌더 시점의 상태, 함수형 갱신, 이벤트 핸들러와 타이머, 이전 알림 타이머가 최신 상태를 닫는 문제. | [oddmash-ui #95](https://github.com/Oddmash/oddmash-ui/issues/95), [oddmash-ui #120](https://github.com/Oddmash/oddmash-ui/issues/120) | react/state-snapshot |
| 제어 입력과 확정된 상태 | controlled/uncontrolled, 복합 입력 draft/applied, 무효 입력과 초기화, 독립적으로 해제 가능한 범위. | [oddmash-ui #65](https://github.com/Oddmash/oddmash-ui/issues/65), [oddmash-agents #248](https://github.com/Oddmash/oddmash-agents/issues/248), [oddmash-agents #273](https://github.com/Oddmash/oddmash-agents/issues/273) | react/controlled-input |
| Effect는 외부 시스템과 동기화하는 경계 | 렌더에서 계산할 값, event handler, observer와 listener 등록/해제, 반복 통지와 동기화. | [juliya #121](https://github.com/Oddmash/juliya/issues/121), [interaction-inspector #26](https://github.com/Oddmash/interaction-inspector/issues/26) (후속 후보) | react/effects |
| 상태를 둘 위치: 컴포넌트, URL, 서버 | 선택과 탐색의 소유권, URL/공용 탐색 상태, 로컬 입력과 원격 리소스의 경계, 불필요한 복제. | [oddmash-ui #94](https://github.com/Oddmash/oddmash-ui/issues/94), [oddmash-agents #248](https://github.com/Oddmash/oddmash-agents/issues/248) | react/state-location |
| 서버 상태와 캐시 키의 계약 | 정규화된 조회 조건과 queryKey, fetch 생명주기, 변경·무효화·실패 정책. 설명용 TanStack Query 예제는 실제 버전에 맞춰 확인한다. | [oddmash-agents #248](https://github.com/Oddmash/oddmash-agents/issues/248), [oddmash-agents #273](https://github.com/Oddmash/oddmash-agents/issues/273) | react/query-keys |
| 비동기 요청의 취소와 경합 | 이전 응답이 늦게 오는 경우, 최신 요청 식별, AbortController와 cleanup, 로딩·오류·복구 상태. | [oddmash-agents #248](https://github.com/Oddmash/oddmash-agents/issues/248), [boundra #161](https://github.com/Oddmash/boundra/issues/161) | language/async-requests |
| 타입과 런타임 값의 계약 | TypeScript 타입의 한계, 외부 입력 검증, 선언 타입과 실제 import/설정의 차이, 소비자 fixture. | [boundra #43](https://github.com/Oddmash/boundra/issues/43), [boundra #140](https://github.com/Oddmash/boundra/issues/140) | language/type-runtime |
| 문서 편집에서 revision과 충돌을 관리하는 이유 | 문서 해시, no-op 저장, 현재 revision, pending/충돌 상태, 서버와 UI의 일관성. 합성 문서로 재현한다. | [foloom #29](https://github.com/qtaghdi/foloom/issues/29), [foloom #9](https://github.com/qtaghdi/foloom/issues/9) | 신규 후보 |

## 04. 컴포넌트와 디자인 시스템

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| 디자인 토큰의 의미와 배포 경계 | primitive/semantic/component 값을 구분하고 소비자의 예외, CSS 생성·공용 배포, 복제된 토큰의 드리프트를 비교. | [oddmash-ui #116](https://github.com/Oddmash/oddmash-ui/issues/116), [oddmash-website #74](https://github.com/Oddmash/oddmash-website/issues/74) (열린 후보) | design-system/tokens |
| React 컴포넌트의 공개 API와 호환성 | props, 기본값, ref, controlled/uncontrolled, 접근 가능한 이름, 기존 export와 호환 별칭, 마이그레이션. | [oddmash-ui #65](https://github.com/Oddmash/oddmash-ui/issues/65), [oddmash-ui #82](https://github.com/Oddmash/oddmash-ui/issues/82) | design-system/component-api, design-system/compatibility |
| Select를 한 개의 API로 통합할 때의 계약 | 선택 확정과 active/focus, form value, 키보드, disabled, scroll bleed, 네이티브 대 커스텀 판단. | [oddmash-ui #65](https://github.com/Oddmash/oddmash-ui/issues/65), [oddmash-ui #121](https://github.com/Oddmash/oddmash-ui/issues/121) | 신규 후보 |
| Toast의 큐, 타이머와 포커스 설계 | 독립 ID, 보여줄 수 있는 개수, 만료/일시 정지/닫기, live region과 포커스 복귀, controlled provider의 책임. | [oddmash-ui #40](https://github.com/Oddmash/oddmash-ui/issues/40), [oddmash-ui #64](https://github.com/Oddmash/oddmash-ui/issues/64), [oddmash-ui #95](https://github.com/Oddmash/oddmash-ui/issues/95), [oddmash-ui #120](https://github.com/Oddmash/oddmash-ui/issues/120) | design/feedback에서 분리 후보 |
| Clipboard 동작을 공통화할 때 | 명시적 조작과 실제 Promise 성공·실패, 공유 컴포넌트와 독립 함수의 계약, 소비자 비교. | [oddmash-ui #95](https://github.com/Oddmash/oddmash-ui/issues/95) | 신규 후보 |
| 달력과 날짜 선택의 경계 조건 | 날짜/시간과 locale, inclusive min/max, 월 이동, 키보드 포커스, invalid range, 독립적 시작/종료 해제, 초 단위 정확성. | [oddmash-ui #137](https://github.com/Oddmash/oddmash-ui/issues/137), [oddmash-ui #142](https://github.com/Oddmash/oddmash-ui/issues/142), [oddmash-agents #248](https://github.com/Oddmash/oddmash-agents/issues/248) | 신규 후보 |
| 디자인 시스템 문서를 소비자 환경에 맞춘다 | 공유 검색·sidebar·TOC와 소비자 라우팅 책임, SSR native link, 서로 다른 테마/프레임워크에서 공개 계약 검증. | [oddmash-ui #94](https://github.com/Oddmash/oddmash-ui/issues/94), [oddmash-ui #119](https://github.com/Oddmash/oddmash-ui/issues/119) | 신규 후보 |

## 05. 복합 인터랙션과 제품 UI

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| 의미 있는 시각적 위계부터 설계하기 | 탐색 과잉, 중복 카드·배지, 시선 순서, 실제 사용 과업, 데스크톱과 모바일에서 첫 행동. | [oddmash-website #36](https://github.com/Oddmash/oddmash-website/issues/36), [oddmash-agents #273](https://github.com/Oddmash/oddmash-agents/issues/273), [oddmash-agents #294](https://github.com/Oddmash/oddmash-agents/issues/294) (개편 후보) | design/visual-hierarchy |
| 로딩·갱신과 이미지 실패에서 레이아웃 안정화 | 실제 콘텐츠 크기의 skeleton, 보존된 데이터, 이미지 fallback, 로딩 장식과 스크린리더 상태. | [oddmash-ui #39](https://github.com/Oddmash/oddmash-ui/issues/39), [vertactics #67](https://github.com/Oddmash/vertactics/issues/67) | design/loading-states |
| 성공·실패·충돌과 복구의 피드백 | 완료 사실과 사용 가능한 다음 행동, 정중한 안내, 재시도, 편집 실패 상태, 입력 유지. | [oddmash-ui #95](https://github.com/Oddmash/oddmash-ui/issues/95), [foloom #9](https://github.com/qtaghdi/foloom/issues/9) | design/feedback |
| 지도 위 배치와 드래그 상태 모델 | 클릭과 long press, 포인터 좌표와 지도 좌표, 드래그 시작/이동/종료/취소, 다른 도구와의 충돌, undo. | [vertactics #82](https://github.com/Oddmash/vertactics/issues/82) | 신규 후보 |
| 캔버스와 그래프의 팬·줌 | 포인터 기준 확대, 변환 좌표, fit/reset, 키보드 대안, 실제 노드 정보와 연결, 반응형. | [oddmash-agents #264](https://github.com/Oddmash/oddmash-agents/issues/264), [oddmash-agents #270](https://github.com/Oddmash/oddmash-agents/issues/270) | 신규 후보 |
| 데이터의 관측 상태를 UI로 표현하기 | 실행 단계, 실제 관측과 미관측의 구분, 실패 지점·시간, 추정치 표시 금지, 데이터 근거와 디자인의 관계. | [oddmash-agents #270](https://github.com/Oddmash/oddmash-agents/issues/270), [vertactics #102](https://github.com/Oddmash/vertactics/issues/102) | 신규 후보 |
| 문서·스프레드시트 편집 UI의 저장 흐름 | 셀 편집, 붙여넣기, undo/redo와 revision, conflict와 recovery, UI의 편집 상태 및 검증. native 편집 구현은 근거와 이해 확인 전에는 다루지 않는다. | [foloom #29](https://github.com/qtaghdi/foloom/issues/29), [foloom #9](https://github.com/qtaghdi/foloom/issues/9) | 신규 후보 |
| 복합 문서 구조 편집의 범위를 명시하기 | 중첩 수식과 행렬의 제한된 지원 구조, 표적 변경, 저장·재열기·undo의 책임. 현재 열린 항목이므로 구현 완료와 개인 경험을 단정하지 않는다. | [foloom #337](https://github.com/qtaghdi/foloom/issues/337), [foloom #339](https://github.com/qtaghdi/foloom/issues/339) (모두 열린 검토 후보) | 보류 후보 |

## 06. 아키텍처와 개발자 경험

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| 폴더 구조보다 모듈 경계가 먼저다 | domain ownership, import 방향, 공개 API, 진단과 규칙, 내부 구현과 소비자 분리. | [boundra #43](https://github.com/Oddmash/boundra/issues/43), [boundra #165](https://github.com/Oddmash/boundra/issues/165) | architecture/module-boundaries |
| 모노레포와 단일 앱 사이의 선택 | 실제 다중 소비자와 빌드·배포 책임, 의존성 관리, 여백의 Storybook/Turbo 제거와 Vertactics 앱 배치 비교. | [vertactics #79](https://github.com/Oddmash/vertactics/issues/79), [여백 PR #5](https://github.com/qtaghdi/yeobaek/pull/5) | architecture/monorepo |
| 설정과 모듈 해석을 검사하는 개발 도구 | tsconfig/package alias, 중첩 domain의 입력 모델, 규칙·진단 책임, 실제 Next/Vite 소비자로 호환성 확인. AST 내부 구현은 별도 검토. | [boundra #43](https://github.com/Oddmash/boundra/issues/43), [boundra #140](https://github.com/Oddmash/boundra/issues/140), [boundra #159](https://github.com/Oddmash/boundra/issues/159) | 신규 후보 |
| 레거시 위반을 baseline으로 관리하기 | 기존/신규/해결 위반, deterministic fingerprint, 이름 변경·중복·설정 불일치, 명시적 baseline의 한계. | [boundra #157](https://github.com/Oddmash/boundra/issues/157) | 신규 후보 |
| 증분 검사와 변경 파일 보고의 경계 | 전체 모델 검증을 건너뛰지 않는 changed-file reporting, add/delete/rename, 캐시 무효화와 진단 동일성. | [boundra #142](https://github.com/Oddmash/boundra/issues/142), [boundra #158](https://github.com/Oddmash/boundra/issues/158) | 신규 후보 |
| watch 모드의 이벤트와 debounce | 초기 전체 검사, 파일/설정 변경 묶기, 오래된 출력 방지, 종료와 JSON 이벤트 계약. | [boundra #161](https://github.com/Oddmash/boundra/issues/161) | 신규 후보 |
| CLI·ESLint·VS Code의 공통 진단 모델 | 중복 검사 방지, 파일 위치 및 진단 변환, extension host의 수명주기와 삭제/이름 변경, 실제 소비자 검증. | [boundra #167](https://github.com/Oddmash/boundra/issues/167), [boundra #180](https://github.com/Oddmash/boundra/issues/180) | 신규 후보 |
| 다중 프레임워크 라이브러리와 어댑터 | 공통 core, DOM/React/Vue/Svelte 경계, 패키지 exports, SSR/CSR 및 API 호환. 실제 출시 버전의 계약 비교. | [juliya #3](https://github.com/Oddmash/juliya/issues/3), [juliya #13](https://github.com/Oddmash/juliya/issues/13), [boundra #140](https://github.com/Oddmash/boundra/issues/140) | 신규 후보 |

## 07. 검증·배포·운영

| 글 후보 | 설명할 내용 | 프로젝트 근거 | 기존 글/상태 |
| --- | --- | --- | --- |
| 테스트는 어떤 계약을 지켜야 하는가 | 단위/통합/브라우저의 역할, 의미 있는 assertion, 실패 재현, 기준 결과와 최적화 결과의 동일성. | [boundra #142](https://github.com/Oddmash/boundra/issues/142), [oddmash-ui #82](https://github.com/Oddmash/oddmash-ui/issues/82) | architecture/testing |
| Chromium·Firefox·WebKit에서 다른 문제 | 폰트/분수 픽셀·ResizeObserver·키보드 차이, 같은 fixture와 실제 브라우저, 차이의 재현 결과. | [juliya #1](https://github.com/Oddmash/juliya/issues/1), [juliya #3](https://github.com/Oddmash/juliya/issues/3), [juliya #6](https://github.com/Oddmash/juliya/issues/6) | 신규 후보 |
| 패키지의 소비자 호환성과 회귀 검증 | 실제 설치·import·type/build, SSR, node/adapter 버전, 공개 API 변경과 릴리스 검증. | [boundra #43](https://github.com/Oddmash/boundra/issues/43), [boundra #140](https://github.com/Oddmash/boundra/issues/140), [oddmash-ui #65](https://github.com/Oddmash/oddmash-ui/issues/65) | design-system/compatibility 심화 |
| 정적 사이트의 URL·자산·배포 계약 | GitHub Pages base, locale, 정적 자산 경로, 로컬 패키징과 외부 호스트 실패, 실제 배포 URL. | [oddmash-website #23](https://github.com/Oddmash/oddmash-website/issues/23), [vertactics #79](https://github.com/Oddmash/vertactics/issues/79) | architecture/delivery |
| CI의 중복 빌드를 제거하는 기준 | 검증과 배포 구분, exact-head/tree 일치, 최신 CI 증거가 사라졌을 때 보수적 fallback, 배포 실패 복구. | [oddmash-website #53](https://github.com/Oddmash/oddmash-website/issues/53), [oddmash-website #60](https://github.com/Oddmash/oddmash-website/issues/60) | 신규 후보 |
| 배포 환경 제약 안에서 기능 경계를 설계하기 | 함수 배포 수 제한, 기존 URL 계약을 유지한 경계 통합, 빌드 아티팩트 확인과 실제 배포 검증. 비공개 운영 정보는 제외한다. | [oddmash-agents #292](https://github.com/Oddmash/oddmash-agents/issues/292) | 신규 후보 |

## 대표 사례 연구의 집필 설계

### Juliya: 브라우저와 줄바꿈 라이브러리 사이

- 출발점: native CSS에서는 들어가는 문장이 잘못 줄바꿈되는 문제([#1](https://github.com/Oddmash/juliya/issues/1)), 한국어 fallback font의 DOM/Canvas 측정 차이([#3](https://github.com/Oddmash/juliya/issues/3)), WebKit ResizeObserver 통지 루프([#6](https://github.com/Oddmash/juliya/issues/6)).
- 설명 순서: 콘텐츠 폭과 측정 방법 → 줄바꿈 후보 및 검증 → 인라인 마크업 보존 → observer의 입력과 결과 → 초기 렌더 및 정리.
- 증거: 실제 DOM 781.33px과 language 없는 Canvas 746.83px이라는 이슈 관측값, 375px WebKit 오류 및 390px 한국어 문구 이슈. 숫자는 해당 조건의 관측값이지 모든 브라우저에서 동일한 값으로 설명하지 않는다.
- 예제: 같은 문자열·font·lang·width에서 CSS와 Juliya를 비교하는 인라인 데모. 수동 폭 조절, font loading, 본문 markup 보존, reduced motion에 대한 확인.
- 결정: 사용자가 단순 CSS를 쓰면 되는 경우와 라이브러리 비용을 감수할 이유를 구분한다. 실제 알고리즘은 소스와 테스트를 설명할 수 있을 때만 포함한다.

### Oddmash UI: 복합 컴포넌트 API와 상호작용

- 출발점: Select의 공개 이름 통합([#65](https://github.com/Oddmash/oddmash-ui/issues/65)), scroll bleed와 상태 구분([#121](https://github.com/Oddmash/oddmash-ui/issues/121)), 공유 clipboard와 관리되는 Toast([#95](https://github.com/Oddmash/oddmash-ui/issues/95)).
- 설명 순서: 네이티브 동작 → 공개 API 계약 → 상태 모델 → controlled/uncontrolled → 키보드, 포커스와 스크롤 → provider 및 독립 알림 lifecycle → 사용처와 호환 경계.
- 예제: Select의 선택·활성·포커스를 따로 표시하는 상태 도식, 키보드와 포인터 비교, 결과를 잘못 표시하는 복사와 실제 비동기 결과를 확인하는 방식의 비교.
- 검증: Escape/Enter/focus restore, 비활성 옵션, 빠른 연속 알림, 타이머, 브라우저별/좁은 화면, 소비자 import와 기존 별칭의 계약.
- 결정: 네이티브가 충분하면 과도한 커스텀 UI를 만들지 않는다. 실제 공개 API와 설명용 상태 모델을 혼동하지 않는다.

### Boundra: 경계를 파일 단위로 검증하는 개발 도구

- 출발점: 프레임워크 소비자 conformance([#43](https://github.com/Oddmash/boundra/issues/43)), incremental parity([#142](https://github.com/Oddmash/boundra/issues/142)), baseline([#157](https://github.com/Oddmash/boundra/issues/157)), changed-file reporting([#158](https://github.com/Oddmash/boundra/issues/158)), watch([#161](https://github.com/Oddmash/boundra/issues/161)).
- 설명 순서: domain과 import 모델 → 규칙 및 진단 → 입력의 실제 해석 → 기존 위반과 신규 위반 구분 → 변경 파일 보고와 정확성 → CLI/ESLint/editor adapter.
- 예제: 합성 workspace의 정상/금지 import와 공개 진입점. 코드 변경 후 진단이 어떻게 사라지거나 추가되는지, 증분 결과와 전체 결과의 기준 비교.
- 검증: config/alias 변경, 파일 추가·삭제·이름 변경, 오래된 진단 제거, 대표 소비자 fixture, baseline fingerprint의 안정성.
- 결정: 검사의 범위를 줄이는 것과 보고의 범위를 좁히는 것을 구분한다. 더 빠르다는 주장에는 같은 입력과 측정 결과가 필요하다.

### Foloom: 편집 상태와 저장 계약

- 출발점: 내용 변화 없는 저장으로 revision과 undo 이력이 늘어나는 문제([#29](https://github.com/qtaghdi/foloom/issues/29)), 편집과 실패·복구 UI 검증([#9](https://github.com/qtaghdi/foloom/issues/9)).
- 설명 순서: 편집 draft → 서버의 현재 revision과 결과 해시 → 저장 여부 결정 → 응답 수신 → 충돌 또는 복구 → undo/redo의 일관성.
- 예제: 합성 JSON 문서 또는 스프레드시트 셀을 사용해 no-op 저장, 동시 편집, stale revision을 비교한다. 실제 회사 문서나 원본 이슈에 등장하는 파일명과 데이터는 공개하지 않는다.
- 검증: 동일 내용 저장 시 revision 유지, 실제 변경 시 갱신, pending 편집이 있을 때의 충돌, 실패 후 재시도, 저장·재열기 결과.
- 결정: 단순 state 변경과 사용자에게 의미 있는 저장을 구분하고 native 파일 포맷 내부 구현을 아는 것으로 확대 해석하지 않는다.

## 글 단위 공개 체크

- [ ] 작성자가 동작 원리와 선택 이유를 설명할 수 있다.
- [ ] 이슈뿐 아니라 적용 여부를 검증할 소스·병합 PR·릴리스가 있다. 미완성 후보는 명시적으로 보류한다.
- [ ] 문서 자체에서 문제, 원리, 코드 구조, 대안과 경계 조건을 이해할 수 있다.
- [ ] 실제 프로젝트 사례와 독립 예제가 구분되고 private 정보가 없다.
- [ ] 예제가 있을 경우 실행 가능한 경로와 기대 결과가 검증됐다.
- [ ] 관련 문서를 연결한다. 같은 개념을 여러 글에서 불필요하게 반복하지 않는다.
- [ ] 기존 공개 URL 및 검색 결과의 호환성, 최신 문서 메타데이터, 화면 접근성을 확인한다.

이 계획의 7개 장 분류는 기존 공개 글에 반영한다. 54개 후보 전체가 공개된 것은 아니며, 신규 글은 작성자 검토와 구현 이후 사이트 및 README에 추가한다.


## 1차 심화 진행 기록

기존 공개 경로를 보존하며 11개 글을 구조부터 다시 작성한다. 신규 글의 공개 여부는 기존 작성자 검토 기준을 유지한다.

| 공개 글 | 심화 범위 |
| --- | --- |
| CSS 텍스트 줄바꿈 | 실제 콘텐츠 폭, 언어·글꼴 측정, 후보 비용과 인라인 마크업 |
| 요소 크기와 글꼴 | 관찰 입력/결과, 프레임 스케줄링, 폰트 변화, cleanup |
| 컴포넌트 API | Select 상태, 폼 계약, 스크롤 및 Popover, 호환성 |
| 피드백 | Clipboard 상태와 ToastProvider의 큐·타이머·포커스 |
| 테스트 | Boundra의 증분 정확성 실험과 미채택 결정 |
| 입력 상태 | 기간 필터의 draft/applied, 시간대와 경계 |
| 모듈 경계 | 전체 검사, changed-file report, 명시적 baseline |
| 상태 위치 | Vertactics의 드래그 미리보기와 확정 history |
| 비동기 요청 | 최신 응답과 취소, Foloom의 no-op revision, 응답 순서 인라인 예제 |
| 배포 | 실제 base 경로, 정확한 tree의 CI 근거, 배포 제약 |
| 로딩 UI | 최초 조회/갱신, 이미지 실패, 기하 안정화, 접근성 |

다음 집중 후보는 복합 날짜 선택 컴포넌트, 실제 캔버스 좌표 변환, 다중 프레임워크 어댑터, 브라우저 확장의 관찰 lifecycle이다. 공개 전 해당 구현과 작성자 이해를 확인한다.

## 블로그식 집필 및 벨로그 통합

기존 31개 글의 제목 흐름·도입·마무리를 작성자의 문체에 맞게 다시 정리하고, 벨로그의 API 통신, 에러 전처리, 인증, 렌더링, 디자인 시스템, 내전 도구 글을 여백의 6개 새 글로 재구성한다. FSD 글은 기존 모듈 경계에 통합한다. 원문은 유지한다. 공개 글에서 일률적인 검증 기준 제목은 사용하지 않고 필요한 내용은 본문에 포함한다.
