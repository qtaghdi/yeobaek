export type SearchArticle = {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  keywords: string[];
  sections: { title: string; text: string; anchor?: string }[];
};

export const recommendedQueries = ["React", "접근성", "줄바꿈", "TanStack Query", "디자인 시스템", "렌더링"];

export const searchTopics: Record<string, { category: string; keywords: string[] }> = {
  "accessibility": { category: "웹 플랫폼과 접근성", keywords: ["접근성", "a11y"] },
  "browser": { category: "웹 플랫폼과 접근성", keywords: ["브라우저", "웹 API"] },
  "css": { category: "CSS·텍스트·렌더링", keywords: ["CSS", "레이아웃"] },
  "language": { category: "React와 상태·데이터", keywords: ["JavaScript", "TypeScript"] },
  "react": { category: "React와 상태·데이터", keywords: ["React", "리액트"] },
  "design-system": { category: "컴포넌트와 디자인 시스템", keywords: ["디자인 시스템", "컴포넌트"] },
  "design": { category: "복합 인터랙션과 제품 UI", keywords: ["UI", "UX"] },
  "architecture": { category: "아키텍처와 개발자 경험", keywords: ["아키텍처", "개발자 경험"] },
};

export const articleKeywords: Record<string, string[]> = {
  "accessibility/focus-ring": ["focus", "focus-visible", "포커스", "키보드", "outline"],
  "accessibility/semantic-controls": ["HTML", "시맨틱", "버튼", "링크", "button"],
  "accessibility/tab-order": ["tabindex", "Tab", "키보드", "포커스"],
  "accessibility/dialog-focus": ["모달", "dialog", "포커스", "Escape"],
  "accessibility/disabled-state": ["비활성화", "disabled", "aria-disabled", "inert"],
  "browser/events": ["이벤트", "버블링", "캡처", "event"],
  "browser/storage": ["localStorage", "sessionStorage", "로컬 스토리지", "저장소"],
  "browser/layout-observation": ["ResizeObserver", "폰트", "리사이즈", "Juliya"],
  "css/stacking-context": ["z-index", "쌓임 맥락", "모달", "레이어"],
  "css/flex-overflow": ["flex", "오버플로우", "말줄임", "min-width"],
  "css/cascade": ["cascade", "명시도", "우선순위", "!important"],
  "css/viewport": ["100vh", "dvh", "뷰포트", "모바일"],
  "css/scrollbar": ["스크롤바", "scrollbar", "모달", "레이아웃"],
  "css/text-wrap": ["줄바꿈", "Juliya", "한국어", "word-break"],
  "css/rendering-strategies": ["렌더링", "CSR", "SSR", "SSG", "ISR", "RSC", "Next.js"],
  "language/type-runtime": ["TypeScript", "타입스크립트", "런타임", "타입 검증"],
  "language/async-requests": ["비동기", "race condition", "요청 취소", "AbortController"],
  "react/state-snapshot": ["useState", "상태", "렌더링", "스냅샷"],
  "react/controlled-input": ["폼", "입력", "제어형", "비제어형"],
  "react/effects": ["useEffect", "이펙트", "동기화", "cleanup"],
  "react/server-state": ["useEffect", "API", "TanStack Query", "React Query", "서버 상태", "캐시"],
  "react/query-keys": ["TanStack Query", "React Query", "쿼리 키", "캐시", "invalidateQueries"],
  "react/state-location": ["상태 관리", "전역 상태", "URL", "드래그"],
  "react/error-handling": ["에러", "오류", "예외 처리", "Axios", "Toast"],
  "react/auth-lifecycle": ["Auth", "인증", "로그인", "권한", "세션"],
  "design-system/tokens": ["토큰", "테마", "다크 모드", "CSS 변수"],
  "design-system/why-design-system": ["디자인 시스템", "Storybook", "토큰", "공통 UI"],
  "design-system/component-api": ["Select", "컴포넌트", "API", "접근성"],
  "design-system/compatibility": ["호환성", "패키지", "SemVer", "공개 API"],
  "design/visual-hierarchy": ["디자인", "타이포그래피", "여백", "시각적 위계"],
  "design/loading-states": ["스켈레톤", "skeleton", "로딩", "CLS"],
  "design/feedback": ["Toast", "피드백", "복사", "로딩"],
  "design/team-balance": ["Web Worker", "웹 워커", "알고리즘", "전수 탐색", "오버워치"],
  "architecture/module-boundaries": ["FSD", "Boundra", "폴더 구조", "모듈 경계"],
  "architecture/monorepo": ["모노레포", "monorepo", "pnpm", "workspace", "Turbo"],
  "architecture/testing": ["테스트", "검증", "Boundra", "성능"],
  "architecture/delivery": ["배포", "빌드", "CI", "GitHub Pages"],
};

