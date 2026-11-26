---
title: "TypeScript 타입은 런타임에도 안전할까?"
description: "타입 선언과 실제 API 응답 검증의 차이."
---

TypeScript를 사용하면 컴파일 시점에 값의 형태를 확인할 수 있습니다. 그러나 외부 서버에서 받은 JSON이 선언한 타입을 따르는지는 별개의 문제입니다.

## 타입 단언의 한계

```ts
type User = { name: string };

const parseUser = (value: unknown): User | null => {
  if (typeof value !== "object" || value === null) return null;
  if (!("name" in value) || typeof value.name !== "string") return null;
  return { name: value.name };
};
```

`as User`는 컴파일러에게 타입을 알려주는 표현이지 런타임에 데이터를 검사하는 함수가 아닙니다. 신뢰할 수 없는 입력은 `unknown`으로 받아 조건을 좁혀 나가거나 스키마 검증기를 사용합니다.

## 검증의 위치

API나 파일처럼 외부 값이 들어오는 경계에서 검증하고, 검증을 마친 데이터는 내부에서 정해진 타입으로 사용하는 구조가 좋습니다. 모든 컴포넌트에서 동일한 검증을 반복하지 않습니다.

[TypeScript: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## 프로젝트에서 이어진 고민

실제 Next.js와 Vite 소비자에서 alias 해석 및 공개 계약 호환성을 검증하는 일이 논의되었다. TypeScript 컴파일 성공만으로 런타임 모듈 해석과 설정 파일의 실제 값이 올바르다는 것을 보장할 수 없다는 사례다.

### 검증 기준

외부 입력은 런타임에서 검사하고 타입 선언에만 의존하지 않는다. 타입이 통과하는 가짜 예제 대신 실제 소비자 프로젝트에서 import와 build를 실행한다.

[관련 이슈 · boundra #43](https://github.com/Oddmash/boundra/issues/43)
