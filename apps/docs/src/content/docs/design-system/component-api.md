---
title: "재사용 가능한 컴포넌트의 API"
description: "일관된 이름과 상태를 가진 컴포넌트 설계."
---

같은 역할의 버튼을 여러 화면에서 만들다 보면 크기, 비활성화 상태, 로딩 표현이 달라질 수 있습니다. 공통 컴포넌트는 단순히 마크업을 공유하는 것보다 사용 방식의 일관성이 중요합니다.

## API 설계

```tsx
type ButtonProps = {
  variant?: "solid" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  children: React.ReactNode;
};
```

variant는 시각적 형태, size는 크기, disabled는 동작 가능 여부처럼 서로 다른 개념을 독립적으로 다룹니다. 색이 의미를 가지면 별도의 tone 등 공통 규칙을 검토합니다.

## 추상화의 경계

모든 화면별 차이를 Props로 흡수하면 컴포넌트가 복잡해집니다. 공통 컴포넌트는 기본 행동과 시각 규칙을 제공하고, 화면의 정보 구조와 배치는 제품에서 결정합니다.

사용자 입력, focus, disabled, 오류처럼 상태가 바뀌는 경우를 문서와 테스트에 포함합니다. API 예시로 설명한 타입은 완성된 버튼 구현 전체가 아닙니다.

[Oddmash UI](https://github.com/Oddmash/oddmash-ui) · [React: Passing Props](https://react.dev/learn/passing-props-to-a-component)
