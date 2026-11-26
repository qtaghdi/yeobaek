import { Button } from "@oddmash/ui/button";
import { useEffect, useState } from "react";
import "src/components/examples/example.scss";
import "./storage-lifetime.scss";

const densityKey = "yeobaek-example-storage-density";
const draftKey = "yeobaek-example-storage-draft";

type Values = { dense: boolean; hasDraft: boolean };
const readValues = (): Values => ({
  dense: window.localStorage.getItem(densityKey) === "compact",
  hasDraft: window.sessionStorage.getItem(draftKey) === "saved",
});

export const StorageLifetime = () => {
  const [values, setValues] = useState<Values>({ dense: false, hasDraft: false });
  const [unavailable, setUnavailable] = useState(false);
  const refresh = () => {
    try {
      setValues(readValues());
    } catch {
      setUnavailable(true);
    }
  };

  useEffect(() => {
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === densityKey || event.key === draftKey || event.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const write = (change: () => void) => {
    try {
      change();
      refresh();
    } catch {
      setUnavailable(true);
    }
  };

  return (
    <div id="storage-lifetime-example" className="inline-example storage-lifetime">
      <div className="inline-example__row" role="group" aria-label="저장소 재현">
        <Button type="button" className="inline-example__button" onClick={() => window.location.reload()}>
          이 탭 새로고침
        </Button>
        <a className="inline-example__button" href="#storage-lifetime-example" target="_blank" rel="noopener">
          독립 탭에서 열기
        </a>
      </div>
      <div className="inline-example inline-example--comparison">
        <div className="inline-example__loaded storage-lifetime__sample">
          <p className="inline-example__caption"><code>localStorage</code></p>
          <output aria-label="표시 밀도">{values.dense ? "좁은 간격" : "기본 간격"}</output>
          <ul className="storage-lifetime__list" data-dense={values.dense} aria-label="목록 미리보기">
            <li>작성 중인 글</li>
            <li>검토가 끝난 글</li>
          </ul>
          <Button type="button" className="inline-example__button" disabled={unavailable} onClick={() => write(() => {
            if (values.dense) window.localStorage.removeItem(densityKey);
            else window.localStorage.setItem(densityKey, "compact");
          })}>
            {values.dense ? "기본 간격으로 복구" : "목록 간격 좁히기"}
          </Button>
        </div>
        <div className="inline-example__loaded storage-lifetime__sample">
          <p className="inline-example__caption"><code>sessionStorage</code></p>
          <output aria-label="이 탭의 임시 검색어">{values.hasDraft ? "줄바꿈" : "저장된 검색어 없음"}</output>
          <Button type="button" className="inline-example__button" disabled={unavailable} onClick={() => write(() => {
            if (values.hasDraft) window.sessionStorage.removeItem(draftKey);
            else window.sessionStorage.setItem(draftKey, "saved");
          })}>
            {values.hasDraft ? "임시 검색어 지우기" : "임시 검색어 저장"}
          </Button>
        </div>
      </div>
      {unavailable && <p role="status" className="inline-example__caption">이 브라우저에서는 저장소에 접근할 수 없습니다.</p>}
    </div>
  );
};
