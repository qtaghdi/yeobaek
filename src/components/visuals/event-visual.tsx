import { ScenePointer } from "src/components/visuals/scene-pointer";
import "./event-visual.scss";

export const EventVisual = ({ stop }: { stop: boolean }) => (
  <div className="event-visual" aria-hidden="true">
    <div className="event-visual__parent">
      <p>부모 요소</p>
      <div className="event-visual__target-row">
        <div className="event-visual__target">
          안쪽 버튼
          <span className="event-visual__pointer"><ScenePointer /></span>
        </div>
      </div>
    </div>
    <div className="event-visual__trace">
      <code data-enabled={stop}>{stop ? "stopPropagation()" : "click"}</code>
      <ol>
        <li>부모 캡처</li>
        <li>대상 버튼</li>
        <li data-blocked={stop}>부모 버블{stop && <small> 호출 안 됨</small>}</li>
      </ol>
    </div>
  </div>
);
