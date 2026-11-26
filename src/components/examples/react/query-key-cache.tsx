import { Button } from "@oddmash/ui/button";
import { useState } from "react";
import "src/components/examples/example.scss";
import "./query-key-cache.scss";

const items = ["검정 펜", "파란 펜", "줄 노트", "무지 노트"];
const keywords = ["펜", "노트"] as const;
type Keyword = typeof keywords[number];
type Lookup = { keyword: Keyword; key: string; reused: boolean; items: string[] };

export const QueryKeyCache = () => {
  const [includeKeyword, setIncludeKeyword] = useState(true);
  const [entries, setEntries] = useState(new Map<string, string[]>());
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const changeMode = (next: boolean) => {
    if (includeKeyword === next) return;
    setIncludeKeyword(next);
    setEntries(new Map());
    setLookup(null);
  };
  const request = (keyword: Keyword) => {
    const key = JSON.stringify(includeKeyword ? ["items", "list", { keyword }] : ["items", "list"]);
    const cached = entries.get(key);
    const result = cached ?? items.filter(item => item.includes(keyword));
    if (!cached) setEntries(new Map(entries).set(key, result));
    setLookup({ keyword, key, reused: Boolean(cached), items: result });
  };

  return (
    <div className="inline-example query-key-cache">
      <div className="inline-example__row" role="group" aria-label="캐시 키 구성">
        <Button type="button" className="inline-example__button" aria-pressed={includeKeyword}
          onClick={() => changeMode(true)}>검색어 포함</Button>
        <Button type="button" className="inline-example__button" aria-pressed={!includeKeyword}
          onClick={() => changeMode(false)}>검색어 제외</Button>
      </div>
      <div className="inline-example__row" role="group" aria-label="조회 요청">
        {keywords.map(keyword => (
          <Button key={keyword} type="button" className="inline-example__button"
            onClick={() => request(keyword)}>{keyword} 조회</Button>
        ))}
      </div>
      <div className="inline-example__loaded" aria-live="polite" aria-label="현재 캐시와 조회 결과">
        <p>저장된 키 {entries.size}개</p>
        {lookup && (
          <>
            <p>요청한 검색어 <b>{lookup.keyword}</b></p>
            <output className="inline-example__caption">{lookup.key}</output>
            <p>{lookup.reused ? "캐시에서 반환" : "원본 목록에서 조회"}</p>
            <p>표시된 목록 <b>{lookup.items.join(", ")}</b></p>
          </>
        )}
      </div>
    </div>
  );
};
