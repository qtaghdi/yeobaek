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

저장소 API는 문자열 기반입니다. 객체는 직렬화하고, 읽을 때 파싱 실패나 오래된 형식을 고려합니다. 서버 렌더링 중에는 브라우저 저장소에 직접 접근할 수 없습니다.

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

사용자 환경에 따라 저장이 제한될 수 있으므로 실패했을 때의 동작도 정합니다. 민감한 정보는 단순 편의성 때문에 저장하지 않습니다. 저장소의 지속 시간과 접근 범위가 보안 요구사항을 대신하지는 않습니다.

[MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

localStorage에 JSON을 넣더라도 읽어온 값이 내가 작성한 최신 타입을 만족한다는 보장은 없습니다. 이전 버전의 설정이 남아 있을 수도 있고 사용자가 저장을 제한했을 수도 있습니다. 그래서 읽는 함수에는 정상값뿐 아니라 읽지 못했을 때 사용할 기본값도 필요합니다.

## 필요 없는 데이터까지 저장해야 할까?

[Interaction Inspector #13](https://github.com/Oddmash/interaction-inspector/issues/13)의 이벤트 타임라인처럼 분석에 필요한 정보만 남기는 편이 좋습니다. 저장할 수 있다는 것과 저장해야 한다는 것은 다릅니다. 특히 민감한 값은 환경설정과 같은 방식으로 취급하지 않습니다.
