---
title: "localStorage와 sessionStorage의 차이"
description: "브라우저 저장소의 생명주기와 선택 기준."
---

테마 설정은 새로고침해도 남아 있으면 좋겠습니다. 그런데 검색창에 임시로 입력하던 값까지 다음날 그대로 나타나면 오히려 불편할 수 있습니다. 둘 다 문자열이라고 같은 저장소에 넣어야 하는 건 아닙니다.

## 상태를 얼마나 오래 유지할 것인가

| 방식 | 일반적인 유지 범위 |
| --- | --- |
| React state | 컴포넌트 생명주기 |
| sessionStorage | 출처 및 탭의 페이지 세션 |
| localStorage | 같은 출처에서 브라우저 세션을 넘어 유지 |
| URL | 주소에 명시된 상태 |

`localStorage`와 `sessionStorage`는 모두 문자열을 저장합니다. 객체를 JSON으로 변환해서 넣을 수 있지만 읽을 때도 정상적으로 변환된다는 보장은 없습니다. 이전 버전의 설정이 남아 있거나 브라우저가 저장을 제한할 수도 있습니다.

예를 들어 화면 밀도를 저장하는 기능을 만들었다고 가정해봅시다.

```ts
const readDensity = () => {
  try {
    const value = localStorage.getItem("density");
    return value === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
};
```

위 함수는 저장된 값이 없거나 읽을 수 없어도 기본 화면 밀도를 반환합니다. 서버 렌더링 중에는 브라우저 저장소에 직접 접근할 수 없으므로 실행 환경도 구분해야 합니다. 저장소를 사용하지 못한다는 이유만으로 화면 전체가 실패할 필요는 없으니까요.

[MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## 필요 없는 데이터까지 저장해야 할까?

[Interaction Inspector #13](https://github.com/Oddmash/interaction-inspector/issues/13)의 이벤트 타임라인처럼 분석에 필요한 정보만 남기는 편이 좋습니다. 저장할 수 있다는 것과 저장해야 한다는 것은 다릅니다. 특히 민감한 값은 환경설정과 같은 방식으로 취급하지 않습니다.
