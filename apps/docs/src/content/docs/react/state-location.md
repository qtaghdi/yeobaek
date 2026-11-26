---
title: "상태는 어디에 두는 것이 좋을까?"
description: "로컬 상태, 공유 상태, URL 및 서버 상태 선택."
---

검색어를 모든 페이지에서 쓸 수 있다는 이유로 전역 저장소에 넣으면 관리 범위만 커질 수 있습니다. 상태를 두는 위치는 소유권과 사용자의 이동 방식에 따라 정합니다.

## 어떤 상태인가

| 상황 | 우선 고려할 위치 |
| --- | --- |
| 모달 열림, 독립적인 폼 | 컴포넌트 상태 |
| 함께 사용하는 여러 하위 요소 | 공통 부모 |
| 여러 화면에서 유지할 UI 설정 | 공유 상태 |
| 검색, 정렬, 페이지 번호 | URL |
| 서버 데이터와 갱신 상태 | 서버 상태 캐시 |

예를 들어 대시보드 필터를 URL에 넣으면 새로고침, 링크 복사, 뒤로 가기의 의미를 일관되게 유지할 수 있습니다.

## URL 예제

```ts
const params = new URLSearchParams(location.search);
const sort = params.get("sort") ?? "latest";
params.set("sort", "oldest");
```

실제 라우터에서 URL을 변경할 때는 검색 기록을 남길지, 현재 기록을 대체할지도 결정합니다. 민감하거나 일시적인 입력을 URL에 넣지 않습니다. 복사 가능한 값인지부터 생각합니다.

[MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) · [React: Sharing State](https://react.dev/learn/sharing-state-between-components)

## 프로젝트에서 이어진 고민

여러 문서 사이트의 탐색 UI를 공유하면서도 실제 경로 결정은 각 사이트가 소유해야 한다는 요구가 있었다. 모든 상태를 공통 컴포넌트로 옮기면 사이트별 URL과 탐색 정책까지 묶이게 된다.

### 검증 기준

현재 경로는 라우터, 임시 메뉴 열림 상태는 메뉴, 실제 원격 데이터는 서버 상태 캐시가 관리하도록 경계를 잡는다. 동일한 값을 여러 위치에 복제하지 않는다.

[관련 이슈 · oddmash-ui #94](https://github.com/Oddmash/oddmash-ui/issues/94)
