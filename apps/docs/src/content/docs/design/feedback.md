---
title: "로딩·성공·실패를 어떻게 보여줄까?"
description: "비동기 복사와 Toast의 수명주기, 독립적인 알림 큐, 접근 가능한 피드백을 설계합니다."
---

저장 버튼을 클릭했다고 저장이 완료된 것은 아닙니다. 사용자의 요청, 실제 처리 결과, 화면에 보이는 피드백은 서로 다른 사건입니다. 잘못된 성공 메시지는 단순한 시각 오류가 아니라 사용자가 실패를 성공으로 믿도록 만듭니다.

Oddmash UI에서 ClipboardButton과 ToastProvider를 제공하게 된 [#95](https://github.com/Oddmash/oddmash-ui/issues/95)는 여러 소비자가 반복해서 구현하던 복사와 알림의 상태를 공용으로 다루기 위한 사례입니다.

## 상태별 책임

| 상태 | 사용자에게 필요한 정보 |
| --- | --- |
| 초기 | 어떤 행동을 할 수 있는가 |
| 진행 중 | 행동이 접수되었는가, 중복 실행이 가능한가 |
| 성공 | 무엇이 실제로 완료되었는가 |
| 실패 | 어떤 작업이 실패했고 어떻게 복구하는가 |
| 빈 결과 | 결과가 없는 이유와 다음 행동 |

작은 일회성 작업은 버튼 주변의 피드백이 충분할 수 있습니다. 전체 작업에 영향을 주는 오류는 화면의 관련 영역에서 다시 시도할 방법을 제공해야 합니다. Toast를 모든 상태의 기본 해법으로 사용하면 내용이 중요한지 구분하기 어렵습니다.

<span id="프로젝트에서-이어진-고민"></span>
<span id="복사와-toast의-수명주기"></span>

## 복사와 실제 비동기 결과

```ts
const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setState("copied");
  } catch {
    setState("error");
  }
};
```

이 예제는 성공을 Promise 완료 이후에만 표시하는 원리를 설명합니다. 실제 환경에서는 Clipboard API가 지원되지 않거나 브라우저에서 요청을 거절할 수 있습니다. 성공 표시를 먼저 한 뒤 오류를 무시해서는 안 됩니다.

Oddmash UI의 ClipboardButton은 idle, pending, copied, error 네 상태를 사용합니다. pending을 통해 중복 요청을 막고, 처리 도중 복사 대상 문자열이 바뀌면 이전 문자열에 대한 완료가 새 문자열의 복사 성공으로 보이지 않도록 현재 값을 비교합니다.

예를 들어 코드 예제의 언어 탭을 변경하는 동안 이전 코드의 복사가 늦게 완료되었습니다. 새 탭이 선택된 시점에 버튼이 copied로 바뀌면 무엇이 복사되었는지 알기 어렵습니다. 결과의 소유권을 현재 문자열과 연결해야 하는 이유입니다.

## 여러 Toast를 동시에 관리해야 할 때

기존 제어형 Toast는 화면에 표시할지 여부를 소비자가 관리할 수 있습니다. 여러 알림을 사용하는 제품에서는 표시 개수, 만료 시간, 닫기와 포커스 복귀까지 반복적으로 구현하게 됩니다. 이 역할을 ToastProvider가 선택적으로 관리하도록 설계했습니다.

현재 공개 소스의 관리 상태는 다음과 같습니다.

| 상태 | 의미 |
| --- | --- |
| waiting | 표시 슬롯이 생길 때까지 대기 |
| queued | 슬롯이 확보되어 실제 표시를 준비 |
| open | 사용자가 읽고 조작할 수 있는 상태 |
| closing | 닫기 요청을 처리하고 퇴장 완료를 기다리는 상태 |

닫기 요청 즉시 목록에서 제거하는 것과 닫힘이 완료된 뒤 제거하는 것은 다릅니다. closing도 슬롯을 사용하므로 퇴장 중에 다음 알림을 계속 넣으면 순간적으로 화면을 덮을 수 있습니다. 실제 구현은 닫힘이 완료된 항목을 제거하고 남은 슬롯만큼 대기 중인 항목을 표시합니다.

### 독립적인 알림 ID

```ts
type Entry = {
  id: string;
  title: string;
};

const dismiss = (id: string) => {
  setEntries((previous) =>
    previous.filter((entry) => entry.id !== id),
  );
};
```

이 코드는 식별자의 역할을 보여 주는 축약 예제입니다. 실제 provider는 open과 closing을 구분합니다. 만료 타이머가 특정 알림의 ID에만 작용해야 합니다. 단순히 `setEntries([])`처럼 모든 알림을 닫으면 먼저 실행된 타이머가 나중에 나타난 알림까지 제거할 수 있습니다.

입력에 따라 시간이 달라지는 경우도 고려합니다. [#120](https://github.com/Oddmash/oddmash-ui/issues/120)에서는 알림의 남은 시간과 일시 정지 처리를 다뤘습니다. 현재 코드는 시작 시간을 기록하고 벗어나거나 포커스가 이동할 때 남은 시간을 계산합니다. 경고, 오류, 로딩은 기본적으로 자동 만료 없이 유지하고, 명시적으로 duration을 설정할 수 있습니다.

## 접근성과 복구

피드백은 보이는 화면만의 상태가 아닙니다. 복사 버튼의 성공처럼 문맥을 바꾸지 않는 일반 결과에는 정중한 status 영역이 적합할 수 있습니다. 중요한 오류는 alert의 필요성을 검토하되 모든 성공 메시지를 급하게 읽을 이유는 없습니다.

알림을 읽거나 닫는 중에는 자동 타이머가 사용자 행동을 방해하지 않아야 합니다. 현재 provider는 viewport에 마우스가 올라가거나 키보드 포커스가 들어오면 타이머를 일시 정지합니다. 닫히는 알림 안에 포커스가 있었을 때만 남은 열린 알림의 버튼 또는 원래 트리거로 돌아가도록 처리합니다. 다른 화면 요소에 이미 포커스가 있다면 강제로 이동시키지 않습니다.

모션 감소 환경에서는 실제 성공·실패와 닫힌 상태가 그대로 제공되며, 애니메이션은 상태의 의미를 대신하지 않습니다.

## 검증 기준

- 실제 Clipboard API의 성공과 거절을 구분합니다.
- 복사 중 연속 요청, 코드 변경, 컴포넌트 해제 후 늦은 결과가 기존 상태를 덮지 않는지 확인합니다.
- 알림을 빠르게 여러 번 생성해도 표시 개수의 한계를 지킵니다.
- 포인터와 키보드로 읽는 동안 타이머가 일시 정지되고, 재개 시 남은 시간이 반영됩니다.
- 알림 종료 후 다음 조작 위치가 예측 가능하고 포커스가 이미 다른 곳에 있으면 그대로 유지됩니다.
- 모션 감소 환경에서도 성공, 오류, 닫힌 상태가 동일합니다.

공개 브라우저 테스트에는 clipboard fixture의 성공·거절, 실제 Chromium clipboard, 관리되는 알림 개수와 모션 감소 환경의 포커스 동작을 확인하는 테스트가 포함되어 있습니다. fixture 기반 검증과 실제 브라우저 권한을 사용하는 검증은 구분합니다.

## 참고

- [Oddmash UI #40](https://github.com/Oddmash/oddmash-ui/issues/40) · [#64](https://github.com/Oddmash/oddmash-ui/issues/64) · [#95](https://github.com/Oddmash/oddmash-ui/issues/95) · [#120](https://github.com/Oddmash/oddmash-ui/issues/120)
- [실제 ClipboardButton](https://github.com/Oddmash/oddmash-ui/blob/25ecce212b4c3a2a2100d6190a191722087135cb/src/clipboard-button.tsx) · [ToastProvider 구현](https://github.com/Oddmash/oddmash-ui/blob/25ecce212b4c3a2a2100d6190a191722087135cb/src/toast-provider.tsx)
- [브라우저 회귀 테스트 커밋](https://github.com/Oddmash/oddmash-ui/commit/5cb524382cf627d00b074f680dae298077e85dc3)
- [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
