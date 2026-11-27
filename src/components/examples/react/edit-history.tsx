import { Button } from "src/components/ui/controls";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import "src/components/examples/example.scss";
import "./edit-history.scss";

type Point = { x: number; y: number };
const initialPoint = { x: 28, y: 50 };
const arrowSteps: Record<string, Point | undefined> = {
  ArrowLeft: { x: -8, y: 0 },
  ArrowRight: { x: 8, y: 0 },
  ArrowUp: { x: 0, y: -8 },
  ArrowDown: { x: 0, y: 8 },
};
const clamp = (position: number) => Math.max(17, Math.min(83, Math.round(position)));
const positionOf = (point: Point) => ({ left: `${point.x}%`, top: `${point.y}%` });

export const EditHistory = () => {
  const [positions, setPositions] = useState([initialPoint]);
  const [preview, setPreview] = useState<Point>();
  const board = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | undefined>(undefined);
  const offset = useRef<Point>(initialPoint);
  const committed = positions.at(-1)!;

  const fromPointer = ({ clientX, clientY }: PointerEvent<HTMLButtonElement>) => {
    const bounds = board.current!.getBoundingClientRect();
    return {
      x: (100 * (clientX - bounds.left)) / bounds.width,
      y: (100 * (clientY - bounds.top)) / bounds.height,
    };
  };

  const updatePointer = (event: PointerEvent<HTMLButtonElement>) => {
    const point = fromPointer(event);
    return { x: clamp(point.x - offset.current.x), y: clamp(point.y - offset.current.y) };
  };

  const clear = () => {
    pointer.current = undefined;
    setPreview(undefined);
  };

  const commit = (point: Point) => {
    if (point.x !== committed.x || point.y !== committed.y) setPositions([...positions, point]);
    clear();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = arrowSteps[event.key];
    if (delta && pointer.current === undefined) {
      event.preventDefault();
      const point = preview ?? committed;
      setPreview({ x: clamp(point.x + delta.x), y: clamp(point.y + delta.y) });
    } else if (event.key === "Escape" && preview) {
      event.preventDefault();
      clear();
    } else if (event.key === "Enter" && preview && pointer.current === undefined) {
      event.preventDefault();
      commit(preview);
    }
  };

  return (
    <div className="inline-example edit-history">
      <div className="inline-example__row">
        <Button type="button" className="inline-example__button" disabled={!preview} onClick={clear}>이동 취소</Button>
        <Button type="button" className="inline-example__button" disabled={positions.length === 1 || !!preview}
          onClick={() => setPositions(positions.slice(0, -1))}>되돌리기</Button>
      </div>
      <div className="edit-history__board" ref={board}>
        {preview && <span className="edit-history__origin" style={positionOf(committed)} aria-hidden="true" />}
        <button
          className="edit-history__marker"
          type="button"
          aria-label="지도에서 말 옮기기"
          style={positionOf(preview ?? committed)}
          onKeyDown={onKeyDown}
          onPointerDown={event => {
            if (pointer.current !== undefined || event.button !== 0) return;
            const point = fromPointer(event);
            const start = preview ?? committed;
            offset.current = { x: point.x - start.x, y: point.y - start.y };
            pointer.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            setPreview(start);
          }}
          onPointerMove={event => {
            if (pointer.current === event.pointerId) setPreview(updatePointer(event));
          }}
          onPointerUp={event => {
            if (pointer.current === event.pointerId) commit(updatePointer(event));
          }}
          onLostPointerCapture={event => {
            if (pointer.current === event.pointerId) clear();
          }}
          onPointerCancel={event => {
            if (pointer.current === event.pointerId) clear();
          }}
        >말</button>
      </div>
      <dl className="edit-history__readout">
        <div><dt>미리보기 좌표</dt><dd data-preview>{preview ? `${preview.x}, ${preview.y}` : "없음"}</dd></div>
        <div><dt>확정된 좌표</dt><dd data-committed>{`${committed.x}, ${committed.y}`}</dd></div>
        <div><dt>변경 이력</dt><dd data-history-count aria-live="polite">{positions.length - 1}건</dd></div>
      </dl>
      <p className="inline-example__caption">키보드에서는 말을 선택하고 방향키로 이동한 뒤 Enter로 확정합니다. Escape로 취소할 수 있습니다.</p>
    </div>
  );
};
