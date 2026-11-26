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

## 프로젝트에서 이어진 고민

기간 선택 UI가 지나치게 많아 공통 기간을 먼저 제공하고 초 단위의 상세 범위는 별도로 다루자는 논의가 있었다. 화면의 임시 입력값과 서버 요청의 조건을 구분하면 캐시 키도 실제로 적용한 조건만 표현할 수 있다.

### 검증 기준

queryKey에 정규화된 시작·종료 시간을 포함하고 임시 draft는 포함하지 않는다. 같은 의미의 기간은 같은 키를 생성하고 기간을 바꾸면 다른 결과를 독립적으로 캐시할 수 있게 한다.

[관련 이슈 · oddmash-agents #273](https://github.com/Oddmash/oddmash-agents/issues/273)
