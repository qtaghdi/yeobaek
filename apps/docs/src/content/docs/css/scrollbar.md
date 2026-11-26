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

## 프로젝트에서 이어진 고민

320px 브라우저에서 클래식 스크롤바가 15px 공간을 차지할 때 Toast의 배치가 한쪽으로 치우치는 사례가 기록되어 있다. 뷰포트 너비와 실제 콘텐츠 영역 너비를 동일하게 취급하면 이런 차이를 놓친다.

### 검증 기준

window.innerWidth, document.documentElement.clientWidth, 실제 요소의 bounding box를 구분해 측정한다. 고정된 100vw 대신 가능한 영역을 기준으로 배치하고, 본문 스크롤 잠금 전후의 정렬을 비교한다.

[관련 이슈 · oddmash-ui #81](https://github.com/Oddmash/oddmash-ui/issues/81)

## 320px이 항상 320px은 아니다

[Oddmash UI #81](https://github.com/Oddmash/oddmash-ui/issues/81)에서는 320px 화면에 15px 클래식 스크롤바가 나타날 때 문서의 사용 가능한 폭이 305px이었다. 288px Toast가 좌우 1px와 16px로 배치되면 같은 중심으로 보이지 않는다.

```css
:root {
  scrollbar-gutter: stable;
}
.toast-region {
  max-inline-size: calc(100% - 2rem);
  margin-inline: auto;
}
```

scrollbar-gutter는 스크롤바가 나타날 때 공간이 달라지는 상황에 대응하는 선택지다. 하지만 실제 Toast가 어느 containing block에 배치되는지 확인하지 않고 두 속성을 추가하는 것만으로 모든 환경이 해결되지는 않는다. 클래식 스크롤바와 오버레이 스크롤바, 잠금 전후를 나눠서 확인해야 한다.