export const normalizeSearch = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase("ko").trim().replace(/\s+/g, " ");

const separators = /[\s\-‐‑–]+/gu;
const initialPattern = /^[\u1100-\u1112]+$/u;
const compact = (value: string) => value.replace(separators, "");
const initialForm = (value: string) =>
  [...value].map(char => {
    const code = char.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3
      ? String.fromCharCode(0x1100 + Math.floor((code - 0xac00) / 588))
      : char;
  }).join("");

const createQuery = (value: string) => {
  const normalized = normalizeSearch(value);
  const term = compact(normalized);
  const initial = initialPattern.test(term);
  return { normalized, term, initial, valid: /[\p{L}\p{N}]/u.test(term), short: [...term].length === 1 };
};

export const canOpenFirstResult = (query: string) => {
  const parsed = createQuery(query);
  return parsed.valid && !parsed.short;
};

type SearchQuery = ReturnType<typeof createQuery>;
const projection = (value: string, initial: boolean) => {
  const normalized = compact(normalizeSearch(value));
  return initial ? initialForm(normalized) : normalized;
};

const matchesQuery = (text: string, query: SearchQuery) =>
  query.valid && projection(text, query.initial).includes(query.term);

export type MatchRange = { start: number; end: number };

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

export const getMatchRanges = (text: string, value: string): MatchRange[] => {
  const query = createQuery(value);
  if (!query.valid) return [];
  const offsets: MatchRange[] = [];
  let source = "";
  for (const { segment, index } of segmenter.segment(text)) {
    const normalized = projection(segment, query.initial);
    for (let i = 0; i < normalized.length; i++) offsets.push({ start: index, end: index + segment.length });
    source += normalized;
  }
  const ranges: MatchRange[] = [];
  let start = source.indexOf(query.term);
  while (start >= 0) {
    const range = { start: offsets[start].start, end: offsets[start + query.term.length - 1].end };
    const last = ranges.at(-1);
    if (last && last.end > range.start) last.end = Math.max(last.end, range.end);
    else ranges.push(range);
    start = source.indexOf(query.term, start + query.term.length);
  }
  return ranges;
};

export const makeSearchPreview = (text: string, query: string, limit = 160) => {
  const first = getMatchRanges(text, query)[0];
  const start = Math.max(0, (first?.start ?? 0) - 30);
  const end = Math.min(text.length, Math.max(start + limit, first?.end ?? 0));
  return (start ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
};

export const searchArticles = (articles: SearchArticle[], value: string) => {
  const query = createQuery(value);
  if (!query.valid) return [];
  const includes = (text: string) => matchesQuery(text, query);
  return articles.flatMap(article => {
    const titleMatches = includes(article.title);
    const matchedKeywords = article.keywords.filter(includes);
    const descriptionMatches = includes(article.description);
    const categoryMatches = !query.short && includes(article.category);
    const sections = query.short ? [] : article.sections.map(entry => ({
      entry,
      textMatches: includes(entry.text),
      headingMatches: includes(entry.title),
    }));
    const section = sections.filter(item => item.textMatches || item.headingMatches)
      .sort((a, b) => (Number(b.textMatches) * 2 + Number(b.headingMatches)) - (Number(a.textMatches) * 2 + Number(a.headingMatches)))[0];
    if (!titleMatches && !matchedKeywords.length && !descriptionMatches && !categoryMatches && !section) return [];
    const score = (titleMatches ? 90 : 0) + (matchedKeywords.length ? 28 : 0) +
      (matchedKeywords.some(keyword => projection(keyword, query.initial) === query.term) ? 35 : 0) +
      (descriptionMatches ? 16 : 0) + (categoryMatches ? 5 : 0) + (section ? 2 : 0);
    const bodyMatches = Boolean(section?.textMatches || section?.headingMatches);
    const snippet = section?.textMatches ? section.entry.text : section?.headingMatches ? section.entry.title : article.description;
    const target = !titleMatches && section ? section.entry.anchor : undefined;
    return [{ article, score, snippet, target, bodyMatches, titleMatches, matchedKeywords }];
  }).sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title, "ko"));
};

export const relatedQueriesFromMatches = (matches: ReturnType<typeof searchArticles>, query: string, limit = 6) => {
  if (!canOpenFirstResult(query)) return [];
  const counts = new Map<string, number>();
  for (const { article, score } of matches.slice(0, 5)) {
    for (const keyword of article.keywords) {
      if (normalizeSearch(keyword) === normalizeSearch(query)) continue;
      counts.set(keyword, (counts.get(keyword) ?? 0) + score);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([keyword]) => keyword);
};

export const relatedQueries = (articles: SearchArticle[], query: string, limit = 6) =>
  relatedQueriesFromMatches(searchArticles(articles, query), query, limit);
