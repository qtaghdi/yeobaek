# 첫 방문 독자 검토

2026년 11월 27일 KST. [원격 main `e4086c5`](https://github.com/qtaghdi/yeobaek/commit/e4086c55ed4579503180254751aab605a9226b96)과 [같은 SHA의 GitHub Pages 배포](https://github.com/qtaghdi/yeobaek/actions/runs/45927467496)를 각각 확인했다. 시작 시 열린 이슈와 PR은 0개였고 기존 검증 이슈 [#34부터 #40](https://github.com/qtaghdi/yeobaek/issues?q=is%3Aissue+is%3Aclosed)은 종료 상태였다. 미커밋 변경이 있는 기존 작업 디렉터리와 별도로 원격 main에서 작업했다.

## 변경과 재현

| 위치 | 재현과 배포본에서 본 결과 | 독자 영향과 수정 후 기대 |
| --- | --- | --- |
| [홈](https://qtaghdi.github.io/yeobaek/) | 너비를 844px·1024px로 두면 768px 콘텐츠가 x=16에서 시작했다. 1024px에서 오른쪽 빈 공간은 스크롤바를 포함해 240px이었다. 1152px에서야 가운데 정렬됐다. | 중간 폭에서도 제목·대표 글·목차가 같은 중앙 축을 공유해야 한다. 회귀 테스트는 390px부터 2560px까지 홈과 헤더의 중앙 축을 비교한다. |
| [클릭 이벤트](https://qtaghdi.github.io/yeobaek/browser/events/) | 시연을 화면에 넣고 한 번 클릭이 끝날 때까지 기다린다. 다음 클릭 예고와 첫 장면으로 돌아올 때 기록 세 줄이 동시에 사라졌다. | 독자가 클릭 전후의 전파 경로를 비교할 수 있도록 직전 명령과 기록을 클릭까지 보인다. 첫 재생의 빈 상태, 다음 입력 예고, 클릭 전후, 반복 경계, 정지·재개를 검사한다. |
| [비활성화와 접근성 상태](https://qtaghdi.github.io/yeobaek/accessibility/disabled-state/) | 자동 시연은 Tab 한 번에 두 버튼에 포커스 링을 그리고 클릭 예고 때 커서 세 개를 보였다. 실제 예제에서는 Tab이 비활성 버튼을 건너뛰고 나머지 두 버튼에 각각 한 번씩 멈췄다. | 실제 버튼 예제에서 포커스 위치와 실행 횟수를 따로 확인할 수 있게 했다. 클릭은 0·1·0회이고 이후 키보드로 가운데 버튼을 실행하면 0·2·0회다. 역방향 이동도 검증한다. |
| [Flex 자동 최소 크기](https://qtaghdi.github.io/yeobaek/css/flex-overflow/) | 320px에서 두 번째 시연 프레임의 삭제 버튼이 프레임 끝에 잘렸고 시연에서 스크롤할 수 없었다. | 독자가 카드 폭과 `min-width: 0`을 직접 바꾸고 결과를 확인할 수 있는 기존 예제로 설명을 이어간다. 의도된 실패 상태는 예제 내부 스크롤에서 살펴볼 수 있다. |
| [Apple Music 재생 위치](https://qtaghdi.github.io/yeobaek/integrations/apple-music-presence/) | 320px에서 탐색과 일시정지 사이의 Discord 시각 값이 두 줄에서 한 줄로 줄었다. 그림 높이 238→223px 변화 때문에 다음 문단이 이동했다. | 좁은 화면에서는 시각 값 두 줄의 높이를 확보한다. 시작·재생·탐색·일시정지·반복 구간의 그림 높이 차이가 1px 미만인지 검증한다. |
| [Select API](https://qtaghdi.github.io/yeobaek/design-system/component-api/) | `select-contract.*.js` 응답을 보류하고 예제로 스크롤하면 겉으로 활성인 버튼이 Enter를 받아도 펼쳐지지 않았다. 응답을 풀면 같은 키로 열렸다. | 초기 렌더에서 준비 상태와 비활성 컨트롤을 보여준다. 스크립트 응답 후 첫 Enter, 방향키, Escape 취소, Enter 확정, 폼 제출 및 초기화를 같은 브라우저 세션에서 검증한다. |
| [포커스 링](https://qtaghdi.github.io/yeobaek/accessibility/focus-ring/) | macOS Playwright WebKit 설정에서 두 번째 버튼을 비활성화하고 첫 번째에 포커스를 둔 뒤 Tab을 누르면 세 번째 버튼을 건너뛰었다. Option + Tab은 세 번째 버튼에 링을 표시했다. | 예제 앞에서 Safari 키 설정을 안내한다. Safari의 Tab 동작과 설정은 [Apple 사용 설명서](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac)와 대조했다. |
| [비동기 요청](https://qtaghdi.github.io/yeobaek/language/async-requests/#현재-화면은-누구의-결과를-보여줄까) | 글은 A 요청이 늦게 실패하게 해보라고 했지만 예제의 버튼은 B 성공 뒤 A가 성공하는 상황만 실행했다. | 실패를 가정하고 결과를 예측하는 질문으로 바꿨다. 독자는 재현 버튼으로 실제 예제의 응답 순서도 계속 확인할 수 있다. |
| [CI 대기](https://qtaghdi.github.io/yeobaek/ai/review-ci-gating/) | 도입과 도식에서 말한 재실행과 실행 번호 표의 125·126이 같은 동작처럼 읽혔다. | 이전 실행 취소와 새 실행의 관계를 명시했다. 기존 실행을 다시 돌릴 때 번호는 유지되고 시도 횟수가 늘어나는 동작과 구분했다. [수정 PR](https://github.com/Oddmash/oddmash-agents/pull/140) · [GitHub Actions 환경 변수](https://docs.github.com/en/actions/reference/workflows-and-actions/variables#default-environment-variables) |
| [API 통신과 Effect](https://qtaghdi.github.io/yeobaek/react/server-state/) · [팀 밸런스](https://qtaghdi.github.io/yeobaek/design/team-balance/) | 도입에 “여기서 여기서”가 나타났고, 팀 밸런스 글은 참가자 교체와 재계산을 연달아 설명한 뒤 마지막 절에서도 용어와 가이드 이야기를 반복했다. | 오타를 고치고 각각의 경험을 한 번씩 설명해 다음 질문으로 이어지게 했다. [벨로그 원문](https://velog.io/@qtaghdi/4천-명-규모의-오버워치-내전을-관리해보며) |

## 공개 글과 질문

사이트맵의 43개 공개 경로(홈, 소개, 글 41편) 응답과 제목, 본문 내부 링크와 앵커를 확인했다. 글 전체의 구조를 훑고 대표 글, 최근 공개 5편, 복잡한 예제를 골라 본문을 읽었다. 작성자의 벨로그에서 문제를 만난 상황과 선택지를 질문으로 이어가는 흐름을 확인했다. 아래 결과는 검토자의 예측과 실제 예제 조작이다. 독자 모집과 이해도 측정은 수행하지 않았다. [벨로그](https://velog.io/@qtaghdi/posts)

| 글 | 읽기 전 질문 | 조작 결과 및 설명에서 멈춘 지점 |
| --- | --- | --- |
| [한국어 줄바꿈](https://qtaghdi.github.io/yeobaek/css/text-wrap/#css로-할-수-있는-범위) | `keep-all`이면 ‘패키지 매니저’가 같은 줄에 남을까? | 390px Chromium에서 카드 폭 63%와 64%로 줄였을 때 공백에서 줄이 바뀌었다. CSS 속성 표가 첫 문단의 예시와 떨어져 있었다. 공백도 후보라는 설명과 카드 폭 조작 질문을 CSS 절에 연결했다. [CSS Text §5.1](https://www.w3.org/TR/css-text-3/#word-break-property) |
| [재사용 가능한 컴포넌트의 API](https://qtaghdi.github.io/yeobaek/design-system/component-api/#select의-값-활성-항목-포커스) | ‘진행 중’에서 ‘완료’를 강조하고 Escape로 닫으면 어떤 값이 전송될까? Enter를 누르면? | Escape 후에는 `in-progress`, Enter 확정 뒤에는 `done`을 전송했다. 이동 중 DOM 포커스는 트리거에 남았다. 표의 B·C를 실제 예제의 이름으로 바꿔 폼 결과를 바로 대조할 수 있게 했다. [Select 공개 코드](https://github.com/Oddmash/oddmash-ui/blob/v0.11.0/src/select-dropdown.tsx) |
| [테스트가 막아야 할 문제](https://qtaghdi.github.io/yeobaek/architecture/testing/#먼저-참조-결과를-만들고-최적화한다) | 전체 검사와 증분 검사에서 둘 다 두 건인데 한 건의 파일 경로를 바꾸면 같은 결과일까? | 두 목록의 건수는 그대로였고 누락·추가가 각각 한 건 나왔다. 방향키로 원복했다. 다음 절의 별칭 변경은 문장으로 연결된다. 예제는 파일 경로 변경만으로 건수와 진단 일치의 차이를 보여줬다. [Boundra #142](https://github.com/Oddmash/boundra/issues/142) |

최근 사례의 핵심 설명은 공개 소스와 대조했다. [Jabso 오류 지문](https://github.com/qtaghdi/jabso/blob/c9630a9a7802d9f3c86e1bd46b84e08b0e07ccf9/domains/ingestion/server/fingerprint.ts) · [Foloom XLSX](https://github.com/qtaghdi/foloom/blob/6966fe653a43dd5c1dd720f6fd1cac8dd2596f25/internal/formats/xlsx/session.go) · [Foloom DOCX](https://github.com/qtaghdi/foloom/blob/fd09964689a41471ede3eb74b6a1ab79ea4f1050/internal/formats/docx/control_choice.go) · [Apple Music](https://github.com/qtaghdi/apple-music-discord-presence/blob/81cc2f87a5708e8f71f1bfd70635f25a6a63a489/src/presence.ts) · [Oddmash Agents](https://github.com/Oddmash/oddmash-agents/pull/140)

## 브라우저 검토 범위

- macOS 26.7.3, Node 24.14.0, pnpm 12.14.0, Playwright 1.65.0에서 검토했다. 첫 배포본의 홈과 긴 글, 짧은 글을 320·375·390·768·844(가로)·1024·1152·1280·1440·1920·2560px에서 비교했다. 1152px의 긴 글 본문 폭은 약 586px, 1920·2560px에서는 832px였다. 문서 바깥 가로 넘침은 관찰되지 않았다.
- 홈 목차에서 글을 열고 다음 글로 이동했다. 검색의 Enter/명시적 선택, 대소문자와 초성 강조, 참고 자료 요약과 원문, 뒤로 가기를 확인했다. 메뉴와 검색이 겹칠 때 Escape로 검색만 닫히고, 모바일 회전 뒤 메뉴와 배경 inert가 해제되는 흐름을 확인했다. 라이트·다크·자동 테마 전환 때 헤더 크기는 같았다.
- 배포본에서 320px 다크 및 1440px 라이트로 시연 25개의 고정 프레임과 조작 예제 28개, 정적 도식 5개를 검사했다. 대표 조작 11개를 Chromium·Firefox·WebKit에서 실행했다. 화면 밖·모션 감소·정지 및 재개는 대표 시연에서 확인했다. [Oddmash Visual Media](https://github.com/Oddmash/oddmash-skills/blob/main/skills/oddmash-visual-media/SKILL.md) · [Oddmash Visual Clarity](https://github.com/Oddmash/oddmash-skills/blob/main/skills/oddmash-visual-clarity/SKILL.md)
- macOS Safari 26.6.2 앱에서도 홈에서 `localStorage` 검색, 결과 열기, 인용 요약, MDN 원문 이동과 브라우저 뒤로 가기를 직접 확인했다. Playwright WebKit 검증과 별개로 수행했다.
- 모바일 터치와 회전은 에뮬레이션이다. 실물 iOS·Android와 운영체제 한글 IME 입력은 이 검토 환경에서 확인하지 못했다. 헤드리스에서 탭을 바꿔도 `document.visibilityState`가 `visible`이어서 실제 백그라운드 탭의 정지는 미검증이다. 회귀 테스트의 합성 visibility 이벤트와 화면 밖 중단은 확인했다.

## 이후에 비교할 사항

- 320px에서는 첫 화면 대부분을 소개와 손글씨가 차지하고, 1920px에서는 대표 글 세 편을 한 화면에서 볼 수 있었다. 대표 글을 더 빨리 발견해야 하는지는 어느 주제로 들어갈지 고르는 첫 방문 독자를 대상으로 확인할 사항이다. 이번에는 확인된 중앙 정렬 오류를 수정했다.
- Select에서 확인한 준비 전 입력 문제는 다른 React 예제에도 가능한 유형이다. 범용 준비 UI를 도입하기 전에 각 예제를 느린 응답에서 열고 네이티브 동작, 조작 가능 시점, 안내를 각각 비교할 수 있다.
