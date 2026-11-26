type Tone = "idle" | "active" | "done" | "muted" | "warning";
type NodeState = { value: string; tone?: Tone };
type Frame = { label: string; note: string; key?: string; states: NodeState[] };
export type Story = { title: string; interaction?: "event" | "focus" | "tab" | "controls" | "dialog" | "disabled" | "counter" | "filter" | "request"; illustration?: "loading" | "stacking" | "text-width" | "scrollbar" | "viewport" | "flex"; layout: "flow" | "comparison" | "keyboard"; nodes: string[]; frames: Frame[] };

const s = (value: string, tone: Tone = "idle"): NodeState => ({ value, tone });
const f = (label: string, note: string, states: NodeState[], key?: string): Frame => ({ label, note, states, key });

export const stories = {
  "event-propagation": {
    interaction: "event",
    title: "클릭이 부모에서 자식으로, 다시 부모로",
    layout: "flow",
    nodes: ["부모 · Capture", "버튼 · Target", "부모 · Bubble"],
    frames: [
      f("캡처 단계", "사용자가 버튼을 클릭하면 이벤트 경로를 따라 조상부터 캡처 핸들러가 실행됩니다.", [s("1. 부모 캡처", "active"), s("아직 호출 전"), s("아직 호출 전")], "Click"),
      f("대상 단계", "실제 클릭한 버튼에 도달해 대상의 핸들러가 실행됩니다.", [s("실행 완료", "done"), s("2. 대상 버튼", "active"), s("대기")]),
      f("버블 단계", "버블링하는 이벤트는 다시 부모 방향으로 전달됩니다.", [s("실행 완료", "done"), s("실행 완료", "done"), s("3. 부모 버블", "active")]),
      f("전파를 중단하면", "대상에서 stopPropagation()을 호출하면 이후 부모 버블 핸들러는 실행되지 않습니다.", [s("실행 완료", "done"), s("stopPropagation()", "active"), s("실행되지 않음", "muted")]),
    ],
  },
  "focus-ring": {
    interaction: "focus",
    title: "마우스 없이 Tab을 눌러보면",
    layout: "keyboard",
    nodes: ["버튼 01", "버튼 02", "버튼 03"],
    frames: [
      f("첫 번째 포커스", "Tab을 누르면 브라우저의 첫 번째 순차 포커스 대상이 선택됩니다. 외곽선은 그 위치를 알려줍니다.", [s("선택됨", "active"), s("대기"), s("대기")], "Tab"),
      f("다음 요소", "Tab을 한 번 더 누르면 두 번째 버튼으로 이동합니다.", [s("기본"), s("선택됨", "active"), s("대기")], "Tab"),
      f("포커스 표시를 없애면", "실제 포커스는 세 번째 버튼에 있지만 화면에 표시가 없으면 위치를 찾기 어렵습니다.", [s("기본"), s("기본"), s("표시 없음", "warning")], "Tab"),
      f("역방향 탐색", "Shift + Tab으로 이전 요소에 돌아갑니다. 포커스 스타일은 이동 자체와 별개입니다.", [s("기본"), s("선택됨", "active"), s("기본")], "Shift + Tab"),
    ],
  },
  "tab-order": {
    interaction: "tab",
    title: "tabindex=-1이 두 번째 버튼을 건너뛰는 과정",
    layout: "keyboard",
    nodes: ["버튼 A", "버튼 B", "버튼 C"],
    frames: [
      f("일반 순서", "세 버튼이 모두 순차 탐색 대상이라면 A부터 시작합니다.", [s("포커스", "active"), s("tabindex=0"), s("tabindex=0")], "Tab"),
      f("일반 순서의 다음 위치", "B가 자연스럽게 다음 포커스를 받습니다.", [s("대기"), s("포커스", "active"), s("대기")], "Tab"),
      f("B를 순차 탐색에서 제외", "A에서 Tab을 누르면 tabindex=-1인 B를 지나 C로 이동합니다.", [s("이전 위치"), s("tabindex=-1", "muted"), s("포커스", "active")], "Tab"),
      f("역방향", "Shift + Tab을 눌러도 B는 건너뜁니다. 단, 코드로 B에 포커스를 줄 수는 있습니다.", [s("포커스", "active"), s("tabindex=-1", "muted"), s("이전 위치")], "Shift + Tab"),
    ],
  },
  "semantic-controls": {
    interaction: "controls",
    title: "버튼과 div의 키보드 동작 비교",
    layout: "comparison",
    nodes: ["div + onClick", "네이티브 button"],
    frames: [
      f("마우스로 클릭", "둘 다 클릭 핸들러가 붙어 있으면 클릭 결과를 만들 수 있습니다.", [s("클릭 실행", "done"), s("클릭 실행", "done")], "Click"),
      f("Tab으로 이동", "일반 div는 기본적으로 순차 포커스 대상이 아닙니다. button은 탐색 대상입니다.", [s("건너뜀", "muted"), s("포커스", "active")], "Tab"),
      f("키보드로 활성화", "포커스된 네이티브 버튼은 Enter나 Space로 동작합니다. 일반 div의 클릭 핸들러만으로는 같은 기능이 생기지 않습니다.", [s("동작 없음", "warning"), s("클릭 실행", "done")], "Enter / Space"),
    ],
  },
  "dialog-focus": {
    interaction: "dialog",
    title: "모달을 열고 닫을 때 포커스의 이동",
    layout: "keyboard",
    nodes: ["열기 버튼", "모달 내부", "배경 화면"],
    frames: [
      f("열기 전", "사용자가 포커스된 트리거에서 Enter를 누릅니다.", [s("포커스", "active"), s("닫힘", "muted"), s("활성")], "Enter"),
      f("모달이 열림", "모달 내부의 적절한 요소에 포커스를 두고 배경은 모달이 열린 동안 상호작용하지 못하게 합니다.", [s("대기"), s("닫기 버튼", "active"), s("비활성", "muted")]),
      f("모달 안에서 이동", "Tab으로 다음 버튼에 이동해도 배경에 진입하지 않습니다.", [s("대기"), s("확인 버튼", "active"), s("비활성", "muted")], "Tab"),
      f("닫고 돌아가기", "Escape로 닫으면 가능한 경우 트리거로 포커스를 복원합니다.", [s("포커스 복원", "active"), s("닫힘", "muted"), s("활성")], "Escape"),
    ],
  },
  "disabled-state": {
    interaction: "disabled",
    title: "보이는 상태와 실제 비활성 상태는 다르다",
    layout: "comparison",
    nodes: ["CSS만 회색", "disabled", "aria-disabled"],
    frames: [
      f("화면 표시", "세 컨트롤이 모두 비활성처럼 보일 수 있어도 브라우저가 이해하는 상태는 다릅니다.", [s("회색"), s("회색"), s("회색")]),
      f("Tab 이동", "네이티브 disabled는 일반 Tab 순서에서 빠집니다. aria-disabled는 그 자체로 포커스를 막지 않습니다.", [s("이동 가능"), s("건너뜀", "muted"), s("이동 가능", "active")], "Tab"),
      f("클릭", "CSS나 aria-disabled만 지정하면 클릭 실행을 자동으로 막지 않습니다. 별도 이벤트 제어가 필요합니다.", [s("실행됨", "warning"), s("실행 차단", "done"), s("별도 제어 필요", "warning")], "Click"),
    ],
  },
  "stacking-context": {
    illustration: "stacking",
    title: "9999가 부모의 쌓임 맥락을 이기지 못하는 이유",
    layout: "comparison",
    nodes: ["부모 A", "자식 A", "부모 B"],
    frames: [
      f("부모가 독립 맥락을 만들기 전", "부모 A가 별도 쌓임 맥락을 만들지 않으면 자식 A의 z-index가 외부 요소와 비교될 수 있습니다.", [s("auto"), s("9999", "active"), s("2")]),
      f("부모 A가 1", "부모 A가 독립 맥락을 만들면 자식 A의 9999는 A 안에서만 의미를 갖습니다.", [s("1"), s("9999", "muted"), s("2 · 위쪽", "active")]),
      f("부모 A가 3", "이제 부모 A 전체가 B보다 위에 배치됩니다. 자식의 값은 그대로입니다.", [s("3 · 위쪽", "active"), s("9999", "done"), s("2", "muted")]),
    ],
  },
  "flex-overflow": {
    illustration: "flex",
    title: "flex: 1과 자동 최소 크기",
    layout: "comparison",
    nodes: ["컨테이너", "파일명", "삭제 버튼"],
    frames: [
      f("짧은 파일명", "파일명 영역과 버튼이 같은 줄에 들어갑니다.", [s("300px"), s("짧은 이름", "done"), s("정상 표시", "done")]),
      f("긴 문자열", "자동 최소 크기 때문에 파일명이 충분히 줄어들지 못하면 버튼이 화면 밖으로 밀립니다.", [s("300px"), s("최소 콘텐츠 폭", "warning"), s("넘침", "warning")]),
      f("min-width: 0 적용", "파일명 영역이 줄어들 수 있게 허용하고 필요하면 말줄임을 적용합니다.", [s("300px"), s("긴 파일명…", "active"), s("정상 표시", "done")]),
    ],
  },
  "css-cascade": {
    title: "CSS가 마지막 선언만 고르는 것이 아닌 이유",
    layout: "flow",
    nodes: ["레이어 순서", "명시도", "선언 순서"],
    frames: [
      f("레이어 우선순위", "같은 출처의 일반 선언이라면 다른 cascade layer 사이의 우선순위를 먼저 비교합니다.", [s("app > components", "active"), s("아직 비교 전"), s("대기")]),
      f("같은 레이어라면", "같은 우선순위 안에서는 선택자의 명시도를 비교합니다.", [s("같은 레이어", "done"), s(".button > button", "active"), s("대기")]),
      f("명시도도 같다면", "같은 조건의 선언은 나중에 나온 선언이 적용될 수 있습니다.", [s("동일", "done"), s("동일", "done"), s("뒤 선언", "active")]),
    ],
  },
  "viewport": {
    illustration: "viewport",
    title: "모바일 브라우저 UI와 뷰포트 높이",
    layout: "comparison",
    nodes: ["주소창 펼침", "주소창 접힘", "dvh"],
    frames: [
      f("작은 뷰포트", "주소창이 펼쳐진 상태를 기준으로 작은 뷰포트 높이가 정해집니다.", [s("svh", "active"), s("lvh"), s("현재 작은 높이")]),
      f("스크롤 후 주소창 접힘", "주소창이 접히면 사용 가능한 실제 높이가 커집니다.", [s("svh"), s("lvh", "active"), s("현재 큰 높이", "done")]),
      f("동적 높이 적용", "dvh는 브라우저 UI 변화에 맞춰 높이를 바꿉니다. 고정된 화면에는 svh가 더 자연스러울 수 있습니다.", [s("고정 작은 높이"), s("고정 큰 높이"), s("현재 높이 반영", "active")]),
    ],
  },
  "scrollbar": {
    illustration: "scrollbar",
    title: "스크롤 잠금 전후의 레이아웃 폭",
    layout: "comparison",
    nodes: ["뷰포트", "콘텐츠", "스크롤바"],
    frames: [
      f("모달 열기 전", "클래식 스크롤바가 15px를 차지하는 예시입니다.", [s("320px"), s("305px", "active"), s("15px")]),
      f("스크롤 잠금", "스크롤바가 사라지면 콘텐츠의 사용 가능한 폭이 달라지고 중앙 정렬이 움직일 수 있습니다.", [s("320px"), s("320px", "warning"), s("0px", "muted")]),
      f("공간 예약", "scrollbar-gutter: stable을 적용하면 지원 환경에서 스크롤바 공간을 유지할 수 있습니다.", [s("320px"), s("305px", "done"), s("15px 예약", "active")]),
    ],
  },
  "text-wrap": {
    illustration: "text-width",
    title: "글자 수가 같아도 실제 너비는 다르다",
    layout: "comparison",
    nodes: ["문자열 A", "문자열 B", "줄바꿈 결정"],
    frames: [
      f("글자 수 비교", "두 문자열 모두 8글자이지만 가변 폭 글꼴에서 차지하는 너비는 다를 수 있습니다.", [s("WWWWWWWW"), s("iiiiiiii"), s("8글자")]),
      f("실측", "같은 글꼴과 글자 크기로 실제 문자열의 너비를 측정합니다.", [s("넓은 폭", "active"), s("좁은 폭", "active"), s("측정값")]),
      f("컨테이너와 비교", "허용된 너비와 문맥에 맞는 줄바꿈 후보를 선택합니다.", [s("줄바꿈 필요", "warning"), s("한 줄 가능", "done"), s("폭 기준", "active")]),
    ],
  },
  "layout-observation": {
    title: "폭과 글꼴 변화를 분리해 관찰하기",
    layout: "flow",
    nodes: ["컨테이너", "폰트", "줄바꿈 결과"],
    frames: [
      f("처음 렌더", "브라우저 기본 스타일로 내용을 표시하고 현재 폭과 글꼴을 확인합니다.", [s("360px"), s("기본 글꼴"), s("초기 표시", "active")]),
      f("사이드바 펼침", "창 크기는 같아도 요소의 폭이 바뀌면 재측정해야 합니다.", [s("280px", "active"), s("동일"), s("다시 계산")]),
      f("폰트 로딩 완료", "폭이 그대로여도 글자의 실제 너비가 달라질 수 있습니다.", [s("280px"), s("웹 폰트", "active"), s("다시 계산")]),
      f("높이만 변함", "평문 줄바꿈의 입력이 동일한 경우 불필요한 재계산을 생략할 수 있습니다.", [s("280px"), s("동일"), s("결과 유지", "done")]),
    ],
  },
  "rendering-strategies": {
    title: "브라우저가 내용을 받는 시점 비교",
    layout: "comparison",
    nodes: ["CSR", "SSR", "SSG"],
    frames: [
      f("빌드 시점", "SSG는 미리 HTML을 생성합니다. 전형적인 CSR과 요청 시 SSR은 아직 사용자별 화면을 생성하지 않았습니다.", [s("JS 번들"), s("서버 코드"), s("HTML 생성", "done")]),
      f("사용자 요청", "CSR은 브라우저가 이후 화면을 그릴 자료를 받으며, SSR은 서버에서 HTML을 생성하고 SSG는 이미 준비된 HTML을 반환합니다.", [s("쉘 + JS"), s("요청별 HTML", "active"), s("정적 HTML", "done")]),
      f("브라우저 실행", "클라이언트 상호작용이 필요한 부분은 JavaScript가 준비되어야 합니다. SSR이나 SSG도 하이드레이션 비용이 생길 수 있습니다.", [s("렌더링", "active"), s("하이드레이션"), s("필요한 JS")]),
    ],
  },
  "state-snapshot": {
    interaction: "counter",
    title: "setCount 호출 세 번의 실제 차이",
    layout: "comparison",
    nodes: ["직접 갱신", "함수형 갱신"],
    frames: [
      f("초기 렌더", "두 카운터 모두 현재 렌더에서 count가 0입니다.", [s("0"), s("0")]),
      f("세 번 요청", "직접 갱신은 0 + 1을 세 번 계산하고, 함수형 갱신은 이전 값을 받을 업데이터 세 개를 큐에 넣습니다.", [s("1, 1, 1", "active"), s("+1, +1, +1", "active")]),
      f("큐 처리 후", "같은 렌더의 값으로 계산한 결과는 1이고 업데이터는 이전 결과를 이어받아 3이 됩니다.", [s("1", "done"), s("3", "done")]),
    ],
  },
  "request-order": {
    interaction: "request",
    title: "늦게 도착한 응답이 화면을 덮는 상황",
    layout: "comparison",
    nodes: ["요청 A", "요청 B", "현재 화면"],
    frames: [
      f("첫 요청", "A 검색을 시작합니다.", [s("진행 중", "active"), s("대기"), s("A 로딩")]),
      f("검색 조건 변경", "B를 시작했지만 이전 A가 아직 완료되지 않았습니다.", [s("진행 중"), s("진행 중", "active"), s("B 로딩")]),
      f("B가 먼저 도착", "현재 검색 조건인 B의 결과를 표시합니다.", [s("진행 중"), s("완료", "done"), s("B 결과", "active")]),
      f("A가 늦게 도착", "최신 요청을 확인하지 않으면 이전 A가 화면을 덮습니다. 올바른 화면은 B를 유지합니다.", [s("늦은 완료", "warning"), s("완료"), s("B 유지", "done")]),
    ],
  },
  "controlled-input": {
    interaction: "filter",
    title: "편집 중인 값과 실제 적용값",
    layout: "comparison",
    nodes: ["draft", "applied", "조회 결과"],
    frames: [
      f("필터 열기", "기존 적용값을 편집 값으로 복사합니다.", [s("1~10일"), s("1~10일"), s("기존 데이터")]),
      f("시작일 수정", "범위가 역전된 값은 편집 중일 뿐 아직 서버 요청에 쓰지 않습니다.", [s("15~10일", "warning"), s("1~10일", "done"), s("유지")]),
      f("끝 날짜 수정", "유효한 새 범위가 만들어졌지만 아직 적용하기 전입니다.", [s("15~20일", "active"), s("1~10일"), s("유지")]),
      f("적용", "유효한 값을 확정하고 그 조건으로 조회합니다.", [s("15~20일"), s("15~20일", "done"), s("새 데이터", "active")], "Apply"),
    ],
  },
  "server-state": {
    title: "데이터가 있는 것과 최신인 것은 다르다",
    layout: "flow",
    nodes: ["서버", "클라이언트 캐시", "화면"],
    frames: [
      f("데이터 조회", "서버의 현재 데이터를 요청하고 캐시에 보관합니다.", [s("목록 v1"), s("fresh · v1", "active"), s("v1 표시")]),
      f("다른 곳에서 수정", "서버의 원본은 바뀌었지만 클라이언트는 이전 복사본을 가지고 있습니다.", [s("목록 v2", "active"), s("v1"), s("v1 표시")]),
      f("무효화", "관련 쿼리를 stale로 표시하고 갱신할 수 있습니다.", [s("목록 v2"), s("stale · v1", "warning"), s("기존 데이터 유지")]),
      f("갱신 완료", "새 응답을 캐시에 반영하고 화면을 갱신합니다.", [s("목록 v2"), s("fresh · v2", "done"), s("v2 표시", "active")]),
    ],
  },
  "loading-states": {
    illustration: "loading",
    title: "로딩 전후 레이아웃이 흔들리는 차이",
    layout: "comparison",
    nodes: ["높이를 예약하지 않음", "스켈레톤으로 예약"],
    frames: [
      f("최초 로딩", "왼쪽은 작은 로딩 텍스트만, 오른쪽은 실제 콘텐츠가 들어갈 높이를 예약합니다.", [s("로딩 · 1줄"), s("카드 크기 예약", "active")]),
      f("콘텐츠 표시", "왼쪽은 카드가 생기면서 다음 요소가 밀리고 오른쪽은 비슷한 위치를 유지합니다.", [s("다음 요소 이동", "warning"), s("위치 유지", "done")]),
      f("갱신 중", "이미 데이터가 보이면 기존 콘텐츠를 유지한 상태에서 갱신 표시를 할 수도 있습니다.", [s("전체 화면 교체", "muted"), s("기존 화면 + 갱신", "active")]),
    ],
  },
  "module-boundaries": {
    title: "내부 구현 대신 공개 진입점을 바라보는 구조",
    layout: "flow",
    nodes: ["호출하는 기능", "공개 API", "내부 구현"],
    frames: [
      f("직접 import", "소비자가 다른 기능의 내부 파일을 직접 참조하면 내부 파일 구조에도 의존합니다.", [s("소비자"), s("건너뜀", "muted"), s("내부 파일", "warning")]),
      f("공개 진입점", "소비자가 공개된 계약을 통해 필요한 기능을 호출합니다.", [s("소비자"), s("공개 함수", "active"), s("내부 처리")]),
      f("내부 변경", "공개 계약을 유지한다면 내부 구조를 바꾸어도 소비자가 같은 방식으로 사용할 수 있습니다.", [s("변경 없음", "done"), s("계약 유지", "done"), s("구현 변경", "active")]),
    ],
  },
  "team-balance": {
    title: "계산과 화면 조작을 분리하기",
    layout: "flow",
    nodes: ["메인 스레드", "Web Worker", "결과"],
    frames: [
      f("참가자 입력", "UI에서 참가자와 역할 정보를 편집하고 계산 요청을 보냅니다.", [s("입력·조작", "active"), s("대기"), s("이전 결과")]),
      f("후보 평가", "Worker에서 조합을 계산합니다. 계산량은 그대로지만 UI 이벤트는 별도 스레드에서 처리됩니다.", [s("UI 조작 가능", "done"), s("후보 계산", "active"), s("계산 중")]),
      f("현재 요청 완료", "현재 참가자 구성에 해당하는 결과만 화면에 반영합니다.", [s("결과 표시", "active"), s("완료", "done"), s("팀 추천", "done")]),
    ],
  },
  "tokens": {
    title: "의미 토큰을 사용하는 버튼의 테마 전환",
    layout: "comparison",
    nodes: ["라이트 값", "의미 토큰", "다크 값"],
    frames: [
      f("라이트 테마", "컴포넌트가 구체적인 색상 대신 역할을 나타내는 텍스트 토큰을 참조합니다.", [s("#18181b", "active"), s("text-primary"), s("#f4f4f5")]),
      f("다크 테마 변경", "테마에서 같은 의미 토큰이 가리키는 값만 바꿉니다.", [s("#18181b"), s("text-primary", "active"), s("#f4f4f5", "done")]),
      f("컴포넌트 변경 없음", "각 컴포넌트가 테마별 색을 중복해서 정의할 필요가 없습니다.", [s("라이트"), s("같은 사용 방식", "done"), s("다크")]),
    ],
  },
} satisfies Record<string, Story>;

export type StoryId = keyof typeof stories;
