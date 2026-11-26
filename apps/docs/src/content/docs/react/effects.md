---
title: "useEffect는 언제 사용해야 할까?"
description: "렌더에서 계산할 값과 외부 시스템 동기화를 구분합니다."
---

검색창에 입력하면 목록을 필터링하는 기능을 만들어봅시다. 검색어가 바뀔 때마다 useEffect로 결과를 다시 setState하면 잘 동작합니다. 그런데 이미 원본 목록과 검색어가 있는데 굳이 결과까지 상태로 갖고 있어야 할까요?

## 렌더 중에 구할 수 있는 값

```tsx
const [keyword, setKeyword] = useState("");
const visibleItems = items.filter((item) =>
  item.name.includes(keyword),
);
```

필터 결과는 기존 데이터와 검색어로 계산할 수 있습니다. 이를 effect에서 별도의 상태로 다시 저장하면 추가 렌더가 필요해지고 상태가 중복됩니다.

필터링된 목록을 별도 state에 담는 순간 원본 데이터와 검색어, 결과 배열을 모두 관리해야 합니다. 처음에는 맞춰놓을 수 있지만 하나의 값이 바뀌었을 때 다른 값이 아직 반영되지 않은 렌더가 생길 수 있습니다. 계산 비용이 크다면 측정 후 memo를 검토하면 되고, 그 자체가 새로운 상태를 만들 이유는 아닙니다.

## 외부와 동기화할 때가 진짜 역할이다

서버 연결, 브라우저 이벤트 등록, 외부 라이브러리 동기화처럼 React 외부 시스템과 맞추는 일이 effect에 잘 어울립니다.

```tsx
useEffect(() => {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, [onResize]);
```

정리 함수는 의존성 변경이나 언마운트 시 이전 연결을 정리합니다. 의존성을 억지로 제거하지 말고 이벤트 핸들러와 effect 내부의 역할을 분리합니다.

[React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

## Effect가 계속 늘어날 때

Juliya처럼 브라우저 크기나 글꼴 변화를 관찰할 때는 Effect가 자연스러운 선택입니다. 반대로 관찰한 입력으로부터 결과를 계산하는 일까지 각각 Effect로 만들 필요는 없습니다. [#121](https://github.com/Oddmash/juliya/issues/121)처럼 크기가 같다면 불필요한 재계산도 줄일 수 있습니다. API 호출의 경우에는 [서버 상태 글](../server-state/)에서 조금 더 자세히 이야기해보겠습니다.
