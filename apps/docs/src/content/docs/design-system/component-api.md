---
title: "재사용 가능한 컴포넌트의 API"
description: "Oddmash UI의 Select를 사례로 공개 API, 선택·탐색 상태, 네이티브 폼 계약과 오버레이를 설계합니다."
---

공통 컴포넌트의 가치는 여러 화면에서 같은 모양을 보여 주는 것만으로 생기지 않습니다. 비슷한 사용 방식과 일관된 동작을 보장하고, 소비자가 내부 구현을 모르더라도 원하는 결과를 만들 수 있어야 합니다.

[Oddmash UI #65](https://github.com/Oddmash/oddmash-ui/issues/65)에서는 네이티브 Select와 커스텀 SelectDropdown이라는 두 가지 API를 하나의 대표 Select로 정리했습니다. 단순히 이름을 바꾸는 작업이 아니라 기존 소비자가 의존하던 입력, 이벤트, DOM과 접근성 계약을 다시 정의하는 일이었습니다.

## API 설계

Button의 경우 variant는 외형, size는 크기, disabled는 조작 가능 여부를 나타냅니다. 이들을 독립적인 필드로 나누면 새로운 화면의 조합을 지원하기 위해 별도의 컴포넌트를 추가할 필요가 줄어듭니다.

Select는 버튼보다 많은 상태를 담당합니다. 실제 Oddmash UI에서 공개하는 주요 선택 API의 일부를 단순화하면 다음과 같습니다.

```tsx
type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectionProps = {
  options: readonly Option[];
  value?: string;
  defaultValue?: string;
  name?: string;
  onValueChange?: (value: string) => void;
};
```

실제 공개 타입에는 기본 버튼 속성, form, placeholder 등의 계약도 포함됩니다. value는 확정된 선택값을 외부가 제어할 때 사용하고, defaultValue는 컴포넌트가 관리할 초기값입니다. options의 value는 선택을 식별하는 키이므로 label과 다를 수 있습니다.

이 구조의 장점은 화면에 보이는 라벨과 서버에 보낼 값을 함께 취급하지 않는다는 점입니다. 예를 들어 화면에는 '진행 중'이 표시되지만 서버는 `in-progress`라는 식별자를 사용할 수 있습니다.

<span id="프로젝트에서-이어진-고민"></span>

## Select의 값, 활성 항목, 포커스

선택값과 현재 탐색하고 있는 항목은 서로 같지 않을 수 있습니다. 다음과 같이 이미 B를 선택한 사용자가 목록을 열고 C까지 이동했지만 Escape로 취소했다고 가정합시다.

| 입력 | 선택값 | 활성 항목 | DOM 포커스 |
| --- | --- | --- | --- |
| 목록 열기 | B | B | 트리거 |
| ArrowDown | B | C | 트리거 |
| Escape | B | 없음 | 트리거 |
| 다시 열고 C로 이동 | B | C | 트리거 |
| Enter | C | 없음 | 트리거 |

실제 구현은 버튼에 combobox 역할을 제공하고 열린 목록의 활성 항목을 aria-activedescendant로 연결합니다. 목록의 옵션은 role=option 및 aria-selected를 가지고, keyboard active와 pointer hover의 시각 상태도 구분합니다.

DOM 포커스가 항상 현재 강조된 옵션으로 이동하는 구조는 아닙니다. 따라서 옵션을 강조했다고 선택값을 바로 바꾸면 Escape가 취소로 동작하지 않고, 포커스를 색 하나로만 표현하면 마우스와 키보드의 상태가 섞이게 됩니다.

### 상태를 만드는 값과 파생해서 읽는 값

선택된 옵션의 인덱스는 options와 현재 값으로부터 계산할 수 있습니다. 선택값과 인덱스를 둘 다 state에 저장하면 options가 변경될 때 동기화 문제가 생길 수 있습니다.

```tsx
const [internalValue, setInternalValue] = useState(defaultValue);
const selectedValue = value ?? internalValue;
const selectedIndex = options.findIndex(
  (option) => option.value === selectedValue,
);
const enabledIndexes = options.flatMap(
  (option, index) => option.disabled ? [] : [index],
);
```

위 코드는 실제 구조를 설명하기 위해 축약한 예제입니다. 활성 인덱스는 사용자가 이동할 때 변경되는 값이므로 별도로 관리하되, 현재 options에서 여전히 선택 가능한지 확인해야 합니다. 포인터로 이동하는 동안 키보드 강조 표시까지 함께 바뀌지 않도록 입력의 출처도 구분합니다.

## 오버레이의 크기와 스크롤

[#121](https://github.com/Oddmash/oddmash-ui/issues/121)과 [PR #122](https://github.com/Oddmash/oddmash-ui/pull/122)에서는 목록의 포인터 상태와 스크롤 격리를 함께 다뤘습니다.

목록 안에서 끝까지 스크롤하고 다시 휠을 굴리면 부모 문서로 스크롤이 이어질 수 있습니다. 일반적인 목록에서는 괜찮지만 열린 Select에서 옵션을 탐색할 때 목록이 이동하거나 트리거가 화면 밖으로 나가면 사용자의 흐름이 끊깁니다.

```css
.options {
  max-block-size: 12rem;
  overflow: auto;
  overscroll-behavior: contain;
}
```

CSS만으로 충분하지 않은 경우 실제 목록의 scrollTop, clientHeight, scrollHeight를 기준으로 경계에서의 입력을 처리할 수 있습니다. Oddmash UI의 구현은 목록 경계의 휠 전파를 막고 열린 상태에서만 이벤트를 연결합니다.

또 다른 문제는 선택 목록이 트리거 아래로 열릴 공간이 부족할 때입니다. 현재 구현은 트리거의 bounding box와 visualViewport의 가용 영역을 비교해 위·아래 배치를 정하고, Popover API가 지원되는 환경에서 위치를 갱신합니다. API를 쓸 수 없을 때에는 기본 목록 배치를 유지합니다. 스크롤 또는 resize 리스너와 ResizeObserver도 목록을 닫을 때 정리합니다.

이처럼 레이어, 위치, 스크롤은 Select의 외형이 아니라 사용 가능성을 지키기 위한 책임입니다.

## 네이티브 폼과 호환성

네이티브 select는 브라우저가 폼 값, 다중 선택, optgroup, 검증, 키보드 등 여러 동작을 제공합니다. 커스텀 Select는 이 계약을 그대로 얻지 못합니다.

현행 Oddmash UI는 단일 선택 컴포넌트의 응답을 onValueChange로 제공하고, name이 주어지면 선택된 값을 hidden input으로 제출합니다. 비제어형 폼의 reset에서는 defaultValue로 돌아가고, 외부 제어형 값은 소비자가 결정합니다. hidden input을 사용한다고 네이티브 select의 모든 제약 검증과 다중 선택 계약까지 얻는 것은 아닙니다.

[PR #66](https://github.com/Oddmash/oddmash-ui/pull/66)은 기존 이름 SelectDropdown을 호환 별칭으로 남기고 Select를 대표 API로 통합했습니다. 기존 native children과 onChange를 사용하던 Select 소비자는 options와 onValueChange로 변경해야 하는 breaking change가 있었으므로 마이그레이션을 명시할 필요가 있었습니다.

## 추상화의 경계

디자인 시스템에서 모든 UI를 커스텀으로 만들 필요는 없습니다. 네이티브 동작을 바꿀 이유가 없는 기본 폼에는 select를 쓸 수 있습니다. 공용 컴포넌트는 디자인 일관성뿐 아니라 접근성 동작과 소비자의 공개 계약을 일관되게 유지할 책임을 가져야 합니다.

| 검증 | 확인할 계약 |
| --- | --- |
| 방향키·Home·End | 활성 항목 이동, 비활성 옵션 제외 |
| Escape | 선택값 변경 없이 닫힘 |
| Enter·Space | 현재 옵션을 확정 또는 목록 열기 |
| 폼 제출·reset | 확정 값 제출, 제어권에 따른 초기화 |
| 옵션 목록 스크롤 | 부모 문서의 예상치 못한 이동 방지 |
| 좁은 화면·viewport 변화 | 목록이 트리거에 맞고 화면에 들어옴 |
| 이전 import 이름 | 지원하기로 한 별칭과 타입 유지 |

## 참고

- [Oddmash UI #65](https://github.com/Oddmash/oddmash-ui/issues/65) · [PR #66](https://github.com/Oddmash/oddmash-ui/pull/66) · [PR #122](https://github.com/Oddmash/oddmash-ui/pull/122)
- [실제 Select 구현](https://github.com/Oddmash/oddmash-ui/blob/25ecce212b4c3a2a2100d6190a191722087135cb/src/select-dropdown.tsx) · [공개 export](https://github.com/Oddmash/oddmash-ui/blob/25ecce212b4c3a2a2100d6190a191722087135cb/src/select.tsx)
- [React: Passing Props](https://react.dev/learn/passing-props-to-a-component) · [입력 상태는 누가 관리해야 할까?](../../react/controlled-input/)
