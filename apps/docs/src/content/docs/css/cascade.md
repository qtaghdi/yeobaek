---
title: "CSS를 덮어썼는데 적용되지 않는 이유"
description: "명시도, 선언 순서와 cascade layer의 관계."
---

디자인 시스템을 사용하는 화면에서 스타일을 추가했는데도 기존 여백이 계속 적용될 때가 있습니다. CSS는 단순히 마지막에 작성한 규칙을 선택하는 것이 아닙니다.

## 무엇이 먼저인가

같은 출처의 일반 선언을 기준으로, cascade layer의 우선순위가 명시도보다 먼저 고려됩니다. 명시도가 같으면 일반적으로 뒤에 작성된 규칙이 이깁니다. `!important`는 일반 선언과 다른 우선순위를 가지며 layer의 순서도 반대로 작동합니다.

```css
@layer reset, components, app;

@layer components {
  .button { padding: 12px; }
}

@layer app {
  button { padding: 8px; }
}
```

두 규칙이 모두 해당 버튼에 적용된다면 app layer의 일반 선언이 우선합니다. layer에 속하지 않은 일반 선언은 layer 안 일반 선언보다 우선한다는 점도 중요합니다.

## 설계 기준

라이브러리 스타일을 억지로 큰 명시도로 덮기보다 reset, components, app처럼 의도적인 경계를 설정합니다. 공통 스타일에서 `:where()`를 이용해 명시도를 낮추면 사용자가 덮어쓰기 쉬워집니다.

모든 문제를 layer로 해결할 수는 없습니다. 개발자 도구에서 실제 적용된 규칙, 출처, 중요도와 명시도를 확인합니다.

[MDN: Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction) · [MDN: Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity)
