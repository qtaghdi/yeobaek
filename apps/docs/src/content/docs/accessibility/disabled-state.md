---
title: "비활성화와 접근성 상태"
description: "disabled, aria-disabled와 inert가 담당하는 동작."
---

버튼을 흐리게 표시하는 것만으로는 비활성화 상태가 되지 않습니다. 외형, 동작, 보조 기술에 전달되는 상태를 함께 맞춰야 합니다.

## 구분하기

| 방법 | 실제 의미 |
| --- | --- |
| `disabled` | 지원하는 폼 컨트롤을 비활성화하고 일반 Tab 순서에서 제외 |
| `aria-disabled="true"` | 비활성이라는 의미를 전달하며 클릭이나 포커스를 자동으로 막지 않음 |
| `inert` | 영역과 그 하위 요소의 상호작용 및 포커스 탐색을 차단 |

`aria-disabled`를 선택한다면 이벤트 처리에서 실행을 별도로 막고, 동작 불가능 상태가 시각적으로도 명확해야 합니다.

## 적용 기준

유효하지 않은 폼을 제출할 수 없도록 막는 경우 보통 네이티브 disabled가 간단합니다. 사용자가 특정 메뉴의 존재와 이용 불가능한 이유를 알아야 할 때에는 포커스를 유지하는 접근을 고려할 수 있습니다.

모달 뒤쪽 영역이나 일시적으로 숨긴 화면에서는 개별 버튼을 하나씩 비활성화하기보다 영역 전체가 상호작용 대상인지 판단합니다.

[MDN: disabled](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled) · [MDN: inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)
