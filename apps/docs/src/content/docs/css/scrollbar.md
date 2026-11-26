---
title: "모달을 열 때 화면이 옆으로 밀리는 이유"
description: "스크롤 잠금과 레이아웃 폭의 관계."
---

스크롤 가능한 페이지에 모달을 열면 배경 스크롤을 막는 일이 생깁니다. 그런데 페이지가 옆으로 살짝 움직이면 사용자는 모달과 관계없는 콘텐츠의 위치도 바뀌었다고 느낍니다.

## 원인

전통적인 스크롤바는 콘텐츠 영역의 일부 폭을 차지합니다. 스크롤 잠금으로 스크롤바가 사라지면 사용 가능한 폭이 달라집니다. `100vw`로 지정한 래퍼가 일반적인 사용 가능한 콘텐츠 폭과 다를 수 있는 것도 원인입니다.

## 개선

```css
html {
  scrollbar-gutter: stable;
}
main {
  inline-size: 100%;
}
```

`scrollbar-gutter: stable`은 고전적인 스크롤바가 차지할 공간을 안정적으로 유지하는 방법입니다. 오버레이 방식의 스크롤바는 별도의 공간을 차지하지 않을 수 있습니다.

스크롤 잠금 자체도 올바른 요소에 적용하고 모달 안의 콘텐츠가 넘칠 때 별도 스크롤이 가능한지 확인합니다. 고정 헤더와 sticky 요소까지 포함해 모달을 열기 전후의 폭을 비교하면 원인을 좁히기 쉽습니다.

[MDN: scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter)
