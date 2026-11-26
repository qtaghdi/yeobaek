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

## 프로젝트에서 이어진 고민

이벤트 타임라인을 내보낼 때 모든 페이지의 내용을 수집할 필요는 없었다. 필요한 이벤트 유형, 시간, 태그처럼 분석에 필요한 정보만 선택하는 것이 중요하다. 저장 공간도 같은 기준을 적용할 수 있다.

### 검증 기준

단순 사용자 환경설정은 로컬 저장을 검토하되 임시 상태와 구분한다. 새 탭, 새로고침, 저장 실패, 잘못된 기존 값을 읽었을 때의 초기값을 확인한다. 민감한 페이지 콘텐츠는 저장하지 않는다.

[관련 이슈 · interaction-inspector #13](https://github.com/Oddmash/interaction-inspector/issues/13)
