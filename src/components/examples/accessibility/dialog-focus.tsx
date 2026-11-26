import { useId, useRef } from "react";
import "src/components/examples/example.scss";

export const DialogFocusExample = () => {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = useId();
  return (
    <div className="inline-example">
      <button ref={trigger} type="button" className="inline-example__button" onClick={() => dialog.current?.showModal()}>
        모달 열기
      </button>
      <dialog ref={dialog} aria-labelledby={title} className="inline-example__dialog" onClose={() => trigger.current?.focus({ preventScroll: true })}>
        <h3 id={title}>확인 대화상자</h3>
        <p>Tab 또는 Escape 키를 눌러 보세요.</p>
        <form method="dialog" className="inline-example__row">
          <button type="submit" className="inline-example__button">닫기</button>
          <button type="submit" className="inline-example__button">확인</button>
        </form>
      </dialog>
    </div>
  );
};
