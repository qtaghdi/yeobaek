import { Button } from "@oddmash/ui/button";
import { useLayoutEffect, useRef, useState } from "react";
import "src/components/examples/example.scss";
import "../article-quality.scss";

export const InputIdentityExample = () => {
  const input = useRef<HTMLInputElement>(null);
  const previous = useRef<HTMLInputElement | null>(null);
  const [replace, setReplace] = useState(false);
  const [icon, setIcon] = useState(false);
  const [observed, setObserved] = useState({ same: true, focused: false, value: "" });
  const [submitted, setSubmitted] = useState("아직 제출하지 않음");
  const toggle = () => { previous.current = input.current; setIcon(value => !value); };
  useLayoutEffect(() => {
    const node = input.current;
    if (!node) return;
    setObserved({ same: previous.current === null || previous.current === node, focused: document.activeElement === node, value: node.value });
  }, [icon, replace]);
  return (
    <div className="inline-example article-quality">
      <label className="inline-example__check"><input type="checkbox" checked={replace} onChange={event => { previous.current = input.current; setReplace(event.target.checked); }} /> 아이콘 변경 시 요소 교체</label>
      <form className="article-quality__sample" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("query") ?? "")); }}>
        <label htmlFor="identity-query">검색어</label>
        <div className="article-quality__input">
          {icon && <span aria-hidden="true">⌕</span>}
          <input ref={input} id="identity-query" key={replace ? String(icon) : "stable"} name="query" defaultValue="" data-icon={icon} onKeyDown={event => { if (event.altKey && (event.code === "KeyI" || event.key.toLowerCase() === "i")) { event.preventDefault(); toggle(); } }} />
        </div>
        <div className="inline-example__row">
          <Button type="button" className="inline-example__button" onPointerDown={event => event.preventDefault()} onClick={toggle}>아이콘 전환</Button>
          <Button type="submit" className="inline-example__button">폼 값 확인</Button>
        </div>
        <small>입력란에서 Alt + I로 전환하면 클릭에 따른 포커스 이동을 피할 수 있습니다.</small>
      </form>
      <dl className="article-quality__observations">
        <div><dt>DOM 참조</dt><dd data-input-same>{observed.same ? "동일" : "교체됨"}</dd></div>
        <div><dt>전환 직후 포커스</dt><dd data-input-focus>{observed.focused ? "입력란" : "다른 위치"}</dd></div>
        <div><dt>전환 직후 값</dt><dd data-input-value>{observed.value || "빈 값"}</dd></div>
        <div><dt>FormData 값</dt><dd data-input-submitted>{submitted || "빈 값"}</dd></div>
      </dl>
    </div>
  );
};
