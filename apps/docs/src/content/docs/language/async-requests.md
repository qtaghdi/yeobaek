---
title: "비동기 요청의 실패와 응답 순서"
description: "요청 실패와 늦게 도착한 응답을 처리하는 기준."
---

검색어를 빠르게 바꾸면 먼저 보낸 요청이 나중 요청보다 늦게 도착할 수 있습니다. 응답이 도착한 순서대로 무조건 화면을 갱신하면 이전 검색 결과가 다시 나타납니다.

## 요청 생명주기

```ts
const controller = new AbortController();

const load = async () => {
  const response = await fetch("/api/items", {
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error("요청에 실패했습니다.");
  }

  return response.json();
};

const cancel = () => controller.abort();
```

컴포넌트가 사라지거나 검색 조건이 바뀌면 필요 없어진 요청을 취소할 수 있습니다. 모든 비동기 작업이 취소 가능한 것은 아니므로 최신 요청인지 확인하고 결과를 적용하는 방식도 고려합니다.

## 실패와 재시도

네트워크 오류, HTTP 상태 오류, 검증 오류는 서로 다릅니다. 모든 실패를 자동 재시도할 필요는 없습니다. 특히 상태를 변경하는 요청은 재시도 시 중복 실행 가능성을 고려해야 합니다.

[MDN: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) · [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
