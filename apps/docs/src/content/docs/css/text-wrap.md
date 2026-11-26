---
title: "한국어 줄바꿈을 다루는 방법"
description: "줄바꿈, 단어 보존, 실제 너비와 폰트의 관계."
---

한국어 문장이 카드 너비에 맞게 줄바꿈되더라도 읽기 좋은 경계에서 나뉘는 것은 아닙니다. 단어가 끊기거나 한 줄에 몇 글자만 남으면 정보의 전달이 부자연스러워집니다.

## CSS로 할 수 있는 범위

```css
.heading {
  word-break: keep-all;
  overflow-wrap: anywhere;
  text-wrap: balance;
}
```

`keep-all`은 CJK 텍스트의 줄바꿈 기회를 줄이고, `overflow-wrap`은 긴 문자열이 넘치는 상황에 대응합니다. `text-wrap: balance`는 여러 줄의 균형을 돕습니다. 그러나 모든 언어의 의미 단위까지 판단해 주지는 않습니다.

## 글자 수 대신 실제 폭

줄 길이를 글자 수로만 계산하면 글꼴 크기, 가변 폭 글꼴, 혼합 언어와 컨테이너 변화가 반영되지 않습니다. 폭을 측정하는 라이브러리를 만든다면 사용 가능한 너비와 실제 글꼴을 고려해야 합니다. 폰트가 늦게 로드되거나 영역 크기가 바뀌는 경우도 처리합니다.

이 문제를 다루기 위해 만든 공개 프로젝트가 [줄이야(Juliya)](https://github.com/Oddmash/juliya)입니다. 모든 문장에 별도 라이브러리가 필요한 것은 아닙니다. 먼저 CSS로 해결 가능한지 확인하는 것이 좋습니다.

[MDN: word-break](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/word-break) · [MDN: text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap)

## 프로젝트에서 이어진 고민

한국어 의미 단위를 유지하는 라이브러리 Juliya에서는 정수로 반올림한 clientWidth와 실제 브라우저의 소수점 너비 차이 때문에 CSS에서는 들어가는 문장이 한 줄 더 밀리는 문제가 기록되었다. 글꼴 측정도 중요하다. 이슈 #3에서는 macOS 한국어 serif의 DOM 너비와 언어 정보가 없는 Canvas 측정값이 달랐다.

### 검증 기준

같은 글꼴과 같은 실제 너비에서 CSS와 라이브러리 결과를 비교한다. 문단 전체에 강제 개행을 넣기보다 인라인 강조, 링크, 명시적 줄바꿈을 보존하고 지원하는 범위에서만 적용한다. 글꼴 로딩 전후와 320px 화면을 포함한다.

[관련 이슈 · juliya #1](https://github.com/Oddmash/juliya/issues/1)

## 같은 폭을 비교하지 않으면 측정도 틀린다

Juliya의 [이슈 #3](https://github.com/Oddmash/juliya/issues/3)에서는 macOS의 한국어 serif 문장을 DOM에서 측정했을 때 781.33px, 언어 정보가 없는 Canvas에서는 746.83px이 나왔다. 약 34px 차이는 줄바꿈 위치를 바꾸기에 충분하다.

측정값이 다를 때 무조건 보정값을 더하는 것은 다른 글꼴이나 운영체제에서 또 다른 오차를 만들 수 있다. 먼저 측정 대상의 font, lang, letter-spacing, 실제 콘텐츠 폭이 동일한지 확인해야 한다. CSS와 비교할 때에도 동일한 문자열, 폰트와 영역 안에서 비교해야 의미가 있다.

| 접근 | 장점 | 한계 |
| --- | --- | --- |
| CSS keep-all | 별도 스크립트 없이 동작 | 의미 경계를 고르지 않음 |
| 글자 수 기준 | 구현이 간단함 | 혼합 언어와 가변 폭 글꼴을 반영하지 못함 |
| 실제 폭 기반 | 현재 레이아웃을 고려 | 측정 정확성, 폰트와 크기 변화 관리를 요구 |

여백에서도 Juliya를 제목과 짧은 문장에 제한해 적용한다. 본문에 코드나 링크가 섞이면 브라우저의 기본 줄바꿈이 더 안전한 경우가 있다.
