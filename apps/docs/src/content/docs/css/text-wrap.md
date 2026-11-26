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
