---
title: "요소 크기와 글꼴의 변화를 관찰하기"
description: "ResizeObserver의 전달 루프, 글꼴 변경과 측정 결과의 갱신을 분리하는 방법."
---

## 창 크기는 그대로인데 글이 다시 줄바꿈됐다

창 크기가 같아도 사이드바를 펼치거나 그리드의 열 수가 바뀌면 텍스트의 실제 콘텐츠 폭은 달라집니다. 글꼴이 늦게 로드되면 폭이 같아도 문자열의 측정값이 달라질 수 있습니다.

Juliya처럼 DOM에서 측정하고 다시 렌더링하는 코드는 언제 계산해야 하는지를 정하는 것이 계산 과정만큼 중요합니다.

## 관찰할 대상을 정하기

`window.resize`는 뷰포트에 관한 이벤트입니다. 내부 영역의 크기가 입력이라면 ResizeObserver를 사용해 해당 요소를 관찰할 수 있습니다.

```ts
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log(entry.contentRect.width);
  }
});

observer.observe(element);
```

ResizeObserver는 등록한 요소의 관찰된 박스 크기 변화에 대응합니다. CSS의 모든 스타일 변화나 문자열 변경을 알려주는 도구는 아닙니다. 텍스트나 설정이 변경된 경우는 별도의 동기화 경로를 사용하고, 글꼴 로딩은 FontFaceSet의 신호를 사용합니다.

<span id="주의할-점"></span>
<span id="프로젝트에서-이어진-고민"></span>

## 측정하는 코드가 레이아웃을 바꿀 때

