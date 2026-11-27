import { Button } from "src/components/ui/controls";
import { useState } from "react";
import { initialStorage, updateStorage, maxTabs, type StorageAction } from "src/components/examples/browser/storage-model";
import "src/components/examples/example.scss";
import "./storage-lifetime.scss";

export const StorageLifetime = () => {
  const [state, setState] = useState(initialStorage);
  const dispatch = (action: StorageAction) => setState(previous => updateStorage(previous, action));
  const active = state.tabs.find(tab => tab.id === state.activeId)!;
  return (
    <div id="storage-lifetime-example" className="inline-example storage-lifetime">
      <div className="storage-lifetime__browser">
        <div className="storage-lifetime__chrome">
          <div className="storage-lifetime__tabs" role="group" aria-label="가상 브라우저 탭">
            {state.tabs.map(tab => (
              <button key={tab.id} type="button" aria-pressed={tab.id === state.activeId} onClick={() => dispatch({ type: "select", id: tab.id })}>
                <span aria-hidden="true">◫</span> 탭 {tab.id}
              </button>
            ))}
            <button className="storage-lifetime__add" type="button" aria-label="독립 탭 열기" disabled={state.tabs.length >= maxTabs} onClick={() => dispatch({ type: "new" })}>+</button>
          </div>
          <div className="storage-lifetime__toolbar">
            <Button type="button" className="inline-example__button" aria-label="이 탭 새로고침" onClick={() => dispatch({ type: "reload" })}>↻</Button>
            <div className="storage-lifetime__address"><span aria-hidden="true">◇</span> memo.example/notes</div>
            <Button type="button" className="inline-example__button" aria-label="현재 탭 닫기" onClick={() => dispatch({ type: "close" })}>×</Button>
          </div>
        </div>
        <div className="storage-lifetime__page">
          <header className="storage-lifetime__page-header"><strong>메모</strong><span>탭 {active.id} · 새로고침 {active.refreshes}회</span></header>
          <div className="storage-lifetime__sample">
            <div>
              <p className="inline-example__caption">목록 간격</p>
              <output aria-label="표시 밀도">{state.dense ? "좁은 간격" : "기본 간격"}</output>
            </div>
            <Button type="button" className="inline-example__button" onClick={() => dispatch({ type: "density" })}>{state.dense ? "기본 간격으로 복구" : "목록 간격 좁히기"}</Button>
          </div>
          <ul className="storage-lifetime__list" data-dense={state.dense} aria-label="목록 미리보기">
            <li><span aria-hidden="true">▤</span> 작성 중인 글</li>
            <li><span aria-hidden="true">▤</span> 검토가 끝난 글</li>
          </ul>
          <div className="storage-lifetime__sample">
            <div>
              <p className="inline-example__caption">임시 검색어</p>
              <output aria-label="이 탭의 임시 검색어">{active.hasDraft ? "줄바꿈" : "저장된 검색어 없음"}</output>
            </div>
            <Button type="button" className="inline-example__button" onClick={() => dispatch({ type: "draft" })}>{active.hasDraft ? "임시 검색어 지우기" : "임시 검색어 저장"}</Button>
          </div>
        </div>
      </div>
      <div className="storage-lifetime__inspector" aria-label="가상 저장소 검사">
        <div className="storage-lifetime__shared">
          <div><code>localStorage</code><span>같은 출처 · 모든 탭</span></div>
          <code data-storage-local>{state.dense ? 'density: "compact"' : "비어 있음"}</code>
        </div>
        <div className="storage-lifetime__sessions">
          <div className="storage-lifetime__scope"><code>sessionStorage</code><span>탭별 페이지 세션</span></div>
          {state.tabs.map(tab => <div key={tab.id} className="storage-lifetime__session" data-active={tab.id === state.activeId} data-storage-tab={tab.id}><strong>탭 {tab.id}{tab.id === state.activeId ? " · 현재" : ""}</strong><code>{tab.hasDraft ? 'draft: "줄바꿈"' : "비어 있음"}</code></div>)}
        </div>
      </div>
      <div className="storage-lifetime__footer">
        <p role="status">{state.message}</p>
        <Button type="button" className="inline-example__button" onClick={() => dispatch({ type: "reset" })}>전체 초기화</Button>
      </div>
      <p className="storage-lifetime__note">가상 브라우저입니다. 실제 탭·주소·브라우저 저장소에는 영향을 주지 않습니다.</p>
    </div>
  );
};
