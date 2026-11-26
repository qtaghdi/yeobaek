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

## 프로젝트에서 이어진 고민

네이티브 Select와 커스텀 Select를 별도로 제공할 때 어떤 구현을 기본 공개 API로 정할지 논의되었다. 기본 이름의 계약을 변경하면 기존 소비자의 사용 방식과 동작이 바뀔 수 있다.

### 검증 기준

selected, active, focus를 별개의 상태로 정의하고 값 변경 이벤트와 키보드 조작을 문서화한다. 기존 공개 이름을 유지하는 호환 별칭이 필요하다면 제거 시점과 마이그레이션을 명시한다.

[관련 이슈 · oddmash-ui #65](https://github.com/Oddmash/oddmash-ui/issues/65)

## Select의 값, 활성 항목, 포커스

[Oddmash UI #121](https://github.com/Oddmash/oddmash-ui/issues/121)에서는 선택 목록의 스크롤과 키보드 이동을 함께 다뤘다. 커스텀 Select는 화면에 보이는 값만으로 동작을 정의할 수 없다.

| 상태 | 의미 |
| --- | --- |
| selected | 사용자가 확정한 값 |
| active | 목록 안에서 이동하며 탐색하는 항목 |
| focus | 실제 키보드 입력을 받는 DOM 요소 |

방향키로 탐색하다 Escape로 닫았을 때 선택값을 유지할지, Enter에서 확정할지에 따라 세 상태가 서로 다를 수 있다. 포커스만 색으로 표현하는 것은 충분하지 않으며, 목록을 닫을 때 키보드 위치도 예측 가능해야 한다.

네이티브 select를 사용하면 브라우저가 많은 동작을 제공한다. 커스텀 컴포넌트로 바꾸는 이유가 단순한 외형이라면 그만큼 새로 책임질 동작이 늘어난다는 점부터 비교한다.
