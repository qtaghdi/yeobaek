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

원본 목록과 검색어가 있다면 필터링 결과는 렌더 중에 바로 계산할 수 있습니다. 그런데 결과를 별도 state에 넣으면 원본 목록, 검색어, 결과 배열이 서로 맞는지도 계속 관리해야 합니다. Effect가 아직 결과를 갱신하지 않은 렌더에서는 잠시 서로 다른 값을 보여줄 수도 있고요.

계산 비용이 걱정된다면 실제로 측정한 뒤 `useMemo`를 고려할 수 있습니다. 계산을 최적화하는 문제와 계산 결과를 새로운 상태로 관리하는 문제는 다릅니다.

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

사용자가 저장 버튼을 눌렀을 때 API를 호출해야 한다면 버튼의 이벤트 핸들러에서 요청을 시작하는 편이 훨씬 직접적입니다. 저장 여부를 state로 바꾼 뒤 Effect가 그 값을 감지해 요청하도록 만들면 왜 요청이 시작됐는지 찾기가 어려워질 수 있습니다. 외부 시스템과 지속적으로 동기화해야 하는 경우와 특정 사용자 행동을 처리하는 경우를 구분하면 Effect의 개수도 자연스럽게 줄어듭니다.

## Effect가 계속 늘어날 때

Juliya처럼 브라우저 크기나 글꼴 변화를 관찰할 때는 Effect가 자연스러운 선택입니다. 반대로 관찰한 입력으로부터 결과를 계산하는 일까지 각각 Effect로 만들 필요는 없습니다. [#121](https://github.com/Oddmash/juliya/issues/121)처럼 크기가 같다면 불필요한 재계산도 줄일 수 있습니다. API 호출의 경우에는 [서버 상태 글](../server-state/)에서 조금 더 자세히 이야기해보겠습니다.
