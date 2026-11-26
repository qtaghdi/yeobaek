---
title: "디자인 토큰은 왜 필요할까?"
description: "색상과 간격을 의미 기반으로 관리하는 이유."
---

모든 화면에서 버튼 배경을 직접 색상 값으로 작성하면 테마나 브랜드를 바꿀 때 수정해야 할 위치가 늘어납니다. 디자인 토큰은 디자인 결정을 공유 가능한 이름으로 관리하는 수단입니다.

## 원시값과 의미

```css
:root {
  --gray-900: #292823;
  --gray-100: #f8f6ef;
  --text-primary: var(--gray-900);
  --surface-default: var(--gray-100);
}
[data-theme="dark"] {
  --text-primary: var(--gray-100);
  --surface-default: var(--gray-900);
}
```

컴포넌트는 현재 테마의 구체적인 색보다 `--text-primary`와 같은 역할을 사용합니다. 색상뿐 아니라 간격, 크기, 테두리, 모션도 일관된 역할로 관리할 수 있습니다.

## 어떤 경우에 토큰화할까

여러 곳에서 동일한 디자인 결정을 공유하거나 일관된 운영이 필요한 경우 토큰으로 만듭니다. 단일 화면의 특별한 값까지 무조건 공통 토큰으로 만들면 오히려 이름만 늘어납니다.

[Oddmash UI](https://github.com/Oddmash/oddmash-ui) · [MDN: CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties)
