# 여백 콘텐츠 계획

[README의 목차](../README.md#목차)는 현재 공개 글을 안내합니다. 이 문서는 작성 중인 글과 다음 글감을 정리합니다. 글을 다듬는 기준은 [AGENTS.md](../AGENTS.md), 사이트 동작의 검증 기준은 [QA 시나리오](qa-scenarios.md)에 있습니다.

새 글은 작성자 검토를 거친 뒤 공개합니다. 백엔드와 AI는 해당 분야의 첫 글이 공개될 때 목차와 사이드바에 추가합니다. 여러 분야에 걸친 글은 글의 중심 질문에 맞는 분류에 둡니다.

## 남겨둘 글감

| 분야 | 질문 | 확인할 근거 |
| --- | --- | --- |
| 프론트엔드 | 인라인 마크업을 유지하면서 줄을 새로 나눌 수 있을까? | [Juliya 인라인 처리](https://github.com/Oddmash/juliya/issues/13), [뷰포트 리사이즈 회귀 수정](https://github.com/Oddmash/juliya/pull/174) |
| 프론트엔드 | 브라우저 확장 패널을 닫았을 때 페이지의 관찰을 어떻게 정리할까? | [Interaction Inspector 이벤트 관찰](https://github.com/Oddmash/interaction-inspector/issues/29) |
| 디자인 | 시작일과 종료일을 따로 고를 때 어떤 상태를 확정해야 할까? | [Oddmash UI 날짜 범위 제약](https://github.com/Oddmash/oddmash-ui/issues/142), [Oddmash Agents 기간 입력](https://github.com/Oddmash/oddmash-agents/issues/248) |
| 개발과 운영 | 기존 위반을 허용하면서 새 위반만 어떻게 막을까? | [Boundra baseline](https://github.com/Oddmash/boundra/issues/157) |
| 개발과 운영 | 전체 검사 결과에서 변경 파일의 진단만 보여주는 이유는 뭘까? | [Boundra 변경 파일 보고](https://github.com/Oddmash/boundra/issues/158), [기존 글의 증분 검사 비교](../src/content/docs/architecture/testing.mdx) |

관련 이슈는 당시 질문을 확인하는 출발점입니다. 집필할 때 병합 PR이나 공개 소스에서 실제 동작을 확인하고, 확인한 결과와 설명용 예제를 구분합니다.
