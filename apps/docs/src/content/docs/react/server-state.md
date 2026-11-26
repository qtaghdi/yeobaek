---
title: "API 통신에 useEffect 쓰면 안됨?"
description: "API 호출과 서버 상태의 생명주기를 구분하고 TanStack Query를 사용하는 이유를 이야기합니다."
---

API를 호출하고 데이터를 state에 저장했습니다. 화면도 잘 나옵니다. 그런데 코드를 리뷰하다 보면 이런 질문을 하게 됩니다.

"이 데이터, 다른 화면으로 갔다 와도 매번 다시 가져와야 하나요?"

하나의 요청을 보낼 때는 간단한데 요구사항이 조금씩 늘어나면 이야기가 달라집니다.

## API 하나 호출했을 뿐인데

```tsx
useEffect(() => {
  const controller = new AbortController();

  const load = async () => {
    try {
      const response = await fetch("/api/users", {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("요청 실패");
      const data = await response.json();
      if (!controller.signal.aborted) setUsers(data);
    } catch {
      if (!controller.signal.aborted) setError(true);
    }
  };

  void load();
  return () => controller.abort();
}, []);
```

이 코드 자체가 무조건 잘못된 건 아닙니다. 한 화면에서 한 번 조회하고 끝나는 경우라면 충분할 수 있습니다.

그런데 목록에 있던 사용자를 수정한 뒤 돌아오면 어떨까요? 기존 목록을 다시 불러와야 합니다. 다른 컴포넌트에서도 같은 데이터를 사용한다면 중복 요청을 관리해야 합니다. 이전 결과를 보여주면서 뒤에서 갱신하는 기능까지 필요해질 수 있고요.

처음에는 API 호출 함수 하나였는데 이제 로딩, 재시도, 캐싱, 갱신 시점을 관리하는 코드가 생겼습니다.

## 우리가 가져온 데이터는 누구의 상태일까?

모달이 열렸는지는 현재 클라이언트가 결정합니다. 반면 API로 가져온 사용자 목록의 원본은 서버에 있습니다. 내 화면에 데이터가 있다는 사실과 그 데이터가 최신이라는 사실은 다릅니다.

다른 사용자가 사용자 정보를 수정했다면 내 브라우저의 배열은 그대로일 수 있습니다. 그래서 서버 상태를 관리할 때는 데이터의 존재 여부뿐 아니라 신선도까지 고려해야 합니다.

Axios와 TanStack Query를 비교할 때도 같은 생각을 하면 됩니다. Axios는 HTTP 요청을 보내고 응답을 받습니다. TanStack Query는 그 비동기 결과를 관리합니다. 같이 사용해도 전혀 이상하지 않습니다.

```tsx
const getUsers = async () => {
  const { data } = await axios.get<User[]>("/api/users");
  return data;
};

const usersQuery = useQuery({
  queryKey: ["users"],
  queryFn: getUsers,
  staleTime: 60_000,
});
```

## 1분이 지나면 데이터가 사라질까?

위 코드는 1분 동안 가져온 데이터를 fresh하게 취급합니다. 그렇다고 1분 뒤에 데이터가 사라지는 것은 아닙니다. 이제 다시 최신인지 확인할 필요가 있는 stale 상태가 되는 것입니다.

`staleTime`과 v5의 `gcTime`은 그래서 다른 역할을 합니다. 전자는 신선도, 후자는 쓰이지 않는 캐시의 메모리 유지와 관련됩니다. 새로 조회하는 동안 기존 목록을 보여주고 싶다면 이 차이를 알고 있어야 합니다.

## 사용자 정보를 수정했다면?

```tsx
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  },
});
```

사용자 수정이 성공했으니 이전 목록의 신선도를 더 이상 확신할 수 없습니다. invalidateQueries는 단순히 요청을 한 번 더 보내라는 명령이라기보다 이 사실을 캐시에 알리는 방식입니다. 활성 쿼리는 기본적으로 다시 조회할 수 있습니다.

검색어와 페이지 번호에 따라 결과가 다르다면 [Query Key](../query-keys/)도 그 조건에 맞게 구성해야겠죠.

## 그래서 useEffect를 쓰면 안 될까요?

써도 됩니다. Effect는 외부 시스템과 동기화할 때 굉장히 유용한 Hook입니다. 직접 데이터를 가져올 수도 있습니다. 하지만 캐싱, 신선도, 동시 요청을 직접 관리하는 코드가 계속 늘어난다면 그때는 지금 해결하고 있는 문제가 정말 API 호출 하나인지 생각해보면 좋겠습니다.

[벨로그 원문](https://velog.io/@qtaghdi/API-통신에-useEffect-쓰면-안되나) · [React의 Effect 설명](https://react.dev/reference/react/useEffect) · [TanStack Query 공식 문서](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
