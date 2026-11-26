# 여백

> 아는 것과 이해하는 것 사이의 여백을 채웁니다.

프론트엔드의 동작 원리와 놓치기 쉬운 디테일을 기록하는 한국어 기술 노트와 실험실입니다.

[문서](https://qtaghdi.github.io/yeobaek/) · [실험실](https://qtaghdi.github.io/yeobaek/lab/) · [기획](docs/plan.md)

## 개발

Node.js 24, pnpm 12.14.0.

```sh
pnpm install --no-frozen-lockfile
pnpm dev
pnpm storybook
pnpm check
pnpm lint
pnpm build
```

모노레포 전환으로 잠금 파일 갱신이 필요합니다. 생성한 잠금 파일은 검토 후 커밋합니다.

## 구조

- `apps/docs`: Astro, Starlight, MDX
- `apps/storybook`: React, Vite, Storybook
- `packages/experiments`: 공통 실험 컴포넌트
- `packages/tokens`: 공책 테마 및 실험 SCSS
- `packages/config`: 공유 TypeScript 및 ESLint 설정

기존 실험 ID는 보존하며 동일한 구현을 문서와 Storybook에서 사용합니다. 글과 실험의 작성 기준은 [AGENTS.md](AGENTS.md)를 참고하세요.
