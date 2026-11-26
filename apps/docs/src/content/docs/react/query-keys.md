---
title: "서버 상태와 Query Key"
description: "쿼리 키가 캐시를 식별하는 방식과 갱신 범위."
---

사용자 목록을 호출하고 응답을 state에 저장했습니다. 잘 동작하네요. 그런데 페이지를 나갔다 돌아오면 또 불러오고, 같은 목록을 쓰는 다른 컴포넌트에서도 또 호출하고, 사용자 수정 후에는 어디를 갱신해야 할지 고민하게 됩니다. 이쯤 되면 API를 호출하는 것과 가져온 데이터를 관리하는 것을 구분할 필요가 있습니다.

## Query Key는 데이터의 주소다

다음 예시는 객체 기반 API를 사용하는 TanStack Query v5 스타일입니다.

```tsx
const query = useQuery({
  queryKey: ["items", { keyword, page }],
  queryFn: () => fetchItems({ keyword, page }),
});
```

위 코드에서 중요한 부분은 `queryFn`뿐 아니라 `queryKey`입니다. 조회 결과를 바꾸는 검색어와 페이지 번호까지 키에 넣으면 어떤 조건으로 가져온 데이터인지 구분할 수 있습니다.

여기서 keyword를 키에서 빼면 어떻게 될까요? 검색어가 달라져도 캐시에는 같은 데이터로 기록됩니다. 반대로 화면에만 사용하는 모달의 열림 상태까지 키에 추가하면 같은 API 결과를 불필요하게 다른 데이터로 취급하게 됩니다.

```ts
const itemKeys = {
  all: ["items"] as const,
  list: (keyword: string, page: number) =>
    ["items", "list", { keyword, page }] as const,
  detail: (id: string) =>
    ["items", "detail", id] as const,
};
```

여러 화면에서 목록과 상세 정보를 사용한다면 이런 식으로 키의 생성 규칙을 정할 수 있습니다. 목록 하나만 다시 가져올지, 관련된 모든 목록을 갱신할지 표현하기도 편해집니다. 캐시의 신선도와 생명주기는 [API 통신에 useEffect 쓰면 안됨?](../server-state/)에서 이어서 설명했습니다.

## 수정한 뒤에는 무엇을 갱신할까?

```ts
await queryClient.invalidateQueries({
  queryKey: ["items"],
});
```

관련 캐시를 오래된 것으로 표시하고 조건에 맞는 활성 쿼리를 다시 조회할 수 있습니다. 모든 캐시를 무효화하기보다는 어떤 데이터가 실제로 바뀌었는지 구분합니다.

예를 들어 상세 정보 하나를 수정했다면 그 사용자의 상세 키와 수정 결과가 목록에 반영되는 쿼리를 갱신할 수 있습니다. 페이지나 검색어가 다른 목록 모두에 영향을 주는 변경이라면 목록을 공통 접두사로 묶어둔 것이 유용합니다.

[TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) · [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)

## 입력 중인 값과 실제 요청의 차이

앞에서 조회 조건을 키에 넣으라고 했지만, 입력창의 모든 값을 키에 넣으라는 뜻은 아닙니다. 기간 필터에서 시작일과 종료일을 편집할 때마다 조회할 필요가 없는 경우도 있습니다. [Oddmash Agents #273](https://github.com/Oddmash/oddmash-agents/issues/273)처럼 적용된 기간만 요청 조건과 키로 사용하면 화면의 편집 상태와 서버 캐시가 뒤섞이지 않습니다.

이 글은 벨로그의 [API 통신에 useEffect 쓰면 안됨?](https://velog.io/@qtaghdi/API-통신에-useEffect-쓰면-안되나)에서 이야기했던 서버 상태를 Query Key 중심으로 다시 정리한 글입니다.
