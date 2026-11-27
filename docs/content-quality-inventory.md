# 콘텐츠 품질 개선 인벤토리

기준: main의 44개 공개 기술 글의 원문, 제목/섹션, 본문 시각 자료와 조작 예제, 출처 링크를 확인한 첫 번째 소스 점검입니다. 실제 화면 전수 검수나 기사 정확성 인증이 아닙니다. 아래 후보는 결함 단정이 아닌 다음 검수에서 확인할 개선 질문입니다.

- P1: 먼저 개선할 대표 실습·설명 또는 근거의 후보
- P2: 주제별 그림·상태·경계조건 비교를 보강할 후보
- P3: 이미 비교적 깊은 설명이나 근거를 갖춘 글에서 구체적 검수 후 선별 개선

| 경로 | 조작 예제 | 시각 자료 표식 | 공개 GitHub 링크 수 | 우선순위 | 다음 개선·검수 |
| --- | ---: | ---: | ---: | --- | --- |
| browser/events | 1 | 1 | 1 | P1 | 실제 캡처·대상·버블 호출을 경로와 연결 (이번 개선) |
| accessibility/semantic-controls | 1 | 1 | 1 | P2 | 동일 외형에서 Enter·Space와 탐색 결과를 구분 |
| accessibility/focus-ring | 1 | 1 | 1 | P2 | 입력 장치별 포커스 링과 대비를 실제 상태로 확인 |
| accessibility/tab-order | 1 | 1 | 1 | P2 | 시각 순서와 DOM 순서의 불일치를 번호로 비교 |
| accessibility/dialog-focus | 1 | 1 | 1 | P2 | 열기·탐색·닫기 후 포커스 복원과 배경 조작을 비교 |
| accessibility/reference-tooltip | 0 | 0 | 4 | P1 | 호버 경계·Escape·포커스 상태를 본문에서 직접 조작 |
| accessibility/disabled-state | 1 | 0 | 1 | P2 | disabled와 aria-disabled의 포커스·클릭·제출 계약 구분 |
| browser/storage | 1 | 0 | 1 | P1 | 실제 탭 이동 대신 격리된 가상 브라우저 (이번 개선) |
| css/cascade | 1 | 1 | 1 | P2 | 우선순위의 단계별 승자와 적용된 computed style 연결 |
| css/flex-overflow | 1 | 0 | 1 | P2 | 카드의 가용 폭과 최소 콘텐츠 폭을 수치로 비교 |
| css/stacking-context | 1 | 1 | 1 | P1 | 실제 겹침과 쌓임 맥락의 비교 범위 동시 표시 (이번 개선) |
| css/viewport | 0 | 1 | 1 | P1 | 주소창 상태별 실제 가용 영역과 vh 계열 비교 |
| css/scrollbar | 0 | 1 | 1 | P2 | 본문 가용 폭과 레이아웃 점프 수치 비교 |
| css/text-wrap | 1 | 1 | 13 | P3 | 실제 글꼴 폭과 경계 후보 비용을 연결 |
| browser/layout-observation | 1 | 1 | 9 | P3 | 관찰 기준·변경 원인·재측정 결과를 시각화 |
| css/rendering-strategies | 0 | 1 | 0 | P1 | SSR·SSG·CSR·스트리밍과 hydration 시점을 비교하고 공식 근거 추가 |
| language/type-runtime | 1 | 0 | 1 | P2 | 컴파일 시간과 런타임의 값 구조·검증 실패 구분 |
| react/state-snapshot | 1 | 1 | 1 | P1 | 마지막 클릭의 시작 값과 3개 큐 결과 표시 (이번 개선) |
| react/controlled-input | 1 | 1 | 6 | P3 | 입력/초안/제출 상태의 차이를 실제 폼 값으로 검증 |
| react/effects | 1 | 0 | 1 | P2 | 렌더·커밋·효과·정리 관계와 의존성 변경 사례 |
| react/server-state | 0 | 1 | 0 | P1 | 캐시 상태와 재요청 전이, 공식 출처 및 실제 공개 사례 보강 |
| react/state-location | 1 | 0 | 2 | P3 | 미리보기·확정·히스토리의 상태 관계 비교 유지 |
| react/query-keys | 1 | 0 | 1 | P2 | 잘못된 키 충돌과 정상 키의 캐시 상태 비교 |
| language/async-requests | 1 | 1 | 5 | P3 | 응답 순서와 현재 요청 ID 및 취소 기준을 연결 |
| react/error-handling | 1 | 0 | 0 | P2 | 오류 분류·재시도·사용자 복구의 근거 연결 |
| react/auth-lifecycle | 0 | 1 | 0 | P1 | 세션 확인/만료/로그아웃 상태 흐름의 공식 출처 보강 |
| design-system/tokens | 1 | 1 | 2 | P2 | 실제 토큰→의미 역할→렌더 속성의 매핑 |
| design-system/why-design-system | 0 | 1 | 1 | P2 | 공통화 이전·이후 소비자 변경 범위 비교 |
| design-system/component-api | 1 | 0 | 9 | P3 | 선택값·활성 항목·DOM 포커스·FormData의 동시 관측 |
| design-system/input-leading-icon | 0 | 0 | 3 | P1 | 아이콘 전후 DOM·포커스·폼 값의 직접 비교 |
| design-system/compatibility | 0 | 0 | 2 | P1 | 짧은 글의 공개 계약 변경 조건과 실제 검증 결과 보강 |
| design/visual-hierarchy | 1 | 0 | 1 | P2 | 동일 업무의 시각 위계 변화 및 다음 조작 연결 |
| design/loading-states | 1 | 1 | 2 | P3 | 최초 로딩과 재조회, 실제 요소 좌표 및 실패 비교 |
| design/feedback | 1 | 0 | 9 | P3 | 성공 표시와 실제 결과, 재시도·취소 상태의 관측 |
| design/team-balance | 0 | 1 | 0 | P2 | 가정과 평가 함수, 샘플 점수 및 후보 비교 근거 |
| architecture/module-boundaries | 1 | 1 | 10 | P3 | 변경 파일 강조와 전체 진단 범위를 실제 결과로 비교 |
| architecture/monorepo | 0 | 1 | 1 | P2 | 단일 앱과 모노레포의 구체적 비용·공유 경계 비교 |
| architecture/testing | 1 | 0 | 4 | P3 | 전체/증분 비교의 누락·추가 진단 및 검증 범위 명시 |
| architecture/delivery | 1 | 0 | 8 | P3 | 빌드·배포·실제 URL의 증거 연결과 환경 차이 |
| integrations/apple-music-presence | 0 | 3 | 3 | P2 | 실제 화면과 시간 모델의 구분 및 일시정지 시점 |
| integrations/docx-dropdown-choice | 0 | 1 | 6 | P2 | 표시 문자열과 저장 값 변경 범위의 전후 비교 |
| backend/workbook-revisions | 0 | 1 | 4 | P2 | 두 편집의 기준 revision, 충돌 응답, 재시도 모델 |
| backend/error-grouping | 0 | 1 | 2 | P2 | 발생 ID와 그룹 지문의 예제 입력·집계 결과 |
| ai/review-ci-gating | 0 | 1 | 5 | P2 | 같은 리비전·워크플로 실행의 상태 전이 및 판정 근거 |

## 적용 순서

1. 저장소·이벤트 전파·상태 스냅샷·쌓임 맥락에서 새 기준을 검증합니다. 소스, 결과 상태, 좁은 화면, 키보드, 라이트/다크, 무관한 부작용을 검사합니다.
2. 위 사례의 실제 화면과 결과를 기준으로 다섯 제작 지침을 보정합니다.
3. P1을 우선으로 읽기 흐름과 실제 출처를 확인하고, 조작이 필요한 경우에만 예제를 확장합니다.
4. P2·P3는 장별로 순차 수정합니다. 소재를 반복해 분량을 키우거나 모든 글에 동일한 시각 자료를 삽입하지 않습니다.

개별 글 검수 기록에는 정확한 리비전, 정확성·깊이·실용성·시각적 메커니즘·상호작용 점수와 실제 근거를 남깁니다. 시각 자료 표식 수는 원문에서 관찰한 컴포넌트·figure·img의 수이며 품질 점수가 아닙니다.
