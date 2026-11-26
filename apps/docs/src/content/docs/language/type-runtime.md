---
title: "TypeScript 타입은 런타임에도 안전할까?"
description: "타입 선언과 실제 API 응답 검증의 차이."
---

API 응답에 User 타입을 붙였고 TypeScript도 통과했습니다. 그런데 실제 화면에서 name이 undefined입니다. 타입이 맞다고 알려준 것은 나인데 서버가 거기에 맞춰 응답해줄 이유는 없습니다.

## as는 값을 변환하지 않습니다

```ts
type User = { name: string };

const parseUser = (value: unknown): User | null => {
  if (typeof value !== "object" || value === null) return null;
  if (!("name" in value) || typeof value.name !== "string") return null;
  return { name: value.name };
};
```

`as User`는 컴파일러에게 이 값을 User로 취급해달라는 표현입니다. 실제 응답이 `{ name: null }`이라면 타입을 이렇게 단언한다고 해서 `null`이 문자열로 바뀌지는 않습니다.

그래서 아직 신뢰할 수 없는 값을 `unknown`으로 받는 방법이 있습니다. 타입을 모른다는 사실을 그대로 표현하고, 값을 검사하거나 스키마 검증기를 거친 다음 필요한 데이터로 사용합니다.

## 외부 값이 들어오는 경계에서

API나 파일처럼 외부 값이 들어오는 경계에서 검증하고, 검증을 마친 데이터는 내부에서 정해진 타입으로 사용하는 구조가 좋습니다. 모든 컴포넌트에서 동일한 검증을 반복하지 않습니다.

[TypeScript: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## 컴파일이 통과했다고 끝은 아니다

Boundra의 소비자 환경을 다룬 [#43](https://github.com/Oddmash/boundra/issues/43)처럼 타입 해석이 맞아도 실제 모듈 로딩이 실패할 수 있습니다. 타입 검사와 런타임 입력 검사는 각자 다른 문제를 해결합니다. 경계에서 실제 값을 확인하면 내부에서는 그 계약에 집중할 수 있습니다.
