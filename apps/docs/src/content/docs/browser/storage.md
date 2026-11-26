---
title: "localStorage와 sessionStorage의 차이"
description: "브라우저 저장소의 생명주기와 선택 기준."
---

테마나 필터를 저장하는 방법과 로그인 상태를 다루는 방법을 동일하게 생각하면 문제가 생깁니다. 저장하는 정보의 성격과 유지 범위를 먼저 정합니다.

## 범위가 다르다

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
