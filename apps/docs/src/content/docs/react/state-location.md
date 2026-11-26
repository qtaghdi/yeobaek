---
title: "상태는 어디에 두는 것이 좋을까?"
description: "상태의 소유권과 데이터 경계, Vertactics의 드래그 미리보기와 실제 변경 이력을 사례로 살펴봅니다."
---

상태를 어디에 저장할지 결정할 때 전역 상태 라이브러리부터 고를 필요는 없습니다. 먼저 무엇을 표현하는 값인지, 누가 변경하는지, 언제까지 유지해야 하는지 확인합니다.

## 어떤 상태인가

| 상황 | 우선 고려할 위치 |
| --- | --- |
| 모달 열림, 독립적인 폼 | 컴포넌트 상태 |
| 함께 사용하는 여러 하위 요소 | 공통 부모 |
| 페이지 간 유지하는 UI 설정 | 공유 상태 또는 적절한 저장소 |
| 검색, 정렬, 페이지 번호 | 공유 가능한 URL 상태 |
| 서버 데이터와 갱신 상태 | 서버 상태 캐시 |
| 화면에 그리지 않는 최신 값 | ref |
| 사용자에게 의미 있는 문서 변경 | 도메인 상태와 변경 이력 |

로컬 상태의 수가 많다는 것만으로 설계가 잘못된 것은 아닙니다. 같은 의미의 값을 여러 위치에 저장하고 매번 일치시켜야 하는 것이 더 큰 문제일 수 있습니다. 반대로 서로 수명과 책임이 다른 상태는 분리해야 합니다.

## URL 예제

```ts
const params = new URLSearchParams(location.search);
const sort = params.get("sort") ?? "latest";
params.set("sort", "oldest");
```

검색과 정렬을 URL로 표현하면 새로고침하거나 다른 사람에게 링크를 보낼 때 같은 조회 조건을 재현할 수 있습니다. 이때 URL 값을 읽기만 하는 것으로는 충분하지 않습니다. 라우터의 이동 방식, 유효하지 않은 조건의 기본값, 뒤로 가기와 현재 기록 대체를 정의해야 합니다.

반대로 모달이 잠시 열린 상태나 아직 저장하지 않은 필드까지 URL에 넣을 이유는 없을 수 있습니다. 민감한 입력값은 특히 URL이나 공유 저장소에 보존하지 않습니다.

## 드래그의 미리보기와 확정 상태

Vertactics의 지도 편집은 사용자가 배치된 영웅을 이동시키는 동안 좌표가 계속 변경됩니다. 이때 모든 포인터 이동을 문서의 변경 이력에 기록하면 한 번의 이동을 취소하기 위해 수십 번 undo를 해야 할 수 있습니다.

[드래그를 하나의 history entry로 확정한 실제 변경](https://github.com/Oddmash/vertactics/commit/90a6784ae34eb3735382ae70b65603dfacef2298)에서는 화면에 표시할 dragPreview와 최신 위치를 읽기 위한 ref, 실제 편집 history를 구분합니다.

| 단계 | 화면에서 사용하는 값 | 문서 데이터 |
| --- | --- | --- |
| 시작 | 기존 배치 위치 | 유지 |
| 이동 중 | 마지막 드래그 미리보기 | 유지 |
| 드래그 완료 | 최종 좌표 | 한 번 갱신 |
| 취소 | 기존 배치 위치로 복구 | 유지 |
| undo | 이전 확정 좌표 | 이력에서 복원 |

드래그 중 좌표를 화면에 표시하려면 render state가 필요할 수 있습니다. 이벤트에서 마지막 좌표를 즉시 읽어야 하는 경우 ref가 도움이 됩니다. 그러나 ref가 화면을 직접 갱신하는 것은 아니므로 시각적 변화와 최신 값의 저장 역할을 구분합니다.

```tsx
type Point = { x: number; y: number };

const latestPoint = useRef<Point | null>(null);
const [preview, setPreview] = useState<Point | null>(null);

const move = (point: Point) => {
  latestPoint.current = point;
  setPreview(point);
};

const finish = () => {
  const point = latestPoint.current;
  if (point) commitPosition(point);
  latestPoint.current = null;
  setPreview(null);
};
```

이는 상태 소유권을 설명하는 코드입니다. 실제 지도에서는 포인터 좌표를 지도 좌표로 변환하는 과정, 현재 편집 도구, locked 상태, pointer capture, 취소와 삭제 같은 다른 경계도 다뤄야 합니다. 이 글에서는 3D 엔진 내부가 아니라 한 번의 사용자 의도를 하나의 변경으로 확정하는 설계에 집중합니다.

[Vertactics #82](https://github.com/Oddmash/vertactics/issues/82)에서는 배치된 영웅의 이동과 삭제를 직접 조작할 수 있도록 설계했고, [PR #83](https://github.com/Oddmash/vertactics/pull/83)은 지도 위 드래그와 휴지통으로 이동해 삭제하는 작업을 통합했습니다. 삭제 여부는 포인터가 휴지통에 들어갔다는 순간이 아니라 최종 조작이 확정되는 시점에 판단해야 합니다.

<span id="프로젝트에서-이어진-고민"></span>

## 여러 프로젝트가 공통 UI를 사용할 때

[Oddmash UI #94](https://github.com/Oddmash/oddmash-ui/issues/94)에서는 문서 사이트의 탐색 UI를 공유하면서 소비자마다 다른 실제 경로를 유지할 필요가 있었습니다.

선택된 라우트는 라우터가 소유하고 탐색 메뉴의 일시적인 열림 상태는 메뉴가 소유할 수 있습니다. 공통 UI가 실제 라우팅 정책까지 모두 소유하면 프레임워크와 배포 base 경로의 차이를 컴포넌트가 알아야 합니다.

동일한 선택값을 URL, 공용 상태, 컴포넌트 상태에 모두 복제하기보다 하나의 값을 기준으로 다른 표현을 계산합니다. 다만 사용자 입력 중인 draft와 확정된 적용값처럼 의미가 다른 상태는 분리합니다.

## 검증 기준

- 조작 중 미리보기는 화면에 표시되지만 문서 이력이 증가하지 않습니다.
- 최종 조작을 완료하면 의도한 값으로 한 번 갱신합니다.
- 취소 또는 locked 상태에서는 변경을 확정하지 않습니다.
- URL이 가리키는 실제 상태와 선택된 UI가 일치합니다.
- 페이지 이동과 컴포넌트 해제 뒤 임시 상태가 남지 않습니다.
- 원격 데이터를 다시 읽었다고 사용자 입력을 의도치 않게 덮지 않습니다.

## 참고

- [Vertactics #82](https://github.com/Oddmash/vertactics/issues/82) · [PR #83](https://github.com/Oddmash/vertactics/pull/83) · [드래그 history 변경](https://github.com/Oddmash/vertactics/commit/90a6784ae34eb3735382ae70b65603dfacef2298)
- [Oddmash UI #94](https://github.com/Oddmash/oddmash-ui/issues/94)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) · [React: Sharing State](https://react.dev/learn/sharing-state-between-components)
- [입력 상태는 누가 관리해야 할까?](../controlled-input/)
