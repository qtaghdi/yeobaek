---
title: "입력 상태는 누가 관리해야 할까?"
description: "제어형 입력과 비제어형 입력을 선택하는 기준."
---

입력값이 검색 결과나 저장 버튼 상태를 결정한다면 현재 값이 화면 상태에 영향을 주게 됩니다. 반면 제출할 때만 값이 필요하다면 DOM이 입력을 관리해도 됩니다.

## 두 방식

```tsx
const [name, setName] = useState("");

<input value={name} onChange={(event) => setName(event.target.value)} />;
```

제어형 입력은 React 상태가 현재 값을 결정합니다. 비제어형 입력은 `defaultValue`로 초기값을 제공하고 필요할 때 폼 데이터나 ref로 읽습니다.

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

## 선택 기준

실시간 검증, 필터링, 외부 상태와의 동기화가 필요하면 제어형이 편리합니다. 제출 시점에만 필요하다면 비제어형으로 불필요한 상태를 줄일 수 있습니다. 한 입력의 제어형 여부를 렌더 중에 반복해서 바꾸지 않습니다.

[React: input](https://react.dev/reference/react-dom/components/input)

## 프로젝트에서 이어진 고민

날짜 입력에서는 입력 중인 범위와 실제 조회에 적용된 범위를 구분해야 한다. 두 날짜가 잠시 역전되는 것은 입력 과정에서 자연스럽지만 결과 목록까지 잘못된 조건으로 조회할 이유는 없다.

### 검증 기준

draft와 applied를 별도로 관리하고 유효성 검사를 통과한 값만 적용한다. 입력 변경, 적용, 초기화 시점에 각각 어떤 상태를 변경하는지 정의한다.

[관련 이슈 · oddmash-agents #248](https://github.com/Oddmash/oddmash-agents/issues/248)

## 입력을 위한 상태와 제출한 상태

필터 시작일과 종료일을 변경하는 도중에는 범위가 잠시 뒤집힐 수 있다. [Oddmash Agents #248](https://github.com/Oddmash/oddmash-agents/issues/248)의 날짜 필터는 이런 잘못된 입력이 기존 조회 조건을 바꾸지 않도록 검토했다.

```tsx
const [draft, setDraft] = useState(initialRange);
const [applied, setApplied] = useState(initialRange);
const isValid = draft.start <= draft.end;
const apply = () => {
  if (isValid) setApplied(draft);
};
```

여기서 draft와 applied는 중복 상태가 아니다. 각각 수정 중인 값과 확정된 조회 조건이라는 다른 책임을 가진다. 반면 버튼의 활성 여부는 기존 상태에서 계산할 수 있으므로 별도 state를 두지 않는다. 날짜 문자열을 비교할 경우 같은 정규화 형식이라는 전제가 필요하다. 실제 조회 조건에는 시간대와 포함/제외 경계도 명시해야 한다.
