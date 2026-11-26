---
title: "useEffect는 언제 사용해야 할까?"
description: "렌더에서 계산할 값과 외부 시스템 동기화를 구분합니다."
---

검색 결과를 만들기 위해 원본 배열과 검색어를 상태로 갖고 있다면 필터링된 배열까지 상태로 저장해야 할까요? 같은 정보가 두 곳에 있으면 서로 어긋날 수 있습니다.

## 렌더 중 계산할 값

```tsx
const [keyword, setKeyword] = useState("");
const visibleItems = items.filter((item) =>
  item.name.includes(keyword),
);
```

필터 결과는 기존 데이터와 검색어로 계산할 수 있습니다. 이를 effect에서 별도의 상태로 다시 저장하면 추가 렌더가 필요해지고 상태가 중복됩니다.

## Effect의 역할

서버 연결, 브라우저 이벤트 등록, 외부 라이브러리 동기화처럼 React 외부 시스템과 맞추는 일이 effect에 잘 어울립니다.

```tsx
useEffect(() => {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, [onResize]);
```

정리 함수는 의존성 변경이나 언마운트 시 이전 연결을 정리합니다. 의존성을 억지로 제거하지 말고 이벤트 핸들러와 effect 내부의 역할을 분리합니다.

[React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
