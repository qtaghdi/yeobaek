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

`as User`는 컴파일러에게 타입을 알려주는 표현이지 런타임에 데이터를 검사하는 함수가 아닙니다. 신뢰할 수 없는 입력은 `unknown`으로 받아 조건을 좁혀 나가거나 스키마 검증기를 사용합니다.

예를 들어 응답이 { name: null }이라면 as User로 선언한다고 해서 null이 문자열이 되지는 않습니다. 타입 선언은 컴파일러를 설득할 뿐입니다. 반대로 unknown은 아직 어떤 값인지 모른다는 사실을 표현하므로 사용할 수 있는 조건을 직접 확인하도록 유도합니다.

## 외부 값이 들어오는 경계에서

API나 파일처럼 외부 값이 들어오는 경계에서 검증하고, 검증을 마친 데이터는 내부에서 정해진 타입으로 사용하는 구조가 좋습니다. 모든 컴포넌트에서 동일한 검증을 반복하지 않습니다.

[TypeScript: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## 컴파일이 통과했다고 끝은 아니다

Boundra의 소비자 환경을 다룬 [#43](https://github.com/Oddmash/boundra/issues/43)처럼 타입 해석이 맞아도 실제 모듈 로딩이 실패할 수 있습니다. 타입 검사와 런타임 입력 검사는 각자 다른 문제를 해결합니다. 경계에서 실제 값을 확인하면 내부에서는 그 계약에 집중할 수 있습니다.
