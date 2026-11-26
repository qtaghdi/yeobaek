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

const compact = (value: string) => normalizeSearch(value).replace(/[\s\p{P}\p{S}]+/gu, "");
const includes = (text: string, term: string) => {
  const normalized = normalizeSearch(text);
  const word = normalizeSearch(term);
  const condensed = compact(word);
  return normalized.includes(word) || (condensed.length > 0 && compact(text).includes(condensed));
};

export type MatchRange = { start: number; end: number };

export const getMatchRanges = (text: string, query: string): MatchRange[] => {
  const condensed = compact(query);
  if (!condensed) return [];
  const offsets: MatchRange[] = [];
  let source = "";
  let offset = 0;
  for (const char of text) {
    const value = compact(char);
    for (let index = 0; index < value.length; index++) offsets.push({ start: offset, end: offset + char.length });
    source += value;
    offset += char.length;
  }
  const find = (term: string) => {
    const ranges: MatchRange[] = [];
    let start = source.indexOf(term);
    while (start >= 0) {
      ranges.push({ start: offsets[start].start, end: offsets[start + term.length - 1].end });
      start = source.indexOf(term, start + term.length);
    }
    return ranges;
  };
  const exact = find(condensed);
  const ranges = exact.length ? exact : normalizeSearch(query).split(" ").map(compact).filter(Boolean).flatMap(find);
  return ranges.sort((a, b) => a.start - b.start).reduce<MatchRange[]>((merged, range) => {
    const last = merged.at(-1);
    if (last && last.end >= range.start) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
    return merged;
  }, []);
};

export const makeSearchPreview = (text: string, query: string, limit = 160) => {
  const first = getMatchRanges(text, query)[0];
  const start = Math.max(0, (first?.start ?? 0) - 30);
  const end = Math.min(text.length, Math.max(start + limit, first?.end ?? 0));
  return (start ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
};

export const searchArticles = (articles: SearchArticle[], query: string) => {
  const normalized = normalizeSearch(query);
  const terms = normalized.split(" ").filter(Boolean);
  if (!terms.length) return [];
  return articles.flatMap((article) => {
    const fields = [article.title, article.description, article.category, ...article.keywords];
    const content = article.sections.map((section) => section.title + " " + section.text).join(" ");
    const all = fields.join(" ") + " " + content;
    if (!includes(all, normalized) && !terms.every((term) => includes(all, term))) return [];
    const scoreFor = (term: string) =>
      (includes(article.title, term) ? 45 : 0) +
      (article.keywords.some((key) => includes(key, term)) ? 28 : 0) +
      (includes(article.description, term) ? 16 : 0) +
      (includes(article.category, term) ? 5 : 0) +
      (includes(content, term) ? 2 : 0);
    const score = terms.reduce((sum, term) => sum + scoreFor(term), 0) +
      (includes(article.title, normalized) ? 45 : 0) +
      (article.keywords.some((key) => normalizeSearch(key) === normalized) ? 35 : 0);
    const section = article.sections
      .map((entry) => ({
        entry,
        score: terms.reduce((sum, term) => sum + (includes(entry.title, term) ? 3 : 0) + (includes(entry.text, term) ? 4 : 0), 0) +
          (includes(entry.text, normalized) ? 8 : 0),
      }))
      .sort((a, b) => b.score - a.score)[0];
    const matchSection = section?.score ? section.entry : undefined;
    const titleMatches = includes(article.title, normalized) || terms.every((term) => includes(article.title, term));
    const bodyMatches = matchSection && getMatchRanges(matchSection.text, query).length > 0;
    const snippet = bodyMatches ? matchSection.text : matchSection && getMatchRanges(matchSection.title, query).length ? matchSection.title : article.description;
    const target = !titleMatches && matchSection ? matchSection.anchor : undefined;
    const matchedKeywords = article.keywords.filter((keyword) => getMatchRanges(keyword, query).length);
    return [{ article, score, snippet, target, bodyMatches: Boolean(bodyMatches), titleMatches, matchedKeywords }];
  }).sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title, "ko"));
};

export const relatedQueries = (articles: SearchArticle[], query: string, limit = 6) => {
  const matches = searchArticles(articles, query).slice(0, 5);
  const counts = new Map<string, number>();
  for (const { article, score } of matches) {
    for (const keyword of article.keywords) {
      if (normalizeSearch(keyword) === normalizeSearch(query)) continue;
      counts.set(keyword, (counts.get(keyword) ?? 0) + score);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([keyword]) => keyword);
};
