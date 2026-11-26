---
title: "요소 크기와 글꼴의 변화를 관찰하기"
description: "ResizeObserver와 폰트 로딩을 이용한 레이아웃 갱신."
---

뷰포트 크기를 변경하지 않더라도 사이드바를 열거나 부모 영역이 좁아지면 내부 텍스트의 줄바꿈이 달라집니다. 폰트가 로드되면 동일한 문자열의 폭도 변할 수 있습니다.

## 관찰할 대상을 정하기

`window.resize`는 창 크기 변화를 알려줍니다. 특정 요소의 크기가 중요한 예제에서는 ResizeObserver로 그 요소를 관찰하는 것이 적절합니다.

```ts
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log(entry.contentRect.width);
  }
});
observer.observe(element);

const dispose = () => observer.disconnect();
```

폰트 로딩이 측정 결과에 영향을 준다면 `document.fonts.ready` 이후 재측정하는 방법도 고려합니다.

## 주의할 점

관찰 콜백에서 같은 요소의 너비를 반복적으로 바꾸면 다시 관찰이 발생할 수 있습니다. 측정과 변경을 분리하고 실제로 결과가 달라졌을 때만 적용합니다. 컴포넌트가 사라지면 관찰도 해제합니다.

[MDN: ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) · [MDN: FontFaceSet.ready](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready)
