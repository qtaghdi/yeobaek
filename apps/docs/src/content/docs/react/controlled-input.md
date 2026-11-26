---
title: "입력 상태는 누가 관리해야 할까?"
description: "제어형·비제어형 입력의 책임과 날짜 범위 필터의 draft/applied 상태를 설계합니다."
---

## 입력 중인 값이 곧 서버에 보낼 값일까요?

입력 상태를 어디에 둘지는 사용하는 라이브러리보다 어떤 값이 언제 필요해지는지에 따라 달라집니다. 현재 값이 화면을 실시간으로 바꾼다면 React가 그 값을 관리할 수 있습니다. 폼 제출 시점에만 필요한 값이라면 브라우저가 관리해도 됩니다.

복합 입력에서는 한 걸음 더 생각해야 합니다. 날짜 범위를 편집하는 값이 곧 서버에 전송할 조건인지, 입력 중인 값은 별도로 보존해야 하는지 결정해야 합니다.

## 두 방식

```tsx
const [name, setName] = useState("");

<input
  value={name}
  onChange={(event) => setName(event.target.value)}
/>;
```

제어형 입력에서는 value가 현재 표시값을 결정합니다. onChange에서 상태를 갱신하면 React의 다음 렌더에 반영됩니다. 입력할 때마다 검증 메시지를 갱신하거나 다른 UI와 함께 변경해야 할 때 적합합니다.

```tsx
<form onSubmit={(event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  console.log(data.get("name"));
}}>
  <input name="name" defaultValue="" />
  <button type="submit">저장</button>
</form>
```

비제어형 입력에서 defaultValue는 초기값이며 이후 입력은 DOM이 관리합니다. 폼 제출, FormData 또는 ref에서 필요할 때 읽을 수 있습니다. 입력 요소의 생명주기 중 value의 제어 여부를 반복해서 바꾸지 않습니다.

<span id="프로젝트에서-이어진-고민"></span>

## 입력을 위한 상태와 제출한 상태

Oddmash Agents의 [#248](https://github.com/Oddmash/oddmash-agents/issues/248)은 실행 기록을 초 단위 시간 범위로 필터링하는 요구를 다룹니다. 시작 날짜와 종료 날짜를 변경하는 과정에서는 잠시 시작이 종료보다 뒤일 수 있습니다. 이때 즉시 API 요청을 보내거나 이미 조회된 결과를 잘못된 조건으로 바꾸지 않는 것이 중요합니다.

예를 들어 이전 적용 범위가 11월 1일부터 11월 10일까지일 때 사용자가 시작일을 11월 15일로 먼저 변경한다면 새로운 값은 아직 완성되지 않은 범위입니다. 이 변경이 실제 조회 범위를 변경해야 한다는 뜻은 아닙니다.

| 사용자 행동 | draft | applied |
| --- | --- | --- |
| 처음 열기 | 현재 적용값 | 현재 적용값 |
| 시작일 수정 | 수정값 | 유지 |
| 범위가 역전됨 | 오류 표시 | 유지 |
| 종료일 수정 | 유효한 입력값 | 유지 |
| 적용 | 유지 | 유효한 입력값 |
| 취소 | 적용값으로 복구 | 유지 |

두 상태는 복제를 위해 만든 것이 아닙니다. 입력 중인 값과 실제로 적용된 조회 조건이라는 서로 다른 책임을 가집니다.

## 유효 조건만 적용하는 구조

아래는 날짜 비교 자체보다 상태의 역할에 집중한 설명용 모델입니다. 날짜는 검증된 epoch milliseconds로 정규화되었다고 가정합니다.

```tsx
type Range = {
  start: number | null;
  end: number | null;
};

const [draft, setDraft] = useState<Range>(initialRange);
const [applied, setApplied] = useState<Range>(initialRange);

const isValid = (range: Range) =>
  (range.start === null || Number.isFinite(range.start)) &&
  (range.end === null || Number.isFinite(range.end)) &&
  (range.start === null ||
    range.end === null ||
    range.start <= range.end);

const apply = () => {
  if (!isValid(draft)) return;
  setApplied({ ...draft });
};

const cancel = () => setDraft({ ...applied });
```

여기서 버튼의 활성화 조건은 draft로부터 계산할 수 있습니다. 유효성을 별도 state에 저장해 두고 모든 입력 변경에서 갱신하면 입력과 유효성의 일치 여부를 또 관리하게 됩니다.

서버 상태 라이브러리를 사용하는 경우 쿼리 키는 actual applied 범위를 표현해야 합니다. 사용자가 입력한 순간마다 조회하도록 의도한 검색창과, 명시적으로 적용하는 기간 필터는 다른 계약입니다.

## 날짜와 시간대의 경계

기간 필터는 보이는 날짜와 실제 비교할 시간을 구분해야 합니다. 현지 날짜의 시작과 끝을 UTC instant로 변환할 때 현지 시간대와 daylight saving의 영향을 고려해야 하며, 하루를 기계적으로 24시간으로 더하는 것만으로 항상 다음 날 자정이 되는 것은 아닙니다.

- 날짜만 선택한다면 종료일 전체가 범위에 포함되어야 하는지 정의합니다.
- 초 단위가 필요한 경우 실제 timestamp의 밀리초를 포함하는 경계인지 명시합니다.
- 시작 또는 종료를 비워 한쪽 경계만 지정할 수 있는지 정합니다.
- 잘못된 날짜 문자열을 Date가 자동으로 정규화한 결과를 그대로 유효하다고 판단하지 않습니다.

[#273](https://github.com/Oddmash/oddmash-agents/issues/273)에서는 여러 기간 Select가 사용자의 조회 목적에 비해 복잡하다는 문제가 제기되었습니다. 달력과 공통 기간을 먼저 제공하고 정밀한 시간을 별도 설정에서 다루는 방향은 상태 모델과 사용자 경험을 함께 설계한 사례입니다.

<span id="선택-기준"></span>
<span id="검증-기준"></span>

## 폼의 값은 언제 실제로 적용할까?

단순히 제출할 때만 값이 필요하다면 비제어형 입력으로도 충분합니다. 실시간 미리보기가 있다면 제어형 입력이 편합니다. 날짜 범위처럼 시작과 끝이 모두 완성됐을 때 조회해야 한다면 두 가지 중 어느 것을 선택했느냐보다 draft와 적용된 값을 분리했느냐가 더 중요합니다.

예를 들어 날짜 선택창을 열고 시작일만 변경한 뒤 취소했습니다. 이전 조회 결과가 바뀌지 않는 것이 자연스럽죠. 초기화가 편집값만 지우는 것인지 적용된 조건까지 제거하는 것인지 역시 사용자가 예상할 수 있어야 합니다.

## 참고 자료

- [Oddmash Agents #248](https://github.com/Oddmash/oddmash-agents/issues/248) · [#273](https://github.com/Oddmash/oddmash-agents/issues/273)
- [Oddmash UI #137: 달력과 범위 선택](https://github.com/Oddmash/oddmash-ui/issues/137) · [#142: 정확한 날짜 경계](https://github.com/Oddmash/oddmash-ui/issues/142)
- [React: input](https://react.dev/reference/react-dom/components/input) · [서버 상태와 Query Key](../query-keys/)