Juliya [#6](https://github.com/Oddmash/juliya/issues/6)에서는 375px의 WebKit 환경에서 ResizeObserver의 전달 루프 관련 오류가 발견되었습니다. 줄바꿈을 그리는 과정에서 관찰하고 있던 요소의 높이가 변할 수 있기 때문입니다.

```text
요소 폭 변경
  → ResizeObserver 통지
  → 줄바꿈 계산
  → 개행 추가 또는 제거
  → 요소 높이 변경
  → 다시 ResizeObserver 통지
```

같은 콜백 안에서 요소의 크기에 영향을 주는 렌더링을 반복하면 브라우저의 관찰 전달 단계에 부담을 줄 수 있습니다. 이 경우 더 늦게 실행하는 것뿐 아니라 무엇이 실제 계산에 필요한 입력인지를 구분해야 합니다.

실제 Juliya의 DOM adapter는 ResizeObserver가 제공한 contentRect.width를 읽은 뒤 requestAnimationFrame으로 렌더링 계산을 예약합니다. 새로운 통지가 오면 예약한 프레임을 취소하고 최신 값으로 대체합니다.

## 관찰의 입력과 결과 구분하기

줄바꿈의 입력은 가용 폭, 텍스트, 폰트와 설정입니다. 결과 중 하나는 줄 수와 높이입니다. 높이만 달라지고 실제 입력이 동일하면 이전 계산을 반복할 필요가 없을 수 있습니다.

[#121](https://github.com/Oddmash/juliya/issues/121)은 이 중복 계산을 줄이는 작업입니다. 현행 코드는 평문 adapter의 observer 경로에 한해 이전 폭과 측정 함수의 동일성을 확인합니다. 명시적 refresh, options.update, 글꼴 신호는 그 비교를 통과하지 않더라도 의도적으로 다시 계산할 수 있습니다. 인라인 adapter는 같은 최적화를 무조건 사용하지 않습니다.

다음은 폭, 폰트 세대 및 명시적 갱신을 구분하는 설명용 TypeScript 모델입니다.

```ts
type Layout = { width: number; fontVersion: number };

let previous: Layout | undefined;
let frame: number | undefined;

const schedule = (layout: Layout, force = false) => {
  if (frame !== undefined) cancelAnimationFrame(frame);

  frame = requestAnimationFrame(() => {
    frame = undefined;
    const changed =
      previous?.width !== layout.width ||
      previous?.fontVersion !== layout.fontVersion;

    if (!force && !changed) return;
    updateLayout(layout);
    previous = layout;
  });
};
```

여기서 사용한 fontVersion은 설명을 위한 식별자입니다. 실제 구현은 글꼴 설정과 언어의 signature 및 측정 함수 관리를 사용합니다. 텍스트와 설정의 변경도 별도로 감지해야 합니다. 예약된 작업을 없애는 것과 이미 완료한 계산을 생략하는 것은 다른 최적화입니다.

## 최초 렌더링과 폰트 로딩

폰트의 실제 geometry가 결정되기 전에는 측정 결과가 완전하지 않을 수 있습니다. CSS로 먼저 읽을 수 있는 글을 표시하고, 실제 콘텐츠 폭과 폰트가 준비되면 다시 계산하는 접근을 사용합니다.

- `document.fonts.ready`: 현재 문서의 폰트 준비 상태를 기다리는 신호입니다.
- `loadingdone`: 이후 추가로 로딩된 폰트의 변화에 대응합니다.
- ResizeObserver의 최초 통지: 콘텐츠 박스의 정확한 폭을 확보합니다.
- 명시적인 refresh: 외부에서 이미 알고 있는 값이나 설정의 변경을 반영합니다.

Juliya [#13](https://github.com/Oddmash/juliya/issues/13)에는 좁은 문서에서 첫 계산 결과가 잠시 세 줄이었다가 최초 관찰 이후 두 줄이 되는 문제가 기록되어 있습니다. 초기 CSS fallback, 정수 측정과 실제 소수점 폭, 렌더링 시점을 함께 확인해야 하는 이유입니다.

## 해제와 예외 처리

컴포넌트가 사라진 뒤에도 예약된 프레임과 이벤트 리스너가 남아 있다면 오래된 요소를 변경할 수 있습니다. observer.disconnect만으로 모든 작업이 정리되는 것은 아닙니다.

```ts
const dispose = () => {
  observer.disconnect();
  if (frame !== undefined) cancelAnimationFrame(frame);
  document.fonts.removeEventListener("loadingdone", onFonts);
};
```

실제 adapter는 resize 이벤트, 예약한 frame, 폰트 이벤트를 해제하고 active 상태를 검사해 이미 시작된 Promise가 늦게 완료되는 경우도 처리합니다.

## 무엇이 바뀌었을 때 다시 계산해야 할까?

폭이 줄었다면 새 폭을 측정해야 하지만 높이만 변했다면 평문 줄바꿈을 다시 계산할 필요가 없는 경우도 있습니다. 반대로 폰트가 로드되면 컨테이너 폭이 그대로여도 글자 너비가 달라집니다. 이때 폭만 비교해서 작업을 생략하면 잘못된 결과가 남습니다.

연속으로 크기가 변할 때 이전 예약을 계속 실행하기보다 마지막 상태를 반영하고, 사용자가 명시적으로 refresh했다면 동일한 관찰값이라도 다시 계산할 수 있어야 합니다. 핵심은 관찰한 값의 변화와 계산 결과의 유효성을 같은 문제로 취급하지 않는 것입니다.

## 참고 자료

- [Juliya #6](https://github.com/Oddmash/juliya/issues/6), [#13](https://github.com/Oddmash/juliya/issues/13), [#121](https://github.com/Oddmash/juliya/issues/121)
- [요소 관찰 구현](https://github.com/Oddmash/juliya/blob/86e2f6455ec84e6936d05eabd8b7fbd639f55c9e/src/dom/observe-element.ts) · [평문 adapter](https://github.com/Oddmash/juliya/blob/86e2f6455ec84e6936d05eabd8b7fbd639f55c9e/src/dom/observe.ts)
- [MDN: ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) · [MDN: FontFaceSet.ready](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready)
- [한국어 줄바꿈을 다루는 방법](../../css/text-wrap/)
