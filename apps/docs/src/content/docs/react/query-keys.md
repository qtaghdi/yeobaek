---
title: "서버 상태와 Query Key"
description: "쿼리 키가 캐시를 식별하는 방식과 갱신 범위."
---

목록 API에 검색어와 페이지 번호가 있다면 단순한 문자열 키 하나로는 서로 다른 결과를 구분하기 어렵습니다. TanStack Query에서는 데이터를 식별할 수 있는 키가 필요합니다.

## 키와 요청 조건

다음 예시는 객체 기반 API를 사용하는 TanStack Query v5 스타일입니다.

```tsx
const query = useQuery({
  queryKey: ["items", { keyword, page }],
  queryFn: () => fetchItems({ keyword, page }),
});
```

조회 결과를 바꾸는 조건은 키에 포함합니다. 같은 데이터를 여러 곳에서 불러올 때 키 생성 규칙을 공통으로 관리하면 오타와 일관성 문제를 줄일 수 있습니다.

## 변경 후 갱신

```ts
await queryClient.invalidateQueries({
  queryKey: ["items"],
});
```

관련 캐시를 오래된 것으로 표시하고 조건에 맞는 활성 쿼리를 다시 조회할 수 있습니다. 모든 캐시를 무효화하기보다는 어떤 데이터가 실제로 바뀌었는지 구분합니다.

캐시의 신선도와 메모리 유지 시간은 다른 개념입니다. 사용하는 버전에 따라 옵션과 API 차이를 확인합니다.

[TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) · [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
