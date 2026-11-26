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
