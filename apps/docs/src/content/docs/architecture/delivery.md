---
title: "빌드와 배포를 분리해서 생각하기"
description: "빌드 결과와 실제 서비스 환경의 차이를 검증합니다."
---

로컬에서 잘 동작하는 것과 배포 환경에서 잘 동작하는 것은 다릅니다. 프론트엔드 정적 사이트는 특히 경로, 환경 변수, 빌드 결과물이 배포 대상과 일치하는지 확인해야 합니다.

## 검증의 단계

1. 의존성 설치와 lockfile 일치 여부를 확인합니다.
2. 타입 검사와 린트로 정적 문제를 확인합니다.
3. 실제 프로덕션 빌드 결과물을 만듭니다.
4. 배포한 주소에서 페이지, 이미지, 링크, JavaScript 동작을 확인합니다.

GitHub Pages처럼 저장소 이름 아래에 배포되는 사이트는 루트 경로에서만 테스트하면 하위 경로 문제를 놓칠 수 있습니다.

## 렌더링과 실행 환경

정적 생성은 빌드 시점에 문서를 준비하고, 서버 렌더링은 요청 시점에 서버가 HTML을 생성할 수 있습니다. 클라이언트에서 필요한 인터랙션은 브라우저에서 동작합니다. 인터랙티브 페이지라고 반드시 전체 화면이 클라이언트 렌더링이어야 하는 것은 아닙니다.

여백의 문서는 정적으로 빌드하고 필요한 예제만 브라우저에서 동작하도록 구성합니다.

[Astro: Islands](https://docs.astro.build/en/concepts/islands/) · [GitHub Pages](https://docs.github.com/en/pages)

## 프로젝트에서 이어진 고민

GitHub Pages 프로젝트 사이트는 루트가 아닌 저장소 이름을 포함한 경로에서 동작한다. 빌드가 성공해도 링크나 자산 경로의 기준이 잘못되면 실제 배포에서 404가 발생한다. 관련 작업은 PR #24로 병합되었다.

### 검증 기준

빌드 성공과 배포 성공을 구분한다. 설정의 base 경로와 실제 생성 HTML, 정적 자산의 경로를 확인하며 배포 URL에서 문서 링크를 직접 열어 본다. 잠금 파일 고정 설치로 CI와 개발 환경의 의존성을 일치시킨다.

[관련 이슈 · oddmash-website #23](https://github.com/Oddmash/oddmash-website/issues/23)

## 빌드 결과를 실제 URL에서 확인하기

[Oddmash Website #23](https://github.com/Oddmash/oddmash-website/issues/23)과 [PR #24](https://github.com/Oddmash/oddmash-website/pull/24)에서 프로젝트 Pages의 배포 경로를 확인한 사례가 있다. 여백 역시 `/yeobaek/` 아래에 배포된다.

```js
export default defineConfig({
  site: "https://qtaghdi.github.io",
  base: "/yeobaek",
});
```

빌드가 성공했다는 사실은 생성 대상이 존재한다는 것에 가깝다. 브라우저가 실제로 요청하는 링크와 자산 URL이 배포 위치에 맞아야 한다. 문서 목록, 상세 경로, 새로고침, 코드 스타일과 파비콘까지 배포된 URL로 점검한다. CI 성공, 실제 배포 성공, 배포 화면의 동작은 별개의 검증 결과로 구분한다.
